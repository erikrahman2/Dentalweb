// ==========================================
// File: app/about/page.tsx
// ==========================================
import Image from "next/image";

interface Doctor {
  name: string;
  photo: string;
  joinDate: string;
  daysDone: string;
}

interface AboutData {
  about: {
    description?: string;
  };
  doctors: Doctor[];
}

export async function getAboutData(): Promise<AboutData> {
  try {
    const fs = require("fs/promises");
    const path = require("path");
    const dataFile = path.join(process.cwd(), "data", "clinic-info.json");
    const data = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(data);

    return {
      about: parsed.about || {},
      doctors: parsed.doctors || [],
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return {
      about: {},
      doctors: [],
    };
  }
}

export default async function AboutPage() {
  const { about, doctors } = await getAboutData();

  return (
    <section className="prose max-w-none">
      <h1>About Us</h1>
      {about.description && <p>{about.description}</p>}

      {/* Visi & Misi Section */}
      <div className="not-prose my-16 mx-[-1.24rem] lg:mx-[-7rem]">
        <div className="grid md:grid-cols-2 gap-0  overflow-hidden shadow-lg">
          {/* Visi Section */}
          <div className="bg-gradient-to-br from-[#D4B068] to-[#C19A4C] p-12 transition-all duration-300 hover:shadow-2xl group">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 group-hover:scale-105 transition-transform duration-300">
              VISI
            </h2>
            <p className="text-gray-700 leading-relaxed text-base md:text-lg group-hover:text-gray-900 transition-colors duration-300">
              Menjadi klinik gigi terbaik dalam hal pelayanan dan kepuasan
              pasien, serta menjadi klinik gigi andalan masyarakat seluruh
              Provinsi di Sumatera.
            </p>
          </div>

          {/* Misi Section */}
          <div className="bg-gradient-to-br from-[#2C5F5F] to-[#1E4444] p-12 transition-all duration-300 hover:shadow-2xl group">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 group-hover:scale-105 transition-transform duration-300">
              MISI
            </h2>
            <ol className="space-y-4 text-white leading-relaxed text-sm md:text-base group-hover:text-gray-100 transition-colors duration-300">
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">1.</span>
                <span>
                  Selalu berusaha memberikan pelayanan yang melabihi ekspektasi
                  pasien.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">2.</span>
                <span>
                  Memberikan pelayanan yang terbaik dengan harga yang
                  terjangkau.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">3.</span>
                <span>
                  Menjadi klinik gigi yang nyaman dan bersahabat bagi keluarga.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">4.</span>
                <span>
                  Mengedepankan kerjasama tim yang berorientasi terhadap
                  kepuasan pasien.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">5.</span>
                <span>
                  Memberikan edukasi kesehatan gigi dan mulut yang bermanfaat
                  bagi masyarakat.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Dentists Section */}
      {doctors.length > 0 && (
        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Our Dentists
          </h2>
          <div className="space-y-4">
            {doctors.map((doctor: Doctor, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={doctor.photo || "/placeholder-doctor.jpg"}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {doctor.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Join</div>
                    <div className="font-medium text-gray-900">
                      {doctor.joinDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Day Done</div>
                    <div className="font-medium text-gray-900">
                      {doctor.daysDone}
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors">
                    ABOUT
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
