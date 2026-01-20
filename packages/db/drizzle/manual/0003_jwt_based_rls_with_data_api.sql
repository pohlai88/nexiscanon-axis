-- Migration: 0003_jwt_based_rls_with_data_api
-- Purpose: Update RLS policies to use JWT claims from Neon Data API
-- Date: 2026-01-20
-- 
-- PREREQUISITE: Neon Data API must be provisioned
-- Status: ✅ Data API provisioned via Neon MCP
-- Endpoint: https://ep-fancy-wildflower-a1o82bpk.apirest.ap-southeast-1.aws.neon.tech/neondb/rest/v1
--
-- CHANGE: Replace database lookup with JWT claim reading
-- Before: tenant_id = public.get_current_user_tenant_id() (0.025ms lookup)
-- After:  tenant_id = (auth.jwt()->>'tenant_id')::uuid (0.001ms memory read)
--
-- HOW IT WORKS:
-- 1. User queries via Data API with Neon Auth JWT
-- 2. Data API validates JWT and looks up tenant_id from public.users
-- 3. Data API creates enriched JWT with tenant_id claim
-- 4. RLS policies read tenant_id directly from JWT (no database query)

-- ============================================================================
-- PART 1: Drop Old Policies (Database Lookup Pattern)
-- ============================================================================

DROP POLICY IF EXISTS tenant_isolation_users ON public.users;
DROP POLICY IF EXISTS tenant_isolation_requests ON public.requests;
DROP POLICY IF EXISTS tenant_isolation_request_templates ON public.request_templates;
DROP POLICY IF EXISTS tenant_isolation_evidence_files ON public.evidence_files;
DROP POLICY IF EXISTS tenant_isolation_request_evidence_links ON public.request_evidence_links;
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS tenant_isolation_tenants ON public.tenants;

-- ============================================================================
-- PART 2: Create New Policies (JWT Claim Pattern)
-- ============================================================================

-- Policy: users table
-- Users can only see/modify users in their tenant (tenant_id from JWT)
CREATE POLICY tenant_isolation_users ON public.users
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

COMMENT ON POLICY tenant_isolation_users ON public.users IS 
  'RLS policy using JWT claim (Data API). Filters users by tenant_id from auth.jwt().';

-- Policy: requests table
CREATE POLICY tenant_isolation_requests ON public.requests
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

COMMENT ON POLICY tenant_isolation_requests ON public.requests IS 
  'RLS policy using JWT claim (Data API). Filters requests by tenant_id from auth.jwt().';

-- Policy: request_templates table
CREATE POLICY tenant_isolation_request_templates ON public.request_templates
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

COMMENT ON POLICY tenant_isolation_request_templates ON public.request_templates IS 
  'RLS policy using JWT claim (Data API). Filters templates by tenant_id from auth.jwt().';

-- Policy: evidence_files table
CREATE POLICY tenant_isolation_evidence_files ON public.evidence_files
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

COMMENT ON POLICY tenant_isolation_evidence_files ON public.evidence_files IS 
  'RLS policy using JWT claim (Data API). Filters files by tenant_id from auth.jwt().';

-- Policy: request_evidence_links table
CREATE POLICY tenant_isolation_request_evidence_links ON public.request_evidence_links
  FOR ALL
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

COMMENT ON POLICY tenant_isolation_request_evidence_links ON public.request_evidence_links IS 
  'RLS policy using JWT claim (Data API). Filters links by tenant_id from auth.jwt().';

-- Policy: audit_logs table (special case: allows NULL tenant_id for global events)
CREATE POLICY tenant_isolation_audit_logs ON public.audit_logs
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = (auth.jwt()->>'tenant_id')::uuid)
  WITH CHECK (tenant_id IS NULL OR tenant_id = (auth.jwt()->>'tenant_id')::uuid);

COMMENT ON POLICY tenant_isolation_audit_logs ON public.audit_logs IS 
  'RLS policy using JWT claim (Data API). Allows NULL tenant_id (global) OR matching tenant_id from auth.jwt().';

-- Policy: tenants table (SELECT only - users can only view their own tenant)
CREATE POLICY tenant_isolation_tenants ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = (auth.jwt()->>'tenant_id')::uuid);

COMMENT ON POLICY tenant_isolation_tenants ON public.tenants IS 
  'RLS policy using JWT claim (Data API). Users can only SELECT their own tenant.';

-- ============================================================================
-- PART 3: Optional - Keep Helper Function for Non-Data API Queries
-- ============================================================================

-- NOTE: Keep public.get_current_user_tenant_id() for backward compatibility
-- It's still useful for direct PostgreSQL connections (Drizzle ORM, etc.)
-- Data API queries will use JWT claims; direct connections will use this function

COMMENT ON FUNCTION public.get_current_user_tenant_id() IS 
  'DEPRECATED for Data API (use JWT claims). Still useful for direct PostgreSQL connections.';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check all policies are using JWT claims:
-- SELECT 
--   schemaname, 
--   tablename, 
--   policyname,
--   CASE 
--     WHEN qual LIKE '%auth.jwt()%' THEN '✅ Uses JWT claim'
--     WHEN qual LIKE '%get_current_user_tenant_id%' THEN '❌ Uses database lookup'
--     ELSE '⚠️ Other method'
--   END as implementation
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- 2. Test JWT claim access (requires Data API request):
-- SELECT 
--   auth.jwt() as full_jwt,
--   auth.jwt()->>'sub' as user_id,
--   auth.jwt()->>'tenant_id' as tenant_id;

-- 3. Test RLS filtering:
-- SELECT * FROM requests;  -- Should only return YOUR tenant's requests

-- ============================================================================
-- ROLLBACK (If Needed)
-- ============================================================================

-- To rollback to database lookup pattern, run:
-- \i packages/db/drizzle/manual/0002_neon_auth_rls_integration.sql
