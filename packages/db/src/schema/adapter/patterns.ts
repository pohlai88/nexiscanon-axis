/**
 * Column Pattern Tables (C02)
 *
 * Reusable patterns for The Machine's analysis.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { type SemanticCategory } from "@axis/registry/schemas";

// ============================================================================
// Column Patterns
// ============================================================================

export const columnPatterns = pgTable(
  "adapter_column_patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Pattern definition
    category: varchar("category", { length: 100 })
      .notNull()
      .$type<SemanticCategory>(),
    pattern: varchar("pattern", { length: 500 }).notNull(), // Regex pattern
    source: varchar("source", { length: 100 }), // e.g., "SAP", "QuickBooks", "Generic"
    description: varchar("description", { length: 500 }),

    // Confidence
    confidence: numeric("confidence", { precision: 5, scale: 4 })
      .notNull()
      .default("0.7"),

    // Status
    isBuiltIn: boolean("is_built_in").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_column_patterns_category").on(table.category),
    index("idx_column_patterns_source").on(table.source),
    index("idx_column_patterns_active").on(table.isActive),
  ]
);

export type ColumnPatternRow = typeof columnPatterns.$inferSelect;
export type NewColumnPatternRow = typeof columnPatterns.$inferInsert;
