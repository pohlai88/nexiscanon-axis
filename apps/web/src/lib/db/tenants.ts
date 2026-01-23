/**
 * Tenant database queries.
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
  findTenantBySlug as _findTenantBySlug,
  findTenantById as _findTenantById,
  findTenantByDomain as _findTenantByDomain,
  isSlugAvailable as _isSlugAvailable,
  listTenants as _listTenants,
  getTeamsForOrg as _getTeamsForOrg,
  createTenant as _createTenant,
  createTeam as _createTeam,
  createPersonalWorkspace as _createPersonalWorkspace,
  updateTenantBranding as _updateTenantBranding,
  type TenantBranding,
} from "@axis/db/queries";

// Re-export types from @axis/db (single source of truth)
export type { Tenant, NewTenant, TenantType, TenantStatus, SubscriptionPlan } from "@axis/db/schema";
export type { TenantBranding } from "@axis/db/queries";

// Backward-compatible type alias
export type TenantSettings = {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  branding?: TenantBranding;
  customDomain?: string;
  [key: string]: unknown;
};

// ============================================================================
// Query Functions (inject db client)
// ============================================================================

/**
 * Find tenant by slug.
 */
export async function findTenantBySlug(slug: string) {
  return _findTenantBySlug(getDb(), slug);
}

/**
 * Find tenant by ID.
 */
export async function findTenantById(id: string) {
  return _findTenantById(getDb(), id);
}

/**
 * Find tenant by custom domain.
 */
export async function findTenantByDomain(domain: string) {
  return _findTenantByDomain(getDb(), domain);
}

/**
 * Check if slug is available.
 */
export async function isSlugAvailable(slug: string) {
  return _isSlugAvailable(getDb(), slug);
}

/**
 * List all tenants with pagination.
 */
export async function listTenants(options?: {
  limit?: number;
  offset?: number;
  status?: "active" | "suspended" | "pending" | "deleted";
  type?: "organization" | "team" | "personal";
  parentId?: string;
}) {
  return _listTenants(getDb(), options);
}

/**
 * Get teams for an organization.
 */
export async function getTeamsForOrg(orgId: string) {
  return _getTeamsForOrg(getDb(), orgId);
}

/**
 * Create a new tenant.
 */
export async function createTenant(data: {
  slug: string;
  name: string;
  type?: "organization" | "team" | "personal";
  parentId?: string | null;
  plan?: "free" | "starter" | "professional" | "enterprise";
}) {
  return _createTenant(getDb(), data);
}

/**
 * Create a team within an organization.
 */
export async function createTeam(data: {
  slug: string;
  name: string;
  parentId: string;
}) {
  return _createTeam(getDb(), data);
}

/**
 * Create a personal workspace.
 */
export async function createPersonalWorkspace(data: {
  slug: string;
  name: string;
}) {
  return _createPersonalWorkspace(getDb(), data);
}

/**
 * Update tenant branding.
 */
export async function updateTenantBranding(
  tenantId: string,
  branding: Partial<TenantBranding>
) {
  return _updateTenantBranding(getDb(), tenantId, branding);
}
