/**
 * Physical Count Schema (B06)
 *
 * Reconciliation of physical stock with book values.
 */

import { z } from "zod";
import { COUNT_STATUS, COUNT_TYPE } from "./constants";

// ============================================================================
// Count Line Schema
// ============================================================================

export const countLineSchema = z.object({
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

  // Quantities
  bookQuantity: z.number(),
  countedQuantity: z.number().optional(),
  varianceQuantity: z.number().optional(),

  uomId: z.uuid(),
  uomSymbol: z.string().min(1).max(10),

  // Costing
  unitCost: z.string(),
  varianceValue: z.string().optional(),

  // Count details
  isCounted: z.boolean().default(false),
  countedAt: z.string().datetime().optional(),
  countedBy: z.uuid().optional(),

  // Recount (if variance is large)
  requiresRecount: z.boolean().default(false),
  recountedQuantity: z.number().optional(),
  recountedAt: z.string().datetime().optional(),
  recountedBy: z.uuid().optional(),

  notes: z.string().max(500).optional(),
});

export type CountLine = z.infer<typeof countLineSchema>;

// ============================================================================
// Physical Count Schema
// ============================================================================

export const physicalCountSchema = z.object({
  // Identity
  id: z.uuid(),
  tenantId: z.uuid(),
  documentNumber: z.string().min(1).max(50),

  // Scope (reference by UUID, not FK per B02)
  warehouseId: z.uuid(),
  warehouseName: z.string().max(255),
  locationIds: z.array(z.uuid()).optional(),
  categoryIds: z.array(z.uuid()).optional(),

  // Type
  countType: z.enum(COUNT_TYPE),
  status: z.enum(COUNT_STATUS).default("draft"),

  // Dates
  countDate: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),

  // Counters
  countedBy: z.array(z.uuid()).optional(),
  verifiedBy: z.uuid().optional(),

  // Freeze book values at count start
  bookValuesFrozenAt: z.string().datetime().optional(),

  // Lines
  lines: z.array(countLineSchema),

  // Summary
  totalItems: z.number().int(),
  itemsCounted: z.number().int().default(0),
  itemsWithVariance: z.number().int().default(0),
  totalVarianceValue: z.string().default("0"),

  // Adjustment reference
  adjustmentId: z.uuid().optional(),

  notes: z.string().max(2000).optional(),

  // Audit
  createdBy: z.uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  approvedBy: z.uuid().optional(),
  approvedAt: z.string().datetime().optional(),
});

export type PhysicalCount = z.infer<typeof physicalCountSchema>;
