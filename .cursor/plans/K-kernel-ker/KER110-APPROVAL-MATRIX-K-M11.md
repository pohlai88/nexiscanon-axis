
---

# ✅ 2) `KER110-APPROVAL-MATRIX-K-M11.md`

```md
# KER-110 — Approval Matrix & Delegation (K-M11)
**Status:** Ratification-Ready  
**Layer:** Kernel (Workflow + Governance Plane)  
**Why this exists:** Prevent bypass approvals + unsafe delegation + rule drift  
**Primary consumers:** Domain ERP (Purchasing, Payments, Posting, HR approvals)  
**Canon anchor:** CAN003 kernel pipeline + audit discipline :contentReference[oaicite:3]{index=3}

---

## 0) Canonical Purpose

The kernel must provide a **durable approval substrate** that:
- evaluates approvers deterministically
- supports delegation safely (absence coverage)
- escalates via SLA timers
- logs overrides/break-glass actions

This is not “invoice logic”.
This is **approval integrity infrastructure**.

---

## 1) Boundary Rules

### Kernel MUST own
- Approval rule evaluation engine
- Delegation registry + resolution
- Escalation timers + task generation hooks
- Override logging and enforcement gates
- Deterministic output (hashable)

### Kernel MUST NOT own
- “amount thresholds” as business rules hardcoded
- “invoice semantics”
- “department logic”
- any domain-specific facts computation

Kernel only evaluates facts provided by domain.

---

## 2) Core Concepts

### 2.1 Facts In, Approvers Out
Domain sends:

- `facts: Record<string, unknown>`
Kernel returns:

- `approverSet: { users[], roles[], groups[] }`
- `rationaleTrace: { ruleIds[], matchedConditionsHash }`

### 2.2 Delegation
Delegation must be explicit:
- who delegates to whom
- time window
- scope (what approvals)
- reason
- audit trail

### 2.3 Escalation
Escalation triggers when:
- dueAt passed
- no decision taken
Kernel creates:
- escalation task event
- audit entry

---

## 3) Canonical Interfaces (Zod SSOT)

### 3.1 Condition DSL (Minimal)
Kernel supports a minimal predicate language:

```ts
import { z } from "zod";

export const ConditionOp = z.union([
  z.literal("eq"),
  z.literal("neq"),
  z.literal("gt"),
  z.literal("gte"),
  z.literal("lt"),
  z.literal("lte"),
  z.literal("in"),
  z.literal("contains"),
  z.literal("exists"),
]);

export const Condition = z.object({
  fact: z.string().min(1),     // e.g. "amount", "currency", "departmentId"
  op: ConditionOp,
  value: z.any().optional(),
});

//KER110.3.2-APPROVAL-RULE.ts


export const ApproverRef = z.union([
  z.object({ type: z.literal("user"), id: z.string().uuid() }),
  z.object({ type: z.literal("role"), id: z.string().min(1).max(80) }),
  z.object({ type: z.literal("group"), id: z.string().min(1).max(80) }),
]);

export const ApprovalRule = z.object({
  tenantId: z.string().uuid(),
  scopeKey: z.string().min(3).max(120), // e.g. "posting.approval"
  ruleId: z.string().min(3).max(120),
  version: z.number().int().min(1),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  conditions: z.array(Condition).default([]),
  approvers: z.array(ApproverRef).min(1),
  escalationPath: z.array(ApproverRef).default([]),
  slaMinutes: z.number().int().min(1).max(60 * 24 * 30).optional(),
});

// KER110.3.3-DELEGATION-RULE.ts


export const Delegation = z.object({
    tenantId: z.string().uuid(),
    scopeKey: z.string().min(3).max(120),
    delegatorUserId: z.string().uuid(),
    delegateUserId: z.string().uuid(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    reason: z.string().min(3).max(500),
  });
  
  // KER110.3.4-EVALUATE-APPROVAL-API.ts

export const EvaluateApprovalInput = z.object({
  tenantId: z.string().uuid(),
  scopeKey: z.string().min(3).max(120),
  facts: z.record(z.any()),
  atTime: z.string().datetime().optional(),
});

export const EvaluateApprovalOutput = z.object({
  approvers: z.array(ApproverRef),
  matchedRuleIds: z.array(z.string()),
  resolutionHash: z.string().min(8), // stable hash for determinism proof
});



4) Supporting: Storage Model
4.1 kernel_approval_rule

tenant_id

scope_key

rule_id

version

conditions_jsonb

approvers_jsonb

escalation_jsonb

sla_minutes

effective_from

effective_to

created_at

Unique:

(tenant_id, scope_key, rule_id, version)

4.2 kernel_delegation

tenant_id

scope_key

delegator_user_id

delegate_user_id

starts_at

ends_at

reason

created_at

4.3 kernel_approval_resolution_audit

Records every evaluation and decision:

tenant_id

scope_key

facts_hash

matched_rule_ids

approvers_hash

resolution_hash

trace_id

actor_id

created_at

5) Supporting: Determinism Rules

Kernel MUST guarantee:

same facts + atTime + rule versions => same resolutionHash

This prevents:

“random approver drift”

non-reproducible approvals

6) Supporting: Override / Break-Glass

Kernel supports an override action:

requires elevated permission

requires reason

logs as override (never normal approval)

Fields logged:

override_by

override_reason

on_behalf_of?

traceId

7) Evidence (EVI058 — Approval Matrix Certified)
Acceptance Criteria

Rule evaluation works

Delegation works safely

Escalation triggers deterministically

Override is logged and permissioned

Deterministic hash is stable

Paste Blocks
[A] Rule evaluation proof

Input facts -> output approver set + matched rule IDs.

[B] Delegation chain proof

Approver absent -> delegate selected, chain logged.

[C] Escalation proof

SLA missed -> escalation path invoked, task event logged.

[D] Override proof

Break-glass approval requires reason and shows override audit record.

[E] Determinism proof

Same facts/time -> same resolutionHash.

End of KER110