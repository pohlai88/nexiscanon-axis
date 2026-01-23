/**
 * Validation schemas for @axis/db.
 *
 * MIGRATION NOTE:
 * We are transitioning to Single Source of Truth pattern.
 * New code should import from @axis/registry/schemas.
 *
 * Pattern:
 * - @axis/registry/schemas = Single Source of Truth (Zod schemas)
 * - @axis/registry/types = Inferred types (z.infer<>)
 * - @axis/db/validation = Legacy + Drizzle-specific schemas
 *
 * Zod v4 Best Practices:
 * - Insert schemas use createCoercedInsertSchema (date coercion)
 * - Select schemas use strict createSelectSchema (no coercion)
 *
 * Usage:
 *   // Prefer registry for new code:
 *   import { documentRegistrySchema } from "@axis/registry/schemas";
 *   import type { Document } from "@axis/registry/types";
 *
 *   // Legacy (still supported):
 *   import { insertTenantSchema } from "@axis/db/validation";
 */

// Schema factory (Zod v4 with coercion)
export * from "./factory";

// Domain schemas (non-B1, stay here)
export * from "./tenant";
export * from "./user";
export * from "./api-key";
export * from "./audit-log";

// B1 — Posting Spine validation
// TODO: Migrate to re-export from @axis/registry/schemas
export * from "./posting-spine";
