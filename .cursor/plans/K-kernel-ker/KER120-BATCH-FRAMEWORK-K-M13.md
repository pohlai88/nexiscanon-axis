
---

# ✅ 3) `KER120-BATCH-FRAMEWORK-K-M13.md`

```md
# KER-120 — Batch & Bulk Operation Framework (K-M13)
**Status:** Ratification-Ready  
**Layer:** Kernel (Operations + Integrity Plane)  
**Why this exists:** Prevent bulk corruption + enable compliance submissions safely  
**Primary consumers:** Domain ERP (imports, GST/SST batches, e-invoice submissions, mass posting)  
**Canon anchor:** CAN003 kernel envelope discipline + trace correlation :contentReference[oaicite:4]{index=4}

---

## 0) Canonical Purpose

Bulk operations are the fastest way to corrupt ERP data.

This Kernel framework exists to guarantee:
- chunked execution
- resumability
- idempotency per item
- progress visibility
- exportable results
- quota/fairness compliance

Scheduler handles *time*.
Batch framework handles *data execution correctness*.

---

## 1) Boundary Rules

### Kernel MUST own
- Batch lifecycle + state machine
- Chunking + checkpointing
- Item-level idempotency + retry policy
- Progress tracking + results bundle
- Audit for every batch and item execution

### Kernel MUST NOT own
- “GST rules”
- “posting rules”
- “invoice rules”
- domain-specific side effects logic

Kernel only runs domain-provided “operation handler” under strict controls.

---

## 2) Canonical Batch Lifecycle

States:
- `CREATED`
- `RUNNING`
- `PAUSED`
- `FAILED`
- `COMPLETED`
- `CANCELLED`

Transitions are kernel-enforced.

---

## 3) Canonical Interfaces (Zod SSOT)

### 3.1 BatchOperation schema
```ts
import { z } from "zod";

export const BatchStatus = z.union([
  z.literal("CREATED"),
  z.literal("RUNNING"),
  z.literal("PAUSED"),
  z.literal("FAILED"),
  z.literal("COMPLETED"),
  z.literal("CANCELLED"),
]);

export const BatchOperation = z.object({
  batchId: z.string().uuid(),
  tenantId: z.string().uuid(),
  operationType: z.string().min(3).max(120),
  itemCount: z.number().int().min(0),
  status: BatchStatus,
  progress: z.object({
    completed: z.number().int().min(0),
    failed: z.number().int().min(0),
    total: z.number().int().min(0),
  }),
  resultsRef: z.string().optional(),
  createdAt: z.string().datetime(),
});

3.2 CreateBatch API

export const CreateBatchInput = z.object({
  tenantId: z.string().uuid(),
  operationType: z.string().min(3).max(120),
  // items are stored by reference to avoid huge payloads
  itemsRef: z.string().min(1),
  options: z.object({
    chunkSize: z.number().int().min(1).max(1000).default(100),
    maxAttempts: z.number().int().min(1).max(20).default(3),
  }).default({}),
});

export const CreateBatchOutput = z.object({
  batchId: z.string().uuid(),
});

3.3 Run/ResumeBatch API

export const RunBatchInput = z.object({
  tenantId: z.string().uuid(),
  batchId: z.string().uuid(),
});

export const RunBatchOutput = z.object({
  batchId: z.string().uuid(),
  status: BatchStatus,
});

4) Supporting: Storage Model
4.1 kernel_batch_operation

batch_id uuid pk

tenant_id uuid not null

operation_type text not null

items_ref text not null

chunk_size int not null

max_attempts int not null

status text not null

completed_count int not null

failed_count int not null

total_count int not null

results_ref text null

created_at timestamptz not null

updated_at timestamptz not null

Index:

(tenant_id, status)

4.2 kernel_batch_item

batch_id uuid not null

item_key text not null (stable id for idempotency)

status text not null (PENDING|RUNNING|SUCCESS|FAILED)

attempts int not null

last_error_ref text null

result_ref text null

updated_at timestamptz not null

Unique:

(batch_id, item_key)

5) Supporting: Execution Rules
5.1 Chunking

Kernel reads N items per chunk:

marks them RUNNING

executes handler

writes results

updates checkpoint

5.2 Resume

Resume MUST:

skip SUCCESS items

retry FAILED items only if attempts < maxAttempts

continue from checkpoint

5.3 Idempotency

Two layers:

batchId idempotency: rerun does not restart completed items

itemKey idempotency: item is processed once successfully

5.4 Fairness / Quotas

Batch execution MUST respect:

tenant quotas (Traffic Governor)

circuit breaker policy for downstream dependencies

6) Supporting: Result Bundle Contract

Kernel produces a results bundle:

summary counts

per-item status

error references

exportable artifact ref (resultsRef)

This is required for compliance submissions and regulator exports.

7) Evidence (EVI059 — Batch Framework Certified)
Acceptance Criteria

resume works without double-apply

progress is accurate

results bundle is exportable

quota fairness holds

Paste Blocks
[A] Create batch + chunk plan

Show batch created with N items and chunkSize.

[B] Failure mid-run + resume

Induce failure at item K, resume continues from checkpoint.

[C] Idempotent rerun

Run same batch twice → no duplicate side effects.

[D] Progress + results aggregation

Show resultsRef and per-item statuses.

[E] Quota fairness

Tenant A batch does not starve Tenant B requests/jobs.

End of KER-120