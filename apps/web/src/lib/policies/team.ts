/**
 * Team Member Policies
 *
 * Permission checks for team member operations.
 */

import type { TenantUser } from "@axis/db/schema";

/**
 * Check if user can invite members to the team.
 * Required role: owner or admin
 */
export function canInviteMembers(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return membership.role === "owner" || membership.role === "admin";
}

/**
 * Check if user can remove members from the team.
 * Required role: owner or admin
 * Additional rules:
 * - Cannot remove yourself
 * - Cannot remove the owner
 */
export function canRemoveMembers(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return membership.role === "owner" || membership.role === "admin";
}

/**
 * Check if a specific member can be removed.
 * @param actorMembership - The membership of the user performing the action
 * @param targetMembership - The membership of the user being removed
 * @param actorUserId - The ID of the user performing the action
 */
export function canRemoveSpecificMember(
  actorMembership: TenantUser | null | undefined,
  targetMembership: TenantUser | null | undefined,
  actorUserId: string
): { allowed: boolean; reason?: string } {
  if (!actorMembership) {
    return { allowed: false, reason: "You are not a member" };
  }

  if (!targetMembership) {
    return { allowed: false, reason: "User is not a member" };
  }

  // Cannot remove yourself
  if (targetMembership.userId === actorUserId) {
    return { allowed: false, reason: "You cannot remove yourself" };
  }

  // Cannot remove the owner
  if (targetMembership.role === "owner") {
    return { allowed: false, reason: "Cannot remove the owner" };
  }

  // Must be owner or admin to remove
  if (actorMembership.role !== "owner" && actorMembership.role !== "admin") {
    return { allowed: false, reason: "You don't have permission to remove members" };
  }

  // Admins cannot remove other admins (only owner can)
  if (actorMembership.role === "admin" && targetMembership.role === "admin") {
    return { allowed: false, reason: "Only the owner can remove admins" };
  }

  return { allowed: true };
}

/**
 * Check if user can change member roles.
 * Required role: owner only
 */
export function canChangeRoles(membership: TenantUser | null | undefined): boolean {
  if (!membership) return false;
  return membership.role === "owner";
}

/**
 * Check if a specific role change is allowed.
 * @param actorMembership - The membership of the user performing the action
 * @param targetMembership - The current membership of the user being changed
 * @param newRole - The new role being assigned
 * @param actorUserId - The ID of the user performing the action
 */
export function canChangeSpecificRole(
  actorMembership: TenantUser | null | undefined,
  targetMembership: TenantUser | null | undefined,
  newRole: string,
  actorUserId: string
): { allowed: boolean; reason?: string } {
  if (!actorMembership) {
    return { allowed: false, reason: "You are not a member" };
  }

  if (!targetMembership) {
    return { allowed: false, reason: "User is not a member" };
  }

  // Only owner can change roles
  if (actorMembership.role !== "owner") {
    return { allowed: false, reason: "Only the owner can change roles" };
  }

  // Cannot change your own role
  if (targetMembership.userId === actorUserId) {
    return { allowed: false, reason: "You cannot change your own role" };
  }

  // Cannot change to owner (owner transfer is a separate flow)
  if (newRole === "owner") {
    return { allowed: false, reason: "Cannot assign owner role. Use transfer ownership instead." };
  }

  return { allowed: true };
}
