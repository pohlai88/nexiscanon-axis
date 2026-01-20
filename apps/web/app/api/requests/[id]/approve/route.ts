// apps/web/app/api/requests/[id]/approve/route.ts
// Approve request with evidence freshness guards (EVI010)

import { kernel } from "@workspace/api-kernel";
import { KernelError, ErrorCode } from "@workspace/api-kernel/errors";
import { z } from "zod";
import {
  getDomainContainer,
  getRequestEvidenceLinksRepo,
  getAuditLogsRepo,
} from "@workspace/app-runtime";

export const runtime = "nodejs";

const ApproveOutput = z.object({
  requestId: z.string().uuid(),
  status: z.literal("APPROVED"),
  approvedAt: z.string(),
  approvedBy: z.string(),
});

export const POST = kernel({
  method: "POST",
  routeId: "requests.approve",
  tenant: { required: true },
  auth: { mode: "required" }, // Require actor for approval
  output: ApproveOutput,
  async handler(ctx) {
    const requestId = ctx.params.id as string;

    if (!requestId) {
      throw new KernelError(
        ErrorCode.INVALID_INPUT,
        "Request ID is required"
      );
    }

    // Fetch request (tenant-scoped)
    const container = await getDomainContainer();
    const { REQUESTS_TOKENS } = await import("@workspace/domain");
    const requestsRepo = container.get(REQUESTS_TOKENS.RequestRepository);
    const request = await requestsRepo.findById(ctx.tenantId!, requestId);

    if (!request) {
      throw new KernelError(
        ErrorCode.NOT_FOUND,
        `Request ${requestId} not found`
      );
    }

    // Get request DB row to check evidence policy
    const { getDb } = await import("@workspace/db");
    const db = getDb();
    const result = await db.execute(
      `SELECT evidence_required_for_approval, evidence_ttl_seconds FROM requests WHERE id = '${requestId}'`
    );

    if (!result.rows || result.rows.length === 0) {
      throw new KernelError(
        ErrorCode.NOT_FOUND,
        "Request not found"
      );
    }

    const requestRow = result.rows[0] as any;
    const evidenceRequired = requestRow.evidence_required_for_approval;
    const evidenceTtl = requestRow.evidence_ttl_seconds;

    // Append audit: approval.attempted (before any guards)
    const auditRepo = await getAuditLogsRepo();
    await auditRepo.append({
      tenantId: ctx.tenantId!,
      actorId: ctx.actorId!,
      traceId: ctx.ctx.traceId,
      eventName: "approval.attempted",
      eventData: {
        requestId,
        evidencePolicy: {
          required: evidenceRequired,
          ttlSeconds: evidenceTtl,
        },
      },
    });

    // Check evidence freshness
    const linksRepo = await getRequestEvidenceLinksRepo();
    const freshness = await linksRepo.checkEvidenceFreshness(
      requestId,
      ctx.tenantId!,
      evidenceTtl
    );

    // Guard: Evidence required but missing
    if (evidenceRequired && !freshness.hasEvidence) {
      // Append audit log before throwing
      await auditRepo.append({
        tenantId: ctx.tenantId!,
        actorId: ctx.actorId!,
        traceId: ctx.ctx.traceId,
        eventName: "approval.blocked.evidence_required",
        eventData: {
          requestId,
          reason: "evidence_required",
          details: {
            evidenceRequired: true,
            hasEvidence: false,
          },
        },
      });

      throw new KernelError(
        ErrorCode.EVIDENCE_REQUIRED,
        "Evidence is required for approval but none is attached",
        {
          evidenceRequired: true,
          hasEvidence: false,
        }
      );
    }

    // Guard: Evidence stale (TTL exceeded)
    if (freshness.isFresh === false) {
      // Append audit log before throwing
      await auditRepo.append({
        tenantId: ctx.tenantId!,
        actorId: ctx.actorId!,
        traceId: ctx.ctx.traceId,
        eventName: "approval.blocked.evidence_stale",
        eventData: {
          requestId,
          reason: "evidence_stale",
          details: {
            evidenceTtl,
            evidenceAge: freshness.ageSeconds,
            latestEvidenceAt: freshness.latestEvidenceAt?.toISOString(),
          },
        },
      });

      throw new KernelError(
        ErrorCode.EVIDENCE_STALE,
        `Evidence is stale (age: ${freshness.ageSeconds}s, TTL: ${evidenceTtl}s)`,
        {
          evidenceTtl,
          evidenceAge: freshness.ageSeconds,
          latestEvidenceAt: freshness.latestEvidenceAt?.toISOString(),
        }
      );
    }

    // Approve request (actorId is guaranteed by auth: required)
    const approvedAt = new Date();
    const approvedBy = ctx.actorId!; // Non-null due to required auth
    
    await db.execute(
      `UPDATE requests SET status = 'APPROVED', approved_at = '${approvedAt.toISOString()}', approved_by = '${approvedBy}', updated_at = '${approvedAt.toISOString()}' WHERE id = '${requestId}'`
    );

    // Append audit: approval.succeeded (after DB write, with truthful approvedAt)
    await auditRepo.append({
      tenantId: ctx.tenantId!,
      actorId: ctx.actorId!,
      traceId: ctx.ctx.traceId,
      eventName: "approval.succeeded",
      eventData: {
        requestId,
        approvedBy,
        approvedAt: approvedAt.toISOString(),
        evidenceCheck: {
          hasEvidence: freshness.hasEvidence,
          isFresh: freshness.isFresh,
          ageSeconds: freshness.ageSeconds,
        },
      },
    });

    console.log(
      JSON.stringify({
        event: "request.approved",
        requestId,
        tenantId: ctx.tenantId,
        actorId: ctx.actorId,
        traceId: ctx.ctx.traceId,
        evidenceCheck: {
          hasEvidence: freshness.hasEvidence,
          isFresh: freshness.isFresh,
          ageSeconds: freshness.ageSeconds,
        },
      })
    );

    return {
      requestId,
      status: "APPROVED" as const,
      approvedAt: approvedAt.toISOString(),
      approvedBy,
    };
  },
});
