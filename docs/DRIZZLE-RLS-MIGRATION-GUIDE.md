# Migrating to Drizzle Declarative RLS - NexusCanon AXIS

**Current State:** ✅ RLS enabled on all tables (SQL-based)  
**Target State:** Drizzle `crudPolicy` (declarative, maintainable)  
**Migration Impact:** Zero runtime changes, easier maintenance

---

## 📊 Why Migrate to Drizzle RLS?

### Current Approach (SQL Scripts)

```typescript
// scripts/enable-rls.ts
await sql`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`;
await sql`CREATE POLICY "tenant_policy" ON ${tableName} ...`;
```

**Problems:**
- ❌ RLS policies separate from schema
- ❌ Manual scripts (`enable-rls.ts`, `create-auth-functions.ts`)
- ❌ Easy to forget when adding new tables
- ❌ Hard to review (SQL scattered across files)
- ❌ No type safety
- ❌ Policies can drift from schema

### Drizzle Approach (Declarative)

```typescript
// packages/db/src/schema.ts
import { crudPolicy, authenticatedRole } from 'drizzle-orm/neon';

export const requests = pgTable("requests", {
  // ... columns ...
}, (table) => ({
  tenantPolicy: crudPolicy({
    role: authenticatedRole,
    read: sql`(tenant_id = auth.user_tenant_id())`,
    modify: sql`(tenant_id = auth.user_tenant_id())`,
  }),
}));
```

**Benefits:**
- ✅ RLS policies co-located with schema (single source of truth)
- ✅ Auto-generated in migrations (no manual SQL)
- ✅ Type-safe TypeScript
- ✅ Easier to review (all in one file)
- ✅ Can't forget (part of table definition)
- ✅ Policies always match schema

---

## 🎯 Migration Strategy

### Option 1: Gradual Migration (Recommended)

**Approach:** Migrate one table at a time, verify, continue.

**Benefits:**
- ✅ Low risk (incremental)
- ✅ Easy rollback
- ✅ Can test each table independently

**Timeline:** 1-2 hours

### Option 2: Big Bang Migration

**Approach:** Migrate all tables at once.

**Benefits:**
- ✅ Faster (single migration)
- ✅ Cleaner git history

**Risks:**
- ⚠️ Higher risk if issues arise
- ⚠️ Harder to debug

**Timeline:** 30 minutes

---

## 📋 Pre-Migration Checklist

### 1. Verify Current RLS Status

```bash
pnpm rls:check
```

**Expected output:**
```
✅ RLS Status Check

All public tables:
✅ tenants: RLS enabled
✅ users: RLS enabled
✅ requests: RLS enabled
✅ audit_logs: RLS enabled
✅ evidence_files: RLS enabled
✅ request_templates: RLS enabled
✅ request_evidence_links: RLS enabled

Security Score: 100%
```

### 2. Verify Auth Functions Exist

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'auth' 
  AND routine_name IN ('user_id', 'user_tenant_id');
```

**Expected:** Both functions exist.

### 3. Check Drizzle Version

```bash
pnpm list drizzle-orm drizzle-kit
```

**Required:**
- `drizzle-orm` >= 0.29.0 (RLS support)
- `drizzle-kit` >= 0.20.0 (RLS migrations)

**Update if needed:**
```bash
pnpm update drizzle-orm drizzle-kit
```

### 4. Backup Current Policies

```bash
# Export current policies for reference
pg_dump -h <host> -U <user> --schema-only -t 'public.*' > backup_policies.sql
```

---

## 🚀 Step-by-Step Migration

### Step 1: Update Schema with `crudPolicy`

See complete example: `docs/examples/schema-with-drizzle-rls.ts`

**Key pattern:**

```typescript
import { crudPolicy, authenticatedRole } from 'drizzle-orm/neon';
import { sql } from 'drizzle-orm';

// Helper for tenant-scoped access
const tenantScope = (tenantIdColumn: any) => 
  sql`(${tenantIdColumn} = auth.user_tenant_id())`;

export const yourTable = pgTable("your_table", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  // ... other columns
}, (table) => ({
  // Indexes
  tenantIdIdx: index("your_table_tenant_id_idx").on(table.tenantId),
  
  // RLS Policy
  tenantPolicy: crudPolicy({
    role: authenticatedRole,
    read: tenantScope(table.tenantId),
    modify: tenantScope(table.tenantId),
  }),
}));
```

### Step 2: Generate Migration

```bash
cd packages/db
pnpm db:generate
```

**Expected output:**
```
8 tables
...
requests 10 columns 4 indexes 1 policies 1 fks
users 6 columns 1 indexes 1 policies 1 fks
...

