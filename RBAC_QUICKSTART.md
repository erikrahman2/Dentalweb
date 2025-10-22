# RBAC Quick Start Guide

## 🚀 Setup dalam 5 Menit

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Update Environment Variables

```bash
# Edit .env file dan pastikan ada:
AUTH_SECRET="your-secret-key-minimum-32-characters-long"
```

### Step 3: Jalankan Migrasi Database

```bash
npx prisma migrate dev --name add_rbac_system
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Seed Admin User

Jalankan di Prisma Studio atau manual query:

```sql
-- Login ke MySQL
INSERT INTO User (
  id,
  name,
  email,
  passwordHash,
  role,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'admin001',
  'Administrator',
  'admin@noerdental.com',
  -- Password: admin123
  '$2a$10$rXVwJd3GQZHj5YJx5vqGXO4pFqX8gU0qVZKGJJqZQZHj5YJx5vqGX',
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```

**Atau** buat file seed:

```typescript
// scripts/seed-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@noerdental.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@noerdental.com",
      passwordHash: password,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin user created:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Jalankan:

```bash
npx tsx scripts/seed-admin.ts
```

### Step 6: Start Development Server

```bash
npm run dev
```

### Step 7: Test Login

1. Buka `http://localhost:3000/login`
2. Email: `admin@noerdental.com`
3. Password: `admin123`

## 🧪 Test Scenario

### Test 1: Login sebagai Admin

```
1. Buka /login
2. Email: admin@noerdental.com
3. Password: admin123
4. Klik Login
5. ✅ Harus redirect ke /admin
6. ✅ Harus bisa akses /admin/clinic
7. ✅ Harus bisa akses /admin/reports
8. ✅ Harus bisa akses /admin/clinic/dentists
```

### Test 2: Register Dentist Baru

```
1. Login sebagai admin
2. Buka /admin/clinic/dentists
3. Klik "Add Dentist"
4. Isi:
   - Name: Dr. John Doe
   - Email: john@example.com
5. Klik "Add Dentist"
6. ✅ Success message muncul
7. ✅ Check console untuk OTP (dev mode)
```

### Test 3: Setup Password Dentist

```
1. Copy OTP dari console
2. Buka /setup-password (new tab/incognito)
3. Isi:
   - Email: john@example.com
   - OTP: [OTP dari console]
   - Password: dentist123
   - Confirm Password: dentist123
4. Klik "Set Password & Login"
5. ✅ Harus auto-login dan redirect ke /dentist
6. ✅ Dashboard dentist muncul
```

### Test 4: Login sebagai Dentist

```
1. Logout dari dentist
2. Buka /login
3. Email: john@example.com
4. Password: dentist123
5. Klik Login
6. ✅ Harus redirect ke /dentist (bukan /admin)
7. ❌ Tidak bisa akses /admin/clinic
8. ❌ Tidak bisa akses /admin/reports
9. ✅ Bisa akses /admin/services
```

### Test 5: Admin Disable Dentist

```
1. Login sebagai admin
2. Buka /admin/clinic/dentists
3. Klik "Deactivate" pada dentist
4. Dentist logout dan coba login lagi
5. ✅ Harus muncul error "Account is inactive"
```

### Test 6: Resend OTP

```
1. Login sebagai admin
2. Register dentist baru
3. Klik "Resend OTP" pada dentist yang belum setup password
4. ✅ OTP baru muncul di console
5. ✅ OTP lama tidak valid lagi
```

## 🔍 Troubleshooting

### Problem: Migration Error

```bash
# Reset database (WARNING: akan hapus semua data)
npx prisma migrate reset

# Atau drop dan recreate database manual di MySQL
```

### Problem: OTP tidak terlihat

```bash
# Check console server (terminal tempat npm run dev)
# OTP akan print di sana dalam development mode
```

### Problem: Cannot read properties of undefined (reading 'name')

```bash
# Session tidak valid, clear cookies
# Atau restart dev server
```

### Problem: Prisma Client Error

```bash
# Regenerate Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

## 📋 Checklist Sebelum Production

- [ ] Ganti `AUTH_SECRET` dengan random string yang kuat
- [ ] Setup email service (bukan console.log)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Setup rate limiting
- [ ] Setup error monitoring (Sentry, etc)
- [ ] Backup database strategy
- [ ] Test semua role permissions
- [ ] Security audit
- [ ] Performance testing

## 🎯 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Create & apply migration
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema without migration

# Seeding
npx tsx scripts/seed-admin.ts    # Seed admin user

# Testing
npm test                 # Run tests (if configured)
npm run lint             # Run ESLint
```

## 🔗 Quick Links

- **Admin Login**: `http://localhost:3000/login`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Dentist Management**: `http://localhost:3000/admin/clinic/dentists`
- **Setup Password**: `http://localhost:3000/setup-password`
- **Dentist Dashboard**: `http://localhost:3000/dentist`
- **Prisma Studio**: `http://localhost:5555` (run `npx prisma studio`)

## 💡 Tips

1. **Development Mode**: OTP akan print di console server, tidak kirim email
2. **Multiple Sessions**: Gunakan incognito/private window untuk test multi-user
3. **Reset Password**: Belum ada forgot password, reset manual di database jika lupa
4. **Active Status**: Gunakan toggle Active/Inactive di dentist management
5. **Role Testing**: Gunakan browser profiles berbeda untuk test role secara bersamaan

## 🐛 Debug Mode

Tambahkan di `.env` untuk debug:

```bash
DEBUG=true
LOG_LEVEL=debug
```

## 📞 Support

Jika ada masalah:

1. Check console browser (F12)
2. Check console server (terminal)
3. Check Prisma Studio untuk data
4. Review dokumentasi lengkap di `RBAC_SETUP.md`

---

**Happy Coding! 🚀**
