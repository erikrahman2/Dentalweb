import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

type ClinicInfo = Awaited<ReturnType<typeof prisma.clinicInfo.findFirst>>;

type HomepageConfig = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroDescription: string | null;
  heroImage: string | null;
  aboutTitle: string | null;
  aboutDescription: string | null;
  ctaText: string | null;
  ctaLink: string | null;
};

type Service = Awaited<ReturnType<typeof prisma.service.findMany>>[number];

interface HomePageContentProps {
  info: ClinicInfo;
  homepageConfig: HomepageConfig;
  services: Service[];
}

function HomePageContent({
  info,
  homepageConfig,
  services,
}: HomePageContentProps) {
  const {
    heroTitle,
    heroSubtitle,
    heroDescription,
    heroImage,
    aboutTitle,
    aboutDescription,
    ctaText,
    ctaLink,
  } = homepageConfig;

  const fallbackHeroImage = "/assets/pexels-shvetsa-40457001.jpg";

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <article className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-6">
            <h1 className="text-[2.9rem] lg:text-6xl md:text-7xl font-black leading-[0.9] lg:leading-[1] tracking-[-0.02em]">
              {heroTitle || "NOERDENTAL Clinic"}
            </h1>
            {heroSubtitle && (
              <p className="text-xl text-gray-700 leading-relaxed">
                {heroSubtitle}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {heroDescription ||
                  info?.description ||
                  "Kami siap mendampingi perjalanan senyum sehatmu dengan perawatan profesional dan suasana nyaman."}
              </p>
              {ctaText && (
                <div>
                  <Link
                    href={ctaLink || "/contact"}
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-medium tracking-wide uppercase hover:bg-gray-900"
                  >
                    {ctaText}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="aspect-[16/7] relative overflow-hidden bg-gray-200">
            <Image
              src={(heroImage && heroImage.trim()) || fallbackHeroImage}
              alt="NOERDENTAL hero"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </article>

      {/* About Section */}
      <section className="bg-white py-12 px-6 md:px-12 rounded-lg">
        <div className="space-y-6">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold">
              {aboutTitle || "Tentang NOERDENTAL"}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
              {aboutDescription ||
                "NOERDENTAL Clinic adalah salah satu klinik dokter gigi terbaik di daerah pesisir selatan yang berkomitmen untuk terus berusaha memberikan pelayanan, kualitas kerja, dan fasilitas yang melebihi ekspektasi pasien."}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black">Layanan Kami</h2>
          <Link
            href="/services"
            className="text-sm font-medium hover:underline flex items-center gap-2"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="relative border-t border-b border-gray-300">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex">
              {services.length > 0 ? (
                services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="group flex-shrink-0 w-[280px] md:w-[320px] bg-white border-r border-gray-200 first:border-l"
                  >
                    <div className="p-6">
                      <div className="relative aspect-square overflow-hidden bg-gray-200">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                        )}
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <h3 className="text-xl font-bold leading-tight drop-shadow-lg">
                            {service.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 space-y-2 bg-white group-hover:bg-gray-50 transition-colors duration-300">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {service.highlightDescription ||
                          "Perawatan gigi profesional dengan teknologi modern dan tim berpengalaman."}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-900">
                          Rp{" "}
                          {(typeof service.price === "number"
                            ? service.price
                            : service.price.toNumber()
                          ).toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors duration-300">
                          Selengkapnya
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500 text-sm p-8">
                  Belum ada layanan aktif
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function HomePage() {
  let info: ClinicInfo = null;
  let services: Service[] = [];
  let homepageConfig: HomepageConfig = {
    heroTitle: null,
    heroSubtitle: null,
    heroDescription: null,
    heroImage: null,
    aboutTitle: null,
    aboutDescription: null,
    ctaText: null,
    ctaLink: null,
  };

  try {
    const [infoData, servicesData, dataRaw] = await Promise.all([
      prisma.clinicInfo.findFirst(),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        take: 6,
      }),
      fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/clinic-info`,
        {
          next: { revalidate: 60 },
        }
      )
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]);

    info = infoData;
    services = servicesData;

    const homepageData = dataRaw?.homepage;
    if (homepageData && typeof homepageData === "object") {
      homepageConfig = {
        heroTitle: homepageData.heroTitle ?? null,
        heroSubtitle: homepageData.heroSubtitle ?? null,
        heroDescription: homepageData.heroDescription ?? null,
        heroImage: homepageData.heroImage ?? null,
        aboutTitle: homepageData.aboutTitle ?? null,
        aboutDescription: homepageData.aboutDescription ?? null,
        ctaText: homepageData.ctaText ?? null,
        ctaLink: homepageData.ctaLink ?? null,
      };
    }
  } catch (err) {
    console.error("Database error", err);
  }

  return (
    <HomePageContent
      info={info}
      homepageConfig={homepageConfig}
      services={services}
    />
  );
}
