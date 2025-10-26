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
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
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
      contact: parsed.contact || {},
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return {
      about: {},
      doctors: [],
      contact: {},
    };
  }
}

export default async function AboutPage() {
  const { about, doctors, contact } = await getAboutData();

  return (
    <section className="prose max-w-none">
      <h1>About Us</h1>
      {about.description && <p>{about.description}</p>}

      {/* Visi & Misi Section */}
      <div className="not-prose my-16 mx-[-1.24rem] lg:mx-[-6.8rem]">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden ">
          {/* Visi Section */}
          <div className=" p-12 transition-all duration-300 hover:bg-[#8E1616] hover:shadow-2xl group">
            <h2 className="text-3xl md:text-5xl font-medium text-gray-800 group-hover:text-white mb-8 group-hover:scale-105 transition-all duration-300">
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
          <div className="p-12 transition-all duration-300 hover:bg-[#8E1616] hover:shadow-2xl group">
            <h2 className="text-3xl md:text-5xl font-medium text-gray-800 group-hover:text-white mb-8 group-hover:scale-105 transition-all duration-300">
              MISI
            </h2>
            <ol className="space-y-1 text-gray-700 group-hover:text-white leading-relaxed text-sm md:text-base transition-all duration-300">
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">1.</span>
                <span>
                  Selalu berupaya memberikan pelayanan yang melampaui ekspektasi
                  pasien melalui standar mutu yang konsisten, inovasi, dan
                  responsif terhadap umpan balik.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">2.</span>
                <span>
                  Menyediakan pelayanan terbaik dengan harga terjangkau, tanpa
                  mengorbankan keselamatan, kualitas, dan kenyamanan perawatan.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">3.</span>
                <span>
                  Menjadi klinik gigi yang nyaman dan bersahabat bagi keluarga,
                  dengan pendekatan ramah anak, kenyamanan fasilitas, serta
                  suasana klinik yang menenangkan.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">4.</span>
                <span>
                  Mengedepankan kerja sama tim yang solid dan kolaboratif,
                  berorientasi pada kepuasan pasien melalui koordinasi lintas
                  bidang dan komunikasi yang efektif.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">5.</span>
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

      {/* Address Section */}
      <div className="not-prose my-16">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left Column - Question */}
          <div className=" bg-[#8E1616] p-9">
            <h2 className="text-4xl md:text-5xl font-medium text-gray-100 mb-2">
              Dimana Klinik Kami?
            </h2>

            <div>
              <h3 className="text-lg font-medium text-gray-200 ">Alamat</h3>
              <p className="text-gray-300 leading-relaxed">
                {contact?.address ||
                  "Jl. Lintas Sumatera, Painan, Kabupaten Pesisir Selatan, Sumatera Barat"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-200 ">Telepon</h3>
              <p className="text-gray-300">
                {contact?.phone || "+62 812-3456-7890"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-200 ">Email</h3>
              <p className="text-gray-300">
                {contact?.email || "info@noerdental.com"}
              </p>
            </div>
          </div>

          {/* Right Column - google maps */}
          <div className="space-y-6">
            <div className="mt-9 w-full h-[400px]  overflow-hidden ">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7852148076745!2d100.50992990915701!3d-1.3038954986782265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd3516761b25759%3A0xde7a3d7b4882ce3c!2sPraktek%20drg.%20Hidayati%20M.K.M%20dan%20dr%20.Widodo!5e0!3m2!1sid!2sid!4v1761470595622!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Klinik NoerDental"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
