"use client"

/**
 * Consultation Thread - AFANDA Platform Component
 *
 * Structured discussion with canonical outcomes.
 * Implements A01-CANONICAL.md §8 — AFANDA (Collaborative Decision Making)
 *
 * Features:
 * - Threaded discussion
 * - Tag participants
 * - Voting/polling
 * - Resolution tracking
 * - Canonical outcome recording
 *
 * @example
 * ```tsx
 * import { ConsultationThread } from "@workspace/design-system"
 *
 * <ConsultationThread
 *   thread={consultationData}
 *   onAddMessage={(msg) => postMessage(msg)}
 *   onResolve={(resolution) => closeThread(resolution)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Textarea } from "@/components/textarea"
import { Avatar } from "@/components/avatar"
import {
  MessageSquare,
  Users,
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AtSign,
  Send,
  Lock,
  FileText,
  Loader2,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ThreadStatus = "open" | "pending_resolution" | "resolved" | "closed"

export interface ThreadParticipant {
  id: string
  name: string
  role: string
  avatarUrl?: string
}

export interface ThreadMessage {
  id: string
  author: ThreadParticipant
  content: string
  createdAt: string | Date
  mentions?: string[] // participant IDs
  attachments?: { id: string; name: string; url?: string }[]
  votes?: {
    up: string[] // participant IDs
    down: string[]
  }
  isResolution?: boolean
}

export interface ThreadResolution {
  summary: string
  decision: string
  approvedBy: ThreadParticipant[]
  timestamp: string | Date
}

export interface ConsultationThreadData {
  id: string
  title: string
  description?: string
  status: ThreadStatus
  priority: "low" | "normal" | "high" | "urgent"
  initiatedBy: ThreadParticipant
  createdAt: string | Date
  dueDate?: string | Date
  participants: ThreadParticipant[]
  messages: ThreadMessage[]
  resolution?: ThreadResolution
  tags?: string[]
  relatedDocumentRef?: string
}

export interface ConsultationThreadProps {
  /** Thread data */
  thread: ConsultationThreadData
  /** Current user */
  currentUser: ThreadParticipant
  /** Add message callback */
  onAddMessage?: (content: string, mentions?: string[]) => Promise<void>
  /** Vote callback */
  onVote?: (messageId: string, vote: "up" | "down") => void
  /** Resolve callback */
  onResolve?: (resolution: Omit<ThreadResolution, "timestamp">) => Promise<void>
  /** Close callback */
  onClose?: () => void
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG = {
  open: { icon: MessageSquare, color: "bg-blue-100 text-blue-700", label: "Open" },
  pending_resolution: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending Resolution" },
  resolved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Resolved" },
  closed: { icon: Lock, color: "bg-gray-100 text-gray-700", label: "Closed" },
}

const PRIORITY_CONFIG = {
  low: { color: "bg-gray-100 text-gray-700" },
  normal: { color: "bg-blue-100 text-blue-700" },
  high: { color: "bg-amber-100 text-amber-700" },
  urgent: { color: "bg-red-100 text-red-700" },
}

// ============================================================================
// Message Component
// ============================================================================

