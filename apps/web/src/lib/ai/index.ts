/**
 * AI/LLM Integration Layer
 *
 * Pattern: Provider-agnostic AI SDK wrapper with streaming support.
 *
 * Supports:
 * - OpenAI (GPT-4, GPT-4o, etc.)
 * - Anthropic (Claude)
 * - Google (Gemini)
 * - Local/Custom endpoints
 *
 * @see https://sdk.vercel.ai/docs
 */

export { generateText, generateStream, type GenerateOptions } from "./client";
export { createMiddleware, type AIMiddleware } from "./middleware";
export { embedText, embedBatch, type EmbeddingResult } from "./embeddings";
export {
  AI_MODELS,
  getDefaultModel,
  isAIConfigured,
  type AIModel,
  type AIProvider,
} from "./config";
