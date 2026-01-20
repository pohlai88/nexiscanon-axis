
---

# ✅ 2) `KER-310-EVENTBUS-OUTBOX-WEBHOOKS-K-E1.md`

```md
# KER-310 — EventBus + Transactional Outbox + Webhooks (K-E1)
**Status:** Ratification-Ready  
**Layer:** Kernel (Ecosystem Plane)  
**Why this exists:** Reliable integrations without data loss; deterministic delivery; audit+trace continuity  
**Primary consumers:** Domain ERP modules, connectors, marketplace addons, external systems  
**Canon anchor:** CAN003 trace propagation + standard envelopes + audit linkage :contentReference[oaicite:2]{index=2}

---

## 0) Canonical Purpose (Non-Negotiable)

ERP platforms must integrate with:
- accounting tools
- banks
- tax portals
- BI systems
- external auditors
- procurement vendors

Kernel must provide:
- **transactional outbox** (no lost events)
- delivery worker with retries + DLQ
- webhook signing + tenant scoping
- observability: traceId end-to-end
- privacy enforcement on payloads (via K-B1)

---

## 1) Boundary Rules

### Kernel MUST own
- outbox write semantics (transactional guarantee)
- event envelope schema (canonical)
- retry policy + DLQ + replay
- webhook endpoint registry + signing
- privacy redaction for external payloads
- audit for publish/deliver/fail outcomes

### Kernel MUST NOT own
- domain event meanings
- connector-specific field mappings
- third-party API semantics

Domains emit events; kernel delivers safely.

---

## 2) Canonical Guarantees

### 2.1 Transactional guarantee
If domain transaction commits, event MUST exist in outbox.
If domain transaction rolls back, event MUST NOT exist.

### 2.2 At-least-once delivery
Webhooks/events are delivered at least once.
Consumers must be idempotent; kernel provides eventId for that.

### 2.3 Ordering
Ordering is guaranteed per `(tenantId, streamKey)` if configured.
Global ordering is not required.

### 2.4 DLQ
After max attempts, move to DLQ with reason and allow replay.

---

## 3) Canonical Interfaces (Zod SSOT)

### 3.1 Event Envelope
```ts
import { z } from "zod";

export const EventEnvelope = z.object({
  eventId: z.string().uuid(),
  tenantId: z.string().uuid(),
  streamKey: z.string().min(1).max(120), // e.g. "invoice", "posting"
  type: z.string().min(1).max(160),      // e.g. "invoice.created.v1"
  occurredAt: z.string().datetime(),
  traceId: z.string().min(8),
  actorId: z.string().uuid().optional(),
  payload: z.record(z.any()),
});

3.2 Webhook Endpoint
export const WebhookEndpoint = z.object({
  tenantId: z.string().uuid(),
  endpointId: z.string().uuid(),
  url: z.string().url(),
  subscribedTypes: z.array(z.string().min(1).max(160)).min(1),
  signingSecretAlias: z.string().min(3).max(140), // via secrets lifecycle
  isEnabled: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

3.3 Delivery Record
export const DeliveryStatus = z.union([
  z.literal("PENDING"),
  z.literal("DELIVERED"),
  z.literal("FAILED"),
  z.literal("DLQ"),
]);

export const WebhookDelivery = z.object({
  deliveryId: z.string().uuid(),
  tenantId: z.string().uuid(),
  endpointId: z.string().uuid(),
  eventId: z.string().uuid(),
  status: DeliveryStatus,
  attempts: z.number().int(),
  lastStatusCode: z.number().int().optional(),
  traceId: z.string().min(8),
  nextAttemptAt: z.string().datetime().optional(),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_outbox_event

event_id uuid pk

tenant_id uuid not null

stream_key text not null

type text not null

occurred_at timestamptz not null

trace_id text not null

actor_id uuid null

payload_jsonb jsonb not null

status text not null (PENDING|PUBLISHED)

created_at timestamptz not null

Index:

(tenant_id, stream_key, occurred_at)

(status, created_at)

4.2 kernel_webhook_endpoint

tenant_id uuid not null

endpoint_id uuid pk

url text not null

subscribed_types text[] not null

signing_secret_alias text not null

is_enabled boolean not null

created_at timestamptz not null

4.3 kernel_webhook_delivery

delivery_id uuid pk

tenant_id uuid not null

endpoint_id uuid not null

event_id uuid not null

status text not null

attempts int not null

last_status_code int null

trace_id text not null

next_attempt_at timestamptz null

last_error_ref text null

created_at timestamptz not null

Unique:

(endpoint_id, event_id) (at-most-once delivery record per endpoint)

5) Supporting: Delivery Algorithm (Worker)

Scan deliveries PENDING and due

Load event envelope

Apply privacy redaction if endpoint is external (K-B1)

Compute signature using secrets (K-V1):

signature header includes eventId, timestamp

Send POST

Record outcome:

success -> DELIVERED

fail -> retry with backoff

exceed -> DLQ

6) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

domains calling external webhooks directly (bypasses outbox)

emitting events without traceId

storing secrets inside webhook endpoint records

webhooks sending raw PII without policy allow-list

Required:

eventId always present for idempotency

DLQ supports replay with audit trail

7) Evidence (EVI027 — Outbox/Webhooks Certified)
Acceptance Criteria

transactional outbox works

delivery retries with backoff

DLQ and replay work

traceId propagates end-to-end

payload redaction is applied if required

Paste Blocks

[A] Transaction commit creates outbox row

[B] Rollback creates no outbox row

[C] Delivery retry proof and eventual success

[D] DLQ proof and replay success

[E] Delivery audit includes traceId and status codes

[F] Redaction proof for external endpoints

End of KER-310