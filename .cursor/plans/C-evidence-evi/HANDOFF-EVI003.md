# Developer Handoff: EVI003 Execution

**Date:** 2026-01-19  
**Status:** Ready for execution (code complete, packages installed)  
**Context Window:** Approaching limit, migrate to new chat for execution

---

## Current State

### ✅ Completed (This Session)

1. **EVI002 CERTIFIED COMPLETE**
   - ✅ EVI002-A: Database proof (migrations + smoke test + wiring log)
   - ✅ EVI002-B: HTTP proof (create + cross-tenant isolation)
   - ✅ EVI002-C: Tenant isolation (RLS policies + indexes)
   - ✅ All evidence captured and documented
   - ⚠️ Follow-up: Map repository null → 404 (currently returns 500)

2. **Foundation Gates Restored**
   - ✅ ESLint gate: TypeScript linting active (7/7 packages)
   - ✅ DB drift gate: Idiot-proof messages, infra SQL canonized
   - ✅ All core gates passing: `lint`, `check:api-kernel`, `typecheck:core`, `check:db-migrations`

3. **Observability Wired (Crash-Proof)**
   - ✅ `apps/web/instrumentation.ts` - OTel init with try/catch protection
   - ✅ `packages/observability/src/errors.ts` - GlitchTip capture (3 guards, typed scope, `axis.*` tags)
   - ✅ `packages/api-kernel/src/kernel.ts` - Single capture point on errors
   - ✅ OTel packages installed (workspace root):
     - `@opentelemetry/sdk-trace-node@2.4.0`
     - `@opentelemetry/sdk-trace-base@2.4.0`
     - `@opentelemetry/exporter-trace-otlp-http@0.210.0`
     - `@opentelemetry/resources@2.4.0`
     - `@opentelemetry/semantic-conventions@1.39.0`
     - `@opentelemetry/instrumentation@0.210.0`

4. **Documentation Updated**
   - ✅ EVI002-REQUESTS-REAL.md: Marked complete with evidence
   - ✅ CAN002-FOUNDATION-DONE.md: Updated with EVI002 completion
   - ✅ EVI003-OBSERVABILITY-STITCH.md: Updated with canon-correct instructions
   - ✅ NEXT-STEPS.md: Created with development workflow guide

---

## Next Task: EVI003 Execution

**Goal:** Prove logs ↔ trace ↔ GlitchTip correlation via `traceId`

**Doc:** `.cursor/plans/C-evidence-evi/EVI003-OBSERVABILITY-STITCH.md`

### Required (Missing)

**Environment Variables:**

1. `OTEL_EXPORTER_OTLP_ENDPOINT` - Tempo OTLP HTTP endpoint
   - Local: `http://localhost:4318/v1/traces` (requires Tempo Docker container)
   - Cloud: Grafana Cloud OTLP gateway
2. `SENTRY_DSN` - GlitchTip DSN (canon) or Sentry DSN (fallback)
   - Cloud: glitchtip.com (free tier)
   - Self-hosted: GlitchTip Docker

**IMPORTANT:** Use GlitchTip (canon), not Sentry. We use Sentry-compatible SDK (`@sentry/nextjs`) to send to GlitchTip.

### Execution Steps (Detailed in EVI003 Doc)

1. **Test startup without env** (verify no crash)
2. **Test startup with env** (verify OTel init log)
3. **Generate success request** (capture traceId, query Tempo)
4. **Generate error request** (capture traceId, query Tempo + GlitchTip)
5. **Paste evidence into EVI003-OBSERVABILITY-STITCH.md**

**Recommended Error Test:**
Reuse cross-tenant approve from EVI002-B (reliably produces error path):

```bash
curl.exe -X POST "http://localhost:3000/api/requests/<id>/approve" \
  -H "X-Tenant-ID: <different-tenant-id>" \
  -H "Authorization: Bearer dev" \
  -H "X-Actor-ID: <user-id>" -d "{}"
```

---

## Development Environment Setup

### Database Connection

