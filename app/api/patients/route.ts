import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
    });
    return NextResponse.json(patient);
  }

  const patients = await prisma.patient.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(patients);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await request.json();
  
  const patient = await prisma.patient.create({
    data: {
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      address: data.address,
      phoneNumber: data.phoneNumber,
      medicalHistory: data.medicalHistory || "",
    },
  });

  return NextResponse.json(patient);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return new NextResponse("Missing ID", { status: 400 });
  }

  const data = await request.json();
  
  const patient = await prisma.patient.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      address: data.address,
      phoneNumber: data.phoneNumber,
      medicalHistory: data.medicalHistory || "",
    },
  });

  return NextResponse.json(patient);
}