// packages/auth/src/neon-server/server-client.ts
// Server-side Neon Auth client for API routes

import { getNeonAuthServerConfig } from "./config";

type SessionResponse = {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
  } | null;
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image?: string | null;
    role?: string | null;
  } | null;
};

/**
 * Create a server-side Neon Auth client.
 * Used in API routes and server components.
 */
export function createServerAuthClient() {
  const config = getNeonAuthServerConfig();

  if (!config) {
    throw new Error("Neon Auth not configured");
  }

  const baseUrl = config.baseUrl.replace(/\/$/, "");

  return {
    /**
     * Get session from session token (from cookie).
     */
    async getSession(sessionToken: string): Promise<SessionResponse> {
      const response = await fetch(`${baseUrl}/api/auth/get-session`, {
        method: "GET",
        headers: {
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
      });

      if (!response.ok) {
        return { session: null, user: null };
      }

      return response.json();
    },

    /**
     * Verify session and return user data.
     */
    async verifySession(
      sessionToken: string
    ): Promise<{ userId: string; email: string } | null> {
      const result = await this.getSession(sessionToken);

      if (!result.session || !result.user) {
        return null;
      }

      return {
        userId: result.user.id,
        email: result.user.email,
      };
    },

    /**
     * Get base URL for constructing auth URLs.
     */
    getBaseUrl(): string {
      return baseUrl;
    },
  };
}
