"use client"

import type { HTMLAttributes, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ============================================================================
// ChatMessage Container
// ============================================================================

export type ChatMessageProps = HTMLAttributes<HTMLDivElement> & {
  /** Message sender: "user" or "assistant" */
  from: "user" | "assistant"
}

/**
 * Chat Message
 *
 * A chat message container with alignment based on sender.
 * Use with ChatMessageContent and ChatMessageAvatar.
 *
 * @source ElevenLabs UI (adapted)
 */
export function ChatMessage({ className, from, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "group flex w-full items-end justify-end gap-2 py-4",
        from === "user"
          ? "is-user"
          : "is-assistant flex-row-reverse justify-end",
        className
      )}
      data-from={from}
      {...props}
    />
  )
}

// ============================================================================
// ChatMessageContent
// ============================================================================

const chatMessageContentVariants = cva(
  "flex flex-col gap-2 overflow-hidden rounded-lg text-sm",
  {
    variants: {
      variant: {
        contained: [
          "max-w-[80%] px-4 py-3",
          "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
          "group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground",
        ],
        flat: [
          "group-[.is-user]:max-w-[80%] group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
          "group-[.is-assistant]:text-foreground",
        ],
        outline: [
          "max-w-[80%] px-4 py-3 border",
          "group-[.is-user]:border-primary/20 group-[.is-user]:bg-primary/5",
          "group-[.is-assistant]:border-muted group-[.is-assistant]:bg-muted/50",
        ],
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  }
)

export type ChatMessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof chatMessageContentVariants>

export function ChatMessageContent({
  children,
  className,
  variant,
  ...props
}: ChatMessageContentProps) {
  return (
    <div
      className={cn(chatMessageContentVariants({ variant, className }))}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// ChatMessageAvatar
// ============================================================================

export type ChatMessageAvatarProps = HTMLAttributes<HTMLDivElement> & {
  /** Avatar image source */
  src?: string
  /** Fallback initials or name */
  name?: string
  /** Alt text for the image */
  alt?: string
}

export function ChatMessageAvatar({
  src,
  name,
  alt,
  className,
  ...props
}: ChatMessageAvatarProps) {
  const initials = name?.slice(0, 2).toUpperCase() || "ME"

  return (
    <div
      className={cn(
        "ring-border flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1",
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-xs font-medium text-muted-foreground">
          {initials}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// ChatMessageTimestamp
// ============================================================================

export type ChatMessageTimestampProps = HTMLAttributes<HTMLSpanElement> & {
  /** Timestamp to display */
  time: Date | string
  /** Format options */
  format?: "relative" | "time" | "datetime"
}

export function ChatMessageTimestamp({
  time,
  format = "time",
  className,
  ...props
}: ChatMessageTimestampProps) {
  const date = typeof time === "string" ? new Date(time) : time

  const formatTime = () => {
    switch (format) {
      case "relative":
        return getRelativeTime(date)
      case "datetime":
        return date.toLocaleString()
      case "time":
      default:
        return date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
    }
  }

  return (
    <span
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    >
      {formatTime()}
    </span>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// ============================================================================
// ChatMessageGroup (for grouping consecutive messages)
// ============================================================================

export type ChatMessageGroupProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function ChatMessageGroup({
  children,
  className,
  ...props
}: ChatMessageGroupProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  )
}
