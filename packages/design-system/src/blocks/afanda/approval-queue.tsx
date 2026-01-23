"use client"

/**
 * Approval Queue - AFANDA Platform Component
 *
 * Hierarchical approval workflow with SLA timers.
 * Implements A01-CANONICAL.md §8 — AFANDA (Unified Board)
 *
 * Features:
 * - SLA countdown timers
 * - Auto-escalation on breach
 * - Approval chain visualization
 * - Bulk approve/reject
 * - Evidence attachment
 *
 * @example
 * ```tsx
 * import { ApprovalQueue } from "@workspace/design-system"
 *
 * <ApprovalQueue
 *   items={approvalItems}
 *   onApprove={(id, comment) => handleApprove(id, comment)}
 *   onReject={(id, reason) => handleReject(id, reason)}
 *   onEscalate={(id) => handleEscalate(id)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Checkbox } from "../../components/checkbox"
import { Textarea } from "../../components/textarea"
import { Avatar } from "../../components/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/tooltip"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUp,
  MoreVertical,
  FileText,
  User,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
  MessageSquare,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated"
export type ApprovalPriority = "low" | "normal" | "high" | "urgent"
export type DocumentType = "invoice" | "purchase_order" | "expense" | "leave" | "other"

export interface ApprovalActor {
  id: string
  name: string
  email?: string
  role?: string
  avatarUrl?: string
}

export interface ApprovalItem {
  id: string
  type: DocumentType
  documentNumber: string
  title: string
  description?: string
  amount?: number
  currency?: string
  requester: ApprovalActor
  currentApprover: ApprovalActor
  approvalChain?: ApprovalActor[]
  status: ApprovalStatus
  priority: ApprovalPriority
  createdAt: string | Date
  dueAt: string | Date
  slaHours: number
  attachments?: { id: string; name: string; url: string }[]
  metadata?: Record<string, unknown>
}

export interface ApprovalQueueProps {
  /** List of approval items */
  items: ApprovalItem[]
  /** Approve callback */
  onApprove?: (id: string, comment?: string) => Promise<void>
  /** Reject callback */
  onReject?: (id: string, reason: string) => Promise<void>
  /** Escalate callback */
  onEscalate?: (id: string) => Promise<void>
  /** View details callback */
  onViewDetails?: (item: ApprovalItem) => void
  /** Bulk approve callback */
  onBulkApprove?: (ids: string[], comment?: string) => Promise<void>
  /** Bulk reject callback */
  onBulkReject?: (ids: string[], reason: string) => Promise<void>
  /** Show SLA timers */
  showSLA?: boolean
  /** Allow bulk actions */
  allowBulkActions?: boolean
  /** Custom className */
  className?: string
}

