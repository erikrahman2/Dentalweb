// app/api/dentists/[id]/resend-otp/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendOTPEmail } from "@/lib/email";

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

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: params.id },
      data: {
        otp,
        otpExpiry,
      },
    });

    const emailSent = await sendOTPEmail(dentist.email, dentist.name, otp);

    if (!emailSent) {
      console.warn("⚠️ Failed to send OTP email via configured providers");
    }

    console.log("\n" + "=".repeat(50));
    console.log("🔄 RESEND OTP");
    console.log("=".repeat(50));
    console.log("Email:", dentist.email);
    console.log("Name:", dentist.name);
    console.log("New OTP:", otp);
    console.log("Valid until:", otpExpiry.toLocaleString());
    console.log("=".repeat(50) + "\n");

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "OTP resent successfully"
        : "OTP resent successfully, but email failed to send",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
      emailSent,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
