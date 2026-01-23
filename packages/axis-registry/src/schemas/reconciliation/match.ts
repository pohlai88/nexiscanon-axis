/**
 * Match Record Schema (B09)
 *
 * Matching results between source and target records.
 */

import { z } from "zod";
import { RECON_MATCH_STATUS } from "./constants";

// ============================================================================
// Match Record Schema
// ============================================================================

export const matchRecordSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Match status
  matchStatus: z.enum(RECON_MATCH_STATUS),

  // Source record
  sourceType: z.string().max(50),
  sourceId: z.string().uuid(),
  sourceReference: z.string().max(100).optional(),
  sourceDate: z.string().datetime(),
  sourceAmount: z.string(),
  sourceCurrency: z.string().length(3),

  // Target record (if matched)
  targetType: z.string().max(50).optional(),
  targetId: z.string().uuid().optional(),
  targetReference: z.string().max(100).optional(),
  targetDate: z.string().datetime().optional(),
  targetAmount: z.string().optional(),
  targetCurrency: z.string().length(3).optional(),

  // Variance
  amountVariance: z.string().default("0"),
  dateVarianceDays: z.number().int().default(0),

  // Match confidence (for auto-match)
  matchScore: z.number().min(0).max(100).optional(),
  matchReason: z.string().max(500).optional(),

  // Manual match
  matchedBy: z.string().uuid().optional(),
  matchedAt: z.string().datetime().optional(),
  matchNotes: z.string().max(1000).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MatchRecord = z.infer<typeof matchRecordSchema>;
