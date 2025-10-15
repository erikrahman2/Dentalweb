import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import { z } from "zod";

const QuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  category: z.string().optional(),
  mode: z.enum(["single", "per-category"]).default("single"),
});

import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parse = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }
  const { from, to, category, mode } = parse.data;

  const where: any = {};
  if (from || to) {
    where.date = {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };
  }
  if (category) where.category = category;

  const visits = await prisma.visit.findMany({
    where,
    include: { service: true },
    orderBy: { date: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  const addSheet = (name: string, rows: typeof visits) => {
    const sheet = workbook.addWorksheet(name);
    sheet.columns = [
      { header: "Tanggal", key: "date", width: 16 },
      { header: "Nama Pasien", key: "patientName", width: 24 },
      { header: "Kategori", key: "category", width: 16 },
      { header: "Layanan", key: "service", width: 24 },
      { header: "Harga", key: "price", width: 12 },
      { header: "Diskon", key: "discount", width: 12 },
      { header: "Total", key: "total", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Pembayaran", key: "paymentMethod", width: 14 },
      { header: "Catatan", key: "notes", width: 24 },
    ];
    rows.forEach((v) => {
      sheet.addRow({
        date: v.date.toISOString().slice(0, 10),
        patientName: v.patientName,
        category: v.category ?? "-",
        service: v.service.name,
        price: Number(v.price),
        discount: Number(v.discount),
        total: Number(v.total),
        status: v.status,
        paymentMethod: v.paymentMethod ?? "-",
        notes: v.notes ?? "",
      });
    });
  };

  if (mode === "per-category") {
    const byCat = new Map<string, typeof visits>();
    visits.forEach((v) => {
      if (!byCat.has(v.category ?? "Tanpa Kategori"))
        byCat.set(v.category ?? "Tanpa Kategori", []);
      byCat.get(v.category ?? "Tanpa Kategori")!.push(v);
    });
    if (byCat.size === 0) addSheet("Empty", []);
    else for (const [cat, rows] of byCat.entries()) addSheet(cat, rows);
  } else {
    addSheet("Visits", visits);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="visits_export.xlsx"`,
    },
  });
}
