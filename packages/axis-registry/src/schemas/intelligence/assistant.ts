/**
 * Assistant Schema (B12)
 *
 * The Machine responds to questions.
 */

import { z } from "zod";
import { QUERY_INTENT, VISUALIZATION_TYPE } from "./constants";

// ============================================================================
// Conversation Message Schema
// ============================================================================

export const conversationToolCallSchema = z.object({
  toolId: z.string().max(100),
  input: z.record(z.string(), z.unknown()),
  output: z.unknown().optional(),
  status: z.enum(["pending", "completed", "failed"]),
});

export type ConversationToolCall = z.infer<typeof conversationToolCallSchema>;

export const conversationCitationSchema = z.object({
  source: z.string().max(255),
  content: z.string().max(1000),
  entityType: z.string().max(100).optional(),
  entityId: z.string().max(100).optional(),
});

export type ConversationCitation = z.infer<typeof conversationCitationSchema>;

export const conversationMessageSchema = z.object({
  id: z.uuid(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string().datetime(),
  toolCalls: z.array(conversationToolCallSchema).optional(),
  citations: z.array(conversationCitationSchema).optional(),
});

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;

// ============================================================================
// Conversation Context Schema
// ============================================================================

export const conversationContextSchema = z.object({
  domain: z.string().max(50).optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.uuid().optional(),
});

export type ConversationContext = z.infer<typeof conversationContextSchema>;

// ============================================================================
// Conversation Schema
// ============================================================================

export const intelConversationSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  userId: z.uuid(),

  // Metadata
  title: z.string().max(255).optional(),

  // Context
  context: conversationContextSchema.optional(),

  // Messages
  messages: z.array(conversationMessageSchema),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type IntelConversation = z.infer<typeof intelConversationSchema>;

// ============================================================================
// Query Response Source Schema
// ============================================================================

export const queryResponseSourceSchema = z.object({
  type: z.string().max(100),
  id: z.string().max(100),
  relevance: z.number().min(0).max(1),
});

export type QueryResponseSource = z.infer<typeof queryResponseSourceSchema>;

// ============================================================================
// Natural Language Query Response Schema
// ============================================================================

export const nlQueryResponseSchema = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  data: z.unknown().optional(),
  visualization: z.enum(VISUALIZATION_TYPE).optional(),
  followUps: z.array(z.string()).optional(),
  sources: z.array(queryResponseSourceSchema).optional(),
});

export type NlQueryResponse = z.infer<typeof nlQueryResponseSchema>;

// ============================================================================
// Natural Language Query Schema
// ============================================================================

export const naturalLanguageQuerySchema = z.object({
  id: z.uuid(),
  query: z.string(),
  tenantId: z.uuid(),
  userId: z.uuid(),

  // Context
  domain: z.string().max(50).optional(),
  conversationId: z.uuid().optional(),

  // Intent classification
  intent: z.enum(QUERY_INTENT).optional(),

  // Response
  response: nlQueryResponseSchema,

  // Timing
  queryTime: z.string().datetime(),
  responseTimeMs: z.number().int().nonnegative(),
});

export type NaturalLanguageQuery = z.infer<typeof naturalLanguageQuerySchema>;
