// apps/web/app/api/requests/route.ts
// Create request endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import { KernelError, ErrorCode } from "@workspace/api-kernel/errors";
import {
  requestCreateInputSchema,
  requestCreateOutputSchema,
} from "@workspace/validation";
import { REQUESTS_TOKENS } from "@workspace/domain";
import { getDomainContainer, getTemplatesRepo } from "@workspace/app-runtime";

/**
 * POST /api/requests
 * Create a new request in SUBMITTED state.
 * Requires authentication and tenant.
 */
export const POST = kernel({
  method: "POST",
  routeId: "requests.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: requestCreateInputSchema,
  output: requestCreateOutputSchema,

  async handler({ tenantId, actorId, ctx, body }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    // EVI016: Validate templateId if provided (leak-safe 404)
    if (body.templateId) {
      const templatesRepo = await getTemplatesRepo();
      const template = await templatesRepo.findById({
        tenantId: tenantId!,
        templateId: body.templateId,
      });

      if (!template) {
        // Leak-safe: same error for invalid vs cross-tenant
        throw new KernelError(ErrorCode.NOT_FOUND, "Template not found");
      }
    }

    // Get domain container
    const container = await getDomainContainer();
    const requestService = container.get(REQUESTS_TOKENS.RequestService);

    // Call domain service (EVI013: pass template + policy overrides)
    const request = await requestService.create(
      {
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        tenantId,
        actorId,
      },
      {
        requesterId: actorId,
        templateId: body.templateId,
        evidenceRequiredForApproval: body.evidenceRequiredForApproval,
        evidenceTtlSeconds: body.evidenceTtlSeconds,
      }
    );

    return request;
  },
});
