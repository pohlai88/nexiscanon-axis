# EVI004 — Jobs/Queue Proof

**Goal:** Prove background jobs run with tenant context + observability correlation

**Status:** ✅ COMPLETE — 2026-01-20

---

## Overview

Horizontal capability to run background jobs with:

- Full tenant context (tenantId, actorId)
- Observability correlation (traceId, requestId)
- Domain addon integration
- Type-safe job payloads

**Technology:** Graphile Worker (PostgreSQL-based queue)

**Why Graphile Worker:**

- Native PostgreSQL (already have Neon)
- ACID guarantees (jobs in same DB as data)
- No additional infrastructure (Redis, RabbitMQ)
- Supports cron jobs
- Battle-tested in production

---

## Architecture

### Job Envelope (Type-Safe Wrapper)

Every job has a standard envelope:

```typescript
{
  tenantId: string;        // Tenant context (for RLS, logging)
  actorId?: string;        // Actor who triggered job
  traceId: string;         // Correlation with API request
  requestId?: string;      // Optional request correlation
  payload: TPayload;       // Job-specific data
}
```

### Package Structure

```
packages/jobs/
  src/
    client.ts          # Graphile Worker client wrapper
    types.ts           # Job envelope types
    enqueue.ts         # Type-safe enqueue helper
    index.ts           # Exports
  package.json
  tsconfig.json
```

### Worker Process

```
scripts/
  run-worker.ts        # Worker entrypoint
                       # - Loads domain jobs from container
                       # - Runs Graphile Worker
                       # - Handles graceful shutdown
```

---

## Implementation Plan

### Phase 1: Package Setup

1. **Create `@workspace/jobs` package**
   - Dependencies: `graphile-worker`, `pg`
   - Exports: `enqueueJob()`, `JobEnvelope<T>`, `createWorkerClient()`

2. **Define job envelope types**

   ```typescript
   export type JobEnvelope<TPayload = unknown> = {
     tenantId: string;
     actorId?: string;
     traceId: string;
     requestId?: string;
     payload: TPayload;
   };

   export type JobHandler<TPayload = unknown> = (
     envelope: JobEnvelope<TPayload>,
   ) => Promise<void>;
   ```

3. **Implement `enqueueJob()` helper**
   - Validates envelope
   - Logs job enqueue with traceId
   - Calls Graphile Worker's `addJob()`

### Phase 2: Worker Setup

1. **Create `scripts/run-worker.ts`**
   - Connects to PostgreSQL
   - Bootstraps domain container
   - Registers job handlers
   - Runs Graphile Worker
   - Handles SIGTERM/SIGINT

2. **Add npm script**
   ```json
   {
     "scripts": {
       "worker": "tsx scripts/run-worker.ts"
     }
   }
   ```

### Phase 3: Proof Jobs

1. **System job: `system.ping`**
   - No payload
   - Logs "ping received" with traceId
   - Returns immediately
   - Proves: worker runs, logging works

2. **Domain job: `requests.reminder`**
   - Payload: `{ requestId: string }`
   - Fetches request from DB (via domain addon)
   - Logs tenant context
   - Proves: tenant context propagates, domain integration works

### Phase 4: API Integration

1. **Add `POST /api/jobs/enqueue` endpoint**
   - Kernel-wrapped (tenant context available)
   - Body: `{ jobName: string, payload: unknown }`
   - Enqueues job with full envelope
   - Returns: `{ jobId: string, traceId: string }`

### Phase 5: Evidence Capture

1. **Enqueue system.ping via API**
   - Capture: API response (jobId, traceId)
   - Capture: Worker log showing job execution
   - Capture: DB query showing job completed

2. **Enqueue requests.reminder via API**
   - Capture: API response
   - Capture: Worker log showing tenant context
   - Capture: DB query showing job completed

---

## Acceptance Criteria

- [x] `@workspace/jobs` package created — ✅ COMPLETE
- [x] Job envelope type defined — ✅ COMPLETE
- [x] `enqueueJob()` helper implemented — ✅ COMPLETE
- [x] Worker script runs and processes jobs — ✅ VERIFIED 2026-01-20
- [x] System job (`system.ping`) executes successfully — ✅ VERIFIED (jobId: 1, 0.25ms)
- [x] Domain job (`requests.reminder`) executes with tenant context — ✅ VERIFIED (jobId: 2, 0.13ms)
- [x] API endpoint enqueues jobs via kernel — ✅ VERIFIED (kernel-wrapped, tenant context)
- [x] Logs show traceId correlation (API → job) — ✅ VERIFIED (matches in both)
- [x] DB queries confirm job status transitions — ✅ VERIFIED (queued → processed → removed)
- [x] Evidence captured in this document — ✅ COMPLETE (5 items)

