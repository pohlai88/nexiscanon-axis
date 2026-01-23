/**
 * @axis/registry - MetadataLite Registry
 *
 * Single Source of Truth for all AXIS schema definitions.
 *
 * Pattern derived from shadcn registry schema:
 * - Discriminated unions by entity type
 * - Common + Extension schema composition
 * - Self-describing schemas with $schema field
 * - Dependency tracking for posting order
 *
 * Usage:
 *   import { schemas } from "@axis/registry";
 *   import type { Document, EconomicEvent } from "@axis/registry/types";
 */

export * from "./schemas";
export * from "./types";
