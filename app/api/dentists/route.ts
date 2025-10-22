// app/api/dentists/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateOTP, sendOTPEmail } from "@/lib/email";

// GET: Daftar semua dentist
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const dentists = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true, // Untuk cek apakah sudah set password
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data untuk frontend
    const dentistsWithStatus = dentists.map((d) => ({
      ...d,
      hasPassword: !!d.passwordHash,
      passwordHash: undefined, // Jangan kirim hash ke frontend
    }));

    return NextResponse.json(dentistsWithStatus);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dentists" },
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

// POST: Daftarkan dentist baru
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getHours() + 24); // OTP berlaku 24 jam

    // Buat dentist baru
    const dentist = await prisma.user.create({
      data: {
        name,
        email,
        role: "DOCTOR",
        otp,
        otpExpiry,
        isActive: true,
        createdById: session.sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Kirim OTP via email
    await sendOTPEmail(email, name, otp);

    return NextResponse.json(
      {
        message: "Dentist registered successfully. OTP sent to email.",
        dentist,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to register dentist" },
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
