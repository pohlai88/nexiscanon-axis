# FOUNDATION-DONE.md

**Status:** Foundation Freeze Checklist (Stop Line)  
**Goal:** Define the minimum “platform complete” state so we stop growing the stack and only ship modules.

---

## How to use this

- ✅ = done
- ⏳ = in progress
- ⛔ = not started

Once **all sections A–H are ✅**, the platform is **FROZEN**.
From that point onward: **only add modules (addons), not architecture.**

---

# A) Repo + Toolchain Baseline (Must)

- [x] ✅ pnpm workspace is stable (single lockfile, reproducible installs)
- [x] ✅ TypeScript v5 strict is enabled (no bypass in apps)
- [ ] ⏳ ESLint 9 flat config is active and running in CI (active, not yet in CI)
- [x] ✅ Turborepo tasks exist for: typecheck, lint, test, build

**Freeze rule:** no new build tools/frameworks without a trigger.

---

# B) API Kernel (Anti-Drift) (Must)

## B1) Kernel pattern is the only allowed route style

- [x] ✅ Every `apps/**/app/api/**/route.ts(x)` exports: `METHOD = kernel({ ... })`
- [x] ✅ No route file uses `NextResponse.json()` or `new Response()`
- [x] ✅ No route file imports `NextResponse` (kernel-only)

## B2) Kernel pipeline guarantees (always)

- [x] ✅ ALS context initialized for every request:
  - `traceId`, `requestId`, `routeId`, `method`
- [x] ✅ Tenant resolution enforced (when required):
  - `tenantId` must exist or 400
- [ ] ⏳ Auth enforced via Neon Auth (when required):
  - `actorId`, `roles` (stub exists, Neon Auth adapter pending)
- [x] ✅ Zod input validation (query/body) always applied
- [x] ✅ Zod output validation always applied
- [x] ✅ Standard envelopes only:
  - Success: `{ data, meta:{traceId} }`
  - Error: `{ error:{code,message,fieldErrors?,details?,traceId} }`

## B3) Enforcement gates exist

- [x] ✅ ESLint override for route handlers is in place
- [x] ✅ CI drift script `pnpm check:api-kernel` passes (8 routes checked, allowlist enforced)
- [x] ✅ Scoped typecheck `pnpm typecheck:core` passes (api-kernel, domain, validation, observability)

**Proof:**

```
> pnpm check:api-kernel
✅ check-api-kernel: 8 route files checked
All route files comply with the kernel pattern.
```

```
> pnpm typecheck:core
> turbo run check-types --filter="@workspace/api-kernel" ...
@workspace/api-kernel:check-types: cache hit, replaying logs
@workspace/domain:check-types: cache hit, replaying logs
@workspace/observability:check-types: cache hit, replaying logs
@workspace/validation:check-types: cache hit, replaying logs
Tasks:    4 successful, 4 total
Cached:   4 cached, 4 total
Time:     334ms >>> FULL TURBO
```

**Freeze rule:** after ✅, do not add more route conventions. Kernel is final.

---

# C) Contracts (Zod) (Must)

- [x] ✅ Zod v4 is pinned (lockfile)
- [x] ✅ Contract-first rule followed:
  - every endpoint has input schema (as applicable)
  - every endpoint has output schema
- [ ] ⛔ Job payloads validated by Zod (jobs not implemented yet)
- [ ] ⛔ File pipeline status transitions validated by Zod (at least schema-level)

**OpenAPI is NOT required to freeze.**

- [ ] ⛔ Optional: `pnpm build:openapi` exists (only if triggered later)

**Freeze rule:** no “v1/v2 contract folders” until backward-compat trigger exists.

---

# D) Domain Foundation (Odoo-inspired Addons) (Must)

- [x] ✅ `@workspace/domain` package exists
- [x] ✅ `bootstrapDomain()` loads addon manifests deterministically
- [x] ✅ `dependsOn` topological order works (cycle detection included)
- [x] ✅ Container exists with:
  - `provide`, `provideValue`, `get`, `extend`
- [x] ✅ `core` addon exists and provides:
  - `IdService`
  - `AuditService` (even if no-op / event-only)
- [x] ✅ At least **1 real feature addon/module** exists: `requests`
  - ✅ POST /api/requests (create → SUBMITTED)
  - ✅ POST /api/requests/[id]/approve (approve → APPROVED)
  - ✅ routes call domain service only (spec-only pattern)
  - ✅ domain service uses Drizzle repository (DB persistence verified)
  - ✅ audit events written on transitions

