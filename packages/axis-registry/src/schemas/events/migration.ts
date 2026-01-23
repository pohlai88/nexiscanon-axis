/**
 * Migration Domain Events (C01)
 *
 * Events for migration state machine transitions.
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import {
  MIGRATION_MODE,
  SOURCE_SYSTEM_TYPE,
  RECON_STATUS,
  IMPORT_STATUS,
} from "../migration/constants";

// ============================================================================
// State Transition Events
// ============================================================================

export const migrationStateTransitionEventSchema = createEventSchema(
  "migration.state.transition",
  z.object({
    migrationStateId: z.uuid(),
    fromMode: z.enum(MIGRATION_MODE),
    toMode: z.enum(MIGRATION_MODE),
    gatePassed: z.array(z.string()),
  })
);

export type MigrationStateTransitionEvent = z.infer<typeof migrationStateTransitionEventSchema>;

export const migrationStartedEventSchema = createEventSchema(
  "migration.started",
  z.object({
    migrationStateId: z.uuid(),
    sourceSystem: z.enum(SOURCE_SYSTEM_TYPE),
    sourceVersion: z.string().optional(),
  })
);

export type MigrationStartedEvent = z.infer<typeof migrationStartedEventSchema>;

export const migrationCompletedEventSchema = createEventSchema(
  "migration.completed",
  z.object({
    migrationStateId: z.uuid(),
    totalRecordsImported: z.number().int(),
    durationDays: z.number().int(),
  })
);

export type MigrationCompletedEvent = z.infer<typeof migrationCompletedEventSchema>;

// ============================================================================
// Schema Introspection Events
// ============================================================================

export const schemaIntrospectedEventSchema = createEventSchema(
  "migration.schema.introspected",
  z.object({
    migrationStateId: z.uuid(),
    tablesFound: z.number().int(),
    columnsFound: z.number().int(),
    rowsEstimated: z.number().int().optional(),
  })
);

export type SchemaIntrospectedEvent = z.infer<typeof schemaIntrospectedEventSchema>;

// ============================================================================
// Mapping Events
// ============================================================================

export const mappingAutoDetectedEventSchema = createEventSchema(
  "migration.mapping.auto_detected",
  z.object({
    migrationStateId: z.uuid(),
    totalColumns: z.number().int(),
    autoMapped: z.number().int(),
    needsReview: z.number().int(),
    avgConfidence: z.number().min(0).max(1),
  })
);

export type MappingAutoDetectedEvent = z.infer<typeof mappingAutoDetectedEventSchema>;

export const mappingConfirmedEventSchema = createEventSchema(
  "migration.mapping.confirmed",
  z.object({
    mappingId: z.uuid(),
    sourceColumn: z.string(),
    targetField: z.string(),
    confirmedBy: z.uuid(),
  })
);

export type MappingConfirmedEvent = z.infer<typeof mappingConfirmedEventSchema>;

export const mappingVersionCreatedEventSchema = createEventSchema(
  "migration.mapping.version_created",
  z.object({
    migrationStateId: z.uuid(),
    mappingVersionId: z.uuid(),
    version: z.number().int(),
    totalMappings: z.number().int(),
  })
);

export type MappingVersionCreatedEvent = z.infer<typeof mappingVersionCreatedEventSchema>;

// ============================================================================
// Import Events
// ============================================================================

export const importBatchStartedEventSchema = createEventSchema(
  "migration.import.batch_started",
  z.object({
    importBatchId: z.uuid(),
    migrationStateId: z.uuid(),
    sourceTable: z.string(),
    totalRecords: z.number().int(),
  })
);

export type ImportBatchStartedEvent = z.infer<typeof importBatchStartedEventSchema>;

export const importBatchCompletedEventSchema = createEventSchema(
  "migration.import.batch_completed",
  z.object({
    importBatchId: z.uuid(),
    status: z.enum(IMPORT_STATUS),
    successRecords: z.number().int(),
    errorRecords: z.number().int(),
    durationMs: z.number().int(),
  })
);

export type ImportBatchCompletedEvent = z.infer<typeof importBatchCompletedEventSchema>;

// ============================================================================
// Reconciliation Events
// ============================================================================

export const reconCheckCompletedEventSchema = createEventSchema(
  "migration.recon.check_completed",
  z.object({
    migrationStateId: z.uuid(),
    checkType: z.enum(["trial_balance", "ar_aging", "ap_aging", "inventory"]),
    status: z.enum(RECON_STATUS),
    variance: z.string().optional(),
    legacyValue: z.string(),
    axisValue: z.string(),
  })
);

export type ReconCheckCompletedEvent = z.infer<typeof reconCheckCompletedEventSchema>;

export const allGatesGreenEventSchema = createEventSchema(
  "migration.gates.all_green",
  z.object({
    migrationStateId: z.uuid(),
    gatesPassed: z.array(z.string()),
  })
);

export type AllGatesGreenEvent = z.infer<typeof allGatesGreenEventSchema>;

// ============================================================================
// Cutover Events
// ============================================================================

export const cutoverApprovedEventSchema = createEventSchema(
  "migration.cutover.approved",
  z.object({
    migrationStateId: z.uuid(),
    approvedBy: z.uuid(),
    financialSignOff: z.boolean(),
    operationalSignOff: z.boolean(),
  })
);

export type CutoverApprovedEvent = z.infer<typeof cutoverApprovedEventSchema>;

export const cutoverExecutedEventSchema = createEventSchema(
  "migration.cutover.executed",
  z.object({
    migrationStateId: z.uuid(),
    legacyFrozenAt: z.string().datetime(),
    axisLiveAt: z.string().datetime(),
  })
);

export type CutoverExecutedEvent = z.infer<typeof cutoverExecutedEventSchema>;

// ============================================================================
// Migration Event Union
// ============================================================================

export const migrationEventSchema = z.union([
  migrationStateTransitionEventSchema,
  migrationStartedEventSchema,
  migrationCompletedEventSchema,
  schemaIntrospectedEventSchema,
  mappingAutoDetectedEventSchema,
  mappingConfirmedEventSchema,
  mappingVersionCreatedEventSchema,
  importBatchStartedEventSchema,
  importBatchCompletedEventSchema,
  reconCheckCompletedEventSchema,
  allGatesGreenEventSchema,
  cutoverApprovedEventSchema,
  cutoverExecutedEventSchema,
]);

export type MigrationEvent = z.infer<typeof migrationEventSchema>;
