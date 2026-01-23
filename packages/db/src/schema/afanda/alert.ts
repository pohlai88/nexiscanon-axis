/**
 * Alert Tables (B11)
 *
 * Alert rules and instances.
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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { kpis } from "./kpi";
import {
  type AlertSeverity,
  type AlertStatus,
  type AlertConditionType,
  type AfandaNotificationChannel,
} from "@axis/registry/schemas";

// ============================================================================
// Alert Rules Table
// ============================================================================

export const alertRules = pgTable(
  "afanda_alert_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Condition
    conditionType: varchar("condition_type", { length: 30 })
      .notNull()
      .$type<AlertConditionType>(),

    // For KPI threshold
    kpiId: uuid("kpi_id").references(() => kpis.id, { onDelete: "set null" }),
    thresholdOperator: varchar("threshold_operator", { length: 20 }),
    thresholdValue: numeric("threshold_value", { precision: 18, scale: 4 }),
    thresholdValue2: numeric("threshold_value2", { precision: 18, scale: 4 }),

    // For event
    eventType: varchar("event_type", { length: 100 }),
    eventCondition: jsonb("event_condition").$type<Record<string, unknown>>(),

    // For schedule
    cronExpression: varchar("cron_expression", { length: 100 }),

    // Alert configuration
    severity: varchar("severity", { length: 20 })
      .notNull()
      .default("warning")
      .$type<AlertSeverity>(),

    // Notification
    notifyRoles: jsonb("notify_roles").$type<string[]>(),
    notifyUsers: jsonb("notify_users").$type<string[]>(),
    notifyChannels: jsonb("notify_channels")
      .$type<AfandaNotificationChannel[]>()
      .default(["in_app"]),

    // Escalation
    escalateAfterMinutes: integer("escalate_after_minutes"),
    escalateTo: jsonb("escalate_to").$type<string[]>(),

    // Cooldown
    cooldownMinutes: integer("cooldown_minutes").notNull().default(60),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_afanda_alert_rule_tenant").on(table.tenantId),
    index("idx_afanda_alert_rule_type").on(table.tenantId, table.conditionType),
    index("idx_afanda_alert_rule_kpi").on(table.tenantId, table.kpiId),
    index("idx_afanda_alert_rule_active").on(table.tenantId, table.isActive),
  ]
);

export const alertRulesRelations = relations(alertRules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [alertRules.tenantId],
    references: [tenants.id],
  }),
  kpi: one(kpis, {
    fields: [alertRules.kpiId],
    references: [kpis.id],
  }),
}));

export type AlertRuleRow = typeof alertRules.$inferSelect;
export type NewAlertRuleRow = typeof alertRules.$inferInsert;

// ============================================================================
// Alert Instances Table
// ============================================================================

export const alertInstances = pgTable(
  "afanda_alert_instances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ruleId: uuid("rule_id")
      .notNull()
      .references(() => alertRules.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Alert details
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    severity: varchar("severity", { length: 20 })
      .notNull()
      .$type<AlertSeverity>(),

    // Context
    triggeredValue: numeric("triggered_value", { precision: 18, scale: 4 }),
    thresholdValue: numeric("threshold_value", { precision: 18, scale: 4 }),
    sourceType: varchar("source_type", { length: 50 }),
    sourceId: uuid("source_id"),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("active")
      .$type<AlertStatus>(),

    // Acknowledgment
    acknowledgedBy: uuid("acknowledged_by"),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    acknowledgmentNote: text("acknowledgment_note"),

    // Resolution
    resolvedBy: uuid("resolved_by"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"),

    // Snooze
    snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),

    firedAt: timestamp("fired_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_afanda_alert_inst_tenant").on(table.tenantId),
    index("idx_afanda_alert_inst_rule").on(table.ruleId),
    index("idx_afanda_alert_inst_status").on(table.tenantId, table.status),
    index("idx_afanda_alert_inst_severity").on(table.tenantId, table.severity),
    index("idx_afanda_alert_inst_fired").on(table.tenantId, table.firedAt),
    index("idx_afanda_alert_inst_active").on(
      table.tenantId,
      table.status,
      table.firedAt
    ),
  ]
);

export const alertInstancesRelations = relations(
  alertInstances,
  ({ one }) => ({
    rule: one(alertRules, {
      fields: [alertInstances.ruleId],
      references: [alertRules.id],
    }),
    tenant: one(tenants, {
      fields: [alertInstances.tenantId],
      references: [tenants.id],
    }),
  })
);

export type AlertInstanceRow = typeof alertInstances.$inferSelect;
export type NewAlertInstanceRow = typeof alertInstances.$inferInsert;
