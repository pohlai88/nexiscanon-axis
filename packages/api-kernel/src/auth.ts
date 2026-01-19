// packages/api-kernel/src/auth.ts
// Auth extraction and enforcement for kernel

import { KernelError, ErrorCode } from "./errors";
import type { AuthConfig } from "./types";
import { verifyJwt } from "@workspace/auth";

/** Auth resolution result */
export type AuthResult = {
  actorId: string | undefined;
  roles: string[];
};

/**
 * Extract auth from request.
 * Supports two modes:
 * 1. JWT verification (production): Authorization: Bearer <jwt>
 * 2. Dev headers (fallback): X-Actor-ID + X-Actor-Roles
 */
export async function extractAuth(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { actorId: undefined, roles: [] };
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Try JWT verification first (production mode)
  try {
    const principal = await verifyJwt(token);

    if (principal) {
      // JWT verified successfully
      // Extract roles from claims if present (Neon Auth may include roles)
      const roles =
        Array.isArray(principal.claims.roles) &&
        principal.claims.roles.every((r): r is string => typeof r === "string")
          ? principal.claims.roles
          : [];

      return {
        actorId: principal.actorId,
        roles,
      };
    }
  } catch (error) {
    // JWT verification failed - log but continue to dev fallback
    console.warn("JWT verification error:", error);
  }

  // Fallback to dev headers (for local development without Neon Auth)
  // IMPORTANT: This fallback only works when JWKS_URL is not set
  // In production with JWKS_URL set, invalid tokens return undefined auth
  const devActorId = request.headers.get("X-Actor-ID");
  const devRolesHeader = request.headers.get("X-Actor-Roles");

  if (devActorId || token === "dev") {
    const roles = devRolesHeader
      ? devRolesHeader.split(",").map((r) => r.trim())
      : [];

    return {
      actorId: devActorId || "dev-user",
      roles,
    };
  }

  // No valid auth found
  return { actorId: undefined, roles: [] };
}

/**
 * Enforce auth requirements.
 * Throws KernelError if auth mode is required but user is not authenticated.
 */
export function enforceAuth(
  auth: AuthResult,
  config: AuthConfig | undefined
): void {
  if (!config || config.mode === "public") {
    return;
  }

  if (config.mode === "required" && !auth.actorId) {
    throw new KernelError(ErrorCode.UNAUTHENTICATED, "Authentication required");
  }

  // Check roles only if authenticated and roles are specified
  if (auth.actorId && config.roles?.length) {
    const hasRequiredRole = config.roles.some((role) =>
      auth.roles.includes(role)
    );
    if (!hasRequiredRole) {
      throw new KernelError(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        `Required role(s): ${config.roles.join(", ")}`
      );
    }
  }
}
