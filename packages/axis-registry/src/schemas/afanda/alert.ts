/**
 * Alert Schema (B11)
 *
 * Alert rules and instances.
 */

import { z } from "zod";
import {
  ALERT_SEVERITY,
  ALERT_STATUS,
  ALERT_CONDITION_TYPE,
  AFANDA_NOTIFICATION_CHANNEL,
} from "./constants";

// ============================================================================
// Alert Rule Schema
// ============================================================================

export const alertRuleSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Identity
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),

  // Condition
  conditionType: z.enum(ALERT_CONDITION_TYPE),

  // For KPI threshold
  kpiId: z.uuid().optional(),
  thresholdOperator: z
    .enum(["gt", "gte", "lt", "lte", "eq", "between"])
    .optional(),
  thresholdValue: z.number().optional(),
  thresholdValue2: z.number().optional(),

  // For event
  eventType: z.string().max(100).optional(),
  eventCondition: z.record(z.string(), z.unknown()).optional(),

  // For schedule
  cronExpression: z.string().max(100).optional(),

  // Alert configuration
  severity: z.enum(ALERT_SEVERITY).default("warning"),

  // Notification
  notifyRoles: z.array(z.string()).optional(),
  notifyUsers: z.array(z.uuid()).optional(),
  notifyChannels: z.array(z.enum(AFANDA_NOTIFICATION_CHANNEL)).default(["in_app"]),

  // Escalation
  escalateAfterMinutes: z.number().int().optional(),
  escalateTo: z.array(z.string()).optional(),

  // Cooldown
  cooldownMinutes: z.number().int().default(60),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AlertRule = z.infer<typeof alertRuleSchema>;

// ============================================================================
// Alert Instance Schema
// ============================================================================

export const alertInstanceSchema = z.object({
  id: z.uuid(),
  ruleId: z.uuid(),
  tenantId: z.uuid(),

  // Alert details
  title: z.string().max(255),
  message: z.string().max(2000),
  severity: z.enum(ALERT_SEVERITY),

  // Context
  triggeredValue: z.number().optional(),
  thresholdValue: z.number().optional(),
  sourceType: z.string().max(50).optional(),
  sourceId: z.uuid().optional(),

  // Status
  status: z.enum(ALERT_STATUS).default("active"),

  // Acknowledgment
  acknowledgedBy: z.uuid().optional(),
  acknowledgedAt: z.string().datetime().optional(),
  acknowledgmentNote: z.string().max(500).optional(),

  // Resolution
  resolvedBy: z.uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionNote: z.string().max(500).optional(),

  // Snooze
  snoozedUntil: z.string().datetime().optional(),

  firedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type AlertInstance = z.infer<typeof alertInstanceSchema>;
