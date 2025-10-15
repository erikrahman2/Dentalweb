"use server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  return session;
}
