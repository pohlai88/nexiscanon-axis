/**
 * Tax Code Mapping Schemas (C03)
 *
 * "The Machine offers jurisdiction and rate suggestions."
 */

import { z } from "zod";
import { studioMappingStatusSchema, taxTypeSchema } from "./constants";

// ============================================================================
// Tax Code Mapping
// ============================================================================

export const taxCodeMappingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Source tax code
  sourceCode: z.string(),
  sourceName: z.string(),
  sourceRate: z.number(), // Percentage

  // Machine analysis
  suggestedTaxType: taxTypeSchema,
  suggestedRate: z.number(),
  suggestedJurisdiction: z.string().optional(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),

  // Alternatives
  alternatives: z
    .array(
      z.object({
        taxType: taxTypeSchema,
        confidence: z.number().min(0).max(1),
      })
    )
    .default([]),

  // Confirmed mapping
  confirmedTaxType: taxTypeSchema.optional(),
  confirmedRate: z.number().optional(),
  confirmedJurisdiction: z.string().optional(),

  // Target AXIS tax code (if mapped to existing)
  targetTaxCodeId: z.string().uuid().optional(),

  // Status
  status: studioMappingStatusSchema,

  // Validation
  rateMatches: z.boolean().optional(),
  rateDiscrepancy: z.number().optional(),

  // Review trail
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().datetime().optional(),
  reviewNote: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaxCodeMapping = z.infer<typeof taxCodeMappingSchema>;
