// apps/web/app/api/auth/logout/route.ts
// Logout endpoint - Neon Auth integration
//
// ARCHITECTURE: Proxies logout to Neon Auth service
// Clears session in neon_auth.session table

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";

const LogoutOutput = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

/**
 * POST /api/auth/logout
 *
 * Logs out the current user by invalidating their Neon Auth session.
 */
export const POST = kernel({
  method: "POST",
  routeId: "auth.logout",
  auth: { mode: "optional" },
  output: LogoutOutput,

  async handler({ rawRequest }) {
    const neonAuthUrl = process.env.NEON_AUTH_BASE_URL;

    if (!neonAuthUrl) {
      // No Neon Auth - just return success
      return { success: true };
    }

    try {
      // Forward logout request to Neon Auth
      // Include cookies from original request for session identification
      const cookieHeader = rawRequest.headers.get("cookie") || "";

      const response = await fetch(`${neonAuthUrl}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: false,
          error: data.message || "Logout failed",
        };
      }

      return { success: true };
    } catch (err) {
      // Log error but return success (client-side state will be cleared anyway)
      console.warn("Logout error:", err);
      return { success: true };
    }
  },
});
