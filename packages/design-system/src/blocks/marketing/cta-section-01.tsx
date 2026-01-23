"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "../../components/button"
import { cn } from "../../lib/utils"

export interface CTASection01Props {
  title: string
  description?: string
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
  variant?: "default" | "centered" | "split" | "gradient"
  className?: string
}

export function CTASection01({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "default",
  className,
}: CTASection01Props) {
  if (variant === "gradient") {
    return (
      <section
        className={cn(
          "py-20 bg-gradient-to-r from-primary to-primary/80",
          className
        )}
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-primary-foreground/80 max-w-2xl">
                {description}
              </p>
            )}
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {primaryAction && (
                  primaryAction.href ? (
                    <Button
                      size="lg"
                      variant="secondary"
                      render={<a href={primaryAction.href} />}
                    >
                      {primaryAction.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={primaryAction.onClick}
                    >
                      {primaryAction.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )
                )}
                {secondaryAction && (
                  secondaryAction.href ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                      render={<a href={secondaryAction.href} />}
                    >
                      {secondaryAction.label}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                      onClick={secondaryAction.onClick}
                    >
                      {secondaryAction.label}
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (variant === "split") {
    return (
      <section className={cn("py-20 bg-muted/50", className)}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h2>
              {description && (
                <p className="text-muted-foreground max-w-xl">{description}</p>
              )}
            </div>
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col gap-3 sm:flex-row shrink-0">
                {primaryAction && (
                  primaryAction.href ? (
                    <Button size="lg" render={<a href={primaryAction.href} />}>
                      {primaryAction.label}
                    </Button>
                  ) : (
                    <Button size="lg" onClick={primaryAction.onClick}>
                      {primaryAction.label}
                    </Button>
                  )
                )}
                {secondaryAction && (
                  secondaryAction.href ? (
                    <Button
                      size="lg"
                      variant="outline"
                      render={<a href={secondaryAction.href} />}
                    >
                      {secondaryAction.label}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={secondaryAction.onClick}
                    >
                      {secondaryAction.label}
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default and centered variants
  return (
    <section
      className={cn(
        "py-20",
        variant === "centered" && "bg-muted/50",
        className
      )}
    >
      <div className="container px-4 md:px-6">
        <div
          className={cn(
            "flex flex-col space-y-6",
            variant === "centered" && "items-center text-center"
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "text-lg text-muted-foreground",
                variant === "centered" && "max-w-2xl"
              )}
            >
              {description}
            </p>
          )}
          {(primaryAction || secondaryAction) && (
            <div
              className={cn(
                "flex flex-col gap-3 sm:flex-row",
                variant === "centered" && "justify-center"
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
                  <Button
                    size="lg"
                    variant="outline"
                    render={<a href={secondaryAction.href} />}
                  >
                    {secondaryAction.label}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.label}
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
