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
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Reference
  stockMoveId: z.string().uuid(),
  stockMoveLineNumber: z.number().int(),

  // Item
  itemId: z.string().uuid(),
  locationId: z.string().uuid(),
  lotNumber: z.string().max(100).optional(),

  // Quantity (positive for IN, negative for OUT)
  quantity: z.number(),
  baseUomId: z.string().uuid(),

  // Costing
  costingMethod: z.enum(COSTING_METHOD),
  unitCost: z.string(),
  totalCost: z.string(),

  // For FIFO
  costLayerId: z.string().uuid().optional(),

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
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  itemId: z.string().uuid(),
  locationId: z.string().uuid(),
  lotNumber: z.string().max(100).optional(),

  // Original receipt
  receiptMoveId: z.string().uuid(),
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
