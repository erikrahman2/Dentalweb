// app/api/dentists/[id]/resend-otp/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const dentist = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: "DENTIST",
      },
    });

    if (!dentist) {
      return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
    }

    if (dentist.passwordHash) {
      return NextResponse.json(
        { error: "Dentist already has a password set" },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update dentist with new OTP
    await prisma.user.update({
      where: { id: params.id },
      data: {
        otp,
        otpExpiry,
      },
    });

    console.log("\n" + "=".repeat(50));
    console.log("🔄 RESEND OTP");
    console.log("=".repeat(50));
    console.log("Email:", dentist.email);
    console.log("Name:", dentist.name);
    console.log("New OTP:", otp);
    console.log("Valid until:", otpExpiry.toLocaleString());
    console.log("=".repeat(50) + "\n");

    // ✅ Return OTP in development mode
    return NextResponse.json({
      success: true,
      message: "OTP resent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
