import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET - Fetch services (optional filter: isActive=true|false)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get("isActive");

    const where: { isActive?: boolean } = {};
    if (isActiveParam !== null) {
      where.isActive = isActiveParam === "true";
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received payload:", body); // Debug log

    const { name, description, price, category, imageUrl, isActive } = body as {
      name?: string;
      description?: string | null;
      price?: number | string;
      category?: string | null;
      imageUrl?: string | null;
      isActive?: boolean;
    };

    // Normalize inputs
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const parsedPrice =
      typeof price === "string" ? Number(price) : (price as number | undefined);

    console.log("Normalized data:", {
      normalizedName,
      parsedPrice,
      description,
      category,
      imageUrl,
      isActive,
    }); // Debug log

    if (!normalizedName || !Number.isFinite(parsedPrice as number)) {
      return NextResponse.json(
        { error: "'name' and valid 'price' are required" },
        { status: 400 }
      );
    }
    if ((parsedPrice as number) < 0) {
      return NextResponse.json(
        { error: "'price' must be greater than or equal to 0" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: normalizedName,
        description:
          typeof description === "string" && description.trim() !== ""
            ? description.trim()
            : null,

        category:
          typeof category === "string" && category.trim() !== ""
            ? category.trim()
            : null,
        imageUrl:
          typeof imageUrl === "string" && imageUrl.trim() !== ""
            ? imageUrl.trim()
            : null,
        // Ensure Decimal handling with 2 decimal places
        price: parsedPrice as number,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    console.log("Created service:", service); // Debug log
    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating service:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as { code?: string }).code,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle known Prisma errors (e.g., unique constraint on name)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Service name already exists" },
          { status: 409 }
        );
      }
    }
    // Validation errors from Prisma (wrong types, etc.)
    if (
      error instanceof Error &&
      error.name === "PrismaClientValidationError"
    ) {
      return NextResponse.json(
        { error: "Invalid payload for Service" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, category, imageUrl, isActive } =
      body as {
        id?: string;
        name?: string;
        description?: string | null;
        price?: number | string;
        category?: string | null;
        imageUrl?: string | null;
        isActive?: boolean;
      };

    if (!id) {
      return NextResponse.json({ error: "'id' is required" }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(price !== undefined && price !== null
          ? { price: new Prisma.Decimal(price as string | number) }
          : {}),
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Service name already exists" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE - Delete service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "'id' is required" }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
