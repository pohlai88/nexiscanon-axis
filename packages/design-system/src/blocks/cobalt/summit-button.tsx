"use client"

/**
 * SUMMIT Button - Cobalt Kernel Single-Action Workflow
 *
 * One button that completes an entire workflow.
 * Implements A01-CANONICAL.md §4 — "One tap, done"
 *
 * Features:
 * - Pre-validation before execution
 * - Progress indicators with step descriptions
 * - Rollback on error
 * - Success celebration (confetti)
 * - Automatic audit trail
 *
 * @example
 * ```tsx
 * import { SUMMITButton } from "@workspace/design-system"
 *
 * <SUMMITButton
 *   label="Post Invoice"
 *   steps={[
 *     { id: "validate", label: "Validating..." },
 *     { id: "post", label: "Posting to ledger..." },
 *     { id: "email", label: "Sending email..." },
 *     { id: "complete", label: "Complete!" },
 *   ]}
 *   onExecute={async (onProgress) => {
 *     onProgress("validate")
 *     await validateInvoice()
 *     onProgress("post")
 *     await postToLedger()
 *     onProgress("email")
 *     await sendEmail()
 *     onProgress("complete")
 *   }}
 *   onSuccess={() => toast.success("Invoice posted!")}
 *   onError={(error) => toast.error(error.message)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/button"
import { Progress } from "../../components/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/alert-dialog"
import {
  Check,
  Loader2,
  AlertTriangle,
  XCircle,
  Zap,
} from "lucide-react"
import { Confetti, type ConfettiRef } from "../../effects/confetti"

// Button props type
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>

// ============================================================================
// Types
// ============================================================================

export interface SUMMITStep {
  id: string
  label: string
  description?: string
}

export interface SUMMITButtonProps extends Omit<ButtonProps, "onClick" | "onError"> {
  /** Button label */
  label: string
  /** Execution steps with labels */
  steps: SUMMITStep[]
  /** Main execution function - receives progress callback */
  onExecute: (onProgress: (stepId: string) => void) => Promise<void>
  /** Success callback */
  onSuccess?: () => void
  /** Error callback */
  onError?: (error: Error) => void
  /** Rollback function (called on error) */
  onRollback?: () => Promise<void>
  /** Show confirmation dialog before execution */
  requireConfirmation?: boolean
  /** Confirmation dialog title */
  confirmTitle?: string
  /** Confirmation dialog description */
  confirmDescription?: string
  /** Show confetti on success */
  showConfetti?: boolean
  /** Icon to show */
  icon?: React.ComponentType<{ className?: string }>
  /** Danger mode (destructive styling) */
  danger?: boolean
  /** Disabled state */
  disabled?: boolean
}

type ExecutionState = "idle" | "executing" | "success" | "error"

// ============================================================================
// Component
// ============================================================================

