/**
 * Lynx Domain Events (A01-01)
 *
 * Events for AI/ML intelligence operations.
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import { LYNX_CAPABILITY, ANOMALY_SEVERITY, CONFIDENCE_LEVEL } from "../lynx/constants";

// ============================================================================
// Inference Events
// ============================================================================

export const inferenceCompletedEventSchema = createEventSchema(
  "lynx.inference.completed",
  z.object({
    requestId: z.string().uuid(),
    capability: z.enum(LYNX_CAPABILITY),
    provider: z.string(),
    model: z.string(),
    latencyMs: z.number().int(),
    tokenCount: z.number().int(),
    success: z.boolean(),
  })
);

export type InferenceCompletedEvent = z.infer<typeof inferenceCompletedEventSchema>;

export const inferenceFailedEventSchema = createEventSchema(
  "lynx.inference.failed",
  z.object({
    requestId: z.string().uuid(),
    capability: z.enum(LYNX_CAPABILITY),
    provider: z.string(),
    model: z.string(),
    error: z.string(),
    fallbackUsed: z.boolean(),
  })
);

export type InferenceFailedEvent = z.infer<typeof inferenceFailedEventSchema>;

// ============================================================================
// Agent Events
// ============================================================================

export const agentExecutionStartedEventSchema = createEventSchema(
  "lynx.agent.execution_started",
  z.object({
    executionId: z.string().uuid(),
    agentId: z.string().uuid(),
    input: z.string(),
  })
);

export type AgentExecutionStartedEvent = z.infer<typeof agentExecutionStartedEventSchema>;

export const agentExecutionCompletedEventSchema = createEventSchema(
  "lynx.agent.execution_completed",
  z.object({
    executionId: z.string().uuid(),
    agentId: z.string().uuid(),
    success: z.boolean(),
    steps: z.number().int(),
    toolCalls: z.number().int(),
    durationMs: z.number().int(),
  })
);

export type AgentExecutionCompletedEvent = z.infer<typeof agentExecutionCompletedEventSchema>;

export const agentActionRequestedEventSchema = createEventSchema(
  "lynx.agent.action_requested",
  z.object({
    executionId: z.string().uuid(),
    agentId: z.string(),
    actionType: z.string(),
    targetDomain: z.string(),
    requiresApproval: z.boolean(),
  })
);

export type AgentActionRequestedEvent = z.infer<typeof agentActionRequestedEventSchema>;

export const agentApprovalGrantedEventSchema = createEventSchema(
  "lynx.agent.approval_granted",
  z.object({
    approvalRequestId: z.string().uuid(),
    executionId: z.string().uuid(),
    approvedBy: z.string().uuid(),
  })
);

export type AgentApprovalGrantedEvent = z.infer<typeof agentApprovalGrantedEventSchema>;

export const agentApprovalDeniedEventSchema = createEventSchema(
  "lynx.agent.approval_denied",
  z.object({
    approvalRequestId: z.string().uuid(),
    executionId: z.string().uuid(),
    deniedBy: z.string().uuid(),
    reason: z.string().optional(),
  })
);

export type AgentApprovalDeniedEvent = z.infer<typeof agentApprovalDeniedEventSchema>;

// ============================================================================
// Anomaly Events
// ============================================================================

export const anomalyDetectedEventSchema = createEventSchema(
  "lynx.anomaly.detected",
  z.object({
    anomalyId: z.string().uuid(),
    domain: z.string(),
    entityType: z.string(),
    entityId: z.string().uuid(),
    severity: z.enum(ANOMALY_SEVERITY),
    description: z.string(),
    confidence: z.number().min(0).max(1),
  })
);

export type AnomalyDetectedEvent = z.infer<typeof anomalyDetectedEventSchema>;

export const anomalyResolvedEventSchema = createEventSchema(
  "lynx.anomaly.resolved",
  z.object({
    anomalyId: z.string().uuid(),
    resolvedBy: z.string().uuid(),
    resolution: z.string(),
  })
);

export type AnomalyResolvedEvent = z.infer<typeof anomalyResolvedEventSchema>;

// ============================================================================
// Forecast Events
// ============================================================================

export const forecastGeneratedEventSchema = createEventSchema(
  "lynx.forecast.generated",
  z.object({
    forecastId: z.string().uuid(),
    seriesType: z.string(),
    horizon: z.number().int(),
    confidenceInterval: z.number().min(0).max(1),
    model: z.string(),
  })
);

export type ForecastGeneratedEvent = z.infer<typeof forecastGeneratedEventSchema>;

// ============================================================================
// Document Processing Events
// ============================================================================

export const documentProcessedEventSchema = createEventSchema(
  "lynx.document.processed",
  z.object({
    documentId: z.string().uuid(),
    documentType: z.string(),
    operation: z.enum(["classify", "extract", "summarize"]),
    confidence: z.enum(CONFIDENCE_LEVEL),
    fieldsExtracted: z.number().int().optional(),
  })
);

export type DocumentProcessedEvent = z.infer<typeof documentProcessedEventSchema>;

// ============================================================================
// Safety Events
// ============================================================================

export const requestBlockedEventSchema = createEventSchema(
  "lynx.safety.request_blocked",
  z.object({
    requestId: z.string().uuid(),
    reason: z.string(),
    safetyFlags: z.array(z.string()),
  })
);

export type RequestBlockedEvent = z.infer<typeof requestBlockedEventSchema>;

// ============================================================================
// Lynx Event Union
// ============================================================================

export const lynxEventSchema = z.union([
  inferenceCompletedEventSchema,
  inferenceFailedEventSchema,
  agentExecutionStartedEventSchema,
  agentExecutionCompletedEventSchema,
  agentActionRequestedEventSchema,
  agentApprovalGrantedEventSchema,
  agentApprovalDeniedEventSchema,
  anomalyDetectedEventSchema,
  anomalyResolvedEventSchema,
  forecastGeneratedEventSchema,
  documentProcessedEventSchema,
  requestBlockedEventSchema,
]);

export type LynxEvent = z.infer<typeof lynxEventSchema>;
