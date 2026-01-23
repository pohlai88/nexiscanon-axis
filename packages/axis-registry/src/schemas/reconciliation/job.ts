/**
 * Reconciliation Job Schema (B09)
 *
 * Reconciliation job definitions.
 */

import { z } from "zod";
import { RECONCILIATION_TYPE, RECONCILIATION_STATUS } from "./constants";

// ============================================================================
// Reconciliation Job Schema
// ============================================================================

export const reconciliationJobSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  jobNumber: z.string().max(50),
  name: z.string().max(255),
  description: z.string().max(1000).optional(),

  // Type
  reconciliationType: z.enum(RECONCILIATION_TYPE),

  // Scope
  fiscalPeriodId: z.uuid().optional(),
  asOfDate: z.string().datetime(),

  // Source and Target
  sourceType: z.string().max(50),
  sourceId: z.uuid().optional(),
  targetType: z.string().max(50),
  targetId: z.uuid().optional(),

  // Status
  status: z.enum(RECONCILIATION_STATUS).default("pending"),

  // Results summary
  totalSourceRecords: z.number().int().default(0),
  totalTargetRecords: z.number().int().default(0),
  matchedRecords: z.number().int().default(0),
  unmatchedRecords: z.number().int().default(0),
  exceptionCount: z.number().int().default(0),

  // Amounts
  sourceTotal: z.string().default("0"),
  targetTotal: z.string().default("0"),
  varianceAmount: z.string().default("0"),

  // Tolerance
  toleranceAmount: z.string().default("0"),
  tolerancePercent: z.number().default(0),

  // Execution
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),

  // Approval
  reviewedBy: z.uuid().optional(),
  reviewedAt: z.string().datetime().optional(),
  approvedBy: z.uuid().optional(),
  approvedAt: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type ReconciliationJob = z.infer<typeof reconciliationJobSchema>;
