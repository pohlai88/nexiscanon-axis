# Unknown / Legacy SQL Files

> **Status: UNKNOWN**
>
> These files were moved from `apps/web/db/` on 2026-01-24.
> Their relationship to the canonical Drizzle schema in `packages/db/src/` is unclear.

## Origin

- **Original location:** `apps/web/db/`
- **Moved to:** `packages/db/unknown/`
- **Reason:** Top-level `db/` folder in an app violates package architecture

## Files

| File | Description | Status |
|------|-------------|--------|
| `schema.sql` | Raw SQL schema for core tables | UNKNOWN - may duplicate Drizzle schema |
| `001_add_tenant_hierarchy.sql` | Migration for tenant type/parent_id | UNKNOWN |
| `002_add_notifications.sql` | Migration for notifications table | UNKNOWN |
| `003_add_embeddings.sql` | Migration for vector embeddings | UNKNOWN |

## Action Required

1. Compare these files against `packages/db/src/schema/` (Drizzle)
2. Determine if they are:
   - **Duplicates** → Delete
   - **Missing from Drizzle** → Migrate to Drizzle schema
   - **One-time migrations already applied** → Archive or delete
3. Update this README or delete the folder once resolved
