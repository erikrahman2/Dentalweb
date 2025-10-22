// app/api/dentists/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateOTP, sendOTPEmail } from "@/lib/email";

// GET: Detail dentist
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const dentist = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dentist) {
      return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
    }

    return NextResponse.json(dentist);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dentist" },
      {
        status:
          error.message === "Unauthorized"
            ? 401
            : error.message === "Forbidden: Insufficient permissions"
            ? 403
            : 500,
      }
    );
  }
}

// PATCH: Update dentist (name, email, isActive)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { name, email, isActive } = body;

    // Cek apakah dentist ada
    const existing = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: "DOCTOR",
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
    }

    // Jika email diubah, cek apakah sudah digunakan
    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Update dentist
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Dentist updated successfully",
      dentist: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update dentist" },
      {
        status:
          error.message === "Unauthorized"
            ? 401
            : error.message === "Forbidden: Insufficient permissions"
            ? 403
            : 500,
      }
    );
  }
}

// DELETE: Hapus dentist
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Cek apakah dentist ada
    const existing = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: "DOCTOR",
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
    }

    // Hapus dentist
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Dentist deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete dentist" },
      {
        status:
          error.message === "Unauthorized"
            ? 401
            : error.message === "Forbidden: Insufficient permissions"
            ? 403
            : 500,
      }
    );
  }
}
