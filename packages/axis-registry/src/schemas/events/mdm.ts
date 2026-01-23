/**
 * MDM Domain Events
 *
 * Events published by the Master Data Management domain:
 * - Party (Customer/Supplier) lifecycle
 * - Item lifecycle
 */

import { z } from "zod";
import { createEventSchema } from "./base";

// ============================================================================
// Party Events
// ============================================================================

export const partyCreatedPayloadSchema = z.object({
  partyId: z.string().uuid(),
  tenantId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["customer", "supplier", "both"]),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  createdBy: z.string().uuid(),
});

export const partyCreatedEventSchema = createEventSchema(
  "party.created",
  partyCreatedPayloadSchema
);

export type PartyCreatedEvent = z.infer<typeof partyCreatedEventSchema>;

export const partyUpdatedPayloadSchema = z.object({
  partyId: z.string().uuid(),
  tenantId: z.string().uuid(),
  changes: z.record(z.string(), z.unknown()),
  updatedBy: z.string().uuid(),
});

export const partyUpdatedEventSchema = createEventSchema(
  "party.updated",
  partyUpdatedPayloadSchema
);

export type PartyUpdatedEvent = z.infer<typeof partyUpdatedEventSchema>;

// ============================================================================
// Item Events
// ============================================================================

export const itemCreatedPayloadSchema = z.object({
  itemId: z.string().uuid(),
  tenantId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unitOfMeasure: z.string().min(1),
  isActive: z.boolean().default(true),
  createdBy: z.string().uuid(),
});

export const itemCreatedEventSchema = createEventSchema(
  "item.created",
  itemCreatedPayloadSchema
);

export type ItemCreatedEvent = z.infer<typeof itemCreatedEventSchema>;

export const itemUpdatedPayloadSchema = z.object({
  itemId: z.string().uuid(),
  tenantId: z.string().uuid(),
  changes: z.record(z.string(), z.unknown()),
  updatedBy: z.string().uuid(),
});

export const itemUpdatedEventSchema = createEventSchema(
  "item.updated",
  itemUpdatedPayloadSchema
);

export type ItemUpdatedEvent = z.infer<typeof itemUpdatedEventSchema>;

// ============================================================================
// All MDM Events Union
// ============================================================================

export const mdmEventSchema = z.discriminatedUnion("eventType", [
  partyCreatedEventSchema,
  partyUpdatedEventSchema,
  itemCreatedEventSchema,
  itemUpdatedEventSchema,
]);

export type MdmEvent = z.infer<typeof mdmEventSchema>;
