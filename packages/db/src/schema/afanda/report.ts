/**
 * Report Table (B11)
 *
 * Report definitions.
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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type ReportType,
  type DashboardVisibility,
  type ReportDataSource,
  type ReportParameter,
  type ReportColumn,
  type ReportSort,
  type ReportSchedule,
} from "@axis/registry/schemas";

export const reportDefinitions = pgTable(
  "afanda_report_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),

    // Type
    reportType: varchar("report_type", { length: 30 })
      .notNull()
      .$type<ReportType>(),

    // Data source
    dataSource: jsonb("data_source").$type<ReportDataSource>().notNull(),

    // Parameters
    parameters: jsonb("parameters").$type<ReportParameter[]>(),

    // Columns (for tabular/summary)
    columns: jsonb("columns").$type<ReportColumn[]>(),

    // Grouping
    groupBy: jsonb("group_by").$type<string[]>(),
    sortBy: jsonb("sort_by").$type<ReportSort[]>(),

    // Chart config (for chart type)
    chartConfig: jsonb("chart_config").$type<Record<string, unknown>>(),

    // Scheduling
    scheduleEnabled: boolean("schedule_enabled").notNull().default(false),
    scheduleConfig: jsonb("schedule_config").$type<ReportSchedule>(),

    // Access control
    visibility: varchar("visibility", { length: 20 })
      .notNull()
      .default("private")
      .$type<DashboardVisibility>(),
    allowedRoles: jsonb("allowed_roles").$type<string[]>(),

    // Status
    isSystem: boolean("is_system").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    uniqueIndex("uq_afanda_report_code").on(table.tenantId, table.code),
    index("idx_afanda_report_tenant").on(table.tenantId),
    index("idx_afanda_report_type").on(table.tenantId, table.reportType),
    index("idx_afanda_report_category").on(table.tenantId, table.category),
    index("idx_afanda_report_scheduled").on(table.tenantId, table.scheduleEnabled),
  ]
);

export const reportDefinitionsRelations = relations(
  reportDefinitions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [reportDefinitions.tenantId],
      references: [tenants.id],
    }),
  })
);

export type ReportDefinitionRow = typeof reportDefinitions.$inferSelect;
export type NewReportDefinitionRow = typeof reportDefinitions.$inferInsert;
