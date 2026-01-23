/**
 * Mapping Studio Events (C03)
 *
 * Events published by the Mapping Studio domain.
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import {
  COA_ACCOUNT_TYPE,
  TAX_TYPE,
  TRIAL_IMPORT_STATUS,
  DUPLICATE_RESOLUTION_STATUS,
} from "../mapping/constants";

// ============================================================================
// COA Mapping Events
// ============================================================================

export const mappingCoaAnalyzedEventSchema = createEventSchema(
  "mapping.coa.analyzed",
  z.object({
    migrationStateId: z.string().uuid(),
    totalAccounts: z.number().int(),
    highConfidenceCount: z.number().int(),
    lowConfidenceCount: z.number().int(),
    controlAccountsFound: z.number().int(),
  })
);

export const mappingCoaConfirmedEventSchema = createEventSchema(
  "mapping.coa.confirmed",
  z.object({
    coaMappingId: z.string().uuid(),
    sourceCode: z.string(),
    originalAccountType: z.enum(COA_ACCOUNT_TYPE),
    confirmedAccountType: z.enum(COA_ACCOUNT_TYPE),
    wasChanged: z.boolean(),
    confirmedBy: z.string().uuid(),
  })
);

export const mappingCoaValidatedEventSchema = createEventSchema(
  "mapping.coa.validated",
  z.object({
    migrationStateId: z.string().uuid(),
    isBalanced: z.boolean(),
    hasARControl: z.boolean(),
    hasAPControl: z.boolean(),
    warningCount: z.number().int(),
  })
);

// ============================================================================
// Alias Resolution Events
// ============================================================================

export const mappingDuplicatesDetectedEventSchema = createEventSchema(
  "mapping.duplicates.detected",
  z.object({
    migrationStateId: z.string().uuid(),
    entityType: z.enum(["party", "item"]),
    groupCount: z.number().int(),
    totalDuplicates: z.number().int(),
    highConfidenceCount: z.number().int(),
  })
);

export const mappingDuplicateResolvedEventSchema = createEventSchema(
  "mapping.duplicate.resolved",
  z.object({
    duplicateGroupId: z.string().uuid(),
    entityType: z.enum(["party", "item"]),
    resolution: z.enum(DUPLICATE_RESOLUTION_STATUS),
    canonicalId: z.string().optional(),
    canonicalName: z.string().optional(),
    aliasesCreated: z.number().int(),
    resolvedBy: z.string().uuid(),
  })
);

export const mappingAliasCreatedEventSchema = createEventSchema(
  "mapping.alias.created",
  z.object({
    aliasMappingId: z.string().uuid(),
    entityType: z.enum(["party", "item"]),
    sourceName: z.string(),
    canonicalName: z.string(),
  })
);

// ============================================================================
// Tax Code Mapping Events
// ============================================================================

export const mappingTaxAnalyzedEventSchema = createEventSchema(
  "mapping.tax.analyzed",
  z.object({
    migrationStateId: z.string().uuid(),
    totalTaxCodes: z.number().int(),
    highConfidenceCount: z.number().int(),
    rateDiscrepancies: z.number().int(),
  })
);

export const mappingTaxConfirmedEventSchema = createEventSchema(
  "mapping.tax.confirmed",
  z.object({
    taxMappingId: z.string().uuid(),
    sourceCode: z.string(),
    confirmedTaxType: z.enum(TAX_TYPE),
    confirmedRate: z.number(),
    confirmedBy: z.string().uuid(),
  })
);

// ============================================================================
// Mapping Version Events
// ============================================================================

export const studioVersionCreatedEventSchema = createEventSchema(
  "mapping.studio.version.created",
  z.object({
    mappingVersionId: z.string().uuid(),
    migrationStateId: z.string().uuid(),
    version: z.number().int(),
    columnMappingCount: z.number().int(),
    coaMappingCount: z.number().int(),
    aliasMappingCount: z.number().int(),
    taxMappingCount: z.number().int(),
    overallConfidence: z.number().min(0).max(1),
  })
);

export const studioVersionActivatedEventSchema = createEventSchema(
  "mapping.studio.version.activated",
  z.object({
    mappingVersionId: z.string().uuid(),
    version: z.number().int(),
    previousVersionId: z.string().uuid().optional(),
  })
);

// ============================================================================
// Trial Import Events
// ============================================================================

export const mappingTrialStartedEventSchema = createEventSchema(
  "mapping.trial.started",
  z.object({
    trialImportId: z.string().uuid(),
    mappingVersionId: z.string().uuid(),
    estimatedRecords: z.number().int(),
  })
);

export const mappingTrialCompletedEventSchema = createEventSchema(
  "mapping.trial.completed",
  z.object({
    trialImportId: z.string().uuid(),
    mappingVersionId: z.string().uuid(),
    status: z.enum(TRIAL_IMPORT_STATUS),
    totalRecords: z.number().int(),
    successCount: z.number().int(),
    errorCount: z.number().int(),
    durationMs: z.number().int(),
  })
);

export const mappingTrialCleanedUpEventSchema = createEventSchema(
  "mapping.trial.cleaned_up",
  z.object({
    trialImportId: z.string().uuid(),
    recordsRemoved: z.number().int(),
  })
);

// ============================================================================
// Bulk Action Events
// ============================================================================

export const mappingBulkAcceptedEventSchema = createEventSchema(
  "mapping.bulk.accepted",
  z.object({
    migrationStateId: z.string().uuid(),
    mappingType: z.enum(["column", "coa", "tax", "all"]),
    confidenceThreshold: z.number().min(0).max(1),
    acceptedCount: z.number().int(),
    acceptedBy: z.string().uuid(),
  })
);

export const mappingReadyForImportEventSchema = createEventSchema(
  "mapping.ready_for_import",
  z.object({
    migrationStateId: z.string().uuid(),
    mappingVersionId: z.string().uuid(),
    totalMappings: z.number().int(),
    overallConfidence: z.number().min(0).max(1),
  })
);

// ============================================================================
// Union Type
// ============================================================================

export const studioEventSchema = z.discriminatedUnion("type", [
  mappingCoaAnalyzedEventSchema,
  mappingCoaConfirmedEventSchema,
  mappingCoaValidatedEventSchema,
  mappingDuplicatesDetectedEventSchema,
  mappingDuplicateResolvedEventSchema,
  mappingAliasCreatedEventSchema,
  mappingTaxAnalyzedEventSchema,
  mappingTaxConfirmedEventSchema,
  studioVersionCreatedEventSchema,
  studioVersionActivatedEventSchema,
  mappingTrialStartedEventSchema,
  mappingTrialCompletedEventSchema,
  mappingTrialCleanedUpEventSchema,
  mappingBulkAcceptedEventSchema,
  mappingReadyForImportEventSchema,
]);

export type StudioEvent = z.infer<typeof studioEventSchema>;
