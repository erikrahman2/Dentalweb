import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateOTP, sendOTPEmail } from "@/lib/email";

// GET: List all doctor profiles
export async function GET(req: NextRequest) {
  try {
    const isAdminRequest = req.headers.get("x-admin-request") === "true";
    if (isAdminRequest) {
      await requireAdmin();
    }

    const doctors = await prisma.doctorProfile.findMany({
      where: {
        user: isAdminRequest ? undefined : {
          isActive: true
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(doctors);
  } catch (error: unknown) {
    console.error("Failed to fetch doctors:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST: Create or update doctor profile
export async function POST(req: NextRequest) {
  let transactionResult;

  try {
    await requireAdmin();

    const body = await req.json();
    const { id, name, email, photo, joinDate, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if email is provided and valid
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          doctorProfile: true,
        },
      });

      // Check if the email belongs to a different doctor
      if (existingUser?.doctorProfile && id && existingUser.doctorProfile.id !== id) {
        return NextResponse.json(
          { error: "Email already registered to another doctor" },
          { status: 400 }
        );
      }
    }

    // Use transaction to ensure data consistency
    transactionResult = await prisma.$transaction(async (tx) => {
      // Create or update doctor profile first
      const doctor = await tx.doctorProfile.upsert({
        where: {
          id: id || 0,
        },
        create: {
          name,
          photo: photo || null,
          joinDate: joinDate || new Date().toISOString(),
          description: description || null,
        },
        update: {
          name,
          photo: photo || null,
          joinDate: joinDate || undefined,
          description: description || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
            }
          },
        },
      });

      // If email is provided and no user exists, create one
      if (email && !doctor.user) {
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setHours(otpExpiry.getHours() + 24);

        // Create or update user
        await tx.user.upsert({
          where: { email },
          create: {
            email,
            name,
            otp,
            otpExpiry,
            role: "DOCTOR",
            doctorProfile: {
              connect: {
                id: doctor.id,
              },
            },
          },
          update: {
            name,
            otp,
            otpExpiry,
            role: "DOCTOR",
            doctorProfile: {
              connect: {
                id: doctor.id,
              },
            },
          },
        });

        // Get updated doctor profile with user
        const updatedDoctor = await tx.doctorProfile.findUnique({
          where: { id: doctor.id },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                isActive: true,
                otp: true
              }
            }
          },
        });

        if (!updatedDoctor) {
          throw new Error("Failed to create doctor profile");
        }

        return { doctor: updatedDoctor, otp, userEmail: email, userName: name };
      }

      return { doctor, otp: null, userEmail: null, userName: null };
    });

    // If OTP was generated, send the email
    if (transactionResult.otp && transactionResult.userEmail && transactionResult.userName) {
      console.log("Attempting to send OTP email...");
      const { success, error: emailError } = await sendOTPEmail(
        transactionResult.userEmail,
        transactionResult.userName,
        transactionResult.otp
      );

      if (!success) {
        console.error("Failed to send OTP email:", emailError);
        // If email fails, rollback by deleting the user and doctor profile
        if (transactionResult.doctor?.id) {
          await prisma.$transaction([
            prisma.user.delete({
              where: { email: transactionResult.userEmail }
            }),
            prisma.doctorProfile.delete({
              where: { id: transactionResult.doctor.id }
            })
          ]);
        }

        return NextResponse.json(
          { error: emailError || "Failed to send OTP email. Please try again." },
          { status: 500 }
        );
      }
      console.log("OTP email sent successfully");
    }

    // If we got here, either no email needed to be sent, or it was sent successfully
    return NextResponse.json(transactionResult.doctor);
  } catch (error: unknown) {
    console.error("Failed to create/update doctor:", error);
    
    // Try to rollback if transaction was successful but something else failed
    if (transactionResult?.doctor?.id) {
      try {
        await prisma.$transaction([
          prisma.user.delete({
            where: { email: transactionResult.userEmail }
          }),
          prisma.doctorProfile.delete({
            where: { id: transactionResult.doctor.id }
          })
        ]);
      } catch (rollbackError) {
        console.error("Failed to rollback changes:", rollbackError);
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create/update doctor" },
      { status: 500 }
    );
  }
}

// DELETE: Delete doctor profile
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Valid ID is required" },
        { status: 400 }
      );
    }

    await prisma.doctorProfile.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to delete doctor:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}