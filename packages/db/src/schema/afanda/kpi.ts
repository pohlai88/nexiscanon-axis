/**
 * KPI Table (B11)
 *
 * Key Performance Indicator definitions.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  boolean,
  jsonb,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type KpiCategory, type KpiUnit, type KpiThresholds } from "@axis/registry/schemas";

export const kpis = pgTable(
  "afanda_kpis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Category
    category: varchar("category", { length: 30 })
      .notNull()
      .$type<KpiCategory>(),

    // Calculation
    formula: text("formula").notNull(),
    formulaType: varchar("formula_type", { length: 20 })
      .notNull()
      .default("expression"),

    // Dependencies
    dependsOn: jsonb("depends_on").$type<string[]>(),

    // Display
    unit: varchar("unit", { length: 20 })
      .notNull()
      .default("number")
      .$type<KpiUnit>(),
    customUnit: varchar("custom_unit", { length: 20 }),
    decimals: integer("decimals").notNull().default(2),
    invertColors: boolean("invert_colors").notNull().default(false),

    // Targets
    targetValue: numeric("target_value", { precision: 18, scale: 4 }),
    targetType: varchar("target_type", { length: 20 }),
    thresholds: jsonb("thresholds").$type<KpiThresholds>(),

    // Time
    periodType: varchar("period_type", { length: 20 })
      .notNull()
      .default("period_to_date"),
    rollingPeriodDays: integer("rolling_period_days"),

    // Caching
    cacheMinutes: integer("cache_minutes").notNull().default(5),
    lastCalculatedAt: timestamp("last_calculated_at", { withTimezone: true }),
    lastValue: numeric("last_value", { precision: 18, scale: 4 }),

    // Status
    isActive: boolean("is_active").notNull().default(true),
    isSystem: boolean("is_system").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_afanda_kpi_code").on(table.tenantId, table.code),
    index("idx_afanda_kpi_tenant").on(table.tenantId),
    index("idx_afanda_kpi_category").on(table.tenantId, table.category),
    index("idx_afanda_kpi_active").on(table.tenantId, table.isActive),
  ]
);

export const kpisRelations = relations(kpis, ({ one }) => ({
  tenant: one(tenants, {
    fields: [kpis.tenantId],
    references: [tenants.id],
  }),
}));

export type KpiRow = typeof kpis.$inferSelect;
export type NewKpiRow = typeof kpis.$inferInsert;
