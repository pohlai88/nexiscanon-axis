/**
 * Reconciliation Exception Schema (B09)
 *
 * Exception tracking and resolution.
 */

import { z } from "zod";
import {
  EXCEPTION_TYPE,
  EXCEPTION_STATUS,
  EXCEPTION_SEVERITY,
  RESOLUTION_TYPE,
} from "./constants";

// ============================================================================
// Reconciliation Exception Schema
// ============================================================================

export const reconciliationExceptionSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  matchRecordId: z.string().uuid().optional(),
  tenantId: z.string().uuid(),

  // Classification
  exceptionType: z.enum(EXCEPTION_TYPE),
  severity: z.enum(EXCEPTION_SEVERITY).default("medium"),

  // Status
  status: z.enum(EXCEPTION_STATUS).default("open"),

  // Details
  sourceType: z.string().max(50).optional(),
  sourceId: z.string().uuid().optional(),
  sourceReference: z.string().max(100).optional(),
  sourceAmount: z.string().optional(),

  targetType: z.string().max(50).optional(),
  targetId: z.string().uuid().optional(),
  targetReference: z.string().max(100).optional(),
  targetAmount: z.string().optional(),

  // Variance
  varianceAmount: z.string().optional(),
  variancePercent: z.number().optional(),

  // Description
  description: z.string().max(1000),
  suggestedAction: z.string().max(500).optional(),

  // Investigation
  assignedTo: z.string().uuid().optional(),
  investigationNotes: z.string().max(2000).optional(),

  // Resolution
  resolutionType: z.enum(RESOLUTION_TYPE).optional(),
  resolutionNotes: z.string().max(1000).optional(),
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),

  // For adjustments
  adjustmentJournalId: z.string().uuid().optional(),

  // Approval (for write-offs)
  approvalRequired: z.boolean().default(false),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ReconciliationException = z.infer<typeof reconciliationExceptionSchema>;
