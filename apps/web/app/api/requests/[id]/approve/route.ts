// apps/web/app/api/requests/[id]/approve/route.ts
// Approve request endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import {
  requestApproveInputSchema,
  requestApproveOutputSchema,
} from "@workspace/validation";
import { REQUESTS_TOKENS } from "@workspace/domain";
import { getDomainContainer } from "@workspace/app-runtime";

/**
 * POST /api/requests/[id]/approve
 * Approve a request (changes status to APPROVED).
 * Requires authentication and tenant.
 */
export const POST = kernel({
  method: "POST",
  routeId: "requests.approve",
  tenant: { required: true },
  auth: { mode: "required" },
  body: requestApproveInputSchema,
  output: requestApproveOutputSchema,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const requestIdParam = params?.id as string;
    if (!requestIdParam) {
      throw new Error("Request ID parameter required");
    }

    // Get domain container
    const container = await getDomainContainer();
    const requestService = container.get(REQUESTS_TOKENS.RequestService);

    // Call domain service
    const request = await requestService.approve(
      {
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        tenantId,
        actorId,
      },
      {
        requestId: requestIdParam,
        approverId: actorId,
      }
    );

    return request;
  },
});
