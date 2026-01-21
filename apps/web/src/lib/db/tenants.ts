/**
 * Tenant database queries.
 *
 * Pattern: All tenant-related DB operations go here.
 *
 * Note: Using local type until Drizzle schema is synced with SQL schema.
 * The SQL schema uses `settings JSONB` which differs from Drizzle's `metadata text`.
 */

import { query } from "./index";

/**
 * Tenant settings stored as JSONB in database.
 */
export interface TenantSettings {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  [key: string]: unknown;
}

/**
 * Tenant type matching the actual SQL schema.
 * TODO: Sync with @axis/db schema using `drizzle-kit introspect`
 */
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: "active" | "suspended" | "pending" | "deleted";
  plan: "free" | "starter" | "professional" | "enterprise";
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Map database row to Tenant type.
 */
function mapRowToTenant(row: Record<string, unknown>): Tenant {
  // Parse settings from JSONB (may be string or object depending on driver)
  let settings: TenantSettings = {};
  if (row.settings) {
    settings = typeof row.settings === "string"
      ? JSON.parse(row.settings)
      : row.settings as TenantSettings;
  }

  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    status: row.status as Tenant["status"],
    plan: row.plan as Tenant["plan"],
    settings,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/**
 * Find tenant by slug.
 */
export async function findTenantBySlug(slug: string): Promise<Tenant | null> {
  const result = await query(async (sql) => {
    return sql`
      SELECT id, slug, name, status, plan, settings, created_at, updated_at
      FROM tenants
      WHERE slug = ${slug} AND status = 'active'
      LIMIT 1
    `;
  });

  const row = result[0];
  return row ? mapRowToTenant(row) : null;
}

/**
 * Find tenant by ID.
 */
export async function findTenantById(id: string): Promise<Tenant | null> {
  const result = await query(async (sql) => {
    return sql`
      SELECT id, slug, name, status, plan, settings, created_at, updated_at
      FROM tenants
      WHERE id = ${id}::uuid
      LIMIT 1
    `;
  });

  const row = result[0];
  return row ? mapRowToTenant(row) : null;
}

/**
 * Create a new tenant.
 */
export async function createTenant(data: {
  slug: string;
  name: string;
  plan?: Tenant["plan"];
}): Promise<Tenant> {
  const result = await query(async (sql) => {
    return sql`
      INSERT INTO tenants (slug, name, plan)
      VALUES (${data.slug}, ${data.name}, ${data.plan ?? "free"})
      RETURNING id, slug, name, status, plan, settings, created_at, updated_at
    `;
  });

  const row = result[0];
  if (!row) {
    throw new Error("Failed to create tenant");
  }

  return mapRowToTenant(row);
}

/**
 * Check if slug is available.
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const result = await query(async (sql) => {
    return sql`
      SELECT 1 FROM tenants WHERE slug = ${slug} LIMIT 1
    `;
  });

  return result.length === 0;
}
