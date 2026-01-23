/**
 * Widget Schema (B11)
 *
 * Dashboard widget definitions.
 */

import { z } from "zod";
import {
  WIDGET_TYPE,
  DATA_SOURCE_TYPE,
  AGGREGATION_TYPE,
  REFRESH_FREQUENCY,
} from "./constants";

// ============================================================================
// Widget Filter Schema
// ============================================================================

export const widgetFilterSchema = z.object({
  field: z.string(),
  operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "in", "between"]),
  value: z.unknown(),
});

export type WidgetFilter = z.infer<typeof widgetFilterSchema>;

// ============================================================================
// Widget Data Source Schema
// ============================================================================

export const widgetDataSourceSchema = z.object({
  type: z.enum(DATA_SOURCE_TYPE),
  kpiId: z.uuid().optional(),
  query: z.string().optional(),
  endpoint: z.string().optional(),
  staticData: z.unknown().optional(),
});

export type WidgetDataSource = z.infer<typeof widgetDataSourceSchema>;

// ============================================================================
// Widget Aggregation Schema
// ============================================================================

export const widgetAggregationSchema = z.object({
  type: z.enum(AGGREGATION_TYPE).optional(),
  field: z.string().optional(),
  groupBy: z.array(z.string()).optional(),
});

export type WidgetAggregation = z.infer<typeof widgetAggregationSchema>;

// ============================================================================
// Widget Drill-Down Config Schema
// ============================================================================

export const widgetDrillDownConfigSchema = z.object({
  targetDashboard: z.uuid().optional(),
  targetUrl: z.string().optional(),
  passFilters: z.boolean().default(true),
});

export type WidgetDrillDownConfig = z.infer<typeof widgetDrillDownConfigSchema>;

// ============================================================================
// Widget Schema
// ============================================================================

export const widgetSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),

  // Type
  widgetType: z.enum(WIDGET_TYPE),

  // Data source
  dataSource: widgetDataSourceSchema,

  // Filters (widget-level)
  filters: z.array(widgetFilterSchema).optional(),

  // Aggregation
  aggregation: widgetAggregationSchema.optional(),

  // Visualization config (widget-type-specific)
  config: z.record(z.string(), z.unknown()),

  // Theming
  colorScheme: z.string().max(50).optional(),

  // Interactivity
  drillDownEnabled: z.boolean().default(false),
  drillDownConfig: widgetDrillDownConfigSchema.optional(),

  // Refresh
  refreshFrequency: z.enum(REFRESH_FREQUENCY).optional(),

  // Reusable
  isTemplate: z.boolean().default(false),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type Widget = z.infer<typeof widgetSchema>;
