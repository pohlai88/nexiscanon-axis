/**
 * Migration State Schema (C01)
 *
 * Tracks the overall migration progress and mode transitions.
 */

import { z } from "zod";
import {
  MIGRATION_MODE,
  SOURCE_SYSTEM_TYPE,
  SYNC_FREQUENCY,
  RECON_STATUS,
} from "./constants";

// ============================================================================
// Reconciliation Status Schema
// ============================================================================

export const reconStatusBlockSchema = z.object({
  trialBalance: z.enum(RECON_STATUS).default("pending"),
  arAging: z.enum(RECON_STATUS).default("pending"),
  apAging: z.enum(RECON_STATUS).default("pending"),
  inventory: z.enum(RECON_STATUS).default("pending"),
});

export type ReconStatusBlock = z.infer<typeof reconStatusBlockSchema>;

// ============================================================================
// Migration State Schema
// ============================================================================

export const migrationStateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Current mode
  currentMode: z.enum(MIGRATION_MODE).default("setup"),

  // Source system
  sourceSystem: z.enum(SOURCE_SYSTEM_TYPE),
  sourceVersion: z.string().max(50).optional(),
  sourceConnectionId: z.string().uuid().optional(),

  // Sync configuration
  lastSyncAt: z.string().datetime().optional(),
  syncFrequency: z.enum(SYNC_FREQUENCY).default("manual"),

  // Reconciliation status
  reconciliationStatus: reconStatusBlockSchema,

  // Gate readiness
  readyForMirror: z.boolean().default(false),
  readyForParallel: z.boolean().default(false),
  readyForCutover: z.boolean().default(false),

  // Milestone dates
  setupStartedAt: z.string().datetime().optional(),
  mirrorStartedAt: z.string().datetime().optional(),
  parallelStartedAt: z.string().datetime().optional(),
  cutoverAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),

  // Metrics
  totalRecordsImported: z.number().int().default(0),
  totalErrors: z.number().int().default(0),
  mappingConfidenceAvg: z.number().min(0).max(1).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type MigrationState = z.infer<typeof migrationStateSchema>;

// ============================================================================
// Migration Transition Requirements
// ============================================================================

export const migrationTransitionRequirementsSchema = z.object({
  setup: z.object({
    next: z.literal("mirror"),
    requires: z.array(z.string()).default([
      "schemaIntrospected",
      "columnsMapped",
      "trialImportSuccess",
    ]),
  }),
  mirror: z.object({
    next: z.literal("parallel"),
    requires: z.array(z.string()).default([
      "trialBalanceMatched",
      "arAgingMatched",
      "apAgingMatched",
      "inventoryMatched",
    ]),
    rollback: z.literal("setup"),
  }),
  parallel: z.object({
    next: z.literal("cutover"),
    requires: z.array(z.string()).default([
      "allGatesGreen",
      "financialSignOff",
      "operationalSignOff",
    ]),
    rollback: z.literal("mirror"),
  }),
  cutover: z.object({
    next: z.literal("completed"),
    requires: z.array(z.string()).default([
      "legacyFrozen",
      "finalDeltaImported",
      "cutoverApproved",
    ]),
    rollback: z.null(),
  }),
  completed: z.object({
    next: z.null(),
    requires: z.array(z.string()).default([]),
  }),
});

export type MigrationTransitionRequirements = z.infer<typeof migrationTransitionRequirementsSchema>;
