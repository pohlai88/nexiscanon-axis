/**
 * AI Middleware
 *
 * Pattern: Language Model Middleware for guardrails, RAG, and augmentation.
 *
 * Inspired by: https://github.com/vercel-labs/ai-sdk-preview-internal-knowledge-base
 *
 * @see https://sdk.vercel.ai/docs/ai-sdk-core/middleware
 */

import type { Experimental_LanguageModelV1Middleware as LanguageModelV1Middleware } from "ai";
import { logger } from "@/lib/logger";

/**
 * AI Middleware type.
 */
export type AIMiddleware = LanguageModelV1Middleware;

/**
 * Middleware options.
 */
export interface MiddlewareOptions {
  /** Request ID for logging */
  requestId?: string;
  /** Tenant ID for context */
  tenantId?: string;
  /** User ID for context */
  userId?: string;
}

/**
 * Create logging middleware.
 *
 * Logs all AI requests and responses for debugging and audit.
 */
export function createLoggingMiddleware(
  options?: MiddlewareOptions
): AIMiddleware {
  const log = logger.child({
    middleware: "logging",
    requestId: options?.requestId,
    tenantId: options?.tenantId,
    userId: options?.userId,
  });

  return {
    wrapGenerate: async ({ doGenerate, params }) => {
      const startTime = Date.now();
      log.info("AI generation started", {
        maxTokens: params.maxTokens,
      });

      try {
        const result = await doGenerate();
        const duration = Date.now() - startTime;

        log.info("AI generation completed", {
          duration,
          finishReason: result.finishReason,
          usage: result.usage,
        });

        return result;
      } catch (error) {
        log.error("AI generation failed", error);
        throw error;
      }
    },

    wrapStream: async ({ doStream, params }) => {
      const startTime = Date.now();
      log.info("AI stream started", {
        maxTokens: params.maxTokens,
      });

      const result = await doStream();

      // Wrap the stream to log completion
      const originalTransform = result.stream;
      let totalTokens = 0;

      const transformedStream = originalTransform.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            if (chunk.type === "text-delta") {
              totalTokens += 1; // Approximate
            }
            controller.enqueue(chunk);
          },
          flush() {
            const duration = Date.now() - startTime;
            log.info("AI stream completed", { duration, totalTokens });
          },
        })
      );

      return { ...result, stream: transformedStream };
    },
  };
}

/**
 * Create RAG (Retrieval-Augmented Generation) middleware.
 *
 * Injects relevant context from knowledge base into prompts.
 */
export function createRAGMiddleware(
  retriever: (query: string) => Promise<string[]>,
  options?: MiddlewareOptions & { maxChunks?: number }
): AIMiddleware {
  const log = logger.child({
    middleware: "rag",
    requestId: options?.requestId,
  });

  const maxChunks = options?.maxChunks ?? 5;

  return {
    transformParams: async ({ params }) => {
      // Extract query from prompt or last user message
      let query = "";

      if (params.prompt && typeof params.prompt === "string") {
        query = params.prompt;
      } else if (Array.isArray(params.prompt)) {
        const lastUserMessage = [...params.prompt]
          .reverse()
          .find((m) => m.role === "user");
        if (
          lastUserMessage &&
          Array.isArray(lastUserMessage.content) &&
          lastUserMessage.content[0]?.type === "text"
        ) {
          query = lastUserMessage.content[0].text;
        }
      }

      if (!query) {
        return params;
      }

      log.info("Retrieving context for RAG", { query: query.slice(0, 100) });

      try {
        const chunks = await retriever(query);
        const relevantChunks = chunks.slice(0, maxChunks);

        if (relevantChunks.length === 0) {
          return params;
        }

        // Inject context into system prompt
        const contextPrefix = `Use the following context to answer the user's question:\n\n${relevantChunks.join("\n\n---\n\n")}\n\n---\n\nNow answer the user's question:`;

        const existingSystem =
          params.prompt && typeof params.prompt !== "string"
            ? params.prompt.find((m) => m.role === "system")
            : null;

        if (existingSystem && Array.isArray(params.prompt)) {
          // Prepend to existing system prompt
          const systemContent = existingSystem.content;
          if (Array.isArray(systemContent) && systemContent[0]?.type === "text") {
            systemContent[0].text = `${contextPrefix}\n\n${systemContent[0].text}`;
          }
        }

        log.info("RAG context injected", {
          chunksCount: relevantChunks.length,
        });

        return params;
      } catch (error) {
        log.error("RAG retrieval failed, continuing without context", error);
        return params;
      }
    },
  };
}

/**
 * Create guardrails middleware.
 *
 * Filters content for safety and compliance.
 */
export function createGuardrailsMiddleware(
  options?: MiddlewareOptions & {
    blockedPatterns?: RegExp[];
    maxOutputLength?: number;
  }
): AIMiddleware {
  const log = logger.child({
    middleware: "guardrails",
    requestId: options?.requestId,
  });

  const blockedPatterns = options?.blockedPatterns ?? [
    /\b(password|secret|api[_-]?key|token)\s*[:=]\s*\S+/gi,
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
    /\b\d{16}\b/g, // Credit card pattern (simplified)
  ];

  const maxOutputLength = options?.maxOutputLength ?? 50000;

  return {
    wrapGenerate: async ({ doGenerate }) => {
      const result = await doGenerate();

      // Check for blocked patterns in output
      let text = result.text ?? "";

      for (const pattern of blockedPatterns) {
        if (pattern.test(text)) {
          log.warn("Blocked pattern detected in output, redacting");
          text = text.replace(pattern, "[REDACTED]");
        }
      }

      // Truncate if too long
      if (text.length > maxOutputLength) {
        log.warn("Output exceeded max length, truncating");
        text = text.slice(0, maxOutputLength) + "...[truncated]";
      }

      return { ...result, text };
    },
  };
}

/**
 * Combine multiple middlewares into one.
 */
export function createMiddleware(
  ...middlewares: AIMiddleware[]
): AIMiddleware {
  return {
    transformParams: async (options) => {
      let params = options.params;
      for (const mw of middlewares) {
        if (mw.transformParams) {
          params = await mw.transformParams({ ...options, params });
        }
      }
      return params;
    },

    wrapGenerate: async (options) => {
      let doGenerate = options.doGenerate;

      // Wrap from last to first
      for (const mw of [...middlewares].reverse()) {
        if (mw.wrapGenerate) {
          const currentDoGenerate = doGenerate;
          const currentMw = mw;
          doGenerate = async () =>
            currentMw.wrapGenerate!({
              ...options,
              doGenerate: currentDoGenerate,
            });
        }
      }

      return doGenerate();
    },

    wrapStream: async (options) => {
      let doStream = options.doStream;

      // Wrap from last to first
      for (const mw of [...middlewares].reverse()) {
        if (mw.wrapStream) {
          const currentDoStream = doStream;
          const currentMw = mw;
          doStream = async () =>
            currentMw.wrapStream!({ ...options, doStream: currentDoStream });
        }
      }

      return doStream();
    },
  };
}
