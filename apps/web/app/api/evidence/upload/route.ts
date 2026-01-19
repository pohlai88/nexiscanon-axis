// apps/web/app/api/evidence/upload/route.ts
// Upload evidence files: images/PDFs direct, Office → conversion pipeline
// Phase 2: Office docs enqueue conversion job → CONVERT_PENDING

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";
import { getR2Client, getEvidenceFilesRepo } from "@workspace/app-runtime";
import { enqueueJob, type ConvertToPdfPayload } from "@workspace/jobs";

// Force Node.js runtime (avoid edge/multipart issues)
export const runtime = "nodejs";

// MIME type allowlist (direct viewable)
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
] as const;

// Office documents: accepted but require conversion
const OFFICE_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/msword", // doc
  "application/vnd.ms-excel", // xls
  "application/vnd.ms-powerpoint", // ppt
] as const;

const Output = z.object({
  id: z.string().uuid(),
  status: z.enum(["READY", "CONVERT_PENDING", "REJECTED_UNSUPPORTED"]),
  mimeType: z.string(),
  originalName: z.string(),
  sizeBytes: z.number(),
});

/**
 * Determine MIME type from file object, with fallback to extension.
 * Windows often leaves file.type empty.
 */
function getMimeType(file: File): string {
  if (file.type) return file.type;

  // Fallback: infer from extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  const extMap: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  return extMap[ext || ""] || "application/octet-stream";
}

export const POST = kernel({
  method: "POST",
  routeId: "evidence.upload",
  tenant: { required: true },
  auth: { mode: "optional" }, // Dev mode
  output: Output,
  async handler(ctx, request) {
    // Parse multipart form data
    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      throw new Error("Missing or invalid 'file' field in multipart form data");
    }

    const mimeType = getMimeType(file);
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const buffer = Buffer.from(await file.arrayBuffer());
    const r2 = getR2Client();
    const repo = await getEvidenceFilesRepo();

    // Branch: Office documents → conversion pipeline
    if (OFFICE_MIME_TYPES.includes(mimeType as any)) {
      // Generate temp ID for R2 key (will be replaced by repo-generated ID)
      const tempId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const sourceR2Key = `t/${ctx.tenantId}/evidence/${tempId}/source/${safeFilename}`;

      await r2.putObject({
        key: sourceR2Key,
        body: buffer,
        contentType: mimeType,
      });

      ctx.log.info({
        event: "evidence.upload.r2.source",
        sourceR2Key,
        bucket: process.env.R2_BUCKET_NAME,
      });

      // Save metadata with CONVERT_PENDING status (repo generates ID)
      const record = await repo.create({
        tenantId: ctx.tenantId!,
        uploadedBy: ctx.actorId || "anonymous",
        originalName: file.name,
        mimeType,
        sizeBytes: file.size,
        r2Key: sourceR2Key, // deprecated field
        sourceR2Key,
        status: "CONVERT_PENDING",
      });

      // Enqueue conversion job
      const jobId = await enqueueJob<ConvertToPdfPayload>({
        jobName: "files.convert_to_pdf",
        payload: { evidenceFileId: record.id },
        tenantId: ctx.tenantId!,
        actorId: ctx.actorId,
        traceId: ctx.traceId,
      });

      ctx.log.info({
        event: "evidence.job.enqueued",
        jobName: "files.convert_to_pdf",
        jobId,
        evidenceFileId: record.id,
        traceId: ctx.traceId,
      });

      // Return 202 Accepted with CONVERT_PENDING
      return Response.json(
        {
          data: {
            id: record.id,
            status: "CONVERT_PENDING" as const,
            mimeType: record.mimeType,
            originalName: record.originalName,
            sizeBytes: record.sizeBytes,
          },
          meta: { traceId: ctx.traceId },
        },
        { status: 202 }
      );
    }

    // Branch: Direct viewable (PDF, images)
    if (ALLOWED_MIME_TYPES.includes(mimeType as any)) {
      const tempId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const viewR2Key = `t/${ctx.tenantId}/evidence/${tempId}/view/${safeFilename}`;

      await r2.putObject({
        key: viewR2Key,
        body: buffer,
        contentType: mimeType,
      });

      ctx.log.info({
        event: "evidence.upload.r2.view",
        viewR2Key,
        bucket: process.env.R2_BUCKET_NAME,
      });

      const record = await repo.create({
        tenantId: ctx.tenantId!,
        uploadedBy: ctx.actorId || "anonymous",
        originalName: file.name,
        mimeType,
        sizeBytes: file.size,
        r2Key: viewR2Key, // deprecated field
        viewR2Key,
        status: "READY",
      });

      return {
        id: record.id,
        status: "READY" as const,
        mimeType: record.mimeType,
        originalName: record.originalName,
        sizeBytes: record.sizeBytes,
      };
    }

    // Unsupported type
    return Response.json(
      {
        error: {
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: `File type ${mimeType} is not supported. Allowed: PDF, PNG, JPEG, DOCX, XLSX, PPTX.`,
        },
      },
      { status: 415 }
    );
  },
});
