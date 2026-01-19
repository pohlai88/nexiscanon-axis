// apps/web/app/api/auth/logout/route.ts
// Logout endpoint - uses kernel pattern

import { kernel } from "@workspace/api-kernel";
import { logoutOutputSchema } from "@workspace/validation";

/**
 * POST /api/auth/logout
 *
 * Logs out the current user by clearing the auth token
 */
export const POST = kernel({
  method: "POST",
  routeId: "auth.logout",
  // Optional auth - works whether user is logged in or not
  auth: { mode: "optional" },
  output: logoutOutputSchema,

  async handler({ actorId }) {
    // TODO: Implement actual logout logic
    // In production:
    // 1. Invalidate session in database
    // 2. Clear auth cookie (kernel could handle this via response headers)
    // 3. Blacklist token if using JWT

    // For now, return success
    // Note: Cookie clearing would need to be handled by extending kernel
    // or by a middleware layer

    if (actorId) {
      // User was authenticated, invalidate their session
      // await invalidateSession(actorId);
    }

    return {
      success: true,
    };
  },
});
