/**
 * Server-side Auth Client
 *
 * Inspired by Supabase SSR pattern: createServerClient utility.
 * Provides a factory function for creating auth-aware clients.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { cookies } from "next/headers";
import { authConfig } from "./config";
import { logger } from "../logger";

/**
 * Auth session data from Neon Auth.
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified: boolean;
  };
  session: {
    id: string;
    expiresAt: string;
  };
}

/**
 * Server auth client for making authenticated requests.
 */
export interface ServerAuthClient {
  /** Get current session (returns null if not authenticated) */
  getSession(): Promise<AuthSession | null>;
  /** Get session cookie value */
  getSessionToken(): Promise<string | null>;
  /** Check if user is authenticated */
  isAuthenticated(): Promise<boolean>;
}

/**
 * Create a server-side auth client.
 *
 * Pattern inspired by Supabase's createServerClient.
 * Uses cookies from next/headers for session access.
 *
 * @example
 * ```ts
 * // In Server Component or Server Action
 * const auth = await createServerAuthClient();
 * const session = await auth.getSession();
 * if (!session) redirect("/login");
 * ```
 */
export async function createServerAuthClient(): Promise<ServerAuthClient> {
  const cookieStore = await cookies();

  const getSessionToken = async (): Promise<string | null> => {
    return cookieStore.get(authConfig.sessionCookieName)?.value ?? null;
  };

  const getSession = async (): Promise<AuthSession | null> => {
    const sessionToken = await getSessionToken();

    if (!sessionToken) {
      return null;
    }

    try {
      const response = await fetch(`${authConfig.baseUrl}/get-session`, {
        headers: {
          Cookie: `${authConfig.sessionCookieName}=${sessionToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.session || !data.user) {
        return null;
      }

      return data as AuthSession;
    } catch (error) {
      logger.error("Auth client: session fetch error", { error });
      return null;
    }
  };

  const isAuthenticated = async (): Promise<boolean> => {
    const session = await getSession();
    return session !== null;
  };

  return {
    getSession,
    getSessionToken,
    isAuthenticated,
  };
}

/**
 * Quick helper to get session without creating full client.
 *
 * @example
 * ```ts
 * const session = await getServerSession();
 * ```
 */
export async function getServerSession(): Promise<AuthSession | null> {
  const client = await createServerAuthClient();
  return client.getSession();
}
