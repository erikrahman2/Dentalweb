// app/api/doctor-profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateOTP, sendOTPEmail } from "@/lib/email";

// GET: Daftar semua doctor profiles
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            passwordHash: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // Transform data
    const doctorsWithStatus = doctors.map((d) => ({
      ...d,
      hasPassword: !!d.user?.passwordHash,
    }));

    return NextResponse.json(doctorsWithStatus);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch doctors" },
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

// POST: Create or Update doctor profile
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { id, name, email, photo, joinDate, daysDone, order } = body;

    // Jika update existing doctor
    if (id) {
      const existingDoctor = await prisma.doctorProfile.findUnique({
        where: { id: parseInt(id) },
        include: { user: true },
      });

      if (!existingDoctor) {
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 }
        );
      }

      // Update doctor profile
      const updatedDoctor = await prisma.doctorProfile.update({
        where: { id: parseInt(id) },
        data: {
          name,
          email: email || null,
          photo,
          joinDate,
          daysDone,
          order: order || 0,
        },
      });

      // Jika email berubah atau baru ditambahkan
      if (email && email !== existingDoctor.email) {
        // Cek apakah email sudah digunakan
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.id !== existingDoctor.userId) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 400 }
          );
        }

        // Jika belum ada user, buat user baru
        if (!existingDoctor.userId) {
          const otp = generateOTP();
          const otpExpiry = new Date();
          otpExpiry.setHours(otpExpiry.getHours() + 24);

          const user = await prisma.user.create({
            data: {
              name,
              email,
              role: "DOCTOR",
              otp,
              otpExpiry,
              isActive: true,
            },
          });

          // Link user ke doctor profile
          await prisma.doctorProfile.update({
            where: { id: parseInt(id) },
            data: {
              userId: user.id,
            },
          });

          // Kirim OTP via email
          await sendOTPEmail(email, name, otp);
        } else {
          // Update email user yang sudah ada
          await prisma.user.update({
            where: { id: existingDoctor.userId },
            data: {
              email,
              name,
            },
          });
        }
      }

      return NextResponse.json(updatedDoctor);
    }

    // Create new doctor
    const newDoctor = await prisma.doctorProfile.create({
      data: {
        name,
        email: email || null,
        photo,
        joinDate,
        daysDone,
        order: order || 0,
      },
    });

    // Jika ada email, buat user account
    if (email) {
      const otp = generateOTP();
      const otpExpiry = new Date();
      otpExpiry.setHours(otpExpiry.getHours() + 24);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          role: "DOCTOR",
          otp,
          otpExpiry,
          isActive: true,
        },
      });

      // Link user ke doctor profile
      await prisma.doctorProfile.update({
        where: { id: newDoctor.id },
        data: {
          userId: user.id,
        },
      });

      // Kirim OTP via email
      await sendOTPEmail(email, name, otp);
    }

    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error: any) {
    console.error("Error creating/updating doctor:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create/update doctor" },
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

// DELETE: Delete doctor profile
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Doctor ID required" },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Delete user if exists
    if (doctor.userId) {
      await prisma.user.delete({
        where: { id: doctor.userId },
      });
    }

    // Delete doctor profile
    await prisma.doctorProfile.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete doctor" },
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
