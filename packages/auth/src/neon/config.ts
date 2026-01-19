// packages/auth/src/neon/config.ts
// Neon Auth configuration from environment

export type NeonAuthConfig = {
  baseUrl: string;
  jwksUrl: string;
};

/**
 * Get Neon Auth configuration from environment variables.
 * Returns undefined if not configured (allows graceful fallback to dev mode).
 */
export function getNeonAuthConfig(): NeonAuthConfig | undefined {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const jwksUrl = process.env.JWKS_URL;

  if (!baseUrl || !jwksUrl) {
    return undefined;
  }

  return { baseUrl, jwksUrl };
}
