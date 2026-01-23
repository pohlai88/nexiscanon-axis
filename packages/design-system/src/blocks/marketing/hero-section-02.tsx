"use client"

import * as React from "react"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/button"
import { cn } from "@/lib/utils"

export interface HeroSection02Props {
  eyebrow?: string
  title: string
  description: string
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  videoAction?: {
    label: string
    onClick?: () => void
  }
  stats?: Array<{
    value: string
    label: string
  }>
  backgroundImage?: string
  overlay?: boolean
  className?: string
}

export function HeroSection02({
  eyebrow,
  title,
  description,
  primaryAction,
  videoAction,
  stats,
  backgroundImage,
  overlay = true,
  className,
}: HeroSection02Props) {
  return (
    <section
      className={cn(
        "relative min-h-[80vh] flex items-center overflow-hidden",
        className
      )}
    >
      {/* Background */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {overlay && (
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          )}
        </>
      )}

      <div className="container relative z-10 px-4 md:px-6 py-20">
        <div className="max-w-2xl space-y-8">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </p>
          )}

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>

          <p className="text-lg text-muted-foreground md:text-xl">
            {description}
          </p>

          {(primaryAction || videoAction) && (
            <div className="flex flex-col gap-4 sm:flex-row">
              {primaryAction && (
                primaryAction.href ? (
                  <Button size="lg" render={<a href={primaryAction.href} />}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="lg" onClick={primaryAction.onClick}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )
              )}
              {videoAction && (
                <Button variant="ghost" size="lg" onClick={videoAction.onClick}>
                  <Play className="mr-2 h-4 w-4" />
                  {videoAction.label}
                </Button>
              )}
            </div>
          )}

          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-8 pt-8 border-t">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
