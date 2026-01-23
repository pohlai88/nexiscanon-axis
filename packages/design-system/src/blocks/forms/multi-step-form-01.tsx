"use client"

import * as React from "react"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card"
import { cn } from "@/lib/utils"

export interface MultiStepFormStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  isOptional?: boolean
}

export interface MultiStepForm01Props {
  steps: MultiStepFormStep[]
  onComplete?: (data: Record<string, unknown>) => void | Promise<void>
  onStepChange?: (stepIndex: number) => void
  initialStep?: number
  showStepNumbers?: boolean
  allowSkipOptional?: boolean
  completeButtonText?: string
  nextButtonText?: string
  previousButtonText?: string
  className?: string
}

export function MultiStepForm01({
  steps,
  onComplete,
  onStepChange,
  initialStep = 0,
  showStepNumbers = true,
  allowSkipOptional = true,
  completeButtonText = "Complete",
  nextButtonText = "Next",
  previousButtonText = "Previous",
  className,
}: MultiStepForm01Props) {
  const [currentStep, setCurrentStep] = React.useState(initialStep)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
    new Set()
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const currentStepData = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      setCurrentStep((prev) => prev + 1)
      onStepChange?.(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      onStepChange?.(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Can only navigate to completed steps or the next available step
    if (completedSteps.has(stepIndex) || stepIndex <= currentStep) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      await onComplete?.({})
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (currentStepData?.isOptional && allowSkipOptional) {
      handleNext()
    }
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index)
            const isCurrent = index === currentStep
            const isClickable = isCompleted || index <= currentStep

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center gap-2 transition-colors duration-200",
                    isClickable && "cursor-pointer",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isCurrent &&
                        !isCompleted &&
                        "border-primary bg-background text-primary",
                      !isCurrent &&
                        !isCompleted &&
                        "border-muted-foreground/30 bg-background text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : showStepNumbers ? (
                      <span className="text-sm font-medium">{index + 1}</span>
                    ) : (
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          isCurrent ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    {step.isOptional && (
                      <p className="text-xs text-muted-foreground">Optional</p>
                    )}
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors duration-200",
                      completedSteps.has(index) ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Current Step Header */}
        <CardTitle>{currentStepData?.title}</CardTitle>
        {currentStepData?.description && (
          <CardDescription>{currentStepData.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>{currentStepData?.content}</CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {previousButtonText}
        </Button>

        <div className="flex gap-2">
          {currentStepData?.isOptional && allowSkipOptional && !isLastStep && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}

          {isLastStep ? (
            <Button onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : completeButtonText}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {nextButtonText}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
