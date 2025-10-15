import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Allowlist of image extensions we serve
const ALLOWED_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const raw = params?.filename ?? "";

  try {
    // Basic validation
    if (!raw || typeof raw !== "string") {
      return NextResponse.json(
        { error: "filename is required" },
        { status: 400 }
      );
    }

    // Normalize to prevent path traversal, e.g. ../../secret
    const safeName = path.basename(raw);
    const ext = path.extname(safeName).toLowerCase();

    // Validate extension
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json(
        { error: "unsupported file type" },
        { status: 400 }
      );
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadsDir, safeName);

    // Ensure the resolved filePath is still inside uploadsDir
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      return NextResponse.json({ error: "invalid path" }, { status: 400 });
    }

    // Read file and stat for caching headers
    const fileBuffer = await readFile(filePath);
    const { mtime } = await stat(filePath);

    // Determine content type
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
        ? "image/gif"
        : ext === ".avif"
        ? "image/avif"
        : "image/jpeg"; // default for .jpg/.jpeg

    // Use Blob to satisfy BodyInit typing in NextResponse
    const body = new Blob([fileBuffer], { type: contentType });
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Last-Modified": mtime.toUTCString(),
      },
    });
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return new NextResponse("Image not found", { status: 404 });
    }
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
