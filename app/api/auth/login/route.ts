import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    console.log("=== Login Request Started ===");

    const body = await req.json();
    console.log("Body received:", { email: body.email });

    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      console.log("Validation failed:", parsed.error.errors);
      const errors = parsed.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { email, password } = parsed.data;
    console.log("Looking for user:", email);

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Akun tidak aktif. Hubungi administrator." },
        { status: 403 }
      );
    }

    // Cek apakah password sudah diset
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password belum diset. Silakan gunakan kode OTP Anda." },
        { status: 400 }
      );
    }

    console.log("Comparing password...");
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log("Password match:", ok);

    if (!ok) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    console.log("Creating session for user:", user.id);
    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });

    console.log("Session created successfully");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("=== Login Error ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
