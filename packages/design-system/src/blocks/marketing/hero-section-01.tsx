"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "../../components/button"
import { Badge } from "../../components/badge"
import { cn } from "../../lib/utils"

export interface HeroSection01Props {
  badge?: string
  title: string
  titleHighlight?: string
  description: string
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  image?: {
    src: string
    alt: string
  }
  align?: "left" | "center"
  className?: string
}

export function HeroSection01({
  badge,
  title,
  titleHighlight,
  description,
  primaryAction,
  secondaryAction,
  image,
  align = "center",
  className,
}: HeroSection01Props) {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-20 md:py-32",
        className
      )}
    >
      <div className="container px-4 md:px-6">
        <div
          className={cn(
            "flex flex-col gap-8",
            align === "center" && "items-center text-center",
            align === "left" && "md:flex-row md:items-center md:gap-12"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-4",
              align === "center" && "max-w-3xl",
              align === "left" && "flex-1"
            )}
          >
            {badge && (
              <Badge variant="secondary" className="w-fit">
                {badge}
              </Badge>
            )}

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {title}{" "}
              {titleHighlight && (
                <span className="text-primary">{titleHighlight}</span>
              )}
            </h1>

            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl">
              {description}
            </p>

            {(primaryAction || secondaryAction) && (
              <div
                className={cn(
                  "flex flex-col gap-3 sm:flex-row",
                  align === "center" && "justify-center"
                )}
              >
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
                {secondaryAction && (
                  secondaryAction.href ? (
                    <Button variant="outline" size="lg" render={<a href={secondaryAction.href} />}>
                      {secondaryAction.label}
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" onClick={secondaryAction.onClick}>
                      {secondaryAction.label}
                    </Button>
                  )
                )}
              </div>
            )}
          </div>

          {image && (
            <div
              className={cn(
                "relative",
                align === "center" && "w-full max-w-4xl",
                align === "left" && "flex-1"
              )}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="rounded-xl border shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
