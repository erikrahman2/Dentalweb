"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DynamicTitle from "@/components/DynamicTitle";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
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

  if (isAdmin) {
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
            <div className="text-2xl lg:text-sm font-medium text-gray-800 hover:text-gray-400 transition-opacity duration-500">
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
                href="/contact"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Contact
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
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-2 border-b border-gray-600"
              >
                <span className="text-xl font-light text-gray-900">
                  Contact
                </span>
                <span className="text-xs text-gray-700">05</span>
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
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 Noer Dental Clinic. All Rights Reserved</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white" aria-label="Instagram">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white" aria-label="Twitter">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white" aria-label="YouTube">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="#" className="hover:text-white" aria-label="RSS">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
