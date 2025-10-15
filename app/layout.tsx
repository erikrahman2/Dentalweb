import "../styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import DynamicTitle from "../components/DynamicTitle";

// Font lokal General Sans
const generalSans = localFont({
  src: [
    {
      path: "../public/fonts/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/GeneralSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/GeneralSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Noerdental",
  description: "Informasi klinik dan layanan Noerdental",
};

import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout renders navigation for public pages; hidden automatically on /admin
  return (
    <html lang="id">
      <body className={generalSans.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