[✓] Your SQL migration file ➜ drizzle/0007_add_rls_policies.sql 🚀
```

### Step 3: Review Generated Migration

```bash
cat packages/db/drizzle/0007_add_rls_policies.sql
```

**Expected SQL:**
```sql
-- Drop old policies (if any)
DROP POLICY IF EXISTS "tenant_policy" ON "requests";

-- Create new Drizzle-managed policies
CREATE POLICY "crudPolicy_requests_authenticated" 
  ON "requests" 
  FOR ALL 
  TO "authenticated" 
  USING (tenant_id = auth.user_tenant_id()) 
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- Repeat for each table...
```

### Step 4: Apply Migration

**Option A: Via Neon MCP (recommended)**

```typescript
import { mcp_Neon_run_sql_transaction } from './mcp-tools';

const migrationSql = fs.readFileSync(
  'packages/db/drizzle/0007_add_rls_policies.sql', 
  'utf-8'
).split('-->statement-breakpoint');

await mcp_Neon_run_sql_transaction({
  projectId: 'dark-band-87285012',
  databaseName: 'neondb',
  sqlStatements: migrationSql,
});
```

**Option B: Via Drizzle CLI**

```bash
cd packages/db
DATABASE_URL=<your-url> pnpm db:migrate
```

### Step 5: Verify Policies Applied

```bash
pnpm rls:check
```

**Expected:** Same 100% security score, but policies now Drizzle-managed.

### Step 6: Test Queries

```typescript
import { getDb } from '@workspace/db/client';
import { requests } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';

// Set JWT context (simulating authenticated user)
const tenantId = '...';
await db.execute(sql`SELECT set_config('request.jwt.claims', 
  '{"tenant_id": "${tenantId}"}', true)`);

// Query should still work (RLS enforced)
const data = await getDb()
  .select()
  .from(requests)
  .where(eq(requests.tenantId, tenantId));

console.log('✅ Queries working with Drizzle RLS');
```

### Step 7: Clean Up Old Scripts

```bash
# Archive old RLS scripts (keep for reference)
mkdir scripts/archive
mv scripts/enable-rls.ts scripts/archive/
mv scripts/create-auth-functions.ts scripts/archive/

# Update package.json (remove old scripts)
# Remove: rls:enable, rls:create-functions
```

---

## 🎓 Drizzle RLS Patterns for Your Project

### Pattern 1: Tenant-Scoped Access (Most Tables)

```typescript
export const yourTable = pgTable("your_table", {
  // ... columns with tenant_id
}, (table) => ({
  tenantPolicy: crudPolicy({
    role: authenticatedRole,
    read: sql`(tenant_id = auth.user_tenant_id())`,
    modify: sql`(tenant_id = auth.user_tenant_id())`,
  }),
}));
```

**Use for:** `users`, `requests`, `audit_logs`, `evidence_files`, etc.

### Pattern 2: User-Owned Data

```typescript
export const evidenceFiles = pgTable("evidence_files", {
  uploadedBy: uuid("uploaded_by").notNull(),
  // ... other columns
}, (table) => ({
  // Tenant-scoped read/create
  tenantPolicy: crudPolicy({
    role: authenticatedRole,
    read: sql`(tenant_id = auth.user_tenant_id())`,
    modify: sql`(tenant_id = auth.user_tenant_id())`,
  }),
  
  // User-scoped delete (only uploader can delete)
  deleteOwnPolicy: pgPolicy("delete_own_uploads", {
    for: "delete",
    to: authenticatedRole,
    using: sql`(uploaded_by = auth.user_id())`,
  }),
}));
```

**Use for:** Files, uploads, personal data.

### Pattern 3: Complex Relationships

```typescript
export const requestEvidenceLinks = pgTable("request_evidence_links", {
  requestId: uuid("request_id").references(() => requests.id),
  evidenceFileId: uuid("evidence_file_id").references(() => evidenceFiles.id),
}, (table) => ({
  // Basic tenant-scoped policy
  tenantPolicy: crudPolicy({
    role: authenticatedRole,
    read: sql`(tenant_id = auth.user_tenant_id())`,
    modify: sql`(tenant_id = auth.user_tenant_id())`,
  }),
  
  // Advanced: Only link evidence to requests you can access
  linkPolicy: pgPolicy("link_accessible_evidence", {
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`(
      EXISTS (
        SELECT 1 FROM requests r
        WHERE r.id = request_id 
        AND r.tenant_id = auth.user_tenant_id()
      )
      AND EXISTS (
        SELECT 1 FROM evidence_files ef
        WHERE ef.id = evidence_file_id
        AND ef.tenant_id = auth.user_tenant_id()
      )
    )`,
  }),
}));
```

**Use for:** Join tables, relationships.

### Pattern 4: Time-Limited Updates

```typescript
export const requests = pgTable("requests", {
  createdAt: timestamp("created_at").defaultNow(),
  // ... other columns
}, (table) => ({
  // Read/insert/delete: tenant-scoped
  crudPolicy({
    role: authenticatedRole,
    read: sql`(tenant_id = auth.user_tenant_id())`,
    modify: null, // Handled by custom policies below
  }),
  
  // Insert: tenant-scoped
  insertPolicy: pgPolicy("create_requests", {
    for: "insert",
    to: authenticatedRole,
    withCheck: sql`(tenant_id = auth.user_tenant_id())`,
  }),
  
  // Update: only within 24 hours
  updatePolicy: pgPolicy("update_requests_24h", {
    for: "update",
    to: authenticatedRole,
    using: sql`(tenant_id = auth.user_tenant_id())`,
    withCheck: sql`(
      tenant_id = auth.user_tenant_id() 
      AND created_at > now() - interval '24 hours'
    )`,
  }),
  
  // Delete: tenant-scoped
  deletePolicy: pgPolicy("delete_requests", {
    for: "delete",
    to: authenticatedRole,
    using: sql`(tenant_id = auth.user_tenant_id())`,
  }),
}));
```

**Use for:** Time-sensitive data, status-based workflows.

---

## 🔍 Verification Checklist

### After Migration

- [ ] Run `pnpm rls:check` → 100% security score
- [ ] Run `pnpm db:performance` → No slow queries
- [ ] Test authenticated queries → Works
- [ ] Test unauthenticated queries → Blocked
- [ ] Test cross-tenant queries → Blocked
- [ ] Review generated SQL migration → Correct
- [ ] Git commit migration → Tracked

---

## 🛠️ Troubleshooting

### Issue 1: `crudPolicy` Not Found

**Error:**
```
Cannot find name 'crudPolicy'
```

**Solution:**
```bash
pnpm update drizzle-orm@latest
```

Ensure version >= 0.29.0.

### Issue 2: Auth Functions Not Found

**Error:**
```
function auth.user_tenant_id() does not exist
```

**Solution:**
```bash
pnpm rls:create-functions
```

Or manually create:
```sql
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS UUID AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'tenant_id',
    ''
  )::uuid;
