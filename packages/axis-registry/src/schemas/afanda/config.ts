/**
 * AFANDA Configuration Schema (B11)
 *
 * Tenant-level AFANDA configuration.
 */

import { z } from "zod";
import { REFRESH_FREQUENCY, EXPORT_FORMAT, AFANDA_NOTIFICATION_CHANNEL } from "./constants";

// ============================================================================
// AFANDA Config Schema
// ============================================================================

export const afandaConfigSchema = z.object({
  tenantId: z.string().uuid(),

  // Default dashboard
  defaultExecutiveDashboard: z.string().uuid().optional(),
  defaultOperationalDashboard: z.string().uuid().optional(),

  // Refresh settings
  defaultRefreshFrequency: z.enum(REFRESH_FREQUENCY).default("5_minutes"),
  enableRealTimeUpdates: z.boolean().default(false),

  // KPI settings
  kpiCacheMinutes: z.number().int().min(1).default(5),
  showKpiTrends: z.boolean().default(true),

  // Alert settings
  alertNotificationChannels: z
    .array(z.enum(AFANDA_NOTIFICATION_CHANNEL))
    .default(["in_app"]),
  criticalAlertEscalationMinutes: z.number().int().default(30),

  // Report settings
  maxReportRows: z.number().int().default(10000),
  enableReportScheduling: z.boolean().default(true),
  reportRetentionDays: z.number().int().default(90),

  // Export settings
  defaultExportFormat: z.enum(EXPORT_FORMAT).default("excel"),
  includeLogoInExports: z.boolean().default(true),

  // Analytics
  trackDashboardUsage: z.boolean().default(true),

  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type AfandaConfig = z.infer<typeof afandaConfigSchema>;
