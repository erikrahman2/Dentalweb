// scripts/seed-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding admin user...");

  // ✅ FIXED: Use admin12345 (consistent with seed.ts)
  const password = await bcrypt.hash("admin12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@noerdental.com" },
    update: {
      name: "Administrator",
      passwordHash: password,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Administrator",
      email: "admin@noerdental.com",
      passwordHash: password,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin user created/updated successfully!");
  console.log("📧 Email:", admin.email);
  console.log("🔑 Password: admin12345");
  console.log("👤 Role:", admin.role);
  console.log("🆔 ID:", admin.id);
  console.log("✅ isActive:", admin.isActive);
  console.log("");
  console.log("🚀 You can now login at: http://localhost:3000/login");
  console.log("");
  console.log("⚠️  If login fails:");
  console.log("1. Clear browser cookies");
  console.log("2. Restart dev server (npm run dev)");
  console.log("3. Try incognito/private window");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding admin user:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
