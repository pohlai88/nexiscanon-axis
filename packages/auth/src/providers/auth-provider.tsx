// packages/auth/src/providers/auth-provider.tsx
// Main AuthProvider - wraps NeonAuthProvider for Neon Auth integration
//
// ARCHITECTURE: This is the primary auth provider for the AXIS platform.
// It integrates with Neon Auth for session management and authentication.
// For direct Neon Auth access, use @workspace/auth/neon-client.

"use client";

import { createContext, useCallback, useState, useEffect } from "react";
import type { AuthSession, AuthError, AuthContextType } from "../types";
import { createNeonAuthClient } from "../neon-client/client";

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  /**
   * Neon Auth URL. If not provided, uses NEXT_PUBLIC_NEON_AUTH_URL.
   */
  authURL?: string;
};

export function AuthProvider({ children, authURL }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Resolve Neon Auth URL
  const neonAuthUrl =
    authURL || process.env.NEXT_PUBLIC_NEON_AUTH_URL;

  // Create Neon Auth client (memoized by URL)
  const neonClient = neonAuthUrl ? createNeonAuthClient(neonAuthUrl) : null;

  // Fetch session on mount
  useEffect(() => {
    async function fetchSession() {
      if (!neonClient) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await neonClient.getSession();

        if (result.data) {
          setSession({
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              name: result.data.user.name,
              emailVerified: result.data.user.emailVerified,
            },
            token: result.data.accessToken || result.data.token,
            expiresAt: result.data.expiresAt
              ? new Date(result.data.expiresAt).getTime()
              : undefined,
          });
        }
      } catch {
        // Session fetch failed - user not authenticated
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [neonClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!neonClient) {
        throw new Error("Neon Auth not configured");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await neonClient.signIn({ email, password });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.data) {
          setSession({
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              name: result.data.user.name,
              emailVerified: result.data.user.emailVerified,
            },
            token: result.data.accessToken || result.data.token,
            expiresAt: result.data.expiresAt
              ? new Date(result.data.expiresAt).getTime()
              : undefined,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError({ code: "LOGIN_ERROR", message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [neonClient]
  );

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!neonClient) {
        throw new Error("Neon Auth not configured");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await neonClient.signUp({
          email,
          password,
          name: name || email.split("@")[0],
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.data) {
          setSession({
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              name: result.data.user.name,
              emailVerified: result.data.user.emailVerified,
            },
            token: result.data.accessToken || result.data.token,
            expiresAt: result.data.expiresAt
              ? new Date(result.data.expiresAt).getTime()
              : undefined,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError({ code: "SIGNUP_ERROR", message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [neonClient]
  );

  const verifyEmail = useCallback(
    async (code: string) => {
      if (!neonClient) {
        throw new Error("Neon Auth not configured");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await neonClient.verifyEmail(code);

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.data) {
          setSession({
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              name: result.data.user.name,
              emailVerified: result.data.user.emailVerified,
            },
            token: result.data.accessToken || result.data.token,
            expiresAt: result.data.expiresAt
              ? new Date(result.data.expiresAt).getTime()
              : undefined,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError({ code: "VERIFY_ERROR", message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [neonClient]
  );

  const logout = useCallback(async () => {
    if (neonClient) {
      await neonClient.signOut();
    }
    setSession(null);
    setError(null);
  }, [neonClient]);

  return (
    <AuthContext.Provider
      value={{ session, isLoading, error, login, signup, verifyEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
