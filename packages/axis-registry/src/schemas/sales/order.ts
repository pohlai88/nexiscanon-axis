/**
 * Sales Order Schema (B04)
 *
 * Binding commitment that drives delivery and invoicing.
 */

import { z } from "zod";
import { ORDER_STATUS } from "./constants";
import { addressSnapshotSchema, salesLineBaseSchema } from "./common";

// ============================================================================
// Order Line Schema
// ============================================================================

export const salesOrderLineSchema = salesLineBaseSchema.extend({
  // Fulfillment tracking
  quantityOrdered: z.number().positive(),
  quantityDelivered: z.number().min(0).default(0),
  quantityInvoiced: z.number().min(0).default(0),
  quantityCancelled: z.number().min(0).default(0),

  // Reservation (optional)
  reservationId: z.string().uuid().optional(),
  reservedLocationId: z.string().uuid().optional(),
});

export type SalesOrderLine = z.infer<typeof salesOrderLineSchema>;

// ============================================================================
// Order Schema
// ============================================================================

export const salesOrderSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source
  sourceQuoteId: z.string().uuid().optional(),

  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),
  customerPO: z.string().max(100).optional(), // Customer's PO number

  // Addresses
  billingAddress: addressSnapshotSchema,
  shippingAddress: addressSnapshotSchema,

  // Order specifics
  status: z.enum(ORDER_STATUS).default("draft"),
  orderDate: z.string().datetime(),
  requestedDeliveryDate: z.string().datetime().optional(),
  promisedDeliveryDate: z.string().datetime().optional(),

  // Pricing
  priceListId: z.string().uuid().optional(),
  currency: z.string().length(3),

  // Lines
  lines: z.array(salesOrderLineSchema).min(1),

  // Totals
  subtotal: z.string(),
  discountTotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),

  // Terms
  paymentTermId: z.string().uuid().optional(),
  shippingMethod: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),

  // Fulfillment tracking
  deliveryIds: z.array(z.string().uuid()).optional(),
  invoiceIds: z.array(z.string().uuid()).optional(),

  // Audit
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  confirmedBy: z.string().uuid().optional(),
  confirmedAt: z.string().datetime().optional(),
});

export type SalesOrder = z.infer<typeof salesOrderSchema>;
