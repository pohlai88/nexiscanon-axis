/**
 * Sales Quote Schema (B04)
 *
 * Non-binding commitment that captures customer requirements
 * and can convert to Sales Orders.
 */

import { z } from "zod";
import { QUOTE_STATUS } from "./constants";
import { addressSnapshotSchema, salesLineBaseSchema } from "./common";

// ============================================================================
// Quote Line Schema
// ============================================================================

export const salesQuoteLineSchema = salesLineBaseSchema;

export type SalesQuoteLine = z.infer<typeof salesQuoteLineSchema>;

// ============================================================================
// Quote Schema
// ============================================================================

export const salesQuoteSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),

  // Addresses (snapshot at quote time)
  billingAddress: addressSnapshotSchema,
  shippingAddress: addressSnapshotSchema.optional(),

  // Quote specifics
  status: z.enum(QUOTE_STATUS).default("draft"),
  validUntil: z.string().datetime(),

  // Pricing
  priceListId: z.string().uuid().optional(),
  currency: z.string().length(3), // ISO 4217

  // Lines
  lines: z.array(salesQuoteLineSchema).min(1),

  // Totals
  subtotal: z.string(),
  discountTotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),

  // Terms
  paymentTermId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
  termsAndConditions: z.string().max(5000).optional(),

  // Conversion tracking
  convertedToOrderIds: z.array(z.string().uuid()).optional(),

  // Audit
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SalesQuote = z.infer<typeof salesQuoteSchema>;
