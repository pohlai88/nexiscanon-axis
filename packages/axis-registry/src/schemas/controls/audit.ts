/**
 * Audit Extension Schema (B08)
 *
 * Extended audit metadata.
 */

import { z } from "zod";
import { AUDIT_SEVERITY } from "./constants";

// ============================================================================
// Audit Extension Schema
// ============================================================================

export const auditExtensionSchema = z.object({
  id: z.uuid(),
  auditLogId: z.uuid(),

  // Classification
  severity: z.enum(AUDIT_SEVERITY).default("info"),
  category: z.string().max(50),

  // Context
  sessionId: z.uuid().optional(),
  requestId: z.uuid().optional(),

  // Client info
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(500).optional(),
  geoLocation: z.string().max(100).optional(),

  // Data snapshot
  beforeState: z.record(z.string(), z.unknown()).optional(),
  afterState: z.record(z.string(), z.unknown()).optional(),
  changedFields: z.array(z.string()).optional(),

  // Policy context
  matchedPolicies: z.array(z.string()).optional(),
  dangerZoneRequestId: z.uuid().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
});

export type AuditExtension = z.infer<typeof auditExtensionSchema>;
