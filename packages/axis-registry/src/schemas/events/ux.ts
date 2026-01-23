/**
 * UX Domain Events (B10)
 *
 * Events for Quorum & Cobalt persona system
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import { PERSONA_TYPE, ONBOARDING_STATUS } from "../ux/constants";

// ============================================================================
// Persona Events
// ============================================================================

export const personaSwitchedEventSchema = createEventSchema(
  "persona.switched",
  z.object({
    previousPersona: z.enum(PERSONA_TYPE),
    newPersona: z.enum(PERSONA_TYPE),
    switchedBy: z.uuid(),
  })
);

export type PersonaSwitchedEvent = z.infer<typeof personaSwitchedEventSchema>;

export const personaConfigUpdatedEventSchema = createEventSchema(
  "persona.config_updated",
  z.object({
    updatedFields: z.array(z.string()),
    updatedBy: z.uuid(),
  })
);

export type PersonaConfigUpdatedEvent = z.infer<typeof personaConfigUpdatedEventSchema>;

// ============================================================================
// User Preference Events
// ============================================================================

export const userPreferenceUpdatedEventSchema = createEventSchema(
  "user_preference.updated",
  z.object({
    userId: z.uuid(),
    updatedFields: z.array(z.string()),
  })
);

export type UserPreferenceUpdatedEvent = z.infer<typeof userPreferenceUpdatedEventSchema>;

export const favoriteAddedEventSchema = createEventSchema(
  "user_preference.favorite_added",
  z.object({
    userId: z.uuid(),
    favoriteType: z.string(),
    favoriteId: z.uuid(),
    favoriteLabel: z.string(),
  })
);

export type FavoriteAddedEvent = z.infer<typeof favoriteAddedEventSchema>;

export const favoriteRemovedEventSchema = createEventSchema(
  "user_preference.favorite_removed",
  z.object({
    userId: z.uuid(),
    favoriteType: z.string(),
    favoriteId: z.uuid(),
  })
);

export type FavoriteRemovedEvent = z.infer<typeof favoriteRemovedEventSchema>;

// ============================================================================
// Onboarding Events
// ============================================================================

export const onboardingStartedEventSchema = createEventSchema(
  "onboarding.started",
  z.object({
    progressId: z.uuid(),
    userId: z.uuid().optional(),
    totalSteps: z.number().int(),
  })
);

export type OnboardingStartedEvent = z.infer<typeof onboardingStartedEventSchema>;

export const onboardingStepCompletedEventSchema = createEventSchema(
  "onboarding.step_completed",
  z.object({
    progressId: z.uuid(),
    stepId: z.string(),
    userId: z.uuid().optional(),
    percentComplete: z.number(),
  })
);

export type OnboardingStepCompletedEvent = z.infer<typeof onboardingStepCompletedEventSchema>;

export const onboardingStepSkippedEventSchema = createEventSchema(
  "onboarding.step_skipped",
  z.object({
    progressId: z.uuid(),
    stepId: z.string(),
    userId: z.uuid().optional(),
  })
);

export type OnboardingStepSkippedEvent = z.infer<typeof onboardingStepSkippedEventSchema>;

export const onboardingCompletedEventSchema = createEventSchema(
  "onboarding.completed",
  z.object({
    progressId: z.uuid(),
    userId: z.uuid().optional(),
    status: z.enum(ONBOARDING_STATUS),
    stepsCompleted: z.number().int(),
    stepsSkipped: z.number().int(),
  })
);

export type OnboardingCompletedEvent = z.infer<typeof onboardingCompletedEventSchema>;

// ============================================================================
// Theme Events
// ============================================================================

export const themeChangedEventSchema = createEventSchema(
  "theme.changed",
  z.object({
    userId: z.uuid(),
    previousTheme: z.string(),
    newTheme: z.string(),
  })
);

export type ThemeChangedEvent = z.infer<typeof themeChangedEventSchema>;

// ============================================================================
// UX Event Union
// ============================================================================

export const uxEventSchema = z.union([
  personaSwitchedEventSchema,
  personaConfigUpdatedEventSchema,
  userPreferenceUpdatedEventSchema,
  favoriteAddedEventSchema,
  favoriteRemovedEventSchema,
  onboardingStartedEventSchema,
  onboardingStepCompletedEventSchema,
  onboardingStepSkippedEventSchema,
  onboardingCompletedEventSchema,
  themeChangedEventSchema,
]);

export type UxEvent = z.infer<typeof uxEventSchema>;
