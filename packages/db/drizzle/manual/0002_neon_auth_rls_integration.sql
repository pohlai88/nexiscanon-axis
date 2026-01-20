-- Migration: 0002_neon_auth_rls_integration
-- Purpose: Integrate Neon Auth JWT with RLS policies for multi-tenant security
-- Applied: 2026-01-20
-- 
-- ARCHITECTURE:
-- This migration connects Neon Auth (neon_auth schema) with your multi-tenant
-- application schema (public schema) using Row-Level Security (RLS).
--
-- Key Components:
-- 1. Helper function to get tenant_id from public.users using JWT user_id
-- 2. RLS policies that use auth.user_id() from Neon Auth pg_session_jwt extension
-- 3. Tenant isolation enforced at database level
--
-- How it works:
-- - Neon Auth issues JWTs with user_id in 'sub' claim
-- - auth.user_id() extracts 'sub' from JWT (C extension, fast)
-- - public.get_current_user_tenant_id() looks up tenant_id from public.users
-- - RLS policies filter all queries by tenant_id automatically

-- ============================================================================
-- PART 1: Helper Functions
-- ============================================================================

-- Function to get current user's tenant_id from public.users
-- Uses auth.user_id() which reads JWT 'sub' claim via Neon Auth extension
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM public.users
  WHERE id::text = auth.user_id()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_current_user_tenant_id() IS 
  'Returns tenant_id for current authenticated user. Uses auth.user_id() from Neon Auth JWT (pg_session_jwt extension).';

-- ============================================================================
-- PART 2: Drop Existing RLS Policies (if any)
-- ============================================================================

DROP POLICY IF EXISTS tenant_isolation_users ON public.users;
DROP POLICY IF EXISTS tenant_isolation_requests ON public.requests;
DROP POLICY IF EXISTS tenant_isolation_request_templates ON public.request_templates;
DROP POLICY IF EXISTS tenant_isolation_evidence_files ON public.evidence_files;
DROP POLICY IF EXISTS tenant_isolation_request_evidence_links ON public.request_evidence_links;
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS tenant_isolation_tenants ON public.tenants;

-- ============================================================================
-- PART 3: Create RLS Policies Using Neon Auth JWT
-- ============================================================================

-- RLS Policy: users table
-- Users can only see/modify users in their own tenant
CREATE POLICY tenant_isolation_users ON public.users
  FOR ALL
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

-- RLS Policy: requests table
CREATE POLICY tenant_isolation_requests ON public.requests
  FOR ALL
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

-- RLS Policy: request_templates table
CREATE POLICY tenant_isolation_request_templates ON public.request_templates
  FOR ALL
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

-- RLS Policy: evidence_files table
CREATE POLICY tenant_isolation_evidence_files ON public.evidence_files
  FOR ALL
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

-- RLS Policy: request_evidence_links table
CREATE POLICY tenant_isolation_request_evidence_links ON public.request_evidence_links
  FOR ALL
  TO authenticated
  USING (tenant_id = public.get_current_user_tenant_id())
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

-- RLS Policy: audit_logs table
-- Special case: allows NULL tenant_id for global system events
CREATE POLICY tenant_isolation_audit_logs ON public.audit_logs
  FOR ALL
  TO authenticated
  USING (tenant_id IS NULL OR tenant_id = public.get_current_user_tenant_id())
  WITH CHECK (tenant_id IS NULL OR tenant_id = public.get_current_user_tenant_id());

-- RLS Policy: tenants table
-- Users can only view their own tenant (SELECT only, no modifications)
CREATE POLICY tenant_isolation_tenants ON public.tenants
  FOR SELECT
  TO authenticated
  USING (id = public.get_current_user_tenant_id());

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- After applying this migration, verify with:
--
-- 1. Check policies are created:
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
--
-- 2. Test auth functions (requires authenticated session):
-- SELECT auth.user_id() as user_id;
-- SELECT public.get_current_user_tenant_id() as tenant_id;
--
-- 3. Test RLS (requires authenticated session with JWT):
-- SELECT * FROM users;  -- Should only return users in your tenant
-- SELECT * FROM requests;  -- Should only return requests in your tenant
