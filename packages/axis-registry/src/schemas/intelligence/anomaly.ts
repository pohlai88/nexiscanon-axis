/**
 * Anomaly Schema (B12)
 *
 * The Machine notices what's unusual.
 */

import { z } from "zod";
import { ANOMALY_TYPE, INTEL_ANOMALY_STATUS } from "./constants";
import { ANOMALY_SEVERITY, CONFIDENCE_LEVEL } from "../lynx/constants";

// ============================================================================
// Anomaly Metric Schema
// ============================================================================

export const anomalyMetricSchema = z.object({
  name: z.string().max(100),
  actualValue: z.number(),
  expectedValue: z.number().optional(),
  threshold: z.number().optional(),
  deviation: z.number().optional(),
});

export type AnomalyMetric = z.infer<typeof anomalyMetricSchema>;

// ============================================================================
// Anomaly Confidence Schema
// ============================================================================

export const anomalyConfidenceSchema = z.object({
  level: z.enum(CONFIDENCE_LEVEL),
  score: z.number().min(0).max(1),
  factors: z
    .array(
      z.object({
        factor: z.string(),
        impact: z.enum(["positive", "negative"]),
        weight: z.number(),
      })
    )
    .optional(),
});

export type AnomalyConfidence = z.infer<typeof anomalyConfidenceSchema>;

// ============================================================================
// Suggested Action Schema
// ============================================================================

export const suggestedActionSchema = z.object({
  action: z.string().max(500),
  priority: z.enum(["immediate", "soon", "when_convenient"]),
  automatable: z.boolean(),
});

export type SuggestedAction = z.infer<typeof suggestedActionSchema>;

// ============================================================================
// Anomaly Schema
// ============================================================================

export const anomalySchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Classification
  anomalyType: z.enum(ANOMALY_TYPE),
  severity: z.enum(ANOMALY_SEVERITY),

  // Context
  domain: z.string().max(50),
  entityType: z.string().max(100),
  entityId: z.uuid().optional(),

  // Detection
  detectedAt: z.string().datetime(),
  detectionMethod: z.string().max(100),

  // Details
  title: z.string().max(255),
  description: z.string().max(2000),

  // Evidence
  metrics: z.array(anomalyMetricSchema),

  // Confidence
  confidence: anomalyConfidenceSchema,

  // Machine Explanation
  explanation: z.string().max(2000).optional(),
  reasoning: z.string().optional(),

  // Suggested actions
  suggestedActions: z.array(suggestedActionSchema).optional(),

  // Status
  status: z.enum(INTEL_ANOMALY_STATUS).default("detected"),

  // Resolution
  acknowledgedBy: z.uuid().optional(),
  acknowledgedAt: z.string().datetime().optional(),
  resolvedBy: z.uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionNote: z.string().max(1000).optional(),

  // Feedback (for improvement)
  feedback: z.enum(["correct", "false_positive", "missed_context"]).optional(),
  feedbackNote: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Anomaly = z.infer<typeof anomalySchema>;
