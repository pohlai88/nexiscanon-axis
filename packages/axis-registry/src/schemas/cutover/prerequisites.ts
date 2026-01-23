/**
 * Cutover Prerequisites Schema (C05)
 *
 * "Only when all gates are GREEN and sign-offs are complete."
 */

import { z } from "zod";
import { gateColorSchema } from "./constants";

// ============================================================================
// Sign-off Status
// ============================================================================

export const signoffStatusSchema = z.object({
  required: z.boolean().default(true),
  signed: z.boolean().default(false),
  signedBy: z.uuid().optional(),
  signedAt: z.string().datetime().optional(),
  note: z.string().max(1000).optional(),
});

export type SignoffStatus = z.infer<typeof signoffStatusSchema>;

// ============================================================================
// Operational Readiness
// ============================================================================

export const operationalReadinessSchema = z.object({
  usersTrainedPercent: z.number().min(0).max(100),
  minimumTrainedPercent: z.number().default(80),
  openTicketsCount: z.number().int(),
  maxOpenTickets: z.number().int().default(5),
  supportTeamBriefed: z.boolean().default(false),
  escalationContactsConfirmed: z.boolean().default(false),
});

export type OperationalReadiness = z.infer<typeof operationalReadinessSchema>;

// ============================================================================
// Cutover Prerequisites
// ============================================================================

export const cutoverPrerequisitesSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),

  // Gate status
  gates: z.object({
    trialBalance: gateColorSchema,
    arAging: gateColorSchema,
    apAging: gateColorSchema,
    inventoryQty: gateColorSchema,
    inventoryValue: gateColorSchema,
  }),

  // Duration requirements
  consecutiveGreenDays: z.number().int(),
  minimumGreenDays: z.number().int().default(3),
  meetsGreenDaysRequirement: z.boolean(),

  // Sign-off requirements
  signOffs: z.object({
    financial: signoffStatusSchema,
    operational: signoffStatusSchema,
    it: signoffStatusSchema,
  }),

  // Operational readiness
  operational: operationalReadinessSchema,

  // Technical readiness
  technical: z.object({
    backupCompleted: z.boolean().default(false),
    backupVerified: z.boolean().default(false),
    axisHealthy: z.boolean().default(false),
    integrationsConfigured: z.boolean().default(false),
    rollbackPlanDocumented: z.boolean().default(false),
  }),

  // Overall readiness
  allPrerequisitesMet: z.boolean(),
  blockers: z.array(z.string()).default([]),

  evaluatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CutoverPrerequisites = z.infer<typeof cutoverPrerequisitesSchema>;
