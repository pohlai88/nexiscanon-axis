-- Posting Spine Integration Migration (Simplified)
-- Generated: 2026-01-23
-- Implements: F01-DB-GOVERNED.md + B01-DOCUMENTATION.md

-- ============================================================================
-- 1. Update tenants table
-- ============================================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS type varchar(20) NOT NULL DEFAULT 'organization';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS parent_id uuid;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_parent_id_fkey;
ALTER TABLE tenants ADD CONSTRAINT tenants_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES tenants(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS tenants_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_unique ON tenants(slug);

-- ============================================================================
-- 2. Update audit_logs table (6W1H context)
-- ============================================================================

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS who varchar(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS what text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "where" varchar(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS why text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS how varchar(100);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 3. Add CHECK constraints to journal_entries
-- ============================================================================

ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_balanced;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_balanced CHECK (total_debit = total_credit);

ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_amounts_positive;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_amounts_positive CHECK (total_debit >= 0 AND total_credit >= 0);

-- ============================================================================
-- 4. Add RLS policy to journal_entries
-- ============================================================================

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS journal_entries_tenant_isolation ON journal_entries;
CREATE POLICY journal_entries_tenant_isolation ON journal_entries AS PERMISSIVE FOR ALL TO public USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ============================================================================
-- 5. Ensure indexes on journal_entries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant ON journal_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON journal_entries(tenant_id, journal_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(tenant_id, status);
