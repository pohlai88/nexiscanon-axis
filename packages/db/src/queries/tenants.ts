/**
 * Tenant query functions using Drizzle ORM.
 *
 * All queries return typed data from Drizzle schema.
 * Input validation uses Zod schemas from @axis/db/validation.
 */

import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../client/neon";
import { tenants, type Tenant, type NewTenant, type TenantType, type TenantStatus } from "../schema/tenant";

/**
 * Tenant branding options (stored in settings JSONB).
 */
export interface TenantBranding {
  emoji?: string;
  logo?: string;
  brandColor?: string;
  description?: string;
}

/**
 * Extended tenant settings interface.
 */
export interface TenantSettingsExtended {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  branding?: TenantBranding;
  customDomain?: string;
  [key: string]: unknown;
}

// ============================================================================
// Read Queries
// ============================================================================

/**
 * Find tenant by slug.
 */
export async function findTenantBySlug(
  db: Database,
  slug: string
): Promise<Tenant | null> {
  const result = await db.query.tenants.findFirst({
    where: and(eq(tenants.slug, slug), eq(tenants.status, "active")),
  });
  return result ?? null;
}

/**
 * Find tenant by ID.
 */
export async function findTenantById(
  db: Database,
  id: string
): Promise<Tenant | null> {
  const result = await db.query.tenants.findFirst({
    where: eq(tenants.id, id),
  });
  return result ?? null;
}

/**
 * Find tenant by custom domain.
 */
export async function findTenantByDomain(
  db: Database,
  domain: string
): Promise<Tenant | null> {
  const result = await db
    .select()
    .from(tenants)
    .where(
      and(
        sql`${tenants.settings}->>'customDomain' = ${domain}`,
        eq(tenants.status, "active")
      )
    )
    .limit(1);
  return result[0] ?? null;
}

/**
 * Check if slug is available.
 */
export async function isSlugAvailable(
  db: Database,
  slug: string
): Promise<boolean> {
  const result = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
    columns: { id: true },
  });
  return result === undefined;
}

/**
 * List all tenants with pagination.
 */
export async function listTenants(
  db: Database,
  options?: {
    limit?: number;
    offset?: number;
    status?: TenantStatus;
    type?: TenantType;
    parentId?: string;
  }
): Promise<{ tenants: Tenant[]; total: number }> {
  const { limit = 50, offset = 0, status = "active" } = options ?? {};

  const [tenantsResult, countResult] = await Promise.all([
    db.query.tenants.findMany({
      where: eq(tenants.status, status),
      limit,
      offset,
      orderBy: (tenants, { desc }) => [desc(tenants.createdAt)],
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenants)
      .where(eq(tenants.status, status)),
  ]);

  return {
    tenants: tenantsResult,
    total: countResult[0]?.count ?? 0,
  };
}

/**
 * Get teams for an organization.
 */
export async function getTeamsForOrg(
  db: Database,
  orgId: string
): Promise<Tenant[]> {
  return db.query.tenants.findMany({
    where: and(
      eq(tenants.parentId, orgId),
      eq(tenants.type, "team"),
      eq(tenants.status, "active")
    ),
    orderBy: (tenants, { asc }) => [asc(tenants.name)],
  });
}

// ============================================================================
// Write Queries
// ============================================================================

/**
 * Create a new tenant.
 */
export async function createTenant(
  db: Database,
  data: {
    slug: string;
    name: string;
    type?: TenantType;
    parentId?: string | null;
    plan?: Tenant["plan"];
  }
): Promise<Tenant> {
  const insertData: NewTenant = {
    slug: data.slug,
    name: data.name,
    type: data.type ?? "organization",
    parentId: data.parentId ?? null,
    plan: data.plan ?? "free",
  };

  const result = await db.insert(tenants).values(insertData).returning();

  const tenant = result[0];
  if (!tenant) {
    throw new Error("Failed to create tenant");
  }

  return tenant;
}

/**
 * Create a team within an organization.
 */
export async function createTeam(
  db: Database,
  data: {
    slug: string;
    name: string;
    parentId: string;
  }
): Promise<Tenant> {
  return createTenant(db, {
    ...data,
    type: "team",
  });
}

/**
 * Create a personal workspace.
 */
export async function createPersonalWorkspace(
  db: Database,
  data: {
    slug: string;
    name: string;
  }
): Promise<Tenant> {
  return createTenant(db, {
    ...data,
    type: "personal",
  });
}

/**
 * Update tenant branding.
 */
export async function updateTenantBranding(
  db: Database,
  tenantId: string,
  branding: Partial<TenantBranding>
): Promise<Tenant | null> {
  const result = await db
    .update(tenants)
    .set({
      settings: sql`${tenants.settings} || ${JSON.stringify({ branding })}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning();

  return result[0] ?? null;
}

/**
 * Update tenant status.
 */
export async function updateTenantStatus(
  db: Database,
  tenantId: string,
  status: TenantStatus
): Promise<Tenant | null> {
  const result = await db
    .update(tenants)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete tenant (soft delete by setting status to 'deleted').
 */
export async function deleteTenant(
  db: Database,
  tenantId: string
): Promise<boolean> {
  const result = await db
    .update(tenants)
    .set({
      status: "deleted",
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning({ id: tenants.id });

  return result.length > 0;
}
