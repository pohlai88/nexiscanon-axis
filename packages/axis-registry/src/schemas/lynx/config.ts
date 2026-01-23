/**
 * Lynx Configuration Schema (A01-01)
 *
 * Tenant-level Lynx configuration.
 */

import { z } from "zod";
import { providerConfigSchema } from "./provider";

// ============================================================================
// Lynx Feature Toggles Schema
// ============================================================================

export const lynxFeaturesSchema = z.object({
  anomalyDetection: z.boolean().default(false),
  forecasting: z.boolean().default(false),
  documentProcessing: z.boolean().default(false),
  smartAssistant: z.boolean().default(false),
  agentExecution: z.boolean().default(false),
});

export type LynxFeatures = z.infer<typeof lynxFeaturesSchema>;

// ============================================================================
// Lynx Safety Settings Schema
// ============================================================================

export const lynxSafetySettingsSchema = z.object({
  maxTokensPerRequest: z.number().int().positive().default(4096),
  maxRequestsPerMinute: z.number().int().positive().default(60),
  requireApprovalForHighRisk: z.boolean().default(true),
  blockSensitiveData: z.boolean().default(true),
});

export type LynxSafetySettings = z.infer<typeof lynxSafetySettingsSchema>;

// ============================================================================
// Lynx Audit Settings Schema
// ============================================================================

export const lynxAuditSettingsSchema = z.object({
  logAllRequests: z.boolean().default(true),
  retainDays: z.number().int().positive().default(365),
  logInputs: z.boolean().default(true),
  logOutputs: z.boolean().default(true),
});

export type LynxAuditSettings = z.infer<typeof lynxAuditSettingsSchema>;

// ============================================================================
// Lynx Cost Settings Schema
// ============================================================================

export const lynxCostSettingsSchema = z.object({
  monthlyBudget: z.string().optional(), // Decimal string
  alertThreshold: z.number().min(0).max(100).optional(), // Percentage
  hardLimit: z.boolean().default(false), // Stop when budget exceeded
});

export type LynxCostSettings = z.infer<typeof lynxCostSettingsSchema>;

// ============================================================================
// Lynx Provider Settings Schema
// ============================================================================

export const lynxProviderSettingsSchema = z.object({
  primary: providerConfigSchema,
  secondary: providerConfigSchema.optional(),
  embedding: providerConfigSchema.optional(),
});

export type LynxProviderSettings = z.infer<typeof lynxProviderSettingsSchema>;

// ============================================================================
// Lynx Config Schema
// ============================================================================

export const lynxConfigSchema = z.object({
  tenantId: z.uuid(),

  // Provider settings
  providers: lynxProviderSettingsSchema,

  // Feature toggles
  features: lynxFeaturesSchema,

  // Safety settings
  safety: lynxSafetySettingsSchema,

  // Audit settings
  audit: lynxAuditSettingsSchema,

  // Cost settings
  cost: lynxCostSettingsSchema,

  updatedAt: z.string().datetime(),
  updatedBy: z.uuid(),
});

export type LynxConfig = z.infer<typeof lynxConfigSchema>;
