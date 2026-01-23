/**
 * Workflow Instance Schema (B08-01)
 *
 * Runtime execution of workflow.
 */

import { z } from "zod";
import { INSTANCE_STATUS } from "./constants";

// ============================================================================
// Workflow Instance Schema
// ============================================================================

export const workflowInstanceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Definition reference
  workflowDefinitionId: z.string().uuid(),
  workflowCode: z.string().max(50),
  workflowVersion: z.number().int(),

  // Target document (cross-domain reference by UUID, not FK per B02)
  documentType: z.string().min(1).max(50),
  documentId: z.string().uuid(),
  documentNumber: z.string().max(50).optional(),

  // Requester
  requestedBy: z.string().uuid(),
  requestedAt: z.string().datetime(),

  // Current state
  status: z.enum(INSTANCE_STATUS).default("pending"),
  currentStepNumber: z.number().int().default(1),

  // Context data
  contextData: z.record(z.string(), z.unknown()).optional(),

  // Completion
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().uuid().optional(),

  // Result
  finalDecision: z.enum(["approved", "rejected"]).optional(),
  finalComments: z.string().max(2000).optional(),

  // Expiry
  expiresAt: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type WorkflowInstance = z.infer<typeof workflowInstanceSchema>;
