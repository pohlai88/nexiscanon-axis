# @axis/db

Database layer for NexusCanon-AXIS ERP system.

**Governed by:** [F01-DB-GOVERNED.md](../../.cursor/ERP/F01-DB-GOVERNED.md)

## Stack

- **Database:** PostgreSQL 17 (Neon serverless)
- **ORM:** Drizzle ORM v0.38+
- **Migrations:** drizzle-kit v0.30+
- **Connection:** `@neondatabase/serverless`

## Architecture

```
@axis/db
├── src/
│   ├── schema/          # Drizzle table definitions (source of truth)
│   ├── client/          # DB client setup (neon-http, tenant-scoped)
│   ├── seed/            # Development seeds
│   ├── queries/         # Pre-built query helpers
│   ├── services/        # Domain service implementations
│   └── validation/      # Runtime validation (Zod)
├── drizzle/             # Generated SQL migrations
└── drizzle.config.ts    # Drizzle Kit configuration
```

## Key Principles (from F01)

### LAW F01-01: @axis/registry as Schema Source of Truth
All domain entities are defined first in `@axis/registry` as Zod schemas. Drizzle tables import types from registry.

### LAW F01-02: Drizzle Schema Reflects Registry Contracts
All tables, enums, indexes, and relations are declared in Drizzle schema and exported.

### LAW F01-03: SQL Migrations via drizzle-kit
Production changes are applied via SQL migration files.

### LAW F01-04: Connection Separation (Direct vs Pooled)
- **Direct** (`DATABASE_URL_DIRECT`): Migrations, pg_dump, admin
- **Pooled** (`DATABASE_URL`): App runtime, serverless functions

### LAW F01-05: Constraints First
Every business invariant is enforced with DB constraints (NOT NULL, CHECK, UNIQUE, FK).

### LAW F01-06: Multi-Tenant Isolation (tenant_id + RLS)
Every tenant-scoped table has `tenant_id` column and RLS policies.

### LAW F01-07: Immutable Audit Trail (6W1H Context)
All audit records capture 6W1H context and are append-only.

## Environment Variables

```bash
# Pooled connection (app runtime, serverless)
DATABASE_URL="postgresql://...@ep-xxx-pooler.../db"

# Direct connection (migrations, admin)
DATABASE_URL_DIRECT="postgresql://...@ep-xxx.../db"

# Optional: Branch-specific connections
DEV_DATABASE_URL="postgresql://...@ep-xxx-dev-pooler.../db"
TEST_DATABASE_URL="postgresql://...@ep-xxx-test-pooler.../db"
```

See `.env.example` in monorepo root for full template.

## Scripts

```bash
# Generate SQL migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Pull schema from database
pnpm db:pull

# Check migration validity
pnpm db:check

# Launch Drizzle Studio (GUI)
pnpm db:studio

# Run seed files
pnpm db:seed

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Workflow

### 1. Schema Change

```bash
# 1. Edit Drizzle schema (TypeScript)
# packages/db/src/schema/accounting/journal.ts

# 2. Generate SQL migration
pnpm db:generate

# 3. Review generated SQL in ./drizzle/XXXX_migration_name/migration.sql

# 4. Commit schema + migration together
git add packages/db/src/schema drizzle/
git commit -m "feat(db): add invoice table"

# 5. Apply in controlled environments
pnpm db:migrate  # dev → staging → prod
```

### 2. Adding CHECK Constraints

```typescript
import { check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: numeric("amount", { precision: 18, scale: 4 }).notNull(),
}, (table) => [
  check("orders_amount_positive", sql`${table.amount} > 0`),
]);
```

### 3. Adding RLS Policies

```typescript
import { pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
}, (table) => [
  pgPolicy("invoices_tenant_isolation", {
    as: "permissive",
    for: "all",
    to: "public",
    using: sql`${table.tenantId} = current_setting('app.tenant_id', true)::uuid`,
  }),
]);
```

### 4. Seeding Development Data

```bash
# Run all seed files
pnpm db:seed
```

Add new seed files in `src/seed/`:
```typescript
// src/seed/your-data.seed.ts
import { db } from "../client";
import { yourTable } from "../schema";

export async function seedYourData() {
  await db.insert(yourTable).values([...]).onConflictDoNothing();
}
```

## Connection Patterns

### HTTP (Recommended for Serverless)

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
```

### WebSocket (Interactive Transactions)

```typescript
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws; // Node.js < v22

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle({ client: pool });
```

### Tenant-Scoped Client

```typescript
import { createTenantScopedClient } from "@axis/db/client";

const tenantDb = await createTenantScopedClient(tenantId);
const invoices = await tenantDb.select().from(invoicesTable);
// RLS automatically filters by tenant_id
```

## Migration Safety

| Change Type | Strategy |
|-------------|----------|
| Add NOT NULL column | Add nullable → backfill → alter to NOT NULL |
| Large table changes | Avoid long exclusive locks |
| Destructive changes | 2-step deprecation (mark deprecated, then drop) |
| Index creation | Use `CONCURRENTLY` where supported |

## Neon-Specific Features

### Database Branching

```bash
# Create branch for PR preview (via GitHub Actions or Neon CLI)
neonctl branches create --name preview-pr-123 --parent main

# Get connection string for branch
neonctl connection-string --branch preview-pr-123
```

### Instant Restore (PITR)

Point-in-time recovery available via Neon console or API.

### Autoscaling

Configured per project in Neon console. Recommended settings:
- **Development:** 0.25 - 1 CU
- **Staging:** 0.5 - 2 CU
- **Production:** 2 - 8 CU

