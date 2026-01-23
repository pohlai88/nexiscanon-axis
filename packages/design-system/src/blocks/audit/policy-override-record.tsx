"use client"

/**
 * Policy Override Record - Audit Component
 *
 * Document why policies were overridden with immutable records.
 * Implements A01-CANONICAL.md §5 — Nexus Doctrine (6W1H)
 *
 * Features:
 * - Override reason dropdown
 * - Free-text justification
 * - Evidence attachment
 * - Approver signature
 * - Immutable record display
 *
 * @example
 * ```tsx
 * import { PolicyOverrideRecord, PolicyOverrideForm } from "@workspace/design-system"
 *
 * // Display existing record
 * <PolicyOverrideRecord record={overrideRecord} />
 *
 * // Create new override
 * <PolicyOverrideForm
 *   policy={violatedPolicy}
 *   onSubmit={(data) => saveOverride(data)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Label } from "@/components/label"
import { Textarea } from "@/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"
import {
  AlertTriangle,
  FileText,
  Shield,
  User,
  Calendar,
  Lock,
  Paperclip,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  Clock,
} from "lucide-react"

// ============================================================================
// Types (OverrideReason imported from shared types to avoid conflicts)
// ============================================================================

import type { OverrideReason } from "../types"

export type OverrideStatus = "pending" | "approved" | "rejected" | "expired"

export interface PolicyOverrideData {
  id: string
  policy: {
    id: string
    name: string
    description?: string
    severity: "low" | "medium" | "high" | "critical"
  }
  reason: OverrideReason
  justification: string
  evidence?: {
    id: string
    name: string
    type: string
    url?: string
  }[]
  requestedBy: {
    id: string
    name: string
    role: string
  }
  requestedAt: string | Date
  approvedBy?: {
    id: string
    name: string
    role: string
  }
  approvedAt?: string | Date
  status: OverrideStatus
  expiresAt?: string | Date
  transactionRef?: string
  // 6W1H Context
  sixW1H?: {
    who: string
    what: string
    when: string
    where: string
    why: string
    which: string
    how: string
  }
}

export interface PolicyOverrideRecordProps {
  /** Override record data */
  record: PolicyOverrideData
  /** Show full 6W1H context */
  showContext?: boolean
  /** View evidence callback */
  onViewEvidence?: (evidence: PolicyOverrideData["evidence"]) => void
  /** Custom className */
  className?: string
}

export interface PolicyOverrideFormProps {
  /** Policy being overridden */
  policy: PolicyOverrideData["policy"]
  /** Available override reasons */
  reasons?: OverrideReason[]
  /** Submit callback */
  onSubmit?: (data: Omit<PolicyOverrideData, "id" | "status" | "requestedAt">) => Promise<void>
  /** Cancel callback */
  onCancel?: () => void
  /** Current user */
  currentUser: PolicyOverrideData["requestedBy"]
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_REASONS: OverrideReason[] = [
  {
    id: "business-critical",
    label: "Business Critical",
    description: "Override required to complete time-sensitive business operation",
    requiresEvidence: true,
  },
  {
    id: "customer-exception",
    label: "Customer Exception",
    description: "Pre-approved exception for specific customer",
    requiresEvidence: true,
  },
  {
    id: "one-time",
    label: "One-Time Exception",
    description: "Single occurrence that won't repeat",
    requiresEvidence: false,
  },
  {
    id: "policy-update",
    label: "Policy Being Updated",
    description: "Policy is outdated and pending revision",
    requiresEvidence: true,
  },
  {
    id: "executive-approval",
    label: "Executive Approval",
    description: "Approved by authorized executive",
    requiresEvidence: true,
  },
  {
    id: "other",
    label: "Other",
    description: "Other reason - must provide detailed justification",
    requiresEvidence: true,
  },
]

const SEVERITY_CONFIG = {
  low: { color: "bg-blue-100 text-blue-700", label: "Low" },
  medium: { color: "bg-amber-100 text-amber-700", label: "Medium" },
  high: { color: "bg-orange-100 text-orange-700", label: "High" },
  critical: { color: "bg-red-100 text-red-700", label: "Critical" },
}

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending Approval" },
  approved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
  expired: { icon: Clock, color: "bg-gray-100 text-gray-700", label: "Expired" },
}

// ============================================================================
// Record Display Component
// ============================================================================

