// ==========================================
// File: app/about/DentistGallery.tsx
// ==========================================
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Doctor {
  name: string;
  photo: string;
  joinDate: string;
  daysDone: string;
}

export default function DentistGallery({ doctors }: { doctors: Doctor[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const selectedDoctor = doctors[selectedIndex];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reorder doctors: move selected to the end (rightmost position)
  const reorderedDoctors = [
    ...doctors.slice(0, selectedIndex),
    ...doctors.slice(selectedIndex + 1),
    doctors[selectedIndex],
  ];

  const handleClick = (originalIndex: number) => {
    setSelectedIndex(originalIndex);
  };

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

            {/* Mobile Label */}
            <div className="lg:hidden">
              <h2 className="text-2xl font-medium text-gray-900">
                Our <span className="text-gray-700">Dentists</span>
              </h2>
            </div>

            {/* Desktop Vertical Label */}
            <div
              className="hidden lg:block"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              <span className="text-[1.8rem] font-medium text-black flex mx-[-0.7rem]">
                Our
              </span>
              <span className="text-2xl text-gray-900">Dentists</span>
            </div>
          </div>

          {/* Fixed Single Row Images with Adaptive Aspect */}
          <div
            className="flex gap-2 md:gap-3 lg:gap-4 items-end overflow-x-auto pb-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {reorderedDoctors.map((doctor, reorderedIdx) => {
              // Find original index
              const originalIndex = doctors.findIndex(
                (d) => d.photo === doctor.photo && d.name === doctor.name
              );
              const isSelected = originalIndex === selectedIndex;

              return (
                <div
                  key={`${originalIndex}-${reorderedIdx}`}
                  onClick={() => handleClick(originalIndex)}
                  className={`relative flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-700 ease-in-out ${
                    isSelected
                      ? "shadow-2xl z-10"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    width: isSelected
                      ? isMobile
                        ? "140px"
                        : `${Math.max(
                            100,
                            Math.min(300, (100 / doctors.length) * 8)
                          )}px`
                      : isMobile
                      ? "70px"
                      : `${Math.max(
                          80,
                          Math.min(100, (100 / doctors.length) * 5)
                        )}px`,
                    height: isSelected
                      ? isMobile
                        ? "350px"
                        : `${Math.max(
                            300,
                            Math.min(400, (100 / doctors.length) * 25)
                          )}px`
                      : isMobile
                      ? "175px"
                      : `${Math.max(
                          200,
                          Math.min(350, (100 / doctors.length) * 12)
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
              );
            })}
          </div>
        </div>

        {/* Right: Doctor Details */}
        <div className="w-full lg:w-80 xl:w-96 bg-gray-50 p-6 md:p-8 flex flex-col justify-center lg:sticky lg:top-24 lg:self-start">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 mb-4 transition-all duration-500">
            {selectedDoctor.name}
          </h3>

          <p className="text-gray-700 mb-8 text-base md:text-lg leading-relaxed transition-all duration-500">
            Professionals in their craft! All products were super amazing with
            strong attention to details, comps and overall vibe
          </p>

          <div className="space-y-4 transition-all duration-500">
            <div className="flex justify-between">
              <span className="text-sm md:text-base text-gray-600">
                Join Date
              </span>
              <span className="text-sm md:text-base font-semibold text-gray-900">
                {selectedDoctor.joinDate}
              </span>
            </div>
            <div className="flex justify-between ">
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
