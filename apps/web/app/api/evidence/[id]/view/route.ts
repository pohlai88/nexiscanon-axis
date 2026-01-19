// apps/web/app/api/evidence/[id]/view/route.ts
// View evidence file (signed R2 URL) with tenant isolation + status guard

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";
import { getR2Client, getEvidenceFilesRepo } from "@workspace/app-runtime";

// Force Node.js runtime
export const runtime = "nodejs";

const Output = z.object({
  url: z.string().url(),
  expiresAt: z.string(),
  evidenceFileId: z.string().uuid(),
  originalName: z.string(),
  mimeType: z.string(),
});

export const GET = kernel({
  method: "GET",
  routeId: "evidence.view",
  tenant: { required: true },
  auth: { mode: "optional" }, // Dev mode
  output: Output,
  async handler(ctx) {
    const id = ctx.params.id as string;

    if (!id) {
      return Response.json(
        { error: { code: "INVALID_ID", message: "Evidence ID is required" } },
        { status: 400 }
      );
    }

    // Fetch evidence file (tenant-scoped)
    const repo = await getEvidenceFilesRepo();
    const file = await repo.findById(id, ctx.tenantId!);

    if (!file) {
      // 404: Not found (or wrong tenant)
      return Response.json(
        {
          error: {
            code: "EVIDENCE_NOT_FOUND",
            message: `Evidence file ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Status guard: READY only
    if (file.status !== "READY") {
      // 409: Not ready for viewing
      return Response.json(
        {
          error: {
            code: "EVIDENCE_NOT_READY",
            message: `Evidence file is not ready for viewing (status: ${file.status})`,
            status: file.status,
          },
        },
        { status: 409 }
      );
    }

    // Get view key (fallback to r2Key for legacy EVI006 files)
    const viewKey = file.viewR2Key || file.r2Key;
    if (!viewKey) {
      return Response.json(
        {
          error: {
            code: "EVIDENCE_NO_VIEW_KEY",
            message: "Evidence file has no viewable artifact",
          },
        },
        { status: 500 }
      );
    }

    // Generate signed R2 URL (5 min expiry)
    const r2 = getR2Client();
    const { url, expiresAt } = await r2.getSignedGetUrl(viewKey, 300);

    console.log(
      JSON.stringify({
        event: "evidence.view",
        evidenceFileId: file.id,
        tenantId: ctx.tenantId,
        actorId: ctx.actorId,
        traceId: ctx.traceId,
      })
    );

    return {
      url,
      expiresAt,
      evidenceFileId: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
    };
  },
});
