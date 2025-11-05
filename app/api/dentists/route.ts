// app/api/dentists/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendOTPEmail } from "@/lib/email";

// GET - List all dentists (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const dentists = await prisma.user.findMany({
      where: {
        role: "DENTIST",
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const dentistsWithPasswordStatus = dentists.map((dentist) => ({
      id: dentist.id,
      name: dentist.name,
      email: dentist.email,
      isActive: dentist.isActive,
      hasPassword: !!dentist.passwordHash,
      createdAt: dentist.createdAt.toISOString(),
      updatedAt: dentist.updatedAt.toISOString(),
    }));

    return NextResponse.json(dentistsWithPasswordStatus);
  } catch (error) {
    console.error("Error fetching dentists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new dentist (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email } = body;

    console.log("1. ✅ Received request to create dentist:", { name, email });

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log("2. ✅ Generated OTP:", otp);

    const dentist = await prisma.user.create({
      data: {
        name,
        email,
        role: "DENTIST",
        isActive: true,
        otp,
        otpExpiry,
      },
    });

    console.log("3. ✅ Created dentist:", dentist.id);

    const emailSent = await sendOTPEmail(email, name, otp);

    if (!emailSent) {
      console.warn("⚠️ Failed to send OTP email via configured providers");
    }

    if (process.env.NODE_ENV === "development") {
      console.log("\n" + "=".repeat(50));
      console.log("🔑 OTP FOR DENTIST REGISTRATION");
      console.log("=".repeat(50));
      console.log("Email:", email);
      console.log("Name:", name);
      console.log("OTP:", otp);
      console.log("Valid until:", otpExpiry.toLocaleString());
      console.log("=".repeat(50) + "\n");
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? "Dentist created successfully"
          : "Dentist created successfully, but OTP email failed to send",
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
        dentist: {
          id: dentist.id,
          name: dentist.name,
          email: dentist.email,
        },
        emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating dentist:", error);
    return NextResponse.json(
      { error: "Failed to create dentist" },
      { status: 500 }
    );
  }
}
