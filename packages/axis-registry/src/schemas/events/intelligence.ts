/**
 * Intelligence Domain Events (B12)
 *
 * Events for The Machine's Awareness capabilities.
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import {
  ANOMALY_TYPE,
  FORECAST_TYPE,
  INTEL_DOCUMENT_TYPE,
  RECOMMENDATION_TYPE,
  QUERY_INTENT,
} from "../intelligence/constants";
import { ANOMALY_SEVERITY } from "../lynx/constants";

// ============================================================================
// Anomaly Events
// ============================================================================

export const intelAnomalyDetectedEventSchema = createEventSchema(
  "intelligence.anomaly.detected",
  z.object({
    anomalyId: z.uuid(),
    domain: z.string(),
    entityType: z.string(),
    entityId: z.uuid().optional(),
    anomalyType: z.enum(ANOMALY_TYPE),
    severity: z.enum(ANOMALY_SEVERITY),
    title: z.string(),
    confidence: z.number().min(0).max(1),
  })
);

export type IntelAnomalyDetectedEvent = z.infer<typeof intelAnomalyDetectedEventSchema>;

export const intelAnomalyAcknowledgedEventSchema = createEventSchema(
  "intelligence.anomaly.acknowledged",
  z.object({
    anomalyId: z.uuid(),
    acknowledgedBy: z.uuid(),
  })
);

export type IntelAnomalyAcknowledgedEvent = z.infer<typeof intelAnomalyAcknowledgedEventSchema>;

export const intelAnomalyResolvedEventSchema = createEventSchema(
  "intelligence.anomaly.resolved",
  z.object({
    anomalyId: z.uuid(),
    resolvedBy: z.uuid(),
    resolution: z.string(),
    wasFalsePositive: z.boolean(),
  })
);

export type IntelAnomalyResolvedEvent = z.infer<typeof intelAnomalyResolvedEventSchema>;

// ============================================================================
// Forecast Events
// ============================================================================

export const intelForecastGeneratedEventSchema = createEventSchema(
  "intelligence.forecast.generated",
  z.object({
    forecastId: z.uuid(),
    forecastType: z.enum(FORECAST_TYPE),
    targetEntityId: z.uuid().optional(),
    horizon: z.number().int(),
    confidenceScore: z.number().min(0).max(1),
  })
);

export type IntelForecastGeneratedEvent = z.infer<typeof intelForecastGeneratedEventSchema>;

export const intelForecastFailedEventSchema = createEventSchema(
  "intelligence.forecast.failed",
  z.object({
    forecastType: z.enum(FORECAST_TYPE),
    targetEntityId: z.uuid().optional(),
    error: z.string(),
  })
);

export type IntelForecastFailedEvent = z.infer<typeof intelForecastFailedEventSchema>;

// ============================================================================
// Document Events
// ============================================================================

export const intelDocumentClassifiedEventSchema = createEventSchema(
  "intelligence.document.classified",
  z.object({
    classificationId: z.uuid(),
    fileName: z.string(),
    documentType: z.enum(INTEL_DOCUMENT_TYPE),
    confidence: z.number().min(0).max(1),
  })
);

export type IntelDocumentClassifiedEvent = z.infer<typeof intelDocumentClassifiedEventSchema>;

export const intelDocumentExtractedEventSchema = createEventSchema(
  "intelligence.document.extracted",
  z.object({
    extractionId: z.uuid(),
    classificationId: z.uuid(),
    documentType: z.enum(INTEL_DOCUMENT_TYPE),
    fieldsExtracted: z.number().int(),
    matchedEntityId: z.uuid().optional(),
  })
);

export type IntelDocumentExtractedEvent = z.infer<typeof intelDocumentExtractedEventSchema>;

// ============================================================================
// Recommendation Events
// ============================================================================

export const intelRecommendationCreatedEventSchema = createEventSchema(
  "intelligence.recommendation.created",
  z.object({
    recommendationId: z.uuid(),
    recommendationType: z.enum(RECOMMENDATION_TYPE),
    targetDomain: z.string(),
    targetEntityId: z.uuid().optional(),
    confidence: z.number().min(0).max(1),
    automatable: z.boolean(),
  })
);

export type IntelRecommendationCreatedEvent = z.infer<typeof intelRecommendationCreatedEventSchema>;

export const intelRecommendationAcceptedEventSchema = createEventSchema(
  "intelligence.recommendation.accepted",
  z.object({
    recommendationId: z.uuid(),
    acceptedBy: z.uuid(),
  })
);

export type IntelRecommendationAcceptedEvent = z.infer<typeof intelRecommendationAcceptedEventSchema>;

export const intelRecommendationRejectedEventSchema = createEventSchema(
  "intelligence.recommendation.rejected",
  z.object({
    recommendationId: z.uuid(),
    rejectedBy: z.uuid(),
    reason: z.string().optional(),
  })
);

export type IntelRecommendationRejectedEvent = z.infer<typeof intelRecommendationRejectedEventSchema>;

export const intelRecommendationImplementedEventSchema = createEventSchema(
  "intelligence.recommendation.implemented",
  z.object({
    recommendationId: z.uuid(),
    implementedBy: z.uuid(),
    outcome: z.enum(["successful", "partially_successful", "unsuccessful"]),
    actualImpact: z.number().optional(),
  })
);

export type IntelRecommendationImplementedEvent = z.infer<typeof intelRecommendationImplementedEventSchema>;

// ============================================================================
// Assistant Events
// ============================================================================

export const intelAssistantQueryEventSchema = createEventSchema(
  "intelligence.assistant.query",
  z.object({
    queryId: z.uuid(),
    conversationId: z.uuid().optional(),
    queryHash: z.string(),
    intent: z.enum(QUERY_INTENT).optional(),
    responseTimeMs: z.number().int(),
    toolsUsed: z.array(z.string()),
  })
);

export type IntelAssistantQueryEvent = z.infer<typeof intelAssistantQueryEventSchema>;

// ============================================================================
// Intelligence Event Union
// ============================================================================

export const intelligenceEventSchema = z.union([
  intelAnomalyDetectedEventSchema,
  intelAnomalyAcknowledgedEventSchema,
  intelAnomalyResolvedEventSchema,
  intelForecastGeneratedEventSchema,
  intelForecastFailedEventSchema,
  intelDocumentClassifiedEventSchema,
  intelDocumentExtractedEventSchema,
  intelRecommendationCreatedEventSchema,
  intelRecommendationAcceptedEventSchema,
  intelRecommendationRejectedEventSchema,
  intelRecommendationImplementedEventSchema,
  intelAssistantQueryEventSchema,
]);

export type IntelligenceEvent = z.infer<typeof intelligenceEventSchema>;
