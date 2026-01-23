/**
 * Dashboard Schema (B11)
 *
 * Dashboard definitions and layouts.
 */

import { z } from "zod";
import {
  DASHBOARD_TYPE,
  DASHBOARD_VISIBILITY,
  DASHBOARD_LAYOUT,
  TIME_PERIOD,
  REFRESH_FREQUENCY,
} from "./constants";

// ============================================================================
// Dashboard Schema
// ============================================================================

export const dashboardSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  slug: z.string().max(100),

  // Type
  dashboardType: z.enum(DASHBOARD_TYPE),

  // Access control
  visibility: z.enum(DASHBOARD_VISIBILITY).default("private"),
  allowedRoles: z.array(z.string()).optional(),
  ownerId: z.uuid(),

  // Layout
  layout: z.enum(DASHBOARD_LAYOUT).default("grid"),
  columns: z.number().int().min(1).max(24).default(12),
  rowHeight: z.number().int().min(50).default(100),

  // Default filters
  defaultPeriod: z.enum(TIME_PERIOD).default("this_month"),
  defaultFilters: z.record(z.string(), z.unknown()).optional(),

  // Refresh
  refreshFrequency: z.enum(REFRESH_FREQUENCY).default("5_minutes"),
  lastRefreshedAt: z.string().datetime().optional(),

  // Status
  isDefault: z.boolean().default(false),
  isPublished: z.boolean().default(false),

  // Versioning
  version: z.number().int().default(1),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type Dashboard = z.infer<typeof dashboardSchema>;

// ============================================================================
// Dashboard Widget Position Schema
// ============================================================================

export const widgetPositionSchema = z.object({
  widgetId: z.uuid(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
});

export type WidgetPosition = z.infer<typeof widgetPositionSchema>;

// ============================================================================
// Dashboard Layout Schema
// ============================================================================

export const dashboardLayoutSchema = z.object({
  dashboardId: z.uuid(),
  widgets: z.array(widgetPositionSchema),
});

export type DashboardLayoutDef = z.infer<typeof dashboardLayoutSchema>;
