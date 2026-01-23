/**
 * Quorum Feature Set Schema (B10)
 *
 * SME-focused feature configuration.
 */

import { z } from "zod";

// ============================================================================
// Quorum Feature Set Schema
// ============================================================================

export const quorumCoreFeatureSchema = z.object({
  invoicing: z.boolean().default(true),
  payments: z.boolean().default(true),
  expenses: z.boolean().default(true),
  contacts: z.boolean().default(true),
  products: z.boolean().default(true),
  reports: z.boolean().default(true),
});

export const quorumOptionalFeatureSchema = z.object({
  quotes: z.boolean().default(false),
  purchaseOrders: z.boolean().default(false),
  inventory: z.boolean().default(false),
  projects: z.boolean().default(false),
  multiCurrency: z.boolean().default(false),
});

export const quorumLimitsSchema = z.object({
  maxUsers: z.number().int().default(10),
  maxInvoicesPerMonth: z.number().int().default(500),
  maxProducts: z.number().int().default(1000),
  maxContacts: z.number().int().default(5000),
  storageGB: z.number().default(5),
});

export const quorumFeatureSetSchema = z.object({
  // Core features always enabled
  core: quorumCoreFeatureSchema.optional(),

  // Optional features (can be enabled)
  optional: quorumOptionalFeatureSchema.optional(),

  // Hidden features (Cobalt only)
  hidden: z
    .array(z.string())
    .default([
      "advancedGL",
      "costCenters",
      "multiEntity",
      "consolidation",
      "budgeting",
      "customReports",
      "apiAccess",
      "webhooks",
      "customWorkflows",
      "advancedRBAC",
      "auditTrail",
    ]),

  // Limits
  limits: quorumLimitsSchema.optional(),
});

export type QuorumCoreFeatures = z.infer<typeof quorumCoreFeatureSchema>;
export type QuorumOptionalFeatures = z.infer<typeof quorumOptionalFeatureSchema>;
export type QuorumLimits = z.infer<typeof quorumLimitsSchema>;
export type QuorumFeatureSet = z.infer<typeof quorumFeatureSetSchema>;
