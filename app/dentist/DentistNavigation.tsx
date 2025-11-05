"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function DentistNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                NoerDental
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                href="/dentist/reports"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname.includes("/dentist/reports")
                    ? "border-b-2 border-black text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Patient Reports
              </Link>
              <Link
                href="/dentist/patients"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname.includes("/dentist/patients")
                    ? "border-b-2 border-black text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Patients
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}