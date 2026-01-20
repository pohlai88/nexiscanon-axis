
---

# ✅ 2) `KER220-SCHEDULER-HEARTBEAT-K-M5.md`

```md
# KER-220 — Scheduler / Heartbeat (K-M5)
**Status:** Ratification-Ready  
**Layer:** Kernel (Operations Plane)  
**Why this exists:** Reliable time-based execution for ERP workloads  
**Primary consumers:** TTL cleanup, reporting, batch submissions, sync connectors  
**Canon anchor:** CAN003 observability stitched + Zod payload validation :contentReference[oaicite:4]{index=4}

---

## 0) Canonical Purpose

ERP workloads require scheduled execution:
- nightly posting validation
- TTL cleanup (evidence expiry, reservations reclaim)
- compliance submission batches
- report generation
- connector sync and retries

Kernel Scheduler must guarantee:
- distributed execution (multi-node safe)
- at-least-once semantics
- deterministic locking
- auditability of job definitions and runs
- circuit-breaker protection

---

## 1) Boundary Rules

### Kernel MUST own
- schedule definition registry (from manifests/config)
- job claiming + locking
- execution lifecycle and retries
- fairness per tenant
- audit of job runs + outcomes

### Kernel MUST NOT own
- business logic of the job
- “what the report means”
- “how invoices are posted”

Kernel runs handlers; domain defines handler logic.

---

## 2) Canonical Guarantees

### 2.1 Execution Semantics
- **At least once** execution is guaranteed
- Exactly-once is not required, but idempotent handlers are recommended
- Duplicate runs must be prevented via locks

### 2.2 Multi-node Locking
- Only one worker may execute a job instance per schedule tick
- If worker dies mid-run, job must become claimable again after timeout

### 2.3 Fairness
- Tenants must not starve each other
- Scheduler must enforce per-tenant concurrency caps

---

## 3) Canonical Interfaces (Zod SSOT)

### 3.1 Job Envelope
```ts
import { z } from "zod";

export const JobSchedule = z.union([
  z.object({ type: z.literal("cron"), cron: z.string().min(3).max(120) }),
  z.object({ type: z.literal("interval"), seconds: z.number().int().min(1) }),
]);

export const JobEnvelope = z.object({
  jobId: z.string().min(3).max(120),
  tenantId: z.string().uuid(),
  schedule: JobSchedule,
  handlerId: z.string().min(3).max(120),
  lockKey: z.string().min(3).max(200),
  maxAttempts: z.number().int().min(1).max(50).default(5),
  timeoutSeconds: z.number().int().min(1).max(60 * 60).default(300),
  fairnessClass: z.string().min(1).max(80).default("default"),
  isEnabled: z.boolean().default(true),
});

3.2 Job Run Audit

export const JobRunStatus = z.union([
  z.literal("CLAIMED"),
  z.literal("RUNNING"),
  z.literal("SUCCESS"),
  z.literal("FAILED"),
  z.literal("RETRYING"),
  z.literal("CIRCUIT_OPEN"),
]);

export const JobRunAudit = z.object({
  runId: z.string().uuid(),
  jobId: z.string(),
  tenantId: z.string().uuid(),
  status: JobRunStatus,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  attempts: z.number().int().min(0),
  traceId: z.string().min(8),
  lastErrorRef: z.string().optional(),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_job_definition

job_id text pk

tenant_id uuid not null

schedule_jsonb not null

handler_id text not null

lock_key text not null

max_attempts int not null

timeout_seconds int not null

fairness_class text not null

is_enabled boolean not null

created_at timestamptz not null

updated_at timestamptz not null

4.2 kernel_job_run

run_id uuid pk

job_id text not null

tenant_id uuid not null

status text not null

attempts int not null

started_at timestamptz not null

ended_at timestamptz null

trace_id text not null

last_error_ref text null

Index:

(tenant_id, status)

(job_id, started_at desc)

4.3 kernel_job_lock

Option A: use Postgres advisory locks (no table needed)
Option B: explicit lock table:

lock_key text pk

tenant_id uuid not null

locked_by text not null

locked_until timestamptz not null

5) Supporting: Circuit Breaker Rules

If a job fails repeatedly:

open circuit for jobId

pause execution for cooldown

emit audit + alert

This prevents scheduler collapse.

6) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

cron jobs outside kernel scheduler

jobs without audit records

jobs without tenant attribution

job handlers skipping Zod payload validation 

CAN003-ARCHITECTURE-SPEC-v3

7) Evidence (EVI042 — Scheduler Certified)
Acceptance Criteria

multi-node locking works

at-least-once retry works

circuit breaker prevents runaway failures

audit logs include traceId and outcomes

Paste Blocks

[A] Register job from manifest

[B] Multi-node lock proof (only one executes)

[C] Crash mid-run → retry occurs

[D] Circuit breaker opens after repeated failure

[E] Job run audit trail includes traceId

End of KER220