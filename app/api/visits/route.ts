import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";

const CreateVisitSchema = z.object({
  patientName: z.string().min(1),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
        customName: z.string().optional(),
        customPrice: z.number().optional(),
      })
    )
    .min(1),
  discount: z.number().nonnegative().default(0),
  paymentMethod: z.string().optional().nullable(),
  status: z.enum(["paid", "unpaid"]).default("paid"),
  notes: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const patientName = searchParams.get("patientName");
    const serviceName = searchParams.get("serviceName");
    const date = searchParams.get("date");
    const dentistOnly = searchParams.get("dentistOnly") === "true";

    const where: Prisma.VisitWhereInput = {};

    if (date) {
      where.date = new Date(date);
    } else if (from || to) {
      where.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    if (patientName) {
      where.patientName = {
        contains: patientName,
      };
    }

    if (serviceName) {
      where.services = {
        some: {
          OR: [
            {
              service: {
                name: {
                  contains: serviceName,
                },
              },
            },
            {
              customName: {
                contains: serviceName,
              },
            },
          ],
        },
      };
    }

    const session = await getSession();
    // If the user is a DOCTOR, always filter by their ID
    if (session?.role === "DOCTOR") {
      where.OR = [
        { createdByUserId: session.sub }, // Records they created
        { doctorId: session.sub }, // Records assigned to them
      ];
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        services: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Failed to fetch visits" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parse = CreateVisitSchema.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { date, services, discount, ...data } = parse.data;

    // Calculate total price from services
    let totalPrice = 0;
    for (const svc of services) {
      if (svc.serviceId === "custom") {
        // Custom service
        if (!svc.customPrice) {
          throw new Error("Custom service requires customPrice");
        }
        totalPrice += svc.customPrice * svc.quantity;
      } else {
        // Regular service
        const service = await prisma.service.findUnique({
          where: { id: svc.serviceId },
        });
        if (!service) throw new Error(`Service ${svc.serviceId} not found`);
        totalPrice += Number(service.price) * svc.quantity;
      }
    }
    totalPrice -= discount;

    // Get current user session
    const session = await getSession();

    const created = await prisma.visit.create({
      data: {
        ...data,
        price: new Prisma.Decimal(totalPrice + discount), // Original price before discount
        discount: new Prisma.Decimal(discount),
        total: new Prisma.Decimal(totalPrice),
        date: date ? new Date(date) : new Date(),
        createdByUserId: session?.sub || null,
        doctorId: session?.role === "DOCTOR" ? session.sub : null,
        services: {
          create: services.map((svc) => {
            if (svc.serviceId === "custom") {
              return {
                serviceId: null, // Custom service tidak ada serviceId
                quantity: svc.quantity,
                customName: svc.customName,
                customPrice: svc.customPrice
                  ? new Prisma.Decimal(svc.customPrice)
                  : null,
              };
            } else {
              return {
                serviceId: svc.serviceId,
                quantity: svc.quantity,
              };
            }
          }),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating visit:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create visit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const UpdateVisitSchema = z.object({
  patientName: z.string().min(1).optional(),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
        customName: z.string().optional(),
        customPrice: z.number().optional(),
      })
    )
    .optional(),
  discount: z.number().nonnegative().optional(),
  paymentMethod: z.string().optional().nullable(),
  status: z.enum(["paid", "unpaid"]).optional(),
  notes: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  date: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const json = await req.json();
    const { id, ...data } = json;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentVisit = await prisma.visit.findUnique({
      where: { id },
      include: { services: { include: { service: true } } },
    });

    if (!currentVisit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    // If user is DOCTOR, they can only edit their own records
    if (
      session.role === "DOCTOR" &&
      currentVisit.createdByUserId !== session.sub &&
      currentVisit.doctorId !== session.sub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const parse = UpdateVisitSchema.safeParse(data);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { date, services, discount, ...updateData } = parse.data;

    const servicesToUse =
      services ||
      currentVisit.services.map((s) => ({
        serviceId: s.serviceId || "custom",
        quantity: s.quantity,
        customName: s.customName ?? undefined,
        customPrice: s.customPrice ? Number(s.customPrice) : undefined,
      }));

    const discountToUse =
      discount !== undefined ? discount : Number(currentVisit.discount);

    let priceValue: number | undefined, totalValue: number | undefined;
    if (services || discount !== undefined) {
      // Recalculate if services or discount changed
      let totalPrice = 0;
      for (const svc of servicesToUse) {
        if (svc.serviceId === "custom") {
          if (svc.customPrice === undefined) {
            throw new Error("Custom service requires customPrice");
          }
          totalPrice += svc.customPrice * svc.quantity;
        } else {
          const service = await prisma.service.findUnique({
            where: { id: svc.serviceId },
          });
          if (!service) throw new Error(`Service ${svc.serviceId} not found`);
          totalPrice += Number(service.price) * svc.quantity;
        }
      }
      totalPrice -= discountToUse;
      priceValue = totalPrice + discountToUse;
      totalValue = totalPrice;

      // Delete existing services and create new if services changed
      if (services) {
        await prisma.visitService.deleteMany({ where: { visitId: id } });
      }
    }

    const updated = await prisma.visit.update({
      where: { id },
      data: {
        ...updateData,
        ...(services && {
          services: {
            create: services.map((svc) => {
              if (svc.serviceId === "custom") {
                return {
                  serviceId: null,
                  quantity: svc.quantity,
                  customName: svc.customName,
                  customPrice: svc.customPrice
                    ? new Prisma.Decimal(svc.customPrice)
                    : null,
                };
              } else {
                return {
                  serviceId: svc.serviceId,
                  quantity: svc.quantity,
                };
              }
            }),
          },
        }),
        ...(priceValue !== undefined && {
          price: new Prisma.Decimal(priceValue),
        }),
        ...(discount !== undefined && {
          discount: new Prisma.Decimal(discount),
        }),
        ...(totalValue !== undefined && {
          total: new Prisma.Decimal(totalValue),
        }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating visit:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update visit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.visit.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Visit deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting visit:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete visit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
