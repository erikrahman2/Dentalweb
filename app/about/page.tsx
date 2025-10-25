// ==========================================
// File: app/about/page.tsx
// ==========================================
import Image from "next/image";
import DentistGallery from "./DentistGallery";

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
      <div className="not-prose my-16 mx-[-1.24rem] lg:mx-[-6.8rem]">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden ">
          {/* Visi Section */}
          <div className=" p-12 transition-all duration-300 hover:bg-black hover:shadow-2xl group">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 group-hover:text-white mb-8 group-hover:scale-105 transition-all duration-300">
              VISI
            </h2>
            <p className="text-gray-700 group-hover:text-white leading-relaxed text-base md:text-lg transition-all duration-300">
              Menjadi klinik gigi terkemuka yang unggul dalam pelayanan inovatif
              dan kepuasan pasien, dengan komitmen tinggi terhadap etika
              profesi, keselamatan pasien, serta kualitas perawatan yang
              konsisten. Klinik gigi kami bertekad menjadi rujukan utama bagi
              masyarakat di seluruh Kabupaten Pesisir Selatan, melalui
              peningkatan kapasitas tenaga medis, pemanfaatan teknologi terkini,
              serta budaya pelayanan yang empatik dan responsif terhadap
              kebutuhan setiap pasien.
            </p>
          </div>

          {/* Misi Section */}
          <div className="p-12 transition-all duration-300 hover:bg-black hover:shadow-2xl group">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 group-hover:text-white mb-8 group-hover:scale-105 transition-all duration-300">
              MISI
            </h2>
            <ol className="space-y-4 text-gray-700 group-hover:text-white leading-relaxed text-sm md:text-base transition-all duration-300">
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">1.</span>
                <span>
                  Selalu berupaya memberikan pelayanan yang melampaui ekspektasi
                  pasien melalui standar mutu yang konsisten, inovasi, dan
                  responsif terhadap umpan balik.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">2.</span>
                <span>
                  Menyediakan pelayanan terbaik dengan harga terjangkau, tanpa
                  mengorbankan keselamatan, kualitas, dan kenyamanan perawatan.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">3.</span>
                <span>
                  Menjadi klinik gigi yang nyaman dan bersahabat bagi keluarga,
                  dengan pendekatan ramah anak, kenyamanan fasilitas, serta
                  suasana klinik yang menenangkan.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">4.</span>
                <span>
                  Mengedepankan kerja sama tim yang solid dan kolaboratif,
                  berorientasi pada kepuasan pasien melalui koordinasi lintas
                  bidang dan komunikasi yang efektif.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold flex-shrink-0">5.</span>
                <span>
                  Memberikan edukasi kesehatan gigi dan mulut yang relevan,
                  mudah dipahami, serta berdampak pada peningkatan literasi
                  kesehatan masyarakat.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Dentists Section */}
      {doctors.length > 0 && <DentistGallery doctors={doctors} />}
    </section>
  );
}
