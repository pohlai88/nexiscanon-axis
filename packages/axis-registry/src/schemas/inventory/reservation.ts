/**
 * Reservation Schema (B06)
 *
 * Commits stock to confirmed sales orders.
 */

import { z } from "zod";
import { RESERVATION_STATUS } from "./constants";

// ============================================================================
// Fulfillment Entry Schema
// ============================================================================

export const fulfillmentEntrySchema = z.object({
  deliveryId: z.uuid(),
  deliveryNumber: z.string().max(50),
  quantityFulfilled: z.number().positive(),
  fulfilledAt: z.string().datetime(),
});

export type FulfillmentEntry = z.infer<typeof fulfillmentEntrySchema>;

// ============================================================================
// Reservation Schema
// ============================================================================

export const reservationSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // What is reserved
  itemId: z.uuid(),
  locationId: z.uuid(),
  lotNumber: z.string().max(100).optional(),

  // How much
  quantityReserved: z.number().positive(),
  quantityFulfilled: z.number().min(0).default(0),
  quantityRemaining: z.number().min(0),
  uomId: z.uuid(),

  // For what (cross-domain reference by UUID, not FK per B02)
  sourceDocumentType: z.literal("sales.order"),
  sourceDocumentId: z.uuid(),
  sourceDocumentNumber: z.string().max(50),
  sourceLineNumber: z.number().int().positive(),

  // Status
  status: z.enum(RESERVATION_STATUS).default("active"),

  // Validity
  reservedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),

  // Fulfillment tracking
  fulfillments: z.array(fulfillmentEntrySchema).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Reservation = z.infer<typeof reservationSchema>;
