/**
 * Agent Schema (A01-01)
 *
 * Agent definitions and execution.
 */

import { z } from "zod";
import { AGENT_MEMORY_TYPE, AGENT_STEP_TYPE } from "./constants";

// ============================================================================
// Agent Definition Schema
// ============================================================================

export const agentDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Identity
  name: z.string().min(1).max(100),
  description: z.string().max(1000),

  // Behavior
  systemPrompt: z.string(),
  maxIterations: z.number().int().min(1).max(50).default(10),

  // Capabilities
  toolIds: z.array(z.string().uuid()),

  // Safety
  allowedDomains: z.array(z.string()),
  requiresApproval: z.array(z.string()), // Action types that need approval

  // Memory
  memoryType: z.enum(AGENT_MEMORY_TYPE).default("session"),

  // Status
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AgentDefinition = z.infer<typeof agentDefinitionSchema>;

// ============================================================================
// Agent Step Schema
// ============================================================================

export const agentStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  type: z.enum(AGENT_STEP_TYPE),
  content: z.string(),
  toolCallId: z.string().optional(),
  toolName: z.string().optional(),
  toolInput: z.record(z.string(), z.unknown()).optional(),
  toolOutput: z.unknown().optional(),
  durationMs: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
});

export type AgentStep = z.infer<typeof agentStepSchema>;

// ============================================================================
// Tool Call Schema
// ============================================================================

export const toolCallSchema = z.object({
  id: z.string(),
  toolId: z.string().uuid(),
  toolName: z.string(),
  input: z.record(z.string(), z.unknown()),
  output: z.unknown(),
  success: z.boolean(),
  error: z.string().optional(),
  durationMs: z.number().int().nonnegative(),
});

export type ToolCall = z.infer<typeof toolCallSchema>;

// ============================================================================
// Approval Request Schema
// ============================================================================

export const agentApprovalRequestSchema = z.object({
  id: z.string().uuid(),
  executionId: z.string().uuid(),
  actionType: z.string(),
  targetDomain: z.string(),
  description: z.string(),
  payload: z.record(z.string(), z.unknown()),
  requestedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type AgentApprovalRequest = z.infer<typeof agentApprovalRequestSchema>;

// ============================================================================
// Agent Execution Schema
// ============================================================================

export const agentExecutionSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),

  // Input
  input: z.string(),
  context: z.record(z.string(), z.unknown()).optional(),

  // Execution trace
  steps: z.array(agentStepSchema),
  toolCalls: z.array(toolCallSchema),

  // Result
  output: z.string().optional(),
  status: z.enum(["running", "completed", "failed", "awaiting_approval"]),
  error: z.string().optional(),

  // Approval requests (if any)
  pendingApprovals: z.array(agentApprovalRequestSchema),

  // Timing
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  totalDurationMs: z.number().int().nonnegative().optional(),

  // Tokens
  totalTokens: z.number().int().nonnegative().optional(),
});

export type AgentExecution = z.infer<typeof agentExecutionSchema>;
