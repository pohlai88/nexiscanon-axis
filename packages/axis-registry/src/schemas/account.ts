/**
 * Account Registry Schema
 *
 * Single Source of Truth for Chart of Accounts entries.
 */

import { z } from "zod";
import { ACCOUNT_TYPE, SCHEMA_URIS } from "./constants";
import { metadataLiteSchema } from "./common";

// ============================================================================
// Account Schema
// ============================================================================

/**
 * Account Registry Schema
 */
export const accountRegistrySchema = metadataLiteSchema.extend({
  // Self-describing
  $schema: z.literal(SCHEMA_URIS.account).default(SCHEMA_URIS.account),

  // Discriminator
  entityType: z.literal("account"),

  // Account-specific fields
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  accountType: z.enum(ACCOUNT_TYPE),
  currency: z.string().length(3).default("USD"),

  // Optional metadata
  metadata: z.record(z.string(), z.unknown()).optional(),

  // Status
  isActive: z.boolean().default(true),
});

/**
 * Account Insert Schema
 */
export const accountInsertSchema = accountRegistrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

/**
 * Account Update Schema
 */
export const accountUpdateSchema = accountRegistrySchema
  .partial()
  .required({ id: true, tenantId: true });

// ============================================================================
// Drizzle Column Mapping
// ============================================================================

export const accountDrizzleMapping = {
  tableName: "accounts",
  columns: {
    id: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    tenantId: { type: "uuid", notNull: true, references: "tenants.id" },
    code: { type: "varchar(20)", notNull: true },
    name: { type: "varchar(255)", notNull: true },
    accountType: { type: "varchar(20)", notNull: true },
    currency: { type: "varchar(3)", notNull: true, default: "'USD'" },
    metadata: { type: "jsonb", notNull: false },
    isActive: { type: "boolean", notNull: true, default: "true" },
    createdBy: { type: "uuid", notNull: true, references: "users.id" },
    modifiedBy: { type: "uuid", notNull: true, references: "users.id" },
    createdAt: { type: "timestamptz", notNull: true, default: "now()" },
    updatedAt: { type: "timestamptz", notNull: true, default: "now()" },
  },
  indexes: [
    { columns: ["tenantId", "code"], unique: true, name: "accounts_tenant_code_idx" },
  ],
} as const;
