# EVI002: Requests Becomes Real

> **Status: READY FOR EXECUTION**  
> This document captures proof that the `requests` addon is fully end-to-end real (DB persistence, not in-memory).

**Depends on:** CAN002 (Foundation Freeze)

---

## Current State: Repository Port Pattern + Wiring Complete

✅ **Port abstraction implemented**:

- `packages/domain/src/addons/requests/ports.ts`: `RequestRepository` interface
- `packages/domain/src/addons/requests/manifest.ts`: Service uses repository (not direct DB)
- `packages/db/src/repos/requests-repo.ts`: Drizzle implementation ready
- `packages/app-runtime/src/index.ts`: Composition layer wires DB based on `DATABASE_URL`

✅ **Drift-proof wiring**:

- `tokenId()` helper exports string IDs from typed tokens (no casts)
- Logs: `{"repos":["domain.requests.RequestRepository"]}` (auditable, grep-able)
- Fail-fast: `wiredRepos.includes(tokenId(REQUESTS_TOKENS.RequestRepository))`
- **In-memory stub active** (until DATABASE_URL is set)

✅ **Zero route changes**:

- `apps/web/app/api/requests/route.ts` (unchanged)
- `apps/web/app/api/requests/[id]/approve/route.ts` (unchanged)
- Routes call domain service, service calls repository port

✅ **Tenant discipline enforced**:

- All repository queries are tenant-scoped: `and(eq(requests.tenantId, tenantId), eq(requests.id, requestId))`
- No route-level queries

---

## Execution: Swap In-Memory → Drizzle

**Prerequisite:** `DATABASE_URL` environment variable must be set.

### Step 1: Apply migration to Neon

```bash
pnpm -w db:migrate
```

### Step 2: Run smoke test

```bash
DATABASE_URL=<neon-url> pnpm -w tsx scripts/smoke-db.ts
```

### Step 3: Start dev server (capture startup log)

```bash
DATABASE_URL=<neon-url> pnpm -w dev
```

**Look for JSON log:**
```json
{"event":"domain.wiring","wired":"drizzle","repos":["domain.requests.RequestRepository"],...}
```

### Step 4: Test POST /api/requests

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: <tenant-id>" \
  -d '{"requesterId": "<user-id>"}'
```

### Step 5: Test POST /api/requests/[id]/approve

```bash
curl -X POST http://localhost:3000/api/requests/<request-id>/approve \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: <tenant-id>" \
  -d '{"approverId": "<user-id>"}'
```

### Step 6: Cross-tenant isolation proof

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

**Test (attempt approve from Tenant B context):**
```bash
curl -X POST http://localhost:3000/api/requests/req-123/approve \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-b" \
  -d '{"approverId": "user-b"}'
```

**Expected:** 404/403 (repository returns null due to tenant mismatch)

---

## Output Template (Paste When Executed)

```markdown
## Environment
- Neon project: <name>
- DB branch: <branch>
- Migration: 0000_hot_the_leader.sql

## [1] pnpm -w db:migrate
<paste output>

## [2] DATABASE_URL=<url> pnpm -w tsx scripts/smoke-db.ts
<paste output>

## [3] Startup wiring log
<paste single JSON line from dev server startup>

## [4] POST /api/requests
<paste response>

## [5] POST /api/requests/[id]/approve
<paste response>

## [6] Cross-tenant approve (tenant B → tenant A request)
<paste status + body>
```

---

## Acceptance Criteria (Strict Pass/Fail)

- ✅ Startup log shows `"wired":"drizzle"` (exact token: `"domain.requests.RequestRepository"`)
- ✅ API responses include real UUIDs (not mock data)
- ✅ Cross-tenant test returns 404/403 (proves tenant discipline at repository layer)
- ✅ No "in-memory" warnings in dev server logs
- ✅ Audit events fire (check logs for `request.created`, `request.approved`)

---

## Anti-Patterns to Avoid

❌ **Do not** add DB queries in route files (kernel owns routes, domain owns logic)  
❌ **Do not** bypass tenant scoping (all queries must use `tenantId`)  
❌ **Do not** change route handler signatures (kernel contract is frozen)  
❌ **Do not** add new endpoints yet (complete this EVI first)

---

## Next Phase After EVI002 Completion

Once all outputs are captured and acceptance criteria pass, choose next development phase:

### Option A: Observability Stitching (EVI003)
**Goal:** End-to-end tracing + error aggregation

**Prerequisites:**
- GlitchTip account/instance (error tracking)
- Tempo endpoint (distributed tracing)

**Deliverables:**
- `@workspace/observability` sends errors to GlitchTip
- OpenTelemetry traces export to Tempo
- Correlation: `traceId` links errors + spans
- Proof: Trigger error → find in GlitchTip with trace link → query span in Tempo

**Effort:** ~2-3 sessions (infra setup, SDK wiring, proof capture)

---

### Option B: Auth Integration (Neon Auth)
**Goal:** Replace auth stub with real Neon Auth provider

**Prerequisites:**
- Neon project with Auth enabled
- `NEON_AUTH_URL` + credentials

**Deliverables:**
- `packages/auth` wires to Neon Auth API
- Login/signup routes use real sessions
- Kernel extracts `actorId` + `roles` from JWT
- Proof: Login → create request → audit log shows real `actorId`

**Effort:** ~2-3 sessions (provider adapter, session handling, proof)

---

### Option C: File Upload Pipeline (First Real Feature)
**Goal:** End-to-end file upload with presigned URLs + metadata tracking

**Prerequisites:**
- S3-compatible storage (Cloudflare R2, AWS S3, MinIO)
- `FILES_BUCKET_URL` + credentials

**Deliverables:**
- `files` addon (domain package)
- `FilesPort` implementation (app-runtime)
- Routes: `POST /api/files/presigned-url`, `POST /api/files/[id]/finalize`
- DB table: `files` (tenant-scoped)
- Proof: Upload → finalize → query DB → file metadata persisted

**Effort:** ~3-4 sessions (addon, repo, routes, storage wiring, proof)

---

### Option D: Background Jobs (Second Infra Piece)
**Goal:** Job queue + worker runtime

**Prerequisites:**
- BullMQ + Redis (or alternative queue)
- `REDIS_URL`

**Deliverables:**
- `@workspace/jobs` package (BullMQ wrapper)
- Worker runtime (separate process)
- Example job: `audit.archive` (move old audit logs to cold storage)
- Proof: Enqueue → worker processes → DB updated

**Effort:** ~3-4 sessions (queue setup, worker harness, job registry, proof)

---

### Recommendation: **Option A (Observability) or Option B (Auth)**

**Why:**
- Both are **horizontal capabilities** (apply to all future features)
- Observability makes debugging real issues easier (GlitchTip + Tempo)
- Auth unblocks real user flows (login → create request as authenticated user)
- Files + Jobs are **vertical features** (best done after auth is real)

**Suggested order:**
1. **EVI002** (Requests becomes real) ← **YOU ARE HERE**
2. **EVI003** (Observability stitching) ← traces + errors tied to real DB operations
3. **Auth integration** ← `actorId` becomes real, audit logs are meaningful
4. **Files** or **Jobs** ← first vertical feature with full observability + auth

---

**Next EVI:** EVI003-OBSERVABILITY-STITCH (recommended after EVI002 completion)
