/**
 * Embeddings Service
 *
 * Pattern: Text embeddings for semantic search and RAG.
 *
 * Supports pgvector for PostgreSQL-based vector storage.
 */

import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { logger } from "@/lib/logger";
import { AI_CONFIG, isAIConfigured } from "./config";

/**
 * Embedding result.
 */
export interface EmbeddingResult {
  embedding: number[];
  usage: {
    tokens: number;
  };
}

/**
 * Batch embedding result.
 */
export interface BatchEmbeddingResult {
  embeddings: number[][];
  usage: {
    tokens: number;
  };
}

/**
 * Get the embedding model.
 */
function getEmbeddingModel() {
  if (!isAIConfigured("openai")) {
    throw new Error("OpenAI is not configured for embeddings");
  }

  const openai = createOpenAI({
    apiKey: AI_CONFIG.openai.apiKey,
    baseURL: AI_CONFIG.openai.baseUrl,
  });

  return openai.embedding(AI_CONFIG.embeddingModel);
}

/**
 * Generate embedding for a single text.
 *
 * @example
 * ```ts
 * const result = await embedText("What is the meaning of life?");
 * // result.embedding is a 1536-dimensional vector (for text-embedding-3-small)
 * ```
 */
export async function embedText(text: string): Promise<EmbeddingResult> {
  const log = logger.child({ operation: "embedText" });

  try {
    const result = await embed({
      model: getEmbeddingModel(),
      value: text,
    });

    log.debug("Embedding generated", { tokens: result.usage.tokens });

    return {
      embedding: result.embedding,
      usage: { tokens: result.usage.tokens },
    };
  } catch (error) {
    log.error("Embedding generation failed", error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts.
 *
 * More efficient than calling embedText multiple times.
 *
 * @example
 * ```ts
 * const result = await embedBatch([
 *   "First document",
 *   "Second document",
 *   "Third document",
 * ]);
 * // result.embeddings is an array of vectors
 * ```
 */
export async function embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
  const log = logger.child({ operation: "embedBatch" });

  if (texts.length === 0) {
    return { embeddings: [], usage: { tokens: 0 } };
  }

  try {
    const result = await embedMany({
      model: getEmbeddingModel(),
      values: texts,
    });

    log.debug("Batch embeddings generated", {
      count: texts.length,
      tokens: result.usage.tokens,
    });

    return {
      embeddings: result.embeddings,
      usage: { tokens: result.usage.tokens },
    };
  } catch (error) {
    log.error("Batch embedding generation failed", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors.
 *
 * @example
 * ```ts
 * const similarity = cosineSimilarity(embedding1, embedding2);
 * // Returns a value between -1 and 1 (1 = identical)
 * ```
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Chunk text for embedding.
 *
 * Large texts should be split into smaller chunks for better retrieval.
 *
 * @example
 * ```ts
 * const chunks = chunkText(longDocument, { maxChunkSize: 500, overlap: 50 });
 * const embeddings = await embedBatch(chunks);
 * ```
 */
export function chunkText(
  text: string,
  options: { maxChunkSize?: number; overlap?: number } = {}
): string[] {
  const { maxChunkSize = 500, overlap = 50 } = options;

  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChunkSize;

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start + maxChunkSize / 2) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, Math.min(end, text.length)).trim());
    start = end - overlap;

    // Prevent infinite loop
    if (start >= text.length - overlap) {
      break;
    }
  }

  return chunks.filter((chunk) => chunk.length > 0);
}
