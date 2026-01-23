"use client"

import * as React from "react"
import { forwardRef, useState, useCallback } from "react"
import type { TextareaHTMLAttributes, KeyboardEvent, ChangeEvent } from "react"
import { ArrowUp, Mic, MicOff, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/button"

// ============================================================================
// ChatInput Component
// ============================================================================

export interface ChatInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onSubmit"> {
  /** Callback when user submits a message */
  onSubmit?: (message: string) => void
  /** Whether the input is in a loading/sending state */
  isLoading?: boolean
  /** Whether to show the microphone button */
  showMicButton?: boolean
  /** Whether the mic is currently active */
  isMicActive?: boolean
  /** Callback when mic button is clicked */
  onMicClick?: () => void
  /** Placeholder text */
  placeholder?: string
  /** Maximum character count */
  maxLength?: number
  /** Whether to auto-resize the textarea */
  autoResize?: boolean
  /** Minimum rows for the textarea */
  minRows?: number
  /** Maximum rows before scrolling */
  maxRows?: number
}

/**
 * Chat Input
 *
 * A chat input component with optional voice button.
 * Supports auto-resize, character count, and keyboard shortcuts.
 *
 * @source ElevenLabs UI (adapted)
 */
export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      className,
      onSubmit,
      isLoading = false,
      showMicButton = false,
      isMicActive = false,
      onMicClick,
      placeholder = "Type a message...",
      maxLength,
      autoResize = true,
      minRows = 1,
      maxRows = 5,
      disabled,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState("")
    const internalRef = React.useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        if (maxLength && newValue.length > maxLength) return
        setValue(newValue)

        // Auto-resize logic
        if (autoResize && textareaRef.current) {
          textareaRef.current.style.height = "auto"
          const lineHeight = parseInt(
            getComputedStyle(textareaRef.current).lineHeight || "24"
          )
          const minHeight = lineHeight * minRows
          const maxHeight = lineHeight * maxRows
          const scrollHeight = textareaRef.current.scrollHeight
          textareaRef.current.style.height = `${Math.min(
            Math.max(scrollHeight, minHeight),
            maxHeight
          )}px`
        }
      },
      [autoResize, maxLength, minRows, maxRows, textareaRef]
    )

    const handleSubmit = useCallback(() => {
      if (!value.trim() || isLoading || disabled) return
      onSubmit?.(value.trim())
      setValue("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }, [value, isLoading, disabled, onSubmit, textareaRef])

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleSubmit()
        }
      },
      [handleSubmit]
    )

    const canSubmit = value.trim().length > 0 && !isLoading && !disabled

    return (
      <div
        className={cn(
          "relative flex items-end gap-2 rounded-lg border bg-background p-2",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50",
          className
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={minRows}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed"
          )}
          {...props}
        />

        <div className="flex items-center gap-1">
          {maxLength && (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                value.length > maxLength * 0.9 && "text-destructive"
              )}
            >
              {value.length}/{maxLength}
            </span>
          )}

          {showMicButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onMicClick}
              disabled={disabled}
            >
              {isMicActive ? (
                <MicOff className="size-4 text-destructive" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
          )}

          <Button
            type="button"
            size="icon"
            className="size-8"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }
)

ChatInput.displayName = "ChatInput"

// ============================================================================
// ChatInputContainer (for positioning)
// ============================================================================

export interface ChatInputContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to stick to bottom of container */
  sticky?: boolean
}

export function ChatInputContainer({
  className,
  sticky = true,
  children,
  ...props
}: ChatInputContainerProps) {
  return (
    <div
      className={cn(
        "w-full bg-background/80 backdrop-blur-sm",
        sticky && "sticky bottom-0",
        "border-t p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
