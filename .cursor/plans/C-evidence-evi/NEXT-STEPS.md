# Next Development Steps

**Last Updated:** 2026-01-20  
**Current Status:** EVI004 COMPLETE ✅ → Moving to EVI005 (Auth Integration)

---

## ✅ Foundation Complete

**Core Infrastructure:**

- ✅ API Kernel (8 routes verified, CI gates passing)
- ✅ Domain Pattern (Odoo-inspired addons with DI container)
- ✅ Database Layer (Neon + Drizzle + RLS tenant isolation)
- ✅ First Real Feature (Requests addon with DB persistence)
- ✅ Core Gates (lint, typecheck, db-migrations, api-kernel)
- ✅ Observability Stack (OTel traces + GlitchTip errors + Pino logs)

**Evidence Captured:**

- ✅ EVI001: API Kernel pattern enforcement
- ✅ EVI002-A: Database proof (migrations + smoke test + wiring log)
- ✅ EVI002-B: HTTP proof (create + cross-tenant isolation)
- ✅ EVI002-C: Tenant isolation (RLS policies + indexes)
- ⏳ EVI003: Observability (errors ✅, traces pending - not blocking)
- ✅ EVI004: Jobs/Queue (background jobs with tenant context + correlation)

---

## Current Focus: EVI004 (Jobs/Queue)

**Goal:** Prove background jobs run with tenant context + logging

**Why Next:**

- Self-contained horizontal capability
- Strengthens kernel pattern (tenant context propagation)
- Foundation for async workflows (file processing, reminders, cleanup)
- No external dependencies blocking (unlike traces verification)

**Deliverables:**

- `@workspace/jobs` package (Graphile Worker wrapper)
- Job envelope with tenant context (tenantId, actorId, traceId)
- System job: `system.ping` (health check)
- Domain job: `requests.reminder` (demonstrates addon integration)
- Evidence: EVI004-JOBS-QUEUE.md with execution proof

**Effort:** 2-3 sessions (package setup + worker + 2 jobs + evidence)

---

## Current Focus: EVI005 (Auth Integration)

**Goal:** Replace auth stub with real Neon Auth provider

**Why Next:**

- Unblocks production deployment (auth currently dev-only)
- Enables real user sessions + JWT validation
- Proves kernel auth extraction works with real tokens
- Foundation for RBAC + permissions system

**Prerequisites:**

- Neon project with Auth enabled (already provisioned)
- NEON_AUTH_BASE_URL + JWKS_URL in env (already set)

**Implementation Plan:**

1. Integrate Neon Auth SDK to `@workspace/auth`
2. Implement real auth handlers (login/signup/logout)
3. Update kernel JWT validation (`packages/api-kernel/src/auth.ts`)
4. Migrate routes from `auth: { mode: "dev" }` to `auth: { mode: "required" }`
5. Evidence capture: signup → login → create request → verify actorId

**Deliverables:**

- Auth provider using Neon Auth
- JWT validation in kernel
- Real sessions (no dev headers)
- Evidence: EVI005-AUTH-INTEGRATION.md

**Effort:** 2-3 sessions

**Doc:** `.cursor/plans/C-evidence-evi/EVI005-AUTH-INTEGRATION.md` (to be created)

---

## Completed Milestones

### EVI004: Jobs/Queue ✅ COMPLETE (2026-01-20)

**What Was Built:**

- `@workspace/jobs` package (Graphile Worker wrapper)
- Type-safe job envelope (tenantId, actorId, traceId, payload)
- Worker process with 2 proof jobs (system.ping, requests.reminder)
- Kernel-wrapped enqueue endpoint
- Full tenant context propagation

**Evidence:** All 5 items captured and verified in EVI004-JOBS-QUEUE.md

### Previous Sections (Jobs Implementation Details)

The detailed Jobs implementation plan has been completed. See EVI004-JOBS-QUEUE.md for full evidence.

**Goal:**
Replace auth stub with real Neon Auth provider

**Prerequisites:**

- Neon project with Auth enabled
- `NEON_AUTH_URL` + credentials

**Deliverables:**

- `packages/auth` wires to Neon Auth API
- Login/signup routes use real sessions
- Kernel extracts `actorId` + `roles` from JWT
- Proof: Login → create request → audit log shows real `actorId`

