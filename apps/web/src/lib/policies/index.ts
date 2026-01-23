/**
 * Resource Access Policies
 *
 * Centralized permission checks for tenant resources.
 * Inspired by Liveblocks' canRead/canWrite pattern.
 *
 * Pattern:
 * - Each policy function returns a boolean
 * - Policies are pure functions (no side effects)
 * - Policies are composable
 *
 * @example
 * ```ts
 * import { canManageTeam, canManageBilling } from "@/lib/policies";
 *
 * if (!canManageTeam(membership)) {
 *   return { success: false, error: "Forbidden" };
 * }
 * ```
 */

export { canManageTeam, canManageBilling, canManageSettings, canDeleteTenant } from "./tenant";
export { canManageApiKeys, canViewAuditLog } from "./tenant";
export { canInviteMembers, canRemoveMembers, canChangeRoles, canRemoveSpecificMember, canChangeSpecificRole } from "./team";
export { assertPermission, type PermissionCheck } from "./assert";
