/**
 * Cutover Checklist Schema (C05)
 *
 * "Pre-cutover verification items."
 */

import { z } from "zod";
import { checklistCategorySchema } from "./constants";

// ============================================================================
// Checklist Item
// ============================================================================

export const checklistItemSchema = z.object({
  id: z.string(),
  category: checklistCategorySchema,
  item: z.string(),
  required: z.boolean().default(true),
  completed: z.boolean().default(false),
  completedBy: z.uuid().optional(),
  completedAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;

// ============================================================================
// Cutover Checklist
// ============================================================================

export const cutoverChecklistSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  migrationStateId: z.uuid(),
  cutoverExecutionId: z.uuid().optional(),

  // Items
  items: z.array(checklistItemSchema),

  // Summary
  totalItems: z.number().int(),
  completedItems: z.number().int(),
  requiredItems: z.number().int(),
  requiredCompleted: z.number().int(),

  // Status
  allRequiredComplete: z.boolean(),

  // By category
  byCategory: z.object({
    technical: z.object({
      total: z.number().int(),
      completed: z.number().int(),
    }),
    business: z.object({
      total: z.number().int(),
      completed: z.number().int(),
    }),
    operational: z.object({
      total: z.number().int(),
      completed: z.number().int(),
    }),
  }),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CutoverChecklist = z.infer<typeof cutoverChecklistSchema>;

// ============================================================================
// Default Pre-Cutover Checklist Items
// ============================================================================

export const DEFAULT_PRE_CUTOVER_ITEMS: ChecklistItem[] = [
  // Technical
  { id: "tech-1", category: "technical", item: "All gates green for 3+ days", required: true, completed: false },
  { id: "tech-2", category: "technical", item: "Final reconciliation completed", required: true, completed: false },
  { id: "tech-3", category: "technical", item: "Backup of legacy data taken", required: true, completed: false },
  { id: "tech-4", category: "technical", item: "AXIS system health verified", required: true, completed: false },
  { id: "tech-5", category: "technical", item: "Integration endpoints configured", required: true, completed: false },

  // Business
  { id: "biz-1", category: "business", item: "Financial sign-off obtained", required: true, completed: false },
  { id: "biz-2", category: "business", item: "Operational sign-off obtained", required: true, completed: false },
  { id: "biz-3", category: "business", item: "Users trained (>80%)", required: true, completed: false },
  { id: "biz-4", category: "business", item: "Communication sent to stakeholders", required: true, completed: false },

  // Operational
  { id: "ops-1", category: "operational", item: "Support team briefed", required: true, completed: false },
  { id: "ops-2", category: "operational", item: "Rollback plan documented", required: true, completed: false },
  { id: "ops-3", category: "operational", item: "Escalation contacts confirmed", required: true, completed: false },
  { id: "ops-4", category: "operational", item: "Freeze window scheduled", required: true, completed: false },
];
