/**
 * Core Domain Events
 *
 * Events published by the Core domain:
 * - Tenant lifecycle
 * - User lifecycle
 * - Role assignments
 */

import { z } from "zod";
import { createEventSchema } from "./base";

// ============================================================================
// Tenant Events
// ============================================================================

export const tenantCreatedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  plan: z.string().optional(),
  createdBy: z.string().uuid(),
});

export const tenantCreatedEventSchema = createEventSchema(
  "tenant.created",
  tenantCreatedPayloadSchema
);

export type TenantCreatedEvent = z.infer<typeof tenantCreatedEventSchema>;

// ============================================================================
// User Events
// ============================================================================

export const userCreatedPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  tenantId: z.string().uuid(),
});

export const userCreatedEventSchema = createEventSchema(
  "user.created",
  userCreatedPayloadSchema
);

export type UserCreatedEvent = z.infer<typeof userCreatedEventSchema>;

// ============================================================================
// Role Assignment Events
// ============================================================================

export const userRoleAssignedPayloadSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: z.string().min(1),
  assignedBy: z.string().uuid(),
  previousRole: z.string().optional(),
});

export const userRoleAssignedEventSchema = createEventSchema(
  "user.role_assigned",
  userRoleAssignedPayloadSchema
);

export type UserRoleAssignedEvent = z.infer<typeof userRoleAssignedEventSchema>;

// ============================================================================
// All Core Events Union
// ============================================================================

export const coreEventSchema = z.discriminatedUnion("eventType", [
  tenantCreatedEventSchema,
  userCreatedEventSchema,
  userRoleAssignedEventSchema,
]);

export type CoreEvent = z.infer<typeof coreEventSchema>;
