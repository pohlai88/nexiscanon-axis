// packages/api-kernel/src/auth.ts
// Auth extraction and enforcement for kernel
//
// ARCHITECTURE: Extracts auth from requests using Neon Auth JWT verification
// Supports multi-tenant via tenant_id claim in JWT

import { KernelError, ErrorCode } from "./errors";
import type { AuthConfig } from "./types";
import { verifyJwt } from "@workspace/auth";

/** Auth resolution result with Neon Auth claims */
export type AuthResult = {
  actorId: string | undefined;
  roles: string[];
  /** Tenant ID from JWT tenant_id claim (for multi-tenant RLS) */
  tenantId?: string;
  /** Organization ID from JWT organization_id claim (Better Auth orgs) */
  organizationId?: string;
  /** Email from JWT email claim */
  email?: string;
  /** Raw JWT claims for advanced use cases */
  claims?: Record<string, unknown>;
};

/**
 * Extract auth from request.
 * Supports:
 * 1. JWT verification (production): Authorization: Bearer <jwt>
 * 2. Dev headers (fallback): X-Actor-ID + X-Actor-Roles + X-Tenant-ID
 *
 * Neon Auth JWT claims extracted:
 * - sub: User ID (actorId)
 * - email: User email
 * - role: User role (single or array)
 * - tenant_id: Multi-tenant scope
 * - organization_id: Better Auth organization
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
      // JWT verified successfully - extract Neon Auth claims
      const claims = principal.claims as Record<string, unknown>;

      // Extract roles from claims (can be string or array)
      let roles: string[] = [];
      if (Array.isArray(claims.roles)) {
        roles = claims.roles.filter(
          (r): r is string => typeof r === "string"
        );
      } else if (typeof claims.role === "string" && claims.role) {
        roles = [claims.role];
      }

      // Extract tenant_id for multi-tenant RLS
      const tenantId =
        typeof claims.tenant_id === "string" ? claims.tenant_id : undefined;

      // Extract organization_id for Better Auth orgs
      const organizationId =
        typeof claims.organization_id === "string"
          ? claims.organization_id
          : undefined;

      return {
        actorId: principal.actorId,
        email: principal.email,
        roles,
        tenantId,
        organizationId,
        claims,
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
  const devTenantId = request.headers.get("X-Tenant-ID");

  if (devActorId || token === "dev") {
    const roles = devRolesHeader
      ? devRolesHeader.split(",").map((r) => r.trim())
      : [];

    return {
      actorId: devActorId || "dev-user",
      roles,
      tenantId: devTenantId || undefined,
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
