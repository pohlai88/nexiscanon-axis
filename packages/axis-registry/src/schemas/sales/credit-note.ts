/**
 * Sales Credit Note Schema (B04)
 *
 * Handles returns, pricing adjustments, and refunds.
 */

import { z } from "zod";
import { CREDIT_NOTE_REASON } from "./constants";

// ============================================================================
// Credit Note Line Schema
// ============================================================================

export const creditNoteLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Source invoice line reference
  invoiceLineNumber: z.number().int().optional(),

  // Item
  itemId: z.string().uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),

  // Quantity
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Pricing
  unitPrice: z.string(),
  discountAmount: z.string().default("0"),

  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),

  // Line total
  lineTotal: z.string(),

  notes: z.string().max(500).optional(),
});

export type CreditNoteLine = z.infer<typeof creditNoteLineSchema>;

// ============================================================================
// Credit Note Schema
// ============================================================================

export const salesCreditNoteSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source invoice
  sourceInvoiceId: z.string().uuid(),
  sourceInvoiceNumber: z.string().max(50),

  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),

  // Credit Note details
  creditNoteDate: z.string().datetime(),
  reason: z.enum(CREDIT_NOTE_REASON),
  reasonDescription: z.string().max(500).optional(),

  // Currency (must match invoice)
  currency: z.string().length(3),

  // Lines
  lines: z.array(creditNoteLineSchema).min(1),

  // Totals
  subtotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),

  // Application
  applyToInvoice: z.boolean().default(true),
  refundRequested: z.boolean().default(false),

  // Notes
  notes: z.string().max(2000).optional(),

  // Posting reference (B01)
  postingBatchId: z.string().uuid().optional(),

  // Audit
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  postedBy: z.string().uuid().optional(),
  postedAt: z.string().datetime().optional(),
});

export type SalesCreditNote = z.infer<typeof salesCreditNoteSchema>;
