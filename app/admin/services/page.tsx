"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string | null;
  highlightDescription: string | null;
  price: number;
  category: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    highlightDescription: "",
    price: 0,
    category: "",
    imageUrl: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load services from API
  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data.map(normalizeService) : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const normalizeService = (raw: unknown): Service => {
    const service = raw as Record<string, unknown>;
    return {
      id: String(service.id),
      name: service.name ? String(service.name) : "",
      description: service.description ? String(service.description) : null,
      highlightDescription: service.highlightDescription
        ? String(service.highlightDescription)
        : null,
      price:
        typeof service.price === "number"
          ? service.price
          : Number(service.price ?? 0),
      category: service.category ? String(service.category) : null,
      imageUrl: service.imageUrl ? String(service.imageUrl) : null,
      isActive: Boolean(service.isActive),
    };
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMsg(`Upload failed: ${message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await handleFileUpload(file);
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl }));
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        highlightDescription: formData.highlightDescription.trim() || null,
        category: formData.category.trim() || null,
        price: Number(formData.price),
        imageUrl: formData.imageUrl || null,
        isActive: formData.isActive,
      };

      if (!payload.name || isNaN(payload.price)) {
        setErrorMsg("Name and valid price are required");
        return;
      }

      if (editingService) {
        const res = await fetch("/api/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingService.id, ...payload }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || "Failed to update service");
        setEditingService(null);
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, isActive: true }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || "Failed to create service");
        setIsAddingNew(false);
      }

      await fetchServices();

      setFormData({
        name: "",
        description: "",
        highlightDescription: "",
        price: 0,
        category: "",
        imageUrl: "",
        isActive: true,
      });
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Unknown error";
      setErrorMsg(message || "Operation failed. Please try again.");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description ?? "",
      highlightDescription: service.highlightDescription ?? "",
      price: service.price,
      category: service.category ?? "",
      imageUrl: service.imageUrl ?? "",
      isActive: service.isActive,
    });
    setIsAddingNew(true);
    setTimeout(() => {
      const element = document.getElementById("edit-form");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to delete service");
      await fetchServices();
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Unknown error";
      setErrorMsg(message || "Delete failed. Please try again.");
    }
  };

  const cancelEdit = () => {
    setIsAddingNew(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      highlightDescription: "",
      price: 0,
      category: "",
      imageUrl: "",
      isActive: true,
    });
    setErrorMsg(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header */}
      <Link
        href="/admin/clinic"
        className="font-black hover:underline mb-1 inline-block text-m"
      >
        Back←
      </Link>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Services Management</h1>
          <p className="text-gray-800">Manage your dental services</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="w-full md:w-auto px-6 py-2 border-2 border-black font-medium hover:bg-black hover:text-white transition-colors"
        >
          + Add New Service
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Loading services...</div>
      )}
      {errorMsg && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3">
          {errorMsg}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAddingNew || editingService) && (
        <div
          id="edit-form"
          className="bg-gray-50 border border-gray-200 p-4 sm:p-6"
        >
          <h2 className="text-xl font-bold mb-4">
            {editingService ? "Edit Service" : "Add New Service"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="Orthodontic">Orthodontic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  name="price"
                  value={`Rp ${
                    formData.price === 0
                      ? "0"
                      : formData.price.toLocaleString("id-ID")
                  }`}
                  onChange={(e) => {
                    const val = e.target.value
                      .replace(/^Rp\s*/, "")
                      .replace(/[^\d]/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      price: val ? Number(val) : 0,
                    }));
                  }}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                  required
                />
              </div>

              {editingService && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.value === "true",
                      }))
                    }
                    className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Service Image
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-blue-600">Uploading...</p>
                )}
                {formData.imageUrl && (
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 shrink-0">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        sizes="96px"
                        className="object-cover rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, imageUrl: "" }))
                      }
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Highlight Description
              </label>
              <textarea
                name="highlightDescription"
                value={formData.highlightDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Brief engaging description for cards"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Detailed description for service page"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto px-6 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {editingService ? "Update Service" : "Add Service"}
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

      {/* Services List - Horizontal Layout */}
      <div className="space-y-4">
        {services.map((service, index) => (
          <article
            key={service.id}
            className={`bg-white  border-t border-gray-300 hover:bg-gray-50 transition-colors ${
              !service.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex gap-4 p-4">
              {/* Number */}
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-sm font-medium text-gray-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Image */}
              <div className="flex-shrink-0 w-20 h-20 bg-gray-200 overflow-hidden">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {service.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.highlightDescription ||
                    "Professional dental service"}
                </p>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Price</div>
                  <div className="text-sm font-bold text-gray-900">
                    Rp {service.price.toLocaleString("id-ID")}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-xs px-3 py-1 text-gray-700 hover:bg-gray-200 transition-colors rounded flex items-center gap-1"
                  >
                    EDIT →
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-xs px-3 py-1 text-gray-700 hover:bg-gray-200 transition-colors rounded"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
