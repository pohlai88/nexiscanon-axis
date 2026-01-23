/**
 * Common Schemas - Shared across all AXIS entities
 *
 * Pattern: Base schema + extensions (like shadcn's registryItemCommonSchema)
 *
 * NOTE: These schemas are designed to be compatible with the existing
 * @axis/db/validation/posting-spine.ts implementation.
 *
 * Zod v4 Contract-First:
 * - All schemas use .meta({ id }) with namespaced IDs (axis.*)
 * - Types are inferred via z.infer<typeof schema>
 * - See .cursor/rules/zod.contract-first.delta.mdc
 */

import { z } from "zod";
import { DOCUMENT_TYPE, ENTITY_TYPE, SCHEMA_URIS } from "./constants";

// ============================================================================
// 6W1H Context Schema (Audit Trail)
// ============================================================================

/**
 * WHO - Actor identification
 * @namespace axis.context.who
 */
export const whoSchema = z
  .object({
    userId: z.uuid(),
    userName: z.string().min(1),
    role: z.string().min(1),
  })
  .meta({
    id: "axis.context.who",
    title: "Who Context",
    description: "Actor identification for audit trail (user, role)",
  });

/**
 * WHAT - Action description
 * Uses documentType for B1 compatibility (not entityType)
 * @namespace axis.context.what
 */
export const whatSchema = z
  .object({
    action: z.string().min(1),
    description: z.string().min(1),
    documentType: z.enum(DOCUMENT_TYPE),
  })
  .meta({
    id: "axis.context.what",
    title: "What Context",
    description: "Action description for audit trail (action, documentType)",
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
  tenantId: z.uuid(),
  documentId: z.uuid(),
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
 * @namespace axis.context.6w1h
 */
export const sixW1HContextSchema = z
  .object({
    $schema: z.literal(SCHEMA_URIS.context6w1h).optional(),
    who: whoSchema,
    what: whatSchema,
    when: whenSchema,
    where: whereSchema,
    why: whySchema,
    which: whichSchema,
    how: howSchema,
  })
  .meta({
    id: "axis.context.6w1h",
    title: "6W1H Audit Context",
    description:
      "Complete audit trail context: Who, What, When, Where, Why, Which, How",
  });

// ============================================================================
// Danger Zone Schema
// ============================================================================

/**
 * Danger Zone Metadata - Tracks risky decisions
 * Compatible with existing B1 implementation
 * @namespace axis.controls.dangerZone
 */
export const dangerZoneSchema = z
  .object({
    violatesPolicy: z.boolean(),
    policyId: z.string().optional(),
    warning: z.string().optional(),
    overrideReason: z.string().optional(),
    approvedBy: z
      .object({
        userId: z.uuid(),
        userName: z.string().min(1),
        timestamp: z.string().datetime(),
      })
      .optional(),
  })
  .meta({
    id: "axis.controls.dangerZone",
    title: "Danger Zone Metadata",
    description:
      "Tracks risky decisions that violate policy and require override approval",
  });

// ============================================================================
// Base Entity Schema (Common Fields)
// ============================================================================

/**
 * MetadataLite - Lightweight metadata present on ALL entities
 * (Inspired by shadcn's registryItemCommonSchema)
 * @namespace axis.entity.metadataLite
 */
export const metadataLiteSchema = z
  .object({
    // Self-describing
    $schema: z.string().optional(),
    version: z.number().int().positive().default(1),

    // Identity
    id: z.uuid(),
    tenantId: z.uuid(),

    // Timestamps
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),

    // Ownership
    createdBy: z.uuid(),
    modifiedBy: z.uuid(),
  })
  .meta({
    id: "axis.entity.metadataLite",
    title: "Metadata Lite",
    description:
      "Lightweight metadata present on all entities (id, tenant, timestamps, ownership)",
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
  entityId: z.uuid(),
  entityType: z.enum(ENTITY_TYPE),
  relationship: z.enum(["parent", "sibling", "reference"]),
});

/**
 * Lineage Schema - Tracks entity relationships
 */
export const lineageSchema = z.object({
  extends: z.uuid().optional(), // Parent entity (inheritance)
  dependencies: z.array(entityDependencySchema).optional(), // Required entities
  reversalOf: z.uuid().optional(), // If this reverses another
  reversedBy: z.uuid().optional(), // If reversed by another
});
