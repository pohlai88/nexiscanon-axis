/**
 * Neon Auth configuration.
 */
export interface NeonAuthConfig {
  /** Neon Auth base URL (e.g., https://ep-xxx.neonauth.region.aws.neon.tech/dbname/auth) */
  authUrl: string;

  /** JWKS URL for JWT validation */
  jwksUrl: string;

  /** Callback URLs */
  callbacks?: {
    signIn?: string;
    signOut?: string;
    error?: string;
  };
}

/**
 * Create Neon Auth client.
 *
 * @example
 * ```ts
 * import { createNeonAuth } from "@axis/kernel/auth";
 *
 * const auth = createNeonAuth({
 *   authUrl: process.env.NEON_AUTH_BASE_URL!,
 *   jwksUrl: process.env.JWKS_URL!,
 * });
 * ```
 */
export function createNeonAuth(config: NeonAuthConfig) {
  const { authUrl, jwksUrl, callbacks } = config;

  return {
    /**
     * Get sign-in URL.
     */
    getSignInUrl(redirectTo?: string): string {
      const url = new URL("/signin", authUrl);
      if (redirectTo) {
        url.searchParams.set("redirect", redirectTo);
      }
      if (callbacks?.signIn) {
        url.searchParams.set("callback", callbacks.signIn);
      }
      return url.toString();
    },

    /**
     * Get sign-out URL.
     */
    getSignOutUrl(redirectTo?: string): string {
      const url = new URL("/signout", authUrl);
      if (redirectTo) {
        url.searchParams.set("redirect", redirectTo);
      }
      return url.toString();
    },

    /**
     * Get JWKS URL for JWT validation.
     */
    getJwksUrl(): string {
      return jwksUrl;
    },

    /**
     * Validate JWT token from Neon Auth.
     * TODO: Implement actual JWT validation with JWKS.
     */
    async validateToken(token: string): Promise<{
      valid: boolean;
      userId?: string;
      tenantId?: string;
      email?: string;
      role?: string;
    }> {
      // TODO: Implement JWT validation using jose library
      // 1. Fetch JWKS from jwksUrl
      // 2. Verify JWT signature
      // 3. Extract claims
      console.log("Validating token:", token.slice(0, 20) + "...");

      return {
        valid: false,
        userId: undefined,
        tenantId: undefined,
        email: undefined,
        role: undefined,
      };
    },

    /**
     * Get auth config for reference.
     */
    getConfig() {
      return {
        authUrl,
        jwksUrl,
        callbacks,
      };
    },
  };
}
