/**
 * Memory Schema (A01-01)
 *
 * Conversation and long-term memory.
 */

import { z } from "zod";
import { messageSchema } from "./text-generation";

// ============================================================================
// Conversation Session Schema
// ============================================================================

export const conversationSessionSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  userId: z.uuid(),

  // Context
  agentId: z.uuid().optional(),
  title: z.string().max(255).optional(),

  // Messages
  messages: z.array(messageSchema),

  // Metadata
  metadata: z.record(z.string(), z.unknown()).optional(),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastMessageAt: z.string().datetime(),
});

export type ConversationSession = z.infer<typeof conversationSessionSchema>;

// ============================================================================
// Interaction Record Schema (Episodic Memory)
// ============================================================================

export const interactionRecordSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  userId: z.uuid(),

  // Interaction
  sessionId: z.uuid(),
  query: z.string(),
  response: z.string(),

  // Embedding
  embedding: z.array(z.number()).optional(),

  // Context
  domain: z.string().max(50).optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.uuid().optional(),

  // Feedback
  wasHelpful: z.boolean().optional(),
  userFeedback: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
});

export type InteractionRecord = z.infer<typeof interactionRecordSchema>;

// ============================================================================
// Document Store Schema (Knowledge Base)
// ============================================================================

export const knowledgeDocumentSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  collection: z.string().max(100),
  title: z.string().max(255),

  // Content
  content: z.string(),
  contentType: z.enum(["text", "markdown", "html"]),

  // Chunks
  chunkIndex: z.number().int().nonnegative().optional(),
  totalChunks: z.number().int().positive().optional(),
  parentDocumentId: z.uuid().optional(),

  // Embedding
  embedding: z.array(z.number()).optional(),

  // Metadata
  source: z.string().max(255).optional(),
  sourceUrl: z.url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type KnowledgeDocument = z.infer<typeof knowledgeDocumentSchema>;
