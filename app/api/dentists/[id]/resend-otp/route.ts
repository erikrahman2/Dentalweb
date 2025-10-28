// app/api/dentists/[id]/resend-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateOTP, sendOTPEmail } from "@/lib/email";

// POST: Kirim ulang OTP ke dentist
export async function POST(
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
    });

    if (!dentist) {
      return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
    }

    // Generate OTP baru
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getHours() + 24);

    // Update OTP
    await prisma.user.update({
      where: { id: params.id },
      data: {
        otp,
        otpExpiry,
      },
    });

    // Kirim email
    const emailSent = await sendOTPEmail(dentist.email, dentist.name, otp);
    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "OTP resent successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to resend OTP" },
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
