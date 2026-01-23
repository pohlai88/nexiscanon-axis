"use client"

import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useState,
  isValidElement,
} from "react"
import type {
  Dispatch,
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  SetStateAction,
} from "react"
import * as Portal from "@radix-ui/react-portal"

import { cn } from "@/lib/utils"

// ============================================================================
// Context
// ============================================================================

interface DialogStackContextValue {
  activeIndex: number
  setActiveIndex: Dispatch<SetStateAction<number>>
  totalDialogs: number
  setTotalDialogs: Dispatch<SetStateAction<number>>
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  clickable: boolean
}

const DialogStackContext = createContext<DialogStackContextValue | null>(null)

function useDialogStackContext() {
  const context = useContext(DialogStackContext)
  if (!context) {
    throw new Error("DialogStack components must be used within DialogStack")
  }
  return context
}

// ============================================================================
// DialogStack Container
// ============================================================================

export interface DialogStackProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Allow clicking on stacked dialogs to navigate back */
  clickable?: boolean
}

/**
 * Dialog Stack
 *
 * A multi-step dialog/wizard with stacked visual effect.
 * Each step stacks behind the current one with depth perspective.
 *
 * @source Skiper UI
 *
 * @example
 * ```tsx
 * <DialogStack>
 *   <DialogStackTrigger>Open Wizard</DialogStackTrigger>
 *   <DialogStackOverlay />
 *   <DialogStackBody>
 *     <DialogStackContent>
 *       <DialogStackHeader>Step 1</DialogStackHeader>
 *       <p>Content for step 1</p>
 *       <DialogStackFooter>
 *         <DialogStackNext>Continue</DialogStackNext>
 *       </DialogStackFooter>
 *     </DialogStackContent>
 *     <DialogStackContent>
 *       <DialogStackHeader>Step 2</DialogStackHeader>
 *       <p>Content for step 2</p>
 *       <DialogStackFooter>
 *         <DialogStackPrevious>Back</DialogStackPrevious>
 *         <DialogStackNext>Finish</DialogStackNext>
 *       </DialogStackFooter>
 *     </DialogStackContent>
 *   </DialogStackBody>
 * </DialogStack>
 * ```
 */
export function DialogStack({
  children,
  className,
  open = false,
  onOpenChange,
  clickable = false,
  ...props
}: DialogStackProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  useEffect(() => {
    onOpenChange?.(isOpen)
    // Reset to first step when closing
    if (!isOpen) {
      setActiveIndex(0)
    }
  }, [isOpen, onOpenChange])

  return (
    <DialogStackContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        totalDialogs: 0,
        setTotalDialogs: () => {},
        isOpen,
        setIsOpen,
        clickable,
      }}
    >
      <div className={className} {...props}>
        {children}
      </div>
    </DialogStackContext.Provider>
  )
}

// ============================================================================
// DialogStackTrigger
// ============================================================================

export interface DialogStackTriggerProps
  extends HTMLAttributes<HTMLButtonElement> {
  /** Render as child element */
  asChild?: boolean
}

export function DialogStackTrigger({
  children,
  className,
  onClick,
  asChild,
  ...props
}: DialogStackTriggerProps) {
  const context = useDialogStackContext()

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    context.setIsOpen(true)
    onClick?.(e as MouseEvent<HTMLButtonElement>)
  }

  if (asChild && isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: handleClick,
      className: cn(className, childProps.className as string | undefined),
      ...props,
    })
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-10 px-4 py-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================================
// DialogStackOverlay
// ============================================================================

export interface DialogStackOverlayProps
  extends HTMLAttributes<HTMLDivElement> {}

export function DialogStackOverlay({
  className,
  ...props
}: DialogStackOverlayProps) {
  const context = useDialogStackContext()

  if (!context.isOpen) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      onClick={() => context.setIsOpen(false)}
      data-state={context.isOpen ? "open" : "closed"}
      {...props}
    />
  )
}

// ============================================================================
// DialogStackBody
// ============================================================================

interface DialogStackChildProps {
  index?: number
}

export interface DialogStackBodyProps extends HTMLAttributes<HTMLDivElement> {
  children:
    | ReactElement<DialogStackChildProps>[]
    | ReactElement<DialogStackChildProps>
}

export function DialogStackBody({
  children,
  className,
  ...props
}: DialogStackBodyProps) {
  const context = useDialogStackContext()
  const totalDialogs = Children.count(children)

  if (!context.isOpen) {
    return null
  }

  return (
    <DialogStackContext.Provider
      value={{
        ...context,
        totalDialogs,
        setTotalDialogs: () => {},
      }}
    >
      <Portal.Root>
        <div
          className={cn(
            "pointer-events-none fixed inset-0 z-50 mx-auto flex w-full max-w-lg flex-col items-center justify-center p-4",
            className
          )}
          {...props}
        >
          <div className="pointer-events-auto relative flex w-full flex-col items-center justify-center">
            {Children.map(children, (child, index) =>
              isValidElement(child)
                ? cloneElement(child as ReactElement<{ index?: number }>, { index })
                : child
            )}
          </div>
        </div>
      </Portal.Root>
    </DialogStackContext.Provider>
  )
}

