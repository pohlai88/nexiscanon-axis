/**
 * Intelligence Domain Constants (B12)
 *
 * The Machine's Awareness Applied to ERP
 */

// ============================================================================
// Intelligence Capabilities
// ============================================================================

export const INTELLIGENCE_CAPABILITY = [
  "anomaly_detection",
  "forecasting",
  "document_classification",
  "document_extraction",
  "semantic_search",
  "recommendations",
  "natural_language_query",
  "agent_execution",
] as const;

export type IntelligenceCapability = (typeof INTELLIGENCE_CAPABILITY)[number];

// ============================================================================
// Anomaly Types
// ============================================================================

export const ANOMALY_TYPE = [
  "statistical",
  "pattern",
  "rule_based",
  "ml_detected",
  "comparative",
] as const;

export type AnomalyType = (typeof ANOMALY_TYPE)[number];

// ============================================================================
// Anomaly Status
// ============================================================================

export const INTEL_ANOMALY_STATUS = [
  "detected",
  "acknowledged",
  "investigating",
  "resolved",
  "false_positive",
  "ignored",
] as const;

export type IntelAnomalyStatus = (typeof INTEL_ANOMALY_STATUS)[number];

// ============================================================================
// Forecast Types
// ============================================================================

export const FORECAST_TYPE = [
  "demand",
  "revenue",
  "cash_flow",
  "inventory",
  "expense",
  "custom",
] as const;

export type ForecastType = (typeof FORECAST_TYPE)[number];

// ============================================================================
// Forecast Methods
// ============================================================================

export const FORECAST_METHOD = [
  "moving_average",
  "exponential_smoothing",
  "arima",
  "prophet",
  "neural_network",
  "ensemble",
] as const;

export type ForecastMethod = (typeof FORECAST_METHOD)[number];

// ============================================================================
// Forecast Granularity
// ============================================================================

export const FORECAST_GRANULARITY = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
] as const;

export type ForecastGranularity = (typeof FORECAST_GRANULARITY)[number];

// ============================================================================
// Document Types
// ============================================================================

export const INTEL_DOCUMENT_TYPE = [
  "invoice",
  "purchase_order",
  "receipt",
  "contract",
  "statement",
  "report",
  "correspondence",
  "unknown",
] as const;

export type IntelDocumentType = (typeof INTEL_DOCUMENT_TYPE)[number];

// ============================================================================
// Recommendation Types
// ============================================================================

export const RECOMMENDATION_TYPE = [
  "pricing",
  "reorder",
  "payment",
  "process",
  "risk",
  "opportunity",
] as const;

export type RecommendationType = (typeof RECOMMENDATION_TYPE)[number];

// ============================================================================
// Recommendation Status
// ============================================================================

export const RECOMMENDATION_STATUS = [
  "pending",
  "accepted",
  "rejected",
  "implemented",
] as const;

export type RecommendationStatus = (typeof RECOMMENDATION_STATUS)[number];

// ============================================================================
// Impact Types
// ============================================================================

export const IMPACT_TYPE = [
  "revenue",
  "cost",
  "efficiency",
  "risk",
  "quality",
] as const;

export type ImpactType = (typeof IMPACT_TYPE)[number];

// ============================================================================
// Effort Levels
// ============================================================================

export const EFFORT_LEVEL = ["minimal", "moderate", "significant"] as const;

export type EffortLevel = (typeof EFFORT_LEVEL)[number];

// ============================================================================
// Insight Types
// ============================================================================

export const INSIGHT_TYPE = [
  "trend",
  "seasonality",
  "anomaly",
  "opportunity",
  "risk",
] as const;

export type InsightType = (typeof INSIGHT_TYPE)[number];

// ============================================================================
// Query Intent Categories
// ============================================================================

export const QUERY_INTENT = [
  "data_query",
  "entity_lookup",
  "comparison",
  "explanation",
  "action_request",
  "report_request",
  "help",
  "other",
] as const;

export type QueryIntent = (typeof QUERY_INTENT)[number];

// ============================================================================
// Visualization Types
// ============================================================================

export const VISUALIZATION_TYPE = [
  "table",
  "chart",
  "metric",
  "list",
  "none",
] as const;

export type VisualizationType = (typeof VISUALIZATION_TYPE)[number];
