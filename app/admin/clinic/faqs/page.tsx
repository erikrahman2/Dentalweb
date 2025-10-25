"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FAQ {
  q: string;
  a: string;
}

export default function FAQsAdminPage() {
  const [data, setData] = useState<FAQ[]>([]);
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
      setData(result.faqs || []);
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
      const updatedData = { ...currentData, faqs: data };

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

  const addToArray = (item: FAQ) => {
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
            className="font-black hover:underline mb-1 inline-block text-m"
          >
            Back←
          </Link>
          <h1 className="text-2xl font-bold">FAQs Management</h1>
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

      {/* FAQs Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Frequently Asked Questions
        </h2>
        {data.map((faq, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Question</label>
              <input
                type="text"
                value={faq.q}
                onChange={(e) => updateArrayItem(index, "q", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <textarea
                value={faq.a}
                onChange={(e) => updateArrayItem(index, "a", e.target.value)}
                rows={2}
                className="w-full p-2 border rounded"
              />
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
          onClick={() => addToArray({ q: "", a: "" })}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add FAQ
        </button>
      </div>
    </div>
  );
}
