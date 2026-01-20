import React from "react";
import { Card } from "@workspace/design-system/components/card";
import { Badge } from "@workspace/design-system/components/badge";
import { cn } from "@workspace/design-system/lib/utils";

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface ProcessStepsProps {
  steps: ProcessStep[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Process Steps
 * 
 * Visual process flow with numbered steps and connecting lines.
 * Perfect for explaining workflows, onboarding, or methodologies.
 * 
 * Features:
 * - Numbered badges
 * - Connecting lines
 * - Icon support
 * - Horizontal/Vertical layouts
 * - Responsive design
 * - Hover animations
 * 
 * @meta
 * - Category: Content
 * - Section: process
 * - Use Cases: How it works, Onboarding flows, Service processes, Step-by-step guides
 */
export function ProcessSteps({
  steps,
  orientation = "horizontal",
  className,
}: ProcessStepsProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "relative",
        isVertical ? "space-y-8" : "grid gap-6 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {steps.map((step, idx) => (
        <React.Fragment key={step.number}>
          <ProcessStepCard step={step} isVertical={isVertical} />

          {/* Connecting Line */}
          {idx < steps.length - 1 && !isVertical && (
            <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-x-1/2 bg-border md:block" />
          )}
          {idx < steps.length - 1 && isVertical && (
            <div className="relative pl-16">
              <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ProcessStepCard({
  step,
  isVertical,
}: {
  step: ProcessStep;
  isVertical: boolean;
}) {
  return (
    <Card
      className={cn(
        "group relative transition-all hover:shadow-lg",
        isVertical ? "flex gap-4 p-6" : "flex flex-col p-6"
      )}
    >
      {/* Number Badge */}
      <div
        className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md transition-transform group-hover:scale-110",
          !isVertical && "mb-4"
        )}
      >
        {step.number}
      </div>

      <div className={cn("flex-1", isVertical && "pt-1")}>
        {/* Icon */}
        {step.icon && (
          <div
            className={cn(
              "mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
              !isVertical && "mx-auto"
            )}
          >
            {step.icon}
          </div>
        )}

        {/* Content */}
        <h3
          className={cn(
            "mb-2 text-lg font-semibold tracking-tight",
            !isVertical && "text-center"
          )}
        >
          {step.title}
        </h3>
        <p
          className={cn(
            "text-sm text-muted-foreground",
            !isVertical && "text-center"
          )}
        >
          {step.description}
        </p>
      </div>

      {/* Hover Effect */}
      <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent" />
      </div>
    </Card>
  );
}
