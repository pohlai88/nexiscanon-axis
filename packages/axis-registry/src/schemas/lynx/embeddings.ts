/**
 * Embeddings Schema (A01-01)
 *
 * Embedding requests and responses.
 */

import { z } from "zod";
import { EMBEDDING_PURPOSE } from "./constants";

// ============================================================================
// Embedding Request Schema
// ============================================================================

export const embeddingRequestSchema = z.object({
  texts: z.array(z.string()),
  model: z.string().max(100).optional(),
  dimensions: z.number().int().positive().optional(),

  // Context
  tenantId: z.uuid(),
  purpose: z.enum(EMBEDDING_PURPOSE),
});

export type EmbeddingRequest = z.infer<typeof embeddingRequestSchema>;

// ============================================================================
// Embedding Response Schema
// ============================================================================

export const embeddingResponseSchema = z.object({
  embeddings: z.array(z.array(z.number())),
  model: z.string(),
  dimensions: z.number().int().positive(),

  // Usage
  totalTokens: z.number().int().nonnegative(),
});

export type EmbeddingResponse = z.infer<typeof embeddingResponseSchema>;

// ============================================================================
// Vector Record Schema (for storage)
// ============================================================================

export const vectorRecordSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  collection: z.string().max(100),
  vector: z.array(z.number()),
  metadata: z.record(z.string(), z.unknown()),
  content: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type VectorRecord = z.infer<typeof vectorRecordSchema>;

// ============================================================================
// Vector Search Result Schema
// ============================================================================

export const vectorMatchSchema = z.object({
  id: z.uuid(),
  score: z.number(),
  metadata: z.record(z.string(), z.unknown()),
  content: z.string().optional(),
});

export type VectorMatch = z.infer<typeof vectorMatchSchema>;
