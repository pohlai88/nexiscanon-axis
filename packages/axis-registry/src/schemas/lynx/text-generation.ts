/**
 * Text Generation Schema (A01-01)
 *
 * Text generation requests and responses.
 */

import { z } from "zod";
import { SAFETY_LEVEL, RESPONSE_FORMAT, FINISH_REASON } from "./constants";

// ============================================================================
// Message Schema
// ============================================================================

export const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  name: z.string().max(100).optional(),
  toolCallId: z.string().max(100).optional(),
});

export type Message = z.infer<typeof messageSchema>;

// ============================================================================
// Text Generation Request Schema
// ============================================================================

export const textGenerationRequestSchema = z.object({
  // Model selection
  model: z.string().max(100).optional(),

  // Prompt
  system: z.string().optional(),
  messages: z.array(messageSchema),

  // Parameters
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),

  // Safety
  safetyLevel: z.enum(SAFETY_LEVEL).optional(),

  // Structured output
  responseFormat: z.enum(RESPONSE_FORMAT).optional(),

  // Context
  tenantId: z.uuid(),
  userId: z.uuid(),
  requestId: z.uuid(),
});

export type TextGenerationRequest = z.infer<typeof textGenerationRequestSchema>;

// ============================================================================
// Text Generation Response Schema
// ============================================================================

export const textGenerationResponseSchema = z.object({
  content: z.string(),

  // Metadata
  model: z.string(),
  provider: z.string(),

  // Usage
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),

  // Reasoning (if available)
  reasoning: z.string().optional(),

  // Safety
  finishReason: z.enum(FINISH_REASON),
  safetyFlags: z.array(z.string()).optional(),
});

export type TextGenerationResponse = z.infer<typeof textGenerationResponseSchema>;
