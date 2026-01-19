-- Migration: 0001_tenant_isolation_rls
-- Purpose: Add Row-Level Security policies and performance indexes for tenant isolation
-- Status: Applied manually to production DB, now tracked by Drizzle

-- ============================================================================
-- PART 1: Performance Indexes for Tenant-Scoped Queries
-- ============================================================================

-- users table: tenant + email lookup (common for auth/user queries)
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);

-- users table: tenant + id lookup (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id, id);

-- requests table: tenant + status (common for dashboard/filtering)
CREATE INDEX IF NOT EXISTS idx_requests_tenant_status ON requests(tenant_id, status);

-- requests table: tenant + id lookup (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_requests_tenant_id ON requests(tenant_id, id);

-- requests table: tenant + created_at (for sorting/pagination)
CREATE INDEX IF NOT EXISTS idx_requests_tenant_created ON requests(tenant_id, created_at DESC);

-- audit_logs table: tenant + created_at (for audit queries/retention)
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC) WHERE tenant_id IS NOT NULL;

-- audit_logs table: tenant + event_name (for filtering specific events)
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_event ON audit_logs(tenant_id, event_name) WHERE tenant_id IS NOT NULL;

-- ============================================================================
-- PART 2: Row-Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all multi-tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: users table
-- Requires: SET LOCAL app.current_tenant_id = '<tenant_id>';
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy: requests table
CREATE POLICY tenant_isolation_requests ON requests
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS Policy: audit_logs table
-- Special case: allows NULL tenant_id (global events) + matching tenant events
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id::text = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id IS NULL OR tenant_id::text = current_setting('app.current_tenant_id', true));
