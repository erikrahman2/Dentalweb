"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ 
  className, 
  children 
}: { 
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      
      if (data.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback to login page even if there's an error
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 ${className || ""}`}
    >
      {children || "Logout"}
    </button>
  );
}