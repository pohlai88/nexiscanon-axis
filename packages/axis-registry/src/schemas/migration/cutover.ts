/**
 * Cutover Gates Schema (C01)
 *
 * All gates must be GREEN before cutover.
 */

import { z } from "zod";

// ============================================================================
// Sign-Off Schema
// ============================================================================

export const signOffSchema = z.object({
  signedBy: z.string().uuid().optional(),
  signedAt: z.string().datetime().optional(),
  role: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export type SignOff = z.infer<typeof signOffSchema>;

// ============================================================================
// Cutover Gates Schema
// ============================================================================

export const cutoverGatesSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Balance gates
  trialBalanceMatched: z.boolean().default(false),
  trialBalanceVariance: z.string().default("0"), // Decimal string

  // Subledger gates
  arAgingMatched: z.boolean().default(false),
  arVariance: z.string().default("0"),
  apAgingMatched: z.boolean().default(false),
  apVariance: z.string().default("0"),

  // Inventory gates
  inventoryQtyMatched: z.boolean().default(false),
  inventoryQtyVariance: z.number().int().default(0),
  inventoryValueMatched: z.boolean().default(false),
  inventoryValueVariance: z.string().default("0"),

  // Master data gates
  partiesResolved: z.boolean().default(false),
  unmappedParties: z.number().int().default(0),
  itemsResolved: z.boolean().default(false),
  unmappedItems: z.number().int().default(0),
  accountsMapped: z.boolean().default(false),
  unmappedAccounts: z.number().int().default(0),

  // Operational gates
  openTransactionsMigrated: z.boolean().default(false),
  pendingApprovalsCleared: z.boolean().default(false),

  // Sign-offs
  financialSignOff: signOffSchema.optional(),
  operationalSignOff: signOffSchema.optional(),
  itSignOff: signOffSchema.optional(),

  // Overall status
  allGatesGreen: z.boolean().default(false),
  cutoverApproved: z.boolean().default(false),
  cutoverApprovedBy: z.string().uuid().optional(),
  cutoverApprovedAt: z.string().datetime().optional(),

  // Evaluation
  evaluatedAt: z.string().datetime(),
  evaluatedBy: z.string().uuid().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CutoverGates = z.infer<typeof cutoverGatesSchema>;

// ============================================================================
// Gate Check Result Schema
// ============================================================================

export const gateCheckResultSchema = z.object({
  gateId: z.string(),
  gateName: z.string(),
  passed: z.boolean(),
  currentValue: z.unknown(),
  expectedValue: z.unknown().optional(),
  variance: z.unknown().optional(),
  message: z.string().max(500).optional(),
});

export type GateCheckResult = z.infer<typeof gateCheckResultSchema>;

// ============================================================================
// Cutover Readiness Report Schema
// ============================================================================

export const cutoverReadinessReportSchema = z.object({
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),
  evaluatedAt: z.string().datetime(),

  // Gate results
  gates: z.array(gateCheckResultSchema),

  // Summary
  totalGates: z.number().int(),
  passedGates: z.number().int(),
  failedGates: z.number().int(),
  readyForCutover: z.boolean(),

  // Blockers
  blockers: z.array(z.string()),

  // Recommendations
  recommendations: z.array(z.string()),
});

export type CutoverReadinessReport = z.infer<typeof cutoverReadinessReportSchema>;
