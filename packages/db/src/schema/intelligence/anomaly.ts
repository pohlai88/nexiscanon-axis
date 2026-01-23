/**
 * Anomaly Table (B12)
 *
 * The Machine notices what's unusual.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type AnomalyType,
  type IntelAnomalyStatus,
  type AnomalySeverity,
  type AnomalyMetric,
  type AnomalyConfidence,
  type SuggestedAction,
} from "@axis/registry/schemas";

export const intelAnomalies = pgTable(
  "intel_anomalies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Classification
    anomalyType: varchar("anomaly_type", { length: 30 })
      .notNull()
      .$type<AnomalyType>(),
    severity: varchar("severity", { length: 20 })
      .notNull()
      .$type<AnomalySeverity>(),

    // Context
    domain: varchar("domain", { length: 50 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id"),

    // Detection
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
    detectionMethod: varchar("detection_method", { length: 100 }).notNull(),

    // Details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),

    // Evidence
    metrics: jsonb("metrics").$type<AnomalyMetric[]>().notNull().default([]),

    // Confidence
    confidence: jsonb("confidence").$type<AnomalyConfidence>().notNull(),

    // Machine Explanation
    explanation: text("explanation"),
    reasoning: text("reasoning"),

    // Suggested actions
    suggestedActions: jsonb("suggested_actions").$type<SuggestedAction[]>(),

    // Status
    status: varchar("status", { length: 30 })
      .notNull()
      .default("detected")
      .$type<IntelAnomalyStatus>(),

    // Resolution
    acknowledgedBy: uuid("acknowledged_by"),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    resolvedBy: uuid("resolved_by"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNote: text("resolution_note"),

    // Feedback
    feedback: varchar("feedback", { length: 30 }),
    feedbackNote: text("feedback_note"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_intel_anomaly_tenant").on(table.tenantId),
    index("idx_intel_anomaly_domain").on(table.tenantId, table.domain),
    index("idx_intel_anomaly_severity").on(table.tenantId, table.severity),
    index("idx_intel_anomaly_status").on(table.tenantId, table.status),
    index("idx_intel_anomaly_detected").on(table.tenantId, table.detectedAt),
    index("idx_intel_anomaly_entity").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
  ]
);

export const intelAnomaliesRelations = relations(intelAnomalies, ({ one }) => ({
  tenant: one(tenants, {
    fields: [intelAnomalies.tenantId],
    references: [tenants.id],
  }),
}));

export type IntelAnomalyRow = typeof intelAnomalies.$inferSelect;
export type NewIntelAnomalyRow = typeof intelAnomalies.$inferInsert;
