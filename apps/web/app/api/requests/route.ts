// apps/web/app/api/requests/route.ts
// Create request endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import {
  requestCreateInputSchema,
  requestCreateOutputSchema,
} from "@workspace/validation";
import { REQUESTS_TOKENS } from "@workspace/domain";
import { getDomainContainer } from "@workspace/app-runtime";

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

  async handler({ body, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    // Get domain container
    const container = await getDomainContainer();
    const requestService = container.get(REQUESTS_TOKENS.RequestService);

    // Call domain service
    const request = await requestService.create(
      {
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        tenantId,
        actorId,
      },
      {
        requesterId: actorId,
      }
    );

    return request;
  },
});
