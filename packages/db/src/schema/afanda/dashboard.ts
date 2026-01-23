/**
 * Dashboard Tables (B11)
 *
 * Dashboard definitions and layouts.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type DashboardType,
  type DashboardVisibility,
  type DashboardLayout,
  type TimePeriod,
  type RefreshFrequency,
  type WidgetPosition,
} from "@axis/registry/schemas";

// ============================================================================
// Dashboards Table
// ============================================================================

export const dashboards = pgTable(
  "afanda_dashboards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 100 }).notNull(),

    // Type
    dashboardType: varchar("dashboard_type", { length: 30 })
      .notNull()
      .$type<DashboardType>(),

    // Access control
    visibility: varchar("visibility", { length: 20 })
      .notNull()
      .default("private")
      .$type<DashboardVisibility>(),
    allowedRoles: jsonb("allowed_roles").$type<string[]>(),
    ownerId: uuid("owner_id").notNull(),

    // Layout
    layout: varchar("layout", { length: 20 })
      .notNull()
      .default("grid")
      .$type<DashboardLayout>(),
    columns: integer("columns").notNull().default(12),
    rowHeight: integer("row_height").notNull().default(100),

    // Default filters
    defaultPeriod: varchar("default_period", { length: 20 })
      .notNull()
      .default("this_month")
      .$type<TimePeriod>(),
    defaultFilters: jsonb("default_filters").$type<Record<string, unknown>>(),

    // Refresh
    refreshFrequency: varchar("refresh_frequency", { length: 20 })
      .notNull()
      .default("5_minutes")
      .$type<RefreshFrequency>(),
    lastRefreshedAt: timestamp("last_refreshed_at", { withTimezone: true }),

    // Status
    isDefault: boolean("is_default").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(false),

    // Versioning
    version: integer("version").notNull().default(1),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    uniqueIndex("uq_afanda_dash_slug").on(table.tenantId, table.slug),
    index("idx_afanda_dash_tenant").on(table.tenantId),
    index("idx_afanda_dash_type").on(table.tenantId, table.dashboardType),
    index("idx_afanda_dash_owner").on(table.tenantId, table.ownerId),
    index("idx_afanda_dash_published").on(table.tenantId, table.isPublished),
  ]
);

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  tenant: one(tenants, {
    fields: [dashboards.tenantId],
    references: [tenants.id],
  }),
}));

export type DashboardRow = typeof dashboards.$inferSelect;
export type NewDashboardRow = typeof dashboards.$inferInsert;

// ============================================================================
// Dashboard Layouts Table
// ============================================================================

export const dashboardLayouts = pgTable(
  "afanda_dashboard_layouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dashboardId: uuid("dashboard_id")
      .notNull()
      .unique()
      .references(() => dashboards.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Widget positions
    widgets: jsonb("widgets").$type<WidgetPosition[]>().notNull().default([]),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_afanda_layout_dashboard").on(table.dashboardId),
  ]
);

export const dashboardLayoutsRelations = relations(
  dashboardLayouts,
  ({ one }) => ({
    dashboard: one(dashboards, {
      fields: [dashboardLayouts.dashboardId],
      references: [dashboards.id],
    }),
    tenant: one(tenants, {
      fields: [dashboardLayouts.tenantId],
      references: [tenants.id],
    }),
  })
);

export type DashboardLayoutRow = typeof dashboardLayouts.$inferSelect;
export type NewDashboardLayoutRow = typeof dashboardLayouts.$inferInsert;
