"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GalleryItem {
  before: string;
  after: string;
  label: string;
}

export default function GalleryAdminPage() {
  const [data, setData] = useState<GalleryItem[]>([]);
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
      setData(result.gallery || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Fetch current data to merge
      const res = await fetch("/api/clinic-info");
      const currentData = await res.json();
      const updatedData = { ...currentData, gallery: data };

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

  const updateArrayItem = (index: number, field: string, value: any) => {
    setData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addToArray = (item: GalleryItem) => {
    setData((prev) => [...prev, item]);
  };

  const removeFromArray = (index: number) => {
    setData((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/admin/clinic"
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Clinic Overview
          </Link>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
      )}

      {/* Gallery Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>
        {data.map((item, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Before</label>
                <input
                  type="text"
                  value={item.before}
                  onChange={(e) =>
                    updateArrayItem(index, "before", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">After</label>
                <input
                  type="text"
                  value={item.after}
                  onChange={(e) =>
                    updateArrayItem(index, "after", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    updateArrayItem(index, "label", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              onClick={() => removeFromArray(index)}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
        <button
          onClick={() => addToArray({ before: "", after: "", label: "" })}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Gallery Item
        </button>
      </div>
    </div>
  );
}