**EVI002 Proof Milestone:** ✅ COMPLETE (2026-01-19)

- ✅ `pnpm db:migrate` output against Neon (migrations applied successfully)
- ✅ `tsx scripts/smoke-db.ts` output (DB roundtrip PASS with real UUIDs)
- ✅ Domain endpoint (`POST /api/requests`) writes to DB via Drizzle
- ✅ Wiring log confirms: `"wired":"drizzle"` with correct repo token
- ✅ Cross-tenant isolation verified (RLS enforced, access prevented)
- ⚠️ Follow-up: Map repository null → 404 NOT_FOUND (currently returns 500)

**Freeze rule:** after 1 real addon ships, stop redesigning domain.

---

# E) Data Layer (Neon + Drizzle) (Must)

- [x] ✅ Neon Postgres connected for app + worker
- [x] ✅ Drizzle schema + Drizzle migrations runnable
  - **Schema currently defines 4 tables**: `tenants`, `users`, `audit_logs`, `requests`
  - **First migration generated accordingly**: `0000_hot_the_leader.sql`
  - **Minimal scope for v0 is the current schema surface**, not 'requests-only'; requests depends on tenants/users/audit_logs for tenant discipline + auditability
  - **All Drizzle migration artifacts live in `packages/db/drizzle/`** (including meta). Do not create `migrations/`.
- [x] ✅ Migration pipeline exists: `pnpm db:generate`, `pnpm db:migrate`
- [x] ✅ Drift-proof CI gate: `pnpm check:db-migrations` (regenerates + git diff)
  - Prints config path and diff scope for CI stability
  - Fails if schema.ts or drizzle/ changes after regeneration
  - No DATABASE_URL needed for drift check (generate only reads schema)
- [x] ✅ Tenant discipline implemented:
  - `tenant_id` in all multi-tenant tables
  - every query is tenant-scoped (no route-level queries)
  - RLS policies applied and verified (EVI002-C)

## E1) Infra SQL Exception (Manual Migrations)

**Schema migrations** (Drizzle-managed):
- Location: `packages/db/drizzle/*.sql`
- Tracked: `_journal.json`
- Applied: `pnpm db:migrate`

