/**
 * User database queries.
 *
 * Pattern: Thin wrapper around @axis/db/queries.
 * - Uses Drizzle ORM (no raw SQL)
 * - Types from @axis/db/schema (single source of truth)
 * - Validation from @axis/db/validation
 *
 * This file provides backward-compatible exports and
 * injects the database client from the web app context.
 */

import { getDb } from "./index";
import {
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByAuthSubject as _findUserByAuthSubject,
  upsertUserFromAuth as _upsertUserFromAuth,
  listUsers as _listUsers,
  getUserTenantMembership as _getUserTenantMembership,
  getUserTenants as _getUserTenants,
  getTenantMembers as _getTenantMembers,
  addUserToTenant as _addUserToTenant,
  removeUserFromTenant as _removeUserFromTenant,
  getUserTenantCount as _getUserTenantCount,
  verifyTenantAccess as _verifyTenantAccess,
} from "@axis/db/queries";

// Re-export types from @axis/db (single source of truth)
export type { User, NewUser, TenantUser, NewTenantUser, UserRole } from "@axis/db/schema";

/**
 * TenantMembership - tenant info with user's role.
 * Used by getUserTenants() - shows which tenants a user belongs to.
 */
export type { TenantMembership } from "@axis/db/queries";

/**
 * Backward-compatible alias for TenantUser.
 * Used by getTenantMembers() - the raw junction table record.
 * @deprecated Use TenantUser instead
 */
export type { TenantUser as TenantUserMembership } from "@axis/db/schema";

// Re-export validation schema for backward compatibility
export { userRoleSchema } from "@axis/db/validation";

// ============================================================================
// User Query Functions (inject db client)
// ============================================================================

/**
 * Find user by email.
 */
export async function findUserByEmail(email: string) {
  return _findUserByEmail(getDb(), email);
}

/**
 * Find user by ID.
 */
export async function findUserById(id: string) {
  return _findUserById(getDb(), id);
}

/**
 * Find user by Neon Auth subject ID.
 */
export async function findUserByAuthSubject(authSubjectId: string) {
  return _findUserByAuthSubject(getDb(), authSubjectId);
}

/**
 * Create or update user from Neon Auth (upsert).
 */
export async function upsertUserFromAuth(data: {
  authSubjectId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}) {
  return _upsertUserFromAuth(getDb(), data);
}

/**
 * List all users with pagination (admin only).
 */
export async function listUsers(options?: {
  limit?: number;
  offset?: number;
}) {
  return _listUsers(getDb(), options);
}

// ============================================================================
// Tenant Membership Query Functions
// ============================================================================

/**
 * Get user's membership in a tenant.
 */
export async function getUserTenantMembership(userId: string, tenantId: string) {
  return _getUserTenantMembership(getDb(), userId, tenantId);
}

/**
 * Get user's tenants with role.
 */
export async function getUserTenants(userId: string) {
  return _getUserTenants(getDb(), userId);
}

/**
 * Get all members of a tenant.
 */
export async function getTenantMembers(tenantId: string) {
  return _getTenantMembers(getDb(), tenantId);
}

/**
 * Add user to tenant.
 */
export async function addUserToTenant(data: {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "member" | "viewer";
}) {
  return _addUserToTenant(getDb(), data);
}

/**
 * Remove user from tenant.
 */
export async function removeUserFromTenant(userId: string, tenantId: string) {
  return _removeUserFromTenant(getDb(), userId, tenantId);
}

/**
 * Get user's tenant count.
 */
export async function getUserTenantCount(userId: string) {
  return _getUserTenantCount(getDb(), userId);
}

/**
 * Verify user has access to tenant.
 */
export async function verifyTenantAccess(tenantId: string, userId: string) {
  return _verifyTenantAccess(getDb(), tenantId, userId);
}
