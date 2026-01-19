# help010-erp-postgres-discipline.md

**Status:** SUPPORTING (Help)  
**Source:** PostgreSQL Official Documentation (https://www.postgresql.org/docs/current/)  
**Goal:** Codify PostgreSQL best practices for ERP storage layer decisions.

---

## 0) Why This Exists

PostgreSQL documentation is the authoritative source for storage-layer decisions. This document translates PostgreSQL best practices into concrete rules for AXIS ERP.

---

## 1) Data Types (SSOT)

### 1.1 Identifiers

| Use Case | Type | Rationale |
|----------|------|-----------|
| Primary keys | `UUID` | Globally unique, no sequence contention, safe for distributed systems |
| Foreign keys | `UUID` | Match parent PK type |
| Human-readable codes | `TEXT` | Variable length, no padding issues |

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Source:** [PostgreSQL UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html)

### 1.2 Text

| Use Case | Type | Rationale |
|----------|------|-----------|
| Names, descriptions | `TEXT` | No artificial length limits |
| Codes (SKU, doc_no) | `TEXT` | Use CHECK constraints for validation |
| Enums (status) | `TEXT` with CHECK | Flexible, no DDL for new values |

```sql
name TEXT NOT NULL,
status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'VOID'))
```

**Note:** PostgreSQL `TEXT` has no performance penalty vs `VARCHAR(n)`.

**Source:** [PostgreSQL Character Types](https://www.postgresql.org/docs/current/datatype-character.html)

### 1.3 Money/Amounts

See `help012-erp-money-currency.md` for full discipline.

**Summary:**
- Use `BIGINT` for amounts in smallest currency unit (cents)
- Or `NUMERIC(19, 4)` for sub-cent precision
- Never use `FLOAT`, `REAL`, or `DOUBLE PRECISION` for money

```sql
-- Recommended: integer cents
total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents >= 0)

-- Alternative: decimal
total_amount NUMERIC(19, 4) NOT NULL CHECK (total_amount >= 0)
```

**Source:** [PostgreSQL Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html)

### 1.4 Timestamps

Always use `TIMESTAMPTZ` (timestamp with time zone):

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

**Why not `TIMESTAMP`?**
- `TIMESTAMP` stores wall-clock time without timezone context
- `TIMESTAMPTZ` stores as UTC internally, displays in session timezone
- Mixing them causes bugs when servers/clients are in different timezones

**Source:** [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)

### 1.5 Booleans

Use native `BOOLEAN`:

```sql
is_active BOOLEAN NOT NULL DEFAULT true
```

### 1.6 JSON

Use `JSONB` (binary JSON) for semi-structured data:

```sql
metadata JSONB NOT NULL DEFAULT '{}'::JSONB
```

**When to use JSONB:**
- Extensible attributes that vary per record
- Audit payloads (diff, before/after)
- Integration data from external systems

**When NOT to use JSONB:**
- Core business fields that need indexing/querying
- Relationships (use proper FKs)

**Source:** [PostgreSQL JSON Types](https://www.postgresql.org/docs/current/datatype-json.html)

---

## 2) Constraints (Defense in Depth)

### 2.1 NOT NULL

Default to `NOT NULL`. Make columns nullable only when business logic requires it.

```sql
-- Good: explicit about nullability
email TEXT,                    -- nullable (optional field)
name TEXT NOT NULL,            -- required
```

### 2.2 CHECK Constraints

Use CHECK for data validation at DB level:

```sql
-- Status enum
status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'VOID')),

-- Non-negative amounts
amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),

-- Currency code format
currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),

-- Quantity must be positive
qty NUMERIC(19, 4) NOT NULL CHECK (qty > 0)
```

### 2.3 UNIQUE Constraints

Include `tenant_id` in uniqueness constraints:

```sql
-- Partner code unique per tenant
UNIQUE (tenant_id, code),

-- Document number unique per tenant and type
UNIQUE (tenant_id, doc_type, doc_no)
```

### 2.4 Foreign Keys

Always define explicit foreign keys:

```sql
tenant_id UUID NOT NULL REFERENCES tenants(id),
partner_id UUID NOT NULL REFERENCES erp_partners(id),
product_id UUID NOT NULL REFERENCES erp_products(id)
```

**ON DELETE behavior:**
- `RESTRICT` (default): Prevent deletion if referenced
- `CASCADE`: Delete children when parent deleted (use carefully)
- `SET NULL`: Set FK to NULL when parent deleted

For ERP, prefer `RESTRICT` to prevent accidental data loss.

**Source:** [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

---

## 3) Indexes

### 3.1 Required Indexes

Every ERP table needs at minimum:

```sql
-- Tenant isolation (most queries filter by tenant)
CREATE INDEX idx_<table>_tenant ON <table>(tenant_id);

-- Common query patterns
CREATE INDEX idx_<table>_tenant_status ON <table>(tenant_id, status);
```

### 3.2 Index Types

| Type | Use Case |
|------|----------|
| B-tree (default) | Equality, range queries, sorting |
| GIN | JSONB fields, arrays, full-text search |
| GiST | Geometric data, ranges |

```sql
-- B-tree for standard queries
CREATE INDEX idx_erp_orders_tenant_date ON erp_sales_orders(tenant_id, created_at DESC);

-- GIN for JSONB
CREATE INDEX idx_erp_orders_metadata ON erp_sales_orders USING GIN (metadata);
```

### 3.3 Partial Indexes

For queries that filter on status:

```sql
-- Index only active drafts (smaller, faster)
CREATE INDEX idx_erp_orders_drafts 
    ON erp_sales_orders(tenant_id, created_at) 
    WHERE status = 'DRAFT';
```

**Source:** [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

---

## 4) Concurrency Control

### 4.1 Optimistic Locking Pattern

Add a version column to detect concurrent modifications:

```sql
version INTEGER NOT NULL DEFAULT 1
```

Update with version check:

```sql
UPDATE erp_sales_orders 
SET 
    status = 'APPROVED',
    version = version + 1,
    updated_at = now(),
    updated_by = $actor_id
WHERE id = $order_id AND version = $expected_version;

-- If affected_rows = 0, concurrent modification occurred
```

### 4.2 SELECT FOR UPDATE

For critical sections that need row locks:

```sql
SELECT * FROM erp_sales_orders 
WHERE id = $order_id 
FOR UPDATE NOWAIT;  -- Fail immediately if locked
```

Use sparingly. Prefer optimistic locking for most cases.

**Source:** [PostgreSQL Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html)

---

## 5) Transactions

### 5.1 ACID Guarantees

PostgreSQL provides full ACID. Use transactions for:

- Multi-table updates that must succeed/fail together
- Workflow transitions with side effects
- Audit event emission (same transaction as data change)

### 5.2 Isolation Levels

Default `READ COMMITTED` is sufficient for most ERP operations.

Use `SERIALIZABLE` only for:
- Financial calculations where phantom reads are dangerous
- Inventory allocation that must not oversell

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- critical operation
COMMIT;
```

**Source:** [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

---

## 6) Partitioning

### 6.1 When to Partition

Partition tables that will grow unbounded:
- Audit/event tables
- Log tables
- Historical transaction tables

### 6.2 Partition by Time (Recommended for Audit)

```sql
CREATE TABLE erp_audit_events (
    id UUID NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    tenant_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    actor_user_id UUID,
    command_id UUID,
    payload JSONB NOT NULL DEFAULT '{}',
    
    PRIMARY KEY (id, occurred_at)  -- include partition key in PK
) PARTITION BY RANGE (occurred_at);

-- Create monthly partitions
CREATE TABLE erp_audit_events_2026_01 
    PARTITION OF erp_audit_events 
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### 6.3 Partition Management

Automate partition creation:
- Create future partitions in advance (e.g., 3 months ahead)
- Archive old partitions (detach + move to cold storage)

**Source:** [PostgreSQL Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)

---

## 7) Functions and Triggers

### 7.1 Sequence Generation Function

```sql
CREATE OR REPLACE FUNCTION erp_next_sequence(
    p_tenant_id UUID, 
    p_sequence_key TEXT
) RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_next BIGINT;
    v_padding INTEGER;
    v_year_reset BOOLEAN;
    v_current_year INTEGER;
    v_now_year INTEGER;
BEGIN
    v_now_year := EXTRACT(YEAR FROM now());
    
    UPDATE erp_sequences 
    SET 
        next_value = CASE 
            WHEN year_reset AND current_year != v_now_year THEN 2  -- reset to 1, return 1
            ELSE next_value + 1 
        END,
        current_year = v_now_year
    WHERE tenant_id = p_tenant_id AND sequence_key = p_sequence_key
    RETURNING prefix, next_value - 1, padding, year_reset, current_year 
    INTO v_prefix, v_next, v_padding, v_year_reset, v_current_year;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sequence not found: % for tenant %', p_sequence_key, p_tenant_id;
    END IF;
    
    -- If year reset triggered, v_next is 1
    IF v_year_reset AND v_current_year != v_now_year THEN
        v_next := 1;
    END IF;
    
    RETURN v_prefix || v_now_year::TEXT || '-' || lpad(v_next::TEXT, v_padding, '0');
END;
$$ LANGUAGE plpgsql;
```

Usage: `SELECT erp_next_sequence('tenant-uuid', 'SALES_ORDER')` → `SO-2026-000001`

### 7.2 Updated_at Trigger

```sql
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON erp_sales_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
```

---

## 8) Query Patterns

### 8.1 Always Filter by Tenant

```sql
-- Every query MUST include tenant_id
SELECT * FROM erp_sales_orders 
WHERE tenant_id = $tenant_id AND status = 'DRAFT';
```

### 8.2 Pagination

Use keyset pagination for large result sets:

```sql
-- First page
SELECT * FROM erp_sales_orders 
WHERE tenant_id = $tenant_id 
ORDER BY created_at DESC, id DESC 
LIMIT 50;

-- Next page (using last row's values)
SELECT * FROM erp_sales_orders 
WHERE tenant_id = $tenant_id 
  AND (created_at, id) < ($last_created_at, $last_id)
ORDER BY created_at DESC, id DESC 
LIMIT 50;
```

**Why not OFFSET?** OFFSET scans and discards rows, getting slower as offset increases.

---

## 9) Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Use Instead |
|--------------|---------|-------------|
| `FLOAT` for money | Precision loss | `BIGINT` or `NUMERIC` |
| `TIMESTAMP` without TZ | Timezone bugs | `TIMESTAMPTZ` |
| `VARCHAR(n)` everywhere | Artificial limits | `TEXT` + CHECK |
| OFFSET pagination | Slow on large tables | Keyset pagination |
| Missing tenant_id filter | Cross-tenant data leak | Always filter |
| UPDATE without version check | Lost updates | Optimistic locking |
| Storing computed totals without lines | Data inconsistency | Derive or verify |

---

## 10) Performance Considerations

### 10.1 EXPLAIN ANALYZE

Before deploying new queries, verify execution plan:

```sql
EXPLAIN ANALYZE 
SELECT * FROM erp_sales_orders 
WHERE tenant_id = $tenant_id AND status = 'DRAFT';
```

Look for:
- Index scans (good) vs Seq scans (bad for large tables)
- Row estimates vs actual rows (stats accuracy)
- Sort operations (add index if sorting is slow)

### 10.2 Connection Pooling

Use connection pooling (e.g., PgBouncer, Neon's built-in pooler) to avoid connection overhead.

---

**End of Doc**
