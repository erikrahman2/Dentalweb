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
              {heroDescription && (
                <p className="text-gray-700 leading-relaxed">
                  {heroDescription}
                </p>
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
      {(aboutTitle || aboutDescription) && (
        <section className="bg-white py-12 px-6 md:px-12 rounded-lg">
          <div className="space-y-6">
            <div className="space-y-4 text-center md:text-left">
              {aboutTitle && (
                <h2 className="text-3xl md:text-4xl font-bold">{aboutTitle}</h2>
              )}
              {aboutDescription && (
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {aboutDescription}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Facilities Section */}
      <section className="space-y-12 md:space-y-16">
        {/* Row 1: Dental Lens (Left) + Text (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Dental Lens Image */}
          <div className="relative w-full h-[280px] md:h-[320px]">
            <div className="absolute top-8 left-8 right-16 bottom-16 bg-[#D4B86A] rounded-[60% 40% 70% 30% / 50% 60% 40% 50%]"></div>
            <div className="relative w-full h-full flex items-center justify-start pl-4">
              <div className="relative w-[92%] h-[180%]">
                <Image
                  src="/assets/denlens.png"
                  alt="Dental Lens - Lensa Diagnostik"
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 px-4 md:px-0">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              Fasililitas Nyaman, Alat Standar Internasional
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Kami percaya dengan fasilitas dan alat yang modern, setiap pasien
              akan dengan senang hati datang ke klinik untuk merawat giginya.
              Tidak takut lagi oleh datang ke dokter gigi!
            </p>
            <Link
              href="/about"
              className="inline-block bg-[#D4B86A] hover:bg-[#C5A959] text-gray-900 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              More
            </Link>
          </div>
        </div>

        {/* Row 2: Text (Left) + Dental Chair (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-4 px-4 md:px-0 md:order-1 order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              Dokter dan Perawat yang Profesional
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Setiap tenaga medis yang melayani dipastikan sudah memiliki
              sertifikasi lengkap agar hasil kerja sesuai standar terbaik untuk
              setiap pasien.
            </p>
            <Link
              href="/about"
              className="inline-block bg-[#D4B86A] hover:bg-[#C5A959] text-gray-900 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              More
            </Link>
          </div>

          {/* Dental Chair Image */}
          <div className="relative w-full h-[280px] md:h-[320px] md:order-2 order-1">
            <div className="absolute top-16 left-16 right-8 bottom-16 bg-[#2D7A7A] rounded-[40% 60% 30% 70% / 60% 50% 50% 40%]"></div>
            <div className="relative w-full h-full flex items-center justify-end pr-4">
              <div className="relative w-[90%] h-[130%]">
                <Image
                  src="/assets/denchair.png"
                  alt="Dental Chair - Kursi Gigi Modern"
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))",
                  }}
                />
              </div>
            </div>
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
                      {service.highlightDescription && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {service.highlightDescription}
                        </p>
                      )}
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
