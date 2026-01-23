/**
 * @axis/db
 *
 * Database package for AXIS ERP.
 * Provides Drizzle ORM schemas, validation, queries, and tenant-scoped client.
 *
 * Single source of truth for:
 * - Database schema definitions (Drizzle)
 * - TypeScript types (inferred from schema)
 * - Validation schemas (Zod, generated from Drizzle)
 * - Query functions (Drizzle ORM)
 */

export * from "./schema/index";
export * from "./client/index";
export * from "./validation/index";
export * from "./queries/index";
export * from "./outbox/index";
