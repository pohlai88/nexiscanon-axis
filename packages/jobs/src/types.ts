// packages/jobs/src/types.ts
// Job envelope and handler types

/**
 * Standard envelope for all jobs.
 * Ensures tenant context + observability correlation.
 */
export type JobEnvelope<TPayload = unknown> = {
  /** Tenant context (for RLS, logging) */
  tenantId: string;

  /** Actor who triggered the job (optional) */
  actorId?: string;

  /** Trace ID for observability correlation */
  traceId: string;

  /** Request ID from originating API call (optional) */
  requestId?: string;

  /** Job-specific payload */
  payload: TPayload;
};

/**
 * Job handler function signature.
 * All jobs receive a typed envelope.
 */
export type JobHandler<TPayload = unknown> = (
  envelope: JobEnvelope<TPayload>
) => Promise<void>;

/**
 * Job registration map.
 * Maps job names to their handlers.
 */
export type JobHandlers = Record<string, JobHandler<any>>;

// ---- Job Payloads ----

/**
 * Payload for files.convert_to_pdf job.
 * Converts office documents (docx/xlsx/pptx) to PDF.
 */
export type ConvertToPdfPayload = {
  /** Evidence file ID to convert */
  evidenceFileId: string;
};