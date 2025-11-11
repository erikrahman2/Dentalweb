import fs from "fs/promises";
import path from "path";
import Image from "next/image";
import DentistGallery from "./DentistGallery";

interface DoctorProfile {
  id: number;
  name: string;
  photo: string | null;
  joinDate: string | null;
  description: string | null;
  email?: string;
  hasPassword?: boolean;
}

interface Doctor {
  name: string;
  photo: string;
  joinDate: string;
  description: string;
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
    // Fetch doctors from DoctorProfile API
    const doctorsResponse = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/doctor-profiles`,
      {
        cache: "no-store", // Ensure fresh data
        headers: {
          "Content-Type": "application/json",
          "x-admin-request": "false",
        },
      }
    );

    let doctors: Doctor[] = [];
    if (doctorsResponse.ok) {
      const doctorsData: DoctorProfile[] = await doctorsResponse.json();
      // Transform DoctorProfile data to match the expected interface
      doctors = doctorsData.map((doc) => ({
        name: doc.name,
        photo: doc.photo || "/placeholder-doctor.jpg",
        joinDate: new Date(doc.joinDate || "").toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
        }),
        description:
          doc.description ||
          "Dokter gigi profesional dengan pengalaman dalam berbagai perawatan gigi.",
      }));
    }

    console.log("Fetched doctors:", doctors); // Debug log

    // Fetch clinic info from JSON file for about and contact
    const dataFile = path.join(process.cwd(), "data", "clinic-info.json");
    const data = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(data);

    return {
      about: parsed.about || {},
      doctors: doctors,
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
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl md:mb-8 font-medium text-gray-800 px-4 md:px-0">
        Mengenal Klinik NoerDental
      </h1>

      {/* Double column for desktop, single column for mobile with background */}
      <div className="grid md:grid-cols-2 gap-0 items-stretch my-6 md:my-8 lg:my-12 relative">
        {/* Background Pattern - Absolute positioned behind */}
        <div className="absolute left-[-1rem] lg:left-[-7rem] top-0 w-[40%] md:w-[45%] lg:w-[40%] h-full z-0">
          <Image
            src="/assets/aboutusp.png"
            alt="Background Pattern"
            fill
            className="object-cover opacity-30 md:opacity-60"
            priority
          />
        </div>

        {/* Main Image Container */}
        <div className="relative z-10 flex items-center justify-center md:justify-start px-4 sm:px-6 md:px-8 py-6 md:py-0">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-md aspect-[6/4] sm:aspect-[5/6]">
            <Image
              src="/assets/asset32.jpg"
              alt="Klinik NoerDental"
              fill
              className="object-cover shadow-lg md:shadow-2xl rounded-sm md:rounded-none"
              priority
            />
          </div>
        </div>

        {/* Description - Right Side */}
        <div className="relative p-6 sm:p-8 md:p-10 lg:p-16 z-20 md:z-0 flex items-center">
          <div className="max-w-xl w-full">
            {about.description && (
              <p className="text-gray-700 text-l font-medium sm:text-base md:text-lg leading-relaxed">
                {about.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Visi & Misi Section */}
      <div className="not-prose my-5 lg:my-16 mx-[-1.24rem] lg:mx-[-6.8rem]">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden ">
          {/* Visi Section */}
          <div className=" p-12 transition-all duration-300 hover:bg-[#8E1616] hover:shadow-2xl group">
            <h2 className="text-3xl md:text-5xl font-medium text-gray-800 group-hover:text-white mb-4 group-hover:scale-105 transition-all duration-300">
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
            <h2 className="text-3xl md:text-5xl font-medium text-gray-800 group-hover:text-white mb-4 group-hover:scale-105 transition-all duration-300">
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

      {/* Dentist Gallery Component */}
      {doctors.length > 0 && <DentistGallery doctors={doctors} />}

      {/* Address Section */}
      <div className="not-prose my-16">
        <div className="grid md:grid-cols-2 gap-2 lg:gap-8 items-start">
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
