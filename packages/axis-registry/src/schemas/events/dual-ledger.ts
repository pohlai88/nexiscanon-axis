/**
 * Dual Ledger Events (C04)
 *
 * Events published by the Dual Ledger Reconciliation domain.
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import {
  MIGRATION_RECON_TYPE,
  DUAL_LEDGER_RECON_STATUS,
  DUAL_LEDGER_EXCEPTION_TYPE,
  RESOLUTION_ACTION,
} from "../dual-ledger/constants";

// ============================================================================
// Reconciliation Events
// ============================================================================

export const dualLedgerReconStartedEventSchema = createEventSchema(
  "dual_ledger.recon.started",
  z.object({
    reconRunId: z.uuid(),
    migrationStateId: z.uuid(),
    reconTypes: z.array(z.enum(MIGRATION_RECON_TYPE)),
    triggeredBy: z.enum(["scheduled", "manual", "sync_complete"]),
  })
);

export const dualLedgerReconCompletedEventSchema = createEventSchema(
  "dual_ledger.recon.completed",
  z.object({
    reconRunId: z.uuid(),
    migrationStateId: z.uuid(),
    reconType: z.enum(MIGRATION_RECON_TYPE),
    status: z.enum(DUAL_LEDGER_RECON_STATUS),
    legacyTotal: z.string(),
    axisTotal: z.string(),
    variance: z.string(),
    exceptionCount: z.number().int(),
    durationMs: z.number().int(),
  })
);

export const dualLedgerReconMatchedEventSchema = createEventSchema(
  "dual_ledger.recon.matched",
  z.object({
    reconId: z.uuid(),
    reconType: z.enum(MIGRATION_RECON_TYPE),
    variance: z.string(),
  })
);

export const dualLedgerReconVarianceEventSchema = createEventSchema(
  "dual_ledger.recon.variance",
  z.object({
    reconId: z.uuid(),
    reconType: z.enum(MIGRATION_RECON_TYPE),
    variance: z.string(),
    variancePercent: z.number(),
    exceptionCount: z.number().int(),
  })
);

// ============================================================================
// Gate Events
// ============================================================================

export const dualLedgerGatesEvaluatedEventSchema = createEventSchema(
  "dual_ledger.gates.evaluated",
  z.object({
    migrationStateId: z.uuid(),
    allGatesGreen: z.boolean(),
    greenGateCount: z.number().int(),
    totalGateCount: z.number().int(),
    readyForCutover: z.boolean(),
  })
);

export const dualLedgerGateGreenEventSchema = createEventSchema(
  "dual_ledger.gate.green",
  z.object({
    migrationStateId: z.uuid(),
    gateType: z.string(),
    consecutiveMatchDays: z.number().int(),
  })
);

export const dualLedgerGateRedEventSchema = createEventSchema(
  "dual_ledger.gate.red",
  z.object({
    migrationStateId: z.uuid(),
    gateType: z.string(),
    variance: z.string(),
    reason: z.string(),
  })
);

export const dualLedgerAllGatesGreenEventSchema = createEventSchema(
  "dual_ledger.all_gates.green",
  z.object({
    migrationStateId: z.uuid(),
    consecutiveDays: z.number().int(),
    readyForCutover: z.boolean(),
  })
);

// ============================================================================
// Exception Events
// ============================================================================

export const dualLedgerExceptionCreatedEventSchema = createEventSchema(
  "dual_ledger.exception.created",
  z.object({
    exceptionId: z.uuid(),
    reconId: z.uuid(),
    reconType: z.enum(MIGRATION_RECON_TYPE),
    exceptionType: z.enum(DUAL_LEDGER_EXCEPTION_TYPE),
    entityKey: z.string(),
    variance: z.string(),
    suggestedAction: z.string(),
  })
);

export const dualLedgerExceptionAssignedEventSchema = createEventSchema(
  "dual_ledger.exception.assigned",
  z.object({
    exceptionId: z.uuid(),
    assignedTo: z.uuid(),
    assignedBy: z.uuid(),
    priority: z.enum(["critical", "high", "medium", "low"]),
  })
);

export const dualLedgerExceptionResolvedEventSchema = createEventSchema(
  "dual_ledger.exception.resolved",
  z.object({
    exceptionId: z.uuid(),
    resolution: z.enum(RESOLUTION_ACTION),
    resolvedBy: z.uuid(),
    varianceResolved: z.string(),
  })
);

export const dualLedgerExceptionAcceptedEventSchema = createEventSchema(
  "dual_ledger.exception.accepted",
  z.object({
    exceptionId: z.uuid(),
    acceptedBy: z.uuid(),
    reason: z.string(),
    varianceAccepted: z.string(),
  })
);

// ============================================================================
// Mode Transition Events
// ============================================================================

export const dualLedgerModeTransitionRequestedEventSchema = createEventSchema(
  "dual_ledger.mode.transition_requested",
  z.object({
    migrationStateId: z.uuid(),
    fromMode: z.enum(["mirror", "parallel", "cutover"]),
    toMode: z.enum(["mirror", "parallel", "cutover"]),
    requestedBy: z.uuid(),
    allGatesGreen: z.boolean(),
  })
);

export const dualLedgerModeTransitionApprovedEventSchema = createEventSchema(
  "dual_ledger.mode.transition_approved",
  z.object({
    migrationStateId: z.uuid(),
    fromMode: z.enum(["mirror", "parallel", "cutover"]),
    toMode: z.enum(["mirror", "parallel", "cutover"]),
    approvedBy: z.uuid(),
  })
);

// ============================================================================
// Union Type
// ============================================================================

export const dualLedgerEventSchema = z.discriminatedUnion("type", [
  dualLedgerReconStartedEventSchema,
  dualLedgerReconCompletedEventSchema,
  dualLedgerReconMatchedEventSchema,
  dualLedgerReconVarianceEventSchema,
  dualLedgerGatesEvaluatedEventSchema,
  dualLedgerGateGreenEventSchema,
  dualLedgerGateRedEventSchema,
  dualLedgerAllGatesGreenEventSchema,
  dualLedgerExceptionCreatedEventSchema,
  dualLedgerExceptionAssignedEventSchema,
  dualLedgerExceptionResolvedEventSchema,
  dualLedgerExceptionAcceptedEventSchema,
  dualLedgerModeTransitionRequestedEventSchema,
  dualLedgerModeTransitionApprovedEventSchema,
]);

export type DualLedgerEvent = z.infer<typeof dualLedgerEventSchema>;
