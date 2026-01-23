# @axis/db

> Database layer for AXIS ERP - Drizzle ORM + Zod v4 + Query layer

[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.38.4-C5F74F)](https://orm.drizzle.team/)
[![Zod](https://img.shields.io/badge/Zod-4.x-3068B7)](https://zod.dev/v4)
[![Neon](https://img.shields.io/badge/Neon-Serverless-00E699)](https://neon.tech/)

[← Back to root](../../README.md)

---

## Overview

Single source of truth for:
- **Schema**: Drizzle ORM table definitions
- **Types**: Inferred TypeScript types (`$inferSelect`, `$inferInsert`)
- **Validation**: Zod v4 schemas (drizzle-zod with date coercion)
- **Queries**: Drizzle ORM query functions (preferred over raw SQL)
- **Client**: Neon serverless connection + tenant scoping

---

## Installation

This package is internal to the monorepo:

```typescript
// In apps/web or other packages
import { type User, type Tenant } from "@axis/db/schema";
import { insertUserSchema, userRoleSchema } from "@axis/db/validation";
import { findTenantBySlug, createTenant } from "@axis/db/queries";
import { createDbClient } from "@axis/db/client";
```

---

## Exports

### `@axis/db/schema`

Drizzle table definitions and inferred types:

```typescript
// Tables
export { tenants, users, tenantUsers, invitations, apiKeys, auditLogs };

// Types
export type { Tenant, NewTenant, User, NewUser, TenantUser, ApiKey, AuditLog };

// Enums (as const arrays)
export { TENANT_STATUS, SUBSCRIPTION_PLAN, USER_ROLE };
export type { TenantStatus, SubscriptionPlan, UserRole };

// Interfaces
export type { TenantSettings, UserSettings };
```

### `@axis/db/validation`

Zod schemas generated from Drizzle:

```typescript
// Schema factory (Zod v4 with date coercion)
export { createCoercedInsertSchema, createCoercedSelectSchema, createCoercedUpdateSchema };
export { createInsertSchema, createSelectSchema, createUpdateSchema }; // strict (no coercion)

// Tenant
export { insertTenantSchema, selectTenantSchema, updateTenantSchema };
export { createTenantFormSchema, tenantStatusSchema, subscriptionPlanSchema };

// User
export { insertUserSchema, selectUserSchema, updateProfileSchema };
export { userRoleSchema, userSettingsSchema, inviteMemberFormSchema };

// API Key
export { insertApiKeySchema, selectApiKeySchema, createApiKeyFormSchema };

// Audit
export { insertAuditLogSchema, auditLogEntrySchema, auditActionSchema };
```

**Zod v4 Best Practice:**
- `createCoercedInsertSchema`: Use for API input (coerces date strings → Date objects)
- `createSelectSchema`: Use for DB output (strict types, no coercion needed)

### `@axis/db/queries`

Drizzle ORM query functions (preferred over raw SQL):

```typescript
// Tenant queries
export { findTenantBySlug, findTenantById, findTenantByDomain };
export { createTenant, createTeam, createPersonalWorkspace };
export { listTenants, getTeamsForOrg, isSlugAvailable };
export { updateTenantBranding, updateTenantStatus, deleteTenant };

// User queries
export { findUserByEmail, findUserById, findUserByAuthSubject };
export { upsertUserFromAuth, listUsers };
export { getUserTenants, getTenantMembers, getUserTenantMembership };
export { addUserToTenant, removeUserFromTenant, verifyTenantAccess };

// Types
export type { TenantBranding, TenantSettingsExtended, TenantMembership };
```

### `@axis/db/client`

Database connection utilities:

```typescript
export { db, createDbClient, type Database };
export { createTenantScopedClient, withTenant, type TenantScopedDb };
```

---

## Schema Overview

```sql
tenants          -- Organizations/workspaces
├── id           UUID PRIMARY KEY
├── slug         VARCHAR(63) UNIQUE
├── name         VARCHAR(255)
├── status       VARCHAR(20) CHECK (active|suspended|pending|deleted)
├── plan         VARCHAR(20) CHECK (free|starter|professional|enterprise)
├── settings     JSONB DEFAULT '{}'
├── created_at   TIMESTAMPTZ
└── updated_at   TIMESTAMPTZ

users            -- User accounts
├── id           UUID PRIMARY KEY
├── email        VARCHAR(255) UNIQUE
├── name         VARCHAR(255)
├── avatar_url   TEXT
├── email_verified BOOLEAN
├── auth_subject_id VARCHAR(255) UNIQUE  -- Neon Auth link
├── settings     JSONB DEFAULT '{}'
├── created_at   TIMESTAMPTZ
└── updated_at   TIMESTAMPTZ

tenant_users     -- Membership (many-to-many)
├── tenant_id    UUID FK → tenants
├── user_id      UUID FK → users
├── role         VARCHAR(20) CHECK (owner|admin|member|viewer)
├── accepted_at  TIMESTAMPTZ
├── created_at   TIMESTAMPTZ
└── updated_at   TIMESTAMPTZ
    PRIMARY KEY (tenant_id, user_id)

invitations      -- Pending invites
├── id           UUID PRIMARY KEY
├── tenant_id    UUID FK → tenants
├── email        VARCHAR(255)
├── role         VARCHAR(20)
├── token        VARCHAR(255) UNIQUE
├── invited_by   UUID FK → users
├── expires_at   TIMESTAMPTZ
├── accepted_at  TIMESTAMPTZ
└── created_at   TIMESTAMPTZ

api_keys         -- Programmatic access
├── id           UUID PRIMARY KEY
├── tenant_id    UUID FK → tenants
├── user_id      UUID FK → users
├── name         VARCHAR(255)
├── key_hash     VARCHAR(255) UNIQUE  -- SHA-256 hashed
├── key_prefix   VARCHAR(10)          -- e.g., "nxc_a1b2..."
├── scopes       TEXT[] DEFAULT '{}'
├── last_used_at TIMESTAMPTZ
├── expires_at   TIMESTAMPTZ
└── created_at   TIMESTAMPTZ

audit_logs       -- Security events
├── id           UUID PRIMARY KEY
├── tenant_id    UUID FK → tenants (nullable)
├── user_id      UUID FK → users (nullable)
├── action       VARCHAR(100)
├── resource_type VARCHAR(100)
├── resource_id  UUID
├── metadata     JSONB DEFAULT '{}'
├── ip_address   INET
├── user_agent   TEXT
└── created_at   TIMESTAMPTZ
```

---

## Usage Examples

### Validate Input with Zod

```typescript
import { createTenantFormSchema } from "@axis/db/validation";

const result = createTenantFormSchema.safeParse({
  name: "Acme Corp",
  slug: "acme",
});

if (!result.success) {
  // result.error.flatten().fieldErrors
}

const validated = result.data; // { name: string, slug: string }
```

### Query with Drizzle

```typescript
import { createDbClient } from "@axis/db/client";
import { tenants } from "@axis/db/schema";
import { eq } from "drizzle-orm";

const db = createDbClient(process.env.DATABASE_URL!);

const tenant = await db.query.tenants.findFirst({
  where: eq(tenants.slug, "acme"),
});
```

### Tenant-Scoped Queries

```typescript
import { withTenant } from "@axis/db/client";

const orders = await withTenant(
  { tenantId, userId },
  async (scopedDb) => {
    // RLS-enabled queries
    return scopedDb.query.orders.findMany();
  }
);
```

---

## Scripts

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema to database (no migration files)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Type check
pnpm typecheck
```

---

## Pattern: Schema → Types → Validation

```
┌─────────────────────────────────────────────────────────┐
│  1. Define once in Drizzle                              │
│     packages/db/src/schema/tenant.ts                    │
│                                                         │
│     export const tenants = pgTable("tenants", {         │
│       slug: varchar("slug", { length: 63 }).notNull()   │
│     });                                                 │
│                                                         │
│     export type Tenant = typeof tenants.$inferSelect;   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. Generate Zod schema                                 │
│     packages/db/src/validation/tenant.ts                │
│                                                         │
│     export const insertTenantSchema = createInsertSchema│
│       (tenants, {                                       │
│         slug: z.string().min(1).max(63).regex(...)      │
│       });                                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Use in server actions                               │
│     apps/web/src/lib/actions/tenant.ts                  │
│                                                         │
│     const result = createTenantFormSchema.safeParse(    │
│       { name, slug }                                    │
│     );                                                  │
│     if (!result.success) return { error: ... };         │
│     await db.insert(tenants).values(result.data);       │
└─────────────────────────────────────────────────────────┘
```

---

## Row-Level Security (RLS) Patterns

The tenant-scoped client sets session variables that RLS policies can reference.

**Session Variables Set:**
```sql
SET app.current_tenant_id = 'uuid';
SET app.current_user_id = 'uuid';
```

**Example RLS Policy Templates:**

```sql
-- Enable RLS on a table
ALTER TABLE public.some_table ENABLE ROW LEVEL SECURITY;

-- Allow tenant members to access their data
-- Uses (SELECT ...) pattern for plan caching (Supabase best practice)
CREATE POLICY "Tenant members can access their data"
  ON public.some_table
  FOR ALL
  USING (
    tenant_id = (SELECT current_setting('app.current_tenant_id', true))::uuid
  );

-- Index for performance (required for RLS-filtered tables)
CREATE INDEX idx_some_table_tenant_id ON public.some_table (tenant_id);

-- Combined tenant + user policy (more restrictive)
CREATE POLICY "Users can only see their own rows"
  ON public.some_table
  FOR SELECT
  USING (
    tenant_id = (SELECT current_setting('app.current_tenant_id', true))::uuid
    AND user_id = (SELECT current_setting('app.current_user_id', true))::uuid
  );
```

**Policy Checklist:**
- [ ] RLS enabled on table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] SELECT policy defined
- [ ] INSERT/UPDATE/DELETE policies defined (or use FOR ALL)
- [ ] Index on `tenant_id` column for performance
- [ ] `(SELECT ...)` wrapper for session variables (plan caching)

**Reference:** [Supabase RLS Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## Sync with SQL

If the deployed SQL schema differs from Drizzle:

```bash
# Introspect existing database → generate Drizzle schema
pnpm drizzle-kit introspect

# Or manually sync:
# 1. Update apps/web/db/schema.sql
# 2. Update packages/db/src/schema/*.ts to match
# 3. Run pnpm typecheck to verify
```

---

[← Back to root](../../README.md)
