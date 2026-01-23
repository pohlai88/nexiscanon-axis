"use client"

/**
 * Read Receipt System - AFANDA Platform Component
 *
 * "No excuse" accountability tracking for document views.
 * Implements A01-CANONICAL.md §8 — AFANDA (Accountability)
 *
 * Features:
 * - Track who has viewed a document
 * - First view timestamp
 * - Time spent viewing
 * - Acknowledgment requirement
 * - Reminder sending
 *
 * @example
 * ```tsx
 * import { ReadReceiptSystem } from "@workspace/design-system"
 *
 * <ReadReceiptSystem
 *   document={documentData}
 *   recipients={recipientList}
 *   onSendReminder={(recipientId) => sendReminder(recipientId)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Progress } from "@/components/progress"
import { Avatar } from "@/components/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table"
import {
  Eye,
  EyeOff,
  CheckCircle,
  Send,
  AlertCircle,
  FileText,
  Loader2,
  Bell,
  RefreshCw,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ViewStatus = "not_viewed" | "viewed" | "acknowledged"

export interface Recipient {
  id: string
  name: string
  email: string
  role?: string
  avatarUrl?: string
  status: ViewStatus
  firstViewedAt?: string | Date
  lastViewedAt?: string | Date
  viewCount?: number
  totalViewTime?: number // in seconds
  acknowledgedAt?: string | Date
  reminderSentAt?: string | Date
}

export interface DocumentInfo {
  id: string
  title: string
  type?: string
  sharedAt: string | Date
  sharedBy: {
    id: string
    name: string
  }
  requiresAcknowledgment: boolean
  deadline?: string | Date
}

export interface ReadReceiptSystemProps {
  /** Document information */
  document: DocumentInfo
  /** Recipients list */
  recipients: Recipient[]
  /** Send reminder callback */
  onSendReminder?: (recipientId: string) => Promise<void>
  /** Send all reminders callback */
  onSendAllReminders?: () => Promise<void>
  /** Refresh callback */
  onRefresh?: () => Promise<void>
  /** Custom className */
  className?: string
}

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}

function formatTimeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

// ============================================================================
// Status Badge
// ============================================================================

