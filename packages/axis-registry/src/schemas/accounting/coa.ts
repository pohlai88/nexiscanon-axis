/**
 * Chart of Accounts Schema (B07)
 *
 * Hierarchical structure of all accounts.
 */

import { z } from "zod";
import { GL_ACCOUNT_TYPE, ACCOUNT_STATUS, SUBLEDGER_TYPE } from "./constants";

// ============================================================================
// Account Schema
// ============================================================================

export const accountSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Identity
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),

  // Classification
  accountType: z.enum(GL_ACCOUNT_TYPE),
  normalBalance: z.enum(["debit", "credit"]),

  // Hierarchy
  parentAccountId: z.string().uuid().optional(),
  level: z.number().int().min(0).default(0),
  path: z.string().max(500).optional(),

  // Control account flags
  isControlAccount: z.boolean().default(false),
  subledgerType: z.enum(SUBLEDGER_TYPE).optional(),

  // Behavior
  isPostable: z.boolean().default(true),
  isReconcilable: z.boolean().default(false),
  requiresCostCenter: z.boolean().default(false),
  requiresProject: z.boolean().default(false),

  // Currency
  currencyCode: z.string().length(3).optional(),

  // Tax
  defaultTaxCodeId: z.string().uuid().optional(),

  // Status
  status: z.enum(ACCOUNT_STATUS).default("active"),

  // Opening balance
  openingBalance: z.string().default("0"),
  openingBalanceDate: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type GlAccount = z.infer<typeof accountSchema>;
