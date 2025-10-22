# RBAC Architecture - Noer Dental

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE (/login)                     │
│                 Email + Password Authentication                 │
└────────────────────┬───────────────────┬────────────────────────┘
                     │                   │
                     │                   │
         ┌───────────▼──────────┐   ┌───▼──────────────────┐
         │   ADMIN ROLE         │   │   DOCTOR ROLE        │
         │   (Administrator)    │   │   (Dentist)          │
         └───────────┬──────────┘   └───┬──────────────────┘
                     │                   │
                     │                   │
    ┌────────────────▼─────────────┐    │
    │  ADMIN PORTAL (/admin)       │    │
    │                              │    │
    │  ✅ Clinic Info Management   │    │
    │  ✅ Reports & Analytics      │    │
    │  ✅ Dentist Management       │    │
    │  ✅ Services Management      │    │
    │  ✅ Visit Records            │    │
    └──────────────────────────────┘    │
                                        │
                         ┌──────────────▼──────────────┐
                         │ DENTIST PORTAL (/dentist)   │
                         │                             │
                         │  ✅ My Visits               │
                         │  ✅ My Schedule             │
                         │  ✅ My Profile              │
                         │  ❌ Clinic Settings         │
                         │  ❌ Reports                 │
                         └─────────────────────────────┘
```

## 🔄 User Flow Diagrams

### Admin Flow

```
┌─────────┐      ┌─────────┐      ┌──────────────┐
│ Login   │─────►│ Verify  │─────►│ Admin        │
│ Page    │      │ Admin   │      │ Dashboard    │
└─────────┘      │ Role    │      └──────┬───────┘
                 └─────────┘             │
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼────────┐   ┌──────▼──────┐   ┌────────▼────────┐
            │ Manage Clinic  │   │   Manage    │   │    Manage       │
            │ Info & Content │   │  Dentists   │   │    Reports      │
            └────────────────┘   └──────┬──────┘   └─────────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │ Register Dentist  │
                              │ - Enter Name      │
                              │ - Enter Email     │
                              │ - System sends OTP│
                              └───────────────────┘
```

### Dentist Registration & Setup Flow

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Admin        │       │ System       │       │ Dentist      │
│ Registers    │──────►│ Generates    │──────►│ Receives     │
│ Dentist      │       │ OTP          │       │ Email        │
└──────────────┘       └──────────────┘       └──────┬───────┘
                                                      │
                                                      │
                       ┌──────────────────────────────▼────────┐
                       │ Dentist Opens /setup-password         │
                       │ - Enter Email                         │
                       │ - Enter OTP (from email)              │
                       │ - Create Password                     │
                       │ - Confirm Password                    │
                       └──────────────┬────────────────────────┘
                                      │
                                      │
                       ┌──────────────▼────────────────┐
                       │ System Validates:             │
                       │ - OTP correct?                │
                       │ - OTP not expired?            │
                       │ - Password meets requirements?│
                       └──────────────┬────────────────┘
                                      │
                                      │
                       ┌──────────────▼────────────────┐
                       │ Password Set Successfully     │
                       │ Auto-login & Redirect to      │
                       │ /dentist Dashboard            │
                       └───────────────────────────────┘
```

