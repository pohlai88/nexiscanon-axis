"use client"

import { useEffect, useRef, useState } from "react"
import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

interface AnimatedCircularProgressProps
  extends ComponentPropsWithoutRef<"div"> {
  value: number
  max?: number
  min?: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  valuePrefix?: string
  valueSuffix?: string
  primaryColor?: string
  secondaryColor?: string
  className?: string
}

export function AnimatedCircularProgress({
  value,
  max = 100,
  min = 0,
  size = 120,
  strokeWidth = 10,
  showValue = true,
  valuePrefix = "",
  valueSuffix = "%",
  primaryColor = "hsl(var(--primary))",
  secondaryColor = "hsl(var(--muted))",
  className,
  ...props
}: AnimatedCircularProgressProps) {
  const [currentValue, setCurrentValue] = useState(min)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const normalizedValue = Math.min(Math.max(value, min), max)
  const percentage = ((normalizedValue - min) / (max - min)) * 100
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (currentValue / 100) * circumference

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return

    const animationDuration = 1000
    const startTime = performance.now()
    const startValue = currentValue

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const newValue = startValue + (percentage - startValue) * easeOut

      setCurrentValue(newValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, percentage])

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">
            {valuePrefix}
            {Math.round(currentValue)}
            {valueSuffix}
          </span>
        </div>
      )}
    </div>
  )
}
