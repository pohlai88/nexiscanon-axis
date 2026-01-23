/**
 * Provider Schema (A01-01)
 *
 * AI provider definitions and configuration.
 */

import { z } from "zod";
import { PROVIDER_ID, PROVIDER_CAPABILITY } from "./constants";

// ============================================================================
// Provider Schema
// ============================================================================

export const lynxProviderSchema = z.object({
  id: z.enum(PROVIDER_ID),
  name: z.string().min(1).max(100),
  capabilities: z.array(z.enum(PROVIDER_CAPABILITY)),
  isEnabled: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export type LynxProvider = z.infer<typeof lynxProviderSchema>;

// ============================================================================
// Provider Config Schema
// ============================================================================

export const providerConfigSchema = z.object({
  providerId: z.enum(PROVIDER_ID),
  apiKeyRef: z.string().max(255), // Reference to secret store
  defaultModel: z.string().max(100).optional(),
  baseUrl: z.string().url().optional(), // For custom endpoints
  options: z.record(z.string(), z.unknown()).optional(),
});

export type ProviderConfig = z.infer<typeof providerConfigSchema>;

// ============================================================================
// Provider Registry Schema
// ============================================================================

export const providerRegistrySchema = z.object({
  tenantId: z.string().uuid(),
  primary: providerConfigSchema,
  secondary: providerConfigSchema.optional(),
  embedding: providerConfigSchema.optional(),
  updatedAt: z.string().datetime(),
});

export type ProviderRegistry = z.infer<typeof providerRegistrySchema>;
