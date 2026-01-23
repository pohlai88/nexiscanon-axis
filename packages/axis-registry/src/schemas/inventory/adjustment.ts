/**
 * Stock Adjustment Schema (B06)
 *
 * Reconciles physical counts with book values.
 */

import { z } from "zod";
import { ADJUSTMENT_REASON } from "./constants";

// ============================================================================
// Adjustment Line Schema
// ============================================================================

export const adjustmentLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Item
  itemId: z.uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),

  // Location
  locationId: z.uuid(),
  locationName: z.string().max(255),

  // Lot/Serial
  lotNumber: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),

  // Quantities
  bookQuantity: z.number(),
  countedQuantity: z.number(),
  adjustmentQuantity: z.number(), // counted - book (+ or -)
  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Costing
  unitCost: z.string(),
  totalCost: z.string(),

  // Accounts (reference by UUID, not FK per B02)
  inventoryAccountId: z.uuid(),
  adjustmentAccountId: z.uuid(),

  reason: z.enum(ADJUSTMENT_REASON),
  notes: z.string().max(500).optional(),
});

export type AdjustmentLine = z.infer<typeof adjustmentLineSchema>;

// ============================================================================
// Stock Adjustment Schema
// ============================================================================

export const stockAdjustmentSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Context (reference by UUID, not FK per B02)
  warehouseId: z.uuid(),
  warehouseName: z.string().max(255),
  adjustmentDate: z.string().datetime(),
  reason: z.enum(ADJUSTMENT_REASON),
  reasonDescription: z.string().max(500).optional(),

  // Reference (if from physical count)
  physicalCountId: z.uuid().optional(),

  // Lines
  lines: z.array(adjustmentLineSchema).min(1),

  // Totals
  totalValueAdjustment: z.string(),

  // Approval (Danger Zone)
  requiresApproval: z.boolean().default(true),
  approvedBy: z.uuid().optional(),
  approvedAt: z.string().datetime().optional(),

  notes: z.string().max(2000).optional(),

  // Posting reference (B01)
  postingBatchId: z.uuid().optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  postedBy: z.uuid().optional(),
  postedAt: z.string().datetime().optional(),
});

export type StockAdjustment = z.infer<typeof stockAdjustmentSchema>;
