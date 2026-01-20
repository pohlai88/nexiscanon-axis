# Why Neon Doesn't Enable RLS by Default (And What To Do About It)

## The Problem

Neon (and PostgreSQL in general) **does not enable RLS by default** because:

1. **Backward Compatibility**: Existing apps would break instantly
2. **Framework Integration**: Many ORMs don't expect RLS
3. **Developer Choice**: Some apps use application-level filtering
4. **Breaking Change**: Once enabled without policies = total lockout

### The Security Risk

```
Neon Provisioning:
├─ Creates database ✅
├─ Creates authenticated/anonymous roles ✅
├─ Grants table permissions ✅
└─ Enables RLS ❌ (MANUAL STEP REQUIRED)

Result: Any authenticated user can read ALL data!
```

## Why It's Dangerous

### Scenario 1: Multi-Tenant App (Your Case)

```typescript
// You think this is secure:
const requests = await db
  .select()
  .from(requests)
  .where(eq(requests.tenantId, currentUser.tenantId));

// But if someone bypasses your app and hits the Data API directly:
curl https://your-data-api.neon.tech/public/requests \
  -H "Authorization: Bearer <stolen-token>"

// Returns ALL requests from ALL tenants! 🚨
```

### Scenario 2: Application Code Bypass

```typescript
// Dev forgets to filter by tenant:
const allUsers = await db.select().from(users); // OOPS!

// Without RLS: Returns ALL users from ALL tenants
// With RLS: Automatically filtered to current tenant ✅
```

## The Solution: Default RLS Pattern

Since Neon doesn't enable RLS automatically, we need to establish a **default RLS pattern** for your project.

### Strategy: RLS-by-Default Convention

```
1. Always enable RLS when creating tables
2. Use database migrations to enforce RLS
3. Automated checks to prevent RLS gaps
4. Documentation/linting to catch violations
```

## Implementation

### 1. Drizzle Migration Template

```typescript
// drizzle/0006_enable_rls_on_new_tables.sql
-- TEMPLATE: Copy this for every new table

-- 1. Create table
CREATE TABLE new_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  -- ... other columns
);

-- 2. IMMEDIATELY enable RLS (don't forget!)
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- 3. Grant access to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON new_table TO authenticated;

-- 4. Create default tenant-scoped policy
CREATE POLICY "Users can access own tenant data"
  ON new_table
  FOR ALL
  TO authenticated
  USING (tenant_id = auth.user_tenant_id())
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- 5. Grant sequence access (if auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

### 2. Automated RLS Checker Script

```typescript
// scripts/check-rls-status.ts
#!/usr/bin/env tsx
/**
 * Check RLS Status on All Tables
 * 
 * FAILS CI if any table has RLS disabled
 * 
 * Usage: tsx scripts/check-rls-status.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const sql = neon(process.env.DATABASE_URL!);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status on all tables...\n');

  // Get all tables with RLS status
  const tables = await sql`
    SELECT 
      schemaname,
      tablename,
      rowsecurity,
      (
        SELECT count(*) 
        FROM pg_policies 
        WHERE pg_policies.tablename = pg_tables.tablename
      ) as policy_count
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;

  let hasErrors = false;

  console.table(tables);

  // Check for tables without RLS
  const noRLS = tables.filter((t: any) => !t.rowsecurity);
  if (noRLS.length > 0) {
    console.error('\n❌ SECURITY RISK: Tables without RLS:');
    noRLS.forEach((t: any) => {
      console.error(`   - ${t.tablename}`);
    });
    hasErrors = true;
  }

  // Check for tables with RLS but no policies
  const noPolicies = tables.filter((t: any) => t.rowsecurity && t.policy_count === 0);
  if (noPolicies.length > 0) {
    console.error('\n⚠️  WARNING: Tables with RLS but no policies (access blocked):');
    noPolicies.forEach((t: any) => {
      console.error(`   - ${t.tablename}`);
    });
    hasErrors = true;
  }

  if (hasErrors) {
    console.error('\n❌ RLS check FAILED!\n');
    console.error('Fix with:');
    console.error('  1. pnpm rls:enable        # Enable RLS');
    console.error('  2. pnpm rls:create-functions  # Create helper functions');
    console.error('  3. Apply policies from docs/NEON-DATA-API-SECURITY.md\n');
    process.exit(1);
  }

  console.log('\n✅ All tables have RLS enabled with policies!\n');
}

checkRLSStatus().catch(console.error);
```

### 3. CI/CD Integration

```yaml
# .github/workflows/check-database-security.yml
name: Database Security Check

on:
  pull_request:
    paths:
      - 'packages/db/**'
      - 'drizzle/**'
  push:
    branches: [main]

jobs:
  check-rls:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Check RLS Status
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: pnpm rls:check
      
      - name: Fail if RLS not enabled
        if: failure()
        run: |
          echo "❌ SECURITY CHECK FAILED"
          echo "All tables must have RLS enabled with policies"
          exit 1
```

### 4. Pre-Migration Hook

```typescript
// scripts/pre-migration-check.ts
/**
 * Run before db:migrate to ensure new tables have RLS
 * 
 * Checks migration files for:
 * - CREATE TABLE statements
 * - Followed by ALTER TABLE ... ENABLE ROW LEVEL SECURITY
 */

