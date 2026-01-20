# KER-290 — Privacy Engine (K-B1)
**Status:** Ratification-Ready  
**Layer:** Kernel (Trust + Compliance Plane)  
**Why this exists:** PDPA/GDPR compliance substrate; prevent accidental PII leakage; unify redaction/retention/export  
**Primary consumers:** AI Gateway, Search/OCR, Export bundles, Guest Links, Webhooks, Audit bundles  
**Canon anchor:** CAN003 strict boundaries + trace/audit linkage :contentReference[oaicite:1]{index=1}

---

## 0) Canonical Purpose (Non-Negotiable)

Privacy failures are enterprise-killers.

Kernel must provide a domain-agnostic privacy substrate that:
- classifies data (PII / Sensitive / Financial)
- enforces disclosure controls (redaction/masking)
- supports consent and purpose metadata
- provides retention + deletion hooks
- generates export packages safely

This is Kernel-owned because privacy must be **consistent** across all domains and integrations.

---

## 1) Boundary Rules

### Kernel MUST own
- data classification taxonomy + tags
- redaction policies and enforcement APIs
- purpose/consent records substrate
- retention policy registry + enforcement hooks
- privacy-aware export tooling (bundle rules)
- audit of privacy operations (traceId linked)

### Kernel MUST NOT own
- business meaning of fields
- domain-specific workflows (“HR onboarding”)
- domain-specific retention rules beyond manifest registration

Domains register classifications; kernel enforces.

---

## 2) Canonical Guarantees

### 2.1 Classification required for sensitive surfaces
Any surface that can disclose data externally MUST require classification:
- AI prompts
- guest links
- webhook payloads
- export bundles
- search indexing

### 2.2 Redaction is deterministic
Given the same policy + data + viewer scope → same redacted output.

### 2.3 Purpose limitations
Disclosures must declare purpose:
- `audit`
- `support`
- `compliance_export`
- `ai_processing`
- `integration_sync`

Kernel logs disclosure purpose.

### 2.4 Tenant-scoped privacy policies
Privacy rules are tenant-scoped by default; a jurisdiction pack may override minimums.

---

## 3) Canonical Interfaces (Zod SSOT)

```ts
import { z } from "zod";

export const DataClass = z.union([
  z.literal("public"),
  z.literal("internal"),
  z.literal("pii"),
  z.literal("sensitive"),
  z.literal("financial"),
]);

export const DisclosurePurpose = z.union([
  z.literal("audit"),
  z.literal("support"),
  z.literal("compliance_export"),
  z.literal("ai_processing"),
  z.literal("integration_sync"),
]);

export const PrivacyPolicy = z.object({
  tenantId: z.string().uuid(),
  jurisdiction: z.string().min(2).max(80).default("MY"),
  rules: z.object({
    maskPIIByDefault: z.boolean().default(true),
    allowPIIToAI: z.boolean().default(false),
    allowPIIToWebhooks: z.boolean().default(false),
    guestLinkWatermarkRequired: z.boolean().default(true),
    defaultRetentionDays: z.number().int().min(1).max(36500).default(2555), // ~7y
  }),
});

Field classification registry
export const FieldClassification = z.object({
  moduleId: z.string().min(3).max(120),
  objectType: z.string().min(1).max(80), // e.g. "invoice"
  fieldPath: z.string().min(1).max(200), // e.g. "customer.name"
  dataClass: DataClass,
});

Redact API
export const RedactInput = z.object({
  tenantId: z.string().uuid(),
  purpose: DisclosurePurpose,
  viewer: z.object({
    actorId: z.string().uuid().optional(),
    role: z.string().min(1).max(80).optional(),
    isExternal: z.boolean().default(false),
  }),
  objectRef: z.object({
    type: z.string().min(1).max(80),
    id: z.string().uuid(),
  }).optional(),
  payload: z.record(z.any()),
});

export const RedactOutput = z.object({
  redactedPayload: z.record(z.any()),
  redactionSummary: z.object({
    fieldsRedacted: z.number().int().min(0),
    tokensRedactedEstimate: z.number().int().min(0),
  }),
});

Consent records (minimal substrate)
export const ConsentRecord = z.object({
  tenantId: z.string().uuid(),
  subjectId: z.string().uuid(), // person/customer/vendor/employee ref
  purpose: DisclosurePurpose,
  granted: z.boolean(),
  grantedAt: z.string().datetime().optional(),
  revokedAt: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_privacy_policy

tenant_id uuid pk

jurisdiction text not null

rules jsonb not null

updated_at timestamptz not null

4.2 kernel_field_classification

module_id text not null

object_type text not null

field_path text not null

data_class text not null

created_at timestamptz not null

Unique:

(module_id, object_type, field_path)

4.3 kernel_consent_record

tenant_id uuid not null

subject_id uuid not null

purpose text not null

granted boolean not null

granted_at timestamptz null

revoked_at timestamptz null

note text null

created_at timestamptz not null

4.4 kernel_privacy_disclosure_audit

disclosure_id uuid pk

tenant_id uuid not null

purpose text not null

actor_id uuid null

trace_id text not null

object_type text null

object_id uuid null

fields_redacted int not null

result text not null (SUCCESS|FAIL)

created_at timestamptz not null

5) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

AI gateway bypassing redaction

webhooks emitting raw PII without explicit allow flag

indexing OCR text that includes PII without policy

guest links exposing unredacted content by default

Required:

every external disclosure declares a purpose

every redaction writes a disclosure audit record

6) Evidence (EVI023 — Privacy Hooks Certified)
Acceptance Criteria

classifications apply to redaction deterministically

purpose is required and audited

external viewer receives masked payload

tenant policy changes affect enforcement

Paste Blocks

[A] Register classification and show policy

[B] Redact payload for external viewer -> fields masked

[C] Redact payload for internal role -> less masked (if allowed)

[D] Disclosure audit record contains traceId and summary

[E] Policy toggle changes behavior (e.g., allowPIIToAI=false blocks)

End of KER-290