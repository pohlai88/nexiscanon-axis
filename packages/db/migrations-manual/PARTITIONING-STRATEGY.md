# ERP Audit Partitioning Strategy

**Status:** Phase 0 - Documented but not automated  
**When to implement:** Phase 1.5 or when audit volume requires it

## Current State (Phase 0)

The `erp_audit_events` table is created as a **regular table** with indexes. This is sufficient for Phase 0 and Phase 1.

## Partitioning Plan (Phase 1.5+)

When audit volume grows (estimated at 10K+ events/day per tenant), convert to time-based partitioning.

### Manual Migration (When Needed)

Create `packages/db/migrations-manual/000X_erp_audit_partitions.sql`:

```sql
-- Convert existing table to partitioned table
-- WARNING: This requires table rewrite. Run during maintenance window.

BEGIN;

-- Rename existing table
ALTER TABLE erp_audit_events RENAME TO erp_audit_events_old;

-- Create partitioned table
CREATE TABLE erp_audit_events (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tenant_id UUID NOT NULL,
    actor_user_id UUID,
    actor_type TEXT NOT NULL DEFAULT 'USER',
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    command_id UUID,
    trace_id TEXT,
    payload JSONB NOT NULL DEFAULT '{}',
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- Recreate indexes
CREATE INDEX idx_erp_audit_tenant_entity ON erp_audit_events(tenant_id, entity_type, entity_id);
CREATE INDEX idx_erp_audit_tenant_time ON erp_audit_events(tenant_id, occurred_at);
CREATE INDEX idx_erp_audit_entity_id ON erp_audit_events(entity_id, occurred_at);

-- Create initial partitions (3 months)
CREATE TABLE erp_audit_events_2026_01 PARTITION OF erp_audit_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE erp_audit_events_2026_02 PARTITION OF erp_audit_events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE erp_audit_events_2026_03 PARTITION OF erp_audit_events
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Copy data from old table
INSERT INTO erp_audit_events SELECT * FROM erp_audit_events_old;

-- Verify count
DO $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM erp_audit_events_old;
  SELECT COUNT(*) INTO new_count FROM erp_audit_events;
  
  IF old_count != new_count THEN
    RAISE EXCEPTION 'Row count mismatch: old=%, new=%', old_count, new_count;
  END IF;
END $$;

-- Drop old table (after verification)
DROP TABLE erp_audit_events_old;

COMMIT;
```

### Partition Maintenance Script

Create `scripts/maintain-audit-partitions.ts` to run monthly:

```typescript
// Create partitions 3 months ahead
// Archive partitions older than 7 years
// Run via cron: 0 0 1 * * (monthly on 1st)
```

## Gate Rule

**No gate enforcement for partitioning** - it's an optimization, not a compliance requirement.

## Retention Policy

- **Active partitions:** 7 years (84 months)
- **Archived to cold storage:** 10+ years
- Partitions older than retention can be detached and exported to S3/R2

## Decision Point

Implement partitioning when:
1. Audit table size > 10GB, OR
2. Query performance degrades on tenant history queries, OR
3. Compliance requires faster archive export

Until then: plain table with indexes is sufficient.
