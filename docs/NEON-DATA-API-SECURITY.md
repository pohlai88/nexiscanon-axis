# Neon Data API Security Implementation Guide

## Current Status Analysis

### ✅ Configured
- **Roles**: `authenticated` and `anonymous` roles exist
- **Neon Auth**: Provisioned and active
- **JWKS**: Configured at `https://ep-fancy-wildflower-a1o82bpk.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json`

### ⚠️ Security Gaps
- **RLS Disabled**: All 7 public tables have Row-Level Security disabled
- **No Policies**: No RLS policies exist to filter data by user/tenant
- **Open Access**: Any authenticated user can see ALL data across ALL tenants

### 🚨 Risk Level: HIGH
Without RLS, your multi-tenant application is **not secure**. Any authenticated user can:
- Read all requests from all tenants
- View all audit logs
- Access all evidence files
- See all user data across tenants

## Security Architecture

### Two-Layer Security Model

```
┌─────────────────────────────────────────────────────────┐
│            HTTP Request with JWT                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
         ┌───────────────────────┐
         │ Layer 1: Role Grants  │
         │ (Can user access      │
         │  this table?)         │
         └───────────┬───────────┘
                     │
                     ↓ YES
         ┌───────────────────────┐
         │ Layer 2: RLS Policies │
         │ (Which specific rows  │
         │  can user see?)       │
         └───────────┬───────────┘
                     │
                     ↓
              ┌──────────────┐
              │ Filtered Data│
              └──────────────┘
```

### Your Application's Security Model

**Multi-Tenant Architecture**:
- Each row belongs to a `tenant_id`
- Users belong to tenants (`users.tenant_id`)
- Current user determined by JWT `sub` claim

**Security Strategy**:
1. Filter by `tenant_id` (primary security boundary)
2. Filter by `user_id` (within tenant, when applicable)
3. Enforce via RLS policies (not application code)

## Implementation Plan

### Phase 1: Enable RLS on All Tables ✅

```sql
-- Enable Row-Level Security on all public tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

**Impact**: Once enabled, **all access is blocked** until policies are created.

### Phase 2: Grant Schema Access

```sql
-- Ensure authenticated role has schema access
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table access (but RLS will filter rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES 
  IN SCHEMA public TO authenticated;

-- Grant access to sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES 
  IN SCHEMA public TO authenticated;

-- Ensure future tables automatically get permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
```

### Phase 3: Create Helper Functions

```sql
-- Get current user's ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT tenant_id FROM users WHERE id = auth.user_id();
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
      AND role = 'admin'
  );
$$;
```

### Phase 4: Create RLS Policies

#### 1. Tenants Table

```sql
-- Users can only see their own tenant
CREATE POLICY "Users can view own tenant"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (id = auth.user_tenant_id());

-- Only admins can create/update tenants
CREATE POLICY "Admins can manage tenants"
  ON tenants
  FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());
```

#### 2. Users Table

```sql
-- Users can see other users in their tenant
CREATE POLICY "Users can view tenant members"
  ON users
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.user_tenant_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.user_id())
  WITH CHECK (id = auth.user_id() AND tenant_id = auth.user_tenant_id());

-- Only admins can create/delete users
CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());
```

#### 3. Requests Table

```sql
-- Users can view requests in their tenant
CREATE POLICY "Users can view tenant requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.user_tenant_id());

-- Users can create requests in their tenant
CREATE POLICY "Users can create requests"
  ON requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    AND user_id = auth.user_id()
  );

-- Users can update their own requests (if not approved)
CREATE POLICY "Users can update own pending requests"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    AND user_id = auth.user_id()
    AND status = 'pending'
  )
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    AND user_id = auth.user_id()
  );

-- Approvers can update any request in their tenant
CREATE POLICY "Approvers can update requests"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.user_id()
        AND role IN ('approver', 'admin')
    )
  );
```

#### 4. Request Templates Table

```sql
-- Users can view templates in their tenant
CREATE POLICY "Users can view tenant templates"
  ON request_templates
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.user_tenant_id());

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON request_templates
  FOR ALL
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
    AND auth.is_admin()
  )
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    AND auth.is_admin()
  );
```

#### 5. Evidence Files Table

```sql
-- Users can view evidence files for requests they can see
CREATE POLICY "Users can view accessible evidence"
  ON evidence_files
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = auth.user_tenant_id()
  );

-- Users can upload evidence for their own requests
CREATE POLICY "Users can upload evidence"
  ON evidence_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = auth.user_tenant_id()
    AND uploaded_by = auth.user_id()
  );
```

#### 6. Request Evidence Links Table

```sql
-- Users can see links for requests they can access
CREATE POLICY "Users can view request evidence links"
  ON request_evidence_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = request_evidence_links.request_id
        AND requests.tenant_id = auth.user_tenant_id()
    )
  );

-- Users can create links for their requests
CREATE POLICY "Users can link evidence to requests"
  ON request_evidence_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = request_evidence_links.request_id
        AND requests.tenant_id = auth.user_tenant_id()
        AND requests.user_id = auth.user_id()
    )
  );
