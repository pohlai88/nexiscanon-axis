# @workspace/jobs

Background job queue with tenant context + observability.

## Overview

Type-safe wrapper around Graphile Worker for PostgreSQL-based job queue.

**Features:**
- Full tenant context propagation (tenantId, actorId)
- Observability correlation (traceId, requestId)
- Type-safe job payloads
- ACID guarantees (jobs in same DB as data)
- Retry with exponential backoff
- Cron job support

## Usage

### Enqueue a Job (from API handler)

```typescript
import { createWorkerUtils, enqueueJob } from "@workspace/jobs";

const utils = await createWorkerUtils(process.env.DATABASE_URL!);

const jobId = await enqueueJob(utils, "system.ping", {
  tenantId: ctx.tenantId!,
  actorId: ctx.actorId,
  traceId: ctx.traceId,
  requestId: ctx.requestId,
  payload: {},
});

await utils.release();
```

### Register a Job Handler

```typescript
// scripts/run-worker.ts
import type { JobEnvelope } from "@workspace/jobs";

async function myJob(envelope: JobEnvelope<{ foo: string }>) {
  console.log("Job executed:", envelope.payload.foo);
  // Job has access to: tenantId, actorId, traceId, requestId
}

const handlers = {
  "my.job": myJob,
};
```

### Run Worker

```bash
pnpm worker
```

## Architecture

### Job Envelope

Every job receives a standard envelope:

```typescript
{
  tenantId: string;        // Tenant context
  actorId?: string;        // Actor who triggered job
  traceId: string;         // Correlation ID
  requestId?: string;      // Request ID
  payload: TPayload;       // Job-specific data
}
```

### Database Schema

Graphile Worker auto-creates tables in `graphile_worker` schema:
- `graphile_worker.jobs` - Job queue
- `graphile_worker.known_crontabs` - Cron schedules
- `graphile_worker.job_queues` - Queue metadata

## Dependencies

- `graphile-worker` - PostgreSQL-based job queue
- `pg` - PostgreSQL client
- `@workspace/observability` - Logging

## Scripts

- `pnpm worker` - Start worker process
- `pnpm check-types` - TypeScript check
