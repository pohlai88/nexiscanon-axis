# F01 — Database Design & Specification Governance

**Doc ID:** F01  
**Applies to:** NexusCanon-AXIS / AXIS ERP domains  
**DB Engine:** PostgreSQL 17  
**Provider:** Neon (serverless Postgres)  
**ORM / Migrations:** Drizzle ORM + drizzle-kit  
**Status:** Governed (v2.0)  
**Last Updated:** 2026-01-23

---

## 0) Objective & Scope

Establish a **zero-drift, contract-first** governance method for database design and specification, such that:

- **@axis/registry** is the single source of truth for domain schemas (Zod)
- **Drizzle schema** reflects registry contracts and is the source of truth for DB structure
- DB structure is **intentional, reviewable, and auditable**
- Migrations are **repeatable** and **safe** via drizzle-kit
- Neon operational constraints (pooling, serverless, branching, autoscaling) are first-class
- Multi-tenant isolation is enforced at the database level (RLS + tenant_id)

**Alignment:** This document implements the database layer governance defined in [A01-CANONICAL](./A01-CANONICAL.md) and integrates with the consistency strategy in [E04-CONSISTENCY-STRATEGY](./E04-CONSISTENCY-STRATEGY.md).

---

# A) CANONICAL LAWS (Non-Negotiable)

## LAW F01-01 — @axis/registry as Schema Source of Truth

All domain entities **MUST** be defined first in `@axis/registry` as Zod schemas with `.meta()` identifiers. Drizzle tables IMPORT types from registry.

```typescript
// @axis/registry defines the contract
export const journalEntrySchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().max(50),
  // ...
}).meta({ id: "axis.accounting.journalEntry" });

// @axis/db Drizzle tables reflect registry contracts
import type { JournalEntry } from "@axis/registry";
export const glJournalEntries = pgTable("gl_journal_entries", { ... });
```

**Prohibitions:**
- No Drizzle table without corresponding registry schema
- No type drift between registry and Drizzle definitions

---

## LAW F01-02 — Drizzle Schema Reflects Registry Contracts

All tables, enums, indexes, and relations **MUST** be declared in Drizzle schema and exported so drizzle-kit can diff correctly.

**Prohibitions:**
- No "hidden" tables created manually without Drizzle representation
- No drift-by-console changes in production

---

## LAW F01-03 — SQL Migrations via drizzle-kit

Production changes **MUST** be applied via SQL migration files and a deterministic migration runner.

**Workflow:**
```bash
# 1. Edit Drizzle schema (TypeScript)
# 2. Generate SQL migration
pnpm drizzle-kit generate

# 3. Review generated SQL in ./drizzle/XXXX_migration_name/migration.sql
# 4. Commit migration + schema changes to git
# 5. Apply in controlled environments
pnpm drizzle-kit migrate  # dev → staging → prod
```

---

## LAW F01-04 — Connection Separation (Direct vs Pooled)

Neon provides two connection types. Using the wrong one causes failures.

| Use Case | Connection Type | String Pattern |
|----------|-----------------|----------------|
| Migrations, pg_dump, admin | **Direct** | `@ep-xxx.region.aws.neon.tech` |
| App runtime, serverless | **Pooled** | `@ep-xxx-pooler.region.aws.neon.tech` |

**Hard Rule:** Always use Direct for migrations, Pooled for runtime.

---

## LAW F01-05 — Constraints First, Not Application Hope

Every business invariant **MUST** be enforced with DB constraints:

| Constraint | Purpose |
|------------|---------|
| `NOT NULL` | Required fields |
| `CHECK` | Business rules (e.g., `amount > 0`) |
| `UNIQUE` | Uniqueness within scope |
| `FOREIGN KEY` | Referential integrity |
| `DEFAULT` | Safe defaults |

---

## LAW F01-06 — Multi-Tenant Isolation (tenant_id + RLS)

Every tenant-scoped table **MUST** have:

1. `tenant_id uuid NOT NULL` column
2. Index strategy supporting tenant filters
3. Row-Level Security (RLS) policies for tenant isolation

**RLS Implementation (Drizzle v1.0+):**

