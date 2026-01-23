/**
 * Confidence Schema (A01-01)
 *
 * AI confidence indicators and factors.
 */

import { z } from "zod";
import { CONFIDENCE_LEVEL } from "./constants";

// ============================================================================
// Confidence Factor Schema
// ============================================================================

export const confidenceFactorSchema = z.object({
  factor: z.string().max(100),
  impact: z.enum(["positive", "negative"]),
  weight: z.number().min(0).max(1),
});

export type ConfidenceFactor = z.infer<typeof confidenceFactorSchema>;

// ============================================================================
// Confidence Indicator Schema
// ============================================================================

export const confidenceIndicatorSchema = z.object({
  level: z.enum(CONFIDENCE_LEVEL),
  score: z.number().min(0).max(1),

  // Explanation
  factors: z.array(confidenceFactorSchema),

  // Caveats
  caveats: z.array(z.string()),

  // Recommendation
  shouldHumanReview: z.boolean(),
  reviewReason: z.string().max(500).optional(),
});

export type ConfidenceIndicator = z.infer<typeof confidenceIndicatorSchema>;
