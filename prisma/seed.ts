import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create/Upsert clinic info
  const clinic = await prisma.clinicInfo.upsert({
    where: { id: "seed-clinic" },
    update: {
      name: "Noer Dental",
      address: "Jl. Contoh No. 123, Kota",
      phone: "+62 812-3456-7890",
      email: "info@noerdental.com",
      description:
        "Hai! Senang banget kamu mampir ke NOERDENTAL CLINIC.\nKami tahu, ke dokter gigi sering bikin deg-degan, tapi tenang… di sini suasananya nyaman dan santai kok. Dokter dan tim kami siap membantu mulai dari perawatan ringan sampai estetik biar senyummu makin pede. Yuk, booking jadwal sekarang dan rasain sendiri perbedaannya!",
    },
    create: {
      id: "seed-clinic",
      name: "Noer Dental",
      address: "Jl. Contoh No. 123, Kota",
      phone: "+62 812-3456-7890",
      email: "info@noerdental.com",
      description:
        "Hai! Senang banget kamu mampir ke NOERDENTAL CLINIC.\nKami tahu, ke dokter gigi sering bikin deg-degan, tapi tenang… di sini suasananya nyaman dan santai kok. Dokter dan tim kami siap membantu mulai dari perawatan ringan sampai estetik biar senyummu makin pede. Yuk, booking jadwal sekarang dan rasain sendiri perbedaannya!",
    },
  });

  // Seed services
  const services = [
    {
      name: "Scaling",
      description: "Pembersihan karang gigi",
      category: "Perawatan",
      price: 250000,
    },
    {
      name: "Tambal Gigi",
      description: "Penambalan gigi berlubang",
      category: "Perawatan",
      price: 300000,
    },
    {
      name: "Cabut Gigi",
      description: "Pencabutan gigi",
      category: "Tindakan",
      price: 350000,
    },
    {
      name: "Veneer",
      description: "Perbaikan estetika gigi depan",
      category: "Estetika",
      price: 1500000,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: { ...s },
      create: { ...s, price: s.price as any },
    });
  }

  // Seed doctors
  const doctors = [
    { name: "Dr. Ahmad", email: "ahmad@noerdental.com" },
    { name: "Dr. Siti", email: "siti@noerdental.com" },
    { name: "Dr. Budi", email: "budi@noerdental.com" },
  ];

  for (const d of doctors) {
    const passwordHash = await bcrypt.hash("doctor123", 10);
    await prisma.user.upsert({
      where: { email: d.email },
      update: { name: d.name, passwordHash, role: "DOCTOR" },
      create: { name: d.name, email: d.email, passwordHash, role: "DOCTOR" },
    });
  }

  // Seed default admin user
  const adminEmail = "admin@noerdental.com";
  const passwordHash = await bcrypt.hash("admin12345", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed completed (services, doctors + default admin)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
