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
          </div>

          <div className="space-y-6">
            <div className="space-y-4 pl-[3rem]">
              {heroDescription && (
                <p className="text-l font-medium text-gray-800 ">
                  {heroDescription}
                </p>
              )}
              {heroSubtitle && (
                <p className=" text-sm text-gray-700 leading-relaxed ">
                  {heroSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 ml-[-2rem] lg:mx-[-6.8rem] relative overflow-hidden ">
          <div className="aspect-[6/3] lg:aspect-[16/6]">
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
        <section className="bg-white py-2 lg:py-12 px-6 md:px-12 rounded-lg">
          <div className="space-y-6">
            <div className="space-y-4 md:text-left">
              <div className="text-center">
                {aboutTitle && (
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {aboutTitle}
                  </h2>
                )}
              </div>
              <div className="text-justice">
                {aboutDescription && (
                  <p className="text-gray-600  leading-relaxed text-lg whitespace-pre-line">
                    {aboutDescription}
                  </p>
                )}
              </div>
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
            <div className="absolute top-8 left-8 right-16 bottom-16 bg-[#E8C999] rounded-[60% 40% 70% 30% / 50% 60% 40% 50%]"></div>
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
              className="inline-block md:w-auto px-8 py-1 border-2 border-black font-medium hover:bg-black hover:text-white transition-colors"
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
              className="inline-block md:w-auto px-8 py-1 border-2 border-black font-medium hover:bg-black hover:text-white transition-colors"
            >
              More
            </Link>
          </div>

          {/* Dental Chair Image */}
          <div className="relative w-full h-[280px] md:h-[320px] md:order-2 order-1">
            <div className="absolute top-16 left-16 right-8 bottom-16 bg-[#8E1616] rounded-[40% 60% 30% 70% / 60% 50% 50% 40%]"></div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="order-1 hidden lg:block">
            <p className="text-[1.3rem] md:text-xl text-black leading-relaxed pl-6">
              Kami menyediakan layanan perawatan gigi—dari pencegahan hingga
              perbaikan baik dari segi kesehatan maupun estetika untuk memenuhi
              kebutuhan setiap pasien.
            </p>
          </div>
          <div className="order-2 lg:col-span-2 relative border-t border-b border-gray-300">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="flex-shrink-0 w-[280px] md:w-[320px] bg-white border-r border-gray-300 first:border-l"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                            <h3 className="text-xl font-bold leading-tight drop-shadow-lg">
                              {service.name}
                            </h3>
                            {service.category && (
                              <p className="text-sm font-medium opacity-90 drop-shadow-md">
                                {service.category}
                              </p>
                            )}
                            <p className="text-lg font-bold drop-shadow-md">
                              Rp{" "}
                              {(typeof service.price === "number"
                                ? service.price
                                : service.price.toNumber()
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm p-8">
                    Belum ada layanan aktif
                  </div>
                )}
              </div>
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
