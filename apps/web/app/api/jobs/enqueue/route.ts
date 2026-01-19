// apps/web/app/api/jobs/enqueue/route.ts
import { kernel } from "@workspace/api-kernel";
import { createWorkerUtils, enqueueJob } from "@workspace/jobs";
import { z } from "zod";

const Input = z.object({
  jobName: z.string().min(1),
  payload: z.record(z.unknown()).optional().default({}),
  runAt: z.string().datetime().optional(),
});

const Output = z.object({
  jobId: z.string(),
  jobName: z.string(),
  enqueuedAt: z.string(),
});

export const POST = kernel({
  method: "POST",
  routeId: "jobs.enqueue",
  tenant: { required: true },
  auth: { mode: "dev" },
  body: Input,
  output: Output,
  async handler({ body, ctx }) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL not set");
    }

    // Create worker utils
    const utils = await createWorkerUtils(connectionString);

    try {
      // Enqueue job with full envelope
      const jobId = await enqueueJob(utils, body.jobName, {
        tenantId: ctx.tenantId!,
        actorId: ctx.actorId,
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        payload: body.payload,
      }, {
        runAt: body.runAt ? new Date(body.runAt) : undefined,
      });

      return {
        jobId,
        jobName: body.jobName,
        enqueuedAt: new Date().toISOString(),
      };
    } finally {
      await utils.release();
    }
  },
});
