# KER210 — Traffic Governor & Idempotency (K-M6)
**Status:** Ratification-Ready  
**Layer:** Kernel (Performance + Integrity Plane)  
**Why this exists:** Prevent noisy-neighbor, abuse, and double-execution corruption  
**Primary consumers:** All API routes, jobs, and webhook endpoints  
**Canon anchor:** CAN003 status discipline + 429/409 + trace envelope :contentReference[oaicite:1]{index=1}

---

## 0) Canonical Purpose (Non-Negotiable)

A multi-tenant ERP must be safe against:
- tenant abuse (intentional or accidental)
- retry storms (mobile networks, flaky connections)
- double-billing / double-posting
- webhook replays
- noisy-neighbor resource starvation

**Traffic Governor** is a kernel enforcement layer that provides:
1) **Rate limiting** (tenant/user/ip scoped)
2) **Idempotency replay protection** (Idempotency-Key)

These must be kernel-owned because domain modules cannot enforce them consistently and safely.

---

## 1) Boundary Rules

### Kernel MUST own
- Rate limit enforcement and response shape
- Idempotency replay cache (store + return prior response)
- Request hash verification for idempotency safety
- Audit logs for throttles and replays
- Quota integration for batch/scheduler fairness

### Kernel MUST NOT own
- business semantics (“invoice retry policy”)
- domain-specific throttling decisions

Kernel enforces generic fairness and safety.

---

## 2) Canonical Guarantees

### 2.1 Rate Limiting Guarantees
- Enforcement MUST be per-tenant (minimum)
- Optional per-user / per-IP
- Must return **429** with standard error envelope :contentReference[oaicite:2]{index=2}
- MUST NOT leak existence of resources (no enumeration)

### 2.2 Idempotency Guarantees
When a request includes `Idempotency-Key`:
- Kernel MUST ensure the request executes **at most once** per key per TTL window
- Repeated requests return the **original response** (same payload + status)
- If the same key is reused with different request body, kernel returns **409 Conflict** (idempotency violation)

---

## 3) Canonical Interfaces (Zod SSOT)

### 3.1 Rate Limit Policy
```ts
import { z } from "zod";

export const RateLimitScope = z.union([
  z.literal("tenant"),
  z.literal("tenant_user"),
  z.literal("tenant_ip"),
]);

export const RateLimitPolicy = z.object({
  tenantId: z.string().uuid(),
  scope: RateLimitScope,
  routeId: z.string().min(3).max(120),
  windowSeconds: z.number().int().min(1).max(60 * 60),
  maxRequests: z.number().int().min(1).max(1_000_000),
});


3.2 Idempotency Record

export const IdempotencyRecord = z.object({
  tenantId: z.string().uuid(),
  key: z.string().min(8).max(200),
  routeId: z.string().min(3).max(120),
  method: z.string().min(3).max(10),
  requestHash: z.string().min(16),
  statusCode: z.number().int(),
  responseBodyRef: z.string().min(1),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

4) Supporting: Kernel Enforcement Algorithm
4.1 Rate limiting algorithm (token bucket / fixed window)

Kernel enforcement steps:

Identify scope key:

tenant: tenantId

tenant_user: tenantId + actorId

tenant_ip: tenantId + ip

Increment counter atomically

If exceeded → return 429 + standard error envelope

4.2 Idempotency algorithm

When header Idempotency-Key exists:

Compute requestHash from:

method + routeId + tenantId + bodyHash + queryHash

Look up (tenantId, key, routeId, method)

If record exists:

if requestHash matches → return stored response

else → return 409 conflict

If no record exists:

create “pending” record

execute handler

store response ref + status + body

return response

Important: This must be atomic to avoid double-exec under concurrency.

5) Supporting: Storage Model (Postgres)
5.1 kernel_rate_limit_counter

tenant_id uuid not null

scope_key text not null

route_id text not null

window_start timestamptz not null

count int not null

Unique:

(tenant_id, scope_key, route_id, window_start)

5.2 kernel_idempotency_record

tenant_id uuid not null

key text not null

route_id text not null

method text not null

request_hash text not null

status_code int not null

response_body_ref text not null

created_at timestamptz not null

expires_at timestamptz not null

Unique:

(tenant_id, key, route_id, method)

Index:

(expires_at)

6) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

idempotency implemented in domain services

“retry safe” assumptions without Idempotency-Key

caching response in memory only (must survive restarts)

returning non-standard error envelopes 

CAN003-ARCHITECTURE-SPEC-v3

7) Evidence (EVI043 — Traffic Governor Certified)
Acceptance Criteria

Rate limiting works per tenant without affecting others

Idempotency returns same response for same key

Key reuse with different request rejected (409)

All events are audited with traceId

Paste Blocks

[A] Rate limit triggers 429 with error envelope

[B] Tenant A throttled, Tenant B unaffected

[C] Idempotency replay returns original response

[D] RequestHash mismatch returns 409

[E] Audit log shows throttle/replay decisions with traceId

End of KER-210