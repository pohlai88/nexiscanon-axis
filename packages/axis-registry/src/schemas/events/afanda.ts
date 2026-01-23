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
    dashboardId: z.string().uuid(),
    name: z.string(),
    dashboardType: z.string(),
    createdBy: z.string().uuid(),
  })
);

export type DashboardCreatedEvent = z.infer<typeof dashboardCreatedEventSchema>;

export const dashboardViewedEventSchema = createEventSchema(
  "dashboard.viewed",
  z.object({
    dashboardId: z.string().uuid(),
    viewedBy: z.string().uuid(),
    duration: z.number().int().optional(),
  })
);

export type DashboardViewedEvent = z.infer<typeof dashboardViewedEventSchema>;

export const dashboardPublishedEventSchema = createEventSchema(
  "dashboard.published",
  z.object({
    dashboardId: z.string().uuid(),
    publishedBy: z.string().uuid(),
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
    alertId: z.string().uuid(),
    ruleId: z.string().uuid(),
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
    alertId: z.string().uuid(),
    acknowledgedBy: z.string().uuid(),
    note: z.string().optional(),
  })
);

export type AlertAcknowledgedEvent = z.infer<typeof alertAcknowledgedEventSchema>;

export const alertResolvedEventSchema = createEventSchema(
  "alert.resolved",
  z.object({
    alertId: z.string().uuid(),
    resolvedBy: z.string().uuid(),
    resolutionNote: z.string().optional(),
  })
);

export type AlertResolvedEvent = z.infer<typeof alertResolvedEventSchema>;

export const alertSnoozedEventSchema = createEventSchema(
  "alert.snoozed",
  z.object({
    alertId: z.string().uuid(),
    snoozedBy: z.string().uuid(),
    snoozedUntil: z.string().datetime(),
  })
);

export type AlertSnoozedEvent = z.infer<typeof alertSnoozedEventSchema>;

export const alertEscalatedEventSchema = createEventSchema(
  "alert.escalated",
  z.object({
    alertId: z.string().uuid(),
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
    reportId: z.string().uuid(),
    reportName: z.string(),
    format: z.enum(EXPORT_FORMAT),
    generatedBy: z.string().uuid(),
    recordCount: z.number().int(),
  })
);

export type ReportGeneratedEvent = z.infer<typeof reportGeneratedEventSchema>;

export const reportScheduledEventSchema = createEventSchema(
  "report.scheduled",
  z.object({
    reportId: z.string().uuid(),
    cronExpression: z.string(),
    recipients: z.array(z.string().email()),
    scheduledBy: z.string().uuid(),
  })
);

export type ReportScheduledEvent = z.infer<typeof reportScheduledEventSchema>;

export const reportDeliveredEventSchema = createEventSchema(
  "report.delivered",
  z.object({
    reportId: z.string().uuid(),
    recipients: z.array(z.string().email()),
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
