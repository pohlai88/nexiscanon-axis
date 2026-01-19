# help007-erp-migrations-and-seeds.md

**Status:** SUPPORTING (Help)  
**Goal:** Ensure ERP database changes are safe, reversible, and consistent across environments.

---

## 0) Non-Negotiable

ERP migrations use the **same Drizzle migration system** as Platform. No parallel migration tooling.

- Migrations live in: `packages/db/drizzle/`
- Generated via: `pnpm db:generate`
- Applied via: `pnpm db:migrate`

---

## 1) Migration Naming Convention

### 1.1 Drizzle Auto-Generated Names

Drizzle generates migrations with timestamp prefixes. Accept these defaults:

```
0002_erp_base_partners.sql
0003_erp_base_products.sql
0004_erp_sales_orders.sql
```

### 1.2 Manual Migrations (When Required)

For complex operations (RLS policies, functions, triggers), use:

```
packages/db/migrations-manual/
  XXXX_erp_<module>_<description>.sql
```

Example:
- `0002_erp_base_sequence_function.sql`
- `0003_erp_audit_partitions.sql`

---

## 2) ERP Table Naming Convention

All ERP tables use the `erp_` prefix to distinguish from platform tables:

| Module | Table Examples |
|--------|---------------|
| `erp.base` | `erp_partners`, `erp_products`, `erp_uoms`, `erp_sequences` |
| `erp.sales` | `erp_sales_orders`, `erp_sales_order_lines` |
| `erp.inventory` | `erp_locations`, `erp_stock_moves` |
| `erp.purchase` | `erp_purchase_orders`, `erp_purchase_order_lines` |
| `erp.invoice` | `erp_invoices`, `erp_invoice_lines` |

---

## 3) Required Columns (All ERP Tables)

Every ERP table MUST include:

### 3.1 Identity + Tenant

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL REFERENCES tenants(id),
```

### 3.2 Audit Timestamps

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
```

### 3.3 Optimistic Locking (Transactional Tables)

```sql
version INTEGER NOT NULL DEFAULT 1,
```

### 3.4 Actor Tracking (When Auth Required)

```sql
created_by UUID REFERENCES users(id),
updated_by UUID REFERENCES users(id),
```

---

## 4) Seed Data Strategy

### 4.1 Global Seeds (Tenant-Agnostic)

Some reference data is global (not per-tenant):

| Data | Scope | Location |
|------|-------|----------|
| Currency codes | Global | `packages/db/seeds/currencies.ts` |
| Country codes | Global | `packages/db/seeds/countries.ts` (if needed) |

These are seeded once, shared across all tenants.

### 4.2 Tenant Seeds (Per-Tenant Defaults)

When a new tenant is provisioned, seed default data:

| Data | Scope | Trigger |
|------|-------|---------|
| Default UoMs | Per-tenant | On tenant creation |
| Default sequences | Per-tenant | On tenant creation |
| Default product categories | Per-tenant | On tenant creation (optional) |

### 4.3 Seed Implementation

Create a seeding service in the domain layer:

```typescript
// packages/domain/src/addons/erp.base/services/seed-service.ts

export async function seedTenantDefaults(ctx: { tenantId: string; db: DbClient }) {
  await seedDefaultUoms(ctx);
  await seedDefaultSequences(ctx);
}
```

Called from tenant provisioning flow (not from migrations).

---

## 5) Default UoMs Seed

Standard units of measure to seed per tenant:

```typescript
const DEFAULT_UOMS = [
  { code: 'UNIT', name: 'Unit', category: 'quantity' },
  { code: 'PCS', name: 'Pieces', category: 'quantity' },
  { code: 'KG', name: 'Kilogram', category: 'weight' },
  { code: 'LB', name: 'Pound', category: 'weight' },
  { code: 'M', name: 'Meter', category: 'length' },
  { code: 'FT', name: 'Foot', category: 'length' },
  { code: 'HR', name: 'Hour', category: 'time' },
  { code: 'DAY', name: 'Day', category: 'time' },
];
```

### UoM Table Structure

```sql
CREATE TABLE erp_uoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,  -- 'quantity', 'weight', 'length', 'time', 'volume'
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE (tenant_id, code)
);
```

---

## 6) Default Sequences Seed

Standard document sequences to seed per tenant:

```typescript
const DEFAULT_SEQUENCES = [
  { key: 'SALES_ORDER', prefix: 'SO-', padding: 6 },
  { key: 'PURCHASE_ORDER', prefix: 'PO-', padding: 6 },
  { key: 'INVOICE', prefix: 'INV-', padding: 6 },
  { key: 'STOCK_MOVE', prefix: 'SM-', padding: 6 },
  { key: 'PARTNER', prefix: 'P-', padding: 6 },
];
```

### Sequence Table Structure

```sql
CREATE TABLE erp_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    sequence_key TEXT NOT NULL,
    prefix TEXT NOT NULL,
    next_value BIGINT NOT NULL DEFAULT 1,
    padding INTEGER NOT NULL DEFAULT 6,
    year_reset BOOLEAN NOT NULL DEFAULT false,  -- reset yearly if true
    current_year INTEGER,                        -- track year for reset
    
    UNIQUE (tenant_id, sequence_key)
);
```

---

## 7) Migration Safety Rules

### 7.1 Backward Compatible Changes (Safe)

- Adding new tables
- Adding new nullable columns
- Adding new indexes
- Adding new constraints with `NOT VALID` + later validation

### 7.2 Breaking Changes (Require Care)

- Dropping tables → require explicit cleanup migration
- Dropping columns → mark deprecated first, drop in later release
- Changing column types → add new column, migrate data, drop old
- Adding NOT NULL → add with default, then remove default if needed

### 7.3 Migration Testing

Before applying to production:

1. Run against a copy of production data
2. Verify rollback works (if applicable)
3. Check migration duration (large tables may need batching)

---

## 8) RLS Policies for ERP Tables

If using Row-Level Security at DB level (optional but recommended):

```sql
-- Enable RLS
ALTER TABLE erp_partners ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY erp_partners_tenant_isolation ON erp_partners
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

Note: RLS requires setting `app.current_tenant_id` at connection time. Coordinate with Platform on whether this is used.

---

## 9) Checklist Before Creating ERP Migration

- [ ] Table uses `erp_` prefix
- [ ] Has `id UUID PRIMARY KEY`
- [ ] Has `tenant_id UUID NOT NULL REFERENCES tenants(id)`
- [ ] Has `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- [ ] Has `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- [ ] Transactional tables have `version INTEGER NOT NULL DEFAULT 1`
- [ ] Appropriate indexes exist (at minimum: `tenant_id`)
- [ ] Unique constraints include `tenant_id` where applicable
- [ ] Foreign keys reference correct parent tables

---

## 10) What NOT to Do

- Do not create migrations that bypass Drizzle for schema changes
- Do not seed production data in migrations (use seed scripts)
- Do not hard-code tenant IDs in seeds
- Do not assume migration order across environments

---

**End of Doc**
