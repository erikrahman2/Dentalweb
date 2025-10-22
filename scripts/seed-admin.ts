// scripts/seed-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding admin user...");

  // Create admin with hashed password
  const password = await bcrypt.hash("admin123", 10);

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
  console.log("🔑 Password: admin123");
  console.log("👤 Role:", admin.role);
  console.log("🆔 ID:", admin.id);
  console.log("");
  console.log("🚀 You can now login at: http://localhost:3000/login");
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
