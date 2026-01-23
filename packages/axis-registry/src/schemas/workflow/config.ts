/**
 * Workflow Configuration Schema (B08-01)
 *
 * Tenant-level workflow configuration.
 */

import { z } from "zod";

// ============================================================================
// Workflow Config Schema
// ============================================================================

export const workflowConfigSchema = z.object({
  tenantId: z.uuid(),

  // Default timeouts
  defaultTaskTimeoutHours: z.number().int().min(0).default(48),
  defaultReminderHours: z.number().int().min(0).default(24),

  // Escalation
  enableAutoEscalation: z.boolean().default(true),
  defaultEscalationHours: z.number().int().min(1).default(72),

  // Delegation
  allowDelegation: z.boolean().default(true),
  maxDelegationDepth: z.number().int().min(1).default(2),
  requireDelegationApproval: z.boolean().default(false),

  // Notifications
  enableEmailNotifications: z.boolean().default(true),
  enablePushNotifications: z.boolean().default(false),
  enableSmsNotifications: z.boolean().default(false),

  // Business hours
  useBusinessHoursOnly: z.boolean().default(false),
  businessStartHour: z.number().int().min(0).max(23).default(9),
  businessEndHour: z.number().int().min(0).max(23).default(17),
  businessDays: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),

  // Holidays
  excludeHolidays: z.boolean().default(false),

  updatedAt: z.string().datetime(),
  updatedBy: z.uuid(),
});

export type WorkflowConfig = z.infer<typeof workflowConfigSchema>;