export function PolicyOverrideRecord({
  record,
  showContext = false,
  onViewEvidence,
  className,
}: PolicyOverrideRecordProps) {
  const severityConfig = SEVERITY_CONFIG[record.policy.severity]
  const statusConfig = STATUS_CONFIG[record.status]
  const StatusIcon = statusConfig.icon

  return (
    <Card className={cn("border-l-4", record.status === "approved" ? "border-l-green-500" : record.status === "rejected" ? "border-l-red-500" : "border-l-amber-500", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Policy Override Record
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{record.id}</Badge>
              {record.transactionRef && (
                <span className="text-xs">Ref: {record.transactionRef}</span>
              )}
            </CardDescription>
          </div>
          <Badge className={cn("gap-1", statusConfig.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Policy Info */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {record.policy.name}
            </h4>
            <Badge className={severityConfig.color}>
              {severityConfig.label} Severity
            </Badge>
          </div>
          {record.policy.description && (
            <p className="text-sm text-muted-foreground">{record.policy.description}</p>
          )}
        </div>

        {/* Override Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Override Reason</p>
            <p className="font-medium">{record.reason.label}</p>
            {record.reason.description && (
              <p className="text-xs text-muted-foreground">{record.reason.description}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Requested By</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{record.requestedBy.name}</span>
              <span className="text-xs text-muted-foreground">({record.requestedBy.role})</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              {new Date(record.requestedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Justification */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Justification</p>
          <div className="rounded-lg bg-muted p-3 text-sm">
            {record.justification}
          </div>
        </div>

        {/* Evidence */}
        {record.evidence && record.evidence.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Evidence Attached</p>
            <div className="flex flex-wrap gap-2">
              {record.evidence.map((ev) => (
                <Button
                  key={ev.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onViewEvidence?.(record.evidence)}
                  className="h-8"
                >
                  <Paperclip className="mr-1 h-3 w-3" />
                  {ev.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Approval Info */}
        {record.approvedBy && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 p-3">
            <p className="text-xs text-green-700 dark:text-green-300 mb-1">Approved By</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">{record.approvedBy.name}</span>
                <span className="text-xs text-green-600">({record.approvedBy.role})</span>
              </div>
              {record.approvedAt && (
                <span className="text-xs text-green-600">
                  {new Date(record.approvedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Expiration */}
        {record.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Override expires: {new Date(record.expiresAt).toLocaleString()}</span>
          </div>
        )}

        {/* 6W1H Context */}
        {showContext && record.sixW1H && (
          <div className="rounded-lg border p-3 space-y-2">
            <h4 className="font-medium text-sm">6W1H Context (Immutable)</h4>
            <div className="grid gap-2 text-sm">
              {Object.entries(record.sixW1H).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium w-16 capitalize">{key}:</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Immutability Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
          <Lock className="h-3 w-3" />
          <span>This record is immutable and cannot be modified after creation.</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Form Component
// ============================================================================

export function PolicyOverrideForm({
  policy,
  reasons = DEFAULT_REASONS,
  onSubmit,
  onCancel,
  currentUser,
  className,
}: PolicyOverrideFormProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>("")
  const [justification, setJustification] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const selectedReasonData = reasons.find((r) => r.id === selectedReason)
  const requiresEvidence = selectedReasonData?.requiresEvidence ?? false
  const isValid = selectedReason && justification.length >= 20 && (!requiresEvidence || files.length > 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSubmit || !isValid) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        policy,
        reason: selectedReasonData!,
        justification,
        evidence: files.map((f, i) => ({
          id: `ev-${i}`,
          name: f.name,
          type: f.type,
        })),
        requestedBy: currentUser,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const severityConfig = SEVERITY_CONFIG[policy.severity]

  return (
    <Card className={cn("border-l-4 border-l-amber-500", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Request Policy Override
        </CardTitle>
        <CardDescription>
          Document your justification for overriding this policy. This record is immutable.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Policy Info */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 p-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Shield className="h-4 w-4" />
                {policy.name}
              </h4>
              <Badge className={severityConfig.color}>
                {severityConfig.label} Severity
              </Badge>
            </div>
            {policy.description && (
              <p className="text-sm text-amber-700 dark:text-amber-300">{policy.description}</p>
            )}
          </div>

          {/* Override Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Override Reason *</Label>
            <Select value={selectedReason} onValueChange={(v) => v && setSelectedReason(v)}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    <div>
                      <span>{reason.label}</span>
                      {reason.requiresEvidence && (
                        <span className="text-xs text-muted-foreground ml-2">(evidence required)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReasonData?.description && (
              <p className="text-xs text-muted-foreground">{selectedReasonData.description}</p>
            )}
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification">Justification * (min 20 characters)</Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Provide a detailed justification for this override..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {justification.length}/20 minimum
            </p>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label>
              Evidence {requiresEvidence ? "*" : "(optional)"}
            </Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Evidence
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Attach emails, approvals, or supporting documents
              </p>
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    <Paperclip className="h-3 w-3" />
                    {file.name}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Requestor Info */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-xs text-muted-foreground mb-1">Requesting As</p>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{currentUser.name}</span>
              <span className="text-muted-foreground">({currentUser.role})</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-amber-800 dark:text-amber-200">
              <p className="font-medium">This action will be logged</p>
              <p className="text-xs">
                A permanent, immutable record will be created. This cannot be undone or modified.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Submit Override Request
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_REASONS }
export type { OverrideStatus, PolicyOverrideData }
// OverrideReason is re-exported from blocks/types.ts
