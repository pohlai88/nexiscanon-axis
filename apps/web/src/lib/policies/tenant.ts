/**
 * Tenant Resource Policies
 *
 * Permission checks for tenant-level operations.
 */

import type { TenantUser } from "@axis/db/schema";

/**
 * Role hierarchy for comparison.
 * Higher number = more permissions.
 */
const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
} as const;

/** Minimum role level for admin-level actions */
const ADMIN_LEVEL = ROLE_HIERARCHY.admin;

/**
 * Get role level for comparison.
 */
function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] ?? 0;
}

/**
 * Check if user can manage team members.
 * Required role: owner or admin
 */
export function canManageTeam(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return getRoleLevel(membership.role) >= ADMIN_LEVEL;
}

/**
 * Check if user can manage billing.
 * Required role: owner only
 */
export function canManageBilling(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return membership.role === "owner";
}

/**
 * Check if user can manage tenant settings.
 * Required role: owner or admin
 */
export function canManageSettings(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return getRoleLevel(membership.role) >= ADMIN_LEVEL;
}

/**
 * Check if user can delete the tenant/workspace.
 * Required role: owner only
 */
export function canDeleteTenant(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return membership.role === "owner";
}

/**
 * Check if user can manage API keys.
 * Required role: owner or admin
 */
export function canManageApiKeys(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return getRoleLevel(membership.role) >= ADMIN_LEVEL;
}

/**
 * Check if user can view audit logs.
 * Required role: owner or admin
 */
export function canViewAuditLog(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return getRoleLevel(membership.role) >= ADMIN_LEVEL;
}

/**
 * Check if user can update tenant branding.
 * Required role: owner only
 */
export function canUpdateBranding(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return membership.role === "owner";
}

/**
 * Check if user can update tenant name.
 * Required role: owner only
 */
export function canUpdateTenantName(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return membership.role === "owner";
}

/**
 * Check if user can create teams within an organization.
 * Required role: owner or admin of the parent org
 */
export function canCreateTeam(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return getRoleLevel(membership.role) >= ADMIN_LEVEL;
}

/**
 * Check if user can delete a team.
 * Required role: owner of the team OR owner of the parent org
 */
export function canDeleteTeam(
  teamMembership: TenantUser | null | undefined,
  parentOrgMembership: TenantUser | null | undefined
): boolean {
  // Owner of the team can delete
  if (teamMembership?.role === "owner") return true;
  // Owner of the parent org can delete
  if (parentOrgMembership?.role === "owner") return true;
  return false;
}
