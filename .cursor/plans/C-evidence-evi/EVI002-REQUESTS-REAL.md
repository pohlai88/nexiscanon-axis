# EVI002: Requests Becomes Real

> **Status: EVIDENCE (EVI)**  
> This document captures proof that the `requests` addon is fully end-to-end real (DB persistence, not in-memory).

**Depends on:** CAN002 (Foundation Freeze)

---

## Current State: Repository Port Pattern

✅ **Port abstraction implemented** (Option A):

- `packages/domain/src/addons/requests/ports.ts`: `RequestRepository` interface
- `packages/domain/src/addons/requests/manifest.ts`: Service uses repository (not direct DB)
- `packages/db/src/repos/requests-repo.ts`: Drizzle implementation ready
- **In-memory stub active** (until DATABASE_URL is wired)

✅ **Zero route changes**:

- `apps/web/app/api/requests/route.ts` (unchanged)
- `apps/web/app/api/requests/[id]/approve/route.ts` (unchanged)
- Routes call domain service, service calls repository port

✅ **Tenant discipline enforced**:

- All repository queries are tenant-scoped: `and(eq(requests.tenantId, tenantId), eq(requests.id, requestId))`
- No route-level queries

---

## Next: Swap In-Memory → Drizzle

**Prerequisite:** `DATABASE_URL` environment variable must be set.

### Step 1: Apply migration to Neon

```bash
pnpm db:migrate
```

**Expected output:**

```
> @workspace/db db:migrate
> drizzle-kit migrate

Reading migrations from packages/db/drizzle/
Applied 1 migration:
  - 0000_hot_the_leader.sql
```

### Step 2: Run smoke test

```bash
DATABASE_URL=<neon-url> tsx scripts/smoke-db.ts
```

**Expected output:**

```
🧪 DB Smoke Test (roundtrip proof)

✅ Tenant created: test-tenant-smoke
✅ User created: test-user-smoke
✅ Request created: test-request-smoke (status: SUBMITTED)
✅ Request approved: test-request-smoke (status: APPROVED)
✅ Roundtrip verified: test-request-smoke

✅ DB Smoke Test: PASS (transaction rolled back)
```

### Step 3: Swap repository implementation

**File:** `packages/domain/src/composition.ts` (already exists)

**What happens:**

- `wireDatabaseRepositories()` checks for `DATABASE_URL`
- If set: replaces in-memory `RequestRepository` with Drizzle implementation
- If not set: warns and keeps in-memory stub

**No code changes needed** — just set `DATABASE_URL` and restart dev server.

**Verify the swap:**

```bash
# Start dev server with DATABASE_URL
DATABASE_URL=<neon-url> pnpm dev

# Look for log line:
# ✅ Database repositories wired (Drizzle)
```

### Step 4: Test POST /api/requests with real DB

```bash
# Start dev server
pnpm dev

# Create request
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"requesterId": "<user-id>"}'
```

**Expected response:**

```json
{
  "data": {
    "id": "<uuid>",
    "status": "SUBMITTED"
  },
  "meta": {
    "traceId": "<trace-id>"
  }
}
```

**Verify in DB:**

```sql
SELECT id, tenant_id, status, created_at FROM requests ORDER BY created_at DESC LIMIT 1;
```

Should show the newly created request row.

### Step 5: Test POST /api/requests/[id]/approve

```bash
curl -X POST http://localhost:3000/api/requests/<request-id>/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"approverId": "<user-id>"}'
```

**Expected response:**

```json
{
  "data": {
    "id": "<uuid>",
    "status": "APPROVED"
  },
  "meta": {
    "traceId": "<trace-id>"
  }
}
```

**Verify in DB:**

```sql
SELECT id, status, approved_at, approved_by FROM requests WHERE id = '<request-id>';
```

Should show `status = 'APPROVED'` with `approved_at` and `approved_by` populated.

### Step 6: Tenant isolation proof

**Setup:**

```sql
-- Create two tenants
INSERT INTO tenants (id, name, slug) VALUES
  ('tenant-a', 'Tenant A', 'tenant-a'),
  ('tenant-b', 'Tenant B', 'tenant-b');

-- Create request under Tenant A
INSERT INTO requests (id, tenant_id, requester_id, status) VALUES
  ('req-123', 'tenant-a', 'user-a', 'SUBMITTED');
```

**Test cross-tenant access (should fail):**

```bash
# Attempt to approve Tenant A's request from Tenant B context
curl -X POST http://localhost:3000/api/requests/req-123/approve \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-b" \
  -H "Authorization: Bearer <token>" \
  -d '{"approverId": "user-b"}'
```

**Expected result:** 404 Not Found or 403 Forbidden (repository's `findById` will return null due to tenant mismatch).

**Why this matters:** Proves tenant discipline is enforced at the repository layer, not just route layer.

---

## Completion Criteria

This EVI is **complete** when:

1. ✅ `pnpm db:migrate` applies migration successfully (output captured)
2. ✅ `tsx scripts/smoke-db.ts` passes (output captured)
3. ✅ Repository swapped from in-memory → Drizzle (log shows "Database repositories wired")
4. ✅ `POST /api/requests` creates DB row (verified via SQL query)
5. ✅ `POST /api/requests/[id]/approve` updates DB row (verified via SQL query)
6. ✅ Audit events still fire (logs show `request.created`, `request.approved`)
7. ✅ **Tenant isolation proof**: Create request under Tenant A, attempt approve under Tenant B → must fail (not found)

---

## Anti-Patterns to Avoid

❌ **Do not** add DB queries in route files (kernel owns routes, domain owns logic)  
❌ **Do not** bypass tenant scoping (all queries must use `tenantId`)  
❌ **Do not** change route handler signatures (kernel contract is frozen)  
❌ **Do not** add new endpoints yet (complete this EVI first)

---

**Next EVI:** EVI003-OBSERVABILITY-STITCH (once GlitchTip + Tempo are configured)