function StatusBadge({ status, acknowledgedAt }: { status: ViewStatus; acknowledgedAt?: string | Date }) {
  const config = {
    not_viewed: { icon: EyeOff, color: "bg-gray-100 text-gray-700", label: "Not Viewed" },
    viewed: { icon: Eye, color: "bg-blue-100 text-blue-700", label: "Viewed" },
    acknowledged: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Acknowledged" },
  }

  const c = config[status]
  const Icon = c.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={cn("gap-1", c.color)}>
            <Icon className="h-3 w-3" />
            {c.label}
          </Badge>
        </TooltipTrigger>
        {acknowledgedAt && (
          <TooltipContent>
            <p>Acknowledged: {new Date(acknowledgedAt).toLocaleString()}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Summary Stats
// ============================================================================

function SummaryStats({
  recipients,
  requiresAcknowledgment,
}: {
  recipients: Recipient[]
  requiresAcknowledgment: boolean
}) {
  const total = recipients.length
  const viewed = recipients.filter((r) => r.status !== "not_viewed").length
  const acknowledged = recipients.filter((r) => r.status === "acknowledged").length
  const notViewed = recipients.filter((r) => r.status === "not_viewed").length

  const viewedPercent = total > 0 ? (viewed / total) * 100 : 0
  const ackPercent = total > 0 ? (acknowledged / total) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-lg border p-3 text-center">
        <p className="text-2xl font-bold">{total}</p>
        <p className="text-xs text-muted-foreground">Total Recipients</p>
      </div>
      <div className="rounded-lg border p-3 text-center">
        <p className="text-2xl font-bold text-blue-600">{viewed}</p>
        <p className="text-xs text-muted-foreground">Viewed ({viewedPercent.toFixed(0)}%)</p>
      </div>
      {requiresAcknowledgment && (
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{acknowledged}</p>
          <p className="text-xs text-muted-foreground">Acknowledged ({ackPercent.toFixed(0)}%)</p>
        </div>
      )}
      <div className="rounded-lg border p-3 text-center">
        <p className="text-2xl font-bold text-amber-600">{notViewed}</p>
        <p className="text-xs text-muted-foreground">Pending</p>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ReadReceiptSystem({
  document,
  recipients,
  onSendReminder,
  onSendAllReminders,
  onRefresh,
  className,
}: ReadReceiptSystemProps) {
  const [sendingTo, setSendingTo] = React.useState<string | null>(null)
  const [sendingAll, setSendingAll] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const notViewed = recipients.filter((r) => r.status === "not_viewed")
  const isOverdue = document.deadline && new Date(document.deadline) < new Date()

  const handleSendReminder = async (recipientId: string) => {
    if (!onSendReminder) return
    setSendingTo(recipientId)
    try {
      await onSendReminder(recipientId)
    } finally {
      setSendingTo(null)
    }
  }

  const handleSendAll = async () => {
    if (!onSendAllReminders) return
    setSendingAll(true)
    try {
      await onSendAllReminders()
    } finally {
      setSendingAll(false)
    }
  }

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Progress bar
  const viewedCount = recipients.filter((r) => r.status !== "not_viewed").length
  const progress = recipients.length > 0 ? (viewedCount / recipients.length) * 100 : 100

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Read Receipts
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <FileText className="h-4 w-4" />
              {document.title}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            )}
            {onSendAllReminders && notViewed.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendAll}
                disabled={sendingAll}
              >
                {sendingAll ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="mr-2 h-4 w-4" />
                )}
                Remind All ({notViewed.length})
              </Button>
            )}
          </div>
        </div>

        {/* Document Info */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>Shared by {document.sharedBy.name}</span>
          <span>•</span>
          <span>{formatTimeAgo(document.sharedAt)}</span>
          {document.deadline && (
            <>
              <span>•</span>
              <span className={cn(isOverdue && "text-red-600 font-medium")}>
                {isOverdue ? "Overdue" : `Due: ${new Date(document.deadline).toLocaleDateString()}`}
              </span>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">View Progress</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <SummaryStats
          recipients={recipients}
          requiresAcknowledgment={document.requiresAcknowledgment}
        />

        {/* Overdue Warning */}
        {isOverdue && notViewed.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 p-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                Deadline Passed - {notViewed.length} recipient(s) haven't viewed
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Consider sending reminders or escalating.
              </p>
            </div>
          </div>
        )}

        {/* Recipients Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>First Viewed</TableHead>
                <TableHead>View Time</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipients.map((recipient) => (
                <TableRow
                  key={recipient.id}
                  className={cn(
                    recipient.status === "not_viewed" && "bg-amber-50/50 dark:bg-amber-950/20"
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {recipient.avatarUrl ? (
                          <img src={recipient.avatarUrl} alt={recipient.name} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium">
                            {recipient.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{recipient.name}</p>
                        <p className="text-xs text-muted-foreground">{recipient.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={recipient.status}
                      acknowledgedAt={recipient.acknowledgedAt}
                    />
                  </TableCell>
                  <TableCell>
                    {recipient.firstViewedAt ? (
                      <div>
                        <p className="text-sm">{formatTimeAgo(recipient.firstViewedAt)}</p>
                        {recipient.viewCount && recipient.viewCount > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {recipient.viewCount} views
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {recipient.totalViewTime ? (
                      <span className="text-sm">{formatDuration(recipient.totalViewTime)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {recipient.status === "not_viewed" && onSendReminder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendReminder(recipient.id)}
                        disabled={sendingTo === recipient.id}
                      >
                        {sendingTo === recipient.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {recipient.reminderSentAt && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs">
                              Reminded
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Reminder sent: {new Date(recipient.reminderSentAt).toLocaleString()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* No Excuse Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
          <Eye className="h-3 w-3" />
          <span>"No excuse" policy: All views are tracked and timestamped for accountability.</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ViewStatus, Recipient, DocumentInfo }
