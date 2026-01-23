/**
 * Purchase Debit Note Schema (B05)
 *
 * Handles returns, pricing adjustments, and claims.
 */

import { z } from "zod";
import { DEBIT_NOTE_REASON } from "./constants";

// ============================================================================
// Debit Note Line Schema
// ============================================================================

export const debitNoteLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Source bill line reference
  billLineNumber: z.number().int().optional(),

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

export type DebitNoteLine = z.infer<typeof debitNoteLineSchema>;

// ============================================================================
// Debit Note Schema
// ============================================================================

export const purchaseDebitNoteSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source bill
  sourceBillId: z.string().uuid(),
  sourceBillNumber: z.string().max(50),

  // Supplier (reference by UUID, not FK per B02)
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),

  // Debit Note details
  debitNoteDate: z.string().datetime(),
  reason: z.enum(DEBIT_NOTE_REASON),
  reasonDescription: z.string().max(500).optional(),

  // Currency (must match bill)
  currency: z.string().length(3),

  // Lines
  lines: z.array(debitNoteLineSchema).min(1),

  // Totals
  subtotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),

  // Application
  applyToBill: z.boolean().default(true),
  refundRequested: z.boolean().default(false),

  // Return goods (if applicable)
  returnReceiptId: z.string().uuid().optional(),

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

export type PurchaseDebitNote = z.infer<typeof purchaseDebitNoteSchema>;
