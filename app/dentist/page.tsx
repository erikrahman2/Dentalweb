import { requireDoctorOrAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function DentistDashboardPage() {
  const session = await requireDoctorOrAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white border-2 border-black p-8 mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Welcome, Dr. {session.name}
          </h1>
          <p className="text-gray-600">Dentist Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Visits */}
          <Link
            href="/dentist/visits"
            className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">My Visits</h2>
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-gray-600">View and manage your patient visits</p>
          </Link>

          {/* My Schedule */}
          <Link
            href="/dentist/schedule"
            className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">My Schedule</h2>
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-gray-600">Check your appointment schedule</p>
          </Link>

          {/* Profile */}
          <Link
            href="/dentist/profile"
            className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">My Profile</h2>
              <span className="text-3xl">👤</span>
            </div>
            <p className="text-gray-600">Update your profile information</p>
          </Link>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-300 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            📌 Information
          </h3>
          <p className="text-blue-800">
            Welcome to your dentist dashboard. Here you can manage your patient
            visits, view your schedule, and update your profile information.
          </p>
        </div>
      </div>
    </div>
  );
}
