import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "clinic-info.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    const defaultData = {
      homepage: {},
      faqs: [],
      about: {},
      doctors: [],
      gallery: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    let data = await fs.readFile(DATA_FILE, "utf-8");
    let parsed = JSON.parse(data);

    if (!parsed.homepage) parsed.homepage = {};
    if (!parsed.faqs) parsed.faqs = [];
    if (!parsed.about) parsed.about = {};
    if (!parsed.doctors) parsed.doctors = [];
    if (!parsed.gallery) parsed.gallery = [];

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
