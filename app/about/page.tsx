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

      {doctors.length > 0 && (
        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Our Doctors</h2>
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
