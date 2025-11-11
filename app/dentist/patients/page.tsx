"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// Types for Service and Visit creation
type Service = {
  id: string;
  name: string;
  price: number;
};

type VisitServicePayload = {
  serviceId?: string;
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

type VisitService = {
  serviceId: string;
  quantity: number;
  customName?: string;
  customPrice?: number;
  service?: {
    name: string;
  };
};

type Visit = VisitPayload & {
  id: string;
  total: number;
  services: VisitService[];
  createdBy?: {
    name: string;
  };
  doctor?: {
    name: string;
  };
};

export default function PatientRecordsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<Visit[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitPayload | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

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
        total += (svc.customPrice || 0) * svc.quantity;
      } else if (svc.serviceId) {
        const service = services.find((s) => s.id === svc.serviceId);
        if (service) {
          total += Number(service.price) * svc.quantity;
        }
      }
    }
    return Math.max(0, total - form.discount);
  }, [services, form.services, form.discount]);

  useEffect(() => {
    fetch("/api/services?isActive=true")
      .then((r) => r.json())
      .then((data) => setServices(data));
  }, []);

  const fetchVisits = useCallback(async () => {
    const params = new URLSearchParams();
    if (searchName) params.append("patientName", searchName);
    if (searchDate) params.append("date", searchDate);
    const res = await fetch(`/api/visits?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data);
    }
  }, [searchName, searchDate]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

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
    update: Partial<VisitServicePayload>
  ) => {
    setForm((f) => ({
      ...f,
      services: f.services.map((svc, i) =>
        i === index ? { ...svc, ...update } : svc
      ),
    }));
  };

  const cancelEdit = () => {
    setEditingVisit(null);
    setIsAddingNew(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Basic form validation
      if (!form.patientName.trim()) {
        throw new Error("Patient name is required");
      }

      // Validate services
      const validServices = form.services.filter((s) => s.serviceId !== "");
      if (validServices.length === 0) {
        throw new Error("Please select at least one service");
      }

      // Validate each service
      validServices.forEach((service, index) => {
        if (service.serviceId === "custom") {
          if (!service.customName?.trim()) {
            throw new Error(
              `Service #${index + 1}: Custom service name is required`
            );
          }
          if (!service.customPrice || service.customPrice <= 0) {
            throw new Error(
              `Service #${
                index + 1
              }: Custom service price must be greater than 0`
            );
          }
        }
        if (!service.quantity || service.quantity <= 0) {
          throw new Error(
            `Service #${index + 1}: Quantity must be greater than 0`
          );
        }
      });

      const payload: VisitPayload = {
        patientName: form.patientName,
        services: validServices
          .map((s) => {
            if (s.serviceId === "custom") {
              if (!s.customName || !s.customPrice) {
                throw new Error("Custom service requires name and price");
              }
              return {
                serviceId: "custom",
                quantity: Number(s.quantity),
                customName: s.customName,
                customPrice: Number(s.customPrice),
              };
            }
            return {
              serviceId: s.serviceId,
              quantity: Number(s.quantity) || 1,
            };
          })
          .filter((service) =>
            service.serviceId === "custom"
              ? service.customName && service.customPrice
              : service.serviceId
          ),
        paymentMethod: form.paymentMethod || "cash",
        status: form.status || "paid",
        notes: form.notes || "",
        discount: Number(form.discount) || 0,
        date: form.date || new Date().toISOString().split("T")[0],
      };

      const method = editingVisit ? "PUT" : "POST";
      const url = editingVisit
        ? `/api/visits?id=${editingVisit.id}`
        : "/api/visits";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.error?.fieldErrors) {
          const fieldErrors = error.error.fieldErrors;
          const errorMessage = Object.entries(fieldErrors)
            .map(
              ([field, errors]) =>
                `${field}: ${(errors as string[]).join(", ")}`
            )
            .join("\n");
          throw new Error(errorMessage);
        }
        throw new Error(error.message || "Failed to save");
      }

      cancelEdit();
      fetchVisits();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, patientName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the visit record for ${patientName}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/visits?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete visit");
      }

      await fetchVisits();
    } catch (error) {
      console.error(error);
      alert("Failed to delete visit");
    }
  };

  const handleEdit = (visit: Visit) => {
    setEditingVisit(visit);
    setForm({
      id: visit.id,
      patientName: visit.patientName,
      services: visit.services?.map((vs) => ({
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patient Reports</h1>
          <p className="text-gray-600">View patient visit reports</p>
        </div>
        <button
          onClick={() => {
            setIsAddingNew(true);
            setTimeout(() => {
              const element = document.getElementById("edit-form");
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }, 100);
          }}
          className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
        >
          + Add Patient Visit
        </button>
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
        </div>
      </div>

      {/* Input Form */}
      {(isAddingNew || editingVisit) && (
        <div
          id="edit-form"
          className="bg-gray-50 border border-gray-200 p-4 sm:p-6"
        >
          <h2 className="text-xl font-bold mb-4">
            {editingVisit ? "Edit Patient Visit" : "Add New Patient Visit"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={form.patientName}
                  onChange={onChange}
                  required
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="Patient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Services */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Services *</label>
                <button
                  type="button"
                  onClick={addService}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Service
                </button>
              </div>
              <div className="space-y-2">
                {form.services.map((service, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <select
                        value={service.serviceId}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            updateService(index, {
                              serviceId: "custom",
                              customName: "",
                              customPrice: 0,
                            });
                          } else {
                            updateService(index, {
                              serviceId: val,
                              customName: undefined,
                              customPrice: undefined,
                            });
                          }
                        }}
                        required
                        className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                      >
                        <option value="">Select service</option>
                        <option value="custom">Custom Service</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} - Rp{s.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    {service.serviceId === "custom" ? (
                      <>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={service.customName}
                            onChange={(e) =>
                              updateService(index, {
                                customName: e.target.value,
                              })
                            }
                            placeholder="Service name"
                            required
                            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={service.customPrice}
                            onChange={(e) =>
                              updateService(index, {
                                customPrice: Number(e.target.value),
                              })
                            }
                            placeholder="Price"
                            required
                            className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-5">
                        {service.serviceId && (
                          <div className="p-3 text-gray-600">
                            Price: Rp
                            {(
                              services.find((s) => s.id === service.serviceId)
                                ?.price || 0
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={service.quantity}
                        onChange={(e) =>
                          updateService(index, {
                            quantity: Math.max(1, Number(e.target.value)),
                          })
                        }
                        min="1"
                        required
                        className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {form.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Discount */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-medium">
                  Total: Rp{calculateTotal.toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDiscount(!showDiscount)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showDiscount ? "Remove Discount" : "Add Discount"}
                </button>
              </div>
              {showDiscount && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">
                    Discount Amount
                  </label>
                  <input
                    type="text"
                    name="discount"
                    value={`Rp${form.discount.toLocaleString()}`}
                    onChange={onChange}
                    className="w-full md:w-1/3 p-3 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <option value="transfer">Transfer</option>
                  <option value="debit">Debit Card</option>
                </select>
              </div>
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
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={3}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {submitting
                  ? "Saving..."
                  : editingVisit
                  ? "Update report"
                  : "add report"}
              </button>
            </div>
          </form>
        </div>
      )}

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
                <th className="text-center px-3 py-2">Actions</th>
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
                rows.map((visit) => (
                  <tr key={visit.id || visit.patientName} className="border-t">
                    <td className="px-3 py-2">
                      {visit.date
                        ? new Date(visit.date).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-3 py-2">{visit.patientName}</td>
                    <td className="px-3 py-2 relative group">
                      <span className="cursor-pointer">
                        {visit.services
                          .map(
                            (vs) => {
                              const name = vs.customName || vs.service?.name || "Unknown";
                              return vs.quantity > 1 ? `${name} x${vs.quantity}` : name;
                            }
                          )
                          .join(", ")}
                      </span>
                      <div className="absolute left-0 top-full mt-1 bg-black text-white text-xs rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-max">
                        {visit.services.map((vs, idx) => {
                          const name = vs.customName || vs.service?.name || "Unknown";
                          const price = vs.customPrice || vs.service?.price || 0;
                          return (
                            <div key={idx}>
                              {name}: Qty {vs.quantity} - Rp{(price * vs.quantity).toLocaleString()}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      Rp {visit.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2">{visit.paymentMethod || "-"}</td>
                    <td className="px-3 py-2">{visit.status || "pending"}</td>
                    <td className="px-3 py-2">
                      {visit.doctor?.name || visit.createdBy?.name || "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(visit)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(visit.id, visit.patientName)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
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
