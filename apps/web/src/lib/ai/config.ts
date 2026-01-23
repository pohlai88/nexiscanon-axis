/**
 * AI Configuration
 *
 * Environment-based provider configuration with sensible defaults.
 */

/**
 * Supported AI providers.
 */
export type AIProvider = "openai" | "anthropic" | "google" | "custom";

/**
 * AI model configuration.
 */
export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInput: number; // USD
  costPer1kOutput: number; // USD
  supportsStreaming: boolean;
  supportsVision: boolean;
}

/**
 * Available AI models.
 */
export const AI_MODELS: Record<string, AIModel> = {
  // OpenAI
  "gpt-4o": {
    id: "gpt-4o",
    provider: "openai",
    name: "GPT-4o",
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    supportsStreaming: true,
    supportsVision: true,
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    provider: "openai",
    name: "GPT-4o Mini",
    contextWindow: 128000,
    maxOutputTokens: 16384,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    supportsStreaming: true,
    supportsVision: true,
  },
  "gpt-4-turbo": {
    id: "gpt-4-turbo",
    provider: "openai",
    name: "GPT-4 Turbo",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    supportsStreaming: true,
    supportsVision: true,
  },

  // Anthropic
  "claude-sonnet-4-20250514": {
    id: "claude-sonnet-4-20250514",
    provider: "anthropic",
    name: "Claude Sonnet 4",
    contextWindow: 200000,
    maxOutputTokens: 64000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    supportsStreaming: true,
    supportsVision: true,
  },
  "claude-3-5-sonnet-20241022": {
    id: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    contextWindow: 200000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    supportsStreaming: true,
    supportsVision: true,
  },
  "claude-3-haiku-20240307": {
    id: "claude-3-haiku-20240307",
    provider: "anthropic",
    name: "Claude 3 Haiku",
    contextWindow: 200000,
    maxOutputTokens: 4096,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
    supportsStreaming: true,
    supportsVision: true,
  },

  // Google
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash",
    provider: "google",
    name: "Gemini 2.0 Flash",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
    supportsStreaming: true,
    supportsVision: true,
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    provider: "google",
    name: "Gemini 1.5 Pro",
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    supportsStreaming: true,
    supportsVision: true,
  },
} as const;

/**
 * Environment configuration.
 */
export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseUrl: process.env.ANTHROPIC_BASE_URL,
  },
  google: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
  },
  custom: {
    apiKey: process.env.CUSTOM_AI_API_KEY,
    baseUrl: process.env.CUSTOM_AI_BASE_URL,
  },
  // Default model selection
  defaultModel: process.env.AI_DEFAULT_MODEL ?? "gpt-4o-mini",
  // Embedding model
  embeddingModel: process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small",
} as const;

/**
 * Check if AI is configured for a provider.
 */
export function isAIConfigured(provider?: AIProvider): boolean {
  if (!provider) {
    // Check if any provider is configured
    return !!(
      AI_CONFIG.openai.apiKey ||
      AI_CONFIG.anthropic.apiKey ||
      AI_CONFIG.google.apiKey ||
      AI_CONFIG.custom.apiKey
    );
  }

  switch (provider) {
    case "openai":
      return !!AI_CONFIG.openai.apiKey;
    case "anthropic":
      return !!AI_CONFIG.anthropic.apiKey;
    case "google":
      return !!AI_CONFIG.google.apiKey;
    case "custom":
      return !!(AI_CONFIG.custom.apiKey && AI_CONFIG.custom.baseUrl);
    default:
      return false;
  }
}

/**
 * Get the default model configuration.
 */
export function getDefaultModel(): AIModel {
  const modelId = AI_CONFIG.defaultModel;
  const model = AI_MODELS[modelId];

  if (!model) {
    // Fallback to gpt-4o-mini
    return AI_MODELS["gpt-4o-mini"]!;
  }

  return model;
}

/**
 * Get provider for a model.
 */
export function getModelProvider(modelId: string): AIProvider | null {
  const model = AI_MODELS[modelId];
  return model?.provider ?? null;
}
