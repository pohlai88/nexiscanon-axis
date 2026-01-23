-- =============================================================================
-- STATUS: UNKNOWN
-- Origin: apps/web/db/migrations/001_add_tenant_hierarchy.sql
-- Moved: 2026-01-24
-- Action: Verify if this migration was applied and if Drizzle schema includes
--         these columns. May be safe to delete if already in production.
-- =============================================================================

-- Migration: Add tenant hierarchy support
-- Run this against existing databases to add type and parent_id columns
-- Date: 2026-01-21

-- Add type column with default 'organization' for existing tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'organization'
CHECK (type IN ('organization', 'team', 'personal'));

-- Add parent_id for team hierarchy
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tenants_type ON tenants(type);
CREATE INDEX IF NOT EXISTS idx_tenants_parent ON tenants(parent_id);

-- Verify
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tenants'
  AND column_name IN ('type', 'parent_id');