**Effort:** 2-3 sessions (provider adapter + session handling + proof)

**Trade-off:**

- Auth is also horizontal (good)
- But observability helps debug auth issues (so EVI003 first is better)

---

## Optional Follow-Up Tasks (Low Priority)

### 1. Error Mapping Improvement

**Issue:** Repository returning `null` currently maps to `500 INTERNAL_ERROR`  
**Expected:** Should map to `404 NOT_FOUND` (or `403 FORBIDDEN` for explicit tenant mismatch)  
**Location:** `packages/api-kernel/src/errors.ts` or domain service error handling  
**Effort:** 30 minutes  
**Priority:** Low (isolation works correctly, this is semantic HTTP status improvement)

### 2. Add Lint to CI

**Task:** Add `pnpm -w lint` to `.github/workflows/core-integrity.yml`  
**Effort:** 5 minutes  
**Already prepared:** Lint gate is working locally, just needs CI integration

### 3. Turbopack Investigation

**Issue:** Windows symlink privilege error (`os error 1314`)  
**Workaround:** `pnpm --filter web dev:webpack` (already in place)  
**Permanent Fix Options:**

- Enable Windows Developer Mode (one-time OS setting)
- Continue using webpack mode (stable, no issues)
- Wait for Next.js/Turbopack Windows symlink improvements

---

## Development Workflow

### Starting Development Session

```bash
# Set DATABASE_URL (or use .env file)
$env:DATABASE_URL = "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Run core gates (optional sanity check)
pnpm -w lint
pnpm -w check:api-kernel
pnpm -w typecheck:core
pnpm -w check:db-migrations

# Start dev server (webpack mode on Windows)
pnpm --filter web dev:webpack
```

### Adding New Feature

1. Create addon in `packages/domain/src/addons/<feature>/`
2. Define port interface (repository/service contracts)
3. Implement repository in `packages/db/src/repos/<feature>-repo.ts`
4. Wire in `packages/app-runtime/src/index.ts`
5. Add API routes in `apps/web/app/api/<feature>/`
6. Update schema if needed: `pnpm -w db:generate`
7. Apply migration: `pnpm -w db:migrate`
8. Verify gates: `pnpm -w lint`, `pnpm -w check:api-kernel`, `pnpm -w check:db-migrations`

---

## Ready for Production?

**Current State:** Foundation complete, first feature proven

**Not Yet Production-Ready:**

- ⛔ **Auth is stubbed (dev mode only)** ← NEXT PRIORITY (EVI005)
- ⏳ OTel traces need Tempo/Jaeger endpoint configured
- ⛔ No rate limiting / DDoS protection
- ⛔ No CI/CD pipeline defined
- ⛔ No health checks / readiness probes
- ⛔ No backup/restore procedures documented

**To Make Production-Ready:**

1. ~~Complete EVI003 (Observability)~~ ⏳ Partial (errors ✅, traces ⏳)
2. ~~Complete EVI004 (Jobs/Queue)~~ ✅ DONE
3. **Complete EVI005 (Auth Integration)** ← NEXT
4. Configure Tempo endpoint for distributed tracing
5. Add rate limiting middleware
6. Set up CI/CD pipeline
7. Configure health check endpoints
8. Document backup/restore procedures
9. Load testing + performance tuning

**Estimated Effort to Production:** 3-5 additional sessions (was 5-8, EVI001-004 complete)

---

## Questions?

**Where to find documentation:**

- Foundation rules: `.cursor/plans/A-canonical-can/CAN002-FOUNDATION-DONE.md`
- Evidence captures: `.cursor/plans/C-evidence-evi/EVI*.md`
- Architecture guides: `docs/*.md`
- Global rules: `.cursor/rules/00-global.always.mdc`

**Common Issues:**

- Turbopack error? → Use `pnpm --filter web dev:webpack`
- Drift gate failing? → Check `git status -- packages/db/drizzle packages/db/src/schema.ts`
- Lint errors? → Run `pnpm -w lint` to see specific issues
- DB connection issues? → Verify `DATABASE_URL` is set correctly

**Philosophy:**

- DRY + KISS (Don't Repeat Yourself, Keep It Simple)
- Minimal change (do the minimum that solves the problem)
- Single source of truth (if a rule is needed in 2+ places, it belongs in global canon)
- Quality over speed (incomplete work is better than fake completion)
