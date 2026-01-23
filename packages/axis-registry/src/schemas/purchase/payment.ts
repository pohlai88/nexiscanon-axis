/**
 * Purchase Payment Schema (B05)
 *
 * Records cash/bank payment to supplier and clears AP.
 */

import { z } from "zod";
import { PURCHASE_PAYMENT_STATUS, PURCHASE_PAYMENT_METHOD } from "./constants";

// ============================================================================
// Payment Allocation Schema
// ============================================================================

export const purchasePaymentAllocationSchema = z.object({
  billId: z.string().uuid(),
  billNumber: z.string().max(50),
  supplierInvoiceNumber: z.string().max(100),

  billAmount: z.string(),
  billOutstanding: z.string(),
  amountAllocated: z.string(),

  // Early payment discount
  discountTaken: z.string().default("0"),
});

export type PurchasePaymentAllocation = z.infer<
  typeof purchasePaymentAllocationSchema
>;

// ============================================================================
// Payment Schema
// ============================================================================

export const purchasePaymentSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Supplier (reference by UUID, not FK per B02)
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),

  // Payment details
  status: z.enum(PURCHASE_PAYMENT_STATUS).default("draft"),
  paymentDate: z.string().datetime(),
  paymentMethod: z.enum(PURCHASE_PAYMENT_METHOD),

  // Amounts
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),
  amount: z.string(),

  // Bank/Cash account (reference by UUID, not FK per B02)
  bankAccountId: z.string().uuid(),
  bankAccountName: z.string().max(255),

  // Reference
  referenceNumber: z.string().max(100).optional(),
  checkNumber: z.string().max(50).optional(),

  // Allocation to bills
  allocations: z.array(purchasePaymentAllocationSchema).min(1),

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
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
});

export type PurchasePayment = z.infer<typeof purchasePaymentSchema>;
