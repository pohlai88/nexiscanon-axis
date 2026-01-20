# KER260 — Telemetry Propagation & Performance Budgeting (K-M7)
**Status:** Ratification-Ready  
**Layer:** Kernel (Observability Plane)  
**Why this exists:** Make multi-tenant debugging possible; enforce trace continuity; detect perf regressions early  
**Primary consumers:** Every kernel route, domain service call, DB query, outbox event, webhook delivery, job run  
**Canon anchor:** CAN003 stitched observability + strict kernel envelope + Zod SSOT :contentReference[oaicite:1]{index=1}

---

## 0) Canonical Purpose (Non-Negotiable)

In a Kernel architecture, a request traverses multiple layers:
`Edge -> Kernel -> Auth -> Workflow -> DB -> EventBus -> Webhooks -> Jobs`

Without propagation, you cannot answer:
- “Why is Tenant X slow?”
- “Which query caused the spike?”
- “Which webhook caused the retry storm?”
- “Which approval failed and where?”

This capability ensures:
- a TraceID is **created once**
- it is **propagated everywhere**
- performance budgets are **enforced consistently**
- every decision is **audit/trace linked**

---

## 1) Boundary Rules

### Kernel MUST own
- TraceID generation at edge (once per request)
- TraceContext propagation via ALS (AsyncLocalStorage)
- Standard propagation into:
  - logs
  - audit entries
  - DB queries (comment tag)
  - outbox events
  - webhook deliveries
  - job runs
  - batch ops
- Performance budget detection + violation logging

### Kernel MUST NOT own
- “business dashboards”
- tenant billing decisions
- domain performance tuning rules

Kernel provides consistent observability substrate only.

---

## 2) Canonical Guarantees

### 2.1 Trace Context is mandatory
Every request and job execution MUST have:
- `traceId`
- `tenantId`
- `requestId` (or runId)
- `actorId` (optional)
- `routeId/handlerId` (optional)

### 2.2 Trace propagation scope
Trace must be attached to:
- every audit event
- every error envelope
- every event envelope
- every webhook delivery record
- every scheduler job run record

### 2.3 Performance budgeting
Kernel enforces a budget model:
- route budget (e.g., 500ms default)
- query budget (e.g., 200ms default)
- external call budget (e.g., 800ms default)

Violations MUST emit:
- structured log with `perf_violation=true`
- traceId + tenantId
- component name (route/query/webhook/job)
- observed latency and budget

---

## 3) Canonical Interfaces (Zod SSOT)

```ts
import { z } from "zod";

export const TraceContext = z.object({
  traceId: z.string().min(8).max(80),
  requestId: z.string().min(8).max(120),
  tenantId: z.string().uuid(),
  actorId: z.string().uuid().optional(),
  routeId: z.string().min(1).max(120).optional(),
  // Optional correlation to masquerade and "on behalf of"
  masqueradeSessionId: z.string().uuid().optional(),
  onBehalfOfUserId: z.string().uuid().optional(),
});

4) Supporting: Propagation Rules (Hard Requirements)
4.1 HTTP Edge

If incoming request has x-trace-id, accept only if valid; otherwise create new.

Always return x-trace-id in response headers.

4.2 ALS Contract

ALS store MUST hold TraceContext for entire request lifecycle.

Domain services must read from ALS, not generate new trace ids.

4.3 Audit / Error Envelope

Every audit write MUST include traceId.

Every error response MUST include traceId in standard envelope per CAN003 

CAN003-ARCHITECTURE-SPEC-v3

4.4 DB Query Annotation

All DB queries MUST include a trace comment:

Example (conceptual): /* traceId=... tenantId=... routeId=... */
This is required so you can correlate slow queries back to user actions.

4.5 Event / Webhook

Outbox events MUST include traceId.

Webhook deliveries MUST persist traceId.

4.6 Jobs / Batches

Each job run MUST have traceId derived from runId

Batches propagate traceId across item processing

5) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

generating new trace ids in domain modules

logging without tenantId + traceId

DB queries executed outside kernel/db wrapper that injects trace comment

“string concatenated logs” without structured fields

6) Evidence (EVI044 — Telemetry Propagation Certified)
Acceptance Criteria

TraceID created once and returned

TraceID is present in audit, events, webhooks, jobs

DB statements show trace annotation

Perf violations trigger structured warnings

Paste Blocks

[A] Edge trace header appears in response

[B] Audit entry contains same traceId

[C] Outbox event and webhook delivery store same traceId

[D] DB statement/log includes trace comment

[E] Perf violation emitted when budget exceeded

End of KER-260