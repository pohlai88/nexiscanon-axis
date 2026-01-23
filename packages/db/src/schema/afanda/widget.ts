/**
 * Widget Table (B11)
 *
 * Dashboard widget definitions.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type WidgetType,
  type RefreshFrequency,
  type WidgetDataSource,
  type WidgetFilter,
  type WidgetAggregation,
  type WidgetDrillDownConfig,
} from "@axis/registry/schemas";

export const widgets = pgTable(
  "afanda_widgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Type
    widgetType: varchar("widget_type", { length: 30 })
      .notNull()
      .$type<WidgetType>(),

    // Data source
    dataSource: jsonb("data_source").$type<WidgetDataSource>().notNull(),

    // Filters (widget-level)
    filters: jsonb("filters").$type<WidgetFilter[]>(),

    // Aggregation
    aggregation: jsonb("aggregation").$type<WidgetAggregation>(),

    // Visualization config (widget-type-specific)
    config: jsonb("config").$type<Record<string, unknown>>().notNull(),

    // Theming
    colorScheme: varchar("color_scheme", { length: 50 }),

    // Interactivity
    drillDownEnabled: boolean("drill_down_enabled").notNull().default(false),
    drillDownConfig: jsonb("drill_down_config").$type<WidgetDrillDownConfig>(),

    // Refresh
    refreshFrequency: varchar("refresh_frequency", { length: 20 }).$type<RefreshFrequency>(),

    // Reusable
    isTemplate: boolean("is_template").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_afanda_widget_tenant").on(table.tenantId),
    index("idx_afanda_widget_type").on(table.tenantId, table.widgetType),
    index("idx_afanda_widget_template").on(table.tenantId, table.isTemplate),
  ]
);

export const widgetsRelations = relations(widgets, ({ one }) => ({
  tenant: one(tenants, {
    fields: [widgets.tenantId],
    references: [tenants.id],
  }),
}));

export type WidgetRow = typeof widgets.$inferSelect;
export type NewWidgetRow = typeof widgets.$inferInsert;
