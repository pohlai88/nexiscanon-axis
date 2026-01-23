/**
 * Recommendation Schema (B12)
 *
 * The Machine offers improvements.
 */

import { z } from "zod";
import {
  RECOMMENDATION_TYPE,
  RECOMMENDATION_STATUS,
  IMPACT_TYPE,
  EFFORT_LEVEL,
} from "./constants";
import { CONFIDENCE_LEVEL } from "../lynx/constants";

// ============================================================================
// Expected Impact Schema
// ============================================================================

export const expectedImpactSchema = z.object({
  type: z.enum(IMPACT_TYPE),
  direction: z.enum(["increase", "decrease"]),
  estimatedValue: z.number().optional(),
  unit: z.string().max(50).optional(),
});

export type ExpectedImpact = z.infer<typeof expectedImpactSchema>;

// ============================================================================
// Recommendation Confidence Schema
// ============================================================================

export const recommendationConfidenceSchema = z.object({
  level: z.enum(CONFIDENCE_LEVEL),
  score: z.number().min(0).max(1),
});

export type RecommendationConfidence = z.infer<typeof recommendationConfidenceSchema>;

// ============================================================================
// Supporting Data Schema
// ============================================================================

export const supportingDataSchema = z.object({
  metric: z.string().max(100),
  value: z.unknown(),
  source: z.string().max(100),
});

export type SupportingData = z.infer<typeof supportingDataSchema>;

// ============================================================================
// Suggested Action Schema
// ============================================================================

export const recommendationActionSchema = z.object({
  actionType: z.string().max(100),
  parameters: z.record(z.string(), z.unknown()),
  automatable: z.boolean(),
  estimatedEffort: z.enum(EFFORT_LEVEL),
});

export type RecommendationAction = z.infer<typeof recommendationActionSchema>;

// ============================================================================
// Feedback Schema
// ============================================================================

export const recommendationFeedbackSchema = z.object({
  outcome: z
    .enum(["successful", "partially_successful", "unsuccessful"])
    .optional(),
  actualImpact: z.number().optional(),
  notes: z.string().max(1000).optional(),
});

export type RecommendationFeedback = z.infer<typeof recommendationFeedbackSchema>;

// ============================================================================
// Recommendation Schema
// ============================================================================

export const recommendationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Type
  recommendationType: z.enum(RECOMMENDATION_TYPE),

  // Target
  targetDomain: z.string().max(50),
  targetEntity: z.string().max(100).optional(),
  targetEntityId: z.string().uuid().optional(),

  // Recommendation
  title: z.string().max(255),
  description: z.string().max(2000),

  // Impact
  expectedImpact: expectedImpactSchema,

  // Confidence
  confidence: recommendationConfidenceSchema,

  // Machine Reasoning
  reasoning: z.string().max(2000),
  supportingData: z.array(supportingDataSchema).optional(),

  // Action
  suggestedAction: recommendationActionSchema,

  // Status
  status: z.enum(RECOMMENDATION_STATUS).default("pending"),

  // Feedback
  feedback: recommendationFeedbackSchema.optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