```typescript
import { pgTable, pgPolicy, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const glJournalEntries = pgTable("gl_journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  // ...
}, (table) => [
  pgPolicy("tenant_isolation", {
    as: "permissive",
    for: "all",
    using: sql`${table.tenantId} = current_setting('app.tenant_id')::uuid`,
  }),
]);
```

**Neon crudPolicy Helper:**

```typescript
import { crudPolicy, authenticatedRole, authUid } from "drizzle-orm/neon";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  createdBy: uuid("created_by").notNull(),
}, (table) => [
  crudPolicy({
    role: authenticatedRole,
    read: authUid(table.createdBy),
    modify: false,
  }),
]);
```

---

## LAW F01-07 — Immutable Audit Trail (6W1H Context)

All audit records **MUST** capture 6W1H context and be append-only.

| Field | Description |
|-------|-------------|
| `who` | User/actor performing action |
| `what` | Action type and resource |
| `when` | Timestamp with timezone |
| `where` | System/endpoint origin |
| `why` | Business reason/context |
| `which` | Specific record affected |
| `how` | Method/process used |

**FK Strategy for Audit:** Use `ON DELETE SET NULL` to preserve audit records when referenced entities are deleted.

---

# B) SUPPORTING SPEC (Implementation Standards)

## B1) Naming Conventions

### Schemas (PostgreSQL namespaces)
- `public` — App tables (default)
- `auth` — Authentication helpers (Neon Auth)
- `drizzle` — Migration tracking
- `audit` — Immutable audit trails (optional)

### Table Naming
- `snake_case`, plural: `sales_invoices`, `gl_journal_entries`
- Junction tables: `tenant_users`, `role_permissions`

### Column Naming
- `id` — UUID primary key
- `tenant_id` — Tenant reference (always present in tenant tables)
- `created_at`, `updated_at` — Timestamps
- `deleted_at` — Soft delete (optional)
- `created_by`, `updated_by` — Audit references

---

## B2) Standard Column Patterns

**From Live Database (Neon MCP):**

```sql
-- UUID Primary Key
id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY

-- Timestamps
created_at timestamp with time zone NOT NULL DEFAULT now()
updated_at timestamp with time zone NOT NULL DEFAULT now()

-- JSONB Settings
settings jsonb NULL DEFAULT '{}'::jsonb

-- Enum Types
status USER-DEFINED NOT NULL DEFAULT 'active'::tenant_status
```

---

## B3) Drizzle Schema Patterns

### Enum Pattern (Use $type<>, NOT pgEnum)

```typescript
// Define as const array for type safety
export const TENANT_STATUS = ["active", "suspended", "pending", "deleted"] as const;
export type TenantStatus = (typeof TENANT_STATUS)[number];

// In table definition - use $type<>()
status: varchar("status", { length: 20 })
  .notNull()
  .default("active")
  .$type<TenantStatus>(),
```

### Relations Pattern

```typescript
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  tenantMemberships: many(tenantUsers),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  members: many(tenantUsers),
}));
```

### Index Pattern

```typescript
export const glAccounts = pgTable("gl_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  // ...
}, (table) => [
  uniqueIndex("uq_gl_accounts_code").on(table.tenantId, table.code),
  index("idx_gl_accounts_tenant").on(table.tenantId),
]);
```

### Type Inference Pattern

```typescript
// Infer types from Drizzle tables
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
```

---

## B4) Constraints & Indexes (Drizzle API)

### Constraint Functions

```typescript
import { 
  pgTable, uuid, varchar, integer,
  primaryKey, foreignKey, unique, check, index, uniqueIndex
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  amount: integer("amount").notNull(),
}, (table) => [
  // CHECK constraint
  check("amount_positive", sql`${table.amount} > 0`),
  
  // Composite UNIQUE
  unique("uq_customer_order").on(table.customerId, table.orderNumber),
  
  // Foreign key with cascade
  foreignKey({
    columns: [table.customerId],
    foreignColumns: [customers.id],
    name: "fk_orders_customer",
  }).onDelete("cascade"),
  
  // Indexes
  index("idx_orders_customer").on(table.customerId),
]);
```

