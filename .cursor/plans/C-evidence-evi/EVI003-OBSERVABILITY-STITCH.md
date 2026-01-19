# EVI003 — Observability Stitch Proof (Pending)

## Goal

Prove logs + traces + errors share the same `traceId` and do not duplicate.

All three pillars (logs, traces, errors) are wired and env-gated:
- **Logs**: Pino with context correlation (always enabled)
- **Traces**: OpenTelemetry → Tempo (OTLP) (enabled when `OTEL_EXPORTER_OTLP_ENDPOINT` set)
- **Errors**: GlitchTip/Sentry (enabled when `SENTRY_DSN` set)

## Required Environment Variables

```bash
# OpenTelemetry (optional - silent if absent)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces  # Tempo OTLP HTTP
OTEL_SERVICE_NAME=nexuscanon-axis-web                         # Optional, defaults to "nexuscanon-axis-web"

# GlitchTip/Sentry (optional - silent if absent)
SENTRY_DSN=https://<key>@<host>/<project>                     # GlitchTip DSN
```

## Wiring Implementation

### 1. Instrumentation (`apps/web/instrumentation.ts`)
- ✅ Env-gated OTel initialization
- ✅ Silent no-op when `OTEL_EXPORTER_OTLP_ENDPOINT` absent
- ✅ OTLP exporter configured for Tempo

### 2. Error Capture (`packages/observability/src/errors.ts`)
- ✅ `captureException(err, ctx)` wrapper
- ✅ Env-gated (no-op when `SENTRY_DSN` absent)
- ✅ Attaches correlation tags: `traceId`, `requestId`, `tenantId`, `actorId`, `routeId`

### 3. Kernel Integration (`packages/api-kernel/src/kernel.ts`)
- ✅ Every request has `ctx.traceId` + `ctx.requestId`
- ✅ Logger includes these fields (via ALS context)
- ✅ On error: normalize → log ONCE → `captureException()` ONCE
- ✅ No duplicate captures

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
1. Trigger validation error (e.g., invalid JSON body)
2. Extract `traceId` from error response
3. Verify:
   - Log line has `traceId`
   - Tempo trace exists with same `traceId` (marked as ERROR)
   - GlitchTip issue has `traceId` tag

**Expected:**
- ✅ Pino error log includes `traceId` and error details
- ✅ Tempo trace exists, span marked as ERROR
- ✅ GlitchTip issue includes tags: `traceId`, `requestId`, `tenantId`, `actorId`, `routeId`
- ✅ ONE log line, ONE trace, ONE GlitchTip issue (no duplicates)

**Status:** ⏳ Pending execution

**Capture:**
```json
// Error log line
{"level":"error","traceId":"def456...","error":{"code":"VALIDATION_ERROR"},"msg":"Request failed"}

// Tempo trace (error span)
<paste trace JSON showing error status>

// GlitchTip issue
Issue ID: #12345
Tags:
  - traceId: def456...
  - requestId: ghi789...
  - tenantId: tenant-a
  - routeId: requests.create
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
- [ ] Server starts cleanly with NO env vars (silent fallback)
- [ ] Server starts cleanly WITH env vars (OTel init logged)
- [ ] Successful request produces correlated log + trace
- [ ] Error request produces correlated log + trace + GlitchTip issue
- [ ] No duplicate captures (one error = one log + one trace + one issue)
- [ ] Tenant context correctly propagated to all three pillars

## Next Steps

1. Set up local Tempo + GlitchTip instances (or use cloud)
2. Configure environment variables
3. Execute test scenarios
4. Capture and paste evidence into this document
5. Mark as **COMPLETE** when all captures verified

## Notes

- Logs always work (no env needed)
- Traces optional (controlled by `OTEL_EXPORTER_OTLP_ENDPOINT`)
- Errors optional (controlled by `SENTRY_DSN`)
- All three share the same `traceId` for correlation
- Kernel ensures single capture point (no double-logging/double-capturing)
