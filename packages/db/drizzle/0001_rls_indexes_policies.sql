-- Migration: Enable RLS, Add Indexes, Create Policies
-- Inspired by Supabase RLS best practices
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security

-- ============================================================================
-- INDEXES (Performance optimization for RLS-filtered queries)
-- ============================================================================

-- Index on invitations.tenant_id for tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id 
  ON public.invitations (tenant_id);

-- Index on invitations.email for lookup by email
CREATE INDEX IF NOT EXISTS idx_invitations_email 
  ON public.invitations (email);

-- Index on invitations.token for token-based lookup
CREATE INDEX IF NOT EXISTS idx_invitations_token 
  ON public.invitations (token);

-- Index on tenant_users.user_id for user membership lookups
-- Note: tenant_id is already covered by composite PK
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id 
  ON public.tenant_users (user_id);

-- Index on users.auth_subject_id for auth lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_subject_id 
  ON public.users (auth_subject_id);

--> statement-breakpoint

-- ============================================================================
-- ENABLE ROW-LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint

-- ============================================================================
-- POLICIES: tenants table
-- ============================================================================

-- Users can view tenants they are members of
CREATE POLICY "Users can view their tenants"
  ON public.tenants
  FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
    )
  );

-- Only owners can update tenant settings
CREATE POLICY "Owners can update tenants"
  ON public.tenants
  FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role = 'owner'
    )
  );

-- Only owners can delete tenants
CREATE POLICY "Owners can delete tenants"
  ON public.tenants
  FOR DELETE
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role = 'owner'
    )
  );

-- Any authenticated user can create a tenant (they become owner)
CREATE POLICY "Authenticated users can create tenants"
  ON public.tenants
  FOR INSERT
  WITH CHECK (
    (SELECT current_setting('app.current_user_id', true)) IS NOT NULL
  );

--> statement-breakpoint

-- ============================================================================
-- POLICIES: invitations table
-- ============================================================================

-- Tenant admins+ can view invitations for their tenant
CREATE POLICY "Admins can view tenant invitations"
  ON public.invitations
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role IN ('owner', 'admin')
    )
  );

-- Tenant admins+ can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.invitations
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role IN ('owner', 'admin')
    )
  );

-- Tenant admins+ can delete (revoke) invitations
CREATE POLICY "Admins can delete invitations"
  ON public.invitations
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role IN ('owner', 'admin')
    )
  );

--> statement-breakpoint

-- ============================================================================
-- POLICIES: tenant_users table
-- ============================================================================

-- Users can view members of tenants they belong to
CREATE POLICY "Members can view tenant members"
  ON public.tenant_users
  FOR SELECT
  USING (
    tenant_id = (SELECT current_setting('app.current_tenant_id', true))::uuid
  );

-- Admins+ can add members to their tenant
CREATE POLICY "Admins can add members"
  ON public.tenant_users
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role IN ('owner', 'admin')
    )
  );

-- Admins+ can update member roles (except owners)
CREATE POLICY "Admins can update member roles"
  ON public.tenant_users
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role IN ('owner', 'admin')
    )
    -- Cannot modify owner role via RLS (requires app-level check)
    AND role != 'owner'
  );

-- Admins+ can remove members (except owners)
CREATE POLICY "Admins can remove members"
  ON public.tenant_users
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = (SELECT current_setting('app.current_user_id', true))::uuid
        AND role IN ('owner', 'admin')
    )
    -- Cannot remove owners via RLS
    AND role != 'owner'
  );

--> statement-breakpoint

-- ============================================================================
-- POLICIES: users table
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (
    id = (SELECT current_setting('app.current_user_id', true))::uuid
  );

-- Users can view profiles of members in their tenants
CREATE POLICY "Users can view tenant member profiles"
  ON public.users
  FOR SELECT
  USING (
    id IN (
      SELECT tu.user_id FROM public.tenant_users tu
      WHERE tu.tenant_id = (SELECT current_setting('app.current_tenant_id', true))::uuid
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (
    id = (SELECT current_setting('app.current_user_id', true))::uuid
  );

-- Users can insert their own profile (on first auth)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (
    id = (SELECT current_setting('app.current_user_id', true))::uuid
    OR (SELECT current_setting('app.current_user_id', true)) IS NULL
  );
