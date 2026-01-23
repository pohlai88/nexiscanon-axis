/**
 * Forecast Table (B12)
 *
 * The Machine anticipates what's coming.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type ForecastType,
  type ForecastMethod,
  type ForecastGranularity,
  type ForecastPrediction,
  type ForecastConfidence,
  type BacktestResults,
  type ForecastInsight,
} from "@axis/registry/schemas";

export const intelForecasts = pgTable(
  "intel_forecasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Type
    forecastType: varchar("forecast_type", { length: 30 })
      .notNull()
      .$type<ForecastType>(),

    // Target
    targetEntity: varchar("target_entity", { length: 100 }),
    targetEntityId: uuid("target_entity_id"),

    // Time parameters
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    granularity: varchar("granularity", { length: 20 })
      .notNull()
      .$type<ForecastGranularity>(),
    horizon: integer("horizon").notNull(),

    // Method
    method: varchar("method", { length: 30 })
      .notNull()
      .$type<ForecastMethod>(),
    modelVersion: varchar("model_version", { length: 50 }),

    // Results
    predictions: jsonb("predictions")
      .$type<ForecastPrediction[]>()
      .notNull()
      .default([]),

    // Confidence
    confidence: jsonb("confidence").$type<ForecastConfidence>().notNull(),

    // Historical performance
    backtestResults: jsonb("backtest_results").$type<BacktestResults>(),

    // Machine Insights
    insights: jsonb("insights").$type<ForecastInsight[]>(),

    // Status
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    error: text("error"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    index("idx_intel_forecast_tenant").on(table.tenantId),
    index("idx_intel_forecast_type").on(table.tenantId, table.forecastType),
    index("idx_intel_forecast_target").on(
      table.tenantId,
      table.targetEntity,
      table.targetEntityId
    ),
    index("idx_intel_forecast_status").on(table.tenantId, table.status),
    index("idx_intel_forecast_created").on(table.tenantId, table.createdAt),
  ]
);

export const intelForecastsRelations = relations(intelForecasts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [intelForecasts.tenantId],
    references: [tenants.id],
  }),
}));

export type IntelForecastRow = typeof intelForecasts.$inferSelect;
export type NewIntelForecastRow = typeof intelForecasts.$inferInsert;
