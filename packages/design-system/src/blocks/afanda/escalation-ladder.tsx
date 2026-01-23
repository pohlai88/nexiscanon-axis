"use client"

/**
 * Escalation Ladder - AFANDA Platform Component
 *
 * Automatic escalation visualization and management.
 * Implements A01-CANONICAL.md §8 — AFANDA (Accountability)
 *
 * Features:
 * - Visual escalation path
 * - SLA countdown at each level
 * - Current escalation status
 * - Manual escalation option
 * - Escalation history
 *
 * @example
 * ```tsx
 * import { EscalationLadder } from "@workspace/design-system"
 *
 * <EscalationLadder
 *   item={pendingItem}
 *   levels={escalationLevels}
 *   onManualEscalate={(level) => escalateToLevel(level)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Avatar } from "../../components/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/tooltip"
import {
  ArrowUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  ChevronUp,
  Loader2,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type EscalationStatus = "pending" | "active" | "completed" | "skipped"

export interface EscalationContact {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  avatarUrl?: string
}

export interface EscalationLevel {
  level: number
  name: string
  description?: string
  contact: EscalationContact
  slaHours: number
  status: EscalationStatus
  activatedAt?: string | Date
  completedAt?: string | Date
  notifiedAt?: string | Date
}

export interface EscalationItem {
  id: string
  title: string
  description?: string
  priority: "low" | "normal" | "high" | "urgent"
  createdAt: string | Date
  currentLevel: number
}

export interface EscalationLadderProps {
  /** Item being escalated */
  item: EscalationItem
  /** Escalation levels */
  levels: EscalationLevel[]
  /** Manual escalate callback */
  onManualEscalate?: (levelNumber: number) => Promise<void>
  /** Resolve callback */
  onResolve?: () => Promise<void>
  /** Contact callback */
  onContactPerson?: (contact: EscalationContact, method: "email" | "phone") => void
  /** Custom className */
  className?: string
}

// ============================================================================
// Helpers
// ============================================================================

