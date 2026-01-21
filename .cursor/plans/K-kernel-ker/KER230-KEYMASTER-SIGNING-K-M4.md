---

# ✅ 2) `KER-230-KEYMASTER-SIGNING-K-M4.md`

```md
# KER-230 — Keymaster & Signing Primitive (K-M4)
**Status:** Ratification-Ready  
**Layer:** Kernel (Trust Plane)  
**Why this exists:** Non-repudiation, LHDN-grade signing needs, prevent private key exposure to domains  
**Primary consumers:** E-invoice modules, webhook signing, audit sealing, regulator bundles  
**Canon anchor:** CAN003 strict boundaries + audit linkage :contentReference[oaicite:3]{index=3}

---

## 0) Canonical Purpose (Non-Negotiable)

Domain modules MUST NEVER access raw private keys.

The kernel provides a **Keymaster**:

- stores tenant-scoped keys securely (encrypted at rest)
- exposes a `Sign(payloadDigest, keyAlias)` primitive
- rotates keys and supports verify-only old keys
- audits every key use

This is required for:

- LHDN / statutory e-invoice signing
- audit seal signing
- webhook signature generation

---

## 1) Boundary Rules

### Kernel MUST own

- storage of private keys (encrypted, tenant scoped)
- signing operations
- key rotation lifecycle hooks
- auditing of key usage with traceId
- verification helper (optional)

### Kernel MUST NOT own

- domain document generation logic
- invoice XML business semantics
- tax/business correctness

Kernel signs digests; domains provide payloads/digests.

---

## 2) Canonical Guarantees

### 2.1 No raw key export

- API must never return private key material.
- Only metadata may be returned.

### 2.2 Tenant scoping

- Key aliases are tenant-scoped.
- No cross-tenant signing is allowed.

### 2.3 Rotation discipline

- Rotation creates a new key version.
- Old versions may remain verify-only by policy.
- All versions are auditable.

### 2.4 Audit on every use

Every sign attempt must record:

- tenantId
- keyAlias
- keyVersion
- actorId (if present)
- traceId
- purpose + objectRef

---

## 3) Canonical Interfaces (Zod SSOT)

```ts
import { z } from "zod";

export const KeyPurpose = z.union([
  z.literal("einvoice_signing"),
  z.literal("webhook_signing"),
  z.literal("audit_sealing"),
  z.literal("regulator_bundle_signing"),
]);

export const KeyAlgorithm = z.union([
  z.literal("RSA_SHA256"),
  z.literal("ECDSA_SHA256"),
]);

export const KeyScope = z.object({
  tenantId: z.string().uuid(),
  keyAlias: z.string().min(3).max(120), // e.g. "lhdn.primary"
  purpose: KeyPurpose,
  algorithm: KeyAlgorithm,
  isActive: z.boolean(),
  currentVersion: z.number().int().min(1),
  createdAt: z.string().datetime(),
});

Create / Rotate / Sign

export const CreateKeyInput = z.object({
  tenantId: z.string().uuid(),
  keyAlias: z.string().min(3).max(120),
  purpose: KeyPurpose,
  algorithm: KeyAlgorithm,
});

export const CreateKeyOutput = z.object({
  keyAlias: z.string(),
  version: z.number().int(),
});

export const RotateKeyInput = z.object({
  tenantId: z.string().uuid(),
  keyAlias: z.string().min(3).max(120),
  reason: z.string().min(3).max(500),
});

export const RotateKeyOutput = z.object({
  keyAlias: z.string(),
  newVersion: z.number().int(),
});

export const SignInput = z.object({
  tenantId: z.string().uuid(),
  keyAlias: z.string().min(3).max(120),
  payloadDigest: z.string().min(16), // hex/base64 digest
  purpose: KeyPurpose,
  objectRef: z.object({
    type: z.string().min(1).max(80),
    id: z.string().uuid().optional(),
  }).optional(),
});

export const SignOutput = z.object({
  signature: z.string().min(16),
  keyAlias: z.string(),
  keyVersion: z.number().int(),
  signedAt: z.string().datetime(),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_key_scope

tenant_id uuid not null

key_alias text not null

purpose text not null

algorithm text not null

is_active boolean not null

current_version int not null

created_at timestamptz not null

Unique:

(tenant_id, key_alias)

4.2 kernel_key_material

Stores encrypted private key material (never returned).

tenant_id uuid not null

key_alias text not null

version int not null

encrypted_private_key bytea not null

public_key_pem text not null

status text not null (active|verify_only|revoked)

created_at timestamptz not null

Unique:

(tenant_id, key_alias, version)

4.3 kernel_key_usage_audit

usage_id uuid pk

tenant_id uuid not null

key_alias text not null

version int not null

purpose text not null

actor_id uuid null

trace_id text not null

object_type text null

object_id uuid null

result text not null (SUCCESS|FAIL)

created_at timestamptz not null

5) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

domain module containing private keys in env vars

domain modules calling external signing services directly

returning public/private key material in API responses

signing raw payload without hashing/canonicalization policy

Recommended:

always sign digests (canonicalized payload digest)

bind signature usage to objectRef when available

6) Evidence (EVI041 — Keymaster Certified)
Acceptance Criteria

keys created without exposing secrets

sign works and audits every use

rotation updates version and preserve verify-only policy

tenant scoping prevents cross-tenant usage

Paste Blocks

[A] Create key alias → metadata only

[B] Sign digest → signature + version returned

[C] Rotate key → new version becomes active

[D] Old key verify-only policy holds

[E] Audit entries show traceId + objectRef

End of KER-230
```
