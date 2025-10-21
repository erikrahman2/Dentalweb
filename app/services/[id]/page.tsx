import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  let service;
  try {
    service = await prisma.service.findFirst({
      where: { id: params.id, isActive: true },
    });
  } catch (err) {
    console.error("Database error: service.findFirst", err);
  }

  if (!service) {
    notFound();
  }

  const price =
    typeof service.price === "number"
      ? service.price
      : service.price.toNumber();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Article Layout - Magazine Style */}
      <article className="space-y-8">
        {/* Header Section */}
        <header className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              href="/services"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              ← All Services
            </Link>
            <span>NOERDENTAL</span>
            <span>||</span>
            <span>{service.category}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            {service.name.toUpperCase()}
          </h1>
        </header>

        {/* Featured Image */}
        <div className="aspect-[16/6] bg-gray-900 flex items-center justify-center relative overflow-hidden">
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={service.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
              <div className="relative z-10 text-center">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-4xl font-bold">
                    {service.name.charAt(0)}
                  </span>
                </div>
                <p className="text-white text-lg font-medium">{service.name}</p>
              </div>
              <div className="absolute top-8 left-8 w-16 h-16 border-2 border-white border-opacity-30 rounded-full"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border border-white border-opacity-20 rounded-full"></div>
              <div className="absolute top-1/2 left-16 w-8 h-8 bg-white bg-opacity-10 rounded-full"></div>
            </>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Left Column (spans 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlight Description */}
            {service.highlightDescription && (
              <section className="space-y-4">
                <div className="border-l-4 border-black pl-6">
                  <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-gray-900">
                    "{service.highlightDescription}"
                  </blockquote>
                </div>
              </section>
            )}

            {/* Full Description */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">About This Service</h2>
              <div className="prose prose-lg max-w-none">
                {service.description ? (
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    {service.description.split("\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    This professional dental service is provided by our
                    experienced team using modern equipment and proven
                    techniques. We ensure the highest standards of care and
                    patient comfort throughout the treatment process.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Service Info Card */}
            <div className="bg-white p-6 space-y-6">
              <h3 className="text-lg font-bold">Service Information</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Price
                  </span>
                  <span className="text-lg font-bold">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Category
                  </span>
                  <span className="text-sm">
                    {service.category || "General"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
