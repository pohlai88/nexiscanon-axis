/**
 * Reconciliation Configuration Schema (B09)
 *
 * Tenant-level reconciliation configuration.
 */

import { z } from "zod";

// ============================================================================
// Reconciliation Config Schema
// ============================================================================

export const reconciliationConfigSchema = z.object({
  tenantId: z.uuid(),

  // Auto-reconciliation
  enableAutoReconciliation: z.boolean().default(true),
  autoReconciliationSchedule: z.string().default("0 2 * * *"),

  // Matching tolerances
  defaultAmountTolerance: z.string().default("0.01"),
  defaultPercentTolerance: z.number().default(0.01),
  dateToleranceDays: z.number().int().default(3),

  // Three-way match
  threeWayMatchRequired: z.boolean().default(true),
  priceVarianceTolerancePercent: z.number().default(5),
  priceVarianceToleranceAmount: z.string().default("10.00"),
  quantityVarianceTolerancePercent: z.number().default(1),

  // Exception handling
  autoEscalateAfterDays: z.number().int().default(7),
  writeOffThreshold: z.string().default("100.00"),
  writeOffApprovalRequired: z.boolean().default(true),

  // Notifications
  notifyOnException: z.boolean().default(true),
  notifyOnResolution: z.boolean().default(false),
  exceptionNotificationRoles: z.array(z.string()).default(["finance_manager"]),

  // Variance accounts
  bankVarianceAccountId: z.uuid().optional(),
  inventoryVarianceAccountId: z.uuid().optional(),
  apVarianceAccountId: z.uuid().optional(),
  arVarianceAccountId: z.uuid().optional(),

  updatedAt: z.string().datetime(),
  updatedBy: z.uuid(),
});

export type ReconciliationConfig = z.infer<typeof reconciliationConfigSchema>;
