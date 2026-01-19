// packages/auth/src/neon/verify.ts
// JWT verification using JWKS

import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import { getNeonAuthConfig } from "./config";

export type AuthPrincipal = {
  actorId: string; // JWT sub claim
  email?: string;
  claims: JWTPayload; // Raw claims for future extensions
};

/**
 * Verify JWT using Neon Auth JWKS.
 * Returns principal on success, undefined on failure.
 */
export async function verifyJwt(
  token: string
): Promise<AuthPrincipal | undefined> {
  const config = getNeonAuthConfig();

  if (!config) {
    // No Neon Auth configured - graceful fallback
    return undefined;
  }

  try {
    // Create remote JWKS fetcher (jose handles caching)
    const JWKS = createRemoteJWKSet(new URL(config.jwksUrl));

    // Verify token signature and claims
    const { payload } = await jwtVerify(token, JWKS, {
      // Validate standard claims
      clockTolerance: 10, // 10 seconds clock skew tolerance
    });

    // Extract actor ID from sub claim
    const actorId = payload.sub;
    if (!actorId) {
      console.warn("JWT verified but missing sub claim");
      return undefined;
    }

    // Extract email if present
    const email =
      typeof payload.email === "string" ? payload.email : undefined;

    return {
      actorId,
      email,
      claims: payload,
    };
  } catch (error) {
    // JWT verification failed (signature invalid, expired, etc.)
    console.warn("JWT verification failed:", error);
    return undefined;
  }
}
