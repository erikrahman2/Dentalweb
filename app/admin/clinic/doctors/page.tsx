"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Doctor {
  id?: number;
  name: string;
  email?: string;
  photo: string;
  joinDate: string;
  daysDone: string;
  hasPassword?: boolean;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
  };
}

export default function DoctorsAdminPage() {
  const [data, setData] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor-profiles");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setData(result || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (doctor: Doctor, index: number) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/doctor-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctor),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save");
      }

      const updatedDoctor = await res.json();

      // Update local state
      setData((prev) =>
        prev.map((d, i) =>
          i === index ? { ...updatedDoctor, hasPassword: d.hasPassword } : d
        )
      );

      if (doctor.email && !doctor.hasPassword) {
        setSuccess(
          `Doctor saved! OTP has been sent to ${doctor.email}. They can now set their password.`
        );
      } else {
        setSuccess("Doctor saved successfully!");
      }

      setEditingIndex(null);

      // Refresh data to get latest info
      setTimeout(() => fetchData(), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor: Doctor, index: number) => {
    if (!confirm(`Delete ${doctor.name}?`)) return;

    if (!doctor.id) {
      // Just remove from local state if not saved yet
      setData((prev) => prev.filter((_, i) => i !== index));
      setEditingIndex(null);
      return;
    }

    try {
      const res = await fetch(`/api/doctor-profiles?id=${doctor.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setData((prev) => prev.filter((_, i) => i !== index));
      setSuccess("Doctor deleted successfully!");
      setEditingIndex(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateArrayItem = (index: number, field: string, value: any) => {
    setData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addToArray = () => {
    const newIndex = data.length;
    setData((prev) => [
      ...prev,
      {
        name: "",
        email: "",
        photo: "",
        joinDate: "",
        daysDone: "",
      },
    ]);
    setEditingIndex(newIndex);
  };

  const handleFileUpload = async (file: File, index: number) => {
    setUploading(true);
    setError(null);
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
      updateArrayItem(index, "photo", result.imageUrl);
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file, index);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-3 px-3 sm:px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Link
            href="/admin/clinic"
            className="font-black hover:underline mb-1 inline-block text-m"
          >
            Back←
          </Link>
          <h1 className="text-3xl font-bold">Dentist Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Add email to create dentist login accounts
          </p>
        </div>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-3 border border-red-600 mb-2 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 bg-green-50 p-3 border border-green-600 mb-2 text-sm">
          {success}
        </div>
      )}

      {/* Doctors List */}
      <div className="space-y-0">
        {data.map((doctor, index) => (
          <div key={index}>
            {editingIndex === index ? (
              <div className="bg-gray-50 border-t border-gray-200 py-4 px-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-200 flex-shrink-0 overflow-hidden">
                      {doctor.photo && (
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={doctor.name}
                          onChange={(e) =>
                            updateArrayItem(index, "name", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 text-sm"
                          placeholder="Dentist name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Email (for login access)
                          {doctor.hasPassword && (
                            <span className="ml-2 text-green-600">
                              ✓ Account activated
                            </span>
                          )}
                        </label>
                        <input
                          type="email"
                          value={doctor.email || ""}
                          onChange={(e) =>
                            updateArrayItem(index, "email", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 text-sm"
                          placeholder="dentist@example.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {!doctor.hasPassword
                            ? "OTP will be sent to this email for password setup"
                            : "Login account is active"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Photo Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, index)}
                      className="w-full p-2 border border-gray-300 text-sm mb-2"
                      disabled={uploading}
                    />
                    {uploading && (
                      <p className="text-xs text-blue-600 mb-2">Uploading...</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Join Date
                      </label>
                      <input
                        type="month"
                        value={doctor.joinDate}
                        onChange={(e) =>
                          updateArrayItem(index, "joinDate", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Days Done
                      </label>
                      <input
                        type="text"
                        value={doctor.daysDone}
                        onChange={(e) =>
                          updateArrayItem(index, "daysDone", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 text-sm"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleSave(doctor, index)}
                      disabled={saving || !doctor.name}
                      className="px-3 py-1 bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="px-3 py-1 bg-gray-500 text-white text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(doctor, index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="border-t border-gray-200 py-4 px-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setEditingIndex(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-gray-400 font-medium text-sm pt-1 w-8">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="w-24 h-24 bg-gray-200 flex-shrink-0 overflow-hidden">
                    {doctor.photo ? (
                      <img
                        src={doctor.photo}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-2">
                      {doctor.name || "Unnamed Dentist"}
                    </h3>
                    {doctor.email && (
                      <p className="text-sm text-gray-600 mb-1">
                        📧 {doctor.email}{" "}
                        {doctor.hasPassword && (
                          <span className="text-green-600 font-medium">
                            (Active)
                          </span>
                        )}
                        {!doctor.hasPassword && (
                          <span className="text-orange-600 font-medium">
                            (Pending setup)
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm">
                      Join: {doctor.joinDate || "-"} | Days Done:{" "}
                      {doctor.daysDone || "-"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex gap-3 mt-2 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIndex(index);
                        }}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        EDIT →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={addToArray}
          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 text-sm font-semibold"
        >
          + Add Dentist
        </button>
      </div>
    </div>
  );
}
