/**
 * @axis/db
 *
 * Database package for AXIS ERP.
 * Provides Drizzle ORM schemas, validation, and tenant-scoped client.
 *
 * Single source of truth for:
 * - Database schema definitions (Drizzle)
 * - TypeScript types (inferred from schema)
 * - Validation schemas (Zod, generated from Drizzle)
 */

export * from "./schema/index";
export * from "./client/index";
export * from "./validation/index";
