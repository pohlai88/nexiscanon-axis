/**
 * Stock Move Schema (B06)
 *
 * The atomic unit of inventory change.
 */

import { z } from "zod";
import { MOVE_TYPE, MOVE_STATUS, COSTING_METHOD } from "./constants";

// ============================================================================
// Stock Move Line Schema
// ============================================================================

export const stockMoveLineSchema = z.object({
  lineNumber: z.number().int().positive(),

  // Item
  itemId: z.uuid(),
  itemSku: z.string().min(1).max(50),
  itemName: z.string().min(1).max(255),

  // Quantity
  quantity: z.number().positive(),
  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),
  baseQuantity: z.number().positive(),
  baseUomId: z.uuid(),

  // Locations
  fromLocationId: z.uuid().optional(),
  fromLocationName: z.string().max(255).optional(),
  toLocationId: z.uuid().optional(),
  toLocationName: z.string().max(255).optional(),

  // Lot/Serial tracking
  lotNumber: z.string().max(100).optional(),
  serialNumbers: z.array(z.string().max(100)).optional(),
  expiryDate: z.string().datetime().optional(),

  // Costing
  unitCost: z.string(),
  totalCost: z.string(),
  costingMethod: z.enum(COSTING_METHOD),

  // FIFO layer reference
  costLayerId: z.uuid().optional(),

  // Accounts (reference by UUID, not FK per B02)
  inventoryAccountId: z.uuid(),
  contraAccountId: z.uuid(),

  notes: z.string().max(500).optional(),
});

export type StockMoveLine = z.infer<typeof stockMoveLineSchema>;

// ============================================================================
// Stock Move Schema
// ============================================================================

export const stockMoveSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Move details
  moveType: z.enum(MOVE_TYPE),
  status: z.enum(MOVE_STATUS).default("draft"),

  // Source document
  sourceDocumentType: z.string().min(1).max(50),
  sourceDocumentId: z.uuid(),
  sourceDocumentNumber: z.string().max(50),

  // Dates
  scheduledDate: z.string().datetime().optional(),
  movedDate: z.string().datetime().optional(),

  // Lines
  lines: z.array(stockMoveLineSchema).min(1),

  // Totals
  totalQuantity: z.number(),
  totalValue: z.string(),

  // Notes
  notes: z.string().max(2000).optional(),

  // References (B01, B07)
  valuationBatchId: z.uuid().optional(),
  postingBatchId: z.uuid().optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  postedBy: z.uuid().optional(),
  postedAt: z.string().datetime().optional(),
});

export type StockMove = z.infer<typeof stockMoveSchema>;
