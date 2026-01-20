
---

# ✅ 3) `KER-340-INTELLIGENCE-GATEWAY-K-I1.md`

```md
# KER-340 — Intelligence Gateway / LLM Proxy (K-I1)
**Status:** Ratification-Ready  
**Layer:** Kernel (Intelligence Plane)  
**Why this exists:** Prevent PII exfiltration, enforce budgets, centralize model access  
**Primary consumers:** Domain ERP (invoice insights, anomaly detection, summarization), search assistants, operator tools  
**Canon anchor:** CAN003 privacy boundary discipline + trace/audit linking :contentReference[oaicite:3]{index=3}

---

## 0) Canonical Purpose (Non-Negotiable)

By 2025 standards, domains will inevitably need “AI” features.
The dangerous failure mode is domain modules calling vendors directly and sending:
- names
- national IDs
- addresses
- bank details
- employee records
…outside allowed jurisdictions.

Kernel must provide an **AI Gateway** that:
- enforces privacy redaction before outbound prompts
- enforces token budgets and rate limits per tenant
- keeps vendor keys and routing centralized
- audits every call without persisting raw sensitive content

---

## 1) Boundary Rules

### Kernel MUST own
- model allow-list and routing
- privacy redaction step (via Privacy Engine)
- budget enforcement (token caps, cost caps)
- audit of requests and outputs (safe metadata)
- tenancy and trace propagation

### Kernel MUST NOT own
- “accounting decisions”
- “approval decisions”
- business logic or ERP correctness
- storing raw prompts containing PII (unless explicitly configured with strict retention)

Kernel enforces safe access to AI only.

---

## 2) Canonical Guarantees

### 2.1 PII Redaction is mandatory
Outbound prompt must be redacted based on:
- tenant privacy policy
- data classification tags (PII/Sensitive/Financial)

### 2.2 Budgets are mandatory
Each tenant has:
- per-day token budgets
- per-request caps
- optional spend caps

Exceeding caps returns a deterministic “budget exceeded” error envelope.

### 2.3 Residency / Provider controls
Tenants may be restricted to:
- specific providers
- specific regions
- local models only

### 2.4 Audit without sensitive storage
Kernel stores:
- model used
- token usage
- purpose
- traceId
- redaction summary counts
- hashes of prompts (optional)
But does not store raw sensitive prompt by default.

---

## 3) Canonical Interfaces (Zod SSOT)

```ts
import { z } from "zod";

export const AIProvider = z.union([
  z.literal("openai"),
  z.literal("anthropic"),
  z.literal("local"),
]);

export const AIPurpose = z.union([
  z.literal("summarize"),
  z.literal("classify"),
  z.literal("extract"),
  z.literal("anomaly_detect"),
  z.literal("assist"),
]);

export const AIRequest = z.object({
  tenantId: z.string().uuid(),
  provider: AIProvider.optional(),
  model: z.string().min(1).max(120),
  purpose: AIPurpose,
  // domains provide text OR contextRefs (preferred)
  inputText: z.string().max(50_000).optional(),
  contextRefs: z.array(z.object({
    type: z.string().min(1).max(80),
    id: z.string().uuid(),
  })).default([]),
  budget: z.object({
    maxInputTokens: z.number().int().min(1).max(200_000).default(8000),
    maxOutputTokens: z.number().int().min(1).max(50_000).default(2000),
  }).default({}),
});

export const AIResponse = z.object({
  outputText: z.string(),
  usage: z.object({
    inputTokens: z.number().int(),
    outputTokens: z.number().int(),
    totalTokens: z.number().int(),
  }),
  redaction: z.object({
    redactedFields: z.number().int().min(0),
    redactedTokensEstimate: z.number().int().min(0),
  }),
  traceId: z.string().min(8),
});

4) Supporting: Redaction Pipeline

Order:

Resolve contextRefs (kernel fetches objects, not domain)

Classify fields by privacy taxonomy

Apply redaction rules:

mask names/IDs

truncate sensitive details

drop disallowed fields

Construct safe prompt

Enforce budgets

Call provider adapter

Audit metadata

5) Supporting: Storage Model (Postgres)
5.1 kernel_ai_budget

tenant_id uuid not null

daily_token_limit int not null

daily_token_used int not null

updated_at timestamptz not null

5.2 kernel_ai_call_audit

call_id uuid pk

tenant_id uuid not null

model text not null

purpose text not null

provider text not null

input_hash text null

output_hash text null

input_tokens int not null

output_tokens int not null

redacted_fields int not null

trace_id text not null

actor_id uuid null

created_at timestamptz not null

result text not null (SUCCESS|FAIL)

error_ref text null

6) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

domain modules calling external AI providers directly

storing raw prompts with PII in logs

allowing AI gateway to bypass privacy engine

vendor keys stored in domain env files

Required:

allow-list of models per tenant

explicit purpose per request (auditable)

7) Evidence (EVI057 — Intelligence Gateway Certified)
Acceptance Criteria

redaction happens before outbound call

budgets enforced

tenant restrictions enforced

audits contain traceId and usage

raw sensitive prompt not stored by default

Paste Blocks

[A] Request with PII -> outbound prompt redacted proof

[B] Budget exceed -> deterministic rejection

[C] Provider restriction -> blocked when disallowed

[D] Audit shows tokens + redaction counts + traceId

[E] Confirm raw prompt not persisted (only hashes/metadata)

End of KER-340


