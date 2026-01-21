# @axis/web

> Next.js 16 web application for AXIS ERP

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)](https://nextjs.org/)
[![Turbopack](https://img.shields.io/badge/Turbopack-Enabled-EF4444)](https://turbo.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

[← Back to root](../../README.md)

---

## Overview

Multi-tenant SaaS application with:
- Path-based multi-tenancy (`/:tenant-slug/*`)
- Neon Auth integration
- Team management, billing, API keys
- Audit logging

---

## Quick Start

```bash
# From repo root
pnpm install

# Set up environment
cp .envsamplelocal .env.local
# Edit with your credentials

# Run development server
pnpm --filter @axis/web dev

# Opens at http://localhost:3000
```

---

## Directory Structure

```
apps/web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth routes (grouped)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── onboarding/
│   │   │   ├── invite/
│   │   │   └── account/
│   │   ├── [tenant]/             # Tenant routes (dynamic)
│   │   │   ├── page.tsx          # Dashboard
│   │   │   └── settings/
│   │   │       ├── page.tsx      # General settings
│   │   │       ├── team/         # Team management
│   │   │       ├── api-keys/     # API key management
│   │   │       ├── billing/      # Stripe billing
│   │   │       └── audit-log/    # Audit log viewer
│   │   ├── api/
│   │   │   ├── auth/[...all]/    # Neon Auth routes
│   │   │   ├── health/           # Health check
│   │   │   ├── upload/           # File upload (R2)
│   │   │   ├── validate-key/     # API key validation
│   │   │   └── webhooks/stripe/  # Stripe webhooks
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── error.tsx             # Error boundary
│   │   └── not-found.tsx         # 404 page
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components
│   │   ├── theme-provider.tsx
│   │   └── workspace-switcher.tsx
│   │
│   └── lib/                      # Shared utilities
│       ├── actions/              # Server actions
│       │   ├── auth.ts
│       │   ├── tenant.ts
│       │   ├── team.ts
│       │   ├── api-keys.ts
│       │   ├── billing.ts
│       │   └── account.ts
│       ├── auth/                 # Auth utilities
│       │   ├── config.ts         # Neon Auth config
│       │   └── session.ts        # Session helpers
│       ├── db/                   # Database queries
│       │   ├── index.ts          # DB client
│       │   ├── tenants.ts
│       │   ├── users.ts
│       │   └── audit.ts
│       ├── email/                # Email service
│       │   ├── index.ts          # Resend client
│       │   └── templates.ts      # Email templates
│       ├── billing/              # Stripe integration
│       └── storage/              # R2 file storage
│
├── db/
│   └── schema.sql                # PostgreSQL schema
│
├── middleware.ts                 # Request middleware
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
└── tsconfig.json                 # TypeScript config
```

---

## Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Home/landing page |
| `/login` | Sign in |
| `/register` | Sign up |
| `/forgot-password` | Request password reset |
| `/reset-password` | Reset password (with token) |
| `/invite` | Accept team invitation |

### Protected Routes

| Route | Description | Roles |
|-------|-------------|-------|
| `/onboarding` | Create first workspace | Authenticated |
| `/account` | User account settings | Authenticated |
| `/:tenant` | Tenant dashboard | Member+ |
| `/:tenant/settings` | General settings | Admin+ |
| `/:tenant/settings/team` | Team management | Admin+ |
| `/:tenant/settings/api-keys` | API keys | Admin+ |
| `/:tenant/settings/billing` | Billing/plans | Owner |
| `/:tenant/settings/audit-log` | Audit log | Admin+ |

---

## Server Actions

All actions in `src/lib/actions/` follow pattern:

```typescript
"use server";

import { getCurrentUser } from "../auth/session";
import { findTenantBySlug } from "../db/tenants";
import { validationSchema } from "@axis/db/validation";

export async function myAction(
  tenantSlug: string,
  formData: FormData
): Promise<ActionResult> {
  // 1. Auth check
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 2. Validate input with Zod
  const parsed = validationSchema.safeParse({ ... });
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  // 3. Tenant access check
  const tenant = await findTenantBySlug(tenantSlug);
  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (membership?.role !== "owner") {
    return { success: false, error: "Forbidden" };
  }

  // 4. Business logic
  try {
    await doSomething(parsed.data);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Operation failed" };
  }
}
```

---

## Middleware

`middleware.ts` handles:

1. **Public routes** - No auth required (`/`, `/login`, `/register`)
2. **API routes** - Pass through to route handlers
3. **Tenant routes** - Extract slug, verify session, set headers

```typescript
// Tenant slug passed via header
response.headers.set("x-tenant-slug", tenantSlug);

// Session presence indicator
response.headers.set("x-has-session", "true");
```

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
AUTH_URL=https://...
AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (features disabled if not set)
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=...
R2_BUCKET_NAME=...
```

---

## Scripts

```bash
# Development
pnpm dev          # Start with Turbopack

# Build
pnpm build        # Production build
pnpm start        # Start production server

# Quality
pnpm typecheck    # TypeScript check
pnpm lint         # ESLint check
```

---

## Email Templates

Available in `src/lib/email/templates.ts`:

| Template | Usage |
|----------|-------|
| `invitationEmail` | Team invitation |
| `passwordResetEmail` | Password reset link |
| `welcomeEmail` | Post-registration welcome |

---

## Database

SQL schema in `db/schema.sql`. Run against Neon database to initialize.

For Drizzle ORM types, import from `@axis/db`:

```typescript
import { type User, type Tenant } from "@axis/db/schema";
import { insertUserSchema } from "@axis/db/validation";
```

---

[← Back to root](../../README.md)
