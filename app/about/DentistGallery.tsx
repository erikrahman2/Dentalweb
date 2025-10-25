// ==========================================
// File: app/about/DentistGallery.tsx
// ==========================================
"use client";
import Image from "next/image";
import { useState } from "react";

interface Doctor {
  name: string;
  photo: string;
  joinDate: string;
  daysDone: string;
}

export default function DentistGallery({ doctors }: { doctors: Doctor[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedDoctor = doctors[selectedIndex];

  return (
    <div className="not-prose my-20 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8">
        {/* Left: Fixed Single Row Gallery */}
        <div className="w-full overflow-hidden">
          {/* Counter and Reviews Label */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">
              {String(selectedIndex + 1).padStart(2, "0")} /{" "}
              {String(doctors.length).padStart(2, "0")}
            </div>
            <div className="text-2xl font-bold text-gray-900 lg:hidden">
              Reviews
            </div>
            <div
              className="text-2xl font-bold text-gray-900 hidden lg:block"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Reviews
            </div>
          </div>

          {/* Fixed Single Row Images with Adaptive Aspect */}
          <div className="flex gap-2 md:gap-3 lg:gap-4 items-end">
            {doctors.map((doctor, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-500 ${
                  selectedIndex === idx
                    ? "shadow-2xl z-10"
                    : "brightness-70 hover:brightness-50"
                }`}
                style={{
                  width:
                    selectedIndex === idx
                      ? `${Math.max(
                          100,
                          Math.min(200, (100 / doctors.length) * 5)
                        )}px`
                      : `${Math.max(
                          80,
                          Math.min(100, (100 / doctors.length) * 5)
                        )}px`,
                  height:
                    selectedIndex === idx
                      ? `${Math.max(
                          380,
                          Math.min(400, (100 / doctors.length) * 25)
                        )}px`
                      : `${Math.max(
                          200,
                          Math.min(380, (100 / doctors.length) * 12)
                        )}px`,
                }}
              >
                <Image
                  src={doctor.photo || "/placeholder-doctor.jpg"}
                  alt={doctor.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Doctor Details */}
        <div className="w-full lg:w-80 xl:w-96 bg-gray-50 p-6 md:p-8 flex flex-col justify-center lg:sticky lg:top-24 lg:self-start">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 transition-all duration-500">
            {selectedDoctor.name}
          </h3>

          <p className="text-gray-700 italic mb-8 text-base md:text-lg leading-relaxed transition-all duration-500">
            "Professionals in their craft! All products were super amazing with
            strong attention to details, comps and overall vibe"
          </p>

          <div className="space-y-4 transition-all duration-500">
            <div className="flex justify-between py-3 border-b border-gray-300">
              <span className="text-sm md:text-base text-gray-600">
                Join Date
              </span>
              <span className="text-sm md:text-base font-semibold text-gray-900">
                {selectedDoctor.joinDate}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-300">
              <span className="text-sm md:text-base text-gray-600">
                Days Done
              </span>
              <span className="text-sm md:text-base font-semibold text-gray-900">
                {selectedDoctor.daysDone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
