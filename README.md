# NexusCanon AXIS

> **Multi-tenant ERP Platform** built on Next.js 16, Neon PostgreSQL, and Drizzle ORM

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.7-EF4444?logo=turborepo)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-F69220?logo=pnpm)](https://pnpm.io/)

---

## 🎯 Team 1 Objective

> **Clear the road. Ensure everything is integrated. No roadblocks.**

Team 1 focuses on **architecture, integration, and stability** — not features.
Team 2 consumes this foundation and builds features at speed.

### Success Criteria

| Criteria                           | Status | Notes                                                |
| ---------------------------------- | ------ | ---------------------------------------------------- |
| Zero runtime errors                | ✅      | Build passes, typecheck clean                        |
| All routes functional              | 🔄      | See [Integration Checklist](#-integration-checklist) |
| Schema ↔ Types ↔ Validation synced | ✅      | Drizzle → Zod codegen                                |
| No orphan code                     | ✅      | All imports resolve                                  |
| No dead dependencies               | ✅      | Package.json clean                                   |
| Documentation current              | ✅      | READMEs updated                                      |

---

## 🔍 Integration Checklist

### Auth Flow
- [x] Login page renders
- [x] Register page renders
- [x] Session cookie handling
- [x] Middleware auth check
- [x] Neon Auth callback proxy
- [x] Password reset flow (server action + template ready)

### Tenant Flow
- [x] Onboarding creates tenant
- [x] Tenant routes resolve (`/[tenant]/*`)
- [x] Tenant slug passed via middleware header
- [x] User-tenant membership check
- [x] Workspace switcher populated from DB

### Database Flow
- [x] Schema SQL matches Drizzle schema
- [x] Zod validation generated from Drizzle
- [x] JSONB fields typed (`settings`)
- [x] Array fields typed (`scopes TEXT[]`)
- [x] Raw SQL queries with type safety

### API Routes
- [x] `/api/health` - Health check
- [x] `/api/auth/[...all]` - Neon Auth (rate limited)
- [x] `/api/webhooks/stripe` - Stripe webhooks
- [x] `/api/validate-key` - API key validation (rate limited)
- [x] `/api/upload` - R2 presigned URLs
- [x] Rate limiting middleware (`src/lib/rate-limit.ts`)

### External Services (Configuration)
- [x] Neon PostgreSQL - Client configured
- [x] Resend - Client configured
- [x] Stripe - Client configured
- [x] Cloudflare R2 - Client configured

### External Services (Production Setup)
- [ ] **DEPLOY:** Resend domain verification
- [ ] **DEPLOY:** Stripe webhook secret
- [ ] **DEPLOY:** R2 bucket CORS configuration
- [ ] **DEPLOY:** Environment variables in hosting platform

---

## 📦 Package Documentation

| Package          | Description                    | Status | Docs                                                 |
| ---------------- | ------------------------------ | ------ | ---------------------------------------------------- |
| **@axis/web**    | Next.js 16 web application     | ✅      | [apps/web/](./apps/web/)                             |
| **@axis/db**     | Drizzle ORM + Zod validation   | ✅      | [packages/db/](./packages/db/)                       |
| **@axis/kernel** | Auth, tenant, config utilities | ✅      | [packages/kernel/](./packages/kernel/)               |
| **ESLint v9**    | Flat config migration          | ✅      | [README](./packages/eslintV9/README.md)              |
| **Turbo v2**     | Build system config            | ✅      | [README](./packages/turboV2/README.md)               |
| **Next.js 16**   | Framework migration            | ✅      | [README](./packages/nextjs16/README.md)              |
| **TS5/React19**  | Type system config             | ✅      | [README](./packages/typescriptV5-reactV19/README.md) |

---

## 🏗️ Architecture Overview

```
NexusCanon-AXIS/
├── apps/
│   └── web/                    # Next.js 16 application (Turbopack)
│       ├── src/app/            # App Router pages
│       │   ├── (auth)/         # Auth pages (login, register, etc.)
│       │   ├── [tenant]/       # Multi-tenant routes
│       │   └── api/            # API routes
│       ├── src/lib/            # Shared utilities
│       │   ├── actions/        # Server actions
│       │   ├── auth/           # Authentication
│       │   ├── db/             # Database queries
│       │   └── email/          # Email service (Resend)
│       └── db/schema.sql       # PostgreSQL schema
│
├── packages/
│   ├── db/                     # @axis/db - Database layer
│   │   ├── src/schema/         # Drizzle ORM table definitions
│   │   ├── src/validation/     # Zod schemas (auto-generated from Drizzle)
│   │   └── src/client/         # Neon client + tenant scoping
│   │
│   ├── kernel/                 # @axis/kernel - Core utilities
│   │   ├── src/auth/           # Auth helpers, RBAC
│   │   ├── src/config/         # Environment, feature flags
│   │   └── src/tenant/         # Tenant resolution, context
│   │
│   └── design-system/          # UI components (shadcn-based)
│
├── pnpm-workspace.yaml         # Workspace + dependency catalog
├── turbo.json                  # Turborepo configuration
└── eslint.config.mjs           # ESLint v9 flat config
```

---

## 🔑 Core Patterns

### Pattern 1: Single Source of Truth

```
Drizzle Schema → TypeScript Types → Zod Validation
     ↓                  ↓                  ↓
packages/db/      $inferSelect      drizzle-zod
schema/*.ts       $inferInsert      validation/*.ts
```

**Usage:**
```typescript
// Types from schema
import { type User, type Tenant } from "@axis/db/schema";

// Validation from drizzle-zod
import { insertUserSchema, userRoleSchema } from "@axis/db/validation";

// Database client
import { createDbClient } from "@axis/db/client";
```

### Pattern 2: Server Action Structure

```typescript
"use server";

export async function myAction(formData: FormData): Promise<ActionResult> {
  // 1. Auth check
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 2. Validate with Zod schema from @axis/db
  const parsed = schema.safeParse({ ... });
  if (!parsed.success) return { success: false, fieldErrors: ... };

  // 3. Business logic
  // 4. Audit log
  // 5. Return result
}
```

### Pattern 3: Tenant Resolution

```
Request → Middleware → x-tenant-slug header → Server Component
                ↓
        Session cookie check
                ↓
        Redirect to /login if no session
```

---

## 🗃️ Database Schema

| Table          | Description                        |
| -------------- | ---------------------------------- |
| `tenants`      | Organizations/workspaces           |
| `users`        | User accounts (Neon Auth linked)   |
| `tenant_users` | Many-to-many membership with roles |
| `invitations`  | Pending team invites               |
| `api_keys`     | Programmatic access tokens         |
| `audit_logs`   | Security event log                 |

**Key Fields:**
- `tenants.settings` → JSONB (stripeCustomerId, etc.)
- `tenant_users.role` → `owner | admin | member | viewer`
- `api_keys.scopes` → TEXT[] array

---

## 🔧 Environment Variables

Required in `.env.local` (see `.envsamplelocal`):

```bash
# Database (Neon)
DATABASE_URL=postgresql://...@.neon.tech/neondb?sslmode=require

# Auth (Neon Auth)
AUTH_URL=https://...neon.tech
AUTH_SECRET=...

# Email (Resend)
RESEND_API_KEY=re_...

# Billing (Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Storage (Cloudflare R2)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://...r2.cloudflarestorage.com
R2_BUCKET_NAME=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Quick Start

```bash
# Prerequisites: Node 20+, pnpm 9+

# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .envsamplelocal .env.local
# Edit .env.local with your credentials

# 3. Initialize database
# Run apps/web/db/schema.sql against your Neon database

# 4. Start development
pnpm dev

# Opens at http://localhost:3000
```

---

## 📋 Available Scripts

```bash
# Development
pnpm dev                    # All packages in dev mode
pnpm --filter @axis/web dev # Web app only

# Build & Check
pnpm build                  # Build all packages
pnpm typecheck              # TypeScript check
pnpm lint                   # ESLint check
pnpm lint:fix               # Auto-fix lint issues

# Database (from packages/db)
pnpm db:generate            # Generate Drizzle migrations
pnpm db:push                # Push schema to database
pnpm db:studio              # Open Drizzle Studio
```

---

## 🛠️ Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Framework  | Next.js 16.1.4 (Turbopack)         |
| Database   | Neon PostgreSQL (serverless)       |
| ORM        | Drizzle ORM 0.38.4                 |
| Validation | Zod 4.x + drizzle-zod              |
| Auth       | Neon Auth (better-auth compatible) |
| Styling    | Tailwind CSS 4.x                   |
| Build      | Turborepo 2.7                      |
| Email      | Resend                             |
| Payments   | Stripe                             |
| Storage    | Cloudflare R2                      |

---

## 📚 Migration Guides

| Migration    | Status     | Documentation                                                                          |
| ------------ | ---------- | -------------------------------------------------------------------------------------- |
| ESLint v9    | ✅ Complete | [packages/eslintV9/README.md](./packages/eslintV9/README.md)                           |
| Turbo v2     | ✅ Complete | [packages/turboV2/README.md](./packages/turboV2/README.md)                             |
| Next.js 16   | ✅ Complete | [packages/nextjs16/README.md](./packages/nextjs16/README.md)                           |
| TypeScript 5 | ✅ Complete | [packages/typescriptV5-reactV19/README.md](./packages/typescriptV5-reactV19/README.md) |
| Tailwind 4   | 🔄 Partial  | v3 and v4 coexist                                                                      |

---

## 🔗 External Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [Neon Docs](https://neon.tech/docs)
- [Zod v4 Docs](https://zod.dev/v4)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Resend Docs](https://resend.com/docs)
- [Stripe Docs](https://stripe.com/docs)

---

## 📄 License

MIT License - See [LICENSE.md](./LICENSE.md)

---

**Last Updated:** 2026-01-21
