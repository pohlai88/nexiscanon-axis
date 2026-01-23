"use client"

import { useState, useEffect, useRef, useId } from "react"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

// ============================================================================
// TextMorph Component
// ============================================================================

export interface TextMorphProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Array of texts to cycle through */
  texts: string[]
  /** Duration of the morph transition in seconds */
  morphTime?: number
  /** Pause duration between transitions in seconds */
  cooldownTime?: number
}

/**
 * Text Morph Animation
 *
 * Creates a smooth morphing transition between texts
 * using SVG filters for a liquid/blur effect.
 *
 * @source Bundui
 *
 * @example
 * ```tsx
 * <TextMorph
 *   texts={["Innovative", "Powerful", "Beautiful", "Fast"]}
 *   morphTime={2}
 *   cooldownTime={0.5}
 *   className="text-6xl font-bold"
 * />
 * ```
 */
export function TextMorph({
  texts,
  morphTime = 2.5,
  cooldownTime = 0.25,
  className,
  ...props
}: TextMorphProps) {
  const filterId = useId()
  const [textIndex, setTextIndex] = useState(0)
  const [morph, setMorph] = useState(0)
  const [cooldown, setCooldown] = useState(cooldownTime)
  const animationRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number>(performance.now())

  useEffect(() => {
    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      setCooldown((prevCooldown) => {
        const newCooldown = prevCooldown - dt

        if (newCooldown <= 0) {
          setMorph((prevMorph) => {
            const newMorph = prevMorph + dt

            if (newMorph >= morphTime) {
              setTextIndex((prev) => (prev + 1) % texts.length)
              return 0
            }

            return newMorph
          })

          return newCooldown
        } else {
          setMorph(0)
          return newCooldown
        }
      })

      if (morph >= morphTime) {
        setCooldown(cooldownTime)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [texts.length, morphTime, cooldownTime, morph])

  const getMorphStyles = (isSecondText: boolean) => {
    if (cooldown > 0) {
      return {
        filter: "",
        opacity: isSecondText ? 0 : 1,
      }
    }

    let fraction = Math.min(morph / morphTime, 1)

    if (!isSecondText) {
      fraction = 1 - fraction
    }

    const blur = Math.max(0, Math.min(6 / fraction - 6, 100))
    const opacity = Math.pow(fraction, 0.4)

    return {
      filter: `blur(${blur}px)`,
      opacity: opacity,
    }
  }

  return (
    <div
      className={cn(
        "relative flex h-20 w-full items-center justify-center",
        className
      )}
      {...props}
    >
      {/* SVG Filter for threshold effect */}
      <svg className="absolute h-0 w-0">
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute flex h-full w-full items-center justify-center"
        style={{
          filter: `url(#${filterId}) blur(0.6px)`,
        }}
      >
        <span
          className="absolute w-full text-center font-black select-none"
          style={getMorphStyles(false)}
        >
          {texts[textIndex]}
        </span>

        <span
          className="absolute w-full text-center font-black select-none"
          style={getMorphStyles(true)}
        >
          {texts[(textIndex + 1) % texts.length]}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// TextMorphAuto (Auto-sizing variant)
// ============================================================================

export interface TextMorphAutoProps extends TextMorphProps {
  /** Minimum height */
  minHeight?: string
}

/**
 * TextMorphAuto
 *
 * A variant that auto-sizes to fit the longest text.
 */
export function TextMorphAuto({
  texts,
  minHeight = "1.5em",
  className,
  ...props
}: TextMorphAutoProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      {/* Hidden text to establish width */}
      <span className="invisible whitespace-nowrap font-black">
        {texts.reduce((a, b) => (a.length > b.length ? a : b), "")}
      </span>

      <TextMorph
        texts={texts}
        className="absolute inset-0"
        style={{ minHeight }}
        {...props}
      />
    </div>
  )
}
