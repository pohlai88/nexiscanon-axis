// packages/auth/src/neon-client/client.ts
// Neon Auth client implementation
//
// ARCHITECTURE: Creates a client that communicates with Neon Auth REST API
// Following Neon Auth best practices for session management

import type {
  NeonUser,
  NeonSession,
  SignInCredentials,
  SignUpData,
  OAuthProvider,
  AuthResult,
  NeonAuthError,
} from "./types";

export type NeonAuthClient = ReturnType<typeof createNeonAuthClient>;

/**
 * Create a Neon Auth client for browser usage.
 *
 * @param baseURL - Neon Auth base URL (e.g., https://ep-xxx.neonauth.region.aws.neon.tech/neondb/auth)
 */
export function createNeonAuthClient(baseURL: string) {
  // Normalize URL (remove trailing slash)
  const authBaseURL = baseURL.replace(/\/$/, "");

  /**
   * Make authenticated request to Neon Auth API.
   */
  async function authFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AuthResult<T>> {
    try {
      const response = await fetch(`${authBaseURL}${endpoint}`, {
        ...options,
        credentials: "include", // Include cookies for session management
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            code: data.code || "AUTH_ERROR",
            message: data.message || "Authentication failed",
            status: response.status,
          },
        };
      }

      return { data: data as T, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          code: "NETWORK_ERROR",
          message: err instanceof Error ? err.message : "Network error",
        },
      };
    }
  }

  return {
    /**
     * Get current session from Neon Auth.
     * Uses session cookie to retrieve session data.
     */
    async getSession(): Promise<AuthResult<NeonSession>> {
      return authFetch<NeonSession>("/api/auth/get-session");
    },

    /**
     * Sign in with email and password.
     */
    async signIn(
      credentials: SignInCredentials
    ): Promise<AuthResult<NeonSession>> {
      return authFetch<NeonSession>("/api/auth/sign-in/email", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },

    /**
     * Sign up with email, password, and name.
     */
    async signUp(data: SignUpData): Promise<AuthResult<NeonSession>> {
      return authFetch<NeonSession>("/api/auth/sign-up/email", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    /**
     * Sign in with OAuth provider.
     * Redirects to provider's auth page.
     */
    signInWithOAuth(provider: OAuthProvider, callbackURL?: string): void {
      const params = new URLSearchParams({
        callbackURL: callbackURL || window.location.origin,
      });
      window.location.href = `${authBaseURL}/api/auth/sign-in/social?provider=${provider}&${params}`;
    },

    /**
     * Sign out and clear session.
     */
    async signOut(): Promise<AuthResult<{ success: boolean }>> {
      return authFetch<{ success: boolean }>("/api/auth/sign-out", {
        method: "POST",
      });
    },

    /**
     * Request email verification.
     */
    async sendVerificationEmail(): Promise<AuthResult<{ success: boolean }>> {
      return authFetch<{ success: boolean }>("/api/auth/send-verification-email", {
        method: "POST",
      });
    },

    /**
     * Verify email with OTP code.
     */
    async verifyEmail(code: string): Promise<AuthResult<NeonSession>> {
      return authFetch<NeonSession>("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },

    /**
     * Request password reset email.
     */
    async forgotPassword(
      email: string
    ): Promise<AuthResult<{ success: boolean }>> {
      return authFetch<{ success: boolean }>("/api/auth/forget-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },

    /**
     * Reset password with token.
     */
    async resetPassword(
      token: string,
      newPassword: string
    ): Promise<AuthResult<{ success: boolean }>> {
      return authFetch<{ success: boolean }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
    },

    /**
     * Update user profile.
     */
    async updateProfile(
      data: Partial<Pick<NeonUser, "name" | "image">>
    ): Promise<AuthResult<NeonUser>> {
      return authFetch<NeonUser>("/api/auth/update-user", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    /**
     * Get the auth base URL.
     */
    getBaseURL(): string {
      return authBaseURL;
    },
  };
}