### Composite Primary Key (Junction Tables)

```typescript
export const tenantUsers = pgTable("tenant_users", {
  tenantId: uuid("tenant_id").notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member"),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.userId] }),
]);
```

### Index Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Primary Key | `{table}_pkey` | `tenants_pkey` |
| Unique | `{table}_{columns}_unique` | `tenants_slug_unique` |
| Index | `idx_{table}_{columns}` | `idx_audit_logs_tenant_id` |
| Foreign Key | `{table}_{column}_{ref_table}_fk` | `tenant_users_tenant_id_tenants_fk` |

---

## B5) Row-Level Security (RLS)

### Enable RLS (Drizzle v1.0+)

```typescript
// Method 1: pgTable.withRLS() - enables RLS with default-deny
export const glJournalEntries = pgTable.withRLS("gl_journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
});

// Method 2: Add policies (RLS enabled automatically)
export const glJournalEntries = pgTable("gl_journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
}, (table) => [
  pgPolicy("tenant_isolation", {
    as: "permissive",
    for: "all",
    using: sql`${table.tenantId} = current_setting('app.tenant_id')::uuid`,
  }),
]);
```

### drizzle.config.ts for Neon RLS

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./packages/db/src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT!, // Direct for migrations
  },
  entities: {
    roles: {
      provider: "neon", // Exclude Neon system roles
    },
  },
  verbose: true,
  strict: true,
});
```

---

## B6) Migration Workflow

### Production Workflow (Recommended)

```bash
# 1. Edit Drizzle schema (TypeScript)
# 2. Generate SQL migration
pnpm drizzle-kit generate

# 3. Review generated SQL in ./drizzle/XXXX_migration_name/migration.sql
# 4. Commit migration + schema changes to git
git add packages/db/src/schema drizzle/
git commit -m "feat(db): add invoice table"

# 5. Apply in controlled environments
pnpm drizzle-kit migrate  # dev → staging → prod
```

### Development (Rapid Iteration)

```bash
# Direct push without SQL files
pnpm drizzle-kit push
```

### Migration Safety Patterns

| Change Type | Strategy |
|-------------|----------|
| Add NOT NULL column | Add nullable → backfill → alter to NOT NULL |
| Large table changes | Avoid long exclusive locks |
| Destructive changes | 2-step deprecation (mark deprecated, then drop) |
| Index creation | Use `CONCURRENTLY` where supported |

---

## B7) Neon Operations (Comprehensive)

### Connection Drivers (Choose by Environment)

```typescript
// 1. neon-http: Fast single transactions (serverless recommended)
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql });

// 2. neon-websockets: Interactive transactions, sessions
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws; // Required for Node.js < v22

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool });

// 3. postgres-js: Serverful environments (long-running servers)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle({ client });
```

### Connection Pooling (PgBouncer)

**Neon PgBouncer Configuration:**
```
pool_mode=transaction       # Transaction-level pooling
max_client_conn=10000       # Up to 10K concurrent connections
default_pool_size=0.9 * max_connections
query_wait_timeout=120      # 2 minutes
```

**Transaction Mode Limitations (CRITICAL):**

| NOT Supported in Pooled Mode | Workaround |
|------------------------------|------------|
| `SET`/`RESET` statements | Use `ALTER ROLE` for persistent settings |
| `LISTEN`/`NOTIFY` | Use direct connection |
| `PREPARE`/`DEALLOCATE` (SQL-level) | Use protocol-level prepared statements |
| Session-level advisory locks | Use transaction-level locks |
| Temp tables with `PRESERVE ROWS` | Use regular tables |

### Database Branching

**Branch Types:**
```
production (main)     # Protected, production data
├── staging          # Pre-production testing
├── preview-pr-123   # PR preview branch (auto-created)
├── dev-feature-x    # Feature development
└── analytics        # Read-only analytics queries
```

**GitHub Actions for PR Preview:**

```yaml
# .github/workflows/preview-branch.yml
name: Create Preview Branch
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  create-branch:
    runs-on: ubuntu-latest
    steps:
      - uses: neondatabase/create-branch-action@v5
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          branch_name: preview-pr-${{ github.event.pull_request.number }}
          api_key: ${{ secrets.NEON_API_KEY }}
          parent: main
