/**
 * Tax Code Mapping Tables (C03)
 *
 * "The Machine offers jurisdiction and rate suggestions."
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  numeric,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { migrationStates } from "../migration/state";
import { type StudioMappingStatus, type TaxType } from "@axis/registry/schemas";

export const taxCodeMappings = pgTable(
  "mapping_tax_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    migrationStateId: uuid("migration_state_id")
      .notNull()
      .references(() => migrationStates.id, { onDelete: "cascade" }),

    // Source tax code
    sourceCode: varchar("source_code", { length: 100 }).notNull(),
    sourceName: varchar("source_name", { length: 255 }).notNull(),
    sourceRate: numeric("source_rate", { precision: 10, scale: 4 }).notNull(),

    // Machine analysis
    suggestedTaxType: varchar("suggested_tax_type", { length: 50 })
      .notNull()
      .$type<TaxType>(),
    suggestedRate: numeric("suggested_rate", { precision: 10, scale: 4 }).notNull(),
    suggestedJurisdiction: varchar("suggested_jurisdiction", { length: 100 }),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    reasoning: varchar("reasoning", { length: 2000 }),

    // Alternatives (JSONB)
    alternatives: jsonb("alternatives")
      .$type<{ taxType: TaxType; confidence: number }[]>()
      .notNull()
      .default([]),

    // Confirmed mapping
    confirmedTaxType: varchar("confirmed_tax_type", { length: 50 }).$type<TaxType>(),
    confirmedRate: numeric("confirmed_rate", { precision: 10, scale: 4 }),
    confirmedJurisdiction: varchar("confirmed_jurisdiction", { length: 100 }),

    // Target AXIS tax code
    targetTaxCodeId: uuid("target_tax_code_id"),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("pending_review")
      .$type<StudioMappingStatus>(),

    // Validation
    rateMatches: boolean("rate_matches"),
    rateDiscrepancy: numeric("rate_discrepancy", { precision: 10, scale: 4 }),

    // Review trail
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: varchar("review_note", { length: 500 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_tax_mappings_tenant").on(table.tenantId),
    index("idx_tax_mappings_migration").on(table.migrationStateId),
    index("idx_tax_mappings_status").on(table.status),
    index("idx_tax_mappings_code").on(table.migrationStateId, table.sourceCode),
  ]
);

export const taxCodeMappingsRelations = relations(taxCodeMappings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [taxCodeMappings.tenantId],
    references: [tenants.id],
  }),
  migrationState: one(migrationStates, {
    fields: [taxCodeMappings.migrationStateId],
    references: [migrationStates.id],
  }),
}));

export type TaxCodeMappingRow = typeof taxCodeMappings.$inferSelect;
export type NewTaxCodeMappingRow = typeof taxCodeMappings.$inferInsert;