import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = './packages/db/drizzle';

function checkMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let hasErrors = false;

  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    
    // Find CREATE TABLE statements
    const createTables = content.match(/CREATE TABLE\s+(\w+)/gi) || [];
    
    for (const createStmt of createTables) {
      const tableName = createStmt.match(/CREATE TABLE\s+(\w+)/i)?.[1];
      
      // Check if RLS is enabled for this table
      const hasRLS = content.includes(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`);
      
      if (!hasRLS) {
        console.error(`❌ ${file}: Table '${tableName}' created without RLS!`);
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error('\n❌ Migration check FAILED!');
    console.error('All new tables MUST enable RLS immediately after creation.\n');
    process.exit(1);
  }

  console.log('✅ All migrations enable RLS on new tables');
}

checkMigrations();
```

### 5. Drizzle Schema Annotation

```typescript
// packages/db/src/schema.ts
/**
 * SECURITY NOTE: All tables MUST have RLS enabled!
 * 
 * When adding new tables:
 * 1. Define schema here
 * 2. Generate migration: pnpm db:generate
 * 3. MANUALLY edit migration to add:
 *    - ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
 *    - CREATE POLICY ...
 * 4. Run: pnpm db:migrate
 * 5. Verify: pnpm rls:check
 */

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// Example: New table with RLS reminder
export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(), // ⚠️ Required for RLS filtering
  userId: text('user_id').notNull(),
  // ... other fields
});

// 🚨 REMINDER: After generating migration, add RLS statements!
```

### 6. Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate && pnpm rls:check-migrations",
    "db:migrate": "pnpm rls:pre-check && drizzle-kit migrate && pnpm rls:check",
    "rls:check": "tsx scripts/check-rls-status.ts",
    "rls:check-migrations": "tsx scripts/pre-migration-check.ts",
    "rls:pre-check": "tsx scripts/check-rls-status.ts",
    "rls:enable": "tsx scripts/enable-rls.ts",
    "rls:create-functions": "tsx scripts/create-auth-functions.ts"
  }
}
```

## Best Practices

### DO ✅

1. **Enable RLS in migration files** (not separately)
   ```sql
   CREATE TABLE new_table (...);
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY; -- Same migration!
   ```

2. **Use CI checks** to enforce RLS
   ```yaml
   - run: pnpm rls:check
   ```

3. **Document in schema files**
   ```typescript
   // ⚠️ RLS REQUIRED: This table stores multi-tenant data
   ```

4. **Default tenant_id column** in all tables
   ```typescript
   tenantId: uuid('tenant_id').notNull()
   ```

### DON'T ❌

1. **Don't create tables without RLS**
   ```sql
   CREATE TABLE new_table (...); -- Missing RLS = SECURITY RISK!
   ```

2. **Don't rely on application filtering**
   ```typescript
   // ❌ BAD: Application-level filtering can be bypassed
   .where(eq(table.tenantId, currentUser.tenantId))
   ```

3. **Don't assume Neon will do it**
   - Neon provides the tools (roles, RLS capability)
   - YOU must enable and configure RLS
   - It's a conscious security decision, not automatic

## Migration Path for Existing Tables

```bash
# 1. Enable RLS on all existing tables
pnpm rls:enable

# 2. Create helper functions
pnpm rls:create-functions

# 3. Apply policies (from security guide)
# See: docs/NEON-DATA-API-SECURITY.md

# 4. Verify everything works
pnpm rls:check

# 5. Test with real users
# Login as different tenants and verify isolation
```

## Comparison with Other Platforms

| Platform        | Default RLS | Notes                           |
| --------------- | ----------- | ------------------------------- |
| **Neon**        | ❌ No        | Manual configuration required   |
| **Supabase**    | ❌ No        | But strongly encouraged in docs |
| **PostgreSQL**  | ❌ No        | Feature available since 9.5     |
| **Planetscale** | N/A         | MySQL (no RLS concept)          |
| **MongoDB**     | N/A         | Document-level permissions      |

**Conclusion**: RLS-by-default is **YOUR responsibility**, not the platform's.

## Summary

### Why Neon Doesn't Enable RLS by Default
1. **Not universal requirement** - Some apps don't need it
2. **Breaking change** - Would break existing apps
3. **Framework conflicts** - Some ORMs expect no RLS
4. **User choice** - Security model varies by app

### What You Should Do
1. ✅ **Enable RLS on ALL tables** (immediately after creation)
2. ✅ **Create policies** for ALL tables
3. ✅ **Automate checks** (CI/CD)
4. ✅ **Document convention** (team process)
5. ✅ **Test thoroughly** (multi-tenant isolation)

### Tools Created
- `scripts/check-rls-status.ts` - Verify RLS on all tables
- `scripts/pre-migration-check.ts` - Check migrations have RLS
- CI workflow template - Automated security checks
- Migration template - Standard RLS pattern

---

**Bottom Line**: Neon gives you the tools. You must use them. RLS is not optional for multi-tenant apps.