function formatTimeRemaining(activatedAt: string | Date, slaHours: number): string {
  const activated = typeof activatedAt === "string" ? new Date(activatedAt) : activatedAt
  const deadline = new Date(activated.getTime() + slaHours * 60 * 60 * 1000)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()

  if (diffMs < 0) {
    const overdueMins = Math.abs(Math.floor(diffMs / (1000 * 60)))
    if (overdueMins > 60) {
      return `${Math.floor(overdueMins / 60)}h overdue`
    }
    return `${overdueMins}m overdue`
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${mins}m remaining`
  }
  return `${mins}m remaining`
}

function isOverdue(activatedAt: string | Date, slaHours: number): boolean {
  const activated = typeof activatedAt === "string" ? new Date(activatedAt) : activatedAt
  const deadline = new Date(activated.getTime() + slaHours * 60 * 60 * 1000)
  return new Date() > deadline
}

// ============================================================================
// Contact Card
// ============================================================================

function ContactCard({
  contact,
  onContact,
}: {
  contact: EscalationContact
  onContact?: (method: "email" | "phone") => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {contact.avatarUrl ? (
          <img src={contact.avatarUrl} alt={contact.name} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium">
            {contact.name.charAt(0).toUpperCase()}
          </div>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{contact.name}</p>
        <p className="text-xs text-muted-foreground">{contact.role}</p>
      </div>
      <div className="flex items-center gap-1">
        {contact.email && onContact && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onContact("email")}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Email {contact.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {contact.phone && onContact && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onContact("phone")}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Call {contact.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Level Card
// ============================================================================

function LevelCard({
  level,
  isCurrentLevel,
  isFutureLevel,
  onManualEscalate,
  onContactPerson,
  isEscalating,
}: {
  level: EscalationLevel
  isCurrentLevel: boolean
  isFutureLevel: boolean
  onManualEscalate?: () => Promise<void>
  onContactPerson?: (contact: EscalationContact, method: "email" | "phone") => void
  isEscalating: boolean
}) {
  const overdue = level.activatedAt ? isOverdue(level.activatedAt, level.slaHours) : false

  const getStatusConfig = () => {
    switch (level.status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100 dark:bg-green-900",
          border: "border-green-300",
          label: "Completed",
        }
      case "active":
        return overdue
          ? {
              icon: AlertTriangle,
              color: "text-red-600",
              bg: "bg-red-100 dark:bg-red-900",
              border: "border-red-300",
              label: "Overdue",
            }
          : {
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-100 dark:bg-amber-900",
              border: "border-amber-300",
              label: "Active",
            }
      case "skipped":
        return {
          icon: ChevronUp,
          color: "text-gray-600",
          bg: "bg-gray-100 dark:bg-gray-800",
          border: "border-gray-300",
          label: "Skipped",
        }
      default:
        return {
          icon: Clock,
          color: "text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-900",
          border: "border-gray-200",
          label: "Pending",
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4",
        config.border,
        isCurrentLevel && "ring-2 ring-primary",
        isFutureLevel && "opacity-50"
      )}
    >
      {/* Level indicator */}
      <div className="absolute -left-3 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-muted font-bold text-sm">
        {level.level}
      </div>

      <div className="ml-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{level.name}</h4>
            {level.description && (
              <p className="text-xs text-muted-foreground">{level.description}</p>
            )}
          </div>
          <Badge className={cn("gap-1", config.bg, config.color, "border-0")}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Contact */}
        <ContactCard
          contact={level.contact}
          onContact={
            onContactPerson
              ? (method) => onContactPerson(level.contact, method)
              : undefined
          }
        />

        {/* SLA Timer */}
        {level.status === "active" && level.activatedAt && (
          <div
            className={cn(
              "flex items-center gap-2 rounded px-2 py-1 text-sm",
              overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>{formatTimeRemaining(level.activatedAt, level.slaHours)}</span>
            <span className="text-xs opacity-75">({level.slaHours}h SLA)</span>
          </div>
        )}

        {/* Notified badge */}
        {level.notifiedAt && (
          <div className="text-xs text-muted-foreground">
            Notified: {new Date(level.notifiedAt).toLocaleString()}
          </div>
        )}

        {/* Escalate button for future levels */}
        {isFutureLevel && onManualEscalate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onManualEscalate}
            disabled={isEscalating}
            className="w-full"
          >
            {isEscalating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="mr-2 h-4 w-4" />
            )}
            Escalate Now
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function EscalationLadder({
  item,
  levels,
  onManualEscalate,
  onResolve,
  onContactPerson,
  className,
}: EscalationLadderProps) {
  const [escalatingTo, setEscalatingTo] = React.useState<number | null>(null)
  const [isResolving, setIsResolving] = React.useState(false)

  const sortedLevels = [...levels].sort((a, b) => a.level - b.level)

  const handleEscalate = async (levelNumber: number) => {
    if (!onManualEscalate) return
    setEscalatingTo(levelNumber)
    try {
      await onManualEscalate(levelNumber)
    } finally {
      setEscalatingTo(null)
    }
  }

  const handleResolve = async () => {
    if (!onResolve) return
    setIsResolving(true)
    try {
      await onResolve()
    } finally {
      setIsResolving(false)
    }
  }

  const priorityConfig = {
    low: { color: "bg-gray-100 text-gray-700", label: "Low" },
    normal: { color: "bg-blue-100 text-blue-700", label: "Normal" },
    high: { color: "bg-amber-100 text-amber-700", label: "High" },
    urgent: { color: "bg-red-100 text-red-700", label: "Urgent" },
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5" />
              Escalation Path
            </CardTitle>
            <CardDescription>{item.title}</CardDescription>
          </div>
          <Badge className={cn(priorityConfig[item.priority].color)}>
            {priorityConfig[item.priority].label} Priority
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Escalation Levels */}
        <div className="relative ml-3 space-y-4">
          {/* Connecting line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted" />

          {sortedLevels.map((level) => (
            <LevelCard
              key={level.level}
              level={level}
              isCurrentLevel={level.level === item.currentLevel}
              isFutureLevel={level.level > item.currentLevel}
              onManualEscalate={
                onManualEscalate && level.level > item.currentLevel
                  ? () => handleEscalate(level.level)
                  : undefined
              }
              onContactPerson={onContactPerson}
              isEscalating={escalatingTo === level.level}
            />
          ))}
        </div>

        {/* Resolve Button */}
        {onResolve && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleResolve}
              disabled={isResolving}
              className="w-full"
            >
              {isResolving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark as Resolved
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { EscalationStatus, EscalationContact, EscalationLevel, EscalationItem }
