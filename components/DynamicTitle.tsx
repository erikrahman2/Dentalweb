"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DynamicTitle() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const getTitleFromPath = (path: string): string => {
    switch (path) {
      case "/":
        return "NOERDENTAL";
      case "/services":
        return "SERVICES";
      case "/faq":
        return "FAQ";
      case "/about":
        return "ABOUT US";
      case "/gallery":
        return "PICT";
      case "/contact":
        return "CONTACT US";
      case "/admin":
        return "ADMIN";
      default:
        return "NOERDENTAL";
    }
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  const title = getTitleFromPath(pathname);

  return (
    <>
      {/* Shadow divider - positioned between navigation and title */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent shadow-sm"></div>

      {/* Dynamic Title */}
      <h1 className="mb-[-1.2rem] text-[3.2rem] lg:text-7xl md:text-9xl font-black tracking-tight leading-tight">
        {title}
      </h1>
    </>
  );
}