// ============================================================================
// DialogStackContent
// ============================================================================

export interface DialogStackContentProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Index in the stack (auto-assigned) */
  index?: number
  /** Vertical offset between stacked items */
  offset?: number
}

export function DialogStackContent({
  children,
  className,
  index = 0,
  offset = 10,
  ...props
}: DialogStackContentProps) {
  const context = useDialogStackContext()

  if (!context.isOpen) {
    return null
  }

  const handleClick = () => {
    if (context.clickable && context.activeIndex > index) {
      context.setActiveIndex(index)
    }
  }

  const distanceFromActive = index - context.activeIndex
  const translateY =
    distanceFromActive < 0
      ? `-${Math.abs(distanceFromActive) * offset}px`
      : `${Math.abs(distanceFromActive) * offset}px`

  return (
    <div
      onClick={handleClick}
      className={cn(
        "size-full rounded-xl border bg-background p-4 shadow-lg transition-all duration-300",
        className
      )}
      style={{
        top: 0,
        transform: `translateY(${translateY})`,
        width: `calc(100% - ${Math.abs(distanceFromActive) * 10}px)`,
        zIndex: 50 - Math.abs(context.activeIndex - index),
        position: distanceFromActive ? "absolute" : "relative",
        opacity: distanceFromActive > 0 ? 0 : 1,
        cursor:
          context.clickable && context.activeIndex > index
            ? "pointer"
            : "default",
      }}
      {...props}
    >
      <div
        className={cn(
          "size-full transition-all duration-300",
          context.activeIndex !== index &&
            "pointer-events-none select-none opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}

// ============================================================================
// DialogStackHeader
// ============================================================================

export interface DialogStackHeaderProps
  extends HTMLAttributes<HTMLDivElement> {}

export function DialogStackHeader({
  className,
  ...props
}: DialogStackHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

// ============================================================================
// DialogStackTitle
// ============================================================================

export interface DialogStackTitleProps
  extends HTMLAttributes<HTMLHeadingElement> {}

export function DialogStackTitle({
  className,
  ...props
}: DialogStackTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

// ============================================================================
// DialogStackDescription
// ============================================================================

export interface DialogStackDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export function DialogStackDescription({
  className,
  ...props
}: DialogStackDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

// ============================================================================
// DialogStackFooter
// ============================================================================

export interface DialogStackFooterProps
  extends HTMLAttributes<HTMLDivElement> {}

export function DialogStackFooter({
  children,
  className,
  ...props
}: DialogStackFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 pt-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// DialogStackNext
// ============================================================================

export interface DialogStackNextProps extends HTMLAttributes<HTMLButtonElement> {
  /** Render as child element */
  asChild?: boolean
}

export function DialogStackNext({
  children,
  className,
  asChild,
  ...props
}: DialogStackNextProps) {
  const context = useDialogStackContext()

  const handleNext = () => {
    if (context.activeIndex < context.totalDialogs - 1) {
      context.setActiveIndex(context.activeIndex + 1)
    }
  }

  if (asChild && isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: handleNext,
      className: cn(className, childProps.className as string | undefined),
      ...props,
    })
  }

  return (
    <button
      type="button"
      onClick={handleNext}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      disabled={context.activeIndex >= context.totalDialogs - 1}
      {...props}
    >
      {children || "Next"}
    </button>
  )
}

// ============================================================================
// DialogStackPrevious
// ============================================================================

export interface DialogStackPreviousProps
  extends HTMLAttributes<HTMLButtonElement> {
  /** Render as child element */
  asChild?: boolean
}

export function DialogStackPrevious({
  children,
  className,
  asChild,
  ...props
}: DialogStackPreviousProps) {
  const context = useDialogStackContext()

  const handlePrevious = () => {
    if (context.activeIndex > 0) {
      context.setActiveIndex(context.activeIndex - 1)
    }
  }

  if (asChild && isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: handlePrevious,
      className: cn(className, childProps.className as string | undefined),
      ...props,
    })
  }

  return (
    <button
      type="button"
      onClick={handlePrevious}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      disabled={context.activeIndex <= 0}
      {...props}
    >
      {children || "Previous"}
    </button>
  )
}

// ============================================================================
// DialogStackClose
// ============================================================================

export interface DialogStackCloseProps
  extends HTMLAttributes<HTMLButtonElement> {
  /** Render as child element */
  asChild?: boolean
}

export function DialogStackClose({
  children,
  className,
  asChild,
  ...props
}: DialogStackCloseProps) {
  const context = useDialogStackContext()

  const handleClose = () => {
    context.setIsOpen(false)
  }

  if (asChild && isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: handleClose,
      className: cn(className, childProps.className as string | undefined),
      ...props,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClose}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children || "Close"}
    </button>
  )
}

// ============================================================================
// useDialogStack Hook
// ============================================================================

export function useDialogStack() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    setIsOpen,
  }
}
