
---

# ✅ 3) `KER250-AUDIT-IMMUTABILITY-WORM-K-W1.md`

```md
# KER-250 — Audit Immutability & WORM Logs (K-W1)
**Status:** Ratification-Ready  
**Layer:** Kernel (Trust + Forensics Plane)  
**Why this exists:** Legal defensibility, regulator readiness, tamper evidence  
**Primary consumers:** All kernel primitives + all domain modules  
**Canon anchor:** CAN003 single envelope + trace stitched observability :contentReference[oaicite:6]{index=6}

---

## 0) Canonical Purpose

Audit logs must be:
- append-only
- tamper-evident
- verifiable independently
- exportable as regulator bundles
- retention-enforced

Without this, admins can edit the DB and erase wrongdoing.

This is Kernel-owned because audit integrity is a platform guarantee.

---

## 1) Boundary Rules

### Kernel MUST own
- append-only audit write path
- hash chaining / sealing
- verification tooling
- retention + legal hold compatibility
- exportable audit bundle format

### Kernel MUST NOT own
- business meaning of events
- report rendering
- domain-specific log formatting

Kernel stores canonical event envelopes.

---

## 2) Canonical Guarantees

### 2.1 Append-only semantics
- No update/delete of audit events through normal code paths
- Only additional events can be appended

### 2.2 Tamper evidence
Each event must be chained:
- `eventHash = H(prevHash + canonicalJson(event))`

Or batched:
- Merkle root per interval, signed by Keymaster

### 2.3 Verification
Kernel must provide:
- `VerifyAudit(from, to)` returns pass/fail and mismatch index

### 2.4 Export bundles
Kernel must export:
- event set
- hashes
- seals
- verification manifest

---

## 3) Canonical Audit Event Envelope (Zod SSOT)

```ts
import { z } from "zod";

export const AuditEvent = z.object({
  eventId: z.string().uuid(),
  tenantId: z.string().uuid(),
  time: z.string().datetime(),
  actorId: z.string().uuid().optional(),
  routeId: z.string().min(1).max(120).optional(),
  action: z.string().min(1).max(120),
  objectRef: z.object({
    type: z.string().min(1).max(80),
    id: z.string().uuid().optional(),
  }),
  result: z.union([z.literal("ALLOW"), z.literal("DENY"), z.literal("SUCCESS"), z.literal("FAIL")]),
  traceId: z.string().min(8),
  details: z.record(z.any()).default({}),
});

4) Supporting: Canonicalization Rules (Anti-Tamper)

Audit event JSON must be canonicalized before hashing:

stable key ordering

stable number formatting

no whitespace ambiguity

(Use JSON Canonicalization Scheme / JCS equivalent.)

5) Supporting: Storage Model (Postgres)
5.1 kernel_audit_event

event_id uuid pk

tenant_id uuid not null

time timestamptz not null

actor_id uuid null

action text not null

object_type text not null

object_id uuid null

result text not null

trace_id text not null

details_jsonb jsonb not null

prev_hash text not null

event_hash text not null

Index:

(tenant_id, time)

(trace_id)

5.2 kernel_audit_seal

Seals batches periodically:

seal_id uuid pk

tenant_id uuid not null

from_time timestamptz not null

to_time timestamptz not null

root_hash text not null

signature text not null

key_alias text not null

created_at timestamptz not null

6) Supporting: Threat Model & Drift Traps

Threats prevented:

DB edits to erase approvals

backdated event insertion

silent modification of audit entries

Drift traps:

logging only in application layer

“best effort” audit events

storing audit in plain logs without chaining

Forbidden:

updating kernel_audit_event rows

deleting audit events without legal hold process

7) Evidence (EVI048 — Audit Immutability Certified)
Acceptance Criteria

append-only works

hash chain verifies

tamper attempt is detected

export bundle is verifiable independently

Paste Blocks

[A] Append events → show hashes

[B] Seal batch → show root hash + signature

[C] Tamper attempt → verification fails

[D] Export bundle created

[E] Verify bundle success for intact data

End of KER-250