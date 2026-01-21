# KER-240 — Secrets & Certificate Lifecycle (K-V1)

**Status:** Ratification-Ready  
**Layer:** Kernel (Trust + Operations Plane)  
**Why this exists:** Prevent secret sprawl, enable rotation, support cert hygiene, keep domains keyless  
**Primary consumers:** Connectors, webhooks, integrations, outbound TLS/mTLS, signing workflows  
**Canon anchor:** CAN003 boundary discipline + audit linkage :contentReference[oaicite:1]{index=1}

---

## 0) Canonical Purpose (Non-Negotiable)

In SaaS ERPs, secrets inevitably proliferate:

- bank connectors
- tax portals / LHDN endpoints
- SMTP / SMS / WhatsApp gateways
- webhook signing secrets
- internal service credentials

If domains store secrets in env/config, you will get:

- leaks
- stale credentials
- no rotation
- no audit trail

Kernel must provide:

- tenant-scoped secret aliases (no plaintext access)
- versioned secrets + rotation
- certificate lifecycle hooks (issue/renew/expire)
- auditable secret “use” (not export)

---

## 1) Boundary Rules

### Kernel MUST own

- secret alias registry (tenant-scoped)
- secret versioning + rotation schedule
- retrieval policy: **capabilities only**, not plaintext
- certificate issuance/renewal metadata (provider-agnostic)
- audit of all secret/cert operations and usages

### Kernel MUST NOT own

- connector business logic
- third-party API semantics
- domain-level retry rules (beyond generic circuit breaking)

Kernel supplies secure storage and lifecycle primitives only.

---

## 2) Canonical Guarantees

### 2.1 No plaintext export

Kernel MUST NOT return raw secret values over normal API paths.
Only metadata may be returned.

### 2.2 Tenant scope

Secret alias ownership is tenant-scoped. No cross-tenant access.

### 2.3 Rotation

Secrets must support:

- multiple versions
- active version pointer
- scheduled rotation
- optional grace window for verification

### 2.4 Audit

Every operation must be auditable:

- create/update/rotate/revoke
- use attempts (success/fail)
- traceId linkage

---

## 3) Canonical Interfaces (Zod SSOT)

```ts
import { z } from "zod";

export const SecretKind = z.union([
  z.literal("api_key"),
  z.literal("oauth_client_secret"),
  z.literal("webhook_secret"),
  z.literal("password"),
  z.literal("certificate_private_key"),
]);

export const SecretUsePurpose = z.union([
  z.literal("connector_call"),
  z.literal("webhook_sign"),
  z.literal("mtls_client_auth"),
  z.literal("token_exchange"),
]);

export const SecretAlias = z.object({
  tenantId: z.string().uuid(),
  alias: z.string().min(3).max(140), // e.g. "connector.xero.client_secret"
  kind: SecretKind,
  isEnabled: z.boolean(),
  activeVersion: z.number().int().min(1),
  rotationPolicy: z.object({
    enabled: z.boolean().default(false),
    rotateEveryDays: z.number().int().min(1).max(3650).optional(),
    graceDays: z.number().int().min(0).max(365).optional(),
  }).default({ enabled: false }),
  createdAt: z.string().datetime(),
});

Create / Rotate / Use (capability)

export const CreateSecretAliasInput = z.object({
  tenantId: z.string().uuid(),
  alias: z.string().min(3).max(140),
  kind: SecretKind,
  initialValueRef: z.string().min(1), // value comes via secure operator channel, stored by reference
});

export const RotateSecretInput = z.object({
  tenantId: z.string().uuid(),
  alias: z.string().min(3).max(140),
  newValueRef: z.string().min(1),
  reason: z.string().min(3).max(500),
});

export const UseSecretInput = z.object({
  tenantId: z.string().uuid(),
  alias: z.string().min(3).max(140),
  purpose: SecretUsePurpose,
  // optional: tie usage to object
  objectRef: z.object({
    type: z.string().min(1).max(80),
    id: z.string().uuid().optional(),
  }).optional(),
});

export const UseSecretOutput = z.object({
  // capability token / handle that only kernel runtime can resolve
  capabilityRef: z.string().min(1),
  version: z.number().int(),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

Certificates (provider-agnostic lifecycle)

export const CertificateRecord = z.object({
  tenantId: z.string().uuid(),
  certAlias: z.string().min(3).max(140), // e.g. "mtls.lhdn.client"
  subject: z.string().min(1).max(300),
  issuer: z.string().min(1).max(300).optional(),
  notBefore: z.string().datetime(),
  notAfter: z.string().datetime(),
  status: z.union([z.literal("active"), z.literal("expired"), z.literal("revoked")]),
  rotationDueAt: z.string().datetime().optional(),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_secret_alias

tenant_id uuid not null

alias text not null

kind text not null

is_enabled boolean not null

active_version int not null

rotation_policy jsonb not null

created_at timestamptz not null

Unique:

(tenant_id, alias)

4.2 kernel_secret_version

tenant_id uuid not null

alias text not null

version int not null

encrypted_value bytea not null

status text not null (active|grace|revoked)

created_at timestamptz not null

Unique:

(tenant_id, alias, version)

4.3 kernel_secret_use_audit

use_id uuid pk

tenant_id uuid not null

alias text not null

version int not null

purpose text not null

actor_id uuid null

trace_id text not null

object_type text null

object_id uuid null

result text not null (SUCCESS|FAIL)

created_at timestamptz not null

4.4 kernel_certificate_record

tenant_id uuid not null

cert_alias text not null

subject text not null

issuer text null

not_before timestamptz not null

not_after timestamptz not null

status text not null

rotation_due_at timestamptz null

created_at timestamptz not null

Unique:

(tenant_id, cert_alias)

5) Supporting: Rotation Mechanics

Scheduler checks rotationDueAt / rotateEveryDays

Rotation produces new version, updates active pointer

Grace window optionally allows old version for verification only

All operations audited

6) Evidence (EVI047 — Secrets Lifecycle Certified)
Acceptance Criteria

secrets never returned plaintext

rotation produces new version

use returns capability only

audit contains traceId and purpose

Paste Blocks

[A] Create alias; show metadata only

[B] Use secret; returns capabilityRef; no plaintext

[C] Rotate secret; activeVersion increments

[D] Grace window behavior (if enabled)

[E] Audit events show use + rotation with traceId

End of KER-240
```
