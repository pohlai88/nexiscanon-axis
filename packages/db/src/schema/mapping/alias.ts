/**
 * Alias Mapping Tables (C03)
 *
 * "Apple ≠ APPLE ≠ Apples Inc. → Resolved."
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import {
  type DuplicateResolutionStatus,
  type DuplicateGroupMember,
} from "@axis/registry/schemas";

// ============================================================================
// Duplicate Groups
// ============================================================================

export const duplicateGroups = pgTable(
  "mapping_duplicate_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Group type
    entityType: varchar("entity_type", { length: 20 }).notNull(), // "party" or "item"

    // Normalized form
    normalizedName: varchar("normalized_name", { length: 500 }).notNull(),

    // Members (JSONB)
    members: jsonb("members")
      .$type<DuplicateGroupMember[]>()
      .notNull()
      .default([]),

    // Machine suggestion
    suggestedCanonicalId: varchar("suggested_canonical_id", { length: 255 }).notNull(),
    suggestedCanonicalName: varchar("suggested_canonical_name", { length: 500 }).notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    reasoning: varchar("reasoning", { length: 2000 }),

    // Resolution
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending")
      .$type<DuplicateResolutionStatus>(),
    confirmedCanonicalId: varchar("confirmed_canonical_id", { length: 255 }),
    confirmedCanonicalName: varchar("confirmed_canonical_name", { length: 500 }),

    // Review trail
    resolvedBy: uuid("resolved_by"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: varchar("resolution_note", { length: 500 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_duplicate_groups_tenant").on(table.tenantId),
    index("idx_duplicate_groups_migration").on(table.migrationStateId),
    index("idx_duplicate_groups_status").on(table.status),
    index("idx_duplicate_groups_type").on(table.entityType),
  ]
);

export const duplicateGroupsRelations = relations(duplicateGroups, ({ one }) => ({
  tenant: one(tenants, {
    fields: [duplicateGroups.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [duplicateGroups.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type DuplicateGroupRow = typeof duplicateGroups.$inferSelect;
export type NewDuplicateGroupRow = typeof duplicateGroups.$inferInsert;

// ============================================================================
// Alias Mappings
// ============================================================================

export const aliasMappings = pgTable(
  "mapping_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Entity type
    entityType: varchar("entity_type", { length: 20 }).notNull(),

    // Source (the duplicate)
    sourceId: varchar("source_id", { length: 255 }).notNull(),
    sourceName: varchar("source_name", { length: 500 }).notNull(),
    sourceTable: varchar("source_table", { length: 255 }),

    // Canonical (the primary)
    canonicalId: varchar("canonical_id", { length: 255 }).notNull(),
    canonicalName: varchar("canonical_name", { length: 500 }).notNull(),

    // From duplicate group
    duplicateGroupId: uuid("duplicate_group_id").references(() => duplicateGroups.id),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_alias_mappings_tenant").on(table.tenantId),
    index("idx_alias_mappings_migration").on(table.migrationStateId),
    index("idx_alias_mappings_source").on(table.entityType, table.sourceId),
    index("idx_alias_mappings_canonical").on(table.entityType, table.canonicalId),
  ]
);

export const aliasMappingsRelations = relations(aliasMappings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [aliasMappings.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [aliasMappings.migrationStateId],
    references: [migrationStates.id],
  }),
  duplicateGroup: one(duplicateGroups, {
    fields: [aliasMappings.duplicateGroupId],
    references: [duplicateGroups.id],
  }),
}));

export type AliasMappingRow = typeof aliasMappings.$inferSelect;
export type NewAliasMappingRow = typeof aliasMappings.$inferInsert;
