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
  reservationId: z.uuid().optional(),
  reservedLocationId: z.uuid().optional(),
});

export type SalesOrderLine = z.infer<typeof salesOrderLineSchema>;

// ============================================================================
// Order Schema
// ============================================================================

export const salesOrderSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source
  sourceQuoteId: z.uuid().optional(),

  // Customer
  customerId: z.uuid(),
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
  priceListId: z.uuid().optional(),
  currency: z.string().length(3),

  // Lines
  lines: z.array(salesOrderLineSchema).min(1),

  // Totals
  subtotal: z.string(),
  discountTotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),

  // Terms
  paymentTermId: z.uuid().optional(),
  shippingMethod: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),

  // Fulfillment tracking
  deliveryIds: z.array(z.uuid()).optional(),
  invoiceIds: z.array(z.uuid()).optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  confirmedBy: z.uuid().optional(),
  confirmedAt: z.string().datetime().optional(),
});

export type SalesOrder = z.infer<typeof salesOrderSchema>;
