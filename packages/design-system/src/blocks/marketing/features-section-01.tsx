"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { cn } from "../../lib/utils"

export interface Feature {
  id: string
  title: string
  description: string
  icon?: React.ReactNode
}

export interface FeaturesSection01Props {
  title?: string
  description?: string
  features: Feature[]
  columns?: 2 | 3 | 4
  variant?: "cards" | "simple" | "icons-left"
  className?: string
}

const columnClasses = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
}

export function FeaturesSection01({
  title,
  description,
  features,
  columns = 3,
  variant = "cards",
  className,
}: FeaturesSection01Props) {
  return (
    <section className={cn("py-20", className)}>
      <div className="container px-4 md:px-6">
        {(title || description) && (
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={cn("grid gap-6", columnClasses[columns])}>
          {features.map((feature) => {
            if (variant === "cards") {
              return (
                <Card key={feature.id}>
                  <CardHeader>
                    {feature.icon && (
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                    )}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            }

            if (variant === "icons-left") {
              return (
                <div key={feature.id} className="flex gap-4">
                  {feature.icon && (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            }

            // Simple variant
            return (
              <div key={feature.id} className="text-center">
                {feature.icon && (
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