---

## Evidence Captured - 2026-01-20

### [1] Worker Startup

```
{"level":"info","time":"2026-01-19T19:07:47.278Z","pid":60340,"hostname":"JackWee","msg":"Starting Graphile Worker..."}
{"level":"info","time":"2026-01-19T19:07:47.278Z","pid":60340,"hostname":"JackWee","jobCount":2,"msg":"Starting Graphile Worker"}
[core] INFO: Worker connected and looking for jobs... (task names: 'system.ping', 'requests.reminder')
```

✅ Confirms:

- Worker started successfully
- 2 handlers registered (system.ping, requests.reminder)
- Connected to PostgreSQL

---

### [2] Enqueue system.ping

**API Response:**

```json
{
  "data": {
    "jobId": "1",
    "jobName": "system.ping",
    "enqueuedAt": "2026-01-19T18:58:54.289Z"
  },
  "meta": {
    "traceId": "c36d1e9348218e7e6b4d8dc079c96cb5"
  }
}
```

✅ Confirms:

- Job enqueued successfully
- jobId: 1
- traceId: c36d1e9348218e7e6b4d8dc079c96cb5

---

### [3] Enqueue requests.reminder

**API Response:**

```json
{
  "data": {
    "jobId": "2",
    "jobName": "requests.reminder",
    "enqueuedAt": "2026-01-19T18:59:04.249Z"
  },
  "meta": {
    "traceId": "fcc240ec823574d28c5fdde567faf8d3"
  }
}
```

✅ Confirms:

- Job enqueued successfully
- jobId: 2
- traceId: fcc240ec823574d28c5fdde567faf8d3
- Payload included requestId

---

### [4] Worker Execution Logs

```
{"level":"info","time":"2026-01-19T19:07:48.308Z","pid":60340,"hostname":"JackWee","traceId":"c36d1e9348218e7e6b4d8dc079c96cb5","tenantId":"11fd9cff-a017-4708-a2f6-3575ba4827d5","actorId":"550e8400-e29b-41d4-a716-446655440000","msg":"system.ping executed"}
[worker(worker-91b7c1095405541d51)] INFO: Completed task 1 (system.ping, 0.25ms) with success

{"level":"info","time":"2026-01-19T19:07:48.310Z","pid":60340,"hostname":"JackWee","traceId":"fcc240ec823574d28c5fdde567faf8d3","tenantId":"11fd9cff-a017-4708-a2f6-3575ba4827d5","actorId":"550e8400-e29b-41d4-a716-446655440000","requestId":"efb75502-8fc4-4625-b401-1b03eea10322","msg":"requests.reminder executed"}
[worker(worker-ba2d4c3d7f3990cb39)] INFO: Completed task 2 (requests.reminder, 0.13ms) with success
```

✅ Confirms:

- Both jobs executed successfully
- Full tenant context present (tenantId, actorId)
- traceId correlation matches API responses
- requests.reminder includes requestId from payload
- Execution time: <1ms (both jobs)

---

### [5] DB Proof

**Query:**

```sql
SELECT id, task_identifier, created_at, updated_at, attempts, last_error
FROM graphile_worker.jobs
ORDER BY created_at DESC LIMIT 5;
```

**Result (before worker execution):**

```
 id |  task_identifier  |          created_at           |          updated_at           | attempts | last_error
----+-------------------+-------------------------------+-------------------------------+----------+------------
  2 | requests.reminder | 2026-01-19 18:59:04.48432+00  | 2026-01-19 18:59:04.48432+00  |        0 |
  1 | system.ping       | 2026-01-19 18:58:54.452569+00 | 2026-01-19 18:58:54.452569+00 |        0 |
(2 rows)
```

**Result (after worker execution):**

```
 id | task_identifier | created_at | updated_at | attempts | last_error
----+-----------------+------------+------------+----------+------------
(0 rows)
```

✅ Confirms:

- Jobs were in queue (attempts = 0)
- Worker processed both jobs
- Jobs removed from queue after successful completion (Graphile Worker default behavior)
- No errors (last_error = NULL before removal)

---

## Next Steps

**After EVI004 Complete:**

- File pipeline jobs (upload → convert → store)
- Scheduled jobs (cron: request expiration, cleanup)
- Retry policies (exponential backoff)
- Job monitoring dashboard
- Dead letter queue handling