## Posting Spine Services (B01 Integration) 🆕

**Location:** `src/services/posting-spine/`

The posting spine implements B01's Three-Layer Model for immutable accounting:

### Layer 1: Documents (Workflow)
```typescript
import { postDocument, transitionDocumentState } from "@axis/db/services/posting-spine";

// Post document (draft → posted + create event + postings)
const result = await postDocument(db, {
  documentId,
  tenantId,
  userId,
  postingDate: new Date(),
  eventType: "invoice.posted",
  eventDescription: "Posted sales invoice INV-001",
  eventAmount: "1000.0000",
  eventData: { invoiceNumber: "INV-001" },
  postings: [
    { accountId: arAccount, direction: "debit", amount: "1000.0000", description: "AR" },
    { accountId: revenueAccount, direction: "credit", amount: "1000.0000", description: "Revenue" },
  ],
});
```

### Layer 2: Economic Events (Truth)
```typescript
import { createEconomicEvent, getEventsByDocument } from "@axis/db/services/posting-spine";

// Create immutable economic event with 6W1H context
const event = await createEconomicEvent(db, {
  tenantId,
  documentId,
  eventType: "invoice.posted",
  description: "Posted invoice INV-001",
  eventDate: new Date(),
  amount: "1000.0000",
  currency: "USD",
  data: { invoiceNumber: "INV-001" },
  context6w1h: {
    who: "user@example.com",
    what: "Posted sales invoice",
    when: new Date().toISOString(),
    where: "api.acme.com",
    why: "Customer order fulfillment",
    which: "INV-001",
    how: "REST API",
  },
  createdBy: userId,
});
```

### Layer 3: Postings (Math)
```typescript
import { createGLPostings, validateBatchBalance } from "@axis/db/services/posting-spine";

// Create balanced GL postings
const result = await createGLPostings(db, {
  tenantId,
  economicEventId,
  postings: [
    { accountId: arAccount, direction: "debit", amount: "1000.0000", description: "AR" },
    { accountId: revenueAccount, direction: "credit", amount: "1000.0000", description: "Revenue" },
  ],
  postingDate: new Date(),
  createdBy: userId,
});

console.log(result.isBalanced); // true (enforced)
```

### Reversal Pattern (Immutable Corrections)
```typescript
import { createReversalEntry, getReversalChain } from "@axis/db/services/posting-spine";

// Reverse an invoice (creates offsetting entries)
const reversal = await createReversalEntry(db, {
  originalEventId,
  tenantId,
  userId,
  reason: "Posted to wrong customer",
  reversalDate: new Date(),
});

// Get complete reversal chain
const chain = await getReversalChain(db, documentId);
```

### Verification Queries
```typescript
import { verifyBalancedBooks, getPostingsByDocument } from "@axis/db/queries";

// Verify Debits = Credits
const verification = await verifyBalancedBooks(db, { tenantId });

if (!verification.isBalanced) {
  console.error("❌ Books NOT balanced!");
  console.error(`Difference: ${verification.difference}`);
  console.error(`Unbalanced batches: ${verification.unbalancedBatches.length}`);
}

// Get posting history for document
const history = await getPostingsByDocument(db, invoiceId);
```

---

## 📊 Financial Reports (Phase 5)

Generate standard financial statements from the posting spine:

```typescript
import { 
  getBalanceSheet, 
  getIncomeStatement, 
  getCashFlowStatement,
  getTrialBalance,
  getAccountLedger 
} from "@axis/db/queries";

// Balance Sheet (Assets = Liabilities + Equity)
const balanceSheet = await getBalanceSheet(db, tenantId, new Date());
console.log(`Assets: ${balanceSheet.assets.total}`);
console.log(`Verified: ${balanceSheet.verified}`); // true

// Income Statement (Revenue - Expenses = Net Income)
const pnl = await getIncomeStatement(db, tenantId, startDate, endDate);
console.log(`Net Income: ${pnl.netIncome}`);

// Cash Flow Statement
const cashFlow = await getCashFlowStatement(db, tenantId, startDate, endDate);
console.log(`Net Cash: ${cashFlow.netChange}`);

// Trial Balance (Debits = Credits)
const trial = await getTrialBalance(db, tenantId, new Date());
console.log(`Balanced: ${trial.balanced}`); // true

// Account Ledger (detailed transactions)
const ledger = await getAccountLedger(db, accountId, startDate, endDate);
console.log(`Entries: ${ledger.entries.length}`);
```

### Available Reports

| Report | Purpose | Key Feature |
|--------|---------|-------------|
| **Balance Sheet** | Financial position snapshot | Verifies Assets = Liabilities + Equity |
| **Income Statement** | Period profitability | Revenue - Expenses = Net Income |
| **Cash Flow** | Cash movement by activity | Operating, Investing, Financing |
| **Trial Balance** | Account balance verification | Verifies Debits = Credits |
| **Account Ledger** | Transaction detail per account | Running balance with document links |

---

## References

- [F01-DB-GOVERNED.md](../../.cursor/ERP/F01-DB-GOVERNED.md) — Database governance
- [B01-DOCUMENTATION.md](../../.cursor/ERP/B01-DOCUMENTATION.md) — Posting Spine Constitution
- [PHASE-5-REPORTING-COMPLETE.md](../../.cursor/ERP/PHASE-5-REPORTING-COMPLETE.md) — Financial reporting
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [@axis/registry](../axis-registry/README.md) — Schema source of truth
