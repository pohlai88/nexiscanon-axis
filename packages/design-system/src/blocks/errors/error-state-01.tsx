"use client"

import * as React from "react"
import { Button } from "../../components/button"
import { Card, CardContent } from "../../components/card"
import { cn } from "../../lib/utils"
import { AlertCircle, ServerCrash, ShieldAlert, FileQuestion } from "lucide-react"

export type ErrorType = "404" | "500" | "403" | "generic"

export interface ErrorState01Props {
  type?: ErrorType
  title?: string
  description?: string
  onBack?: () => void
  onHome?: () => void
  backLabel?: string
  homeLabel?: string
  className?: string
}

const errorConfig = {
  "404": {
    icon: FileQuestion,
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
  },
  "500": {
    icon: ServerCrash,
    title: "Server Error",
    description: "Something went wrong on our end. We're working to fix it.",
  },
  "403": {
    icon: ShieldAlert,
    title: "Access Denied",
    description: "You don't have permission to access this resource.",
  },
  generic: {
    icon: AlertCircle,
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again.",
  },
}

export function ErrorState01({
  type = "generic",
  title,
  description,
  onBack,
  onHome,
  backLabel = "Go Back",
  homeLabel = "Go Home",
  className,
}: ErrorState01Props) {
  const config = errorConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex min-h-[400px] items-center justify-center p-4",
        className
      )}
    >
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <Icon className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">
              {title || config.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {description || config.description}
            </p>
            <div className="mt-6 flex gap-2">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  {backLabel}
                </Button>
              )}
              {onHome && (
                <Button onClick={onHome}>{homeLabel}</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
