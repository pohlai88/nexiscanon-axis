"use client"

import { useEffect, useId, useRef, useState, useCallback } from "react"
import type { HTMLAttributes } from "react"
import {
  motion,
  useSpring,
  useTransform,
  motionValue,
} from "motion/react"
import type { MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

// ============================================================================
// Spring Configuration
// ============================================================================

const TRANSITION = {
  type: "spring" as const,
  stiffness: 280,
  damping: 18,
  mass: 0.3,
}

// ============================================================================
// Internal Digit Component
// ============================================================================

interface DigitProps {
  value: number
  place: number
  height: number
}

function Digit({ value, place, height }: DigitProps) {
  const valueRoundedToPlace = Math.floor(value / place) % 10
  const initial = motionValue(valueRoundedToPlace)
  const animatedValue = useSpring(initial, TRANSITION)

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace)
  }, [animatedValue, valueRoundedToPlace])

  return (
    <div
      className="relative inline-block w-[1ch] overflow-x-visible overflow-y-clip leading-none tabular-nums"
      style={{ height }}
    >
      <div className="invisible">0</div>
      {Array.from({ length: 10 }, (_, i) => (
        <NumberSlot key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  )
}

// ============================================================================
// Internal NumberSlot Component
// ============================================================================

interface NumberSlotProps {
  mv: MotionValue<number>
  number: number
  height: number
}

function NumberSlot({ mv, number, height }: NumberSlotProps) {
  const uniqueId = useId()

  const y = useTransform(mv, (latest) => {
    if (!height) return 0
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * height

    if (offset > 5) {
      memo -= 10 * height
    }

    return memo
  })

  return (
    <motion.span
      style={{ y }}
      layoutId={`${uniqueId}-${number}`}
      className="absolute inset-0 flex items-center justify-center"
      transition={TRANSITION}
    >
      {number}
    </motion.span>
  )
}

// ============================================================================
// SlidingNumber Component
// ============================================================================

export interface SlidingNumberProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The number to display */
  value: number
  /** Pad single digits with leading zero */
  padStart?: boolean
  /** Decimal separator character */
  decimalSeparator?: string
  /** Thousands separator character */
  thousandsSeparator?: string
  /** Number of decimal places to show */
  decimalPlaces?: number
  /** Prefix string (e.g., "$") */
  prefix?: string
  /** Suffix string (e.g., "%") */
  suffix?: string
}

/**
 * Sliding Number
 *
 * A slot-machine style number animation.
 * Each digit slides independently with spring physics.
 *
 * @source Bundui
 *
 * @example
 * ```tsx
 * // Basic
 * <SlidingNumber value={1234} />
 *
 * // Currency
 * <SlidingNumber value={99.99} prefix="$" decimalPlaces={2} />
 *
 * // Percentage
 * <SlidingNumber value={85} suffix="%" />
 *
 * // Clock
 * <SlidingNumber value={hours} padStart />
 * <span>:</span>
 * <SlidingNumber value={minutes} padStart />
 * ```
 */
export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = ".",
  thousandsSeparator,
  decimalPlaces,
  prefix,
  suffix,
  className,
  ...props
}: SlidingNumberProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [digitHeight, setDigitHeight] = useState(24)

  // Measure digit height on mount
  useEffect(() => {
    if (containerRef.current) {
      const computedStyle = getComputedStyle(containerRef.current)
      const lineHeight = parseFloat(computedStyle.lineHeight)
      if (!isNaN(lineHeight)) {
        setDigitHeight(lineHeight)
      }
    }
  }, [])

  const absValue = Math.abs(value)

  // Handle decimal places
  let displayValue = absValue
  if (typeof decimalPlaces === "number") {
    displayValue = parseFloat(absValue.toFixed(decimalPlaces))
  }

  const parts = displayValue.toString().split(".")
  const integerPart = parts[0] ?? "0"
  const decimalPart = parts[1]
  const integerValue = parseInt(integerPart, 10)
  const paddedInteger =
    padStart && integerValue < 10 ? `0${integerPart}` : integerPart
  const integerDigits = paddedInteger.split("")
  const integerPlaces = integerDigits.map(
    (_, i) => Math.pow(10, integerDigits.length - i - 1)
  )

  // Format decimal part if decimalPlaces specified
  const formattedDecimal =
    typeof decimalPlaces === "number"
      ? (decimalPart ?? "").padEnd(decimalPlaces, "0")
      : decimalPart

  return (
    <div
      ref={containerRef}
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      {prefix && <span>{prefix}</span>}
      {value < 0 && <span>-</span>}

      {integerDigits.map((_, index) => {
        const place = integerPlaces[index] ?? 1
        return (
          <Digit
            key={`pos-${place}`}
            value={integerValue}
            place={place}
            height={digitHeight}
          />
        )
      })}

      {formattedDecimal && formattedDecimal.length > 0 && (
        <>
          <span>{decimalSeparator}</span>
          {formattedDecimal.split("").map((_, index) => (
            <Digit
              key={`decimal-${index}`}
              value={parseInt(formattedDecimal, 10) || 0}
              place={Math.pow(10, formattedDecimal.length - index - 1)}
              height={digitHeight}
            />
          ))}
        </>
      )}

      {suffix && <span>{suffix}</span>}
    </div>
  )
}

// ============================================================================
// Countdown (Alias with different defaults)
// ============================================================================

export interface CountdownProps extends SlidingNumberProps {
  /** Target date for countdown */
  targetDate?: Date
}

/**
 * Countdown
 *
 * A countdown timer using sliding numbers.
 * Alias for SlidingNumber with padStart=true by default.
 */
export function Countdown({
  padStart = true,
  ...props
}: CountdownProps) {
  return <SlidingNumber padStart={padStart} {...props} />
}

// ============================================================================
// useCountdown Hook
// ============================================================================

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function useCountdown(targetDate: Date): CountdownTime {
  const calculateTimeLeft = useCallback((): CountdownTime => {
    const difference = targetDate.getTime() - new Date().getTime()

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return timeLeft
}
