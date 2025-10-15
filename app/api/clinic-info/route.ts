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
      homepage: {
        heroTitle: "Bring a smile to every encounter",
        heroSubtitle: "Hai! Senang banget kamu mampir ke NOERDENTAL CLINIC.",
        heroImage: "/uploads/hero.jpg",
        heroDescription:
          "Kami tahu, ke dokter gigi sering bikin deg-degan, tapi tenang… di sini suasananya nyaman dan santai kok. Dokter dan tim kami siap membantu mulai dari perawatan ringan sampai estetik biar senyummu makin pede. Yuk, booking jadwal sekarang dan rasain sendiri perbedaannya!",
        aboutTitle: "NOERDENTAL Clinic: Pelayanan yang Melampaui Ekspektasi",
        aboutDescription:
          "NOERDENTAL Clinic adalah salah satu klinik dokter gigi terbaik di daerah pesisir selatan yang berkomitmen untuk terus berusaha memberikan pelayanan, kualitas kerja, dan fasilitas yang melebihi ekspektasi pasien.",
        ctaText: "Buat Janji Sekarang",
        ctaLink: "/contact",
      },
      faqs: [
        {
          q: "Apakah perlu janji temu terlebih dahulu?",
          a: "Disarankan untuk membuat janji agar kami dapat menyiapkan slot waktu yang sesuai.",
        },
        {
          q: "Metode pembayaran apa yang tersedia?",
          a: "Tunai, transfer, dan beberapa dompet digital (tanyakan ke resepsionis).",
        },
        {
          q: "Apakah ada konsultasi awal?",
          a: "Ya, tersedia konsultasi untuk menentukan rencana perawatan terbaik.",
        },
      ],
      about: {
        title: "Tentang Noerdental",
        mission:
          "Memberikan pelayanan kesehatan gigi terbaik dengan teknologi modern",
        vision: "Menjadi klinik gigi terpercaya di Indonesia",
        description:
          "Noerdental didirikan dengan komitmen untuk memberikan perawatan gigi berkualitas tinggi.",
        values: ["Profesional", "Terpercaya", "Modern", "Ramah"],
      },
      doctors: [
        {
          name: "Jakob Gronberg",
          photo: "/uploads/doctor-1.jpg",
          joinDate: "Jan, 1992",
          daysDone: "189",
        },
      ],
      gallery: [
        {
          before: "/uploads/service-1758708594360.jpg",
          after: "/uploads/service-1758728297205.jpg",
          label: "Whitening",
        },
      ],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    let data = await fs.readFile(DATA_FILE, "utf-8");
    let parsed = JSON.parse(data);
    // Ensure default structure
    if (!parsed.homepage || !Object.keys(parsed.homepage).length) {
      parsed.homepage = {
        heroTitle: "Selamat Datang di Noerdental",
        heroSubtitle: "Klinik gigi modern dengan layanan terbaik",
        heroImage: "/uploads/hero.jpg",
        aboutTitle: "Tentang Kami",
        aboutDescription:
          "Noerdental adalah klinik gigi yang berkomitmen memberikan perawatan gigi berkualitas tinggi.",
        ctaText: "Buat Janji Sekarang",
        ctaLink: "/contact",
      };
    }
    if (!parsed.faqs || !Array.isArray(parsed.faqs)) {
      parsed.faqs = [
        {
          q: "Apakah perlu janji temu terlebih dahulu?",
          a: "Disarankan untuk membuat janji agar kami dapat menyiapkan slot waktu yang sesuai.",
        },
      ];
    }
    if (!parsed.about || !Object.keys(parsed.about).length) {
      parsed.about = {
        title: "Tentang Noerdental",
        mission:
          "Memberikan pelayanan kesehatan gigi terbaik dengan teknologi modern",
        vision: "Menjadi klinik gigi terpercaya di Indonesia",
        description:
          "Noerdental didirikan dengan komitmen untuk memberikan perawatan gigi berkualitas tinggi.",
        values: ["Profesional", "Terpercaya", "Modern", "Ramah"],
      };
    }
    if (!parsed.doctors || !Array.isArray(parsed.doctors)) {
      parsed.doctors = [
        {
          name: "Jakob Gronberg",
          photo: "/uploads/doctor-1.jpg",
          joinDate: "Jan, 1992",
          daysDone: "189",
        },
      ];
    }
    if (!parsed.gallery || !Array.isArray(parsed.gallery)) {
      parsed.gallery = [
        {
          before: "/uploads/service-1758708594360.jpg",
          after: "/uploads/service-1758728297205.jpg",
          label: "Whitening",
        },
      ];
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(parsed, null, 2));
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