$$ LANGUAGE SQL STABLE;
```

### Issue 3: Policies Not Generated

**Symptom:** Migration file has no policies.

**Solution:**
1. Check Drizzle version (`>= 0.29.0`)
2. Ensure `crudPolicy` is in table definition's return object
3. Run `pnpm db:generate` with verbose flag:
   ```bash
   DRIZZLE_VERBOSE=true pnpm db:generate
   ```

### Issue 4: Conflicting Policies

**Error:**
```
policy "tenant_policy" for table "requests" already exists
```

**Solution:**
Add `DROP POLICY` to migration:
```sql
-- Drop old policies first
DROP POLICY IF EXISTS "tenant_policy" ON "requests";

-- Then create new policies
CREATE POLICY "crudPolicy_requests_authenticated" ...
```

---

## 📚 Related Documentation

- [Drizzle RLS Official Docs](https://orm.drizzle.team/docs/rls)
- [Neon Data API + RLS](/docs/data-api/get-started)
- [Your Current RLS Guide](./WHY-NEON-NO-DEFAULT-RLS.md)
- [Neon Auth Functions](./NEON-DATA-API-SECURITY.md)
- [Example Schema with RLS](./examples/schema-with-drizzle-rls.ts)

---

## 🎯 Summary

### Before Migration

```
RLS Implementation:
├─ SQL Scripts (enable-rls.ts, create-auth-functions.ts)
├─ Manual policy creation
├─ Separate from schema
└─ Hard to maintain

Risk: Easy to forget when adding new tables
```

### After Migration

```
RLS Implementation:
├─ Declarative in schema (crudPolicy)
├─ Auto-generated in migrations
├─ Co-located with table definitions
└─ Type-safe TypeScript

Risk: None (part of schema definition)
```

### Migration Impact

- **Runtime:** Zero changes (same SQL policies)
- **Developer Experience:** Much better
- **Maintainability:** Dramatically improved
- **Security:** Same (100% coverage maintained)

### Next Steps

1. ✅ Review example schema (`docs/examples/schema-with-drizzle-rls.ts`)
2. ✅ Update your `packages/db/src/schema.ts` with `crudPolicy`
3. ✅ Generate migration (`pnpm db:generate`)
4. ✅ Apply migration (Neon MCP or Drizzle CLI)
5. ✅ Verify with `pnpm rls:check`
6. ✅ Archive old scripts
7. ✅ Commit changes

**Estimated Time:** 1-2 hours for full migration.

---

**Ready to migrate? Start with Step 1!** 🚀
