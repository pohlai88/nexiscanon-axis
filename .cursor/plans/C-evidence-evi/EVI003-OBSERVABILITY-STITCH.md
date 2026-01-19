# EVI003 — Observability Stitch Proof (Pending)

## Goal

Prove logs + traces + errors share the same `traceId` and do not duplicate.

All three pillars (logs, traces, errors) are wired and env-gated:
- **Logs**: Pino with context correlation (always enabled)
- **Traces**: OpenTelemetry → Tempo (OTLP) (enabled when `OTEL_EXPORTER_OTLP_ENDPOINT` set)
- **Errors**: GlitchTip (Sentry-compatible SDK) (enabled when `SENTRY_DSN` set)

## Required Environment Variables

```bash
# OpenTelemetry (optional; safe no-op if absent)
# Point this at Tempo OTLP HTTP (self-hosted) or Grafana Cloud OTLP gateway
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_SERVICE_NAME=nexuscanon-axis-web  # optional; defaults to "nexuscanon-axis-web"

# Error Tracking (optional; safe no-op if absent)
# IMPORTANT: We use the Sentry-compatible SDK (@sentry/nextjs) to send events to GlitchTip.
# A "Sentry account" is NOT required. You only need a DSN from GlitchTip (or any Sentry-compatible backend).
SENTRY_DSN=https://<key>@<host>/<project>  # GlitchTip DSN
```

### How to Get Environment Variables

**1. OTEL_EXPORTER_OTLP_ENDPOINT (Traces)**

**Local Tempo (recommended for testing):**
```bash
docker run -d -p 4318:4318 -p 3200:3200 --name tempo grafana/tempo:latest
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

**Grafana Cloud (free tier):**
- Sign up at grafana.com
- Get OTLP endpoint from Cloud Portal
- Format: `https://otlp-gateway-<region>.grafana.net/otlp/v1/traces`

**2. SENTRY_DSN (Errors → GlitchTip)**

**GlitchTip Cloud (free tier - canon):**
- Sign up at glitchtip.com
- Create project → copy DSN
- Format: `https://<key>@app.glitchtip.com/<project-id>`

**GlitchTip Self-Hosted:**
- Deploy via Docker: `docker run -d -p 8000:8000 glitchtip/glitchtip`
- Create project → copy DSN

**Fallback (non-canon): Sentry**
- Only if temporarily using Sentry as backend
- Sign up at sentry.io → create project → copy DSN

## Wiring Implementation (✅ COMPLETE)

### 1. Instrumentation (`apps/web/instrumentation.ts`)
- ✅ Env-gated OTel initialization
- ✅ Crash-proof: try/catch around all imports
- ✅ Silent no-op when `OTEL_EXPORTER_OTLP_ENDPOINT` absent
- ✅ OTLP exporter configured for Tempo
- ✅ Console.warn when env present but packages missing

### 2. Error Capture (`packages/observability/src/errors.ts`)
- ✅ `captureException(err, ctx)` wrapper
- ✅ Env-gated (no-op when `SENTRY_DSN` absent)
- ✅ 3-guard crash-proofing (DSN check + SDK missing + runtime failure)
- ✅ Attaches correlation tags: `axis.trace_id`, `axis.request_id`, `axis.tenant_id`, `axis.actor_id`, `axis.route_id`
- ✅ Typed scope (no `any`)

### 3. Kernel Integration (`packages/api-kernel/src/kernel.ts`)
- ✅ Every request has `ctx.traceId` + `ctx.requestId`
- ✅ Logger includes these fields (via ALS context)
- ✅ On error: normalize → log ONCE → `captureException()` ONCE
- ✅ No duplicate captures

### 4. OTel Packages (✅ INSTALLED - 2026-01-19)
- ✅ `@opentelemetry/sdk-trace-node@2.4.0`
- ✅ `@opentelemetry/sdk-trace-base@2.4.0`
- ✅ `@opentelemetry/exporter-trace-otlp-http@0.210.0`
- ✅ `@opentelemetry/resources@2.4.0`
- ✅ `@opentelemetry/semantic-conventions@1.39.0`
- ✅ `@opentelemetry/instrumentation@0.210.0`

## Evidence Checklist (Required Outputs)

### [1] Dev Server Startup (No Env)

**Command:**
```bash
pnpm -w dev
```

**Expected:**
- ✅ Server starts successfully
- ✅ No OTel/Sentry errors
- ✅ No crashes

