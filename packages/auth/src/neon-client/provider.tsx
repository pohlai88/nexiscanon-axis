// packages/auth/src/neon-client/provider.tsx
// Neon Auth React provider and hook
//
// ARCHITECTURE: Provides React context for Neon Auth state management
// Auto-refreshes session on mount and handles auth state changes

"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { createNeonAuthClient, type NeonAuthClient } from "./client";
import type {
  NeonUser,
  NeonSession,
  NeonAuthState,
  SignInCredentials,
  SignUpData,
  OAuthProvider,
  NeonAuthError,
} from "./types";

// ---- Context Types ----

type NeonAuthContextValue = NeonAuthState & {
  client: NeonAuthClient;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider, callbackURL?: string) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  error: NeonAuthError | null;
  clearError: () => void;
};

const NeonAuthContext = createContext<NeonAuthContextValue | null>(null);

// ---- Provider Props ----

type NeonAuthProviderProps = {
  children: ReactNode;
  /**
   * Neon Auth base URL. Can be provided directly or via NEXT_PUBLIC_NEON_AUTH_URL.
   */
  authURL?: string;
  /**
   * Optional: Pre-created client (for SSR or testing).
   */
  client?: NeonAuthClient;
  /**
   * Auto-refresh session on mount. Default: true.
   */
  autoRefresh?: boolean;
};

// ---- Provider Component ----

export function NeonAuthProvider({
  children,
  authURL,
  client: providedClient,
  autoRefresh = true,
}: NeonAuthProviderProps) {
  // Resolve auth URL from props or environment
  const resolvedURL =
    authURL ||
    (typeof window !== "undefined"
      ? (window as any).__NEON_AUTH_URL__
      : undefined) ||
    process.env.NEXT_PUBLIC_NEON_AUTH_URL;

  if (!resolvedURL && !providedClient) {
    throw new Error(
      "NeonAuthProvider: authURL or NEXT_PUBLIC_NEON_AUTH_URL is required"
    );
  }

  // Create or use provided client
  const client = useMemo(
    () => providedClient || createNeonAuthClient(resolvedURL!),
    [providedClient, resolvedURL]
  );

  // Auth state
  const [user, setUser] = useState<NeonUser | null>(null);
  const [session, setSession] = useState<NeonSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NeonAuthError | null>(null);

  const isAuthenticated = !!user;

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Refresh session from server
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await client.getSession();

    if (result.error) {
      // Session fetch failed - user is not authenticated
      setUser(null);
      setSession(null);
      // Don't set error for 401 (expected when not logged in)
      if (result.error.status !== 401) {
        setError(result.error);
      }
    } else if (result.data) {
      setSession(result.data);
      setUser(result.data.user);
    }

    setIsLoading(false);
  }, [client]);

  // Sign in with email/password
  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      setIsLoading(true);
      setError(null);

      const result = await client.signIn(credentials);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        throw new Error(result.error.message);
      }

      if (result.data) {
        setSession(result.data);
        setUser(result.data.user);
      }

      setIsLoading(false);
    },
    [client]
  );

  // Sign up with email/password
  const signUp = useCallback(
    async (data: SignUpData) => {
      setIsLoading(true);
      setError(null);

      const result = await client.signUp(data);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        throw new Error(result.error.message);
      }

      if (result.data) {
        setSession(result.data);
        setUser(result.data.user);
      }

      setIsLoading(false);
    },
    [client]
  );

  // Sign in with OAuth
  const signInWithOAuth = useCallback(
    (provider: OAuthProvider, callbackURL?: string) => {
      client.signInWithOAuth(provider, callbackURL);
    },
    [client]
  );

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await client.signOut();

    if (result.error) {
      setError(result.error);
    }

    // Always clear local state on sign out
    setUser(null);
    setSession(null);
    setIsLoading(false);
  }, [client]);

  // Auto-refresh session on mount
  useEffect(() => {
    if (autoRefresh) {
      refreshSession();
    } else {
      setIsLoading(false);
    }
  }, [autoRefresh, refreshSession]);

  // Context value
  const value: NeonAuthContextValue = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated,
      client,
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
      refreshSession,
      error,
      clearError,
    }),
    [
      user,
      session,
      isLoading,
      isAuthenticated,
      client,
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
      refreshSession,
      error,
      clearError,
    ]
  );

  return (
    <NeonAuthContext.Provider value={value}>
      {children}
    </NeonAuthContext.Provider>
  );
}

// ---- Hook ----

/**
 * Hook to access Neon Auth state and methods.
 *
 * @throws Error if used outside NeonAuthProvider
 */
export function useNeonAuth(): NeonAuthContextValue {
  const context = useContext(NeonAuthContext);

  if (!context) {
    throw new Error("useNeonAuth must be used within NeonAuthProvider");
  }

  return context;
}
