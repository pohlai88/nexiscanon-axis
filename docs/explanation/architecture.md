# Architecture Overview

> **Explanation**: Understanding how NexusCanon-AXIS is structured and why.

## The Big Picture

NexusCanon-AXIS is a **multi-tenant SaaS platform** built with:

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Next.js 16 (Turbopack)               │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  │   │
│  │  │ App     │  │ API     │  │ Server  │  │ Middle │  │   │
│  │  │ Router  │  │ Routes  │  │ Actions │  │ ware   │  │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └───┬────┘  │   │
│  └───────┼────────────┼────────────┼───────────┼───────┘   │
│          │            │            │           │            │
└──────────┼────────────┼────────────┼───────────┼────────────┘
           │            │            │           │
           ▼            ▼            ▼           ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  Neon    │  │  Neon    │  │  Resend  │  │ Stripe   │
    │ Postgres │  │  Auth    │  │  Email   │  │ Billing  │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Core Design Decisions

### 1. Monorepo with Turborepo

**Why**: Shared code, coordinated builds, single source of truth.

```
NexusCanon-AXIS/
├── apps/
│   └── web/           # Next.js application
├── packages/
│   ├── db/            # Drizzle ORM + Zod validation
│   ├── kernel/        # Auth, tenant, config utilities
│   └── design-system/ # UI components
```

**Trade-off**: Slightly more complex setup, but faster development at scale.

### 2. Multi-Tenancy via Path Segments

**Why**: Works everywhere, no DNS configuration required.

```
https://app.com/acme-corp         # Path-based (default)
https://acme-corp.app.com         # Subdomain (optional)
```

The middleware detects the tenant from the URL and sets an `x-tenant-slug` header for downstream use.

**Trade-off**: Path-based is simpler but less "branded". Subdomain requires DNS setup.

### 3. Tenant Hierarchy

**Why**: Organizations need teams, individuals need personal spaces.

```
Organization (type: "organization")
├── Team A (type: "team", parent_id: org.id)
├── Team B (type: "team", parent_id: org.id)
└── ...

Personal Workspace (type: "personal", parent_id: null)
```

**Trade-off**: More complex queries, but supports real-world organizational structures.

### 4. Server Actions for Mutations

**Why**: Type-safe, no API routes needed, progressive enhancement.

```typescript
// Pattern: All mutations use server actions
"use server";

export async function createTenant(formData: FormData) {
  // 1. Auth check
  // 2. Validate with Zod
  // 3. Database operation
  // 4. Audit log
  // 5. Return result
}
```

**Trade-off**: Tied to React, but simpler than REST/GraphQL for this use case.

### 5. Neon PostgreSQL + Neon Auth

**Why**: Serverless, instant branching, built-in auth.

- **Connection pooling**: Handles 1000+ concurrent connections
- **Branching**: Database per PR for safe testing
- **Scale-to-zero**: Cost savings during low traffic
- **Neon Auth**: Better Auth compatible, no session store needed

**Trade-off**: Vendor lock-in to Neon, but strong DX benefits.

---

## Request Flow

```
Browser Request
       │
       ▼
┌─────────────────┐
│   Middleware    │ ← Tenant resolution, auth check
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Layout (RSC)   │ ← Fetch user, tenant data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Page (RSC)    │ ← Render with data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Client Component│ ← Interactivity (forms, etc.)
└─────────────────┘
```

---

## Data Flow

### Single Source of Truth

```
Drizzle Schema → TypeScript Types → Zod Validation
     ↓                  ↓                  ↓
packages/db/      $inferSelect      drizzle-zod
schema/*.ts       $inferInsert      validation/*.ts
```

This ensures database, types, and validation are always in sync.

### Database to UI

```
PostgreSQL → Drizzle Query → Server Component → React UI
```

No API layer for reads. Server Components fetch directly.

### UI to Database

```
Form → Server Action → Zod Validation → Drizzle Mutation → PostgreSQL
                            ↓
                      Audit Log Entry
```

All mutations go through server actions with validation and audit logging.

---

## Security Model

### Authentication

- **Neon Auth** handles identity (sign up, sign in, password reset)
- **Session cookie** stored httpOnly, SameSite=Lax
- **Middleware** validates session on every request

### Authorization

- **Tenant membership** checked for all tenant routes
- **Role-based access**: owner > admin > member > viewer
- **Super admin** via `settings.isAdmin` flag on user

### API Keys

- **Scoped access** for programmatic use
- **Key hash** stored, never the key itself
- **Prefix** for easy identification (`axis_...`)

---

## Error Handling

```
Error Occurs
     │
     ▼
┌─────────────────┐
│ Error Boundary  │ ← Catches React errors
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Error Reporter  │ ← Sends to GlitchTip/Sentry
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Error UI       │ ← User-friendly message
└─────────────────┘
```

Each route segment has its own error boundary for granular handling.

---

## Scaling Considerations

| Concern | Solution |
|---------|----------|
| Database connections | Neon pooling (`-pooler` suffix) |
| Build times | Turborepo caching |
| Global latency | Vercel Edge Network |
| Static content | Next.js ISR/SSG where possible |
| Dynamic routes | Server-side rendering |

---

## Related Documentation

- **[Multi-Tenancy](./multi-tenancy.md)** - Deep dive into tenant architecture
- **[Authentication](./authentication.md)** - Auth flow details
- **[Database Schema](../reference/database/)** - Table definitions
