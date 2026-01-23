"use client"

import * as React from "react"
import { cn } from "../lib/utils"

/* =================================================================
   GrainOverlay Component
   
   A wrapper component that adds textured grain overlay to any content.
   Use this for complex grain effects that need programmatic control.
   
   For simple cases, prefer the CSS utility classes:
   - glass-grain
   - glass-grain-subtle
   - glass-grain-medium
   - glass-grain-heavy
   
   @see E02-07-THEME-GLASS.md for full documentation
   ================================================================= */

export interface GrainOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grain intensity level */
  intensity?: "subtle" | "medium" | "heavy" | "custom"
  /** Custom grain opacity (0-1), only used when intensity is "custom" */
  opacity?: number
  /** Grain blend mode */
  blendMode?: "overlay" | "soft-light" | "multiply" | "screen"
  /** Whether to animate the grain */
  animated?: boolean
  /** Animation speed in seconds */
  animationSpeed?: number
  /** Base frequency for noise pattern (0.1 - 2) */
  frequency?: number
  /** Children to render inside the grain container */
  children: React.ReactNode
  /** Additional className for the wrapper */
  className?: string
  /** Additional className for the grain layer */
  grainClassName?: string
  /** Whether grain is enabled */
  enabled?: boolean
}

const INTENSITY_OPACITY: Record<string, number> = {
  subtle: 0.02,
  medium: 0.04,
  heavy: 0.08,
}

/**
 * Generate SVG noise pattern as data URL
 */
function generateNoisePattern(frequency: number = 0.85): string {
  const svg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='noiseFilter'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#noiseFilter)'/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * GrainOverlay - Adds a textured grain layer over content
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <GrainOverlay>
 *   <Card>Content with grain effect</Card>
 * </GrainOverlay>
 * 
 * // With intensity
 * <GrainOverlay intensity="heavy">
 *   <Modal>...</Modal>
 * </GrainOverlay>
 * 
 * // Animated grain
 * <GrainOverlay animated animationSpeed={0.5}>
 *   <div>Dynamic texture</div>
 * </GrainOverlay>
 * 
 * // Custom opacity
 * <GrainOverlay intensity="custom" opacity={0.06}>
 *   <div>Custom grain intensity</div>
 * </GrainOverlay>
 * ```
 */
export function GrainOverlay({
  intensity = "medium",
  opacity,
  blendMode = "overlay",
  animated = false,
  animationSpeed = 0.3,
  frequency = 0.85,
  children,
  className,
  grainClassName,
  enabled = true,
  ...props
}: GrainOverlayProps) {
  const grainOpacity = intensity === "custom" 
    ? (opacity ?? 0.04) 
    : INTENSITY_OPACITY[intensity]

  const noisePattern = React.useMemo(
    () => generateNoisePattern(frequency),
    [frequency]
  )

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* Content layer - above grain */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Grain layer */}
      {enabled && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-1",
            animated && "grain-animated",
            grainClassName
          )}
          style={{
            opacity: grainOpacity,
            backgroundImage: `url("${noisePattern}")`,
            backgroundRepeat: "repeat",
            mixBlendMode: blendMode,
            borderRadius: "inherit",
            ...(animated && {
              animation: `grain-shift ${animationSpeed}s steps(10) infinite`,
            }),
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Keyframes for animated grain */}
      {animated && (
        <style>{`
          @keyframes grain-shift {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-5%, -10%); }
            20% { transform: translate(-15%, 5%); }
            30% { transform: translate(7%, -25%); }
            40% { transform: translate(-5%, 25%); }
            50% { transform: translate(-15%, 10%); }
            60% { transform: translate(15%, 0%); }
            70% { transform: translate(0%, 15%); }
            80% { transform: translate(3%, 35%); }
            90% { transform: translate(-10%, 10%); }
          }
        `}</style>
      )}
    </div>
  )
}

/* =================================================================
   GlassSurface Component
   
   A comprehensive glass surface component that combines:
   - Glass blur
   - Optional grain
   - Tint variants
   - Interactive states
   
   This is the component approach for when you need full control.
   ================================================================= */

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glass blur intensity */
  blur?: "none" | "sm" | "md" | "lg" | "xl"
  /** Glass opacity level */
  opacity?: "solid" | "medium" | "subtle" | "ethereal"
  /** Enable grain overlay */
  grain?: boolean
  /** Grain intensity when enabled */
  grainIntensity?: "subtle" | "medium" | "heavy"
  /** Tint color from semantic tokens */
  tint?: "none" | "primary" | "secondary" | "accent" | "destructive" | "muted"
  /** Enable shadow */
  shadow?: boolean | "lg"
  /** Interactive hover/active states */
  interactive?: boolean
  /** As child element (for composition) */
  asChild?: boolean
  /** Children */
  children: React.ReactNode
}

const BLUR_MAP: Record<string, string> = {
  none: "glass-blur-none",
  sm: "glass-blur-sm",
  md: "glass-blur-md",
  lg: "glass-blur-lg",
  xl: "glass-blur-xl",
}

const OPACITY_MAP: Record<string, string> = {
  solid: "glass-solid",
  medium: "",
  subtle: "glass-subtle",
  ethereal: "glass-ethereal",
}

const GRAIN_MAP: Record<string, string> = {
  subtle: "glass-grain-subtle",
  medium: "glass-grain",
  heavy: "glass-grain-heavy",
}

const TINT_MAP: Record<string, string> = {
  none: "",
  primary: "glass-tint-primary",
  secondary: "glass-tint-secondary",
  accent: "glass-tint-accent",
  destructive: "glass-tint-destructive",
  muted: "glass-tint-muted",
}

/**
 * GlassSurface - Complete glass surface with all options
 * 
 * @example
 * ```tsx
 * // Basic glass card
 * <GlassSurface className="rounded-xl p-4">
 *   <p>Content</p>
 * </GlassSurface>
 * 
 * // Full-featured modal glass
 * <GlassSurface
 *   blur="xl"
 *   opacity="solid"
 *   grain
 *   grainIntensity="subtle"
 *   tint="primary"
 *   shadow="lg"
 *   className="rounded-2xl p-6"
 * >
 *   <Dialog>...</Dialog>
 * </GlassSurface>
 * 
 * // Interactive button glass
 * <GlassSurface interactive className="rounded-lg px-4 py-2">
 *   <span>Click me</span>
 * </GlassSurface>
 * ```
 */
export function GlassSurface({
  blur = "md",
  opacity = "medium",
  grain = false,
  grainIntensity = "subtle",
  tint = "none",
  shadow = false,
  interactive = false,
  asChild: _asChild = false,
  children,
  className,
  ...props
}: GlassSurfaceProps) {
  const classes = cn(
    "glass",
    BLUR_MAP[blur],
    OPACITY_MAP[opacity],
    grain && GRAIN_MAP[grainIntensity],
    TINT_MAP[tint],
    shadow === true && "glass-shadow",
    shadow === "lg" && "glass-shadow-lg",
    interactive && "glass-interactive",
    className
  )

  return (
    <div className={classes} {...props}>
      {grain ? (
        <div className="glass-content">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

/* Types are already exported with their interfaces above */
