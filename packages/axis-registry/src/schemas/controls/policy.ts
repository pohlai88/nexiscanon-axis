/**
 * Policy Schema (B08)
 *
 * Business rules and constraints.
 */

import { z } from "zod";
import {
  POLICY_TYPE,
  POLICY_STATUS,
  POLICY_SCOPE,
  PERMISSION_DOMAIN,
  PERMISSION_ACTION,
  CONDITION_TYPE,
  RULE_ACTION_TYPE,
} from "./constants";

// ============================================================================
// Policy Schema
// ============================================================================

export const policySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(), // Null = global

  // Identity
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),

  // Type
  policyType: z.enum(POLICY_TYPE),
  scope: z.enum(POLICY_SCOPE).default("tenant"),

  // Target
  targetDomain: z.enum(PERMISSION_DOMAIN),
  targetResource: z.string().max(50).optional(),
  targetAction: z.enum(PERMISSION_ACTION).optional(),

  // Status
  status: z.enum(POLICY_STATUS).default("draft"),

  // Priority (higher = evaluated first)
  priority: z.number().int().default(0),

  // Effective period
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type Policy = z.infer<typeof policySchema>;

// ============================================================================
// Policy Rule Schema
// ============================================================================

export const policyRuleSchema = z.object({
  id: z.string().uuid(),
  policyId: z.string().uuid(),

  // Rule definition
  ruleNumber: z.number().int().positive(),
  name: z.string().max(255),

  // Condition
  conditionType: z.enum(CONDITION_TYPE),
  condition: z.unknown(),

  // Action
  actionType: z.enum(RULE_ACTION_TYPE),
  actionParams: z.record(z.string(), z.unknown()).optional(),

  // Enabled
  isActive: z.boolean().default(true),
});

export type PolicyRule = z.infer<typeof policyRuleSchema>;
