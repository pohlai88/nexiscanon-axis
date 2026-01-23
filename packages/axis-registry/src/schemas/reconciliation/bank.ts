/**
 * Bank Statement Schema (B09)
 *
 * Bank statement import and line items.
 */

import { z } from "zod";
import { BANK_TRANSACTION_TYPE, IMPORT_SOURCE } from "./constants";

// ============================================================================
// Bank Statement Schema
// ============================================================================

export const bankStatementSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Bank account
  bankAccountId: z.string().uuid(),
  bankAccountName: z.string().max(255),

  // Statement info
  statementNumber: z.string().max(50),
  statementDate: z.string().datetime(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),

  // Balances
  openingBalance: z.string(),
  closingBalance: z.string(),

  // Import info
  importedAt: z.string().datetime(),
  importedBy: z.string().uuid(),
  importSource: z.enum(IMPORT_SOURCE).default("manual"),
  importFileName: z.string().max(255).optional(),

  // Reconciliation
  reconciliationJobId: z.string().uuid().optional(),
  isReconciled: z.boolean().default(false),
  reconciledAt: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
});

export type BankStatement = z.infer<typeof bankStatementSchema>;

// ============================================================================
// Bank Statement Line Schema
// ============================================================================

export const bankStatementLineSchema = z.object({
  id: z.string().uuid(),
  statementId: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Transaction details
  transactionDate: z.string().datetime(),
  valueDate: z.string().datetime().optional(),

  // Type
  transactionType: z.enum(BANK_TRANSACTION_TYPE),

  // Amounts
  debitAmount: z.string().default("0"),
  creditAmount: z.string().default("0"),
  runningBalance: z.string().optional(),

  // Reference
  reference: z.string().max(100).optional(),
  description: z.string().max(500),
  checkNumber: z.string().max(50).optional(),

  // Counterparty
  counterpartyName: z.string().max(255).optional(),
  counterpartyAccount: z.string().max(50).optional(),

  // Matching
  isReconciled: z.boolean().default(false),
  matchedToType: z.string().max(50).optional(),
  matchedToId: z.string().uuid().optional(),
  matchedAt: z.string().datetime().optional(),
  matchedBy: z.string().uuid().optional(),

  createdAt: z.string().datetime(),
});

export type BankStatementLine = z.infer<typeof bankStatementLineSchema>;
