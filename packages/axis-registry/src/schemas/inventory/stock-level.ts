/**
 * Stock Level Schema (B06)
 *
 * Tracks quantity at Item + Location + Lot dimension.
 */

import { z } from "zod";

// ============================================================================
// Stock Level Schema
// ============================================================================

export const stockLevelSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Dimensions
  itemId: z.uuid(),
  locationId: z.uuid(),
  lotNumber: z.string().max(100).optional(),

  // Quantities (in base UoM)
  onHand: z.number().default(0),
  reserved: z.number().min(0).default(0),
  available: z.number().default(0), // Computed: onHand - reserved

  // Future quantities
  incoming: z.number().min(0).default(0),
  outgoing: z.number().min(0).default(0),
  projected: z.number().default(0), // Computed: onHand + incoming - outgoing

  // UoM
  baseUomId: z.uuid(),

  // Valuation
  totalCost: z.string().default("0"),
  averageCost: z.string().default("0"),

  // For lot-tracked items
  expiryDate: z.string().datetime().optional(),

  // Metadata
  lastMoveDate: z.string().datetime().optional(),
  lastCountDate: z.string().datetime().optional(),

  updatedAt: z.string().datetime(),
});

export type StockLevel = z.infer<typeof stockLevelSchema>;
