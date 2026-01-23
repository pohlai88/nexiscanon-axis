/**
 * Fiscal Period Schema (B07)
 *
 * Period management and closing controls.
 */

import { z } from "zod";
import { PERIOD_STATUS } from "./constants";

// ============================================================================
// Fiscal Period Schema
// ============================================================================

export const fiscalPeriodSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Identity
  fiscalYear: z.number().int(),
  periodNumber: z.number().int().min(1).max(13), // 13 = adjustment period
  periodName: z.string().max(50),

  // Date range
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),

  // Status
  status: z.enum(PERIOD_STATUS).default("future"),

  // Control flags
  isAdjustmentPeriod: z.boolean().default(false),

  // Close tracking
  softClosedAt: z.string().datetime().optional(),
  softClosedBy: z.string().uuid().optional(),
  hardClosedAt: z.string().datetime().optional(),
  hardClosedBy: z.string().uuid().optional(),

  // Balances at close (snapshot)
  closingTrialBalance: z.record(z.string(), z.string()).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FiscalPeriod = z.infer<typeof fiscalPeriodSchema>;
