/**
 * Report Schema (B11)
 *
 * Report definitions and configurations.
 */

import { z } from "zod";
import {
  REPORT_TYPE,
  EXPORT_FORMAT,
  AGGREGATION_TYPE,
  DASHBOARD_VISIBILITY,
} from "./constants";

// ============================================================================
// Report Parameter Schema
// ============================================================================

export const reportParameterSchema = z.object({
  name: z.string().max(50),
  label: z.string().max(100),
  type: z.enum([
    "string",
    "number",
    "date",
    "dateRange",
    "select",
    "multiSelect",
  ]),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
});

export type ReportParameter = z.infer<typeof reportParameterSchema>;

// ============================================================================
// Report Column Schema
// ============================================================================

export const reportColumnSchema = z.object({
  field: z.string().max(100),
  header: z.string().max(100),
  width: z.number().int().optional(),
  format: z.string().max(50).optional(),
  aggregation: z.enum(AGGREGATION_TYPE).optional(),
  groupBy: z.boolean().default(false),
});

export type ReportColumn = z.infer<typeof reportColumnSchema>;

// ============================================================================
// Report Sort Schema
// ============================================================================

export const reportSortSchema = z.object({
  field: z.string().max(100),
  direction: z.enum(["asc", "desc"]),
});

export type ReportSort = z.infer<typeof reportSortSchema>;

// ============================================================================
// Report Schedule Schema
// ============================================================================

export const reportScheduleSchema = z.object({
  cronExpression: z.string().max(100),
  format: z.enum(EXPORT_FORMAT),
  recipients: z.array(z.email()),
  subject: z.string().max(255).optional(),
});

export type ReportSchedule = z.infer<typeof reportScheduleSchema>;

// ============================================================================
// Report Data Source Schema
// ============================================================================

export const reportDataSourceSchema = z.object({
  type: z.enum(["entity", "query", "stored_procedure"]),
  entity: z.string().max(100).optional(),
  query: z.string().optional(),
  storedProcedure: z.string().max(100).optional(),
});

export type ReportDataSource = z.infer<typeof reportDataSourceSchema>;

// ============================================================================
// Report Definition Schema
// ============================================================================

export const reportDefinitionSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100),

  // Type
  reportType: z.enum(REPORT_TYPE),

  // Data source
  dataSource: reportDataSourceSchema,

  // Parameters
  parameters: z.array(reportParameterSchema).optional(),

  // Columns (for tabular/summary)
  columns: z.array(reportColumnSchema).optional(),

  // Grouping
  groupBy: z.array(z.string()).optional(),
  sortBy: z.array(reportSortSchema).optional(),

  // Chart config (for chart type)
  chartConfig: z.record(z.string(), z.unknown()).optional(),

  // Scheduling
  scheduleEnabled: z.boolean().default(false),
  scheduleConfig: reportScheduleSchema.optional(),

  // Access control
  visibility: z.enum(DASHBOARD_VISIBILITY).default("private"),
  allowedRoles: z.array(z.string()).optional(),

  // Status
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type ReportDefinition = z.infer<typeof reportDefinitionSchema>;
