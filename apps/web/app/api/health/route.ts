// apps/web/app/api/health/route.ts
// Health check endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import { healthOutputSchema } from "@workspace/validation";

/**
 * GET /api/health
 * Use for: liveness/readiness probes, load balancers, monitoring.
 */
export const GET = kernel({
  method: "GET",
  routeId: "health.get",
  // Public endpoint - no auth or tenant required
  auth: { mode: "public" },
  output: healthOutputSchema,

  async handler() {
    return {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
    };
  },
});
