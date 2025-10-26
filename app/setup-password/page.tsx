"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState(() => ({
    email: searchParams.get("email") || "",
    otp: searchParams.get("otp") || "",
    password: "",
    confirmPassword: "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to set password");
        return;
      }

      // Redirect ke dentist dashboard
      alert("Password set successfully! Redirecting to your dashboard...");
      router.push("/dentist");
    } catch (error) {
      setError("Failed to set password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 max-w-md w-full border-2 border-black shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Setup Your Password
          </h1>
          <p className="text-gray-600">
            Enter the OTP sent to your email and create a password
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-black font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={formData.otp}
              onChange={(e) =>
                setFormData({ ...formData, otp: e.target.value })
              }
              className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="123456"
              maxLength={6}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Check your email for the 6-digit code
            </p>
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">
              New Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-black font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white px-6 py-4 font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? "Setting Password..." : "Set Password & Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have a password?{" "}
            <a
              href="/login"
              className="text-black font-semibold hover:underline"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
