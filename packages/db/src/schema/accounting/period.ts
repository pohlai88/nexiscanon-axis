/**
 * Fiscal Period Table (B07)
 *
 * Period management and closing controls.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type PeriodStatus } from "@axis/registry/schemas";

export const fiscalPeriods = pgTable(
  "fiscal_periods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    fiscalYear: integer("fiscal_year").notNull(),
    periodNumber: integer("period_number").notNull(), // 1-13
    periodName: varchar("period_name", { length: 50 }).notNull(),

    // Date range
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("future")
      .$type<PeriodStatus>(),

    // Control flags
    isAdjustmentPeriod: boolean("is_adjustment_period")
      .notNull()
      .default(false),

    // Close tracking
    softClosedAt: timestamp("soft_closed_at", { withTimezone: true }),
    softClosedBy: uuid("soft_closed_by"),
    hardClosedAt: timestamp("hard_closed_at", { withTimezone: true }),
    hardClosedBy: uuid("hard_closed_by"),

    // Balances at close (snapshot)
    closingTrialBalance: jsonb("closing_trial_balance").$type<
      Record<string, string>
    >(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    uniqueIndex("uq_fiscal_periods_year_period").on(
      table.tenantId,
      table.fiscalYear,
      table.periodNumber
    ),
    index("idx_fiscal_periods_tenant").on(table.tenantId),
    index("idx_fiscal_periods_status").on(table.tenantId, table.status),
    index("idx_fiscal_periods_dates").on(
      table.tenantId,
      table.startDate,
      table.endDate
    ),
  ]
);

export const fiscalPeriodsRelations = relations(fiscalPeriods, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fiscalPeriods.tenantId],
    references: [tenants.id],
  }),
}));

export type FiscalPeriodRow = typeof fiscalPeriods.$inferSelect;
export type NewFiscalPeriodRow = typeof fiscalPeriods.$inferInsert;
