// app/api/auth/setup-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, password } = body;

    if (!email || !otp || !password) {
      return NextResponse.json(
        { error: "Email, OTP, and password are required" },
        { status: 400 }
      );
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Cari user dengan email dan OTP
    const user = await prisma.user.findFirst({
      where: {
        email,
        otp,
        role: "DOCTOR",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or OTP" },
        { status: 400 }
      );
    }

    // Cek apakah OTP masih berlaku
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is inactive. Please contact administrator." },
        { status: 403 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user: set password, hapus OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otp: null,
        otpExpiry: null,
      },
    });

    // Create session
    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: "DOCTOR",
    });

    return NextResponse.json({
      message: "Password set successfully. You are now logged in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "DOCTOR",
      },
    });
  } catch (error: any) {
    console.error("Setup password error:", error);
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    );
  }
}
