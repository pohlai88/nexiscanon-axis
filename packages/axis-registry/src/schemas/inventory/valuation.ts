/**
 * Valuation Schemas (B06)
 *
 * Cost tracking per stock move.
 */

import { z } from "zod";
import { COSTING_METHOD } from "./constants";

// ============================================================================
// Valuation Entry Schema
// ============================================================================

export const valuationEntrySchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Reference
  stockMoveId: z.uuid(),
  stockMoveLineNumber: z.number().int(),

  // Item
  itemId: z.uuid(),
  locationId: z.uuid(),
  lotNumber: z.string().max(100).optional(),

  // Quantity (positive for IN, negative for OUT)
  quantity: z.number(),
  baseUomId: z.uuid(),

  // Costing
  costingMethod: z.enum(COSTING_METHOD),
  unitCost: z.string(),
  totalCost: z.string(),

  // For FIFO
  costLayerId: z.uuid().optional(),

  // For Standard
  standardCost: z.string().optional(),
  priceVariance: z.string().optional(),

  // Running totals (after this entry)
  runningQuantity: z.number(),
  runningValue: z.string(),
  runningAverageCost: z.string(),

  // Dates
  effectiveDate: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type ValuationEntry = z.infer<typeof valuationEntrySchema>;

// ============================================================================
// FIFO Cost Layer Schema
// ============================================================================

export const costLayerSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  itemId: z.uuid(),
  locationId: z.uuid(),
  lotNumber: z.string().max(100).optional(),

  // Original receipt
  receiptMoveId: z.uuid(),
  receiptDate: z.string().datetime(),

  // Quantities
  originalQuantity: z.number().positive(),
  remainingQuantity: z.number().min(0),
  consumedQuantity: z.number().min(0),

  // Cost
  unitCost: z.string(),

  // Status
  isExhausted: z.boolean().default(false),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CostLayer = z.infer<typeof costLayerSchema>;
