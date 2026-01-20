// packages/auth/src/neon-server/verify.ts
// JWT verification using Neon Auth JWKS

import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import { getNeonAuthServerConfig } from "./config";

/**
 * Neon Auth JWT payload with standard and custom claims.
 */
export type NeonAuthPayload = JWTPayload & {
  sub: string; // User ID
  email?: string;
  role?: string;
  tenant_id?: string; // Custom claim for multi-tenant
  organization_id?: string; // Better Auth organization
};

// Cache the JWKS fetcher to avoid repeated initialization
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksCacheUrl: string | null = null;

function getJwks(jwksUrl: string): ReturnType<typeof createRemoteJWKSet> {
  if (jwksCache && jwksCacheUrl === jwksUrl) {
    return jwksCache;
  }

  jwksCache = createRemoteJWKSet(new URL(jwksUrl));
  jwksCacheUrl = jwksUrl;
  return jwksCache;
}

/**
 * Verify a Neon Auth JWT and extract payload.
 *
 * @param token - JWT token string
 * @returns Verified payload or undefined if verification fails
 */
export async function verifyNeonAuthJwt(
  token: string
): Promise<NeonAuthPayload | undefined> {
  const config = getNeonAuthServerConfig();

  if (!config) {
    console.warn("Neon Auth not configured - JWT verification skipped");
    return undefined;
  }

  try {
    const JWKS = getJwks(config.jwksUrl);

    const { payload } = await jwtVerify(token, JWKS, {
      clockTolerance: 10, // 10 seconds clock skew tolerance
    });

    // Validate required claims
    if (!payload.sub) {
      console.warn("JWT verified but missing sub claim");
      return undefined;
    }

    return payload as NeonAuthPayload;
  } catch (error) {
    // Log but don't throw - return undefined for graceful handling
    console.warn("JWT verification failed:", error);
    return undefined;
  }
}

/**
 * Extract Bearer token from Authorization header.
 */
export function extractBearerToken(
  authHeader: string | null
): string | undefined {
  if (!authHeader?.startsWith("Bearer ")) {
    return undefined;
  }
  return authHeader.slice(7);
}