```

### Instant Restore (PITR)

**Restore Window by Plan:**

| Plan | Restore Window |
|------|----------------|
| Free | 1 day |
| Launch | 7 days |
| Scale | 30 days |
| Business | 30 days (configurable) |

### Autoscaling

**Recommended CU Settings by Environment:**

| Environment | Min CU | Max CU | RAM |
|-------------|--------|--------|-----|
| Development | 0.25 | 1 | 1-4 GB |
| Staging | 0.5 | 2 | 2-8 GB |
| Production | 2 | 8 | 8-32 GB |

### Environment Variables Pattern

```bash
# .env.local
DATABASE_URL="postgresql://...@ep-xxx-pooler.../db"          # Pooled (app)
DATABASE_URL_DIRECT="postgresql://...@ep-xxx.../db"          # Direct (migrations)
DEV_DATABASE_URL="postgresql://...@ep-xxx-dev-pooler.../db"  # Dev branch
TEST_DATABASE_URL="postgresql://...@ep-xxx-test-pooler.../db" # Test branch
```

---

## B8) JSONB Policy

Use JSONB for **semi-structured / evolving** fields only:

- Normalize frequently queried fields into real columns
- Add GIN indexes only for proven query patterns
- Document expected structure in @axis/registry schemas

---

## B9) Transactions

### HTTP Transactions (Non-Interactive)

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const [newJournal, newPostings] = await sql.transaction([
  sql`INSERT INTO gl_journal_entries(tenant_id, document_number) 
      VALUES(${tenantId}, ${docNumber}) RETURNING id`,
  sql`INSERT INTO gl_postings(journal_id, account_id, debit, credit) 
      VALUES(${journalId}, ${accountId}, ${amount}, 0)`
], {
  isolationLevel: "ReadCommitted",
  readOnly: false
});
```

### Interactive Transactions (WebSocket)

```typescript
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  // ... conditional logic based on query results
  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release();
  await pool.end();
}
```

### Drizzle Transaction Pattern

```typescript
await db.transaction(async (tx) => {
  const [journal] = await tx.insert(glJournalEntries).values({
    tenantId,
    documentNumber: "JE-2026-001",
  }).returning();
  
  await tx.insert(glPostings).values([
    { journalId: journal.id, accountId: debitAccount, debit: amount, credit: "0" },
    { journalId: journal.id, accountId: creditAccount, debit: "0", credit: amount },
  ]);
});
```

### Serverless Lifecycle (CRITICAL)

```typescript
// Pool MUST be created and closed within same invocation
export default async (req: Request, ctx: ExecutionContext) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  
  try {
    const { rows } = await pool.query("SELECT * FROM gl_accounts");
    return new Response(JSON.stringify(rows));
  } finally {
    ctx.waitUntil(pool.end()); // End BEFORE function completes
  }
};
// AVOID: Creating global Pool outside handler
```

---

## B10) Seeding

### Seed File Structure

```
packages/db/
├── src/seed/
│   ├── index.ts           # Main seed runner
│   ├── tenants.seed.ts    # Tenant seed data
│   ├── users.seed.ts      # User seed data
│   ├── coa.seed.ts        # Chart of Accounts seed
│   └── test-data.seed.ts  # Test scenario data
```

### Seed Pattern

```typescript
import { db } from "../db";
import { tenants, users } from "../schema";

export async function seedTenants() {
  await db.insert(tenants).values([
    { id: "tenant-dev-001", name: "Development Tenant", status: "active" },
    { id: "tenant-test-001", name: "Test Tenant", status: "active" },
  ]).onConflictDoNothing();
}

export async function seed() {
  await seedTenants();
  await seedUsers();
  await seedChartOfAccounts();
}
```

---

## B11) Performance

### Prepared Statements

```typescript
export const getUsersByRolePrepared = db
  .select()
  .from(usersTable)
  .where(sql`${usersTable.role} = $1`)
  .prepare("get_users_by_role");

// Usage
const users = await getUsersByRolePrepared.execute(["admin"]);
```

### Batch Operations

