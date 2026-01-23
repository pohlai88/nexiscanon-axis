/**
 * Sales Delivery Schema (B04)
 *
 * Records what was shipped to customer,
 * creates stock movements and enables invoicing.
 */

import { z } from "zod";
import { DELIVERY_STATUS } from "./constants";
import { addressSnapshotSchema } from "./common";

// ============================================================================
// Delivery Line Schema
// ============================================================================

export const salesDeliveryLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Source order line reference
  orderLineNumber: z.number().int().positive(),

  // Item
  itemId: z.uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),

  // Quantity
  quantityShipped: z.number().positive(),
  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Location
  fromLocationId: z.uuid(),
  fromLocationName: z.string().max(255),

  // Lot/Serial (if tracked)
  lotNumber: z.string().max(100).optional(),
  serialNumbers: z.array(z.string().max(100)).optional(),

  // Costing (captured at ship time for COGS)
  unitCost: z.string(),
  totalCost: z.string(),

  notes: z.string().max(500).optional(),
});

export type SalesDeliveryLine = z.infer<typeof salesDeliveryLineSchema>;

// ============================================================================
// Delivery Schema
// ============================================================================

export const salesDeliverySchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source
  sourceOrderId: z.uuid(),
  sourceOrderNumber: z.string().max(50),

  // Customer
  customerId: z.uuid(),
  customerName: z.string().max(255),

  // Shipping
  shippingAddress: addressSnapshotSchema,
  shippingMethod: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),

  // Dates
  status: z.enum(DELIVERY_STATUS).default("draft"),
  scheduledDate: z.string().datetime().optional(),
  shippedDate: z.string().datetime().optional(),
  deliveredDate: z.string().datetime().optional(),

  // Warehouse
  warehouseId: z.uuid(),
  warehouseName: z.string().max(255),

  // Lines
  lines: z.array(salesDeliveryLineSchema).min(1),

  // Weights/Dimensions
  totalWeight: z.number().min(0).optional(),
  weightUom: z.string().max(10).optional(),
  packageCount: z.number().int().min(1).optional(),

  // Notes
  notes: z.string().max(2000).optional(),

  // Invoice tracking
  invoiceId: z.uuid().optional(),

  // Posting reference (B01)
  postingBatchId: z.uuid().optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  shippedBy: z.uuid().optional(),
});

export type SalesDelivery = z.infer<typeof salesDeliverySchema>;
