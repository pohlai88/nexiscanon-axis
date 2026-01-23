/**
 * AXIS Registry Codegen
 *
 * Generates derived artifacts from the Single Source of Truth:
 * - Drizzle schemas (from DrizzleMapping)
 * - SQL migrations (from DrizzleMapping)
 * - API validation (re-exports)
 *
 * Usage: pnpm --filter @axis/registry codegen
 */

export { generateDrizzleSchema } from "./drizzle-generator";
export { generateSqlMigration } from "./sql-generator";
export { validateSchemaSync } from "./validator";
