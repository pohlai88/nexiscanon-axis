/**
 * Ledger Posting Registry Schema
 *
 * Single Source of Truth for double-entry postings.
 * Immutable - Debits must equal Credits (500-year invariant).
 */

import { z } from "zod";
import { POSTING_DIRECTION, SCHEMA_URIS } from "./constants";
import { metadataLiteSchema, lineageSchema } from "./common";

// ============================================================================
// Ledger Posting Schema
// ============================================================================

/**
 * Ledger Posting Registry Schema - Immutable double-entry record
 */
export const ledgerPostingRegistrySchema = metadataLiteSchema
  .merge(lineageSchema)
  .extend({
    // Self-describing
    $schema: z.literal(SCHEMA_URIS.ledgerPosting).default(SCHEMA_URIS.ledgerPosting),

    // Discriminator
    entityType: z.literal("ledger_posting"),

    // Posting-specific fields
    economicEventId: z.string().uuid(), // Parent event
    batchId: z.string().uuid(), // Groups DR/CR pairs
    accountId: z.string().uuid(),
    direction: z.enum(POSTING_DIRECTION),
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/), // Always positive
    currency: z.string().length(3).default("USD"),
    postingDate: z.string().datetime(),
    description: z.string().min(1).max(500),

    // Optional metadata
    metadata: z.record(z.string(), z.unknown()).optional(),

    // Reversal tracking
    isReversal: z.boolean().default(false),
  });

/**
 * Ledger Posting Insert Schema
 */
export const ledgerPostingInsertSchema = ledgerPostingRegistrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

/**
 * Posting Batch Schema - Journal entry with balance validation
 */
export const postingBatchSchema = z
  .object({
    batchId: z.string().uuid(),
    postings: z.array(ledgerPostingInsertSchema).min(2),
  })
  .refine(
    (data) => {
      let totalDebits = 0;
      let totalCredits = 0;
      for (const posting of data.postings) {
        const amount = parseFloat(posting.amount);
        if (posting.direction === "debit") {
          totalDebits += amount;
        } else {
          totalCredits += amount;
        }
      }
      return Math.abs(totalDebits - totalCredits) < 0.0001;
    },
    {
      message: "Journal balance violation: Debits must equal Credits",
    }
  );

// ============================================================================
// Drizzle Column Mapping
// ============================================================================

export const ledgerPostingDrizzleMapping = {
  tableName: "ledger_postings",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    tenantId: { type: "uuid", notNull: true, references: "tenants.id" },
    economicEventId: { type: "uuid", notNull: true, references: "economic_events.id" },
    batchId: { type: "uuid", notNull: true },
    accountId: { type: "uuid", notNull: true, references: "accounts.id" },
    direction: { type: "varchar(10)", notNull: true },
    amount: { type: "numeric(19,4)", notNull: true },
    currency: { type: "varchar(3)", notNull: true, default: "'USD'" },
    postingDate: { type: "timestamptz", notNull: true },
    description: { type: "varchar(500)", notNull: true },
    metadata: { type: "jsonb", notNull: false },
    isReversal: { type: "boolean", notNull: true, default: "false" },
    reversalOf: { type: "uuid", notNull: false },
    reversedBy: { type: "uuid", notNull: false },
    createdBy: { type: "uuid", notNull: true, references: "users.id" },
    createdAt: { type: "timestamptz", notNull: true, default: "now()" },
    updatedAt: { type: "timestamptz", notNull: true, default: "now()" },
  },
  indexes: [
    { columns: ["tenantId"], name: "ledger_postings_tenant_id_idx" },
    { columns: ["economicEventId"], name: "ledger_postings_event_id_idx" },
    { columns: ["batchId"], name: "ledger_postings_batch_id_idx" },
    { columns: ["accountId"], name: "ledger_postings_account_id_idx" },
    { columns: ["postingDate"], name: "ledger_postings_date_idx" },
  ],
  immutable: true, // Trigger: prevent UPDATE/DELETE
} as const;
