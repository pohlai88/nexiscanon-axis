"use client"

/**
 * Danger Zone Indicator - Audit Component
 *
 * "Danger Zone, Not Dead End" — warn and record, don't block legitimate business needs.
 * Implements A01-CANONICAL.md §5 — Nexus Doctrine
 *
 * Features:
 * - Risk score visualization (0-100)
 * - Policy violations list
 * - Override justification capture
 * - Approval workflow integration
 *
 * @example
 * ```tsx
 * import { DangerZoneIndicator } from "@workspace/design-system"
 *
 * <DangerZoneIndicator
 *   riskScore={75}
 *   violations={[
 *     { id: "credit", name: "Credit Limit Exceeded", severity: "warning" },
 *     { id: "approval", name: "Missing Approval", severity: "error" },
 *   ]}
 *   onOverride={async (justification) => {
 *     await submitOverride(justification)
 *   }}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Textarea } from "@/components/textarea"
import { Label } from "@/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  ArrowRight,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ViolationSeverity = "info" | "warning" | "error" | "critical"

export interface PolicyViolation {
  id: string
  name: string
  description?: string
  severity: ViolationSeverity
  threshold?: string
  currentValue?: string
}

// OverrideReason imported from shared types to avoid conflicts
import type { OverrideReason } from "../types"

export interface DangerZoneIndicatorProps {
  /** Risk score (0-100) */
  riskScore: number
  /** List of policy violations */
  violations: PolicyViolation[]
  /** Override callback - called when user submits override */
  onOverride?: (data: { reasonId: string; justification: string }) => Promise<void>
  /** Cancel callback */
  onCancel?: () => void
  /** Proceed callback (when risk is acceptable) */
  onProceed?: () => void
  /** Available override reasons */
  overrideReasons?: OverrideReason[]
  /** Allow override even at high risk */
  allowOverride?: boolean
  /** Require approval for override */
  requireApproval?: boolean
  /** Current approver name (if awaiting approval) */
  approver?: string
  /** Display variant */
  variant?: "banner" | "card" | "inline" | "dialog"
  /** Custom className */
  className?: string
  /** Children (content to wrap) */
  children?: React.ReactNode
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OVERRIDE_REASONS: OverrideReason[] = [
  { id: "customer_request", label: "Customer Request", requiresJustification: true },
  { id: "management_approval", label: "Management Approval", requiresJustification: true },
  { id: "one_time_exception", label: "One-Time Exception", requiresJustification: true },
  { id: "data_correction", label: "Data Correction in Progress", requiresJustification: false },
  { id: "other", label: "Other", requiresJustification: true },
]

const SEVERITY_CONFIG: Record<
  ViolationSeverity,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    borderColor: string
  }
> = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    borderColor: "border-red-200 dark:border-red-800",
  },
  critical: {
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-100 dark:bg-red-950",
    borderColor: "border-red-300 dark:border-red-700",
  },
}

// ============================================================================
// Helper Components
// ============================================================================

function RiskScoreMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score < 30) return "bg-green-500"
    if (score < 50) return "bg-yellow-500"
    if (score < 75) return "bg-orange-500"
    return "bg-red-500"
  }

  const getLabel = () => {
    if (score < 30) return "Low Risk"
    if (score < 50) return "Medium Risk"
    if (score < 75) return "High Risk"
    return "Critical Risk"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Risk Score</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500", getColor())}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Safe</span>
        <span className="font-medium">{getLabel()}</span>
        <span>Critical</span>
      </div>
    </div>
  )
}

