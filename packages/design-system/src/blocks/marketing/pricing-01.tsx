"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { Button } from "../../components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Badge } from "../../components/badge"
import { cn } from "../../lib/utils"

export interface PricingPlan {
  id: string
  name: string
  description?: string
  price: {
    monthly: number | string
    annually?: number | string
  }
  currency?: string
  features: string[]
  highlighted?: boolean
  badge?: string
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary"
  onSelect?: () => void
}

export interface Pricing01Props {
  title?: string
  description?: string
  plans: PricingPlan[]
  billingPeriod?: "monthly" | "annually"
  onBillingChange?: (period: "monthly" | "annually") => void
  showToggle?: boolean
  className?: string
}

export function Pricing01({
  title = "Simple, transparent pricing",
  description = "Choose the plan that's right for you",
  plans,
  billingPeriod = "monthly",
  onBillingChange,
  showToggle = true,
  className,
}: Pricing01Props) {
  const [period, setPeriod] = React.useState(billingPeriod)

  const handlePeriodChange = (newPeriod: "monthly" | "annually") => {
    setPeriod(newPeriod)
    onBillingChange?.(newPeriod)
  }

  return (
    <section className={cn("py-20", className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}

          {showToggle && (
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => handlePeriodChange("monthly")}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  period === "monthly"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <div
                className="relative h-6 w-12 cursor-pointer rounded-full bg-muted p-1"
                onClick={() =>
                  handlePeriodChange(
                    period === "monthly" ? "annually" : "monthly"
                  )
                }
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full bg-primary transition-transform duration-200",
                    period === "annually" && "translate-x-6"
                  )}
                />
              </div>
              <button
                onClick={() => handlePeriodChange("annually")}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  period === "annually"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Annually
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price =
              period === "annually" && plan.price.annually
                ? plan.price.annually
                : plan.price.monthly

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col",
                  plan.highlighted &&
                    "border-primary shadow-lg scale-105 z-10"
                )}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.description && (
                    <CardDescription>{plan.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      {plan.currency || "$"}
                      {typeof price === "number" ? price : price}
                    </span>
                    <span className="text-muted-foreground">
                      /{period === "annually" ? "year" : "month"}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.buttonVariant || (plan.highlighted ? "default" : "outline")}
                    onClick={plan.onSelect}
                  >
                    {plan.buttonText || "Get started"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
