// app/services/page.tsx
import { prisma } from "@/lib/prisma";
import ServicesClient from "@/components/ServicesClient";

// Fresh data on every request
export const revalidate = 0;

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];

  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Database error: service.findMany", err);
  }

  // Convert Prisma data to plain objects
  const servicesData = services.map((service) => ({
    id: String(service.id),
    name: String(service.name || "Untitled Service"),
    category: service.category ? String(service.category) : null,
    imageUrl: service.imageUrl ? String(service.imageUrl) : null,

    description: service.description ? String(service.description) : null,
    price:
      typeof service.price === "number"
        ? service.price
        : Number(service.price.toNumber()),
    isActive: Boolean(service.isActive),
  }));

  return <ServicesClient services={servicesData} />;
}
