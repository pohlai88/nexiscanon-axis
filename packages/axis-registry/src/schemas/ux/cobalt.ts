/**
 * Cobalt Feature Set Schema (B10)
 *
 * Enterprise-focused feature configuration.
 */

import { z } from "zod";

// ============================================================================
// Cobalt Advanced Features Schema
// ============================================================================

export const cobaltAdvancedFeaturesSchema = z.object({
  // Financial
  advancedGL: z.boolean().default(true),
  costCenters: z.boolean().default(true),
  projects: z.boolean().default(true),
  budgeting: z.boolean().default(true),
  multiCurrency: z.boolean().default(true),
  bankReconciliation: z.boolean().default(true),

  // Multi-entity
  multiEntity: z.boolean().default(true),
  consolidation: z.boolean().default(true),
  intercompany: z.boolean().default(true),

  // Inventory
  advancedInventory: z.boolean().default(true),
  warehouseManagement: z.boolean().default(true),
  lotSerialTracking: z.boolean().default(true),

  // Controls
  advancedRBAC: z.boolean().default(true),
  customWorkflows: z.boolean().default(true),
  auditTrail: z.boolean().default(true),
  segregationOfDuties: z.boolean().default(true),

  // Integration
  apiAccess: z.boolean().default(true),
  webhooks: z.boolean().default(true),
  customIntegrations: z.boolean().default(true),

  // Reporting
  customReports: z.boolean().default(true),
  reportScheduling: z.boolean().default(true),
  dataExport: z.boolean().default(true),
});

export const cobaltLimitsSchema = z.object({
  maxUsers: z.literal(-1), // Unlimited
  maxInvoicesPerMonth: z.literal(-1),
  maxProducts: z.literal(-1),
  maxContacts: z.literal(-1),
  storageGB: z.literal(-1),
});

export const cobaltFeatureSetSchema = z.object({
  // All Quorum features plus...
  includesQuorum: z.boolean().default(true),

  // Advanced features
  advanced: cobaltAdvancedFeaturesSchema.optional(),

  // No limits (all -1 indicates unlimited)
  limits: cobaltLimitsSchema.optional(),
});

export type CobaltAdvancedFeatures = z.infer<typeof cobaltAdvancedFeaturesSchema>;
export type CobaltLimits = z.infer<typeof cobaltLimitsSchema>;
export type CobaltFeatureSet = z.infer<typeof cobaltFeatureSetSchema>;
