import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startedAt = Date.now();
  const result: {
    status: "ok";
    env: string | undefined;
    uptimeSec: number;
    db: { status: "up" | "down"; latencyMs: number | null; error?: string };
  } = {
    status: "ok",
    env: process.env.NODE_ENV,
    uptimeSec: Math.round(process.uptime()),
    db: { status: "down", latencyMs: null },
  };

  try {
    const t0 = Date.now();
    // Lightweight DB check
    await prisma.$queryRaw`SELECT 1`;
    const t1 = Date.now();
    result.db.status = "up";
    result.db.latencyMs = t1 - t0;
  } catch (err: any) {
    result.db.status = "down";
    if (process.env.NODE_ENV !== "production") {
      result.db.error = err?.message ?? String(err);
    }
  }

  // Overall request processing time (optional)
  const totalMs = Date.now() - startedAt;
  return NextResponse.json({ ...result, totalMs });
}