function MessageCard({
  message,
  participants,
  currentUserId,
  onVote,
}: {
  message: ThreadMessage
  participants: ThreadParticipant[]
  currentUserId: string
  onVote?: (messageId: string, vote: "up" | "down") => void
}) {
  const upVotes = message.votes?.up?.length ?? 0
  const downVotes = message.votes?.down?.length ?? 0
  const hasVotedUp = message.votes?.up?.includes(currentUserId)
  const hasVotedDown = message.votes?.down?.includes(currentUserId)

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        message.isResolution && "border-green-300 bg-green-50 dark:bg-green-950"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          {message.author.avatarUrl ? (
            <img src={message.author.avatarUrl} alt={message.author.name} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
              {message.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{message.author.name}</span>
            <span className="text-xs text-muted-foreground">({message.author.role})</span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleString()}
            </span>
            {message.isResolution && (
              <Badge className="bg-green-100 text-green-700 gap-1">
                <CheckCircle className="h-3 w-3" />
                Resolution
              </Badge>
            )}
          </div>

          <div className="mt-2 text-sm whitespace-pre-wrap">{message.content}</div>

          {/* Mentions */}
          {message.mentions && message.mentions.length > 0 && (
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              <AtSign className="h-3 w-3 text-muted-foreground" />
              {message.mentions.map((id) => {
                const p = participants.find((p) => p.id === id)
                return p ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {p.name}
                  </Badge>
                ) : null
              })}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {message.attachments.map((att) => (
                <Button key={att.id} variant="outline" size="sm" className="h-7 text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  {att.name}
                </Button>
              ))}
            </div>
          )}

          {/* Votes */}
          {onVote && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant={hasVotedUp ? "default" : "outline"}
                size="sm"
                className="h-7"
                onClick={() => onVote(message.id, "up")}
              >
                <ThumbsUp className="mr-1 h-3 w-3" />
                {upVotes}
              </Button>
              <Button
                variant={hasVotedDown ? "destructive" : "outline"}
                size="sm"
                className="h-7"
                onClick={() => onVote(message.id, "down")}
              >
                <ThumbsDown className="mr-1 h-3 w-3" />
                {downVotes}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Resolution Card
// ============================================================================

function ResolutionCard({ resolution }: { resolution: ThreadResolution }) {
  return (
    <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h4 className="font-semibold text-green-800 dark:text-green-200">Canonical Resolution</h4>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-green-700 dark:text-green-300 mb-1">Summary</p>
          <p className="text-sm font-medium text-green-800 dark:text-green-200">{resolution.summary}</p>
        </div>
        <div>
          <p className="text-xs text-green-700 dark:text-green-300 mb-1">Decision</p>
          <p className="text-sm text-green-800 dark:text-green-200">{resolution.decision}</p>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-green-200">
          <p className="text-xs text-green-600">Approved by:</p>
          <div className="flex -space-x-2">
            {resolution.approvedBy.map((p) => (
              <Avatar key={p.id} className="h-6 w-6 border-2 border-background">
                <div className="flex h-full w-full items-center justify-center bg-green-600 text-white text-xs">
                  {p.name.charAt(0)}
                </div>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-green-600 ml-auto">
            {new Date(resolution.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
        <Lock className="h-3 w-3" />
        <span>This resolution is immutable and recorded in the audit trail.</span>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function ConsultationThread({
  thread,
  currentUser,
  onAddMessage,
  onVote,
  onResolve,
  onClose,
  className,
}: ConsultationThreadProps) {
  const [newMessage, setNewMessage] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [showResolveForm, setShowResolveForm] = React.useState(false)
  const [resolutionSummary, setResolutionSummary] = React.useState("")
  const [resolutionDecision, setResolutionDecision] = React.useState("")
  const [isResolving, setIsResolving] = React.useState(false)

  const statusConfig = STATUS_CONFIG[thread.status]
  const StatusIcon = statusConfig.icon
  const priorityConfig = PRIORITY_CONFIG[thread.priority]

  const isOpen = thread.status === "open" || thread.status === "pending_resolution"

  const handleSend = async () => {
    if (!onAddMessage || !newMessage.trim()) return
    setIsSending(true)
    try {
      await onAddMessage(newMessage)
      setNewMessage("")
    } finally {
      setIsSending(false)
    }
  }

  const handleResolve = async () => {
    if (!onResolve || !resolutionSummary || !resolutionDecision) return
    setIsResolving(true)
    try {
      await onResolve({
        summary: resolutionSummary,
        decision: resolutionDecision,
        approvedBy: [currentUser],
      })
      setShowResolveForm(false)
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {thread.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {thread.description}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={cn("gap-1", statusConfig.color)}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              <Badge className={priorityConfig.color} variant="outline">
                {thread.priority.charAt(0).toUpperCase() + thread.priority.slice(1)}
              </Badge>
              {thread.dueDate && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Due: {new Date(thread.dueDate).toLocaleDateString()}
                </Badge>
              )}
              {thread.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {thread.participants.length}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Participants */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Participants:</span>
          <div className="flex -space-x-2">
            {thread.participants.slice(0, 5).map((p) => (
              <Avatar key={p.id} className="h-6 w-6 border-2 border-background">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt={p.name} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                    {p.name.charAt(0)}
                  </div>
                )}
              </Avatar>
            ))}
            {thread.participants.length > 5 && (
              <span className="ml-2 text-xs text-muted-foreground">
                +{thread.participants.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Resolution (if resolved) */}
        {thread.resolution && <ResolutionCard resolution={thread.resolution} />}

        {/* Messages */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {thread.messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              participants={thread.participants}
              currentUserId={currentUser.id}
              onVote={isOpen ? onVote : undefined}
            />
          ))}
        </div>

        {/* Resolve Form */}
        {showResolveForm && (
          <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium">Propose Resolution</h4>
            <div className="space-y-2">
              <Input
                placeholder="Resolution summary..."
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
              />
              <Textarea
                placeholder="Decision details..."
                value={resolutionDecision}
                onChange={(e) => setResolutionDecision(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowResolveForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                disabled={!resolutionSummary || !resolutionDecision || isResolving}
              >
                {isResolving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Submit Resolution
              </Button>
            </div>
          </div>
        )}

        {/* New Message Input */}
        {isOpen && onAddMessage && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <div className="flex flex-col gap-2">
              <Button onClick={handleSend} disabled={!newMessage.trim() || isSending}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {isOpen && (onResolve || onClose) && (
        <CardFooter className="gap-2 justify-end border-t pt-4">
          {onResolve && !showResolveForm && (
            <Button variant="outline" onClick={() => setShowResolveForm(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Propose Resolution
            </Button>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close Thread
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ThreadStatus, ThreadParticipant, ThreadMessage, ThreadResolution, ConsultationThreadData }
