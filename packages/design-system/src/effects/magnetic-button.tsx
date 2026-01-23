"use client"

import { useState, useEffect, useRef } from "react"
import type { ReactNode, HTMLAttributes } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

// ============================================================================
// MagneticButton
// ============================================================================

const SPRING_CONFIG = { damping: 100, stiffness: 400 }

export interface MagneticButtonProps {
  children: ReactNode
  /** How much the element follows the cursor (0-1) */
  distance?: number
  /** Whether the effect is disabled */
  disabled?: boolean
  /** Custom className */
  className?: string
}

/**
 * Magnetic Button
 *
 * A wrapper that makes its children follow the cursor on hover.
 * Creates a "magnetic" attraction effect.
 *
 * @source Bundui
 *
 * @example
 * ```tsx
 * <MagneticButton distance={0.4}>
 *   <Button>Hover me</Button>
 * </MagneticButton>
 * ```
 */
export function MagneticButton({
  children,
  distance = 0.6,
  disabled = false,
  className,
}: MagneticButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, SPRING_CONFIG)
  const springY = useSpring(y, SPRING_CONFIG)

  useEffect(() => {
    if (disabled) return

    const calculateDistance = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY

        if (isHovered) {
          x.set(distanceX * distance)
          y.set(distanceY * distance)
        } else {
          x.set(0)
          y.set(0)
        }
      }
    }

    document.addEventListener("mousemove", calculateDistance)

    return () => {
      document.removeEventListener("mousemove", calculateDistance)
    }
  }, [ref, isHovered, distance, disabled, x, y])

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        x: springX,
        y: springY,
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// MagneticContainer (for multiple magnetic elements)
// ============================================================================

export interface MagneticContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Magnetic Container
 *
 * A container for grouping magnetic elements.
 * Useful for nav menus or button groups.
 */
export function MagneticContainer({
  children,
  className,
  ...props
}: MagneticContainerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
}
