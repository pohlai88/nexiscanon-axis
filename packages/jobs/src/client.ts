// packages/jobs/src/client.ts
// Graphile Worker client wrapper

import { run, makeWorkerUtils, type WorkerUtils } from "graphile-worker";
import type { Pool } from "pg";
import { getLogger } from "@workspace/observability";
import type { JobHandlers } from "./types";

const log = getLogger();

/**
 * Create Graphile Worker utilities for job management.
 * Used to enqueue jobs from API handlers.
 */
export async function createWorkerUtils(
  connectionString: string
): Promise<WorkerUtils> {
  return await makeWorkerUtils({
    connectionString,
  });
}

/**
 * Run Graphile Worker with registered job handlers.
 * This is the worker process entrypoint.
 */
export async function runWorker(
  connectionString: string,
  handlers: JobHandlers,
  options?: {
    concurrency?: number;
    pollInterval?: number;
  }
): Promise<void> {
  log.info(
    { jobCount: Object.keys(handlers).length },
    "Starting Graphile Worker"
  );

  await run({
    connectionString,
    concurrency: options?.concurrency ?? 5,
    pollInterval: options?.pollInterval ?? 1000,
    taskList: handlers,
  });
}
