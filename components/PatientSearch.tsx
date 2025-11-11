"use client";

import { useState, useRef, useEffect } from "react";
import { useDebounce } from "use-debounce";

interface Patient {
  id: string;
  name: string;
}

interface PatientSearchProps {
  onSelect: (patient: Patient) => void;
  className?: string;
}

export default function PatientSearch({
  onSelect,
  className = "",
}: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function searchPatients() {
      if (!debouncedSearch) {
        setPatients([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/visits/patients?search=${encodeURIComponent(debouncedSearch)}`
        );
        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error("Error searching patients:", error);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    }

    searchPatients();
  }, [debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (patient: Patient) => {
    onSelect(patient);
    setSearchTerm(patient.name);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Search patient name..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {showSuggestions && (searchTerm || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : patients.length > 0 ? (
            <ul className="py-2">
              {patients.map((patient) => (
                <li
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {patient.name}
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500">
              No patients found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
