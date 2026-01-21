/**
 * Tenant utilities.
 * 
 * Pattern: Re-export from db/tenants + request context helpers.
 */

import { headers } from "next/headers";
import { findTenantBySlug, type Tenant } from "./db/tenants";

// Re-export types and functions
export type { Tenant } from "./db/tenants";
export { findTenantBySlug, findTenantById, createTenant, isSlugAvailable } from "./db/tenants";

/**
 * Get tenant slug from request headers.
 * Set by middleware via x-tenant-slug header.
 */
export async function getTenantSlug(): Promise<string | null> {
  const headerStore = await headers();
  return headerStore.get("x-tenant-slug");
}

/**
 * Get current tenant from request context.
 * Combines header lookup with database validation.
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  const slug = await getTenantSlug();
  
  if (!slug) {
    return null;
  }

  return findTenantBySlug(slug);
}

// Alias for backward compatibility
export const getTenantBySlug = findTenantBySlug;
