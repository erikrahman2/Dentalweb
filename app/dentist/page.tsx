"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Report {
  id: string;
  date: string;
  patientName: string;
  category: string;
  total: number;
}

export default function DentistPage() {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentReports() {
      try {
        const res = await fetch("/api/visits?limit=5");
        const data = await res.json();
        setRecentReports(data);
      } catch (error) {
        console.error("Error fetching recent reports:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentReports();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dentist Dashboard</h1>

      {/* Recent Reports Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Reports</h2>
          <Link
            href="/dentist/reports"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Reports →
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ) : recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {report.patientName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {report.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(report.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent reports found</p>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="space-y-3">
            <Link
              href="/dentist/reports"
              className="block text-blue-600 hover:text-blue-800"
            >
              → View All Reports
            </Link>
            <Link
              href="/dentist/profile"
              className="block text-blue-600 hover:text-blue-800"
            >
              → Update Profile
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions or need assistance, please contact the admin.
          </p>
          <Link
            href="mailto:support@noerdental.com"
            className="text-blue-600 hover:text-blue-800"
          >
            Contact Support →
          </Link>
        </div>
      </section>
    </div>
  );
}