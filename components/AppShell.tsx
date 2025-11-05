"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DynamicTitle from "@/components/DynamicTitle";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideShell = pathname?.startsWith("/admin") || pathname?.startsWith("/dentist");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowLogo((prev) => !prev);
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <>
      <header
        className={`bg-white fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div
            className={`flex items-center justify-between pb-4 ${
              !mobileOpen ? "border-b border-gray-600" : ""
            }`}
          >
            <div className="text-2xl lg:text-m font-medium text-gray-800 hover:text-gray-400 transition-opacity duration-500">
              <Link href="/" className="flex items-center">
                {showLogo ? (
                  <Image
                    src="/assets/logounit_2.png"
                    alt="Noerdental Clinic Logo"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                ) : (
                  <span>NOERDENTAL CLINIC</span>
                )}
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/services"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Services
              </Link>
              <Link
                href="/about"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                About Us
              </Link>
              <Link
                href="/faq"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                FAQ
              </Link>
              <Link
                href="/gallery"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Pict
              </Link>

              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-md text-gray-700 relative w-8 h-8 flex items-center justify-center"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <div className="w-6 h-3 relative flex flex-col justify-between">
                <span
                  className={`block h-0.5 bg-gray-700 transition-all duration-300 ease-in-out ${
                    mobileOpen
                      ? "rotate-45 translate-y-[7px] w-6"
                      : "rotate-0 translate-y-0 w-6"
                  }`}
                />
                <span
                  className={`block h-0.5 bg-gray-700 transition-all duration-300 ease-in-out ${
                    mobileOpen
                      ? "-rotate-45 -translate-y-[7px] w-6"
                      : "rotate-0 translate-y-0 w-5"
                  }`}
                />
              </div>
            </button>
          </div>

          <DynamicTitle />
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 bg-gray-200 z-50 flex flex-col overflow-y-auto animate-fadeIn">
          {/* Header with close button */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-200">
            <div className="text-sm font-medium text-gray-800">
              <Image
                src="/assets/logounit_2.png"
                alt="Noerdental Clinic Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <button
              className="relative w-8 h-8 flex items-center justify-center"
              onClick={() => setMobileOpen(false)}
            >
              <div className="w-6 h-4 relative flex flex-col justify-between">
                <span className="block h-0.5 bg-gray-700 rotate-45 translate-y-[7px] w-6" />
                <span className="block h-0.5 bg-gray-700 -rotate-45 -translate-y-[7px] w-6" />
              </div>
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-6 pt-12 pb-8 bg-gray-200">
            <div className="space-y-6">
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2 border-b border-gray-600"
              >
                <span className="text-xl font-light text-gray-900">
                  Services
                </span>
                <span className="text-xs text-gray-700">01</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2 border-b border-gray-600"
              >
                <span className="text-xl font-light text-gray-900">
                  About Us
                </span>
                <span className="text-xs text-gray-700">02</span>
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2 border-b border-gray-600"
              >
                <span className="text-xl font-light text-gray-900">FAQ</span>
                <span className="text-xs text-gray-700">03</span>
              </Link>
              <Link
                href="/gallery"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2 border-b border-gray-600"
              >
                <span className="text-xl font-light text-gray-900">Pict</span>
                <span className="text-xs text-gray-700">04</span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2 border-b border-gray-600"
              >
                <span className="text-xl font-light text-gray-900">Admin</span>
                <span className="text-xs text-gray-700">06</span>
              </Link>
            </div>

            {/* Social links */}
            <div className="mt-12 space-y-3">
              <a
                href="#"
                className="bottom-0 block text-sm text-gray-600 hover:text-gray-800"
              >
                - Derik
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[120px]"></div>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-black text-white pb-12">
        <div className="container mx-auto px-4 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left Column - Newsletter */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                DENTAL NEWS TO
                <br />
                YOUR INBOX
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="contact us"
                  className="flex-1 px-4 py-3 bg-white text-black focus:outline-none"
                />
                <button className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors">
                  Send
                </button>
              </div>
            </div>

            {/* Right Column - Links */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-9">
              <div>
                <h3 className="text-sm font-semibold">NOERDENTAL CLINIC</h3>
              </div>
              <div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/services" className="hover:text-gray-400">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-gray-400">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-gray-400">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/gallery" className="hover:text-gray-400">
                      Pict
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-gray-400">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/privacy" className="hover:text-gray-400">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-gray-400">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/licensing" className="hover:text-gray-400">
                      Licensing
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex justify-center items-center text-sm text-gray-400">
            <p>© 2025 Noer Dental Clinic. All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </>
  );
}
