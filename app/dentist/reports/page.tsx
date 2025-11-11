"use client";

import { useCallback, useEffect, useState } from "react";

interface ServiceDetail {
  id: string;
  name: string;
  price: number;
}

interface VisitService {
  serviceId?: string;
  quantity: number;
  customName?: string;
  customPrice?: number;
  service?: ServiceDetail;
}

interface Visit {
  id?: string;
  patientName: string;
  services: VisitService[];
  discount: number;
  total: number;
  paymentMethod?: string;
  status?: "paid" | "unpaid";
  notes?: string;
  date?: string;
  createdBy?: {
    name: string;
  };
  doctor?: {
    name: string;
  };
}

export default function DentistReportsPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Visit[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchService, setSearchService] = useState("");

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append("patientName", searchName);
      if (searchDate) params.append("date", searchDate);
      if (searchService) params.append("serviceName", searchService);
      params.append("dentistOnly", "true"); // Only show this dentist's visits
      const res = await fetch(`/api/visits?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data);
      }
    } catch (error) {
      console.error("Failed to fetch visits:", error);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchDate, searchService]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patient Reports</h1>
          <p className="text-gray-600">View patient visit reports</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-md border">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Patient Name"
          />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            value={searchService}
            onChange={(e) => setSearchService(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Service"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Patient</th>
                <th className="text-left px-3 py-2">Services</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-left px-3 py-2">Payment</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Doctor</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                rows.map((visit) => (
                  <tr key={visit.id || visit.patientName} className="border-t">
                    <td className="px-3 py-2">
                      {visit.date
                        ? new Date(visit.date).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-3 py-2">{visit.patientName}</td>
                    <td className="px-3 py-2">
                      {visit.services
                        .map(
                          (vs) => vs.customName || vs.service?.name || "Unknown"
                        )
                        .join(", ")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      Rp {visit.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2">{visit.paymentMethod || "-"}</td>
                    <td className="px-3 py-2">{visit.status || "pending"}</td>
                    <td className="px-3 py-2">
                      {visit.doctor?.name || visit.createdBy?.name || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
