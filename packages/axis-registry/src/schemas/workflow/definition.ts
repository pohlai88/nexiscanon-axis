/**
 * Workflow Definition Schema (B08-01)
 *
 * Workflow templates.
 */

import { z } from "zod";
import {
  WORKFLOW_TYPE,
  WORKFLOW_STATUS,
  STEP_TYPE,
  APPROVER_TYPE,
  APPROVAL_MODE,
  TIMEOUT_ACTION,
} from "./constants";

// ============================================================================
// Workflow Definition Schema
// ============================================================================

export const workflowDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),

  // Type
  workflowType: z.enum(WORKFLOW_TYPE),

  // Target
  targetDomain: z.string().min(1).max(50),
  targetDocumentType: z.string().min(1).max(50),
  targetAction: z.string().min(1).max(50),

  // Trigger conditions
  triggerCondition: z.record(z.string(), z.unknown()).optional(),

  // Status
  status: z.enum(WORKFLOW_STATUS).default("draft"),

  // Priority
  priority: z.number().int().default(0),

  // Version control
  version: z.number().int().default(1),
  isLatest: z.boolean().default(true),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

// ============================================================================
// Workflow Step Schema
// ============================================================================

export const workflowStepSchema = z.object({
  id: z.string().uuid(),
  workflowId: z.string().uuid(),

  // Ordering
  stepNumber: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),

  // Type
  stepType: z.enum(STEP_TYPE),

  // Approver assignment
  approverType: z.enum(APPROVER_TYPE),
  approverValue: z.string().max(255).optional(),

  // Multi-approver settings
  approvalMode: z.enum(APPROVAL_MODE).default("any"),
  requiredCount: z.number().int().min(1).optional(),

  // Conditions
  condition: z.record(z.string(), z.unknown()).optional(),

  // Timeout
  timeoutHours: z.number().int().min(0).optional(),
  timeoutAction: z.enum(TIMEOUT_ACTION).optional(),

  // Reminder
  reminderHours: z.number().int().min(0).optional(),
  reminderRepeat: z.boolean().default(false),

  // Branching
  onApproveNextStep: z.number().int().optional(),
  onRejectNextStep: z.number().int().optional(),

  // Parallel
  parallelGroupId: z.string().uuid().optional(),

  createdAt: z.string().datetime(),
});

export type WorkflowStep = z.infer<typeof workflowStepSchema>;
