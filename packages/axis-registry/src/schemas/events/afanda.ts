/**
 * AFANDA Domain Events (B11)
 *
 * Events for Analytics, Finance, Actions, Notifications, Data, Alerts
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import { ALERT_SEVERITY, EXPORT_FORMAT } from "../afanda/constants";

// ============================================================================
// Dashboard Events
// ============================================================================

export const dashboardCreatedEventSchema = createEventSchema(
  "dashboard.created",
  z.object({
    dashboardId: z.uuid(),
    name: z.string(),
    dashboardType: z.string(),
    createdBy: z.uuid(),
  })
);

export type DashboardCreatedEvent = z.infer<typeof dashboardCreatedEventSchema>;

export const dashboardViewedEventSchema = createEventSchema(
  "dashboard.viewed",
  z.object({
    dashboardId: z.uuid(),
    viewedBy: z.uuid(),
    duration: z.number().int().optional(),
  })
);

export type DashboardViewedEvent = z.infer<typeof dashboardViewedEventSchema>;

export const dashboardPublishedEventSchema = createEventSchema(
  "dashboard.published",
  z.object({
    dashboardId: z.uuid(),
    publishedBy: z.uuid(),
    visibility: z.string(),
  })
);

export type DashboardPublishedEvent = z.infer<typeof dashboardPublishedEventSchema>;

// ============================================================================
// Alert Events
// ============================================================================

export const alertFiredEventSchema = createEventSchema(
  "alert.fired",
  z.object({
    alertId: z.uuid(),
    ruleId: z.uuid(),
    severity: z.enum(ALERT_SEVERITY),
    title: z.string(),
    triggeredValue: z.number().optional(),
    thresholdValue: z.number().optional(),
  })
);

export type AlertFiredEvent = z.infer<typeof alertFiredEventSchema>;

export const alertAcknowledgedEventSchema = createEventSchema(
  "alert.acknowledged",
  z.object({
    alertId: z.uuid(),
    acknowledgedBy: z.uuid(),
    note: z.string().optional(),
  })
);

export type AlertAcknowledgedEvent = z.infer<typeof alertAcknowledgedEventSchema>;

export const alertResolvedEventSchema = createEventSchema(
  "alert.resolved",
  z.object({
    alertId: z.uuid(),
    resolvedBy: z.uuid(),
    resolutionNote: z.string().optional(),
  })
);

export type AlertResolvedEvent = z.infer<typeof alertResolvedEventSchema>;

export const alertSnoozedEventSchema = createEventSchema(
  "alert.snoozed",
  z.object({
    alertId: z.uuid(),
    snoozedBy: z.uuid(),
    snoozedUntil: z.string().datetime(),
  })
);

export type AlertSnoozedEvent = z.infer<typeof alertSnoozedEventSchema>;

export const alertEscalatedEventSchema = createEventSchema(
  "alert.escalated",
  z.object({
    alertId: z.uuid(),
    escalatedTo: z.array(z.string()),
    reason: z.string(),
  })
);

export type AlertEscalatedEvent = z.infer<typeof alertEscalatedEventSchema>;

// ============================================================================
// KPI Events
// ============================================================================

export const kpiThresholdCrossedEventSchema = createEventSchema(
  "kpi.threshold_crossed",
  z.object({
    kpiCode: z.string(),
    kpiName: z.string(),
    previousValue: z.number(),
    currentValue: z.number(),
    threshold: z.number(),
    direction: z.enum(["above", "below"]),
  })
);

export type KpiThresholdCrossedEvent = z.infer<typeof kpiThresholdCrossedEventSchema>;

export const kpiCalculatedEventSchema = createEventSchema(
  "kpi.calculated",
  z.object({
    kpiCode: z.string(),
    value: z.number(),
    previousValue: z.number().optional(),
    changePercent: z.number().optional(),
  })
);

export type KpiCalculatedEvent = z.infer<typeof kpiCalculatedEventSchema>;

// ============================================================================
// Report Events
// ============================================================================

export const reportGeneratedEventSchema = createEventSchema(
  "report.generated",
  z.object({
    reportId: z.uuid(),
    reportName: z.string(),
    format: z.enum(EXPORT_FORMAT),
    generatedBy: z.uuid(),
    recordCount: z.number().int(),
  })
);

export type ReportGeneratedEvent = z.infer<typeof reportGeneratedEventSchema>;

export const reportScheduledEventSchema = createEventSchema(
  "report.scheduled",
  z.object({
    reportId: z.uuid(),
    cronExpression: z.string(),
    recipients: z.array(z.email()),
    scheduledBy: z.uuid(),
  })
);

export type ReportScheduledEvent = z.infer<typeof reportScheduledEventSchema>;

export const reportDeliveredEventSchema = createEventSchema(
  "report.delivered",
  z.object({
    reportId: z.uuid(),
    recipients: z.array(z.email()),
    format: z.enum(EXPORT_FORMAT),
  })
);

export type ReportDeliveredEvent = z.infer<typeof reportDeliveredEventSchema>;

// ============================================================================
// AFANDA Event Union
// ============================================================================

export const afandaEventSchema = z.union([
  dashboardCreatedEventSchema,
  dashboardViewedEventSchema,
  dashboardPublishedEventSchema,
  alertFiredEventSchema,
  alertAcknowledgedEventSchema,
  alertResolvedEventSchema,
  alertSnoozedEventSchema,
  alertEscalatedEventSchema,
  kpiThresholdCrossedEventSchema,
  kpiCalculatedEventSchema,
  reportGeneratedEventSchema,
  reportScheduledEventSchema,
  reportDeliveredEventSchema,
]);

export type AfandaEvent = z.infer<typeof afandaEventSchema>;
