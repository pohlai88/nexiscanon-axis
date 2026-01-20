// apps/web/app/api/auth/session/route.ts
// Session endpoint - Get current session from Neon Auth
//
// ARCHITECTURE: Proxies session requests to Neon Auth service
// Returns current user session if authenticated

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";

const SessionOutput = z.object({
  authenticated: z.boolean(),
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      emailVerified: z.boolean(),
      image: z.string().nullable().optional(),
    })
    .optional(),
  session: z
    .object({
      expiresAt: z.string(),
    })
    .optional(),
});

/**
 * GET /api/auth/session
 *
 * Returns the current user session from Neon Auth.
 */
export const GET = kernel({
  method: "GET",
  routeId: "auth.session",
  auth: { mode: "optional" },
  output: SessionOutput,

  async handler({ rawRequest }) {
    const neonAuthUrl = process.env.NEON_AUTH_BASE_URL;

    if (!neonAuthUrl) {
      return { authenticated: false };
    }

    try {
      // Forward session request to Neon Auth with cookies
      const cookieHeader = rawRequest.headers.get("cookie") || "";

      const response = await fetch(`${neonAuthUrl}/api/auth/get-session`, {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
      });

      if (!response.ok) {
        return { authenticated: false };
      }

      const data = await response.json();

      if (!data.session || !data.user) {
        return { authenticated: false };
      }

      return {
        authenticated: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          emailVerified: data.user.emailVerified,
          image: data.user.image || null,
        },
        session: {
          expiresAt: data.session.expiresAt,
        },
      };
    } catch {
      return { authenticated: false };
    }
  },
});
