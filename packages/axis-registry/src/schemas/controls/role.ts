/**
 * Role Schema (B08)
 *
 * Named permission bundles.
 */

import { z } from "zod";
import { ROLE_TYPE, PERMISSION_SCOPE } from "./constants";

// ============================================================================
// Role Schema
// ============================================================================

export const roleSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),

  // Type
  roleType: z.enum(ROLE_TYPE).default("custom"),

  // Hierarchy
  parentRoleId: z.uuid().optional(),
  level: z.number().int().min(0).default(0),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.uuid(),
});

export type Role = z.infer<typeof roleSchema>;

// ============================================================================
// Role Permission Schema
// ============================================================================

export const rolePermissionSchema = z.object({
  roleId: z.uuid(),
  permissionId: z.uuid(),

  // Override default scope
  scope: z.enum(PERMISSION_SCOPE).optional(),

  // Conditions (JSON rules)
  conditions: z.record(z.string(), z.unknown()).optional(),

  grantedAt: z.string().datetime(),
  grantedBy: z.uuid(),
});

export type RolePermission = z.infer<typeof rolePermissionSchema>;

// ============================================================================
// User Role Schema
// ============================================================================

export const userRoleSchema = z.object({
  userId: z.uuid(),
  roleId: z.uuid(),
  tenantId: z.uuid(),

  // Effective period
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),

  assignedAt: z.string().datetime(),
  assignedBy: z.uuid(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
