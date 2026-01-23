"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode, RefObject, FormEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronUp, Loader2, Check } from "lucide-react"

import { cn } from "@/lib/utils"

// ============================================================================
// useClickOutside Hook
// ============================================================================

function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

// ============================================================================
// PopoverForm Component
// ============================================================================

export interface PopoverFormProps {
  /** Controlled open state */
  open: boolean
  /** Callback to change open state */
  setOpen: (open: boolean) => void
  /** Content when popover is open */
  children?: ReactNode
  /** Content to show on success */
  successContent?: ReactNode
  /** Whether to show success state */
  showSuccess?: boolean
  /** Width of the popover */
  width?: string | number
  /** Height of the popover */
  height?: string | number
  /** Whether to show close button at top */
  showCloseButton?: boolean
  /** Title shown on the trigger button */
  title: string
  /** Custom trigger className */
  triggerClassName?: string
  /** Custom popover className */
  popoverClassName?: string
}

/**
 * Popover Form
 *
 * An animated popover that expands from a button to show a form.
 * Includes success state animation.
 *
 * @source Skiper UI
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 * const [success, setSuccess] = useState(false)
 *
 * <PopoverForm
 *   open={open}
 *   setOpen={setOpen}
 *   title="Feedback"
 *   showSuccess={success}
 * >
 *   <form onSubmit={handleSubmit}>
 *     <textarea placeholder="Your feedback..." />
 *     <PopoverFormButton loading={loading} text="Submit" />
 *   </form>
 * </PopoverForm>
 * ```
 */
export function PopoverForm({
  open,
  setOpen,
  children,
  showSuccess = false,
  successContent,
  width = 364,
  height = 192,
  title = "Feedback",
  showCloseButton = false,
  triggerClassName,
  popoverClassName,
}: PopoverFormProps) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  return (
    <div className="relative">
      <motion.button
        layoutId={`${title}-wrapper`}
        onClick={() => setOpen(true)}
        style={{ borderRadius: 8 }}
        className={cn(
          "flex h-9 items-center border bg-background px-3 text-sm font-medium outline-none",
          "hover:bg-accent transition-colors",
          triggerClassName
        )}
      >
        <motion.span layoutId={`${title}-title`}>{title}</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            layoutId={`${title}-wrapper`}
            className={cn(
              "absolute z-50 overflow-hidden bg-muted p-1",
              "shadow-lg outline-none",
              popoverClassName
            )}
            ref={ref}
            style={{
              borderRadius: 10,
              width: typeof width === "number" ? `${width}px` : width,
              height: typeof height === "number" ? `${height}px` : height,
            }}
          >
            <motion.span
              aria-hidden
              className={cn(
                "absolute left-4 top-[17px] text-sm text-muted-foreground",
                showSuccess && "text-transparent"
              )}
              layoutId={`${title}-title`}
            >
              {title}
            </motion.span>

            {showCloseButton && (
              <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 z-20">
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label="Close"
                >
                  <ChevronUp className="size-4" />
                </button>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ y: -32, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                  className="flex h-full flex-col items-center justify-center"
                >
                  {successContent || <PopoverFormSuccess />}
                </motion.div>
              ) : (
                <motion.div
                  exit={{ y: 8, opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                  key="form-content"
                  style={{ borderRadius: 10 }}
                  className="h-full border bg-background z-20"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// PopoverFormButton
// ============================================================================

export interface PopoverFormButtonProps {
  /** Loading state */
  loading?: boolean
  /** Button text */
  text?: string
  /** Button type */
  type?: "submit" | "button"
  /** Click handler */
  onClick?: () => void
  /** Custom className */
  className?: string
}

export function PopoverFormButton({
  loading = false,
  text = "Submit",
  type = "submit",
  onClick,
  className,
}: PopoverFormButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={cn(
        "ml-auto flex h-7 items-center justify-center overflow-hidden rounded-md px-3",
        "bg-primary text-xs font-semibold text-primary-foreground",
        "shadow-sm transition-colors hover:bg-primary/90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${loading}`}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0,
          }}
          className="flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span>{text}</span>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

// ============================================================================
// PopoverFormSuccess
// ============================================================================

export interface PopoverFormSuccessProps {
  /** Success title */
  title?: string
  /** Success description */
  description?: string
  /** Custom className */
  className?: string
}

export function PopoverFormSuccess({
  title = "Success",
  description = "Thank you for your submission",
  className,
}: PopoverFormSuccessProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
        <Check className="size-4 text-primary" />
      </div>
      <h3 className="mb-1 mt-2 text-sm font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  )
}

// ============================================================================
// PopoverFormTextarea
// ============================================================================

export interface PopoverFormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function PopoverFormTextarea({
  className,
  ...props
}: PopoverFormTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full resize-none bg-transparent p-4 pt-8 text-sm outline-none",
        "placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

// ============================================================================
// PopoverFormFooter
// ============================================================================

export interface PopoverFormFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function PopoverFormFooter({
  className,
  children,
  ...props
}: PopoverFormFooterProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 border-t bg-muted/50 px-3 py-2",
        className
      )}
      style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// usePopoverForm Hook
// ============================================================================

export interface UsePopoverFormOptions {
  /** Callback on successful submit */
  onSuccess?: () => void
  /** Auto-close delay after success (ms) */
  successDuration?: number
}

export function usePopoverForm(options: UsePopoverFormOptions = {}) {
  const { onSuccess, successDuration = 2000 } = options
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (
    submitFn: () => Promise<void> | void
  ) => {
    setIsLoading(true)
    try {
      await submitFn()
      setShowSuccess(true)
      onSuccess?.()

      // Auto-close after success
      setTimeout(() => {
        setShowSuccess(false)
        setIsOpen(false)
      }, successDuration)
    } catch (error) {
      console.error("PopoverForm submit error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isOpen,
    setIsOpen,
    isLoading,
    showSuccess,
    handleSubmit,
    reset: () => {
      setShowSuccess(false)
      setIsLoading(false)
    },
  }
}
