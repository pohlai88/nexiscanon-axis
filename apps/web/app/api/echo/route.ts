// apps/web/app/api/echo/route.ts
// Echo endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import { echoBodySchema, echoOutputSchema } from "@workspace/validation";

/**
 * POST /api/echo
 * Example: parse JSON body, validate, return JSON.
 * Use Route Handlers for: webhooks, REST APIs, non-UI responses.
 */
export const POST = kernel({
  method: "POST",
  routeId: "echo.post",
  // Public endpoint - no auth or tenant required
  auth: { mode: "public" },
  body: echoBodySchema,
  output: echoOutputSchema,

  async handler({ body }) {
    return {
      echoed: body.message,
    };
  },
});
