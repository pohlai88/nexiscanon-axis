/**
 * Purchase Order Schema (B05)
 *
 * Binding commitment to supplier driving receipt and billing.
 */

import { z } from "zod";
import { PO_STATUS } from "./constants";
import { addressSnapshotSchema, purchaseLineBaseSchema } from "./common";

// ============================================================================
// PO Line Schema
// ============================================================================

export const purchaseOrderLineSchema = purchaseLineBaseSchema.extend({
  // Source PR line reference
  prLineNumber: z.number().int().optional(),
  prId: z.string().uuid().optional(),

  // Override quantity for PO specifics
  quantityOrdered: z.number().positive(),
  quantityReceived: z.number().min(0).default(0),
  quantityBilled: z.number().min(0).default(0),
  quantityCancelled: z.number().min(0).default(0),

  // Delivery
  expectedDeliveryDate: z.string().datetime().optional(),
  deliverToLocationId: z.string().uuid(),
  deliverToLocationName: z.string().max(255),
});

export type PurchaseOrderLine = z.infer<typeof purchaseOrderLineSchema>;

// ============================================================================
// PO Schema
// ============================================================================

export const purchaseOrderSchema = z.object({
  // Identity
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source
  sourcePrIds: z.array(z.string().uuid()).optional(),

  // Supplier (reference by UUID, not FK per B02)
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),
  supplierContactName: z.string().max(255).optional(),
  supplierContactEmail: z.string().email().optional(),

  // Addresses
  supplierAddress: addressSnapshotSchema,
  deliveryAddress: addressSnapshotSchema,

  // PO specifics
  status: z.enum(PO_STATUS).default("draft"),
  orderDate: z.string().datetime(),
  expectedDeliveryDate: z.string().datetime().optional(),

  // Pricing
  priceListId: z.string().uuid().optional(),
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),

  // Lines
  lines: z.array(purchaseOrderLineSchema).min(1),

  // Totals
  subtotal: z.string(),
  discountTotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),

  // Terms
  paymentTermId: z.string().uuid().optional(),
  paymentTermDays: z.number().int().min(0).optional(),
  incoterm: z.string().max(20).optional(),
  shippingMethod: z.string().max(100).optional(),

  // Notes
  notes: z.string().max(2000).optional(),
  supplierNotes: z.string().max(2000).optional(),

  // Receipt/Bill tracking
  receiptIds: z.array(z.string().uuid()).optional(),
  billIds: z.array(z.string().uuid()).optional(),

  // Audit
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  confirmedBy: z.string().uuid().optional(),
  confirmedAt: z.string().datetime().optional(),
});

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