```typescript
// More efficient than multiple individual inserts
export async function batchInsertUsers(users: NewUser[]) {
  return db.insert(usersTable).values(users).returning();
}
```

### Vercel Edge Region Optimization

```typescript
export const config = {
  runtime: "edge",
  regions: ["sin1"], // Region nearest to Neon DB (ap-southeast-1)
};
```

---

## B12) Team Migrations

### Branch Migration Strategy

```bash
# 1. Create feature branch
git checkout -b feature/add-invoice-table

# 2. Edit schema
# packages/db/src/schema/sales/invoice.ts

# 3. Generate migration
pnpm drizzle-kit generate --name add_invoice_table

# 4. Check migration validity
pnpm drizzle-kit check

# 5. Commit schema + migration together
git add packages/db/src/schema drizzle/
git commit -m "feat(db): add invoice table"
```

### CI Pipeline Integration

```yaml
# .github/workflows/db-check.yml
- name: Check migrations
  run: pnpm drizzle-kit check
  
- name: Verify schema matches migrations
  run: pnpm drizzle-kit push --dry-run
```

---

# C) EVIDENCE / CHECKLISTS

## C1) Schema Change PR Gate

- [ ] Drizzle schema change matches @axis/registry contract
- [ ] Generated SQL migration committed
- [ ] Constraints included (NOT NULL / UNIQUE / CHECK)
- [ ] Index justification (hot path + expected predicates)
- [ ] Tenant isolation confirmed (tenant_id + RLS policy)
- [ ] Connection type confirmed (Direct for migrations, Pooled for runtime)

## C2) Migration Safety Checklist

- [ ] Backfill strategy for NOT NULL columns
- [ ] Large table changes avoid long exclusive locks
- [ ] Destructive changes use 2-step deprecation
- [ ] Index creation uses CONCURRENTLY where possible

## C3) Neon Production Checklist

- [ ] Pooled connections for serverless/runtime
- [ ] Branch lifecycle managed (expire/remove unused)
- [ ] Autoscaling configured (min/max CU)
- [ ] Direct connection used for migrations only

---

# D) Ready-to-Use Templates

## D1) Tenant Table Template

```typescript
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active").$type<TenantStatus>(),
  plan: varchar("plan", { length: 20 }).notNull().default("free").$type<SubscriptionPlan>(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("tenants_slug_unique").on(table.slug),
]);
```

## D2) Junction Table Template (Composite PK)

```typescript
export const tenantUsers = pgTable("tenant_users", {
  tenantId: uuid("tenant_id").notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member").$type<UserRole>(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.userId] }),
]);
```

## D3) Audit Log Table Template

```typescript
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId: uuid("resource_id"),
  metadata: jsonb("metadata").default({}),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_audit_logs_tenant_id").on(table.tenantId),
  index("idx_audit_logs_user_id").on(table.userId),
  index("idx_audit_logs_created_at").on(table.createdAt.desc()),
]);
```

## D4) ERP Document Table Template (with RLS)

```typescript
export const glJournalEntries = pgTable("gl_journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  documentNumber: varchar("document_number", { length: 50 }).notNull(),
  postingDate: date("posting_date").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("draft").$type<JournalStatus>(),
  isReversal: boolean("is_reversal").notNull().default(false),
  reversalOf: uuid("reversal_of"),
  totalDebit: numeric("total_debit", { precision: 19, scale: 4 }).notNull().default("0"),
  totalCredit: numeric("total_credit", { precision: 19, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid("created_by").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  version: integer("version").notNull().default(1),
}, (table) => [
  uniqueIndex("uq_gl_journal_entries_doc").on(table.tenantId, table.documentNumber),
  index("idx_gl_journal_entries_tenant").on(table.tenantId),
  index("idx_gl_journal_entries_date").on(table.tenantId, table.postingDate),
  pgPolicy("tenant_isolation", {
    as: "permissive",
    for: "all",
    using: sql`${table.tenantId} = current_setting('app.tenant_id')::uuid`,
  }),
]);
```

---

# E) Neon MCP Workflow Integration

## E1) Migration Workflow (via MCP)

