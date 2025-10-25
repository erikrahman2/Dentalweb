import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminIndexPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Redirect based on role
  if (session.role === "DOCTOR") {
    redirect("/dentist");
  }

  if (session.role === "ADMIN") {
    redirect("/admin/clinic");
  }

  // Default redirect to reports
  redirect("/admin/reports");
}
