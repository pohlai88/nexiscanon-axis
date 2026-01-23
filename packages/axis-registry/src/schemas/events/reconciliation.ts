/**
 * Reconciliation Domain Events (B09)
 *
 * Events for Matching, Exception Handling & Truth Verification
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import {
  RECONCILIATION_TYPE,
  RECONCILIATION_STATUS,
  EXCEPTION_TYPE,
  EXCEPTION_SEVERITY,
  RESOLUTION_TYPE,
} from "../reconciliation/constants";

// ============================================================================
// Reconciliation Job Events
// ============================================================================

export const reconciliationJobStartedEventSchema = createEventSchema(
  "reconciliation.started",
  z.object({
    jobId: z.uuid(),
    jobNumber: z.string(),
    reconciliationType: z.enum(RECONCILIATION_TYPE),
    asOfDate: z.string().datetime(),
    sourceType: z.string(),
    targetType: z.string(),
    startedBy: z.uuid(),
  })
);

export type ReconciliationJobStartedEvent = z.infer<typeof reconciliationJobStartedEventSchema>;

export const reconciliationJobCompletedEventSchema = createEventSchema(
  "reconciliation.completed",
  z.object({
    jobId: z.uuid(),
    jobNumber: z.string(),
    status: z.enum(RECONCILIATION_STATUS),
    matchedRecords: z.number().int(),
    unmatchedRecords: z.number().int(),
    exceptionCount: z.number().int(),
    varianceAmount: z.string(),
    completedAt: z.string().datetime(),
  })
);

export type ReconciliationJobCompletedEvent = z.infer<typeof reconciliationJobCompletedEventSchema>;

export const reconciliationJobCancelledEventSchema = createEventSchema(
  "reconciliation.cancelled",
  z.object({
    jobId: z.uuid(),
    jobNumber: z.string(),
    cancelledBy: z.uuid(),
    cancellationReason: z.string().optional(),
  })
);

export type ReconciliationJobCancelledEvent = z.infer<typeof reconciliationJobCancelledEventSchema>;

// ============================================================================
// Match Events
// ============================================================================

export const matchCreatedEventSchema = createEventSchema(
  "match.created",
  z.object({
    matchId: z.uuid(),
    jobId: z.uuid(),
    matchStatus: z.string(),
    sourceType: z.string(),
    sourceId: z.uuid(),
    targetId: z.uuid().optional(),
    matchScore: z.number().optional(),
  })
);

export type MatchCreatedEvent = z.infer<typeof matchCreatedEventSchema>;

export const manualMatchPerformedEventSchema = createEventSchema(
  "match.manual_performed",
  z.object({
    matchId: z.uuid(),
    jobId: z.uuid(),
    sourceId: z.uuid(),
    targetId: z.uuid(),
    matchedBy: z.uuid(),
    matchNotes: z.string().optional(),
  })
);

export type ManualMatchPerformedEvent = z.infer<typeof manualMatchPerformedEventSchema>;

// ============================================================================
// Exception Events
// ============================================================================

export const exceptionCreatedEventSchema = createEventSchema(
  "exception.created",
  z.object({
    exceptionId: z.uuid(),
    jobId: z.uuid(),
    exceptionType: z.enum(EXCEPTION_TYPE),
    severity: z.enum(EXCEPTION_SEVERITY),
    varianceAmount: z.string().optional(),
    description: z.string(),
  })
);

export type ExceptionCreatedEvent = z.infer<typeof exceptionCreatedEventSchema>;

export const exceptionAssignedEventSchema = createEventSchema(
  "exception.assigned",
  z.object({
    exceptionId: z.uuid(),
    jobId: z.uuid(),
    assignedTo: z.uuid(),
    assignedBy: z.uuid(),
  })
);

export type ExceptionAssignedEvent = z.infer<typeof exceptionAssignedEventSchema>;

export const exceptionEscalatedEventSchema = createEventSchema(
  "exception.escalated",
  z.object({
    exceptionId: z.uuid(),
    jobId: z.uuid(),
    escalatedTo: z.uuid().optional(),
    escalationReason: z.string(),
    ageInDays: z.number().int(),
  })
);

export type ExceptionEscalatedEvent = z.infer<typeof exceptionEscalatedEventSchema>;

export const exceptionResolvedEventSchema = createEventSchema(
  "exception.resolved",
  z.object({
    exceptionId: z.uuid(),
    jobId: z.uuid(),
    resolutionType: z.enum(RESOLUTION_TYPE),
    resolvedBy: z.uuid(),
    adjustmentJournalId: z.uuid().optional(),
    resolutionNotes: z.string().optional(),
  })
);

export type ExceptionResolvedEvent = z.infer<typeof exceptionResolvedEventSchema>;

export const exceptionWriteOffApprovedEventSchema = createEventSchema(
  "exception.writeoff_approved",
  z.object({
    exceptionId: z.uuid(),
    jobId: z.uuid(),
    writeOffAmount: z.string(),
    approvedBy: z.uuid(),
    journalId: z.uuid(),
  })
);

export type ExceptionWriteOffApprovedEvent = z.infer<typeof exceptionWriteOffApprovedEventSchema>;

// ============================================================================
// Bank Statement Events
// ============================================================================

export const bankStatementImportedEventSchema = createEventSchema(
  "bankstatement.imported",
  z.object({
    statementId: z.uuid(),
    bankAccountId: z.uuid(),
    statementNumber: z.string(),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    lineCount: z.number().int(),
    openingBalance: z.string(),
    closingBalance: z.string(),
    importedBy: z.uuid(),
  })
);

export type BankStatementImportedEvent = z.infer<typeof bankStatementImportedEventSchema>;

export const bankStatementReconciledEventSchema = createEventSchema(
  "bankstatement.reconciled",
  z.object({
    statementId: z.uuid(),
    jobId: z.uuid(),
    reconciledBy: z.uuid(),
    finalVariance: z.string(),
  })
);

export type BankStatementReconciledEvent = z.infer<typeof bankStatementReconciledEventSchema>;

// ============================================================================
// Reconciliation Event Union
// ============================================================================

export const reconciliationEventSchema = z.union([
  reconciliationJobStartedEventSchema,
  reconciliationJobCompletedEventSchema,
  reconciliationJobCancelledEventSchema,
  matchCreatedEventSchema,
  manualMatchPerformedEventSchema,
  exceptionCreatedEventSchema,
  exceptionAssignedEventSchema,
  exceptionEscalatedEventSchema,
  exceptionResolvedEventSchema,
  exceptionWriteOffApprovedEventSchema,
  bankStatementImportedEventSchema,
  bankStatementReconciledEventSchema,
]);

export type ReconciliationEvent = z.infer<typeof reconciliationEventSchema>;
