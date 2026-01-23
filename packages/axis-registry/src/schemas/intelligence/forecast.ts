/**
 * Forecast Schema (B12)
 *
 * The Machine anticipates what's coming.
 */

import { z } from "zod";
import {
  FORECAST_TYPE,
  FORECAST_METHOD,
  FORECAST_GRANULARITY,
  INSIGHT_TYPE,
} from "./constants";
import { CONFIDENCE_LEVEL } from "../lynx/constants";

// ============================================================================
// Forecast Prediction Schema
// ============================================================================

export const forecastPredictionSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  value: z.number(),
  lowerBound: z.number(),
  upperBound: z.number(),
});

export type ForecastPrediction = z.infer<typeof forecastPredictionSchema>;

// ============================================================================
// Forecast Confidence Schema
// ============================================================================

export const forecastConfidenceSchema = z.object({
  level: z.enum(CONFIDENCE_LEVEL),
  score: z.number().min(0).max(1),
  mape: z.number().optional(), // Mean Absolute Percentage Error
  rmse: z.number().optional(), // Root Mean Square Error
});

export type ForecastConfidence = z.infer<typeof forecastConfidenceSchema>;

// ============================================================================
// Backtest Results Schema
// ============================================================================

export const backtestResultsSchema = z.object({
  accuracy: z.number().min(0).max(1),
  periods: z.number().int().positive(),
});

export type BacktestResults = z.infer<typeof backtestResultsSchema>;

// ============================================================================
// Forecast Insight Schema
// ============================================================================

export const forecastInsightSchema = z.object({
  type: z.enum(INSIGHT_TYPE),
  description: z.string().max(500),
  impact: z.enum(["positive", "negative", "neutral"]),
});

export type ForecastInsight = z.infer<typeof forecastInsightSchema>;

// ============================================================================
// Forecast Schema
// ============================================================================

export const forecastSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Type
  forecastType: z.enum(FORECAST_TYPE),

  // Target
  targetEntity: z.string().max(100).optional(),
  targetEntityId: z.uuid().optional(),

  // Time parameters
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  granularity: z.enum(FORECAST_GRANULARITY),
  horizon: z.number().int().positive(),

  // Method
  method: z.enum(FORECAST_METHOD),
  modelVersion: z.string().max(50).optional(),

  // Results
  predictions: z.array(forecastPredictionSchema),

  // Confidence
  confidence: forecastConfidenceSchema,

  // Historical performance
  backtestResults: backtestResultsSchema.optional(),

  // Machine Insights
  insights: z.array(forecastInsightSchema).optional(),

  // Status
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  error: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type Forecast = z.infer<typeof forecastSchema>;
