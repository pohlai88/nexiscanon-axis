/**
 * UX Domain Constants (B10)
 *
 * Quorum & Cobalt: Two Personas, One System
 */

// ============================================================================
// Persona Types
// ============================================================================

export const PERSONA_TYPE = [
  "quorum", // SME-focused, simplified
  "cobalt", // Enterprise-focused, full power
] as const;

export type PersonaType = (typeof PERSONA_TYPE)[number];

// ============================================================================
// UX Complexity Levels
// ============================================================================

export const UX_COMPLEXITY = [
  "simple", // Hide advanced options
  "standard", // Show common options
  "advanced", // Show all options
  "expert", // Show everything + dev tools
] as const;

export type UxComplexity = (typeof UX_COMPLEXITY)[number];

// ============================================================================
// Navigation Style
// ============================================================================

export const NAVIGATION_STYLE = [
  "guided", // Step-by-step, wizard-like
  "standard", // Traditional menu navigation
  "power", // Command palette + keyboard shortcuts
] as const;

export type NavigationStyle = (typeof NAVIGATION_STYLE)[number];

// ============================================================================
// Form Density
// ============================================================================

export const FORM_DENSITY = [
  "comfortable", // More spacing, fewer fields per screen
  "compact", // Less spacing, more fields visible
  "dense", // Maximum information density
] as const;

export type FormDensity = (typeof FORM_DENSITY)[number];

// ============================================================================
// Theme Mode
// ============================================================================

export const THEME_MODE = ["light", "dark", "system"] as const;

export type ThemeMode = (typeof THEME_MODE)[number];

// ============================================================================
// Onboarding Status
// ============================================================================

export const ONBOARDING_STATUS = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUS)[number];

// ============================================================================
// User Preference Scope
// ============================================================================

export const PREFERENCE_SCOPE = [
  "tenant", // Applies to all users in tenant
  "user", // User-specific preference
] as const;

export type PreferenceScope = (typeof PREFERENCE_SCOPE)[number];
