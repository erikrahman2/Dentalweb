import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DentistReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "DOCTOR") {
    redirect("/login");
  }

  return children;
}
