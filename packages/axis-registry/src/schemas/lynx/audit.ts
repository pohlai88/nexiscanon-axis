/**
 * Audit Schema (A01-01)
 *
 * Lynx audit logging and tracing.
 */

import { z } from "zod";
import { LYNX_CAPABILITY } from "./constants";

// ============================================================================
// Lynx Audit Log Schema
// ============================================================================

export const lynxAuditLogSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  userId: z.uuid(),

  // Request
  requestId: z.uuid(),
  capability: z.enum(LYNX_CAPABILITY),
  provider: z.string().max(50),
  model: z.string().max(100),

  // Input
  inputHash: z.string().max(64), // Hash of input for privacy
  inputTokens: z.number().int().nonnegative(),

  // Output
  outputHash: z.string().max(64), // Hash of output
  outputTokens: z.number().int().nonnegative(),

  // Reasoning
  reasoningChain: z.string().optional(), // Full reasoning if available

  // Safety
  safetyFlags: z.array(z.string()),
  wasBlocked: z.boolean().default(false),
  blockReason: z.string().max(500).optional(),

  // Performance
  latencyMs: z.number().int().nonnegative(),

  // Cost
  estimatedCost: z.string(), // Decimal string

  timestamp: z.string().datetime(),
});

export type LynxAuditLog = z.infer<typeof lynxAuditLogSchema>;
