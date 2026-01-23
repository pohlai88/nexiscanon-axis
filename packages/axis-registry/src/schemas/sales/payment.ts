/**
 * Sales Payment Schema (B04)
 *
 * Records cash/bank receipt from customer and clears AR.
 */

import { z } from "zod";
import { PAYMENT_STATUS, PAYMENT_METHOD } from "./constants";

// ============================================================================
// Payment Allocation Schema
// ============================================================================

export const paymentAllocationSchema = z.object({
  invoiceId: z.string().uuid(),
  invoiceNumber: z.string().max(50),

  invoiceAmount: z.string(), // Original invoice total
  invoiceOutstanding: z.string(), // Outstanding before this payment
  amountAllocated: z.string(), // Amount applied to this invoice

  // Discount/Write-off (if applicable)
  discountTaken: z.string().default("0"),
  writeOffAmount: z.string().default("0"),
});

export type PaymentAllocation = z.infer<typeof paymentAllocationSchema>;

// ============================================================================
// Payment Schema
// ============================================================================

export const salesPaymentSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),

  // Payment details
  status: z.enum(PAYMENT_STATUS).default("draft"),
  paymentDate: z.string().datetime(),
  paymentMethod: z.enum(PAYMENT_METHOD),

  // Amounts
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),
  amount: z.string(), // Total payment amount

  // Bank/Cash account
  bankAccountId: z.string().uuid(),
  bankAccountName: z.string().max(255),

  // Reference
  referenceNumber: z.string().max(100).optional(), // Check number, transfer ref

  // Allocation to invoices
  allocations: z.array(paymentAllocationSchema).min(1),

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

export type SalesPayment = z.infer<typeof salesPaymentSchema>;
