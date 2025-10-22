# Role-Based Access Control (RBAC) - Setup Guide

## 📋 Ringkasan Sistem

Sistem RBAC ini memiliki 2 role utama:

1. **ADMIN** - Akses penuh ke seluruh sistem
2. **DOCTOR** (Dentist) - Akses terbatas ke halaman khusus dentist

## 🔐 Alur Kerja

### Admin

1. Login melalui `/login` dengan username & password
2. Akses ke:
   - `/admin/clinic` - Manage clinic info (ADMIN only)
   - `/admin/reports` - View reports (ADMIN only)
   - `/admin/clinic/dentists` - Manage dentists (ADMIN only)
   - `/admin/services` - Manage services (All roles)

### Dentist

1. Admin mendaftarkan dentist melalui `/admin/clinic/dentists`
2. Dentist menerima OTP via email
3. Dentist setup password di `/setup-password` menggunakan email + OTP
4. Login melalui `/login` dengan email & password
5. Akses ke:
   - `/dentist` - Dentist dashboard (DOCTOR only)
   - `/dentist/visits` - My visits
   - `/dentist/schedule` - My schedule
   - `/dentist/profile` - My profile

## 🗄️ Perubahan Database Schema

### Model User (Updated)

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String?  // Nullable untuk dentist yang belum setup password
  role         Role     @default(STAFF)
  isActive     Boolean  @default(true)  // Untuk enable/disable akses
  otp          String?  // Kode OTP untuk setup password
  otpExpiry    DateTime?  // Waktu kadaluarsa OTP (24 jam)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  visits       Visit[] @relation("createdVisits")
  doctorVisits Visit[] @relation("doctorVisits")
  createdDentists User[] @relation("AdminDentists")
  createdBy    User?   @relation("AdminDentists", fields: [createdById], references: [id])
  createdById  String?

  @@index([email])
  @@index([role])
  @@index([isActive])
}
```

## 🚀 Cara Setup

### 1. Install Dependencies (jika belum)

```bash
npm install bcryptjs jose
npm install -D @types/bcryptjs
```

### 2. Jalankan Migrasi

```bash
npx prisma migrate dev --name add_rbac_system
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Seed Admin User (Opsional)

Buat file seed untuk admin pertama:

```typescript
// prisma/seed.ts atau buat file terpisah
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@noerdental.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@noerdental.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Jalankan:

```bash
npx tsx prisma/seed.ts
```

### 5. Setup Environment Variable

Tambahkan di `.env`:

```
AUTH_SECRET=your-secret-key-here-change-this-in-production
```

### 6. Setup Email Service (untuk OTP)

Edit file `lib/email.ts` dan konfigurasi email service pilihan Anda:

- Nodemailer (SMTP)
- SendGrid
- Resend
- AWS SES
- dll

## 📁 File-file yang Dibuat

### Core Files

- ✅ `prisma/schema.prisma` - Updated schema
- ✅ `lib/auth.ts` - Updated dengan RBAC helpers
- ✅ `lib/email.ts` - Email utility untuk OTP
- ✅ `middleware.ts` - Updated dengan role-based protection

### API Routes

- ✅ `app/api/dentists/route.ts` - GET & POST dentists
- ✅ `app/api/dentists/[id]/route.ts` - GET, PATCH, DELETE dentist
- ✅ `app/api/dentists/[id]/resend-otp/route.ts` - Resend OTP
- ✅ `app/api/auth/setup-password/route.ts` - Setup password dengan OTP
- ✅ `app/api/auth/login/route.ts` - Updated untuk support DOCTOR

### Admin Pages

- ✅ `app/admin/layout.tsx` - Updated dengan conditional navigation
- ✅ `app/admin/clinic/dentists/page.tsx` - Manage dentists

### Dentist Pages

- ✅ `app/setup-password/page.tsx` - Setup password form
- ✅ `app/dentist/page.tsx` - Dentist dashboard

## 🧪 Testing

### 1. Test Admin Login

- URL: `/login`
- Email: `admin@noerdental.com`
- Password: `admin123` (atau sesuai seed)

### 2. Test Register Dentist

- Login sebagai admin
- Buka `/admin/clinic/dentists`
- Klik "Add Dentist"
- Isi nama dan email
- Cek console untuk OTP (development mode)

### 3. Test Setup Password Dentist

- Buka `/setup-password`
- Isi email, OTP, dan password
- Klik "Set Password & Login"
- Akan redirect ke `/dentist`

### 4. Test Dentist Login

- Logout dari admin
- Login dengan email dentist dan password yang dibuat
- Akan masuk ke dashboard dentist

## 🔒 Access Control Matrix

| Route/Feature     | ADMIN | DOCTOR | STAFF |
| ----------------- | ----- | ------ | ----- |
| `/admin/clinic/*` | ✅    | ❌     | ❌    |
| `/admin/reports`  | ✅    | ❌     | ❌    |
| `/admin/services` | ✅    | ✅     | ✅    |
| `/dentist/*`      | ❌    | ✅     | ❌    |
| Manage dentists   | ✅    | ❌     | ❌    |
| View reports      | ✅    | ❌     | ❌    |

## 🎯 Next Steps

1. **Email Service**: Konfigurasi email service untuk production
2. **Password Reset**: Tambahkan fitur forgot password
3. **Audit Log**: Track siapa melakukan apa dan kapan
4. **2FA**: Two-factor authentication untuk admin
5. **Session Management**: Timeout dan force logout
6. **Dentist Features**: Implement fitur-fitur di dashboard dentist

## ⚠️ Security Notes

1. **OTP Expiry**: OTP berlaku 24 jam, hapus yang expired secara periodik
2. **Password Policy**: Minimal 6 karakter (bisa ditingkatkan)
3. **Session**: Token JWT berlaku 7 hari
4. **isActive Flag**: Gunakan untuk soft delete / disable access
5. **HTTPS**: Wajib di production untuk security
6. **Rate Limiting**: Tambahkan rate limiting untuk API endpoints

## 📝 Troubleshooting

### OTP tidak terkirim

- Check console log di development mode
- Verify email service configuration
- Check email spam folder

### Dentist tidak bisa login

- Pastikan password sudah diset
- Check isActive = true
- Verify email dan password

### Access Denied

- Check role user di database
- Verify middleware configuration
- Check session token valid

## 💡 Tips

- Development mode: OTP akan muncul di console
- Production: Gunakan email service yang reliable
- Monitor failed login attempts
- Regularly backup database
- Test role permissions thoroughly

---

**Created by**: Zencoder AI Assistant
**Date**: 2024
**Version**: 1.0.0