**Status:** ⏳ Pending execution

**Capture:**
```
<paste startup logs showing clean start>
```

---

### [2] Dev Server Startup (With Env)

**Command:**
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
export SENTRY_DSN=https://...
pnpm -w dev
```

**Expected:**
- ✅ Server starts successfully
- ✅ OTel initialization log appears: `[OTel] Tracing initialized: ...`

**Status:** ⏳ Pending execution

**Capture:**
```
<paste startup logs showing OTel init>
```

---

### [3] Successful Request (Log + Trace Correlation)

**Test:**
1. Send successful request to any API endpoint
2. Extract `traceId` from response headers or logs
3. Query Tempo for that trace
4. Verify log line has same `traceId`

**Expected:**
- ✅ Pino log includes `traceId` field
- ✅ Tempo shows trace with matching `traceId`
- ✅ Trace includes span attributes: `route.id`, `tenant.id`, `actor.id`

**Status:** ⏳ Pending execution

**Capture:**
```json
// Log line
{"traceId":"abc123...","requestId":"xyz789...","msg":"Request completed successfully"}

// Tempo trace lookup
<paste screenshot or trace JSON showing matching traceId>
```

---

### [4] Error Request (Log + Trace + GlitchTip Correlation)

**Test:**
1. Trigger error request (recommended: cross-tenant approve from EVI002-B)
2. Extract `traceId` from error response
3. Verify:
   - Log line has `traceId`
   - Tempo trace exists with same `traceId` (marked as ERROR)
   - GlitchTip issue has `axis.trace_id` tag

**Recommended Test Command:**
```bash
# Reuse the cross-tenant approve test from EVI002-B
# This reliably produces an error path with traceId
curl.exe -X POST "http://localhost:3000/api/requests/<request-id>/approve" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: <different-tenant-id>" \
  -H "Authorization: Bearer dev" \
  -H "X-Actor-ID: <user-id>" \
  -d "{}"
```

**Expected:**
- ✅ Pino error log includes `traceId` and error details
- ✅ Tempo trace exists, span marked as ERROR
- ✅ GlitchTip issue includes tags: `axis.trace_id`, `axis.request_id`, `axis.tenant_id`, `axis.actor_id`, `axis.route_id`
- ✅ ONE log line, ONE trace, ONE GlitchTip issue (no duplicates)

**Status:** ⏳ Pending execution

**Capture:**
```json
// Error response
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Request not found: <id>",
    "traceId": "def456..."
  }
}

// Error log line (check server output)
{"level":"error","traceId":"def456...","error":{"code":"INTERNAL_ERROR"},"msg":"Request failed"}

// Tempo trace lookup
<paste screenshot showing trace with matching traceId and error status>

// GlitchTip issue
Issue ID: #<number>
Tags:
  - axis.trace_id: def456...
  - axis.request_id: ghi789...
  - axis.tenant_id: <tenant>
  - axis.route_id: requests.approve
