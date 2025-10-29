"use client";

import { useState, useEffect, useRef } from "react";

interface Service {
  id: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  description: string | null;
  price: number;
  isActive: boolean;
}

interface ServicesClientProps {
  services: Service[];
}

export default function ServicesClient({ services }: ServicesClientProps) {
  const [activeServiceId, setActiveServiceId] = useState(services[0]?.id || "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const serviceId = entry.target.getAttribute("data-service-id");
            if (serviceId) {
              setActiveServiceId(serviceId);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    const sections = document.querySelectorAll("[data-service-id]");
    sections.forEach((section) => {
      observerRef.current?.observe(section);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const scrollToService = (serviceId: string) => {
    const element = document.getElementById(`service-${serviceId}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
      setActiveServiceId(serviceId);
    }
  };

  if (!services || services.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Belum ada layanan aktif
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-1">
              <img
                src="/assets/layananpict.jpg"
                alt="Dental service"
                className="w-full h-64 object-cover lg:h-auto lg:max-h-[25rem] lg:ml-[-9rem] object-center"
              />
            </div>

            <div className="order-2 space-y-3">
              <div className="inline-block bg-[#8E1616] px-6 py-3">
                <h1 className="text-4xl md:text-5xl text-white lg:text-6xl font-medium">
                  Our Services
                </h1>
              </div>
              <p className="text-[1.3rem] md:text-xl text-black leading-relaxed pl-6">
                Kami menyediakan layanan perawatan gigi—dari pencegahan hingga
                perbaikan baik dari segi kesehatan maupun estetika untuk
                memenuhi kebutuhan setiap pasien.
              </p>
            </div>
          </div>
        </section>

        {/* Main: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky hidden lg:block lg:top-[8rem] space-y-4">
              <nav className="space-y-1">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => scrollToService(service.id)}
                    className={`w-full text-left px-4 py-1 text-[1.4rem] font-medium transition-all duration-200 ${
                      activeServiceId === service.id
                        ? "text-[#8E1616] "
                        : "text-gray-700"
                    }`}
                  >
                    {service.name}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-9 space-y-14">
            {services.map((service, index) => (
              <section
                key={service.id}
                id={`service-${service.id}`}
                data-service-id={service.id}
                className="scroll-mt-24"
              >
                <div className="mb-1">
                  <div className="inline-block bg-[#8E1616] px-6 py-3 mb-1">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white">
                      {service.name}
                    </h2>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="px-3 py-1 text-gray-700 rounded-full font-medium">
                      {service.category || "General"}
                    </span>
                  </div>
                </div>

                <div className="aspect-[21/9] bg-gray-900 overflow-hidden relative shadow-xl mb-5">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
                      <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-white bg-opacity-10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white border-opacity-20">
                            <span className="text-white text-4xl font-bold">
                              {service.name.charAt(0)}
                            </span>
                          </div>
                          <p className="text-white text-xl font-semibold opacity-90">
                            {service.name}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className=" space-y-2">
                      <div className="bg-white rounded-lg p-3 ">
                        {service.description ? (
                          <div className="space-y-3 text-gray-700 leading-relaxed">
                            {service.description
                              .split("\n")
                              .map((paragraph, idx) => (
                                <p key={idx} className="text-base">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        ) : (
                          <p className="text-gray-700 leading-relaxed text-base">
                            This professional dental service is provided by our
                            experienced team using modern equipment and proven
                            techniques.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#8E1616] to-[#6B0F0F] text-white  p-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm opacity-80 mb-1">Service Fee</p>
                          <p className="text-3xl font-medium">
                            Rp {service.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <p className="text-xs opacity-90">
                          Per Session • Includes consultation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {index < services.length - 1 && (
                  <div className="mt-16 border-b-2 border-gray-200"></div>
                )}
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
