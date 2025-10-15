HEAD

# Noerdental

Next.js 14 + TypeScript + Tailwind + Prisma (MySQL) untuk informasi klinik & layanan.

## Setup Cepat

1. Salin `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL` (MySQL/MariaDB).
2. Install dependencies:
   - npm install
3. Generate Prisma Client & migrasi:
   - npx prisma generate
   - npx prisma migrate dev --name init
4. Seed data contoh:
   - npm run prisma:seed
5. Jalankan dev server:
   - npm run dev

## Struktur

- app/
  - page.tsx (Beranda/Info klinik)
  - services/page.tsx (Daftar layanan)
  - api/clinic/route.ts (GET info klinik)
  - api/services/route.ts (GET layanan aktif)
- prisma/schema.prisma (model data)
- lib/prisma.ts (singleton client)
- styles/globals.css (Tailwind)

## Catatan

- Fase 1: read-only. Untuk Admin & Ekspor Excel akan ditambahkan pada fase berikutnya.

# Dentalweb

d3ab30feb40f7ae1906b7de6cd33e1393c67c48c
