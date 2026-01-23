/**
 * Purchase Bill Schema (B05)
 *
 * Records supplier's invoice, creates AP entry.
 */

import { z } from "zod";
import { BILL_STATUS, MATCH_STATUS, MATCH_EXCEPTION_TYPE } from "./constants";
import { addressSnapshotSchema } from "./common";

// ============================================================================
// Match Exception Schema
// ============================================================================

export const matchExceptionSchema = z.object({
  lineNumber: z.number().int(),
  exceptionType: z.enum(MATCH_EXCEPTION_TYPE),
  expectedValue: z.string(),
  actualValue: z.string(),
  variance: z.string(),
  approved: z.boolean().default(false),
  approvedBy: z.uuid().optional(),
  approvedAt: z.string().datetime().optional(),
});

export type MatchException = z.infer<typeof matchExceptionSchema>;

// ============================================================================
// Bill Line Schema
// ============================================================================

export const purchaseBillLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Source references
  poLineNumber: z.number().int().optional(),
  poId: z.uuid().optional(),
  receiptLineNumber: z.number().int().optional(),
  receiptId: z.uuid().optional(),

  // Item
  itemId: z.uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),
  itemDescription: z.string().max(500).optional(),

  // Quantity
  quantity: z.number().positive(),
  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Matching quantities
  quantityOrdered: z.number().optional(),
  quantityReceived: z.number().optional(),

  // Pricing
  unitPrice: z.string(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),

  // Tax
  taxCodeId: z.uuid().optional(),
  taxCode: z.string().max(20).optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),

  // Expense/Asset account
  expenseAccountId: z.uuid(),

  // Line total
  lineTotal: z.string(),

  notes: z.string().max(500).optional(),
});

export type PurchaseBillLine = z.infer<typeof purchaseBillLineSchema>;

// ============================================================================
// Bill Schema
// ============================================================================

export const purchaseBillSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),
  supplierInvoiceNumber: z.string().min(1).max(100),

  // Source
  sourcePoIds: z.array(z.uuid()).optional(),
  sourceReceiptIds: z.array(z.uuid()).optional(),

  // Supplier (reference by UUID, not FK per B02)
  supplierId: z.uuid(),
  supplierName: z.string().max(255),
  supplierTaxId: z.string().max(50).optional(),

  // Addresses
  supplierAddress: addressSnapshotSchema,

  // Dates
  status: z.enum(BILL_STATUS).default("draft"),
  billDate: z.string().datetime(),
  receivedDate: z.string().datetime(),
  dueDate: z.string().datetime(),

  // Pricing
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),

  // Lines
  lines: z.array(purchaseBillLineSchema).min(1),

  // Totals
  subtotal: z.string(),
  discountTotal: z.string(),
  taxableAmount: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),

  // Payment tracking
  amountPaid: z.string().default("0"),
  amountDue: z.string(),

  // Terms
  paymentTermId: z.uuid().optional(),

  // Matching status
  matchStatus: z.enum(MATCH_STATUS).default("unmatched"),
  matchExceptions: z.array(matchExceptionSchema).optional(),

  // Notes
  notes: z.string().max(2000).optional(),

  // Accounting references
  apAccountId: z.uuid(),

  // Payment records
  paymentIds: z.array(z.uuid()).optional(),

  // Posting reference (B01)
  postingBatchId: z.uuid().optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  postedBy: z.uuid().optional(),
  postedAt: z.string().datetime().optional(),
});

export type PurchaseBill = z.infer<typeof purchaseBillSchema>;
