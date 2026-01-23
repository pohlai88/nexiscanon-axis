/**
 * Tool Schema (A01-01)
 *
 * Tool definitions for agent execution.
 */

import { z } from "zod";
import { TOOL_RISK_LEVEL } from "./constants";

// ============================================================================
// Tool Definition Schema
// ============================================================================

export const toolDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  // Identity
  name: z.string().min(1).max(100),
  description: z.string().max(1000), // For LLM to understand when to use

  // Schema (as JSON schema)
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown()),

  // Domain
  domain: z.string().max(50), // Which ERP domain owns this tool

  // Safety
  riskLevel: z.enum(TOOL_RISK_LEVEL),
  requiresApproval: z.boolean().default(false),

  // Execution
  handlerType: z.enum(["internal", "api", "workflow"]),
  handlerConfig: z.record(z.string(), z.unknown()),

  // Status
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;

// ============================================================================
// Tool Execution Log Schema
// ============================================================================

export const toolExecutionLogSchema = z.object({
  id: z.string().uuid(),
  toolId: z.string().uuid(),
  executionId: z.string().uuid(), // Agent execution ID
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),

  // Execution
  input: z.record(z.string(), z.unknown()),
  output: z.unknown(),
  success: z.boolean(),
  error: z.string().optional(),

  // Timing
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative(),
});

export type ToolExecutionLog = z.infer<typeof toolExecutionLogSchema>;
