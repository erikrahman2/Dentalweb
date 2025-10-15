import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Fresh data on every request
export const revalidate = 0;

// app/services/page.tsx
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

  const hasServices = services.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Image */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="order-1 overflow-hidden rounded-l">
            <img
              src="/assets/layananpict.jpg"
              alt="Dental service"
              className="w-full h-auto object-cover rounded-lg lg:h-auto max-h-[230px] lg:max-h-[25rem] object-center"
            />
          </div>

          {/* Text Content */}
          <div className="order-2 space-y-6">
            <div className="inline-block bg-[#e1dcc7] px-6 py-3 rounded-s">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Our Services
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Kami menyediakan layanan perawatan gigi—dari pencegahan hingga
              perbaikan baik dari segi kesehatan maupun estetika untuk memenuhi
              kebutuhan setiap pasien.
            </p>
          </div>
        </div>
      </section>

      {/* Connected Grid Layout */}
      <div
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 
                  border border-gray-600 bg-white 
                  divide-x divide-y divide-gray-600"
      >
        {!hasServices && (
          <div className="col-span-full text-center text-gray-500 p-12">
            Belum ada layanan aktif.
          </div>
        )}

        {services.map((service, index) => {
          return (
            <Link key={service.id} href={`/services/${service.id}`}>
              <article className="group bg-white hover:bg-gray-200 transition-colors cursor-pointer h-full">
                {/* Content sama seperti sebelumnya */}
                <div className="flex justify-between items-center p-4 pb-3">
                  <span className="text-xs text-gray-500">***</span>
                  <span className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-600 rounded">
                    {service.category?.toUpperCase() || "DENTAL"}
                  </span>
                </div>

                <div className="px-4 pb-4">
                  <div className="aspect-square bg-gray-200 overflow-hidden relative">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-3xl">
                          {service.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors duration-300" />
                  </div>
                </div>

                <div className="px-4 pb-6 space-y-3">
                  <h2 className="text-xl font-bold leading-tight text-gray-900">
                    {service.name}
                  </h2>

                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 overflow-hidden">
                    {service.highlightDescription ||
                      "Professional dental service with modern equipment and experienced dentists."}
                  </p>

                  <div className="text-lg font-bold text-gray-900 py-1">
                    Rp{" "}
                    {(typeof service.price === "number"
                      ? service.price
                      : service.price.toNumber()
                    ).toLocaleString("id-ID")}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">By</span>
                      <span>Noerdental</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium group-hover:text-gray-900 transition-colors">
                        Read more
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {hasServices && (
        <div className="mt-12 text-left">
          <h2 className="md:text-3xl lg:text-6xl font-bold">
            Layanan Perawatan Gigi Anak
          </h2>
        </div>
      )}
    </div>
  );
}
