/**
 * Common Schemas - Shared across all AXIS entities
 *
 * Pattern: Base schema + extensions (like shadcn's registryItemCommonSchema)
 *
 * NOTE: These schemas are designed to be compatible with the existing
 * @axis/db/validation/posting-spine.ts implementation.
 */

import { z } from "zod";
import { DOCUMENT_TYPE, ENTITY_TYPE, SCHEMA_URIS } from "./constants";

// ============================================================================
// 6W1H Context Schema (Audit Trail)
// ============================================================================

/**
 * WHO - Actor identification
 */
export const whoSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string().min(1),
  role: z.string().min(1),
});

/**
 * WHAT - Action description
 * Uses documentType for B1 compatibility (not entityType)
 */
export const whatSchema = z.object({
  action: z.string().min(1),
  description: z.string().min(1),
  documentType: z.enum(DOCUMENT_TYPE),
});

/**
 * WHEN - Temporal context
 */
export const whenSchema = z.object({
  timestamp: z.string().datetime(),
  timezone: z.string().min(1),
  fiscalPeriod: z.string().optional(),
});

/**
 * WHERE - Location/system context
 */
export const whereSchema = z.object({
  system: z.string().min(1).default("AXIS"),
  ipAddress: z.string().optional(),
  geolocation: z.string().optional(),
});

/**
 * WHY - Business justification
 */
export const whySchema = z.object({
  reason: z.string().min(1),
  approvalRef: z.string().optional(),
  policyRef: z.string().optional(),
});

/**
 * WHICH - Entity references
 * Uses documentId for B1 compatibility (not entityId)
 */
export const whichSchema = z.object({
  tenantId: z.string().uuid(),
  documentId: z.string().uuid(),
  relatedEntities: z.array(z.string()).optional(),
});

/**
 * HOW - Method/process used
 */
export const howSchema = z.object({
  method: z.string().min(1),
  validation: z.string().min(1),
  dataSource: z.string().optional(),
});

/**
 * Full 6W1H Context - Complete audit trail
 */
export const sixW1HContextSchema = z.object({
  $schema: z.literal(SCHEMA_URIS.context6w1h).optional(),
  who: whoSchema,
  what: whatSchema,
  when: whenSchema,
  where: whereSchema,
  why: whySchema,
  which: whichSchema,
  how: howSchema,
});

// ============================================================================
// Danger Zone Schema
// ============================================================================

/**
 * Danger Zone Metadata - Tracks risky decisions
 * Compatible with existing B1 implementation
 */
export const dangerZoneSchema = z.object({
  violatesPolicy: z.boolean(),
  policyId: z.string().optional(),
  warning: z.string().optional(),
  overrideReason: z.string().optional(),
  approvedBy: z
    .object({
      userId: z.string().uuid(),
      userName: z.string().min(1),
      timestamp: z.string().datetime(),
    })
    .optional(),
});

// ============================================================================
// Base Entity Schema (Common Fields)
// ============================================================================

/**
 * MetadataLite - Lightweight metadata present on ALL entities
 * (Inspired by shadcn's registryItemCommonSchema)
 */
export const metadataLiteSchema = z.object({
  // Self-describing
  $schema: z.string().optional(),
  version: z.number().int().positive().default(1),

  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Ownership
  createdBy: z.string().uuid(),
  modifiedBy: z.string().uuid(),
});

/**
 * MetadataFull - Extended metadata with 6W1H context
 */
export const metadataFullSchema = metadataLiteSchema.extend({
  context6w1h: sixW1HContextSchema,
  dangerZone: dangerZoneSchema.optional(),
});

// ============================================================================
// Dependency Tracking (for Posting Order)
// ============================================================================

/**
 * Entity Dependency - For topological sorting during posting
 */
export const entityDependencySchema = z.object({
  entityId: z.string().uuid(),
  entityType: z.enum(ENTITY_TYPE),
  relationship: z.enum(["parent", "sibling", "reference"]),
});

/**
 * Lineage Schema - Tracks entity relationships
 */
export const lineageSchema = z.object({
  extends: z.string().uuid().optional(), // Parent entity (inheritance)
  dependencies: z.array(entityDependencySchema).optional(), // Required entities
  reversalOf: z.string().uuid().optional(), // If this reverses another
  reversedBy: z.string().uuid().optional(), // If reversed by another
});
