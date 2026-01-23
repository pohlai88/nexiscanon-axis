/**
 * Danger Zone Schema (B08)
 *
 * Override-required actions.
 */

import { z } from "zod";
import { DANGER_ZONE_TYPE, DANGER_ZONE_STATUS } from "./constants";

// ============================================================================
// Danger Zone Request Schema
// ============================================================================

export const dangerZoneRequestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Type
  dangerZoneType: z.enum(DANGER_ZONE_TYPE),

  // Request
  requestedBy: z.string().uuid(),
  requestedAt: z.string().datetime(),
  reason: z.string().min(10).max(1000),

  // Context
  targetDocumentType: z.string().min(1).max(50),
  targetDocumentId: z.string().uuid(),
  targetDocumentNumber: z.string().max(50).optional(),

  // Action details
  actionDetails: z.record(z.string(), z.unknown()),

  // Status
  status: z.enum(DANGER_ZONE_STATUS).default("pending"),

  // Approval
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  approvalNotes: z.string().max(1000).optional(),

  // Rejection
  rejectedBy: z.string().uuid().optional(),
  rejectedAt: z.string().datetime().optional(),
  rejectionReason: z.string().max(1000).optional(),

  // Execution
  executedAt: z.string().datetime().optional(),
  executionResult: z.record(z.string(), z.unknown()).optional(),

  // Expiry
  expiresAt: z.string().datetime(),

  // Audit
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DangerZoneRequest = z.infer<typeof dangerZoneRequestSchema>;
