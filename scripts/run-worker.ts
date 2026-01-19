// scripts/run-worker.ts
// Graphile Worker entrypoint

import { runWorker } from "@workspace/jobs";
import { getLogger } from "@workspace/observability";
import type { JobHandlers, JobEnvelope, ConvertToPdfPayload } from "@workspace/jobs";

const log = getLogger();

// System job: ping (health check)
async function systemPing(envelope: JobEnvelope<Record<string, never>>) {
  log.info(
    {
      traceId: envelope.traceId,
      tenantId: envelope.tenantId,
      actorId: envelope.actorId,
    },
    "system.ping executed"
  );
}

// Domain job: requests.reminder (placeholder)
async function requestsReminder(
  envelope: JobEnvelope<{ requestId: string }>
) {
  log.info(
    {
      traceId: envelope.traceId,
      tenantId: envelope.tenantId,
      actorId: envelope.actorId,
      requestId: envelope.payload.requestId,
    },
    "requests.reminder executed"
  );

  // TODO: Fetch request from DB via domain addon
  // TODO: Send reminder notification
}

// Files: convert to PDF
async function convertToPdf(envelope: JobEnvelope<ConvertToPdfPayload>) {
  const { evidenceFileId } = envelope.payload;
  const { tenantId, traceId } = envelope;

  log.info({
    event: "job.files.convert_to_pdf.start",
    evidenceFileId,
    tenantId,
    traceId,
  });

  // Import handler inline to avoid package exports issues
  const { convertToPdfHandler } = await import("../packages/jobs/src/handlers/files-convert-to-pdf");
  return convertToPdfHandler(envelope);
}

// Register all job handlers
const handlers: JobHandlers = {
  "system.ping": systemPing,
  "requests.reminder": requestsReminder,
  "files.convert_to_pdf": convertToPdf,
};

// Start worker
async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    log.error("DATABASE_URL not set");
    process.exit(1);
  }

  log.info("Starting Graphile Worker...");

  try {
    await runWorker(connectionString, handlers, {
      concurrency: 5,
      pollInterval: 1000,
    });
  } catch (error) {
    log.error({ error }, "Worker failed");
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  log.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  log.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

main().catch((error) => {
  log.error({ error }, "Worker startup failed");
  process.exit(1);
});
