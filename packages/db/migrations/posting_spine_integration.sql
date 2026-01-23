-- Posting Spine Integration Migration
-- Generated: 2026-01-23
-- Implements: F01-DB-GOVERNED.md + B01-DOCUMENTATION.md

-- ============================================================================
-- 1. Update tenants table (add missing columns)
-- ============================================================================

-- Add type column if not exists
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS type varchar(20) NOT NULL DEFAULT 'organization';

-- Add parent_id column if not exists  
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS parent_id uuid;

-- Add foreign key for parent_id (self-reference)
ALTER TABLE tenants ADD CONSTRAINT tenants_parent_id_fkey 
  FOREIGN KEY (parent_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Update unique index naming (F01 B4 convention)
DROP INDEX IF EXISTS tenants_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_unique ON tenants(slug);

-- ============================================================================
-- 2. Update audit_logs table (add 6W1H context - F01 LAW F01-07)
-- ============================================================================

-- Add 6W1H context columns
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS who varchar(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS what text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "where" varchar(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS why text;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS how varchar(100);

-- Update metadata to jsonb if it's text
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'metadata' AND data_type = 'text'
  ) THEN
    ALTER TABLE audit_logs ALTER COLUMN metadata TYPE jsonb USING metadata::jsonb;
    ALTER TABLE audit_logs ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update ip_address from inet to varchar(45) for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address' AND data_type = 'inet'
  ) THEN
    ALTER TABLE audit_logs ALTER COLUMN ip_address TYPE varchar(45) USING host(ip_address);
  END IF;
END $$;

-- Add DESC index on created_at (F01 D3)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 3. Add CHECK constraints to journal_entries (F01 LAW F01-05)
-- ============================================================================

-- Add CHECK constraint: balanced journal (Debits = Credits)
ALTER TABLE journal_entries 
  ADD CONSTRAINT IF NOT EXISTS journal_entries_balanced 
  CHECK (total_debit = total_credit);

-- Add CHECK constraint: positive amounts
ALTER TABLE journal_entries 
  ADD CONSTRAINT IF NOT EXISTS journal_entries_amounts_positive 
  CHECK (total_debit >= 0 AND total_credit >= 0);

-- ============================================================================
-- 4. Add RLS policy to journal_entries (F01 LAW F01-06)
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists (idempotent)
DROP POLICY IF EXISTS journal_entries_tenant_isolation ON journal_entries;

-- Create tenant isolation policy
CREATE POLICY journal_entries_tenant_isolation ON journal_entries
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- ============================================================================
-- 5. Update indexes on journal_entries (if needed)
-- ============================================================================

-- Ensure all required indexes exist
CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant ON journal_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON journal_entries(tenant_id, journal_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_doc_number ON journal_entries(tenant_id, document_number);
CREATE INDEX IF NOT EXISTS idx_journal_entries_effective ON journal_entries(tenant_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_period ON journal_entries(tenant_id, fiscal_year, fiscal_month);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source ON journal_entries(tenant_id, source_document_type, source_document_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tenants table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tenants'
ORDER BY ordinal_position;

-- Verify audit_logs 6W1H columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'audit_logs' AND column_name IN ('who', 'what', 'when', 'where', 'why', 'how')
ORDER BY ordinal_position;

-- Verify journal_entries CHECK constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'journal_entries'::regclass AND contype = 'c';

-- Verify journal_entries RLS policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'journal_entries';
