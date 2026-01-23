/**
 * KPI Schema (B11)
 *
 * Key Performance Indicator definitions.
 */

import { z } from "zod";
import { KPI_CATEGORY, KPI_UNIT } from "./constants";

// ============================================================================
// KPI Thresholds Schema
// ============================================================================

export const kpiThresholdsSchema = z.object({
  critical: z.number().optional(),
  warning: z.number().optional(),
  good: z.number().optional(),
  excellent: z.number().optional(),
});

export type KpiThresholds = z.infer<typeof kpiThresholdsSchema>;

// ============================================================================
// KPI Schema
// ============================================================================

export const kpiSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),

  // Category
  category: z.enum(KPI_CATEGORY),

  // Calculation
  formula: z.string(),
  formulaType: z.enum(["expression", "sql", "script"]).default("expression"),

  // Dependencies
  dependsOn: z.array(z.string()).optional(),

  // Display
  unit: z.enum(KPI_UNIT).default("number"),
  customUnit: z.string().max(20).optional(),
  decimals: z.number().int().min(0).max(6).default(2),
  invertColors: z.boolean().default(false),

  // Targets
  targetValue: z.number().optional(),
  targetType: z.enum(["fixed", "dynamic", "calculated"]).optional(),
  thresholds: kpiThresholdsSchema.optional(),

  // Time
  periodType: z
    .enum(["point_in_time", "period_to_date", "rolling"])
    .default("period_to_date"),
  rollingPeriodDays: z.number().int().optional(),

  // Caching
  cacheMinutes: z.number().int().default(5),
  lastCalculatedAt: z.string().datetime().optional(),
  lastValue: z.number().optional(),

  // Status
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Kpi = z.infer<typeof kpiSchema>;
