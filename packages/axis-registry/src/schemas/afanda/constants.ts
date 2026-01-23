/**
 * AFANDA Domain Constants (B11)
 *
 * Analytics, Finance, Actions, Notifications, Data, Alerts
 */

// ============================================================================
// Dashboard Types
// ============================================================================

export const DASHBOARD_TYPE = [
  "executive",
  "operational",
  "financial",
  "departmental",
  "custom",
] as const;

export type DashboardType = (typeof DASHBOARD_TYPE)[number];

// ============================================================================
// Widget Types
// ============================================================================

export const WIDGET_TYPE = [
  // Metrics
  "metric_card",
  "metric_group",
  "scorecard",

  // Charts
  "line_chart",
  "bar_chart",
  "pie_chart",
  "area_chart",
  "combo_chart",
  "gauge",
  "funnel",
  "heatmap",

  // Tables
  "data_table",
  "pivot_table",
  "comparison_table",

  // Lists
  "task_list",
  "alert_list",
  "activity_feed",
  "top_n_list",

  // Special
  "map",
  "calendar",
  "timeline",
  "ai_insight",
] as const;

export type WidgetType = (typeof WIDGET_TYPE)[number];

// ============================================================================
// Refresh Frequency
// ============================================================================

export const REFRESH_FREQUENCY = [
  "real_time",
  "1_minute",
  "5_minutes",
  "15_minutes",
  "hourly",
  "daily",
  "manual",
] as const;

export type RefreshFrequency = (typeof REFRESH_FREQUENCY)[number];

// ============================================================================
// Aggregation Types
// ============================================================================

export const AGGREGATION_TYPE = [
  "sum",
  "count",
  "average",
  "min",
  "max",
  "median",
  "percentile",
  "distinct_count",
  "first",
  "last",
] as const;

export type AggregationType = (typeof AGGREGATION_TYPE)[number];

// ============================================================================
// Time Periods
// ============================================================================

export const TIME_PERIOD = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_quarter",
  "last_quarter",
  "this_year",
  "last_year",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_365_days",
  "custom",
] as const;

export type TimePeriod = (typeof TIME_PERIOD)[number];

// ============================================================================
// Dashboard Visibility
// ============================================================================

export const DASHBOARD_VISIBILITY = ["private", "role", "tenant"] as const;

export type DashboardVisibility = (typeof DASHBOARD_VISIBILITY)[number];

// ============================================================================
// Dashboard Layout
// ============================================================================

export const DASHBOARD_LAYOUT = ["grid", "freeform"] as const;

export type DashboardLayout = (typeof DASHBOARD_LAYOUT)[number];

// ============================================================================
// KPI Categories
// ============================================================================

export const KPI_CATEGORY = [
  "financial",
  "operational",
  "sales",
  "purchasing",
  "inventory",
  "hr",
  "custom",
] as const;

export type KpiCategory = (typeof KPI_CATEGORY)[number];

// ============================================================================
// KPI Unit Types
// ============================================================================

export const KPI_UNIT = [
  "number",
  "currency",
  "percent",
  "days",
  "ratio",
  "custom",
] as const;

export type KpiUnit = (typeof KPI_UNIT)[number];

// ============================================================================
// Alert Severity
// ============================================================================

export const ALERT_SEVERITY = ["info", "warning", "critical"] as const;

export type AlertSeverity = (typeof ALERT_SEVERITY)[number];

// ============================================================================
// Alert Status
// ============================================================================

export const ALERT_STATUS = [
  "active",
  "acknowledged",
  "resolved",
  "snoozed",
] as const;

export type AlertStatus = (typeof ALERT_STATUS)[number];

// ============================================================================
// Alert Condition Types
// ============================================================================

export const ALERT_CONDITION_TYPE = [
  "kpi_threshold",
  "event",
  "schedule",
  "anomaly",
] as const;

export type AlertConditionType = (typeof ALERT_CONDITION_TYPE)[number];

// ============================================================================
// Report Types
// ============================================================================

export const REPORT_TYPE = [
  "tabular",
  "summary",
  "matrix",
  "chart",
  "financial",
  "custom",
] as const;

export type ReportType = (typeof REPORT_TYPE)[number];

// ============================================================================
// Export Formats
// ============================================================================

export const EXPORT_FORMAT = ["pdf", "excel", "csv", "html"] as const;

export type ExportFormat = (typeof EXPORT_FORMAT)[number];

// ============================================================================
// Data Source Types
// ============================================================================

export const DATA_SOURCE_TYPE = ["kpi", "query", "api", "static"] as const;

export type DataSourceType = (typeof DATA_SOURCE_TYPE)[number];

// ============================================================================
// Alert Notification Channels (AFANDA-specific)
// ============================================================================

export const AFANDA_NOTIFICATION_CHANNEL = [
  "in_app",
  "email",
  "sms",
  "slack",
  "webhook",
] as const;

export type AfandaNotificationChannel = (typeof AFANDA_NOTIFICATION_CHANNEL)[number];
