/**
 * Alias Resolution Schemas (C03)
 *
 * "Apple ≠ APPLE ≠ Apples Inc. → But they're all the same customer"
 */

import { z } from "zod";
import { duplicateResolutionStatusSchema } from "./constants";

// ============================================================================
// Duplicate Group Member
// ============================================================================

export const duplicateGroupMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceTable: z.string().optional(),
  sourceRowId: z.string().optional(),
  transactionCount: z.number().int().optional(),
  balance: z.string().optional(),
});

export type DuplicateGroupMember = z.infer<typeof duplicateGroupMemberSchema>;

// ============================================================================
// Duplicate Group
// ============================================================================

export const duplicateGroupSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Group type
  entityType: z.enum(["party", "item"]),

  // Normalized form
  normalizedName: z.string(),

  // Members
  members: z.array(duplicateGroupMemberSchema),

  // Machine suggestion
  suggestedCanonicalId: z.string(),
  suggestedCanonicalName: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),

  // Resolution
  status: duplicateResolutionStatusSchema,
  confirmedCanonicalId: z.string().optional(),
  confirmedCanonicalName: z.string().optional(),

  // Review trail
  resolvedBy: z.uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionNote: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DuplicateGroup = z.infer<typeof duplicateGroupSchema>;

// ============================================================================
// Alias Mapping
// ============================================================================

export const aliasMappingSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Entity type
  entityType: z.enum(["party", "item"]),

  // Source (the duplicate)
  sourceId: z.string(),
  sourceName: z.string(),
  sourceTable: z.string().optional(),

  // Canonical (the primary)
  canonicalId: z.string(),
  canonicalName: z.string(),

  // From duplicate group
  duplicateGroupId: z.uuid().optional(),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type AliasMapping = z.infer<typeof aliasMappingSchema>;

// ============================================================================
// Alias Resolution Summary
// ============================================================================

export const aliasResolutionSummarySchema = z.object({
  migrationStateId: z.uuid(),

  // Party duplicates
  partyDuplicateGroups: z.number().int(),
  partyDuplicatesResolved: z.number().int(),
  partyAliasesCreated: z.number().int(),

  // Item duplicates
  itemDuplicateGroups: z.number().int(),
  itemDuplicatesResolved: z.number().int(),
  itemAliasesCreated: z.number().int(),

  // Confidence
  highConfidenceGroups: z.number().int(),
  lowConfidenceGroups: z.number().int(),

  summarizedAt: z.string().datetime(),
});

export type AliasResolutionSummary = z.infer<typeof aliasResolutionSummarySchema>;
