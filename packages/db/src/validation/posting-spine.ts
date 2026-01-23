/**
 * Validation schemas for B1 — Posting Spine.
 *
 * SINGLE SOURCE OF TRUTH: @axis/registry
 *
 * This file re-exports schemas from @axis/registry and adds
 * Drizzle-specific schemas (createCoercedInsertSchema, createSelectSchema).
 *
 * Migration:
 * - Core schemas (6W1H, DangerZone) → @axis/registry/schemas
 * - Drizzle schemas (insert/select) → Local (Drizzle-specific)
 * - Form schemas → Local (UI-specific)
 */

import {
  createCoercedInsertSchema,
  createSelectSchema,
  z,
} from "./factory";
import {
  documents,
  economicEvents,
  ledgerPostings,
  accounts,
  DOCUMENT_STATE,
  DOCUMENT_TYPE,
  EVENT_TYPE,
  ACCOUNT_TYPE,
  POSTING_DIRECTION,
} from "../schema";

// ============================================================================
// Re-export from @axis/registry (Single Source of Truth)
// ============================================================================

// Schemas (from registry)
export {
  // 6W1H Context
  sixW1HContextSchema,
  whoSchema,
  whatSchema,
  whenSchema,
  whereSchema,
  whySchema,
  whichSchema,
  howSchema,

  // Danger Zone
  dangerZoneSchema,

  // Posting batch with journal balance validation
  postingBatchSchema,

  // Schema URIs (versioning)
  SCHEMA_URIS,
} from "@axis/registry/schemas";

// NOTE: Constants (DOCUMENT_TYPE, DOCUMENT_STATE, etc.) and types
// are already exported from @axis/db/schema - do not re-export here
// to avoid duplicate export errors.

// ============================================================================
// Drizzle-Specific Schemas (Insert/Select)
// These use drizzle-zod for coercion and cannot be in registry
// ============================================================================

/**
 * Insert document schema (with Drizzle coercion).
 */
export const insertDocumentSchema = createCoercedInsertSchema(documents, {
  documentType: z.enum(DOCUMENT_TYPE),
  state: z.enum(DOCUMENT_STATE).optional(),
  documentNumber: z.string().min(1).max(50),
  documentDate: z.coerce.date(),
  data: z.record(z.string(), z.unknown()),
  // Note: context6w1h validated separately via sixW1HContextSchema
});

/**
 * Select document schema (strict).
 */
export const selectDocumentSchema = createSelectSchema(documents);

/**
 * Insert economic event schema (with Drizzle coercion).
 */
export const insertEconomicEventSchema = createCoercedInsertSchema(economicEvents, {
  eventType: z.enum(EVENT_TYPE),
  description: z.string().min(1).max(500),
  eventDate: z.coerce.date(),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  data: z.record(z.string(), z.unknown()),
  isReversal: z.enum(["true", "false"]).optional(),
});

/**
 * Select economic event schema (strict).
 */
export const selectEconomicEventSchema = createSelectSchema(economicEvents);

/**
 * Insert account schema (with Drizzle coercion).
 */
export const insertAccountSchema = createCoercedInsertSchema(accounts, {
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  accountType: z.enum(ACCOUNT_TYPE),
  currency: z.string().length(3).toUpperCase().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * Select account schema (strict).
 */
export const selectAccountSchema = createSelectSchema(accounts);

/**
 * Insert ledger posting schema (with Drizzle coercion).
 */
export const insertLedgerPostingSchema = createCoercedInsertSchema(ledgerPostings, {
  direction: z.enum(POSTING_DIRECTION),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  currency: z.string().length(3).toUpperCase().optional(),
  postingDate: z.coerce.date(),
  description: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isReversal: z.enum(["true", "false"]).optional(),
});

/**
 * Select ledger posting schema (strict).
 */
export const selectLedgerPostingSchema = createSelectSchema(ledgerPostings);

// ============================================================================
// Form Schemas (UI-specific, not in registry)
// ============================================================================

/**
 * Document state transition schema.
 */
export const documentStateTransitionSchema = z.object({
  documentId: z.uuid(),
  newState: z.enum(DOCUMENT_STATE),
});

/**
 * Submit document form schema.
 */
export const submitDocumentFormSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPE),
  documentDate: z.coerce.date(),
  entityId: z.uuid().optional(),
  data: z.record(z.string(), z.unknown()),
  reason: z.string().min(1).max(500),
});

/**
 * Approve document form schema.
 */
export const approveDocumentFormSchema = z.object({
  documentId: z.uuid(),
  reason: z.string().min(1).max(500),
  overrideReason: z.string().optional(),
});

/**
 * Post document form schema.
 */
export const postDocumentFormSchema = z.object({
  documentId: z.uuid(),
  postingDate: z.coerce.date(),
  reason: z.string().min(1).max(500),
});

/**
 * Reverse document form schema.
 */
export const reverseDocumentFormSchema = z.object({
  documentId: z.uuid(),
  reversalDate: z.coerce.date(),
  reason: z.string().min(1).max(500),
});

/**
 * Single posting entry schema (for form input).
 */
export const postingEntrySchema = z.object({
  accountId: z.uuid(),
  direction: z.enum(POSTING_DIRECTION),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
  description: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// Enum Schemas (for form validation)
// ============================================================================

export const documentStateSchema = z.enum(DOCUMENT_STATE);
export const documentTypeSchema = z.enum(DOCUMENT_TYPE);
export const eventTypeSchema = z.enum(EVENT_TYPE);
export const accountTypeSchema = z.enum(ACCOUNT_TYPE);
export const postingDirectionSchema = z.enum(POSTING_DIRECTION);

// ============================================================================
// Legacy Aliases (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use dangerZoneSchema from @axis/registry/schemas
 */
export { dangerZoneSchema as dangerZoneMetadataSchema } from "@axis/registry/schemas";
