/**
 * Lynx Domain Constants (A01-01)
 *
 * Provider-Agnostic Intelligence Framework
 */

// ============================================================================
// Provider Capabilities
// ============================================================================

export const PROVIDER_CAPABILITY = [
  "text_generation",
  "text_streaming",
  "embeddings",
  "vision",
  "structured_output",
  "function_calling",
] as const;

export type ProviderCapability = (typeof PROVIDER_CAPABILITY)[number];

// ============================================================================
// Provider IDs
// ============================================================================

export const PROVIDER_ID = [
  "openai",
  "anthropic",
  "google",
  "ollama",
  "azure_openai",
  "bedrock",
  "custom",
] as const;

export type ProviderId = (typeof PROVIDER_ID)[number];

// ============================================================================
// Lynx Capability Types
// ============================================================================

export const LYNX_CAPABILITY = [
  "text",
  "embedding",
  "vision",
  "agent",
  "forecast",
  "anomaly",
  "document",
] as const;

export type LynxCapability = (typeof LYNX_CAPABILITY)[number];

// ============================================================================
// Safety Levels
// ============================================================================

export const SAFETY_LEVEL = ["strict", "balanced", "permissive"] as const;

export type SafetyLevel = (typeof SAFETY_LEVEL)[number];

// ============================================================================
// Response Formats
// ============================================================================

export const RESPONSE_FORMAT = ["text", "json", "markdown"] as const;

export type ResponseFormat = (typeof RESPONSE_FORMAT)[number];

// ============================================================================
// Finish Reasons
// ============================================================================

export const FINISH_REASON = ["stop", "length", "safety", "error"] as const;

export type FinishReason = (typeof FINISH_REASON)[number];

// ============================================================================
// Confidence Levels
// ============================================================================

export const CONFIDENCE_LEVEL = [
  "high",
  "medium",
  "low",
  "uncertain",
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVEL)[number];

// ============================================================================
// Agent Memory Types
// ============================================================================

export const AGENT_MEMORY_TYPE = ["none", "session", "persistent"] as const;

export type AgentMemoryType = (typeof AGENT_MEMORY_TYPE)[number];

// ============================================================================
// Tool Risk Levels
// ============================================================================

export const TOOL_RISK_LEVEL = ["low", "medium", "high"] as const;

export type ToolRiskLevel = (typeof TOOL_RISK_LEVEL)[number];

// ============================================================================
// Action Levels (Domain Access)
// ============================================================================

export const ACTION_LEVEL = ["read", "suggest", "draft", "execute"] as const;

export type ActionLevel = (typeof ACTION_LEVEL)[number];

// ============================================================================
// Embedding Purposes
// ============================================================================

export const EMBEDDING_PURPOSE = [
  "search",
  "similarity",
  "clustering",
] as const;

export type EmbeddingPurpose = (typeof EMBEDDING_PURPOSE)[number];

// ============================================================================
// Anomaly Severity
// ============================================================================

export const ANOMALY_SEVERITY = ["info", "warning", "critical"] as const;

export type AnomalySeverity = (typeof ANOMALY_SEVERITY)[number];

// ============================================================================
// Agent Step Types
// ============================================================================

export const AGENT_STEP_TYPE = [
  "thinking",
  "tool_call",
  "tool_result",
  "response",
  "approval_request",
] as const;

export type AgentStepType = (typeof AGENT_STEP_TYPE)[number];

// ============================================================================
// Confidence Thresholds
// ============================================================================

export const CONFIDENCE_THRESHOLDS = {
  high: { min: 0.85, max: 1.0 },
  medium: { min: 0.6, max: 0.84 },
  low: { min: 0.3, max: 0.59 },
  uncertain: { min: 0.0, max: 0.29 },
} as const;