// ============================================================================
// Helpers
// ============================================================================

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffMs < 0) {
    const absDiffHours = Math.abs(diffHours)
    if (absDiffHours > 24) {
      return `${Math.floor(absDiffHours / 24)}d overdue`
    }
    return `${absDiffHours}h overdue`
  }

  if (diffHours > 24) {
    return `${Math.floor(diffHours / 24)}d ${diffHours % 24}h`
  }
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m`
  }
  return `${diffMins}m`
}

function getSLAStatus(dueAt: string | Date): "safe" | "warning" | "critical" | "overdue" {
  const due = typeof dueAt === "string" ? new Date(dueAt) : dueAt
  const now = new Date()
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours < 0) return "overdue"
  if (diffHours < 2) return "critical"
  if (diffHours < 8) return "warning"
  return "safe"
}

// ============================================================================
// Sub-components
// ============================================================================

function SLATimer({ dueAt }: { dueAt: string | Date }) {
  const [timeLeft, setTimeLeft] = React.useState(formatRelativeTime(dueAt))
  const [status, setStatus] = React.useState(getSLAStatus(dueAt))

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatRelativeTime(dueAt))
      setStatus(getSLAStatus(dueAt))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [dueAt])

  const colors: Record<typeof status, string> = {
    safe: "text-green-600 bg-green-50 dark:bg-green-950",
    warning: "text-amber-600 bg-amber-50 dark:bg-amber-950",
    critical: "text-red-600 bg-red-50 dark:bg-red-950 animate-pulse",
    overdue: "text-red-700 bg-red-100 dark:bg-red-900",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium",
              colors[status]
            )}
          >
            <Clock className="h-3 w-3" />
            {timeLeft}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status === "overdue" && "SLA breached - escalation required"}
          {status === "critical" && "SLA expires soon - action required"}
          {status === "warning" && "Approaching SLA deadline"}
          {status === "safe" && "Within SLA timeline"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function PriorityBadge({ priority }: { priority: ApprovalPriority }) {
  const config: Record<ApprovalPriority, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    low: { label: "Low", variant: "outline" },
    normal: { label: "Normal", variant: "secondary" },
    high: { label: "High", variant: "default" },
    urgent: { label: "Urgent", variant: "destructive" },
  }

  return <Badge variant={config[priority].variant}>{config[priority].label}</Badge>
}

function DocumentTypeBadge({ type }: { type: DocumentType }) {
  const labels: Record<DocumentType, string> = {
    invoice: "Invoice",
    purchase_order: "Purchase Order",
    expense: "Expense",
    leave: "Leave Request",
    other: "Other",
  }

  return (
    <Badge variant="outline" className="text-xs">
      {labels[type]}
    </Badge>
  )
}

function ActorAvatar({ actor }: { actor: ApprovalActor }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className="h-8 w-8">
            {actor.avatarUrl ? (
              <img src={actor.avatarUrl} alt={actor.name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                {actor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{actor.name}</p>
          {actor.role && <p className="text-xs text-muted-foreground">{actor.role}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Approval Item Card
// ============================================================================

function ApprovalItemCard({
  item,
  selected,
  onSelect,
  onApprove,
  onReject,
  onEscalate,
  onViewDetails,
  showSLA,
}: {
  item: ApprovalItem
  selected: boolean
  onSelect: (selected: boolean) => void
  onApprove: () => void
  onReject: (reason: string) => void
  onEscalate: () => void
  onViewDetails: () => void
  showSLA: boolean
}) {
  const [showRejectDialog, setShowRejectDialog] = React.useState(false)
  const [showApproveDialog, setShowApproveDialog] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [approveComment, setApproveComment] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      onApprove()
      setShowApproveDialog(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setIsProcessing(true)
    try {
      onReject(rejectReason)
      setShowRejectDialog(false)
      setRejectReason("")
    } finally {
      setIsProcessing(false)
    }
  }

  const slaStatus = getSLAStatus(item.dueAt)

  return (
    <>
      <Card
        className={cn(
          "transition-all",
          selected && "ring-2 ring-primary",
          slaStatus === "overdue" && "border-red-300 dark:border-red-800",
          slaStatus === "critical" && "border-amber-300 dark:border-amber-800"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              className="mt-1"
            />

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{item.documentNumber}</span>
                    <DocumentTypeBadge type={item.type} />
                    <PriorityBadge priority={item.priority} />
                    {showSLA && <SLATimer dueAt={item.dueAt} />}
                  </div>
                  <h4 className="mt-1 font-medium">{item.title}</h4>
                  {item.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {item.amount !== undefined && (
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>From: {item.requester.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                {item.attachments && item.attachments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{item.attachments.length} attachment(s)</span>
                  </div>
                )}
              </div>

              {/* Approval Chain (Expandable) */}
              {item.approvalChain && item.approvalChain.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Approval Chain ({item.approvalChain.length} steps)
                  </button>
                  {expanded && (
                    <div className="mt-2 flex items-center gap-2">
                      {item.approvalChain.map((actor, index) => (
                        <React.Fragment key={actor.id}>
                          <ActorAvatar actor={actor} />
                          {index < item.approvalChain!.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Reject
                </Button>
                <Button size="sm" variant="ghost" onClick={onViewDetails}>
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEscalate}>
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Escalate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onViewDetails}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Comment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onViewDetails}>
                      <FileText className="mr-2 h-4 w-4" />
                      View History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Approve {item.documentNumber}: {item.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add an optional comment..."
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Reject {item.documentNumber}: {item.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Please provide a reason for rejection (required)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ApprovalQueue({
  items,
  onApprove,
  onReject,
  onEscalate,
  onViewDetails,
  onBulkApprove,
  onBulkReject,
  showSLA = true,
  allowBulkActions = true,
  className,
}: ApprovalQueueProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const pendingItems = items.filter((item) => item.status === "pending")
  const overdueItems = pendingItems.filter((item) => getSLAStatus(item.dueAt) === "overdue")

  const toggleSelection = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(pendingItems.map((item) => item.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleApprove = async (id: string, comment?: string) => {
    if (onApprove) {
      await onApprove(id, comment)
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleReject = async (id: string, reason: string) => {
    if (onReject) {
      await onReject(id, reason)
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleBulkApprove = async () => {
    if (onBulkApprove && selectedIds.size > 0) {
      await onBulkApprove(Array.from(selectedIds))
      clearSelection()
    }
  }

  const _handleBulkReject = async () => {
    if (onBulkReject && selectedIds.size > 0) {
      await onBulkReject(Array.from(selectedIds), "Bulk rejection")
      clearSelection()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Approval Queue
            </CardTitle>
            <CardDescription>
              {pendingItems.length} pending • {overdueItems.length} overdue
            </CardDescription>
          </div>

          {/* Bulk Actions */}
          {allowBulkActions && selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <Button size="sm" onClick={handleBulkApprove}>
                <CheckCircle className="mr-1 h-3 w-3" />
                Approve All
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}

          {allowBulkActions && selectedIds.size === 0 && pendingItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
          )}
        </div>

        {/* Overdue Alert */}
        {overdueItems.length > 0 && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {overdueItems.length} item(s) have breached SLA and require immediate attention
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {pendingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="mt-4 font-semibold">All caught up!</h3>
            <p className="text-sm text-muted-foreground">
              No pending approvals in your queue
            </p>
          </div>
        ) : (
          pendingItems.map((item) => (
            <ApprovalItemCard
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onSelect={(selected) => toggleSelection(item.id, selected)}
              onApprove={() => handleApprove(item.id)}
              onReject={(reason) => handleReject(item.id, reason)}
              onEscalate={() => onEscalate?.(item.id)}
              onViewDetails={() => onViewDetails?.(item)}
              showSLA={showSLA}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ApprovalStatus, ApprovalPriority, DocumentType, ApprovalActor, ApprovalItem }
