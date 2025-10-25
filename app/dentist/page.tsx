"use client";

import { useEffect, useMemo, useState } from "react";

// Types for Service and Visit creation
type Service = {
  id: string;
  name: string;
  price: any;
};

type VisitServicePayload = {
  serviceId: string;
  quantity: number;
  customName?: string;
  customPrice?: number;
};

type VisitPayload = {
  id?: string;
  patientName: string;
  services: VisitServicePayload[];
  discount: number;
  paymentMethod?: string;
  status?: "paid" | "unpaid";
  notes?: string;
  date?: string;
};

export default function DentistReportsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitPayload | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchService, setSearchService] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);

  // Simple form state
  const [form, setForm] = useState<VisitPayload>({
    patientName: "",
    services: [{ serviceId: "", quantity: 1 }],
    discount: 0,
    paymentMethod: "cash",
    status: "paid",
    notes: "",
    date: "",
  });

  const [showDiscount, setShowDiscount] = useState(false);

  const calculateTotal = useMemo(() => {
    let total = 0;
    for (const svc of form.services) {
      if (svc.serviceId === "custom") {
        // Custom service
        total += (svc.customPrice || 0) * svc.quantity;
      } else if (svc.serviceId) {
        // Regular service
        const service = services.find((s) => s.id === svc.serviceId);
        if (service) {
          total += Number(service.price) * svc.quantity;
        }
      }
    }
    return Math.max(0, total - form.discount);
  }, [services, form.services, form.discount]);

  useEffect(() => {
    // Fetch user info
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUserInfo(data))
      .catch(console.error);

    setLoading(true);
    fetch("/api/services?isActive=true")
      .then((r) => r.json())
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  }, []);

  const fetchVisits = async () => {
    const params = new URLSearchParams();
    params.append("dentistOnly", "true"); // Filter to show only dentist's own visits
    if (searchName) params.append("patientName", searchName);
    if (searchDate) params.append("date", searchDate);
    if (searchService) params.append("serviceName", searchService);
    const res = await fetch(`/api/visits?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [searchName, searchDate, searchService]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "discount") {
      const val = value.replace(/^Rp\s*/, "").replace(/[^\d]/g, "");
      const num = val ? Number(val) : 0;
      setForm((f) => ({ ...f, discount: num }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const addService = () => {
    setForm((f) => ({
      ...f,
      services: [...f.services, { serviceId: "", quantity: 1 }],
    }));
  };

  const removeService = (index: number) => {
    setForm((f) => ({
      ...f,
      services: f.services.filter((_, i) => i !== index),
    }));
  };

  const updateService = (
    index: number,
    updates: Partial<VisitServicePayload>
  ) => {
    setForm((f) => ({
      ...f,
      services: f.services.map((s, i) =>
        i === index ? { ...s, ...updates } : s
      ),
    }));
  };

  const resetForm = () => {
    setForm({
      patientName: "",
      services: [{ serviceId: "", quantity: 1 }],
      discount: 0,
      paymentMethod: "cash",
      status: "paid",
      notes: "",
      date: "",
    });
    setShowDiscount(false);
  };

  const cancelEdit = () => {
    setIsAddingNew(false);
    setEditingVisit(null);
    resetForm();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingVisit ? "PUT" : "POST";
      const body = editingVisit ? { id: editingVisit.id, ...form } : form;
      const res = await fetch("/api/visits", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to submit");
      }
      const data = await res.json();
      if (editingVisit) {
        setRows((r) =>
          r.map((row) => (row.id === editingVisit.id ? data : row))
        );
        setEditingVisit(null);
      } else {
        setRows((r) => [data, ...r]);
        setIsAddingNew(false);
      }
      resetForm();
      fetchVisits();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (visit: any) => {
    // Check if this visit was created by current user
    if (userInfo && visit.createdByUserId !== userInfo.id) {
      alert("You can only edit your own reports");
      return;
    }

    setEditingVisit(visit);
    setForm({
      id: visit.id,
      patientName: visit.patientName,
      services: visit.services?.map((vs: any) => ({
        serviceId: vs.serviceId,
        quantity: vs.quantity,
        customName: vs.customName,
        customPrice: vs.customPrice,
      })) || [{ serviceId: "", quantity: 1 }],
      discount: Number(visit.discount) || 0,
      paymentMethod: visit.paymentMethod,
      status: visit.status,
      notes: visit.notes || "",
      date: visit.date ? new Date(visit.date).toISOString().split("T")[0] : "",
    });
    setShowDiscount(Number(visit.discount) > 0);
    setIsAddingNew(true);
    setTimeout(() => {
      const element = document.getElementById("edit-form");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleDelete = async (visit: any) => {
    // Check if this visit was created by current user
    if (userInfo && visit.createdByUserId !== userInfo.id) {
      alert("You can only delete your own reports");
      return;
    }

    if (!confirm("Are you sure you want to delete this visit?")) return;
    try {
      const res = await fetch(`/api/visits?id=${visit.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setRows((r) => r.filter((row) => row.id !== visit.id));
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patient Reports</h1>
          <p className="text-gray-600">Manage your patient visit reports</p>
        </div>
        <button
          onClick={() => {
            setIsAddingNew(true);
            setTimeout(() => {
              const element = document.getElementById("edit-form");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }}
          className="w-full md:w-auto px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
        >
          + Add Patient Report
        </button>
      </div>

      {/* Input Form */}
      {(isAddingNew || editingVisit) && (
        <div
          id="edit-form"
          className="bg-gray-50 border border-gray-200 p-4 sm:p-6"
        >
          <h2 className="text-xl font-bold mb-4">
            {editingVisit ? "Edit Patient Report" : "Add New Patient Report"}
          </h2>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient Name *
                </label>
                <input
                  name="patientName"
                  value={form.patientName}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Services *</label>
                <button
                  type="button"
                  onClick={addService}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Service
                </button>
              </div>
              {form.services.map((svc, index) => (
                <div
                  key={index}
                  className="mb-4 p-3 border border-gray-200 rounded bg-white"
                >
                  <div className="flex gap-2 mb-2">
                    <select
                      value={svc.serviceId}
                      onChange={(e) =>
                        updateService(index, {
                          serviceId: e.target.value,
                          customName: undefined,
                          customPrice: undefined,
                        })
                      }
                      className="flex-1 p-2 border border-gray-300 focus:outline-none focus:border-black"
                      required
                    >
                      <option value="">Select service</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - Rp{" "}
                          {Number(s.price).toLocaleString("id-ID")}
                        </option>
                      ))}
                      <option value="custom">
                        ➕ Custom Service (Type Manually)
                      </option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={svc.quantity}
                      onChange={(e) =>
                        updateService(index, {
                          quantity: Number(e.target.value),
                        })
                      }
                      className="w-20 p-2 border border-gray-300 focus:outline-none focus:border-black"
                    />
                    {form.services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 font-bold text-xl"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Custom Service Fields */}
                  {svc.serviceId === "custom" && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pl-1">
                      <div>
                        <input
                          type="text"
                          placeholder="Service name"
                          value={svc.customName || ""}
                          onChange={(e) =>
                            updateService(index, { customName: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Price"
                          value={svc.customPrice || ""}
                          onChange={(e) =>
                            updateService(index, {
                              customPrice: Number(e.target.value),
                            })
                          }
                          className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Price & Discount Section */}
            <div className="space-y-3">
              {!showDiscount && (
                <button
                  type="button"
                  onClick={() => setShowDiscount(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Discount
                </button>
              )}

              {showDiscount && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">
                        Discount
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDiscount(false);
                          setForm((f) => ({ ...f, discount: 0 }));
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      name="discount"
                      type="text"
                      value={`Rp ${form.discount.toLocaleString("id-ID")}`}
                      onChange={onChange}
                      className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total
                  </label>
                  <input
                    type="text"
                    value={`Rp ${calculateTotal.toLocaleString("id-ID")}`}
                    readOnly
                    className="w-full p-3 border border-gray-300 bg-gray-100 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                >
                  <option value="cash">Cash</option>
                  <option value="transfer_bank">Transfer Bank</option>
                  <option value="e-wallet">E-Wallet</option>
                </select>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={3}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Additional notes"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {editingVisit ? "Update Report" : "Save Report"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
                <th className="text-left px-3 py-2">Service</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-left px-3 py-2">Payment</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Dentist</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id || i} className="border-t">
                    <td className="px-3 py-2">
                      {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-3 py-2">{r.patientName}</td>
                    <td className="px-3 py-2">
                      {r.services
                        ?.map((vs: any) => vs.customName || vs.service?.name)
                        .join(", ") || "N/A"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      Rp {Number(r.total).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2">{r.paymentMethod}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.createdBy?.name || r.doctor?.name || "-"}
                    </td>
                    <td className="px-3 py-2">
                      {userInfo && r.createdByUserId === userInfo.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(r)}
                            className="text-gray-600 hover:text-gray-800 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">Read only</span>
                      )}
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
