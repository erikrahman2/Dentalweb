"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HomepageData {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;

  aboutTitle: string;
  aboutDescription: string;
}

const defaultHomepage: HomepageData = {
  heroTitle: "Senyum Percaya Diri di NOERDENTAL",
  heroSubtitle: "Hai! Senang banget kamu mampir ke NOERDENTAL CLINIC.",
  heroDescription:
    "Kami tahu, ke dokter gigi sering bikin deg-degan, tapi tenang… di sini suasananya nyaman dan santai kok. Dokter dan tim kami siap membantu mulai dari perawatan ringan sampai estetik biar senyummu makin pede. Yuk, booking jadwal sekarang dan rasain sendiri perbedaannya!",
  heroImage: "/uploads/hero.jpg",
  aboutTitle:
    "NOERDENTAL Clinic adalah salah satu klinik dokter gigi terbaik di daerah pesisir selatan yang berkomitmen untuk terus berusaha memberikan pelayanan, kualitas kerja, dan fasilitas yang melebihi ekspektasi pasien.",
  aboutDescription:
    "NOERDENTAL Clinic adalah salah satu klinik dokter gigi terbaik di daerah pesisir selatan yang berkomitmen untuk terus berusaha memberikan pelayanan, kualitas kerja, dan fasilitas yang melebihi ekspektasi pasien.",
};

export default function HomepageAdminPage() {
  const [data, setData] = useState<HomepageData>(defaultHomepage);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/clinic-info");
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setData({ ...defaultHomepage, ...result.homepage });
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
      const updatedData = { ...currentData, homepage: data };

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

  const handleFileUpload = async (file: File) => {
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      updateData("heroImage", result.imageUrl);
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
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
          <h1 className="text-2xl font-bold">Homepage Settings</h1>
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

      {/* Homepage Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Homepage Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hero Title</label>
            <input
              type="text"
              value={data.heroTitle}
              onChange={(e) => updateData("heroTitle", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={data.heroSubtitle}
              onChange={(e) => updateData("heroSubtitle", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hero Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded mb-2"
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-blue-600 mb-2">Uploading...</p>
            )}
            {data.heroImage && (
              <div className="mb-2">
                <img
                  src={data.heroImage}
                  alt="Hero preview"
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Hero Description
            </label>
            <textarea
              value={data.heroDescription}
              onChange={(e) => updateData("heroDescription", e.target.value)}
              rows={4}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              About Title
            </label>
            <input
              type="text"
              value={data.aboutTitle}
              onChange={(e) => updateData("aboutTitle", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              About Description
            </label>
            <textarea
              value={data.aboutDescription}
              onChange={(e) => updateData("aboutDescription", e.target.value)}
              rows={4}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
