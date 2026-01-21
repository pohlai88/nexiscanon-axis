---

# ✅ 2) `KER270-CONTRACT-GOVERNANCE-K-R1.md`

```md
# KER-270 — API & Event Contract Governance (K-R1)
**Status:** Ratification-Ready  
**Layer:** Kernel (Compatibility Plane)  
**Why this exists:** Prevent breaking changes across domains + marketplace modules; enforce Zod SSOT  
**Primary consumers:** All API routes, events, webhooks, addons, external integrations  
**Canon anchor:** CAN003 Zod-first + kernel(spec) + standardized envelopes :contentReference[oaicite:2]{index=2}

---

## 0) Canonical Purpose

In ERP platforms, the fastest way to destroy trust is:

- changing response shapes silently
- breaking event payloads
- shifting field semantics without notice
- marketplace modules depending on unstable contracts

Kernel must provide governance to enforce:

- contract registry
- compatibility checks
- deprecation windows
- automated contract tests in CI
- optional OpenAPI artifact generation (derived only)

---

## 1) Boundary Rules

### Kernel MUST own

- contract registry for APIs/events
- compatibility gate (breaking change detection)
- versioning and deprecation policy
- CI harness for contract tests
- canonical serialization rules (Zod parse/encode)

### Kernel MUST NOT own

- business meaning of fields
- domain migration content
- UI documentation rendering

Kernel governs compatibility and stability only.

---

## 2) Canonical Rules

### 2.1 Zod is SSOT

- API input schema and output schema are authoritative.
- Event payload schema is authoritative.
- Any derived artifacts (OpenAPI, JSON schema) are derived from Zod.

### 2.2 Compatibility SemVer (Kernel-style)

Define contract change classes:

- Patch: add optional fields, relax validation safely
- Minor: add required fields with defaults OR new endpoints/events
- Major: remove/rename fields, change types, change semantics

### 2.3 Deprecation Windows

Breaking changes require:

- deprecation metadata (since, sunsetAt)
- runtime warnings (optional)
- migration notes for integrators

### 2.4 Compatibility Gate

CI must fail when:

- breaking change without major bump
- checksum mismatch without version bump
- event contract changes without explicit migration note

---

## 3) Canonical Interfaces (Zod SSOT)

```ts
import { z } from "zod";

export const ContractKind = z.union([
  z.literal("http_route"),
  z.literal("event"),
  z.literal("webhook"),
]);

export const ContractRecord = z.object({
  contractId: z.string().min(3).max(160),  // "api.request.create.v1"
  kind: ContractKind,
  version: z.string().min(1).max(30),      // "v1", "v2"
  checksum: z.string().min(16),
  ownerModule: z.string().min(3).max(120),
  createdAt: z.string().datetime(),
  deprecation: z.object({
    isDeprecated: z.boolean().default(false),
    since: z.string().datetime().optional(),
    sunsetAt: z.string().datetime().optional(),
    note: z.string().max(500).optional(),
  }).default({ isDeprecated: false }),
});

Change Classification
export const ContractChangeType = z.union([
  z.literal("compatible"),
  z.literal("minor_additive"),
  z.literal("breaking"),
]);

export const ContractDiffResult = z.object({
  contractId: z.string(),
  fromChecksum: z.string(),
  toChecksum: z.string(),
  changeType: ContractChangeType,
  summary: z.array(z.string()).default([]),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_contract_registry

contract_id text not null

kind text not null

version text not null

checksum text not null

owner_module text not null

deprecation_jsonb jsonb not null

created_at timestamptz not null

Unique:

(contract_id, version)

4.2 kernel_contract_change_audit

change_id uuid pk

contract_id text not null

from_checksum text not null

to_checksum text not null

change_type text not null

actor_id uuid null

trace_id text not null

created_at timestamptz not null

5) Supporting: Compatibility Gate Algorithm (CI)

Load previous “released” contract registry snapshot

Generate new checksums from current Zod schemas

Diff schemas:

additions optional => compatible/minor

removals/type changes => breaking

Verify version bump aligns with change class

Enforce deprecation rules for breaking changes:

must declare sunset window

Fail CI if violations exist

6) Evidence (EVI046 — Contract Governance Certified)
Acceptance Criteria

registry exists

compatible change passes without major

breaking change fails without major + deprecation

deprecation windows enforced

Paste Blocks

[A] Register contract v1 with checksum

[B] Add optional field -> gate passes (minor/compatible)

[C] Remove field -> gate fails (breaking)

[D] Major bump + deprecation metadata -> gate passes

[E] Audit record shows contract diffs with traceId

End of KER-270
```