```

#### 7. Audit Logs Table

```sql
-- All users can view audit logs for their tenant
CREATE POLICY "Users can view tenant audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.user_tenant_id());

-- System can insert audit logs (via service role or trigger)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- No one can update or delete audit logs (immutability)
-- (No UPDATE/DELETE policies = implicitly denied)
```

## Testing RLS Policies

### Test Scenario 1: User Can Only See Own Tenant Data

```sql
-- Simulate user from tenant A
SET request.jwt.claims = '{"sub": "user-tenant-a-id"}';

-- Should only see tenant A requests
SELECT * FROM requests;

-- Simulate user from tenant B
SET request.jwt.claims = '{"sub": "user-tenant-b-id"}';

-- Should only see tenant B requests (different data)
SELECT * FROM requests;
```

### Test Scenario 2: User Cannot Update Other Users' Requests

```sql
SET request.jwt.claims = '{"sub": "user1-id"}';

-- Try to update user2's request (should fail)
UPDATE requests 
SET status = 'approved' 
WHERE user_id = 'user2-id';
-- Result: No rows updated (RLS blocks it)
```

### Test Scenario 3: Admin Can Manage All Resources

```sql
SET request.jwt.claims = '{"sub": "admin-user-id"}';

-- Admin can update any request in their tenant
UPDATE requests 
SET status = 'approved' 
WHERE id = 'any-request-id';
-- Result: Success (if admin role)
```

## Integration with Existing Code

### Update Schema (Add user_id defaults)

```sql
-- Add default user_id to requests (if not already present)
ALTER TABLE requests
  ALTER COLUMN user_id SET DEFAULT auth.user_id();

-- Add default user_id to evidence_files
ALTER TABLE evidence_files
  ADD COLUMN IF NOT EXISTS uploaded_by text DEFAULT auth.user_id();

-- Add default user_id to audit_logs
ALTER TABLE audit_logs
  ALTER COLUMN user_id SET DEFAULT auth.user_id();
```

### Application Code Changes

**Before (No RLS):**
```typescript
// Application had to filter by tenant manually
const requests = await db
  .select()
  .from(requests)
  .where(eq(requests.tenantId, currentUser.tenantId));
```

**After (With RLS):**
```typescript
// RLS automatically filters by tenant!
const requests = await db
  .select()
  .from(requests);
// Only returns current user's tenant data
```

### API Route Example

```typescript
// app/api/requests/route.ts
export async function GET(request: Request) {
  // JWT automatically handled by Neon Data API
  // RLS automatically filters by tenant
  
  const db = getDb();
  const requests = await db
    .select()
    .from(requests)
    .limit(50);
  
  // Guaranteed to only contain current tenant's requests
  return Response.json(requests);
}
```

## Deployment Script

```bash
#!/bin/bash
# deploy-rls-security.sh

echo "🔒 Deploying RLS Security..."

# 1. Enable RLS on all tables
pnpm tsx scripts/enable-rls.ts

# 2. Create helper functions
pnpm tsx scripts/create-auth-functions.ts

# 3. Create RLS policies
pnpm tsx scripts/create-rls-policies.ts

# 4. Verify RLS status
pnpm tsx scripts/verify-rls.ts

echo "✅ RLS Security deployed!"
```

## Monitoring & Verification

### Check RLS Status

```sql
-- View RLS status for all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled (SECURITY RISK!)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### List All Policies

```sql
-- View all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test Policy Effectiveness

```bash
# Run RLS test suite
pnpm tsx scripts/test-rls-policies.ts
```

## Security Checklist

### Before Deploying to Production

- [ ] RLS enabled on ALL public tables
- [ ] Policies created for ALL tables
- [ ] Helper functions (`auth.user_id()`, `auth.user_tenant_id()`) working
- [ ] Test with multiple users from different tenants
- [ ] Test admin vs regular user permissions
- [ ] Test read-after-write scenarios
- [ ] Verify audit logs are immutable
- [ ] Review all `GRANT` statements
- [ ] Test anonymous role (should have no access)
- [ ] Monitor pg_stat_statements for policy performance

### Production Monitoring

```sql
-- Check for tables without RLS
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;
-- Result should be empty!

-- Check for tables with RLS but no policies
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL;
-- Result should be empty!
```

## Performance Considerations

### RLS Impact
- **Minimal overhead** for simple policies (< 1ms)
- Policies are evaluated **per query** (not per row)
- Use indexes on filtered columns (`tenant_id`, `user_id`)

### Optimization

```sql
-- Add indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_requests_tenant_id ON requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evidence_files_tenant_id ON evidence_files(tenant_id);
```

## Next Steps

1. **Review policies** for your specific business logic
2. **Test thoroughly** with real user scenarios
3. **Deploy to staging** first
4. **Monitor performance** with pg_stat_statements
5. **Enable in production** after validation

---

**Current Risk**: 🚨 **HIGH** (No RLS = No tenant isolation)
**After Implementation**: ✅ **LOW** (Database-enforced security)
**Recommended Action**: **Deploy RLS immediately**
