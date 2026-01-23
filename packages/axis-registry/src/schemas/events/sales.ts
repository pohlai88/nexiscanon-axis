/**
 * Sales Domain Events
 *
 * Events published by the Sales domain:
 * - Quote lifecycle
 * - Order lifecycle
 * - Delivery lifecycle
 * - Invoice lifecycle
 */

import { z } from "zod";
import { createEventSchema, auditedEventEnvelopeSchema } from "./base";

// ============================================================================
// Quote Events
// ============================================================================

export const quoteCreatedPayloadSchema = z.object({
  quoteId: z.uuid(),
  tenantId: z.uuid(),
  quoteNumber: z.string().min(1),
  customerId: z.uuid(),
  customerName: z.string().min(1), // Denormalized
  totalAmount: z.string(), // Decimal as string
  currency: z.string().length(3),
  validUntil: z.string().datetime(),
  createdBy: z.uuid(),
});

export const quoteCreatedEventSchema = createEventSchema(
  "quote.created",
  quoteCreatedPayloadSchema
);

export type QuoteCreatedEvent = z.infer<typeof quoteCreatedEventSchema>;

// ============================================================================
// Order Events
// ============================================================================

export const orderConfirmedPayloadSchema = z.object({
  orderId: z.uuid(),
  tenantId: z.uuid(),
  orderNumber: z.string().min(1),
  customerId: z.uuid(),
  customerName: z.string().min(1),
  quoteId: z.uuid().optional(), // Source quote if any
  totalAmount: z.string(),
  currency: z.string().length(3),
  confirmedBy: z.uuid(),
  lines: z.array(
    z.object({
      lineId: z.uuid(),
      itemId: z.uuid(),
      itemSku: z.string(),
      itemName: z.string(),
      quantity: z.string(),
      unitPrice: z.string(),
      lineTotal: z.string(),
    })
  ),
});

export const orderConfirmedEventSchema = createEventSchema(
  "order.confirmed",
  orderConfirmedPayloadSchema
);

export type OrderConfirmedEvent = z.infer<typeof orderConfirmedEventSchema>;

// ============================================================================
// Delivery Events
// ============================================================================

export const deliveryShippedPayloadSchema = z.object({
  deliveryId: z.uuid(),
  tenantId: z.uuid(),
  deliveryNumber: z.string().min(1),
  orderId: z.uuid(),
  orderNumber: z.string(),
  customerId: z.uuid(),
  customerName: z.string(),
  warehouseId: z.uuid(),
  warehouseName: z.string(),
  shippedBy: z.uuid(),
  shippedAt: z.string().datetime(),
  lines: z.array(
    z.object({
      lineId: z.uuid(),
      itemId: z.uuid(),
      itemSku: z.string(),
      quantity: z.string(),
    })
  ),
});

export const deliveryShippedEventSchema = createEventSchema(
  "delivery.shipped",
  deliveryShippedPayloadSchema
);

export type DeliveryShippedEvent = z.infer<typeof deliveryShippedEventSchema>;

// ============================================================================
// Invoice Events (Posted = Truth Created)
// ============================================================================

export const invoicePostedPayloadSchema = z.object({
  invoiceId: z.uuid(),
  tenantId: z.uuid(),
  invoiceNumber: z.string().min(1),
  documentId: z.uuid(), // Link to PostingSpine document
  orderId: z.uuid().optional(),
  deliveryId: z.uuid().optional(),
  customerId: z.uuid(),
  customerName: z.string(),
  totalAmount: z.string(),
  taxAmount: z.string(),
  currency: z.string().length(3),
  postingDate: z.string().datetime(),
  fiscalPeriod: z.string(),
  dueDate: z.string().datetime(),
  postedBy: z.uuid(),
  // Event-carried state for Accounting domain
  accountingEntries: z.array(
    z.object({
      accountCode: z.string(),
      accountName: z.string(),
      debit: z.string(),
      credit: z.string(),
    })
  ),
});

export const invoicePostedEventSchema = auditedEventEnvelopeSchema.extend({
  eventType: z.literal("invoice.posted"),
  payload: invoicePostedPayloadSchema,
});

export type InvoicePostedEvent = z.infer<typeof invoicePostedEventSchema>;

// ============================================================================
// All Sales Events Union
// ============================================================================

export const salesEventSchema = z.discriminatedUnion("eventType", [
  quoteCreatedEventSchema,
  orderConfirmedEventSchema,
  deliveryShippedEventSchema,
  invoicePostedEventSchema,
]);

export type SalesEvent = z.infer<typeof salesEventSchema>;
