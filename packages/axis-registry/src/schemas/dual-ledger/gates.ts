/**
 * Migration Gates Schemas (C04)
 *
 * "When ALL match → GREEN GATES → Safe to cutover"
 */

import { z } from "zod";
import { dualLedgerReconStatusSchema } from "./constants";

// ============================================================================
// Individual Gate Status
// ============================================================================

export const gateStatusSchema = z.object({
  status: dualLedgerReconStatusSchema,
  lastChecked: z.string().datetime(),
  lastReconId: z.string().uuid().optional(),
  variance: z.string(),
  variancePercent: z.number(),
  consecutiveMatchDays: z.number().int().default(0),
});

export type GateStatus = z.infer<typeof gateStatusSchema>;

// ============================================================================
// Migration Gates
// ============================================================================

export const migrationGatesSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Individual gates
  gates: z.object({
    trialBalance: gateStatusSchema,
    arAging: gateStatusSchema,
    apAging: gateStatusSchema,
    inventoryQty: gateStatusSchema,
    inventoryValue: gateStatusSchema,
    openOrders: gateStatusSchema.optional(),
    openPOs: gateStatusSchema.optional(),
    openInvoices: gateStatusSchema.optional(),
    openBills: gateStatusSchema.optional(),
  }),

  // Overall status
  allGatesGreen: z.boolean(),
  greenGateCount: z.number().int(),
  totalGateCount: z.number().int(),
  readyForCutover: z.boolean(),

  // Requirements for cutover
  requiredConsecutiveDays: z.number().int().default(5),
  meetsConsecutiveRequirement: z.boolean(),

  // Blockers
  blockers: z.array(z.string()).default([]),

  evaluatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MigrationGates = z.infer<typeof migrationGatesSchema>;

// ============================================================================
// Gate History
// ============================================================================

export const gateHistoryEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationStateId: z.string().uuid(),

  // Snapshot
  evaluatedAt: z.string().datetime(),
  allGatesGreen: z.boolean(),
  greenGateCount: z.number().int(),
  totalGateCount: z.number().int(),

  // Individual statuses at this point
  gateStatuses: z.record(z.string(), dualLedgerReconStatusSchema),

  // Triggered by
  triggeredByReconRunId: z.string().uuid().optional(),

  createdAt: z.string().datetime(),
});

export type GateHistoryEntry = z.infer<typeof gateHistoryEntrySchema>;

// ============================================================================
// Gate Dashboard
// ============================================================================

export const gateDashboardSchema = z.object({
  migrationStateId: z.string().uuid(),
  migrationMode: z.enum(["mirror", "parallel", "cutover"]),

  // Current gates
  currentGates: migrationGatesSchema,

  // History (last 30 evaluations)
  recentHistory: z.array(gateHistoryEntrySchema).default([]),

  // Trend
  greenTrend: z.array(
    z.object({
      date: z.string().datetime(),
      greenCount: z.number().int(),
      totalCount: z.number().int(),
    })
  ).default([]),

  // Time in mode
  daysInCurrentMode: z.number().int(),
  modeStartDate: z.string().datetime(),

  // Last sync
  lastSyncAt: z.string().datetime().optional(),
  nextScheduledRecon: z.string().datetime().optional(),

  generatedAt: z.string().datetime(),
});

export type GateDashboard = z.infer<typeof gateDashboardSchema>;