```

---

### [5] Cross-Tenant Error (Isolation Verification)

**Test:**
1. Create request in Tenant A
2. Attempt to approve from Tenant B context
3. Verify error includes correct tenant context in logs + GlitchTip

**Expected:**
- ✅ Error logged with both `tenantId` values (requester vs resource owner)
- ✅ GlitchTip tags show attempted tenant access

**Status:** ⏳ Pending execution

**Capture:**
```
<paste error log + GlitchTip issue showing tenant isolation context>
```

---

## Acceptance Criteria

- [x] Code wired (instrumentation + error capture + kernel integration)
- [x] Server starts cleanly with NO env vars (silent fallback) — ✅ VERIFIED 2026-01-20
- [x] Server starts cleanly WITH env vars (OTel init logged) — ✅ VERIFIED 2026-01-20
- [x] GlitchTip API fixed (captureException now uses @sentry/core) — ✅ FIXED 2026-01-20
- [x] OTEL headers support added (required for Grafana Cloud auth) — ✅ FIXED 2026-01-20
- [x] Error pillar working (GlitchTip captures with axis.* tags) — ✅ VERIFIED 2026-01-20
- [ ] Trace pillar verified (Grafana Tempo query by traceId) — ⏳ PENDING (env not loaded, proof not captured)
- [ ] Three-pillar stitch proven (same traceId in logs + traces + errors) — ⏳ PENDING trace verification

## ⏳ PARTIAL — 2026-01-20

**Status:** Errors pillar ✅ complete, traces pillar ⏳ pending verification

**What's Complete:**
- GlitchTip integration working with full correlation
- OTEL headers support added to instrumentation
- Error capture with axis.* tags verified

**What's Pending:**
- Grafana Tempo trace verification (env not loaded in test run)
- Three-pillar stitch proof (logs ↔ traces ↔ errors with same traceId)

**Blocking:** Not blocking further development. Can be completed async.

**Next:** Proceeding to EVI004 (Jobs/Queue) while observability traces remain available for future verification.

### Evidence Captured (2026-01-20)

**Test Error Event:**
- Event ID: `917ae52a8c3545e6a50194a859817e4e`
- Error: "Test error from test-glitchtip.ts script - traceId: test-1768846377674"
- Timestamp: 2026-01-20 01:12:57 AM GMT+7

**Verified Tags:**
- ✅ `axis.trace_id`: `test-1768846377674`
- ✅ `axis.route_id`: `test.glitchtip.script`
- ✅ `axis.test`: `true`
- ✅ `environment`: `development`

**Verified Context:**
- ✅ Stack traces with source locations
- ✅ Breadcrumbs (console logs before error)
- ✅ System info (Node v22.20.0, Windows 10.0.26200)
- ✅ Custom context (test_context with timestamp/source)

**Fix Applied:**
```diff
packages/observability/src/errors.ts
- Old: Sentry.withScope(...) from @sentry/nextjs
+ New: captureException(err, { tags, contexts }) from @sentry/core
```

**Root Cause:**
Sentry v10+ no longer exports `captureException` from `@sentry/nextjs`. Must import from `@sentry/core` and pass tags/contexts as hint object.

## Next Steps (Optional Enhancement)

### Prerequisites Completed:
- ✅ OTel packages installed (workspace root)
- ✅ Instrumentation crash-proof
- ✅ Error capture crash-proof
- ✅ Kernel integration complete

### To Execute EVI003:

1. **Get environment variables:**
   - `OTEL_EXPORTER_OTLP_ENDPOINT` (see "How to Get Environment Variables" above)
   - `SENTRY_DSN` (GlitchTip or Sentry-compatible backend)

2. **Test without env (verify no crash):**
   ```bash
   # Kill any running servers
   Stop-Process -Name node -Force -ErrorAction SilentlyContinue
   
   # Start without env
   pnpm --filter web dev:webpack
   # Verify: Server starts cleanly, no errors
   ```

3. **Test with env (verify OTel init):**
   ```bash
   # Set env vars
   $env:OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318/v1/traces"
   $env:SENTRY_DSN = "https://<key>@<host>/<project>"
   $env:DATABASE_URL = "postgresql://..."
   
   # Start server
   pnpm --filter web dev:webpack
   # Verify: Look for "[OTel] Tracing initialized: ..." in logs
   ```

4. **Generate success request:**
   ```bash
   curl.exe -X POST "http://localhost:3000/api/requests" \
     -H "Content-Type: application/json" \
     -H "X-Tenant-ID: <tenant-id>" \
     -H "Authorization: Bearer dev" \
     -H "X-Actor-ID: <user-id>" \
     -d "{}"
   ```
   - Capture response JSON (contains `meta.traceId`)
   - Query Tempo for trace by traceId
   - Verify log line has matching traceId

5. **Generate error request:**
   ```bash
   # Use cross-tenant approve (reliably produces error)
   curl.exe -X POST "http://localhost:3000/api/requests/<request-id>/approve" \
     -H "Content-Type: application/json" \
     -H "X-Tenant-ID: <different-tenant-id>" \
     -H "Authorization: Bearer dev" \
     -H "X-Actor-ID: <user-id>" \
     -d "{}"
   ```
   - Capture error response JSON (contains `error.traceId`)
   - Query Tempo for trace (should show error status)
   - Check GlitchTip for issue with `axis.trace_id` tag

6. **Paste evidence into sections [1]-[4] above**

7. **Mark as COMPLETE when all captures verified**

## Notes

- Logs always work (no env needed)
- Traces optional (controlled by `OTEL_EXPORTER_OTLP_ENDPOINT`)
- Errors optional (controlled by `SENTRY_DSN`)
- All three share the same `traceId` for correlation
- Kernel ensures single capture point (no double-logging/double-capturing)
