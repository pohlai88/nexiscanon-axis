"use client"

import { useState, createContext, useContext } from "react"
import type { ReactNode, CSSProperties } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import type { MotionValue, SpringOptions } from "motion/react"

import { cn } from "@/lib/utils"

// ============================================================================
// Context
// ============================================================================

interface ImageComparisonContextValue {
  sliderPosition: number
  setSliderPosition: (pos: number) => void
  motionSliderPosition: MotionValue<number>
}

const ImageComparisonContext = createContext<
  ImageComparisonContextValue | undefined
>(undefined)

function useImageComparisonContext(): ImageComparisonContextValue {
  const context = useContext(ImageComparisonContext)
  if (!context) {
    throw new Error(
      "ImageComparison components must be used within ImageComparison"
    )
  }
  return context
}

// ============================================================================
// ImageComparison Container
// ============================================================================

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  bounce: 0,
  duration: 0,
}

export interface ImageComparisonProps {
  children: ReactNode
  className?: string
  /** Enable hover-based comparison (vs drag) */
  enableHover?: boolean
  /** Spring animation options */
  springOptions?: SpringOptions
  /** Initial slider position (0-100) */
  initialPosition?: number
}

/**
 * Image Comparison
 *
 * A before/after image comparison slider.
 * Supports both drag and hover interactions.
 *
 * @source Bundui
 *
 * @example
 * ```tsx
 * <ImageComparison className="aspect-video rounded-lg">
 *   <ImageComparisonImage src="/before.jpg" alt="Before" position="left" />
 *   <ImageComparisonImage src="/after.jpg" alt="After" position="right" />
 *   <ImageComparisonSlider className="bg-white" />
 * </ImageComparison>
 * ```
 */
export function ImageComparison({
  children,
  className,
  enableHover = false,
  springOptions,
  initialPosition = 50,
}: ImageComparisonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const motionValue = useMotionValue(initialPosition)
  const motionSliderPosition = useSpring(
    motionValue,
    springOptions ?? DEFAULT_SPRING_OPTIONS
  )
  const [sliderPosition, setSliderPosition] = useState(initialPosition)

  const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !enableHover) return

    const containerRect = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect()

    let clientX: number
    if ("touches" in event && event.touches[0]) {
      clientX = event.touches[0].clientX
    } else {
      clientX = (event as React.MouseEvent).clientX
    }

    const x = clientX - containerRect.left
    const percentage = Math.min(
      Math.max((x / containerRect.width) * 100, 0),
      100
    )
    motionValue.set(percentage)
    setSliderPosition(percentage)
  }

  return (
    <ImageComparisonContext.Provider
      value={{ sliderPosition, setSliderPosition, motionSliderPosition }}
    >
      <div
        className={cn(
          "relative overflow-hidden select-none",
          enableHover && "cursor-ew-resize",
          className
        )}
        onMouseMove={handleDrag}
        onMouseDown={() => !enableHover && setIsDragging(true)}
        onMouseUp={() => !enableHover && setIsDragging(false)}
        onMouseLeave={() => !enableHover && setIsDragging(false)}
        onTouchMove={handleDrag}
        onTouchStart={() => !enableHover && setIsDragging(true)}
        onTouchEnd={() => !enableHover && setIsDragging(false)}
      >
        {children}
      </div>
    </ImageComparisonContext.Provider>
  )
}

// ============================================================================
// ImageComparisonImage
// ============================================================================

export interface ImageComparisonImageProps {
  className?: string
  alt: string
  src: string
  /** Which side of the comparison this image is on */
  position: "left" | "right"
}

export function ImageComparisonImage({
  className,
  alt,
  src,
  position,
}: ImageComparisonImageProps) {
  const { motionSliderPosition } = useImageComparisonContext()

  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 0 0 ${value}%)`
  )
  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`
  )

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={{
        clipPath: position === "left" ? leftClipPath : rightClipPath,
      }}
    />
  )
}

// ============================================================================
// ImageComparisonSlider
// ============================================================================

export interface ImageComparisonSliderProps {
  className?: string
  children?: ReactNode
  /** Show handle indicator */
  showHandle?: boolean
}

export function ImageComparisonSlider({
  className,
  children,
  showHandle = true,
}: ImageComparisonSliderProps) {
  const { motionSliderPosition } = useImageComparisonContext()

  const left = useTransform(motionSliderPosition, (value) => `${value}%`)

  return (
    <motion.div
      className={cn(
        "absolute top-0 bottom-0 w-0.5 cursor-ew-resize",
        className
      )}
      style={{ left }}
    >
      {children ?? (
        showHandle && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-white shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="m9 18 6-6-6-6" />
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
        )
      )}
    </motion.div>
  )
}

// ============================================================================
// ImageComparisonLabel
// ============================================================================

export interface ImageComparisonLabelProps {
  className?: string
  children: ReactNode
  position: "left" | "right"
}

export function ImageComparisonLabel({
  className,
  children,
  position,
}: ImageComparisonLabelProps) {
  return (
    <div
      className={cn(
        "absolute top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white",
        position === "left" ? "left-4" : "right-4",
        className
      )}
    >
      {children}
    </div>
  )
}
