// packages/auth/src/neon-server/config.ts
// Neon Auth server configuration

export type NeonAuthServerConfig = {
  baseUrl: string;
  jwksUrl: string;
};

/**
 * Get Neon Auth server configuration from environment variables.
 *
 * Required environment variables:
 * - NEON_AUTH_BASE_URL: Base URL for Neon Auth API
 * - JWKS_URL: URL for JWKS endpoint (JWT verification)
 */
export function getNeonAuthServerConfig(): NeonAuthServerConfig | undefined {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const jwksUrl = process.env.JWKS_URL;

  if (!baseUrl || !jwksUrl) {
    return undefined;
  }

  return { baseUrl, jwksUrl };
}

/**
 * Get Neon Auth server configuration, throwing if not configured.
 */
export function requireNeonAuthServerConfig(): NeonAuthServerConfig {
  const config = getNeonAuthServerConfig();

  if (!config) {
    throw new Error(
      "Neon Auth not configured. Set NEON_AUTH_BASE_URL and JWKS_URL environment variables."
    );
  }

  return config;
}
