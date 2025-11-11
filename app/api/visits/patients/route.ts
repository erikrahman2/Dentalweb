import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const search = searchParams.get("search");

    if (!search) {
      return NextResponse.json([]);
    }

    // Mencari unique patient names dari tabel visits yang cocok dengan search term
    const patients = await prisma.visit.groupBy({
      by: ["patientName"],
      where: {
        patientName: {
          contains: search,
        },
      },
      orderBy: {
        patientName: "asc",
      },
      take: 10, // Limit hasil pencarian
    });

    // Format hasil pencarian
    const formattedPatients = patients.map((patient) => ({
      id: patient.patientName, // Menggunakan nama sebagai ID karena kita tidak punya tabel patients
      name: patient.patientName,
    }));

    return NextResponse.json(formattedPatients);
  } catch (error) {
    console.error("Error searching patients:", error);
    return NextResponse.json(
      { error: "Failed to search patients" },
      { status: 500 }
    );
  }
}
