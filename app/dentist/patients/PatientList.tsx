"use client";

import { useState } from "react";
import PatientForm from "./PatientForm";

type Patient = {
  id: number;
  name: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  phoneNumber: string;
  medicalHistory?: string;
};

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const loadPatients = async () => {
    try {
      const response = await fetch("/api/patients");
      const data = await response.json();
      setPatients(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading patients:", error);
      setIsLoading(false);
    }
  };

  useState(() => {
    loadPatients();
  });

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleSave = async (patientData: Omit<Patient, "id">) => {
    try {
      const url = editingPatient 
        ? `/api/patients?id=${editingPatient.id}`
        : "/api/patients";
      
      const response = await fetch(url, {
        method: editingPatient ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        throw new Error("Failed to save patient");
      }

      loadPatients();
      setShowForm(false);
      setEditingPatient(null);
    } catch (error) {
      console.error("Error saving patient:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleAddPatient}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Patient
        </button>
      </div>

      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{patient.name}</h3>
              <p className="text-sm text-gray-600">
                Phone: {patient.phoneNumber}
              </p>
            </div>
            <button
              onClick={() => handleEditPatient(patient)}
              className="text-blue-500 hover:text-blue-600"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}