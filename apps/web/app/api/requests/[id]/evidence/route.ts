// apps/web/app/api/requests/[id]/evidence/route.ts
// Link and list evidence for requests (tenant-scoped)

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";
import {
  getRequestEvidenceLinksRepo,
  getEvidenceFilesRepo,
  getDomainContainer,
} from "@workspace/app-runtime";
import { randomUUID } from "crypto";

// Force Node.js runtime
export const runtime = "nodejs";

// POST: Link evidence to request
const LinkInput = z.object({
  evidenceFileId: z.string().uuid(),
});

const LinkOutput = z.object({
  linkId: z.string().uuid(),
  requestId: z.string().uuid(),
  evidenceFileId: z.string().uuid(),
  linkedBy: z.string(),
  createdAt: z.string(),
});

export const POST = kernel({
  method: "POST",
  routeId: "requests.linkEvidence",
  tenant: { required: true },
  auth: { mode: "optional" }, // Dev mode
  body: LinkInput,
  output: LinkOutput,
  async handler(ctx) {
    const requestId = ctx.params.id as string;
    const { evidenceFileId } = ctx.body;

    if (!requestId) {
      return Response.json(
        { error: { code: "INVALID_REQUEST_ID", message: "Request ID is required" } },
        { status: 400 }
      );
    }

    // Verify request exists (tenant-scoped)
    const container = await getDomainContainer();
    const { REQUESTS_TOKENS } = await import("@workspace/domain");
    const requestsRepo = container.get(REQUESTS_TOKENS.RequestRepository);
    const request = await requestsRepo.findById(requestId);

    if (!request || request.tenantId !== ctx.tenantId) {
      return Response.json(
        {
          error: {
            code: "REQUEST_NOT_FOUND",
            message: `Request ${requestId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Verify evidence exists (tenant-scoped)
    const evidenceRepo = await getEvidenceFilesRepo();
    const evidence = await evidenceRepo.findById(evidenceFileId, ctx.tenantId!);

    if (!evidence) {
      return Response.json(
        {
          error: {
            code: "EVIDENCE_NOT_FOUND",
            message: `Evidence file ${evidenceFileId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Check if link already exists
    const linksRepo = await getRequestEvidenceLinksRepo();
    const existingLink = await linksRepo.findLink(requestId, evidenceFileId, ctx.tenantId!);

    if (existingLink) {
      return Response.json(
        {
          error: {
            code: "LINK_ALREADY_EXISTS",
            message: "Evidence is already linked to this request",
          },
        },
        { status: 409 }
      );
    }

    // Create link
    const linkId = randomUUID();
    const link = await linksRepo.create({
      id: linkId,
      tenantId: ctx.tenantId!,
      requestId,
      evidenceFileId,
      linkedBy: ctx.actorId || "anonymous",
    });

    console.log(
      JSON.stringify({
        event: "request.evidence.linked",
        requestId,
        evidenceFileId,
        linkId,
        tenantId: ctx.tenantId,
        actorId: ctx.actorId,
        traceId: ctx.traceId,
      })
    );

    return {
      linkId: link.id,
      requestId: link.requestId,
      evidenceFileId: link.evidenceFileId,
      linkedBy: link.linkedBy,
      createdAt: link.createdAt.toISOString(),
    };
  },
});

// GET: List evidence for request
const ListOutput = z.object({
  requestId: z.string().uuid(),
  evidence: z.array(
    z.object({
      evidenceFileId: z.string().uuid(),
      originalName: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      status: z.string(),
      linkedAt: z.string(),
      linkedBy: z.string(),
      viewEndpoint: z.string(),
    })
  ),
});

export const GET = kernel({
  method: "GET",
  routeId: "requests.listEvidence",
  tenant: { required: true },
  auth: { mode: "optional" }, // Dev mode
  output: ListOutput,
  async handler(ctx) {
    const requestId = ctx.params.id as string;

    if (!requestId) {
      return Response.json(
        { error: { code: "INVALID_REQUEST_ID", message: "Request ID is required" } },
        { status: 400 }
      );
    }

    // Verify request exists (tenant-scoped)
    const container = await getDomainContainer();
    const { REQUESTS_TOKENS } = await import("@workspace/domain");
    const requestsRepo = container.get(REQUESTS_TOKENS.RequestRepository);
    const request = await requestsRepo.findById(requestId);

    if (!request || request.tenantId !== ctx.tenantId) {
      return Response.json(
        {
          error: {
            code: "REQUEST_NOT_FOUND",
            message: `Request ${requestId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Get all linked evidence
    const linksRepo = await getRequestEvidenceLinksRepo();
    const links = await linksRepo.listByRequestId(requestId, ctx.tenantId!);

    return {
      requestId,
      evidence: links.map((link) => ({
        evidenceFileId: link.evidenceFileId,
        originalName: link.evidenceFile.originalName,
        mimeType: link.evidenceFile.mimeType,
        sizeBytes: link.evidenceFile.sizeBytes,
        status: link.evidenceFile.status,
        linkedAt: link.createdAt.toISOString(),
        linkedBy: link.linkedBy,
        viewEndpoint: `/api/evidence/${link.evidenceFileId}/view`,
      })),
    };
  },
});