### Dentist Login Flow

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│ Dentist     │       │ System       │       │ Dentist      │
│ Enters      │──────►│ Validates:   │──────►│ Dashboard    │
│ Email & Pass│       │ - Credentials│       │ /dentist     │
│             │       │ - isActive?  │       │              │
│             │       │ - Has Pass?  │       │              │
└─────────────┘       └──────────────┘       └──────────────┘
```

## 🔐 Authentication & Authorization Flow

```
┌────────────────────────────────────────────────────────────────┐
│                        HTTP REQUEST                            │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE (middleware.ts)                  │
│                                                                │
│  1. Check if route needs protection (/admin/* or /dentist/*)  │
│  2. Extract JWT token from cookie                             │
│  3. Verify token signature                                    │
│  4. Decode user role from token                               │
│  5. Check role permissions:                                   │
│     - /admin/clinic/* → ADMIN only                            │
│     - /admin/reports → ADMIN only                             │
│     - /dentist/* → DOCTOR only                                │
│     - /admin/services → All authenticated                     │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
              ┌──────────┴──────────┐
              │                     │
         ✅ Authorized         ❌ Denied
              │                     │
              ▼                     ▼
    ┌─────────────────┐    ┌───────────────┐
    │ Allow Access    │    │ Redirect to   │
    │ to Route        │    │ /login or     │
    │                 │    │ /admin        │
    └─────────────────┘    └───────────────┘
```

## 📊 Database Schema (User Model)

```
┌─────────────────────────────────────────────────────────────┐
│                        USER TABLE                           │
├─────────────────────────────────────────────────────────────┤
│ id             STRING (CUID)    Primary Key                 │
│ name           STRING           User full name              │
│ email          STRING           Unique email address        │
│ passwordHash   STRING?          Nullable (for new dentists) │
│ role           ENUM             ADMIN | DOCTOR | STAFF      │
│ isActive       BOOLEAN          Enable/disable access       │
│ otp            STRING?          6-digit code                │
│ otpExpiry      DATETIME?        OTP expiration (24h)        │
│ createdAt      DATETIME         Registration timestamp      │
│ updatedAt      DATETIME         Last update timestamp       │
│ createdById    STRING?          FK to User (who created)    │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Role Permissions Matrix

```
┌────────────────────────┬───────┬────────┬───────┐
│ Feature                │ ADMIN │ DOCTOR │ STAFF │
├────────────────────────┼───────┼────────┼───────┤
│ Clinic Info Management │   ✅   │   ❌   │   ❌   │
│ Homepage CMS           │   ✅   │   ❌   │   ❌   │
│ About Page CMS         │   ✅   │   ❌   │   ❌   │
│ FAQ Management         │   ✅   │   ❌   │   ❌   │
│ Gallery Management     │   ✅   │   ❌   │   ❌   │
│ Doctor Profiles Mgmt   │   ✅   │   ❌   │   ❌   │
├────────────────────────┼───────┼────────┼───────┤
│ Reports & Analytics    │   ✅   │   ❌   │   ❌   │
│ View All Visits        │   ✅   │   ❌   │   ❌   │
│ Export Data            │   ✅   │   ❌   │   ❌   │
├────────────────────────┼───────┼────────┼───────┤
│ Dentist Management     │   ✅   │   ❌   │   ❌   │
│ - Add Dentist          │   ✅   │   ❌   │   ❌   │
│ - Edit Dentist         │   ✅   │   ❌   │   ❌   │
│ - Delete Dentist       │   ✅   │   ❌   │   ❌   │
│ - Activate/Deactivate  │   ✅   │   ❌   │   ❌   │
│ - Resend OTP           │   ✅   │   ❌   │   ❌   │
├────────────────────────┼───────┼────────┼───────┤
│ Services Management    │   ✅   │   ✅   │   ✅   │
│ - View Services        │   ✅   │   ✅   │   ✅   │
│ - Add Service          │   ✅   │   ✅   │   ✅   │
│ - Edit Service         │   ✅   │   ✅   │   ✅   │
│ - Delete Service       │   ✅   │   ✅   │   ✅   │
├────────────────────────┼───────┼────────┼───────┤
│ Dentist Dashboard      │   ❌   │   ✅   │   ❌   │
│ - My Visits            │   ❌   │   ✅   │   ❌   │
│ - My Schedule          │   ❌   │   ✅   │   ❌   │
│ - My Profile           │   ❌   │   ✅   │   ❌   │
└────────────────────────┴───────┴────────┴───────┘
```

## 🛡️ Security Features

### 1. JWT Token Security

- **Algorithm**: HS256
- **Expiration**: 7 days
- **Storage**: HTTP-only cookie
- **SameSite**: lax
- **Secure**: true (production only)

### 2. Password Security

- **Hashing**: bcryptjs with salt rounds 10
- **Minimum Length**: 6 characters (configurable)
- **Storage**: Hashed in database, never plain text

### 3. OTP Security

- **Length**: 6 digits
- **Expiration**: 24 hours
- **One-time Use**: Cleared after successful password setup
- **Delivery**: Email only

### 4. Access Control

- **Middleware Protection**: Route-level authentication
- **Role Validation**: Server-side role checking
- **Active Status**: isActive flag for soft account deletion

### 5. Session Management

- **Token Validation**: Every request validated
- **Auto Logout**: On token expiration
- **Secure Cookie**: HTTP-only, no JavaScript access

## 📁 Project Structure

```
noerdental/
│
├── app/
│   ├── admin/
│   │   ├── clinic/
│   │   │   ├── dentists/
│   │   │   │   └── page.tsx          (Dentist Management)
│   │   │   ├── homepage/
│   │   │   ├── about/
│   │   │   ├── faqs/
│   │   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx              (Admin Only)
│   │   ├── services/
│   │   │   └── page.tsx              (All Roles)
│   │   └── layout.tsx                (Role-based Navigation)
│   │
│   ├── dentist/
│   │   ├── page.tsx                  (Dentist Dashboard)
│   │   ├── visits/
│   │   ├── schedule/
│   │   └── profile/
│   │
│   ├── setup-password/
│   │   └── page.tsx                  (OTP & Password Setup)
│   │
│   ├── login/
│   │   └── page.tsx                  (Unified Login)
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts          (Updated for DOCTOR)
│       │   └── setup-password/
│       │       └── route.ts          (OTP Verification)
│       │
│       └── dentists/
│           ├── route.ts              (GET, POST)
│           └── [id]/
│               ├── route.ts          (GET, PATCH, DELETE)
│               └── resend-otp/
│                   └── route.ts      (POST)
│
├── lib/
│   ├── auth.ts                       (JWT + RBAC Helpers)
│   ├── email.ts                      (OTP Email Service)
│   └── prisma.ts                     (DB Client)
│
├── middleware.ts                     (Route Protection)
│
├── prisma/
│   └── schema.prisma                 (Updated User Model)
│
└── .env.example                      (Config Template)
```

## 🚦 API Endpoints

### Authentication

```
POST   /api/auth/login            - Login (all roles)
POST   /api/auth/setup-password   - Setup password with OTP (dentist)
POST   /api/auth/logout           - Logout
```

### Dentist Management (Admin Only)

```
GET    /api/dentists              - List all dentists
POST   /api/dentists              - Register new dentist
GET    /api/dentists/[id]         - Get dentist details
PATCH  /api/dentists/[id]         - Update dentist
DELETE /api/dentists/[id]         - Delete dentist
POST   /api/dentists/[id]/resend-otp - Resend OTP
```

## 🎯 Implementation Checklist

- ✅ Database schema updated
- ✅ Auth library with RBAC helpers
- ✅ Middleware with role-based protection
- ✅ Email utility for OTP
- ✅ Admin: Dentist management page
- ✅ Admin: Updated layout with role display
- ✅ Dentist: Setup password page
- ✅ Dentist: Dashboard page
- ✅ API: Dentist CRUD endpoints
- ✅ API: OTP verification endpoint
- ✅ API: Login updated for DOCTOR role
- ✅ Documentation

## 📝 Next Implementation Phase

1. **Dentist Features**

   - My Visits page
   - My Schedule page
   - Profile management

2. **Email Service**

   - Choose provider (Nodemailer/SendGrid/Resend)
   - Configure SMTP/API
   - Email templates

3. **Security Enhancements**

   - Password reset flow
   - Rate limiting
   - Audit logging
   - 2FA (optional)

4. **Testing**
   - Unit tests for auth
   - Integration tests for RBAC
   - E2E tests for flows

---

**Architecture Version**: 1.0.0
**Last Updated**: 2024
**Maintained By**: Noer Dental Team
