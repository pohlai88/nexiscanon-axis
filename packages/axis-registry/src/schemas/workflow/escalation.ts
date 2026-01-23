/**
 * Escalation Schema (B08-01)
 *
 * Timeout and escalation configs.
 */

import { z } from "zod";
import { ESCALATION_ACTION } from "./constants";

// ============================================================================
// Escalation Rule Schema
// ============================================================================

export const escalationRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Scope
  workflowDefinitionId: z.string().uuid().optional(),
  documentType: z.string().max(50).optional(),

  // Trigger
  triggerAfterHours: z.number().int().min(1),

  // Action
  escalationAction: z.enum(ESCALATION_ACTION),

  // For reassign action
  reassignToType: z.enum(["user", "role", "manager"]).optional(),
  reassignToId: z.string().uuid().optional(),

  // Notification settings
  notifyOriginalApprover: z.boolean().default(true),
  notifyRequester: z.boolean().default(true),
  notifyEscalateTo: z.boolean().default(true),

  // Repeat
  repeatAfterHours: z.number().int().min(0).optional(),
  maxRepeatCount: z.number().int().min(0).default(0),

  // Status
  isActive: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type EscalationRule = z.infer<typeof escalationRuleSchema>;