function ViolationList({ violations }: { violations: PolicyViolation[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Policy Violations</h4>
      <ul className="space-y-2">
        {violations.map((violation) => {
          const config = SEVERITY_CONFIG[violation.severity]
          const Icon = config.icon
          return (
            <li
              key={violation.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3",
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm", config.color)}>
                  {violation.name}
                </p>
                {violation.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {violation.description}
                  </p>
                )}
                {(violation.threshold || violation.currentValue) && (
                  <div className="flex gap-3 mt-1 text-xs">
                    {violation.threshold && (
                      <span className="text-muted-foreground">
                        Threshold: <strong>{violation.threshold}</strong>
                      </span>
                    )}
                    {violation.currentValue && (
                      <span className="text-muted-foreground">
                        Current: <strong className={config.color}>{violation.currentValue}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Badge
                variant={violation.severity === "critical" ? "destructive" : "secondary"}
                className="shrink-0"
              >
                {violation.severity.toUpperCase()}
              </Badge>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ============================================================================
// Override Dialog Content
// ============================================================================

function OverrideDialogContent({
  violations,
  riskScore,
  overrideReasons,
  onOverride,
  onClose,
}: {
  violations: PolicyViolation[]
  riskScore: number
  overrideReasons: OverrideReason[]
  onOverride: (data: { reasonId: string; justification: string }) => Promise<void>
  onClose: () => void
}) {
  const [reasonId, setReasonId] = React.useState("")
  const [justification, setJustification] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const selectedReason = overrideReasons.find((r) => r.id === reasonId)
  const requiresJustification = selectedReason?.requiresJustification ?? true
  const canSubmit = reasonId && (!requiresJustification || justification.trim().length > 0)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      await onOverride({ reasonId, justification })
      onClose()
    } catch (error) {
      console.error("Override failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Override Policy Violations
        </DialogTitle>
        <DialogDescription>
          You are about to override {violations.length} policy violation(s) with a risk score of {riskScore}/100.
          This action will be recorded in the audit log.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <RiskScoreMeter score={riskScore} />

        <div className="space-y-2">
          <Label htmlFor="override-reason">Reason for Override *</Label>
          <Select value={reasonId} onValueChange={(v) => v && setReasonId(v)}>
            <SelectTrigger id="override-reason">
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              {overrideReasons.map((reason) => (
                <SelectItem key={reason.id} value={reason.id}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {requiresJustification && (
          <div className="space-y-2">
            <Label htmlFor="justification">Justification *</Label>
            <Textarea
              id="justification"
              placeholder="Please provide a detailed justification for this override..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This justification will be recorded and may be reviewed during audits.
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Override & Proceed
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function DangerZoneIndicator({
  riskScore,
  violations,
  onOverride,
  onCancel,
  onProceed,
  overrideReasons = DEFAULT_OVERRIDE_REASONS,
  allowOverride = true,
  requireApproval = false,
  approver,
  variant = "card",
  className,
  children,
}: DangerZoneIndicatorProps) {
  const [showOverrideDialog, setShowOverrideDialog] = React.useState(false)

  const hasCritical = violations.some((v) => v.severity === "critical")
  const canOverride = allowOverride && !hasCritical && onOverride

  const handleOverride = async (data: { reasonId: string; justification: string }) => {
    if (onOverride) {
      await onOverride(data)
    }
  }

  // Banner variant
  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3",
          className
        )}
      >
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-destructive">
            Danger Zone: {violations.length} violation(s) detected
          </p>
          <p className="text-sm text-muted-foreground">
            Risk score: {riskScore}/100
          </p>
        </div>
        {canOverride && (
          <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
            <DialogTrigger>
              <Button variant="outline" size="sm">
                Override
              </Button>
            </DialogTrigger>
            <DialogContent>
              <OverrideDialogContent
                violations={violations}
                riskScore={riskScore}
                overrideReasons={overrideReasons}
                onOverride={handleOverride}
                onClose={() => setShowOverrideDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    )
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Risk: {riskScore}
        </Badge>
        {violations.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {violations.length} violation(s)
          </span>
        )}
      </div>
    )
  }

  // Dialog variant (wraps children)
  if (variant === "dialog" && children) {
    return (
      <Dialog>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone Detected
            </DialogTitle>
            <DialogDescription>
              This action has triggered policy warnings. Please review before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RiskScoreMeter score={riskScore} />
            <ViolationList violations={violations} />
          </div>

          <DialogFooter className="gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {canOverride && (
              <Button
                variant="outline"
                onClick={() => setShowOverrideDialog(true)}
              >
                Request Override
              </Button>
            )}
            {riskScore < 50 && onProceed && (
              <Button onClick={onProceed}>
                Acknowledge & Proceed
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Default: Card variant
  return (
    <Card className={cn("border-destructive/50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          This action has triggered policy warnings. Review before proceeding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RiskScoreMeter score={riskScore} />
        <ViolationList violations={violations} />

        {requireApproval && approver && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
            <Shield className="h-4 w-4 text-amber-500" />
            <span>Awaiting approval from: <strong>{approver}</strong></span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {canOverride && (
            <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
              <DialogTrigger>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Request Override
                </Button>
              </DialogTrigger>
              <DialogContent>
                <OverrideDialogContent
                  violations={violations}
                  riskScore={riskScore}
                  overrideReasons={overrideReasons}
                  onOverride={handleOverride}
                  onClose={() => setShowOverrideDialog(false)}
                />
              </DialogContent>
            </Dialog>
          )}
          {riskScore < 50 && onProceed && (
            <Button variant="default" onClick={onProceed}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Acknowledge & Proceed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ViolationSeverity, PolicyViolation }
// OverrideReason is re-exported from blocks/types.ts
