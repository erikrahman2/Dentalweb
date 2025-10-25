// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get user info" },
      { status: 500 }
    );
  }
}
