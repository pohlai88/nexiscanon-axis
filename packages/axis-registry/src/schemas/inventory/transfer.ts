/**
 * Stock Transfer Schema (B06)
 *
 * Moves stock between locations without changing total value.
 */

import { z } from "zod";
import { TRANSFER_STATUS } from "./constants";

// ============================================================================
// Transfer Line Schema
// ============================================================================

export const transferLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Item
  itemId: z.uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),

  // Quantity
  quantity: z.number().positive(),
  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Locations
  fromLocationId: z.uuid(),
  fromLocationName: z.string().max(255),
  toLocationId: z.uuid(),
  toLocationName: z.string().max(255),

  // Lot/Serial
  lotNumber: z.string().max(100).optional(),
  serialNumbers: z.array(z.string().max(100)).optional(),

  // Costing (transfers at current cost)
  unitCost: z.string(),
  totalCost: z.string(),

  notes: z.string().max(500).optional(),
});

export type TransferLine = z.infer<typeof transferLineSchema>;

// ============================================================================
// Stock Transfer Schema
// ============================================================================

export const stockTransferSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Locations (reference by UUID, not FK per B02)
  fromWarehouseId: z.uuid(),
  fromWarehouseName: z.string().max(255),
  toWarehouseId: z.uuid(),
  toWarehouseName: z.string().max(255),

  // Status
  status: z.enum(TRANSFER_STATUS).default("draft"),

  // Dates
  scheduledDate: z.string().datetime().optional(),
  shippedDate: z.string().datetime().optional(),
  receivedDate: z.string().datetime().optional(),

  // Transit
  isInTransit: z.boolean().default(false),
  transitLocationId: z.uuid().optional(),

  // Lines
  lines: z.array(transferLineSchema).min(1),

  // Totals
  totalQuantity: z.number(),
  totalValue: z.string(),

  notes: z.string().max(2000).optional(),

  // Posting reference (B01)
  postingBatchId: z.uuid().optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  shippedBy: z.uuid().optional(),
  receivedBy: z.uuid().optional(),
});

export type StockTransfer = z.infer<typeof stockTransferSchema>;
