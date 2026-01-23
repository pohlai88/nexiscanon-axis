/**
 * Approval Task Schema (B08-01)
 *
 * Individual approval tasks.
 */

import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY, TASK_HISTORY_ACTION } from "./constants";

// ============================================================================
// Approval Task Schema
// ============================================================================

export const approvalTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Workflow reference
  workflowInstanceId: z.string().uuid(),
  workflowStepId: z.string().uuid(),
  stepNumber: z.number().int(),

  // Assignment
  assignedToType: z.enum(["user", "role"]),
  assignedToId: z.string().uuid(),
  assignedToName: z.string().max(255),

  // Original assignee (before delegation)
  originalAssigneeId: z.string().uuid().optional(),
  delegatedFrom: z.string().uuid().optional(),

  // Status
  status: z.enum(TASK_STATUS).default("pending"),

  // Decision
  decision: z.enum(["approved", "rejected"]).optional(),
  decidedBy: z.string().uuid().optional(),
  decidedAt: z.string().datetime().optional(),
  comments: z.string().max(2000).optional(),

  // Timing
  dueAt: z.string().datetime().optional(),
  reminderSentAt: z.string().datetime().optional(),
  escalatedAt: z.string().datetime().optional(),

  // Priority
  priority: z.enum(TASK_PRIORITY).default("normal"),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ApprovalTask = z.infer<typeof approvalTaskSchema>;

// ============================================================================
// Task History Schema
// ============================================================================

export const taskHistorySchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),

  // Action
  action: z.enum(TASK_HISTORY_ACTION),

  // Actor
  performedBy: z.string().uuid(),
  performedAt: z.string().datetime(),

  // Details
  comments: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TaskHistory = z.infer<typeof taskHistorySchema>;
