/**
 * Neon Auth configuration.
 * 
 * Pattern: Centralize all auth config here.
 */

export const authConfig = {
  /**
   * Neon Auth base URL.
   * Example: https://ep-xxx.neonauth.region.aws.neon.tech/dbname/auth
   */
  baseUrl: process.env.NEON_AUTH_BASE_URL ?? "",

  /**
   * JWKS URL for JWT validation.
   */
  jwksUrl: process.env.JWKS_URL ?? "",

  /**
   * Public auth URL (for client-side).
   */
  publicUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL ?? "",

  /**
   * Session cookie name (Better Auth default).
   */
  sessionCookieName: "better-auth.session_token",

  /**
   * Session duration in seconds (7 days).
   */
  sessionDuration: 7 * 24 * 60 * 60,

  /**
   * Routes that don't require authentication.
   */
  publicRoutes: ["/", "/login", "/register", "/api/auth"],
} as const;

/**
 * Check if auth is properly configured.
 */
export function isAuthConfigured(): boolean {
  return Boolean(authConfig.baseUrl && authConfig.jwksUrl);
}
