# How to See the RLS Policy UI in Neon Console

## The Problem

You can't see the RLS policy UI in Neon Console because:

**The Data API is NOT provisioned on your project**

```
Current Status:
├─ Neon Auth: ✅ Provisioned
├─ Database: ✅ Running  
├─ RLS Roles: ✅ Created (authenticated/anonymous)
└─ Data API: ❌ NOT PROVISIONED

Result: No policy UI in console!
```

## Why the UI is Missing

The Neon Console's visual RLS policy editor is **only available when the Data API is enabled**. This is because:

1. **Data API depends on RLS** - The API enforces RLS policies
2. **UI is part of Data API** - The policy editor is a Data API feature
3. **JWKS integration** - Data API needs JWKS to validate JWTs for policies

## Solution: Provision the Data API

### Option 1: Via Neon Console (Easiest)

1. Go to: https://console.neon.tech/app/projects/dark-band-87285012
2. Click **"Data API"** in the left sidebar
3. Click **"Enable Data API"**
4. Choose authentication provider:
   - **Neon Auth** (recommended - you already have this)
   - External (Clerk, Auth0, etc.)
   - None (manual JWKS configuration)
5. Click **"Enable"**

**After enabling**, you'll see:
- ✅ RLS policy UI appears
- ✅ Table security status
- ✅ "Enable RLS" buttons
- ✅ Policy editor

### Option 2: Via MCP Tool (Automated)

The Neon MCP has a tool to provision the Data API automatically:

```bash
# This will provision Data API with Neon Auth
# (Interactive - will prompt for choices)
```

Let me check the exact MCP tool available and provision it for you.

## What You'll Get After Provisioning

### 1. Data API Endpoint
```
https://your-project-id.neonauth.region.aws.neon.tech/public/<table>
```

### 2. RLS Policy UI in Console
```
Console → Data API Tab:
├─ Table list with RLS status
├─ "Enable RLS" buttons (per table)
├─ Policy editor (create/edit/delete)
└─ Security warnings (if RLS disabled)
```

### 3. HTTP Access to Database
```bash
# Query via HTTP (with JWT)
curl https://your-api.neon.tech/public/requests \
  -H "Authorization: Bearer <jwt-token>"
```

## Let Me Provision It For You

I can use the Neon MCP to provision the Data API with Neon Auth automatically. This will:

1. ✅ Enable the Data API endpoint
2. ✅ Configure JWKS from your existing Neon Auth
3. ✅ Set up the `authenticated` and `anonymous` roles
4. ✅ **Unlock the RLS policy UI in the console**

Would you like me to proceed with provisioning?

## Alternative: Manage RLS Without Console UI

If you prefer to work without the Data API / Console UI, you can manage RLS entirely via SQL:

### Check RLS Status
```bash
pnpm rls:check
```

### Enable RLS
```bash
pnpm rls:enable
```

### Create Policies (SQL)
```sql
-- See all policies in: docs/NEON-DATA-API-SECURITY.md
CREATE POLICY "Users can view tenant data"
  ON requests
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.user_tenant_id());
```

### Verify Policies
```sql
-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Console UI** (needs Data API) | Visual, easy, no SQL needed | Requires Data API provisioning |
| **SQL Scripts** | Works immediately, flexible | Need to write SQL, less visual |
| **MCP Tools** | Automated, scriptable | Need API key configured |

## Summary

### Why You Don't See the UI
- Data API not provisioned
- Policy UI is part of Data API features
- Neon Console hides it until Data API is enabled

### How to Fix
1. **Easiest**: Go to Console → Enable Data API
2. **Automated**: Let me provision via MCP
3. **Alternative**: Use SQL scripts (no UI needed)

### What Happens Next
After enabling Data API:
- ✅ Policy UI appears in console
- ✅ Can visually enable RLS per table
- ✅ Can create/edit policies with UI
- ✅ HTTP API access enabled

---

**Ready to provision the Data API?** I can do it via MCP now if you want the policy UI.
