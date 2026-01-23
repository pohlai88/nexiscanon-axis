import type { Transition } from "motion/react"

/**
 * Transition Presets for Framer Motion
 * 
 * Optimized for Tailwind v4 timing functions.
 * Matches Tailwind's duration scale: 75, 100, 150, 200, 300, 500, 700, 1000
 */

// ============================================================================
// Spring Transitions
// ============================================================================

export const springDefault: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
}

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 20,
  mass: 1,
}

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 40,
  mass: 1,
}

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
  mass: 0.5,
}

export const springGentle: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 50,
  mass: 1.5,
}

// ============================================================================
// Tween Transitions (matches Tailwind durations)
// ============================================================================

export const tweenFast: Transition = {
  type: "tween",
  duration: 0.15,
  ease: "easeOut",
}

export const tweenDefault: Transition = {
  type: "tween",
  duration: 0.3,
  ease: "easeOut",
}

export const tweenSlow: Transition = {
  type: "tween",
  duration: 0.5,
  ease: "easeOut",
}

export const tweenVerySlow: Transition = {
  type: "tween",
  duration: 0.7,
  ease: "easeOut",
}

// ============================================================================
// Easing-Specific Transitions
// ============================================================================

export const easeInOut: Transition = {
  type: "tween",
  duration: 0.3,
  ease: "easeInOut",
}

export const easeIn: Transition = {
  type: "tween",
  duration: 0.3,
  ease: "easeIn",
}

export const easeOut: Transition = {
  type: "tween",
  duration: 0.3,
  ease: "easeOut",
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create custom spring transition
 */
export function createSpring(
  stiffness: number = 300,
  damping: number = 30,
  mass: number = 1
): Transition {
  return {
    type: "spring",
    stiffness,
    damping,
    mass,
  }
}

/**
 * Create custom tween transition
 */
export function createTween(
  duration: number = 0.3,
  ease: Transition["ease"] = "easeOut"
): Transition {
  return {
    type: "tween",
    duration,
    ease,
  }
}

/**
 * Create transition with delay
 */
export function withDelay(
  transition: Transition,
  delay: number
): Transition {
  return {
    ...transition,
    delay,
  }
}

/**
 * Create stagger transition
 */
export function createStagger(
  staggerChildren: number = 0.1,
  delayChildren: number = 0
): Transition {
  return {
    staggerChildren,
    delayChildren,
  }
}
