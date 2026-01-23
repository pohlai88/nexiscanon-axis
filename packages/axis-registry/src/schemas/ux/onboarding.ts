/**
 * Onboarding Schema (B10)
 *
 * User and tenant onboarding progress tracking.
 */

import { z } from "zod";
import { ONBOARDING_STATUS } from "./constants";

// ============================================================================
// Onboarding Step Schema
// ============================================================================

export const onboardingStepSchema = z.object({
  id: z.string().max(50),
  title: z.string().max(255),
  description: z.string().max(500).optional(),
  status: z.enum(ONBOARDING_STATUS).default("not_started"),
  completedAt: z.string().datetime().optional(),
  skippedAt: z.string().datetime().optional(),
  required: z.boolean().default(false),
  order: z.number().int().default(0),
});

export type OnboardingStep = z.infer<typeof onboardingStepSchema>;

// ============================================================================
// Onboarding Progress Schema
// ============================================================================

export const onboardingProgressSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().optional(), // null for tenant-level

  // Progress tracking
  steps: z.array(onboardingStepSchema).default([]),
  currentStepId: z.string().max(50).optional(),

  // Overall status
  overallStatus: z.enum(ONBOARDING_STATUS).default("not_started"),
  percentComplete: z.number().min(0).max(100).default(0),

  // Timestamps
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type OnboardingProgress = z.infer<typeof onboardingProgressSchema>;
