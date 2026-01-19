# Manual Database Migrations

This directory contains SQL migrations that are **not managed by Drizzle Kit** but must be applied manually to production databases.

## Why Manual Migrations?

Drizzle Kit only generates migrations from TypeScript schema definitions. Some database features cannot be expressed in Drizzle's schema DSL:

- Row-Level Security (RLS) policies
- Custom performance indexes beyond what Drizzle supports
- Database-level security configurations
- Custom functions, triggers, or views

## Current Manual Migrations

### `0001_tenant_isolation_rls.sql` (Applied: 2026-01-19)

**Purpose:** Add Row-Level Security policies and tenant-scoped performance indexes

**Status:** ✅ Applied to production Neon database

**Contents:**
- Performance indexes for tenant-scoped queries (users, requests, audit_logs)
- RLS policies enforcing tenant isolation via `app.current_tenant_id` session variable
- Defense-in-depth: Database-level enforcement of tenant boundaries

**Application Instructions:**
```bash
# Apply to new database/branch
psql $DATABASE_URL < packages/db/migrations-manual/0001_tenant_isolation_rls.sql

# Or via Neon SQL Editor
# Copy/paste the SQL file contents
```

**Verification:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'requests', 'audit_logs');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('users', 'requests', 'audit_logs');

-- Check indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%tenant%';
```

## Migration Discipline

1. **Manual migrations are NOT auto-applied** by `pnpm db:migrate`
2. **Document application status** in this README for each migration
3. **Verify idempotency** - manual migrations should use `IF NOT EXISTS` / `OR REPLACE`
4. **Track in version control** - manual migrations are part of the canonical schema
5. **Apply to all environments** - dev, staging, production, and ephemeral branches

## Adding New Manual Migrations

1. Create `NNNN_description.sql` in this directory
2. Use next sequential number (0002, 0003, etc.)
3. Document in this README with:
   - Purpose
   - Application status (pending/applied)
   - Verification queries
4. Apply to production when approved
5. Update "Applied" timestamp in this README
