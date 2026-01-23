/**
 * Easing Functions
 * 
 * Custom easing curves for Framer Motion.
 * Complements Tailwind v4's built-in easings.
 */

// ============================================================================
// Standard Easings (matches CSS)
// ============================================================================

export const linear = [0, 0, 1, 1] as const
export const ease = [0.25, 0.1, 0.25, 1] as const
export const easeIn = [0.42, 0, 1, 1] as const
export const easeOut = [0, 0, 0.58, 1] as const
export const easeInOut = [0.42, 0, 0.58, 1] as const

// ============================================================================
// Custom Easings
// ============================================================================

// Smooth and natural
export const easeInOutCubic = [0.65, 0, 0.35, 1] as const
export const easeInOutQuart = [0.76, 0, 0.24, 1] as const
export const easeInOutQuint = [0.83, 0, 0.17, 1] as const

// Sharp and snappy
export const easeInQuad = [0.55, 0.085, 0.68, 0.53] as const
export const easeInCubic = [0.55, 0.055, 0.675, 0.19] as const
export const easeInQuart = [0.895, 0.03, 0.685, 0.22] as const

// Soft and gentle
export const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const
export const easeOutCubic = [0.215, 0.61, 0.355, 1] as const
export const easeOutQuart = [0.165, 0.84, 0.44, 1] as const

// Bouncy
export const easeOutBack = [0.34, 1.56, 0.64, 1] as const
export const easeInOutBack = [0.68, -0.55, 0.265, 1.55] as const

// Elastic
export const easeOutElastic = [0.68, -0.55, 0.265, 1.55] as const

// Anticipate (overshoots then settles)
export const anticipate = [0.68, -0.55, 0.265, 1.55] as const

// ============================================================================
// Material Design Easings
// ============================================================================

export const materialStandard = [0.4, 0, 0.2, 1] as const
export const materialDecelerate = [0, 0, 0.2, 1] as const
export const materialAccelerate = [0.4, 0, 1, 1] as const
export const materialSharp = [0.4, 0, 0.6, 1] as const

// ============================================================================
// iOS Easings
// ============================================================================

export const iosStandard = [0.4, 0, 0.2, 1] as const
export const iosDecelerate = [0, 0, 0.2, 1] as const
export const iosAccelerate = [0.4, 0, 1, 1] as const

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create custom cubic bezier easing
 */
export function createEasing(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): readonly [number, number, number, number] {
  return [x1, y1, x2, y2] as const
}

/**
 * Get easing by name
 */
export function getEasing(
  name:
    | "linear"
    | "ease"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "easeInOutCubic"
    | "easeOutBack"
    | "materialStandard"
): readonly [number, number, number, number] {
  const easings = {
    linear,
    ease,
    easeIn,
    easeOut,
    easeInOut,
    easeInOutCubic,
    easeOutBack,
    materialStandard,
  }

  return easings[name]
}
