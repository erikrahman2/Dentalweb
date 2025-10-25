"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AboutData {
  title: string;

  description: string;
  values: string[];
}

export default function AboutAdminPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/clinic-info");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setData(result.about);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      // Fetch current data to merge
      const res = await fetch("/api/clinic-info");
      const currentData = await res.json();
      const updatedData = { ...currentData, about: data };

      const saveRes = await fetch("/api/clinic-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!saveRes.ok) throw new Error("Failed to save");
      alert("Saved successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateData = (field: string, value: any) => {
    setData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error loading data</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/admin/clinic"
            className="font-black hover:underline mb-1 inline-block text-m"
          >
            Back←
          </Link>
          <h1 className="text-2xl font-bold">About Us Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto px-6 py-2 border-2 border-black font-medium hover:bg-black hover:text-white transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
      )}

      {/* About Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">About Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateData("title", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => updateData("description", e.target.value)}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Values (comma separated)
            </label>
            <input
              type="text"
              value={data.values.join(", ")}
              onChange={(e) =>
                updateData(
                  "values",
                  e.target.value.split(", ").map((v) => v.trim())
                )
              }
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