export function SUMMITButton({
  label,
  steps,
  onExecute,
  onSuccess,
  onError,
  onRollback,
  requireConfirmation = false,
  confirmTitle = "Confirm Action",
  confirmDescription = "Are you sure you want to proceed with this action?",
  showConfetti = true,
  icon: Icon = Zap,
  danger = false,
  disabled = false,
  className,
  ...buttonProps
}: SUMMITButtonProps) {
  const [state, setState] = React.useState<ExecutionState>("idle")
  const [currentStepId, setCurrentStepId] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
  const confettiRef = React.useRef<ConfettiRef>(null)

  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId)
  const progress = currentStepId
    ? Math.round(((currentStepIndex + 1) / steps.length) * 100)
    : 0
  const currentStep = steps.find((s) => s.id === currentStepId)

  const handleProgress = React.useCallback((stepId: string) => {
    setCurrentStepId(stepId)
  }, [])

  const execute = React.useCallback(async () => {
    setState("executing")
    setCurrentStepId(steps[0]?.id || null)
    setErrorMessage(null)

    try {
      await onExecute(handleProgress)
      setState("success")

      if (showConfetti && confettiRef.current) {
        confettiRef.current.fire({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }

      onSuccess?.()

      // Reset after success animation
      globalThis.setTimeout(() => {
        setState("idle")
        setCurrentStepId(null)
      }, 2000)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState("error")
      setErrorMessage(err.message)
      onError?.(err)

      // Attempt rollback if provided
      if (onRollback) {
        try {
          await onRollback()
        } catch {
          // Rollback failed silently - original error is preserved
        }
      }

      // Reset after error display
      globalThis.setTimeout(() => {
        setState("idle")
        setCurrentStepId(null)
        setErrorMessage(null)
      }, 3000)
    }
  }, [steps, onExecute, handleProgress, showConfetti, onSuccess, onError, onRollback])

  const handleClick = React.useCallback(() => {
    if (requireConfirmation) {
      setShowConfirmDialog(true)
    } else {
      execute()
    }
  }, [requireConfirmation, execute])

  const handleConfirm = React.useCallback(() => {
    setShowConfirmDialog(false)
    execute()
  }, [execute])

  const isExecuting = state === "executing"
  const isSuccess = state === "success"
  const isError = state === "error"

  // Determine button variant
  const getVariant = (): ButtonProps["variant"] => {
    if (isSuccess) return "default"
    if (isError) return "destructive"
    if (danger) return "destructive"
    return "default"
  }

  // Determine icon
  const getIcon = () => {
    if (isExecuting) return <Loader2 className="h-4 w-4 animate-spin" />
    if (isSuccess) return <Check className="h-4 w-4" />
    if (isError) return <XCircle className="h-4 w-4" />
    return <Icon className="h-4 w-4" />
  }

  // Determine label
  const getLabel = () => {
    if (isExecuting && currentStep) return currentStep.label
    if (isSuccess) return "Complete!"
    if (isError) return "Failed"
    return label
  }

  return (
    <>
      {/* Confetti overlay */}
      {showConfetti && <Confetti ref={confettiRef} className="pointer-events-none fixed inset-0 z-50" />}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {danger && <AlertTriangle className="h-5 w-5 text-destructive" />}
              {confirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(danger && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="relative inline-block">
              <Button
                variant={getVariant()}
                disabled={disabled || isExecuting}
                onClick={handleClick}
                className={cn(
                  "relative min-w-[140px] transition-all duration-300",
                  isExecuting && "cursor-wait",
                  isSuccess && "bg-green-600 hover:bg-green-600",
                  className
                )}
                {...buttonProps}
              >
                <span className="flex items-center gap-2">
                  {getIcon()}
                  <span>{getLabel()}</span>
                </span>
              </Button>

              {/* Progress indicator */}
              {isExecuting && (
                <div className="absolute -bottom-1 left-0 right-0 px-1">
                  <Progress value={progress} className="h-1" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {isExecuting && currentStep?.description ? (
              <div>
                <p className="font-medium">{currentStep.label}</p>
                <p className="text-xs text-muted-foreground">{currentStep.description}</p>
              </div>
            ) : isError && errorMessage ? (
              <div className="text-destructive">
                <p className="font-medium">Error</p>
                <p className="text-xs">{errorMessage}</p>
              </div>
            ) : (
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {steps.length} step{steps.length !== 1 ? "s" : ""} to complete
                </p>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}

// ============================================================================
// Preset SUMMIT Buttons (ERP-focused)
// ============================================================================

export interface PresetSUMMITProps extends Omit<SUMMITButtonProps, "label" | "steps" | "onExecute"> {
  onExecute: (onProgress: (stepId: string) => void) => Promise<void>
}

/** Post Invoice SUMMIT Button */
export function SUMMITPostInvoice(props: PresetSUMMITProps) {
  return (
    <SUMMITButton
      label="Post Invoice"
      steps={[
        { id: "validate", label: "Validating...", description: "Checking invoice details and totals" },
        { id: "post", label: "Posting...", description: "Creating ledger entries" },
        { id: "ar", label: "Updating AR...", description: "Recording accounts receivable" },
        { id: "email", label: "Sending...", description: "Emailing invoice to customer" },
        { id: "complete", label: "Complete!", description: "Invoice posted successfully" },
      ]}
      confirmTitle="Post Invoice"
      confirmDescription="This will post the invoice to the ledger and update accounts receivable. This action cannot be undone."
      requireConfirmation
      {...props}
    />
  )
}

/** Approve All SUMMIT Button */
export function SUMMITApproveAll(props: PresetSUMMITProps) {
  return (
    <SUMMITButton
      label="Approve All"
      icon={Check}
      steps={[
        { id: "validate", label: "Validating...", description: "Checking approval requirements" },
        { id: "approve", label: "Approving...", description: "Processing approvals" },
        { id: "notify", label: "Notifying...", description: "Sending notifications" },
        { id: "complete", label: "Complete!", description: "All items approved" },
      ]}
      confirmTitle="Approve All Items"
      confirmDescription="This will approve all pending items in the queue. Are you sure?"
      requireConfirmation
      {...props}
    />
  )
}

/** Receive Stock SUMMIT Button */
export function SUMMITReceiveStock(props: PresetSUMMITProps) {
  return (
    <SUMMITButton
      label="Receive Stock"
      steps={[
        { id: "scan", label: "Scanning...", description: "Reading barcode data" },
        { id: "validate", label: "Validating...", description: "Checking against PO" },
        { id: "move", label: "Creating movement...", description: "Recording stock movement" },
        { id: "update", label: "Updating inventory...", description: "Adjusting stock levels" },
        { id: "complete", label: "Complete!", description: "Stock received" },
      ]}
      {...props}
    />
  )
}

/** Close Period SUMMIT Button */
export function SUMMITClosePeriod(props: PresetSUMMITProps) {
  return (
    <SUMMITButton
      label="Close Period"
      danger
      steps={[
        { id: "validate", label: "Validating...", description: "Checking for open items" },
        { id: "reconcile", label: "Reconciling...", description: "Verifying subledger balances" },
        { id: "close", label: "Closing...", description: "Locking the period" },
        { id: "report", label: "Generating report...", description: "Creating period close report" },
        { id: "complete", label: "Complete!", description: "Period closed" },
      ]}
      confirmTitle="Close Fiscal Period"
      confirmDescription="This will close the current fiscal period. No further postings will be allowed. This action cannot be undone."
      requireConfirmation
      {...props}
    />
  )
}
