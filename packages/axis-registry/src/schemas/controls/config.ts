/**
 * Controls Configuration Schema (B08)
 *
 * Tenant-level controls configuration.
 */

import { z } from "zod";

// ============================================================================
// Controls Config Schema
// ============================================================================

export const controlsConfigSchema = z.object({
  tenantId: z.uuid(),

  // Session settings
  sessionTimeoutMinutes: z.number().int().min(5).default(60),
  maxConcurrentSessions: z.number().int().min(1).default(3),

  // Password policy
  passwordMinLength: z.number().int().min(8).default(12),
  passwordRequireUppercase: z.boolean().default(true),
  passwordRequireLowercase: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSpecial: z.boolean().default(true),
  passwordExpiryDays: z.number().int().min(0).default(90),
  passwordHistoryCount: z.number().int().min(0).default(5),

  // MFA
  mfaRequired: z.boolean().default(false),
  mfaRequiredForRoles: z.array(z.string()).default([]),

  // Danger zones
  dangerZoneExpiryHours: z.number().int().min(1).default(24),
  dangerZoneRequireReason: z.boolean().default(true),
  dangerZoneMinReasonLength: z.number().int().min(0).default(10),

  // Audit
  auditRetentionDays: z.number().int().min(30).default(2555),
  auditHighRiskActions: z.array(z.string()).default([
    "document_void",
    "period_override",
    "master_data_delete",
  ]),

  // Rate limiting
  maxFailedLoginAttempts: z.number().int().min(3).default(5),
  lockoutDurationMinutes: z.number().int().min(5).default(30),

  updatedAt: z.string().datetime(),
  updatedBy: z.uuid(),
});

export type ControlsConfig = z.infer<typeof controlsConfigSchema>;
