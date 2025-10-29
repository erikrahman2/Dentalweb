"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Dentist = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function DentistsManagementPage() {
  const router = useRouter();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpData, setOtpData] = useState({ otp: "", email: "" });

  useEffect(() => {
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      const res = await fetch("/api/dentists");
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/admin");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setDentists(data);
    } catch (error) {
      console.error("Error fetching dentists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDentist = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      console.log("1. Sending request to add dentist:", formData);

      const res = await fetch("/api/dentists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("2. Response received:", data);

      if (!res.ok) {
        setError(data.error || "Failed to add dentist");
        return;
      }

      // ✅ FIXED: Show OTP in modal
      if (data.otp) {
        console.log("3. ✅ OTP received:", data.otp);
        setOtpData({ otp: data.otp, email: formData.email });
        setShowOtpModal(true);
      } else {
        console.warn("⚠️ OTP not in response, check API route");
        alert("Dentist added successfully! Check server console for OTP.");
      }

      setShowAddModal(false);
      setFormData({ name: "", email: "" });
      fetchDentists();
    } catch (error) {
      console.error("❌ Error adding dentist:", error);
      setError("Failed to add dentist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${
          currentStatus ? "deactivate" : "activate"
        } this dentist?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/dentists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchDentists();
      }
    } catch (error) {
      alert("Failed to update dentist status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/dentists/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDentists();
        alert("Dentist deleted successfully");
      } else {
        alert("Failed to delete dentist");
      }
    } catch (error) {
      alert("Failed to delete dentist");
    }
  };

  const handleResendOTP = async (id: string, email: string) => {
    if (!confirm(`Resend OTP to ${email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/dentists/${id}/resend-otp`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Show OTP in modal instead of alert
        if (data.otp) {
          setOtpData({ otp: data.otp, email });
          setShowOtpModal(true);
        } else {
          alert("OTP resent successfully! Check server console.");
        }
      } else {
        alert(data.error || "Failed to resend OTP");
      }
    } catch (error) {
      alert("Failed to resend OTP");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("OTP copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black">Dentists Management</h1>
          <p className="text-gray-600 mt-2">
            Manage dentist accounts and access
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="border-2 border-black hover:text-white px-6 py-3 font-semibold hover:bg-black transition-colors"
        >
          + Add Dentist
        </button>
      </div>

      {/* Table */}
      <div className="border border-black overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-black">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-black">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-black">
                Email
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-black">
                Status
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-black">
                Password
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-black">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {dentists.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No dentists registered yet
                </td>
              </tr>
            ) : (
              dentists.map((dentist) => (
                <tr
                  key={dentist.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-black font-medium">
                    {dentist.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{dentist.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold ${
                        dentist.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {dentist.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold ${
                        dentist.hasPassword
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {dentist.hasPassword ? "Set" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          handleToggleActive(dentist.id, dentist.isActive)
                        }
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {dentist.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {!dentist.hasPassword && (
                        <button
                          onClick={() =>
                            handleResendOTP(dentist.id, dentist.email)
                          }
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          Resend OTP
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(dentist.id, dentist.name)}
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

      {/* Add Dentist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md w-full mx-4 border-2 border-black">
            <h2 className="text-2xl font-bold text-black mb-6">
              Add New Dentist
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddDentist}>
              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-black font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-black px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError("");
                    setFormData({ name: "", email: "" });
                  }}
                  className="flex-1 border border-black px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Dentist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ NEW: OTP Display Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md w-full mx-4 border-2 border-black">
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">
                ✅ Dentist Added Successfully!
              </h2>
              <p className="text-gray-600">
                Share this OTP with the dentist to setup their password
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-400 p-6 mb-6">
              <p className="text-sm text-gray-700 mb-2">Email:</p>
              <p className="font-semibold text-black mb-4">{otpData.email}</p>

              <p className="text-sm text-gray-700 mb-2">OTP Code:</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-black bg-white px-4 py-3 border-2 border-black flex-1 text-center tracking-wider">
                  {otpData.otp}
                </p>
                <button
                  onClick={() => copyToClipboard(otpData.otp)}
                  className="border-2 border-black px-4 py-3 hover:bg-black hover:text-white transition-colors"
                  title="Copy OTP"
                >
                  📋
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                ⏰ Valid for 24 hours
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong>
                <br />
                1. Send this OTP to the dentist
                <br />
                2. Ask them to visit <strong>/setup-password</strong>
                <br />
                3. They will enter their email and this OTP
                <br />
                4. Then create their password
              </p>
            </div>

            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtpData({ otp: "", email: "" });
              }}
              className="w-full bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
