"use client"

/**
 * Sharing Board - AFANDA Platform Component
 *
 * FigJam-style collaborative board for document sharing and consultation.
 * Implements A01-CANONICAL.md §8 — AFANDA (Unified Board)
 *
 * Features:
 * - Share documents with team members
 * - Request consultation/approval
 * - Add comments and annotations
 * - Track read receipts
 * - Deadline management
 *
 * @example
 * ```tsx
 * import { SharingBoard } from "@workspace/design-system"
 *
 * <SharingBoard
 *   items={sharedItems}
 *   onShare={(item, recipients) => shareDocument(item, recipients)}
 *   onComment={(itemId, comment) => addComment(itemId, comment)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
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
  Share2,
  MessageSquare,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MoreVertical,
  FileText,
  Send,
  Paperclip,
  Calendar,
  Bell,
  ThumbsUp,
  Reply,
  Loader2,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type ShareStatus = "pending" | "viewed" | "acknowledged" | "action_required"
export type ShareType = "info" | "review" | "approval" | "consultation"

export interface Participant {
  id: string
  name: string
  email?: string
  role?: string
  avatarUrl?: string
  status?: ShareStatus
  viewedAt?: string | Date
  acknowledgedAt?: string | Date
}

export interface Comment {
  id: string
  author: Participant
  content: string
  createdAt: string | Date
  parentId?: string
  reactions?: { emoji: string; count: number; users: string[] }[]
}

export interface SharedItem {
  id: string
  title: string
  description?: string
  type: ShareType
  documentType?: string
  documentId?: string
  sharedBy: Participant
  sharedAt: string | Date
  deadline?: string | Date
  participants: Participant[]
  comments: Comment[]
  attachments?: { id: string; name: string; url: string }[]
  metadata?: Record<string, unknown>
}

export interface SharingBoardProps {
  /** Shared items */
  items: SharedItem[]
  /** Current user */
  currentUser: Participant
  /** Share callback */
  onShare?: (item: Partial<SharedItem>, recipients: string[]) => Promise<void>
  /** Add comment callback */
  onComment?: (itemId: string, content: string, parentId?: string) => Promise<void>
  /** Acknowledge callback */
  onAcknowledge?: (itemId: string) => Promise<void>
  /** View document callback */
  onViewDocument?: (item: SharedItem) => void
  /** Remove participant callback */
  onRemoveParticipant?: (itemId: string, participantId: string) => Promise<void>
  /** Show read receipts */
  showReadReceipts?: boolean
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const TYPE_CONFIG: Record<
  ShareType,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    label: string
  }
> = {
  info: { icon: Bell, color: "text-blue-600", bgColor: "bg-blue-100", label: "FYI" },
  review: { icon: Eye, color: "text-amber-600", bgColor: "bg-amber-100", label: "Review" },
  approval: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Approval" },
  consultation: { icon: MessageSquare, color: "text-purple-600", bgColor: "bg-purple-100", label: "Consult" },
}

const STATUS_CONFIG: Record<ShareStatus, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-gray-500", label: "Pending" },
  viewed: { icon: Eye, color: "text-blue-500", label: "Viewed" },
  acknowledged: { icon: CheckCircle, color: "text-green-500", label: "Acknowledged" },
  action_required: { icon: AlertCircle, color: "text-amber-500", label: "Action Required" },
}

// ============================================================================
// Helper Components
// ============================================================================

function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

