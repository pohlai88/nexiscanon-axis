/**
 * Database client for apps/web.
 *
 * Pattern:
 * - Uses @axis/db for Drizzle ORM client and types
 * - Provides backward-compatible raw query wrapper
 * - All types imported from @axis/db (single source of truth)
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createDbClient, type Database } from "@axis/db/client";

// Re-export types from @axis/db
export type { Database } from "@axis/db/client";
export type {
  Tenant,
  NewTenant,
  User,
  NewUser,
  TenantUser,
  NewTenantUser,
  Invitation,
  NewInvitation,
  ApiKey,
  NewApiKey,
  AuditLog,
  NewAuditLog,
} from "@axis/db/schema";

// Re-export validation schemas
export {
  insertTenantSchema,
  selectTenantSchema,
  createTenantFormSchema,
  insertUserSchema,
  selectUserSchema,
  updateProfileSchema,
  inviteMemberFormSchema,
  createApiKeyFormSchema,
  auditLogEntrySchema,
  userRoleSchema,
} from "@axis/db/validation";

// ============================================================================
// Database Client
// ============================================================================

let _db: Database | null = null;
let _rawClient: NeonQueryFunction<false, false> | null = null;

/**
 * Get the Drizzle database client.
 * Preferred method for type-safe queries.
 */
export function getDb(): Database {
  if (_db) {
    return _db;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  _db = createDbClient(databaseUrl);
  return _db;
}

/**
 * Get raw neon SQL client.
 * Use for complex queries not supported by Drizzle.
 *
 * @deprecated Prefer getDb() with Drizzle queries
 */
export function getRawDb(): NeonQueryFunction<false, false> {
  if (_rawClient) {
    return _rawClient;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  _rawClient = neon(databaseUrl);
  return _rawClient;
}

/**
 * Execute a raw query with error handling.
 * Backward-compatible wrapper for existing code.
 *
 * @deprecated Prefer getDb() with Drizzle queries
 */
export async function query<T>(
  queryFn: (sql: NeonQueryFunction<false, false>) => Promise<T>
): Promise<T> {
  const sql = getRawDb();
  return queryFn(sql);
}