```powershell
$env:DATABASE_URL = "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Dev Server (Webpack Mode - Windows Workaround)

```powershell
# Kill existing servers
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Start server
pnpm --filter web dev:webpack
```

**Why webpack mode?** Turbopack has Windows symlink privilege issues (`os error 1314`). Webpack mode is stable.

### Core Gates (Sanity Check)

```powershell
pnpm -w lint                    # ESLint (7/7 packages)
pnpm -w check:api-kernel        # 8 routes checked
pnpm -w typecheck:core          # 3/3 packages
pnpm -w check:db-migrations     # No drift
```

---

## Key Files & Locations

### Evidence Documents

- `.cursor/plans/C-evidence-evi/EVI002-REQUESTS-REAL.md` - ✅ COMPLETE
- `.cursor/plans/C-evidence-evi/EVI003-OBSERVABILITY-STITCH.md` - ⏳ PENDING EXECUTION
- `.cursor/plans/C-evidence-evi/NEXT-STEPS.md` - Development workflow

### Canon Documents

- `.cursor/plans/A-canonical-can/CAN002-FOUNDATION-DONE.md` - Foundation checklist
- `.cursor/rules/00-global.always.mdc` - Global rules (DRY, KISS, quality gates)

### Observability Code

- `apps/web/instrumentation.ts` - OTel initialization (env-gated, crash-proof)
- `packages/observability/src/errors.ts` - GlitchTip error capture (3 guards)
- `packages/api-kernel/src/kernel.ts` - Single error capture point

### Scripts

- `scripts/check-db-migrations.ts` - DB drift check (idiot-proof messages)
- `scripts/run-evi002b.ts` - Wiring log + HTTP test helper
- `scripts/smoke-db.ts` - DB roundtrip smoke test

---

## Known Issues & Follow-Ups

### Low Priority (Post-EVI003)

1. **Error Mapping Improvement**
   - Issue: Repository null → `500 INTERNAL_ERROR`
   - Expected: Should map to `404 NOT_FOUND`
   - Location: `packages/api-kernel/src/errors.ts` or domain service
   - Effort: 30 minutes

2. **Add Lint to CI**
   - Task: Add `pnpm -w lint` to `.github/workflows/core-integrity.yml`
   - Effort: 5 minutes
   - Status: Lint gate working locally, just needs CI integration

3. **Turbopack Investigation**
   - Issue: Windows symlink privilege error
   - Current workaround: `pnpm --filter web dev:webpack` (stable)
   - Permanent fix options:
     - Enable Windows Developer Mode
     - Continue using webpack mode
     - Wait for Next.js/Turbopack improvements

---

## Canon Philosophy Reminders

### Global Rules (Always Apply)

- **DRY + KISS**: Don't Repeat Yourself, Keep It Simple
- **Minimal Change**: Do the minimum that solves the problem
- **Single Source of Truth**: If a rule is needed in 2+ places, it belongs in global canon
- **Quality Over Speed**: Incomplete work is better than fake completion

### Output Discipline

**Required Format (unless user requests verbose):**

```
[Minimal diff/patch showing ONLY what changed]

Compliance: [0-100]% (Verified) | N/A (Unverifiable: [reason])

Reasons:
- [Max 5 bullets, ≤ 1 line each]
```

### Assumption Ban

- **FORBIDDEN**: Proceeding based on assumptions
- **REQUIRED**: STOP and ask clarifying questions when:
  - Critical detail is missing
  - Information is ambiguous
  - Multiple interpretations possible
  - Default value could affect correctness

### Test & Verification Discipline

**MANDATORY** for any change affecting behavior:

1. Run verification (`pnpm test`, `pnpm lint`, `read_lints`, etc.)
2. Report results: "Tests passed" | "Tests failed: [errors]"
3. If tests cannot run: State exact command to verify

**FORBIDDEN:**

- Claiming "done" without verification
- Saying "should work" without running tests
- Assuming correctness without evidence

---

## How to Continue in New Chat

### Step 1: Context

Provide this handoff document to the new chat session.

### Step 2: Environment Variables

Obtain and provide:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=<your-endpoint>
SENTRY_DSN=<your-dsn>
```

### Step 3: Execute EVI003

Follow the detailed steps in `EVI003-OBSERVABILITY-STITCH.md`:

1. Test startup without env
2. Test startup with env
3. Generate success request
4. Generate error request
5. Capture evidence (response JSON + Tempo screenshots + GlitchTip screenshots)

### Step 4: Paste Evidence

The new chat session will:

1. Verify evidence meets acceptance criteria
2. Update EVI003 doc with captured evidence
3. Mark EVI003 as COMPLETE
4. Update CAN002 to reflect EVI003 completion

---

## Success Criteria for EVI003

- [ ] Server starts cleanly with NO env vars (silent fallback)
- [ ] Server starts cleanly WITH env vars (OTel init logged)
- [ ] Successful request produces correlated log + trace (matching `traceId`)
- [ ] Error request produces correlated log + trace + GlitchTip issue (all with matching `traceId`)
- [ ] No duplicate captures (one error = one log + one trace + one issue)
- [ ] GlitchTip tags include: `axis.trace_id`, `axis.request_id`, `axis.tenant_id`, `axis.actor_id`, `axis.route_id`

---

## Questions to Ask in New Chat

**If stuck on setup:**

- "How do I get a GlitchTip DSN?" (cloud or self-hosted instructions)
- "How do I run Tempo locally?" (Docker command provided in EVI003 doc)

**If stuck on execution:**

- "What exact curl command should I use for success request?"
- "What exact curl command should I use for error request?"

**If stuck on evidence:**

- "What should I paste from Tempo?" (screenshot or trace JSON with matching traceId)
- "What should I paste from GlitchTip?" (issue screenshot showing `axis.trace_id` tag)

---

## Recommended Next Phase (After EVI003)

**Option A: Auth Integration**

- Goal: Replace auth stub with real Neon Auth provider
- Prerequisite: Neon project with Auth enabled
- Effort: 2-3 sessions

**Option B: First Real Feature**

- Goal: Files addon (upload with presigned URLs)
- Prerequisite: S3-compatible storage
- Effort: 3-4 sessions

**Recommendation:** Auth first (horizontal capability that applies to all features)

---

## Final Notes

**Current Status:**

- ✅ Foundation complete
- ✅ First feature proven (Requests with DB persistence)
- ✅ Observability wired (crash-proof)
- ⏳ Observability proof pending (EVI003)

**This session accomplished:**

- EVI002 certification (all 3 parts)
- Foundation gates restoration
- Observability crash-proofing
- Canon documentation updates

**Next session focus:**

- EVI003 execution only (no new features, no refactors)
- Evidence capture (logs + traces + errors)
- Proof of correlation via `traceId`

---

**Ready to migrate to new chat for EVI003 execution.**
