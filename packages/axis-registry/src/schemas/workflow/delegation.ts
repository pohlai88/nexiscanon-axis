/**
 * Delegation Schema (B08-01)
 *
 * Approval delegation rules.
 */

import { z } from "zod";
import { DELEGATION_TYPE } from "./constants";

// ============================================================================
// Delegation Schema
// ============================================================================

export const delegationSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Delegator (who is delegating)
  delegatorId: z.uuid(),
  delegatorName: z.string().max(255),

  // Delegate (who receives the authority)
  delegateId: z.uuid(),
  delegateName: z.string().max(255),

  // Type
  delegationType: z.enum(DELEGATION_TYPE),

  // Scope (for document_type)
  documentTypes: z.array(z.string()).optional(),

  // Threshold (for amount_threshold)
  maxAmount: z.string().optional(),
  currency: z.string().length(3).optional(),

  // Validity period
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime(),

  // Reason
  reason: z.string().max(500).optional(),

  // Status
  isActive: z.boolean().default(true),

  // Audit
  createdAt: z.string().datetime(),
  createdBy: z.uuid(),
  revokedAt: z.string().datetime().optional(),
  revokedBy: z.uuid().optional(),
});

export type Delegation = z.infer<typeof delegationSchema>;
