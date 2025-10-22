import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);
const COOKIE_NAME = "noer_token";

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "DOCTOR" | "STAFF";
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin and dentist routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/dentist")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?next=" + encodeURIComponent(pathname), req.url)
      );
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const user = payload as JwtPayload;

      // Admin-only routes: /admin/clinic, /admin/reports
      if (
        pathname.startsWith("/admin/clinic") ||
        pathname.startsWith("/admin/reports")
      ) {
        if (user.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // Dentist routes: only accessible by DOCTOR role
      if (pathname.startsWith("/dentist")) {
        if (user.role !== "DOCTOR") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(
        new URL("/login?next=" + encodeURIComponent(pathname), req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dentist/:path*"],
};
