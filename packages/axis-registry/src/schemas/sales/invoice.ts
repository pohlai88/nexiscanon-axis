/**
 * Sales Invoice Schema (B04)
 *
 * Records revenue recognition and creates AR entry.
 */

import { z } from "zod";
import { INVOICE_STATUS } from "./constants";
import { addressSnapshotSchema } from "./common";

// ============================================================================
// Invoice Line Schema
// ============================================================================

export const salesInvoiceLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Source references
  orderLineNumber: z.number().int().optional(),
  deliveryLineNumber: z.number().int().optional(),

  // Item
  itemId: z.string().uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),
  itemDescription: z.string().max(500).optional(),

  // Quantity
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Pricing
  unitPrice: z.string(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),

  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxCode: z.string().max(20).optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),

  // Revenue account (can vary by item/category)
  revenueAccountId: z.string().uuid(),

  // Line total
  lineTotal: z.string(),

  notes: z.string().max(500).optional(),
});

export type SalesInvoiceLine = z.infer<typeof salesInvoiceLineSchema>;

// ============================================================================
// Invoice Schema
// ============================================================================

export const salesInvoiceSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source
  sourceOrderId: z.string().uuid().optional(),
  sourceOrderNumber: z.string().max(50).optional(),
  sourceDeliveryIds: z.array(z.string().uuid()).optional(),

  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),
  customerTaxId: z.string().max(50).optional(),

  // Addresses
  billingAddress: addressSnapshotSchema,

  // Dates
  status: z.enum(INVOICE_STATUS).default("draft"),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),

  // Pricing
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),

  // Lines
  lines: z.array(salesInvoiceLineSchema).min(1),

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
  paymentTermId: z.string().uuid().optional(),
  paymentTermDays: z.number().int().min(0).optional(),

  // Notes
  notes: z.string().max(2000).optional(),

  // Accounting references
  arAccountId: z.string().uuid(),
  revenueAccountId: z.string().uuid(),

  // Payment records
  paymentIds: z.array(z.string().uuid()).optional(),

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

export type SalesInvoice = z.infer<typeof salesInvoiceSchema>;
