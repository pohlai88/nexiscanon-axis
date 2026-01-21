import { eq, and, sql } from "drizzle-orm";
import type { Database } from "./neon";
import { createDbClient } from "./neon";
import { tenantUsers } from "../schema/index";

/**
 * Tenant-scoped database client.
 * All queries are automatically filtered by tenant_id via RLS.
 */
export interface TenantScopedDb {
  /** The underlying Drizzle client */
  db: Database;

  /** Current tenant ID */
  tenantId: string;

  /** Current user ID */
  userId: string;

  /**
   * Execute a query with tenant context set.
   * Uses Postgres session variables for RLS.
   */
  query: Database["query"];
}

/**
 * Create a tenant-scoped database client.
 *
 * This sets Postgres session variables that RLS policies can reference:
 * - app.current_tenant_id
 * - app.current_user_id
 *
 * @example
 * ```ts
 * const scopedDb = await createTenantScopedClient({
 *   connectionString: process.env.DATABASE_URL!,
 *   tenantId: "uuid-here",
 *   userId: "uuid-here",
 * });
 *
 * // All queries are now scoped to this tenant
 * const items = await scopedDb.query.inventoryItems.findMany();
 * ```
 */
export async function createTenantScopedClient(options: {
  connectionString: string;
  tenantId: string;
  userId: string;
}): Promise<TenantScopedDb> {
  const { connectionString, tenantId, userId } = options;

  const db = createDbClient(connectionString);

  // Set session variables for RLS
  // Note: This works with Neon's HTTP driver
  // For pooled connections, use transaction-level settings
  await db.execute(sql`
    SET app.current_tenant_id = ${tenantId};
    SET app.current_user_id = ${userId};
  `);

  return {
    db,
    tenantId,
    userId,
    query: db.query,
  };
}

/**
 * Helper to run a callback with tenant context.
 *
 * @example
 * ```ts
 * const result = await withTenant(
 *   { tenantId, userId },
 *   async (scopedDb) => {
 *     return scopedDb.query.orders.findMany();
 *   }
 * );
 * ```
 */
export async function withTenant<T>(
  context: { tenantId: string; userId: string },
  callback: (scopedDb: TenantScopedDb) => Promise<T>
): Promise<T> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const scopedDb = await createTenantScopedClient({
    connectionString,
    ...context,
  });

  return callback(scopedDb);
}

/**
 * Verify user has access to tenant.
 * Call this before creating a scoped client.
 */
export async function verifyTenantAccess(
  db: Database,
  tenantId: string,
  userId: string
): Promise<{ hasAccess: boolean; role: string | null }> {
  const membership = await db.query.tenantUsers.findFirst({
    where: and(
      eq(tenantUsers.tenantId, tenantId),
      eq(tenantUsers.userId, userId)
    ),
  });

  if (!membership) {
    return { hasAccess: false, role: null };
  }

  return { hasAccess: true, role: membership.role };
}
