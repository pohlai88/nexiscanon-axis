/**
 * Validation schemas generated from Drizzle ORM schemas.
 *
 * Pattern: Single source of truth - Drizzle schema → Zod validation
 *
 * Usage:
 *   import { insertTenantSchema, selectTenantSchema } from "@axis/db/validation";
 *
 *   // Validate API input
 *   const validated = insertTenantSchema.parse(requestBody);
 *
 *   // Type-safe insert
 *   await db.insert(tenants).values(validated);
 */

export * from "./tenant";
export * from "./user";
export * from "./api-key";
export * from "./audit-log";
