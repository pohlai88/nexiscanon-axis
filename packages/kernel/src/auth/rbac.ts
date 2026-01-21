/**
 * User roles in AXIS ERP.
 */
export type Role = "owner" | "admin" | "member" | "viewer";

/**
 * Available permissions.
 */
export type Permission =
  // Tenant management
  | "tenant:read"
  | "tenant:update"
  | "tenant:delete"
  // User management
  | "users:read"
  | "users:invite"
  | "users:update"
  | "users:remove"
  // Billing
  | "billing:read"
  | "billing:update"
  // Data (generic ERP modules)
  | "data:read"
  | "data:create"
  | "data:update"
  | "data:delete"
  | "data:export";

/**
 * Role -> Permissions mapping.
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "tenant:read",
    "tenant:update",
    "tenant:delete",
    "users:read",
    "users:invite",
    "users:update",
    "users:remove",
    "billing:read",
    "billing:update",
    "data:read",
    "data:create",
    "data:update",
    "data:delete",
    "data:export",
  ],
  admin: [
    "tenant:read",
    "tenant:update",
    "users:read",
    "users:invite",
    "users:update",
    "users:remove",
    "billing:read",
    "data:read",
    "data:create",
    "data:update",
    "data:delete",
    "data:export",
  ],
  member: [
    "tenant:read",
    "users:read",
    "data:read",
    "data:create",
    "data:update",
  ],
  viewer: ["tenant:read", "users:read", "data:read"],
};

/**
 * Check if a role has a specific permission.
 *
 * @param role - User's role
 * @param permission - Permission to check
 * @returns Whether the role has the permission
 */
export function checkPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Get all permissions for a role.
 *
 * @param role - User's role
 * @returns Array of permissions
 */
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if role A has higher or equal privileges than role B.
 */
export function isRoleAtLeast(role: Role, minimumRole: Role): boolean {
  const hierarchy: Role[] = ["viewer", "member", "admin", "owner"];
  return hierarchy.indexOf(role) >= hierarchy.indexOf(minimumRole);
}
