// packages/jobs/src/enqueue.ts
// Type-safe job enqueue helper

import type { WorkerUtils } from "graphile-worker";
import { getLogger } from "@workspace/observability";
import type { JobEnvelope } from "./types";

const log = getLogger();

/**
 * Enqueue a job with full envelope.
 * Validates envelope and logs enqueue event.
 */
export async function enqueueJob<TPayload>(
  utils: WorkerUtils,
  jobName: string,
  envelope: JobEnvelope<TPayload>,
  options?: {
    runAt?: Date;
    maxAttempts?: number;
    priority?: number;
  }
): Promise<string> {
  // Validate envelope
  if (!envelope.tenantId) {
    throw new Error("Job envelope must include tenantId");
  }
  if (!envelope.traceId) {
    throw new Error("Job envelope must include traceId");
  }

  // Log enqueue
  log.info(
    {
      jobName,
      tenantId: envelope.tenantId,
      actorId: envelope.actorId,
      traceId: envelope.traceId,
      requestId: envelope.requestId,
    },
    "Enqueueing job"
  );

  // Enqueue to Graphile Worker
  const job = await utils.addJob(jobName, envelope, {
    runAt: options?.runAt,
    maxAttempts: options?.maxAttempts ?? 25,
    priority: options?.priority,
  });

  return job.id.toString();
}
