/**
 * Semantic Analysis Tables (C02)
 *
 * "The Machine notices what columns mean."
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { sourceSchemas } from "./source";
import {
  type SemanticCategory,
  type TableDomain,
  type AnalysisStatus,
  type AnalysisFactor,
  type AlternativeClassification,
  CONFIDENCE_LEVEL,
} from "@axis/registry/schemas";

// ============================================================================
// Column Semantics
// ============================================================================

export const columnSemantics = pgTable(
  "adapter_column_semantics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sourceSchemaId: uuid("source_schema_id")
      .notNull()
      .references(() => sourceSchemas.id, { onDelete: "cascade" }),

    // Source reference
    sourceTable: varchar("source_table", { length: 255 }).notNull(),
    sourceColumn: varchar("source_column", { length: 255 }).notNull(),

    // Semantic classification
    semanticCategory: varchar("semantic_category", { length: 100 })
      .notNull()
      .default("unknown")
      .$type<SemanticCategory>(),
    confidence: numeric("confidence", { precision: 5, scale: 4 })
      .notNull()
      .default("0"),
    confidenceLevel: varchar("confidence_level", { length: 20 })
      .notNull()
      .default("uncertain")
      .$type<(typeof CONFIDENCE_LEVEL)[number]>(),

    // Analysis factors (JSONB)
    factors: jsonb("factors").$type<AnalysisFactor[]>().notNull().default([]),
    reasoning: varchar("reasoning", { length: 2000 }),

    // Alternatives (JSONB)
    alternatives: jsonb("alternatives")
      .$type<AlternativeClassification[]>()
      .notNull()
      .default([]),

    // Mapping target
    axisEntity: varchar("axis_entity", { length: 100 }),
    axisField: varchar("axis_field", { length: 100 }),
    axisSchema: varchar("axis_schema", { length: 100 }),

    // Transform hint
    transformHint: varchar("transform_hint", { length: 255 }),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending")
      .$type<AnalysisStatus>(),
    isConfirmed: boolean("is_confirmed").notNull().default(false),
    confirmedBy: uuid("confirmed_by"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    analyzedAt: timestamp("analyzed_at", { withTimezone: true }),
    analyzedBy: varchar("analyzed_by", { length: 100 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_column_semantics_tenant").on(table.tenantId),
    index("idx_column_semantics_source").on(table.sourceSchemaId),
    index("idx_column_semantics_table").on(table.sourceSchemaId, table.sourceTable),
    index("idx_column_semantics_category").on(table.semanticCategory),
    index("idx_column_semantics_confirmed").on(table.tenantId, table.isConfirmed),
  ]
);

export const columnSemanticsRelations = relations(columnSemantics, ({ one }) => ({
  tenant: one(tenants, {
    fields: [columnSemantics.tenantId],
    references: [tenants.id],
  }),
  sourceSchema: one(sourceSchemas, {
    fields: [columnSemantics.sourceSchemaId],
    references: [sourceSchemas.id],
  }),
}));

export type ColumnSemanticRow = typeof columnSemantics.$inferSelect;
export type NewColumnSemanticRow = typeof columnSemantics.$inferInsert;

// ============================================================================
// Table Contexts
// ============================================================================

export const tableContexts = pgTable(
  "adapter_table_contexts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sourceSchemaId: uuid("source_schema_id")
      .notNull()
      .references(() => sourceSchemas.id, { onDelete: "cascade" }),

    // Table reference
    tableName: varchar("table_name", { length: 255 }).notNull(),

    // Domain classification
    likelyDomain: varchar("likely_domain", { length: 50 })
      .notNull()
      .default("unknown")
      .$type<TableDomain>(),
    confidence: numeric("confidence", { precision: 5, scale: 4 })
      .notNull()
      .default("0"),
    reasoning: varchar("reasoning", { length: 2000 }),

    // Alternatives (JSONB)
    alternatives: jsonb("alternatives")
      .$type<{ domain: TableDomain; confidence: number }[]>()
      .notNull()
      .default([]),

    // Status
    isConfirmed: boolean("is_confirmed").notNull().default(false),
    confirmedBy: uuid("confirmed_by"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    analyzedAt: timestamp("analyzed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_table_contexts_tenant").on(table.tenantId),
    index("idx_table_contexts_source").on(table.sourceSchemaId),
    index("idx_table_contexts_domain").on(table.likelyDomain),
  ]
);

export const tableContextsRelations = relations(tableContexts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tableContexts.tenantId],
    references: [tenants.id],
  }),
  sourceSchema: one(sourceSchemas, {
    fields: [tableContexts.sourceSchemaId],
    references: [sourceSchemas.id],
  }),
}));

export type TableContextRow = typeof tableContexts.$inferSelect;
export type NewTableContextRow = typeof tableContexts.$inferInsert;

// ============================================================================
// Semantic Analysis Jobs
// ============================================================================

export const semanticAnalysisJobs = pgTable(
  "adapter_semantic_analysis_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    sourceSchemaId: uuid("source_schema_id")
      .notNull()
      .references(() => sourceSchemas.id, { onDelete: "cascade" }),

    // Job status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending")
      .$type<AnalysisStatus>(),

    // Progress
    totalTables: integer("total_tables").notNull().default(0),
    analyzedTables: integer("analyzed_tables").notNull().default(0),
    totalColumns: integer("total_columns").notNull().default(0),
    analyzedColumns: integer("analyzed_columns").notNull().default(0),

    // Results
    highConfidenceCount: integer("high_confidence_count").notNull().default(0),
    mediumConfidenceCount: integer("medium_confidence_count").notNull().default(0),
    lowConfidenceCount: integer("low_confidence_count").notNull().default(0),
    unknownCount: integer("unknown_count").notNull().default(0),

    // Timing
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),

    // Errors
    error: varchar("error", { length: 2000 }),
    warnings: jsonb("warnings").$type<string[]>().notNull().default([]),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_semantic_jobs_tenant").on(table.tenantId),
    index("idx_semantic_jobs_source").on(table.sourceSchemaId),
    index("idx_semantic_jobs_status").on(table.status),
  ]
);

export const semanticAnalysisJobsRelations = relations(
  semanticAnalysisJobs,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [semanticAnalysisJobs.tenantId],
      references: [tenants.id],
    }),
    sourceSchema: one(sourceSchemas, {
      fields: [semanticAnalysisJobs.sourceSchemaId],
      references: [sourceSchemas.id],
    }),
  })
);

export type SemanticAnalysisJobRow = typeof semanticAnalysisJobs.$inferSelect;
export type NewSemanticAnalysisJobRow = typeof semanticAnalysisJobs.$inferInsert;
