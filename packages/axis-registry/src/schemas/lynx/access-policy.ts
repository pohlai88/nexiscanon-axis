/**
 * Access Policy Schema (A01-01)
 *
 * Lynx domain access control.
 */

import { z } from "zod";
import { ACTION_LEVEL } from "./constants";

// ============================================================================
// Domain Action Schema
// ============================================================================

export const domainActionSchema = z.object({
  domain: z.string().max(50),
  actions: z.array(z.enum(ACTION_LEVEL)),
});

export type DomainAction = z.infer<typeof domainActionSchema>;

// ============================================================================
// Data Filter Schema
// ============================================================================

export const dataFilterSchema = z.object({
  domain: z.string().max(50),
  filter: z.record(z.string(), z.unknown()),
});

export type DataFilter = z.infer<typeof dataFilterSchema>;

// ============================================================================
// Approval Requirement Schema
// ============================================================================

export const approvalRequirementSchema = z.object({
  action: z.string().max(100),
  threshold: z.number().optional(), // e.g., amount > 10000
  description: z.string().max(500).optional(),
});

export type ApprovalRequirement = z.infer<typeof approvalRequirementSchema>;

// ============================================================================
// Lynx Access Policy Schema
// ============================================================================

export const lynxAccessPolicySchema = z.object({
  id: z.uuid(),
  agentId: z.uuid(),
  tenantId: z.uuid(),

  // Domain access
  allowedDomains: z.array(z.string()),

  // Action restrictions
  allowedActions: z.array(domainActionSchema),

  // Data restrictions
  dataFilters: z.array(dataFilterSchema),

  // Approval requirements
  approvalRequired: z.array(approvalRequirementSchema),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LynxAccessPolicy = z.infer<typeof lynxAccessPolicySchema>;
