/**
 * AI Client
 *
 * Provider-agnostic text generation with Vercel AI SDK.
 *
 * @see https://sdk.vercel.ai/docs
 */

import { generateText as aiGenerateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { logger } from "@/lib/logger";
import {
  AI_CONFIG,
  AI_MODELS,
  getDefaultModel,
  isAIConfigured,
  type AIModel,
  type AIProvider,
} from "./config";

/**
 * Message role types.
 */
export type MessageRole = "system" | "user" | "assistant";

/**
 * Chat message.
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Generation options.
 */
export interface GenerateOptions {
  /** Model ID (e.g., "gpt-4o", "claude-sonnet-4-20250514") */
  model?: string;
  /** System prompt */
  system?: string;
  /** Messages for chat completion */
  messages?: ChatMessage[];
  /** Simple prompt (alternative to messages) */
  prompt?: string;
  /** Max tokens to generate */
  maxTokens?: number;
  /** Temperature (0-2) */
  temperature?: number;
  /** Top P sampling */
  topP?: number;
  /** Stop sequences */
  stop?: string[];
  /** Request ID for logging */
  requestId?: string;
  /** Tenant ID for audit */
  tenantId?: string;
  /** User ID for audit */
  userId?: string;
}

/**
 * Generation result.
 */
export interface GenerateResult {
  text: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

/**
 * Get the AI SDK provider instance.
 */
function getProvider(provider: AIProvider) {
  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey: AI_CONFIG.openai.apiKey,
        baseURL: AI_CONFIG.openai.baseUrl,
      });

    case "anthropic":
      return createAnthropic({
        apiKey: AI_CONFIG.anthropic.apiKey,
        baseURL: AI_CONFIG.anthropic.baseUrl,
      });

    case "google":
      return createGoogleGenerativeAI({
        apiKey: AI_CONFIG.google.apiKey,
      });

    case "custom":
      // Use OpenAI-compatible API for custom endpoints
      return createOpenAI({
        apiKey: AI_CONFIG.custom.apiKey,
        baseURL: AI_CONFIG.custom.baseUrl,
      });

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Resolve model configuration.
 */
function resolveModel(modelId?: string): AIModel {
  if (!modelId) {
    return getDefaultModel();
  }

  const model = AI_MODELS[modelId];
  if (!model) {
    logger.warn("Unknown model, falling back to default", { modelId });
    return getDefaultModel();
  }

  return model;
}

/**
 * Generate text (non-streaming).
 *
 * @example
 * ```ts
 * const result = await generateText({
 *   prompt: "Explain quantum computing in simple terms",
 *   model: "gpt-4o-mini",
 * });
 * console.log(result.text);
 * ```
 */
export async function generateText(
  options: GenerateOptions
): Promise<GenerateResult> {
  const model = resolveModel(options.model);

  if (!isAIConfigured(model.provider)) {
    throw new Error(`AI provider ${model.provider} is not configured`);
  }

  const log = logger.child({
    requestId: options.requestId,
    model: model.id,
    provider: model.provider,
  });

  log.info("Generating text", {
    tenantId: options.tenantId,
    userId: options.userId,
  });

  const startTime = Date.now();

  try {
    const provider = getProvider(model.provider);
    const languageModel = provider(model.id);

    const result = await aiGenerateText({
      model: languageModel,
      system: options.system,
      messages: options.messages,
      prompt: options.prompt,
      maxTokens: options.maxTokens ?? model.maxOutputTokens,
      temperature: options.temperature ?? 0.7,
      topP: options.topP,
      stopSequences: options.stop,
    });

    const duration = Date.now() - startTime;

    log.info("Text generation complete", {
      duration,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      finishReason: result.finishReason,
    });

    return {
      text: result.text,
      finishReason: result.finishReason ?? "stop",
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.promptTokens + result.usage.completionTokens,
      },
      model: model.id,
    };
  } catch (error) {
    log.error("Text generation failed", error);
    throw error;
  }
}

/**
 * Generate text with streaming.
 *
 * Returns a ReadableStream for Server-Sent Events.
 *
 * @example
 * ```ts
 * const stream = await generateStream({
 *   prompt: "Write a poem about the ocean",
 *   model: "claude-sonnet-4-20250514",
 * });
 *
 * return new Response(stream, {
 *   headers: { "Content-Type": "text/event-stream" },
 * });
 * ```
 */
export async function generateStream(
  options: GenerateOptions
): Promise<ReadableStream> {
  const model = resolveModel(options.model);

  if (!isAIConfigured(model.provider)) {
    throw new Error(`AI provider ${model.provider} is not configured`);
  }

  if (!model.supportsStreaming) {
    throw new Error(`Model ${model.id} does not support streaming`);
  }

  const log = logger.child({
    requestId: options.requestId,
    model: model.id,
    provider: model.provider,
  });

  log.info("Starting stream generation", {
    tenantId: options.tenantId,
    userId: options.userId,
  });

  const provider = getProvider(model.provider);
  const languageModel = provider(model.id);

  const result = streamText({
    model: languageModel,
    system: options.system,
    messages: options.messages,
    prompt: options.prompt,
    maxTokens: options.maxTokens ?? model.maxOutputTokens,
    temperature: options.temperature ?? 0.7,
    topP: options.topP,
    stopSequences: options.stop,
    onFinish: (event) => {
      log.info("Stream generation complete", {
        promptTokens: event.usage.promptTokens,
        completionTokens: event.usage.completionTokens,
        finishReason: event.finishReason,
      });
    },
  });

  return result.toDataStream();
}
