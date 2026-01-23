/**
 * Purchase Receipt (GRN) Schema (B05)
 *
 * Records goods received from supplier, creates stock movements.
 */

import { z } from "zod";
import { RECEIPT_STATUS } from "./constants";

// ============================================================================
// Receipt Line Schema
// ============================================================================

export const purchaseReceiptLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Source PO line reference
  poLineNumber: z.number().int().positive(),

  // Item
  itemId: z.uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),

  // Quantity
  quantityOrdered: z.number().positive(),
  quantityReceived: z.number().positive(),
  quantityAccepted: z.number().min(0).default(0),
  quantityRejected: z.number().min(0).default(0),
  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Location
  toLocationId: z.uuid(),
  toLocationName: z.string().max(255),

  // Lot/Serial
  lotNumber: z.string().max(100).optional(),
  serialNumbers: z.array(z.string().max(100)).optional(),
  expiryDate: z.string().datetime().optional(),

  // Costing
  unitCost: z.string(),
  totalCost: z.string(),

  // Quality
  inspectionStatus: z.enum(["pending", "passed", "failed"]).optional(),
  rejectionReason: z.string().max(500).optional(),

  notes: z.string().max(500).optional(),
});

export type PurchaseReceiptLine = z.infer<typeof purchaseReceiptLineSchema>;

// ============================================================================
// Receipt Schema
// ============================================================================

export const purchaseReceiptSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Source
  sourcePoId: z.uuid(),
  sourcePoNumber: z.string().max(50),

  // Supplier (reference by UUID, not FK per B02)
  supplierId: z.uuid(),
  supplierName: z.string().max(255),

  // Delivery details
  supplierDeliveryNote: z.string().max(100).optional(),
  carrierName: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),

  // Dates
  status: z.enum(RECEIPT_STATUS).default("draft"),
  receivedDate: z.string().datetime(),
  inspectionDate: z.string().datetime().optional(),

  // Warehouse (reference by UUID, not FK per B02)
  warehouseId: z.uuid(),
  warehouseName: z.string().max(255),

  // Lines
  lines: z.array(purchaseReceiptLineSchema).min(1),

  // Quality
  requiresInspection: z.boolean().default(false),
  inspectedBy: z.uuid().optional(),

  // Notes
  notes: z.string().max(2000).optional(),

  // Bill tracking
  billId: z.uuid().optional(),

  // Posting reference (B01)
  postingBatchId: z.uuid().optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  receivedBy: z.uuid().optional(),
});

export type PurchaseReceipt = z.infer<typeof purchaseReceiptSchema>;
