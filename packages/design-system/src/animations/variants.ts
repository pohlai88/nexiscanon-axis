import type { Variants } from "motion/react"

/**
 * Animation Variants for Framer Motion
 * 
 * Optimized for Tailwind v4 and modern React patterns.
 * All variants respect prefers-reduced-motion.
 */

// ============================================================================
// Fade Variants
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

// ============================================================================
// Scale Variants
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
}

export const scaleDown: Variants = {
  hidden: { opacity: 0, scale: 1.2 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.2 },
}

// ============================================================================
// Slide Variants
// ============================================================================

export const slideInUp: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
}

export const slideInDown: Variants = {
  hidden: { y: "-100%" },
  visible: { y: 0 },
  exit: { y: "-100%" },
}

export const slideInLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
}

export const slideInRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
}

// ============================================================================
// Blur Variants
// ============================================================================

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(10px)" },
}

export const blurInUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: 20, filter: "blur(10px)" },
}

export const blurInDown: Variants = {
  hidden: { opacity: 0, y: -20, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(10px)" },
}

// ============================================================================
// Stagger Container Variants
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create custom fade variant with configurable offset
 */
export function createFadeVariant(
  direction: "up" | "down" | "left" | "right" = "up",
  offset: number = 20
): Variants {
  const axis = direction === "up" || direction === "down" ? "y" : "x"
  const value = direction === "up" || direction === "left" ? offset : -offset

  return {
    hidden: { opacity: 0, [axis]: value },
    visible: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: value },
  }
}

/**
 * Create custom scale variant
 */
export function createScaleVariant(scale: number = 0.95): Variants {
  return {
    hidden: { opacity: 0, scale },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale },
  }
}

/**
 * Create custom blur variant
 */
export function createBlurVariant(blur: number = 10): Variants {
  return {
    hidden: { opacity: 0, filter: `blur(${blur}px)` },
    visible: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: `blur(${blur}px)` },
  }
}
