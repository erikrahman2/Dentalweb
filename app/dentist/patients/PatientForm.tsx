"use client";

import { useState } from "react";

type Patient = {
  id: number;
  name: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  phoneNumber: string;
  medicalHistory?: string;
};

type PatientFormProps = {
  patient: Patient | null;
  onSave: (data: Omit<Patient, "id">) => void;
  onCancel: () => void;
};

export default function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState<Omit<Patient, "id">>({
    name: patient?.name || "",
    dateOfBirth: patient ? patient.dateOfBirth : new Date(),
    gender: patient?.gender || "male",
    address: patient?.address || "",
    phoneNumber: patient?.phoneNumber || "",
    medicalHistory: patient?.medicalHistory || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {patient ? "Edit Patient" : "Add New Patient"}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth.toISOString().split("T")[0]}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: new Date(e.target.value) })}
            required
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            required
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            rows={3}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Medical History</label>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {patient ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}