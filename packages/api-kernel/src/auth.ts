// packages/api-kernel/src/auth.ts
// Auth extraction and enforcement for kernel

import { KernelError, ErrorCode } from "./errors";
import type { AuthConfig } from "./types";

/** Auth resolution result */
export type AuthResult = {
  actorId: string | undefined;
  roles: string[];
};

/**
 * Extract auth from request.
 * This is a placeholder - integrate with Neon Auth in production.
 * Checks Authorization header for Bearer token and extracts user info.
 */
export async function extractAuth(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { actorId: undefined, roles: [] };
  }

  // TODO: Integrate with Neon Auth
  // For now, this is a placeholder that decodes a simple JWT-like structure
  // In production, use Neon Auth SDK to validate and extract session
  const token = authHeader.slice(7);

  try {
    // Placeholder: extract from header for dev/testing
    // Real implementation: validate JWT with Neon Auth
    const actorId = request.headers.get("X-Actor-ID") ?? undefined;
    const rolesHeader = request.headers.get("X-Actor-Roles");
    const roles = rolesHeader
      ? rolesHeader.split(",").map((r) => r.trim())
      : [];

    return {
      actorId: actorId || (token ? "dev-user" : undefined),
      roles,
    };
  } catch {
    return { actorId: undefined, roles: [] };
  }
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
