/**
 * Centralized Drizzle query functions.
 *
 * Pattern: All database queries go through this layer.
 * - Input validation via Zod (from @axis/db/validation)
 * - Type-safe Drizzle ORM queries
 * - Single source of truth for query logic
 *
 * Usage:
 *   import { findTenantBySlug, createTenant } from "@axis/db/queries";
 *   import { searchEmbeddings, insertEmbedding } from "@axis/db/queries";
 */

export * from "./tenants";
export * from "./users";
export * from "./embeddings";

// B1 — Posting Spine queries
export * from "./posting";