```
1. prepare_database_migration → Creates temp branch, applies SQL
2. run_sql (on temp branch) → Test and verify
3. complete_database_migration → Apply to main branch
```

## E2) Query Tuning Workflow (via MCP)

```
1. list_slow_queries → Find queries > 100ms
2. prepare_query_tuning → Analyze and suggest indexes
3. run_sql (on temp branch) → Apply and test
4. complete_query_tuning → Apply to main branch
```

## E3) Available Neon MCP Tools

| Tool | Purpose |
|------|---------|
| `create_branch` / `delete_branch` | PR preview branches |
| `describe_table_schema` | Schema verification |
| `list_slow_queries` | Performance monitoring |
| `prepare_database_migration` | Safe migration workflow |
| `compare_database_schema` | Schema diff between branches |
| `get_connection_string` | Retrieve connection details |

---

# Appendix: Project Context

**Project:** `nexuscanon-axis` (dark-band-87285012)  
**Region:** ap-southeast-1 (Singapore)  
**PostgreSQL:** v17  
**Autoscaling:** 0.25 - 2 CU  
**History Retention:** 6 hours

**Existing Branches:**
- `production` (primary, default)
- `testing-erp-multitenant`
- `test-integration`

**Existing Schemas:**
- `auth` - Helper functions (uid, jwt, session)
- `drizzle` - Migration tracking
- `graphile_worker` - Background jobs
- `neon_auth` - Neon Auth tables
- `public` - App tables

---

# Implementation Status

**Status:** ✅ Implemented (2026-01-23)

## Completed Implementation

| Component | Status | Location |
|-----------|--------|----------|
| Connection Separation (Direct/Pooled) | ✅ | `packages/db/drizzle.config.ts` |
| Neon RLS Entity Config | ✅ | `packages/db/drizzle.config.ts` |
| Audit Logs (6W1H Template) | ✅ | `packages/db/src/schema/audit-log.ts` |
| Tenant Index Naming | ✅ | `packages/db/src/schema/tenant.ts` |
| CHECK Constraints (Journal Balance) | ✅ | `packages/db/src/schema/accounting/journal.ts` |
| RLS Policies (Tenant Isolation) | ✅ | `packages/db/src/schema/accounting/journal.ts` |
| Environment Variables Template | ✅ | `.env.example` |
| Seed Structure | ✅ | `packages/db/src/seed/` |
| Package Scripts (db:check, db:seed) | ✅ | `packages/db/package.json` |
| Package README | ✅ | `packages/db/README.md` |

## Migration Required

To apply F01 governance to the database:

```bash
# 1. Generate migration
pnpm --filter @axis/db db:generate

# 2. Review generated SQL
# Check: ./packages/db/drizzle/XXXX_*/migration.sql

# 3. Apply migration
pnpm --filter @axis/db db:migrate

# 4. (Optional) Run seeds for development
pnpm --filter @axis/db db:seed
```

## Next Steps

1. **Generate Migration:** Run `pnpm --filter @axis/db db:generate` to create SQL migration for:
   - Updated `audit_logs` table (6W1H columns, indexes)
   - CHECK constraints on `journal_entries`
   - RLS policies on `journal_entries`
   - Updated indexes on `tenants`

2. **Apply RLS to Remaining Tables:** Add RLS policies to other tenant-scoped tables:
   - `gl_accounts`, `gl_postings`, `fiscal_periods`
   - `sales_invoices`, `sales_payments`
   - `purchase_bills`, `purchase_payments`
   - `inventory_stock_moves`, `inventory_adjustments`

3. **Add CHECK Constraints:** Apply business rule constraints to:
   - Amount validations (positive amounts)
   - Status enum validations
   - Date range validations

4. **Seed Development Data:** Expand seed files for:
   - Chart of Accounts (COA)
   - Fiscal Periods
   - Test transactions

---

**References:**
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [Neon MCP Resources](https://github.com/neondatabase-labs/ai-rules)
- [A01-CANONICAL](./A01-CANONICAL.md)
- [E04-CONSISTENCY-STRATEGY](./E04-CONSISTENCY-STRATEGY.md)
- [packages/db/README.md](../../packages/db/README.md)
