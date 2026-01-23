/**
 * Subledger Schemas (B07)
 *
 * AR and AP subledger entries.
 */

import { z } from "zod";

// ============================================================================
// AR Subledger Schema
// ============================================================================

export const arSubledgerSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Party (reference by UUID, not FK per B02)
  customerId: z.uuid(),
  customerName: z.string().max(255),

  // Reference (cross-domain reference by UUID, not FK per B02)
  documentType: z.string().min(1).max(50),
  documentId: z.uuid(),
  documentNumber: z.string().max(50),
  documentDate: z.string().datetime(),

  // Amounts
  debitAmount: z.string(),
  creditAmount: z.string(),

  // Currency
  currency: z.string().length(3),
  baseCurrencyAmount: z.string(),

  // GL link
  journalId: z.uuid(),
  postingBatchId: z.uuid(),

  // Dates
  effectiveDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),

  // Payment terms
  paymentTermId: z.uuid().optional(),

  // Reconciliation
  isReconciled: z.boolean().default(false),
  reconciledDocumentId: z.uuid().optional(),

  createdAt: z.string().datetime(),
});

export type ARSubledger = z.infer<typeof arSubledgerSchema>;

// ============================================================================
// AP Subledger Schema
// ============================================================================

export const apSubledgerSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Party (reference by UUID, not FK per B02)
  supplierId: z.uuid(),
  supplierName: z.string().max(255),

  // Reference (cross-domain reference by UUID, not FK per B02)
  documentType: z.string().min(1).max(50),
  documentId: z.uuid(),
  documentNumber: z.string().max(50),
  supplierInvoiceNumber: z.string().max(100).optional(),
  documentDate: z.string().datetime(),

  // Amounts
  debitAmount: z.string(),
  creditAmount: z.string(),

  // Currency
  currency: z.string().length(3),
  baseCurrencyAmount: z.string(),

  // GL link
  journalId: z.uuid(),
  postingBatchId: z.uuid(),

  // Dates
  effectiveDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),

  // Reconciliation
  isReconciled: z.boolean().default(false),

  createdAt: z.string().datetime(),
});

export type APSubledger = z.infer<typeof apSubledgerSchema>;
