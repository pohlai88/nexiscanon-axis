/**
 * COA (Chart of Accounts) Mapping Schemas (C03)
 *
 * "The Machine notices account patterns and balance types."
 */

import { z } from "zod";
import {
  studioMappingStatusSchema,
  coaAccountTypeSchema,
  coaNormalBalanceSchema,
  controlAccountTypeSchema,
} from "./constants";

// ============================================================================
// Balance Validation
// ============================================================================

export const balanceValidationSchema = z.object({
  expectedBalance: z.string(),
  matchesNormalBalance: z.boolean(),
  warning: z.string().optional(),
});

export type BalanceValidation = z.infer<typeof balanceValidationSchema>;

// ============================================================================
// COA Mapping
// ============================================================================

export const coaMappingSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Source account
  sourceCode: z.string(),
  sourceName: z.string(),
  sourceBalance: z.string().optional(),
  sourceParent: z.string().optional(),

  // Machine analysis
  suggestedAccountType: coaAccountTypeSchema,
  suggestedNormalBalance: coaNormalBalanceSchema,
  suggestedIsControl: z.boolean(),
  suggestedControlType: controlAccountTypeSchema.optional(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),

  // Alternatives
  alternatives: z
    .array(
      z.object({
        accountType: coaAccountTypeSchema,
        confidence: z.number().min(0).max(1),
      })
    )
    .default([]),

  // Confirmed mapping (after user review)
  confirmedAccountType: coaAccountTypeSchema.optional(),
  confirmedNormalBalance: coaNormalBalanceSchema.optional(),
  confirmedIsControl: z.boolean().optional(),
  confirmedControlType: controlAccountTypeSchema.optional(),

  // Target AXIS account (if mapped to existing)
  targetAccountId: z.uuid().optional(),
  targetAccountCode: z.string().optional(),

  // Status
  status: studioMappingStatusSchema,

  // Validation
  balanceValidation: balanceValidationSchema.optional(),

  // Review trail
  reviewedBy: z.uuid().optional(),
  reviewedAt: z.string().datetime().optional(),
  reviewNote: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type COAMapping = z.infer<typeof coaMappingSchema>;

// ============================================================================
// COA Validation Summary
// ============================================================================

export const coaValidationSummarySchema = z.object({
  migrationStateId: z.uuid(),

  // Control account checks
  hasARControl: z.boolean(),
  hasAPControl: z.boolean(),
  hasInventoryControl: z.boolean(),
  hasBankAccount: z.boolean(),

  // Balance sheet equation
  totalAssets: z.string(),
  totalLiabilities: z.string(),
  totalEquity: z.string(),
  isBalanced: z.boolean(),
  imbalanceAmount: z.string().optional(),

  // Warnings
  warnings: z.array(z.string()).default([]),

  validatedAt: z.string().datetime(),
});

export type COAValidationSummary = z.infer<typeof coaValidationSummarySchema>;
