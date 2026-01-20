
---

# ✅ 3) `KER-300-EXTERNAL-AUDITOR-LINKS-K-B2.md`

```md
# KER-300 — External Auditor / Guest Links (K-B2)
**Status:** Ratification-Ready  
**Layer:** Kernel (Sharing + Trust Plane)  
**Why this exists:** Enable auditors/guests without accounts; prevent backdoors; ensure watermarking + traceable access  
**Primary consumers:** Audit sharing, regulator review, supplier/customer document review  
**Canon anchor:** CAN003 security boundaries + audit linkage :contentReference[oaicite:3]{index=3}

---

## 0) Canonical Purpose (Non-Negotiable)

Enterprise ERP needs a controlled way to share evidence and records with:
- external auditors
- regulators
- suppliers/customers

If you do this wrong, you create:
- permanent public links
- uncontrolled data leaks
- no audit trail of access

Kernel provides guest links that are:
- scoped
- time-bound
- revocable
- watermarked
- audited

---

## 1) Boundary Rules

### Kernel MUST own
- signed guest token issuance and verification
- scope enforcement (objectRefs + permissions)
- TTL enforcement + revocation
- watermark metadata enforcement
- access logging with traceId

### Kernel MUST NOT own
- “what auditors want to see”
- domain report packaging logic (beyond reference to objects)
- UI rendering

Kernel provides secure link access primitives only.

---

## 2) Canonical Guarantees

### 2.1 Scope
Guest links must define explicit scope:
- list of objects OR query scope keys
- allowed actions: view/download only (default)
- optional “comment” capability (future)

### 2.2 TTL
Every guest link must expire automatically.

### 2.3 Revocation
Links are revocable at any time.

### 2.4 Watermarking required
If content is displayed externally:
- watermark must be applied (at minimum overlay metadata + viewer label)
- include linkId + tenantId + timestamp in watermark metadata

### 2.5 Full access audit
Each guest access must log:
- linkId
- ip/user agent
- objectRef accessed
- traceId
- result status (allow/deny)

---

## 3) Canonical Interfaces (Zod SSOT)

```ts
import { z } from "zod";

export const GuestAction = z.union([
  z.literal("view"),
  z.literal("download"),
]);

export const GuestLinkScope = z.object({
  objects: z.array(z.object({
    type: z.string().min(1).max(80),
    id: z.string().uuid(),
  })).min(1),
  actions: z.array(GuestAction).default(["view"]),
});

export const CreateGuestLinkInput = z.object({
  tenantId: z.string().uuid(),
  scope: GuestLinkScope,
  expiresInMinutes: z.number().int().min(5).max(60 * 24 * 30),
  reason: z.string().min(3).max(500),
});

export const CreateGuestLinkOutput = z.object({
  linkId: z.string().uuid(),
  url: z.string().min(1), // returned link (signed token inside)
  expiresAt: z.string().datetime(),
});

Access Log
export const GuestAccessLog = z.object({
  accessId: z.string().uuid(),
  tenantId: z.string().uuid(),
  linkId: z.string().uuid(),
  objectType: z.string(),
  objectId: z.string().uuid(),
  ip: z.string().min(3).max(80),
  userAgent: z.string().max(300).optional(),
  traceId: z.string().min(8),
  result: z.union([z.literal("ALLOW"), z.literal("DENY")]),
  at: z.string().datetime(),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_guest_link

link_id uuid pk

tenant_id uuid not null

scope_jsonb jsonb not null

expires_at timestamptz not null

revoked_at timestamptz null

reason text not null

created_by uuid null

created_at timestamptz not null

4.2 kernel_guest_access_log

access_id uuid pk

tenant_id uuid not null

link_id uuid not null

object_type text not null

object_id uuid not null

ip text not null

user_agent text null

trace_id text not null

result text not null

created_at timestamptz not null

Index:

(tenant_id, link_id, created_at desc)

(trace_id)

5) Supporting: Token Strategy

Guest URLs contain a signed token:

includes linkId, tenantId, expiresAt

signed using Keymaster (K-M4) or webhook signing keys

token verification occurs at edge before any data access

6) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

permanent public links without TTL

links without scope objects

external rendering without watermark metadata

sharing by “disabling auth” on endpoints

Required:

guest access always writes audit + access log

guest access respects tenant boundary

7) Evidence (EVI028 — Guest Links Certified)
Acceptance Criteria

link issuance works with scope + TTL

access enforces scope

expiry denies access

revocation denies access

watermark metadata present

access logs include traceId and viewer metadata

Paste Blocks

[A] Create link returns expiresAt

[B] Access allowed for scoped objects only

[C] Access denied for non-scoped objects

[D] Expiry denial proof

[E] Revocation denial proof

[F] Access log shows ip + traceId + objectRef

End of KER-300