**Infra SQL** (manual, not Drizzle-managed):
- Location: `packages/db/drizzle/manual/*.sql`
- Tracked: NOT in `_journal.json` (Drizzle doesn't manage RLS/policies/grants)
- Applied: Manually via `psql` or Neon SQL Editor
- **Requirements:**
  - Idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`)
  - Documented in `drizzle/manual/README.md`
  - Applied once per environment after `db:migrate`
  - Version controlled (part of canonical schema)

**Current manual migrations:**
- `0001_tenant_isolation_rls.sql`: RLS policies + tenant-scoped indexes

**Verification queries** (ensure RLS applied):
```sql
-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('users', 'requests', 'audit_logs');

-- Check policies exist
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('users', 'requests', 'audit_logs');
```

**Proof:**

```
> pnpm check:db-migrations
> my-axis@ db:generate C:\AI-BOS\NexusCanon-AXIS
> pnpm --filter @workspace/db db:generate
> @workspace/db@0.0.1 db:generate C:\AI-BOS\NexusCanon-AXIS\packages\db
> drizzle-kit generate
4 tables
audit_logs 7 columns 0 indexes 1 fks
requests 8 columns 0 indexes 1 fks
tenants 5 columns 0 indexes 0 fks
users 6 columns 0 indexes 1 fks
No schema changes, nothing to migrate 😴
✅ check-db-migrations: OK (no drift detected)
```

**Freeze rule:** no second ORM or DB abstraction.

---

# F) Observability Stitching (Must)

## F1) Logging

- [x] ✅ Pino structured JSON logs in server + worker
- [x] ✅ ALS injects into every log line:
  - `traceId`, `requestId`, `tenantId`, `actorId`, `routeId`, `method`

## F2) Tracing

- [ ] ⏳ OpenTelemetry configured in Node runtime (helpers exist, not configured)
- [ ] ⛔ Traces exported via OTLP to Grafana Tempo (self-host)
- [ ] ⛔ Basic instrumentation works:
  - HTTP
  - fetch/undici
  - Postgres client (or DB span equivalent)

## F3) Error tracking

- [ ] ⛔ GlitchTip configured (Sentry SDK)
- [ ] ⛔ Every captured error includes:
  - `traceId`, `tenantId`, `actorId`, `routeId`, `release`

## F4) Stitch test (non-negotiable)

- [ ] ⛔ Throw a controlled error → see:
  - GlitchTip issue with `traceId`
  - Tempo trace for that `traceId`
  - Pino logs filterable by that `traceId`

**Freeze rule:** once stitch works, do not add more observability vendors/tools.

---

# G) Background Jobs (Graphile Worker) (Must)

- [ ] ⛔ Graphile Worker runs as separate process
- [ ] ⛔ At least 1 job type implemented end-to-end:
  - payload validated by Zod
  - idempotency key enforced
  - retry/backoff configured
  - dead-letter visibility exists (table/logging)
- [ ] ⛔ Worker logs include trace/correlation fields (as applicable)

**Freeze rule:** no Redis queue until proven performance trigger.

---

# H) File Pipeline (Cloudflare R2 + Workers) (Must)

- [ ] ⛔ Signed upload flow works (API → R2)
- [ ] ⛔ Worker pipeline runs conversion:
  - `docx/xlsx/pptx → pdf` (mandatory)
- [ ] ⛔ Failure rules enforced:
  - conversion failure = upload failure
  - no download-only fallback
- [ ] ⛔ DB status lifecycle works:
  - `PENDING_UPLOAD → UPLOADED → PROCESSING → READY|FAILED`
- [ ] ⛔ Checksum recorded for integrity
- [ ] ⛔ Audit event recorded for key lifecycle transitions

**Freeze rule:** pipeline is final unless real failure rate demands change.

---

# I) Public-Facing Readiness (Minimum KPIs) (Must)

## I1) Rate limiting

- [ ] ⛔ Rate limits enabled for:
  - login/signup/reset
  - invite acceptance
  - webhooks
  - unauth endpoints

## I2) Minimal metrics exist (10-metric rule)

API:

- [ ] ⛔ request count by route/method/status
- [ ] ⛔ duration histogram (p95/p99)
- [ ] ⛔ 5xx count by route
- [ ] ⛔ rate-limited count

Auth:

- [ ] ⛔ login success count
- [ ] ⛔ login failure count

Jobs:

- [ ] ⛔ job success count by job type
- [ ] ⛔ job failure count by job type
- [ ] ⛔ retry count by job type
- [ ] ⛔ queue latency histogram

Files (if you can add 2–3 more, recommended):

- [ ] ⛔ conversion success/fail count
- [ ] ⛔ processing duration histogram

**Freeze rule:** once KPIs exist, do not add more dashboards unless triggered.

---

# J) Tests (Minimum) (Must)

- [ ] ⏳ Vitest runs in CI (configured locally, not yet in CI)
- [ ] ⏳ Playwright smoke suite runs in CI:
  - login
  - one core flow
  - one permission-denied flow

**Freeze rule:** no extra test frameworks.

---

# K) FINAL FOUNDATION FREEZE CRITERIA

Foundation is considered **DONE** when:

- [ ] ⏳ Sections **A–H** are complete (partial: B, C, D mostly done; E, F, G, H pending)
- [ ] ⛔ Section **I** rate limits + minimal metrics are in place
- [ ] ⏳ Section **J** tests run in CI (tests exist, not yet in CI)

After this:

- ✅ Only add **addons/modules**, contracts, routes, and tests.
- ⛔ Do not add new infrastructure/tools unless a **trigger** occurs:
  - external API consumers → OpenAPI
  - backward compatibility → `/api/v1` + contract versioning
  - queue performance issues → consider Redis queue
  - API becomes a product → consider Hono service split

---

# L) Strictness Budget v0 (Governance)

**Purpose:** Prevent random expansion of quality gates. Define what MUST pass in CI vs. what's advisory.

## Tier-0 Gates (CI FAIL = Block Merge)

- `pnpm check:api-kernel` (API drift enforcement)
- `pnpm typecheck:core` (strict TypeScript for core packages)
- `pnpm check:db-migrations` (schema drift detection)
- `pnpm lint` (ESLint 9 flat config)

## Tier-1/2 (Non-Blocking)

Everything else is advisory or local-only:
- `pnpm test` (once in CI, may be Tier-0 later)
- Playwright suite (once in CI, may be Tier-0 later)
- Metrics/observability checks (informational only)

**Freeze rule:** Do not promote checks to Tier-0 without a documented trigger.

---

**End of Checklist**