function ParticipantAvatar({ participant, showStatus }: { participant: Participant; showStatus?: boolean }) {
  const statusConfig = participant.status ? STATUS_CONFIG[participant.status] : null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative">
            <Avatar className="h-8 w-8 border-2 border-background">
              {participant.avatarUrl ? (
                <img src={participant.avatarUrl} alt={participant.name} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>
            {showStatus && statusConfig && (
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 rounded-full bg-background p-0.5",
                  statusConfig.color
                )}
              >
                <statusConfig.icon className="h-3 w-3" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{participant.name}</p>
          {participant.role && <p className="text-xs text-muted-foreground">{participant.role}</p>}
          {participant.status && (
            <p className="text-xs">{STATUS_CONFIG[participant.status].label}</p>
          )}
          {participant.viewedAt && (
            <p className="text-xs text-muted-foreground">
              Viewed: {formatDate(participant.viewedAt)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function CommentItem({
  comment,
  onReply,
  currentUserId,
}: {
  comment: Comment
  onReply?: (parentId: string) => void
  currentUserId: string
}) {
  return (
    <div className="flex gap-3">
      <ParticipantAvatar participant={comment.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm">{comment.content}</p>
        <div className="mt-2 flex items-center gap-2">
          {comment.reactions?.map((reaction, index) => (
            <button
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs hover:bg-muted/80"
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
          {onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Share Card
// ============================================================================

function ShareCard({
  item,
  currentUser,
  onComment,
  onAcknowledge,
  onViewDocument,
  showReadReceipts,
}: {
  item: SharedItem
  currentUser: Participant
  onComment?: (itemId: string, content: string, parentId?: string) => Promise<void>
  onAcknowledge?: (itemId: string) => Promise<void>
  onViewDocument?: (item: SharedItem) => void
  showReadReceipts: boolean
}) {
  const [showComments, setShowComments] = React.useState(false)
  const [newComment, setNewComment] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isAcknowledging, setIsAcknowledging] = React.useState(false)

  const typeConfig = TYPE_CONFIG[item.type]
  const TypeIcon = typeConfig.icon

  const currentParticipant = item.participants.find((p) => p.id === currentUser.id)
  const needsAcknowledge = currentParticipant && currentParticipant.status !== "acknowledged"
  const isOverdue = item.deadline && new Date(item.deadline) < new Date()

  const viewedCount = item.participants.filter((p) => p.status !== "pending").length
  const acknowledgedCount = item.participants.filter((p) => p.status === "acknowledged").length

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !onComment) return
    setIsSubmitting(true)
    try {
      await onComment(item.id, newComment)
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcknowledge = async () => {
    if (!onAcknowledge) return
    setIsAcknowledging(true)
    try {
      await onAcknowledge(item.id)
    } finally {
      setIsAcknowledging(false)
    }
  }

  return (
    <Card className={cn(isOverdue && "border-red-300 dark:border-red-800")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("rounded-lg p-2", typeConfig.bgColor)}>
              <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
            </div>
            <div>
              <CardTitle className="text-base">{item.title}</CardTitle>
              {item.description && (
                <CardDescription className="mt-1">{item.description}</CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDocument?.(item)}>
                <FileText className="mr-2 h-4 w-4" />
                View Document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Mute Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta Info */}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ParticipantAvatar participant={item.sharedBy} />
            <span>{item.sharedBy.name}</span>
          </div>
          <span>{formatRelativeTime(item.sharedAt)}</span>
          <Badge className={cn(typeConfig.bgColor, typeConfig.color, "border-0")}>
            {typeConfig.label}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>

        {/* Deadline */}
        {item.deadline && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-xs",
              isOverdue ? "text-red-600" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            Due: {formatDate(item.deadline)}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Participants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {showReadReceipts
                ? `${viewedCount}/${item.participants.length} viewed • ${acknowledgedCount} acknowledged`
                : `${item.participants.length} participants`}
            </span>
          </div>
          <div className="flex -space-x-2">
            {item.participants.slice(0, 6).map((participant) => (
              <ParticipantAvatar
                key={participant.id}
                participant={participant}
                showStatus={showReadReceipts}
              />
            ))}
            {item.participants.length > 6 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-background">
                +{item.participants.length - 6}
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        {item.attachments && item.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80"
              >
                <Paperclip className="h-3 w-3" />
                {attachment.name}
              </a>
            ))}
          </div>
        )}

        {/* Comments Section */}
        {item.comments.length > 0 && (
          <div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              {item.comments.length} comment{item.comments.length !== 1 ? "s" : ""}
            </button>
            {showComments && (
              <div className="mt-3 space-y-4 border-l-2 pl-4">
                {item.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUser.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Comment */}
        {onComment && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitComment()}
            />
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {(needsAcknowledge || onViewDocument) && (
        <CardFooter className="gap-2 pt-0">
          {onViewDocument && (
            <Button variant="outline" size="sm" onClick={() => onViewDocument(item)}>
              <Eye className="mr-1 h-3 w-3" />
              View Document
            </Button>
          )}
          {needsAcknowledge && onAcknowledge && (
            <Button size="sm" onClick={handleAcknowledge} disabled={isAcknowledging}>
              {isAcknowledging ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <ThumbsUp className="mr-1 h-3 w-3" />
              )}
              Acknowledge
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// ============================================================================
// New Share Dialog
// ============================================================================

function NewShareDialog({
  open,
  onOpenChange,
  onShare,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShare?: (item: Partial<SharedItem>, recipients: string[]) => Promise<void>
}) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState<ShareType>("info")
  const [recipients, setRecipients] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !recipients.trim() || !onShare) return
    setIsSubmitting(true)
    try {
      await onShare(
        { title, description, type },
        recipients.split(",").map((r) => r.trim())
      )
      onOpenChange(false)
      setTitle("")
      setDescription("")
      setRecipients("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share with Team
          </DialogTitle>
          <DialogDescription>
            Share a document or request consultation from team members
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you sharing?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context or instructions..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <Button
                  key={key}
                  variant={type === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType(key as ShareType)}
                >
                  <config.icon className="mr-1 h-3 w-3" />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients (comma separated)</label>
            <Input
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="user@example.com, another@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !recipients.trim() || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function SharingBoard({
  items,
  currentUser,
  onShare,
  onComment,
  onAcknowledge,
  onViewDocument,
  onRemoveParticipant,
  showReadReceipts = true,
  className,
}: SharingBoardProps) {
  const [showNewShareDialog, setShowNewShareDialog] = React.useState(false)

  // Group items by status
  const actionRequired = items.filter((item) =>
    item.participants.some(
      (p) => p.id === currentUser.id && p.status === "action_required"
    )
  )
  const needsAcknowledge = items.filter((item) =>
    item.participants.some(
      (p) => p.id === currentUser.id && p.status !== "acknowledged" && !actionRequired.includes(item)
    )
  )
  const acknowledged = items.filter((item) =>
    item.participants.some(
      (p) => p.id === currentUser.id && p.status === "acknowledged"
    )
  )

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Sharing Board
              </CardTitle>
              <CardDescription>
                {items.length} shared item{items.length !== 1 ? "s" : ""} •{" "}
                {actionRequired.length} require action
              </CardDescription>
            </div>
            {onShare && (
              <Button onClick={() => setShowNewShareDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Share2 className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No shared items</h3>
              <p className="text-sm text-muted-foreground">
                Share a document to start collaborating
              </p>
            </div>
          ) : (
            <>
              {/* Action Required */}
              {actionRequired.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 mb-3 font-semibold text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    Action Required
                    <Badge variant="secondary">{actionRequired.length}</Badge>
                  </h3>
                  <div className="space-y-4">
                    {actionRequired.map((item) => (
                      <ShareCard
                        key={item.id}
                        item={item}
                        currentUser={currentUser}
                        onComment={onComment}
                        onAcknowledge={onAcknowledge}
                        onViewDocument={onViewDocument}
                        showReadReceipts={showReadReceipts}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Needs Acknowledge */}
              {needsAcknowledge.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 mb-3 font-semibold">
                    <Eye className="h-4 w-4" />
                    Pending Review
                    <Badge variant="secondary">{needsAcknowledge.length}</Badge>
                  </h3>
                  <div className="space-y-4">
                    {needsAcknowledge.map((item) => (
                      <ShareCard
                        key={item.id}
                        item={item}
                        currentUser={currentUser}
                        onComment={onComment}
                        onAcknowledge={onAcknowledge}
                        onViewDocument={onViewDocument}
                        showReadReceipts={showReadReceipts}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Acknowledged */}
              {acknowledged.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 mb-3 font-semibold text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                    <Badge variant="secondary">{acknowledged.length}</Badge>
                  </h3>
                  <div className="space-y-4">
                    {acknowledged.map((item) => (
                      <ShareCard
                        key={item.id}
                        item={item}
                        currentUser={currentUser}
                        onComment={onComment}
                        onAcknowledge={onAcknowledge}
                        onViewDocument={onViewDocument}
                        showReadReceipts={showReadReceipts}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <NewShareDialog
        open={showNewShareDialog}
        onOpenChange={setShowNewShareDialog}
        onShare={onShare}
      />
    </>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ShareStatus, ShareType, Participant, Comment, SharedItem }
