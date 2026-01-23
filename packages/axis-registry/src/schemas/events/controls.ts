/**
 * Controls Domain Events (B08)
 *
 * Events for RBAC, Policies & PDR (Protect, Detect, React)
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import { DANGER_ZONE_TYPE } from "../controls/constants";

// ============================================================================
// Role Events
// ============================================================================

export const roleCreatedEventSchema = createEventSchema(
  "role.created",
  z.object({
    roleId: z.string().uuid(),
    code: z.string(),
    name: z.string(),
    roleType: z.string(),
    createdBy: z.string().uuid(),
  })
);

export type RoleCreatedEvent = z.infer<typeof roleCreatedEventSchema>;

export const roleAssignedEventSchema = createEventSchema(
  "role.assigned",
  z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
    roleName: z.string(),
    assignedBy: z.string().uuid(),
    effectiveFrom: z.string().datetime(),
    effectiveTo: z.string().datetime().optional(),
  })
);

export type RoleAssignedEvent = z.infer<typeof roleAssignedEventSchema>;

export const roleRevokedEventSchema = createEventSchema(
  "role.revoked",
  z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
    roleName: z.string(),
    revokedBy: z.string().uuid(),
    reason: z.string().optional(),
  })
);

export type RoleRevokedEvent = z.infer<typeof roleRevokedEventSchema>;

// ============================================================================
// Permission Events
// ============================================================================

export const permissionGrantedEventSchema = createEventSchema(
  "permission.granted",
  z.object({
    roleId: z.string().uuid(),
    permissionId: z.string().uuid(),
    permissionCode: z.string(),
    scope: z.string().optional(),
    grantedBy: z.string().uuid(),
  })
);

export type PermissionGrantedEvent = z.infer<typeof permissionGrantedEventSchema>;

export const permissionDeniedEventSchema = createEventSchema(
  "permission.denied",
  z.object({
    userId: z.string().uuid(),
    permissionCode: z.string(),
    resourceType: z.string(),
    resourceId: z.string().uuid().optional(),
    reason: z.string(),
  })
);

export type PermissionDeniedEvent = z.infer<typeof permissionDeniedEventSchema>;

// ============================================================================
// Policy Events
// ============================================================================

export const policyActivatedEventSchema = createEventSchema(
  "policy.activated",
  z.object({
    policyId: z.string().uuid(),
    policyCode: z.string(),
    policyType: z.string(),
    targetDomain: z.string(),
    activatedBy: z.string().uuid(),
  })
);

export type PolicyActivatedEvent = z.infer<typeof policyActivatedEventSchema>;

export const policyViolatedEventSchema = createEventSchema(
  "policy.violated",
  z.object({
    policyId: z.string().uuid(),
    policyCode: z.string(),
    userId: z.string().uuid(),
    action: z.string(),
    resource: z.string(),
    resourceId: z.string().uuid(),
    violationType: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  })
);

export type PolicyViolatedEvent = z.infer<typeof policyViolatedEventSchema>;

// ============================================================================
// Danger Zone Events
// ============================================================================

export const dangerZoneRequestedEventSchema = createEventSchema(
  "dangerzone.requested",
  z.object({
    requestId: z.string().uuid(),
    dangerZoneType: z.enum(DANGER_ZONE_TYPE),
    requestedBy: z.string().uuid(),
    targetDocumentType: z.string(),
    targetDocumentId: z.string().uuid(),
    reason: z.string(),
    expiresAt: z.string().datetime(),
  })
);

export type DangerZoneRequestedEvent = z.infer<typeof dangerZoneRequestedEventSchema>;

export const dangerZoneApprovedEventSchema = createEventSchema(
  "dangerzone.approved",
  z.object({
    requestId: z.string().uuid(),
    dangerZoneType: z.enum(DANGER_ZONE_TYPE),
    approvedBy: z.string().uuid(),
    approvalNotes: z.string().optional(),
  })
);

export type DangerZoneApprovedEvent = z.infer<typeof dangerZoneApprovedEventSchema>;

export const dangerZoneRejectedEventSchema = createEventSchema(
  "dangerzone.rejected",
  z.object({
    requestId: z.string().uuid(),
    dangerZoneType: z.enum(DANGER_ZONE_TYPE),
    rejectedBy: z.string().uuid(),
    rejectionReason: z.string(),
  })
);

export type DangerZoneRejectedEvent = z.infer<typeof dangerZoneRejectedEventSchema>;

export const dangerZoneExecutedEventSchema = createEventSchema(
  "dangerzone.executed",
  z.object({
    requestId: z.string().uuid(),
    dangerZoneType: z.enum(DANGER_ZONE_TYPE),
    executedBy: z.string().uuid(),
    result: z.record(z.string(), z.unknown()),
  })
);

export type DangerZoneExecutedEvent = z.infer<typeof dangerZoneExecutedEventSchema>;

export const dangerZoneExpiredEventSchema = createEventSchema(
  "dangerzone.expired",
  z.object({
    requestId: z.string().uuid(),
    dangerZoneType: z.enum(DANGER_ZONE_TYPE),
    expiredAt: z.string().datetime(),
  })
);

export type DangerZoneExpiredEvent = z.infer<typeof dangerZoneExpiredEventSchema>;

// ============================================================================
// Audit Events
// ============================================================================

export const suspiciousActivityEventSchema = createEventSchema(
  "audit.suspicious_activity",
  z.object({
    userId: z.string().uuid(),
    activityType: z.string(),
    severity: z.enum(["info", "warning", "critical"]),
    details: z.record(z.string(), z.unknown()),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  })
);

export type SuspiciousActivityEvent = z.infer<typeof suspiciousActivityEventSchema>;

// ============================================================================
// Controls Event Union
// ============================================================================

export const controlsEventSchema = z.union([
  roleCreatedEventSchema,
  roleAssignedEventSchema,
  roleRevokedEventSchema,
  permissionGrantedEventSchema,
  permissionDeniedEventSchema,
  policyActivatedEventSchema,
  policyViolatedEventSchema,
  dangerZoneRequestedEventSchema,
  dangerZoneApprovedEventSchema,
  dangerZoneRejectedEventSchema,
  dangerZoneExecutedEventSchema,
  dangerZoneExpiredEventSchema,
  suspiciousActivityEventSchema,
]);

export type ControlsEvent = z.infer<typeof controlsEventSchema>;
