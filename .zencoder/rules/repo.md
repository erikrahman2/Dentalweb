# Repo Overview: Noer Dental

## Stack & Arsitektur

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **API**: Next.js API Routes (tanpa Express)
- **DB/ORM**: MySQL/MariaDB + Prisma
- **Auth**: Auth.js (Credentials) — opsional; saat ini disable untuk fase Informasi Klinik & Layanan
- **Validasi**: Zod
- **Ekspor**: exceljs (direncanakan untuk phase berikutnya)

## Fase Pengembangan

- **Fase 1 (aktif)**: Informasi klinik & daftar layanan (read-only)
- **Fase 2 (opsional)**: Admin panel (CRUD layanan, input kunjungan/visit harian, ekspor Excel)

## Rencana Struktur Proyek

- `/app` — App Router pages & API routes
- `/app/(public)` — Halaman publik: `/` (info klinik), `/services`
- `/app/api` — API routes (GET untuk fase 1)
- `/prisma/schema.prisma` — Definisi skema
- `/lib/prisma.ts` — Singleton Prisma Client
- `/styles/globals.css` — Tailwind entry

## Model Data (fase 1)

- **ClinicInfo**: name, address, phone, email, description
- **Service**: name, description, category, price, isActive

## Catatan Setup

- ENV: buat `.env` dengan `DATABASE_URL` (MySQL/MariaDB)
- Jalankan migrasi Prisma dan seed awal (clinic info & beberapa layanan)

## Perintah Umum

- `npm install` / `pnpm install`
- `npx prisma migrate dev`
- `npm run dev`

## Roadmap Singkat

- Tambah Admin (Auth + RBAC)
- CRUD Layanan & Visit harian
- Ekspor Excel (single & per kategori)
