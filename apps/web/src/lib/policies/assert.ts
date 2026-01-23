/**
 * Permission Assertion Utilities
 *
 * Helper functions for asserting permissions in server actions.
 */

import type { TenantUser } from "@axis/db/schema";

/**
 * Permission check function type.
 */
export type PermissionCheck = (membership: TenantUser | null | undefined) => boolean;

/**
 * Assert that a permission check passes.
 * Returns an error result if the check fails.
 *
 * @example
 * ```ts
 * const permissionError = assertPermission(membership, canManageBilling, "manage billing");
 * if (permissionError) return permissionError;
 * ```
 */
export function assertPermission(
  membership: TenantUser | null | undefined,
  check: PermissionCheck,
  action: string
): { success: false; error: string } | null {
  if (!membership) {
    return { success: false, error: "You are not a member of this workspace" };
  }

  if (!check(membership)) {
    return { success: false, error: `You don't have permission to ${action}` };
  }

  return null;
}

/**
 * Assert that the user is authenticated.
 *
 * @example
 * ```ts
 * const authError = assertAuthenticated(user);
 * if (authError) return authError;
 * ```
 */
export function assertAuthenticated(
  user: { id: string } | null | undefined
): { success: false; error: string } | null {
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }
  return null;
}

/**
 * Assert that the tenant exists.
 *
 * @example
 * ```ts
 * const tenantError = assertTenantExists(tenant);
 * if (tenantError) return tenantError;
 * ```
 */
export function assertTenantExists(
  tenant: { id: string } | null | undefined
): { success: false; error: string } | null {
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }
  return null;
}
