"use client";

/**
 * Hold-to-Sign Component (Phase 5 - Cobalt Power Feature)
 *
 * Prevents accidental irreversible actions by requiring a hold gesture.
 * Used for: Posting documents, Reversing entries, Deleting records.
 *
 * AXIS UX Mantra: "Irreversible actions require deliberate confirmation."
 */

import { useState, useRef, useCallback, useEffect } from "react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface HoldToSignProps {
  /** Action to execute when hold completes */
  onComplete: () => void | Promise<void>;
  /** Button label */
  label: string;
  /** Hold duration in milliseconds (default: 1500ms) */
  holdDuration?: number;
  /** Variant style */
  variant?: "primary" | "destructive" | "warning";
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether an action is in progress */
  loading?: boolean;
  /** Additional class names */
  className?: string;
  /** Confirmation message shown during hold */
  confirmMessage?: string;
}

export function HoldToSign({
  onComplete,
  label,
  holdDuration = 1500,
  variant = "primary",
  disabled = false,
  loading = false,
  className,
  confirmMessage = "Hold to confirm",
}: HoldToSignProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const variantStyles = {
    primary: {
      base: "bg-primary text-primary-foreground",
      progress: "bg-primary-foreground/30",
      ring: "ring-primary/50",
    },
    destructive: {
      base: "bg-destructive text-destructive-foreground",
      progress: "bg-destructive-foreground/30",
      ring: "ring-destructive/50",
    },
    warning: {
      base: "bg-warning text-warning-foreground",
      progress: "bg-warning-foreground/30",
      ring: "ring-warning/50",
    },
  };

  const styles = variantStyles[variant];

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const handleStart = useCallback(() => {
    if (disabled || loading || isCompleted) return;

    setIsHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    // Update progress every 16ms (~60fps)
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);
    }, 16);

    // Complete after hold duration
    holdTimerRef.current = setTimeout(async () => {
      clearTimers();
      setIsHolding(false);
      setProgress(100);
      setIsCompleted(true);

      try {
        await onComplete();
      } finally {
        // Reset after a delay
        setTimeout(() => {
          setIsCompleted(false);
          setProgress(0);
        }, 500);
      }
    }, holdDuration);
  }, [disabled, loading, isCompleted, holdDuration, onComplete, clearTimers]);

  const handleEnd = useCallback(() => {
    if (!isHolding) return;

    clearTimers();
    setIsHolding(false);
    setProgress(0);
  }, [isHolding, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleStart();
      }
    },
    [handleStart]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        handleEnd();
      }
    },
    [handleEnd]
  );

  return (
    <button
      type="button"
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        "rounded-md text-sm font-medium",
        "h-10 px-6 py-2",
        "transition-all duration-200",
        "select-none",
        styles.base,
        isHolding && `ring-4 ${styles.ring}`,
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        isCompleted && "scale-95",
        className
      )}
    >
      {/* Progress fill */}
      <div
        className={cn(
          "absolute inset-0 origin-left",
          styles.progress,
          "transition-transform duration-75"
        )}
        style={{ transform: `scaleX(${progress / 100})` }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : isHolding ? (
          confirmMessage
        ) : isCompleted ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
            Done
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}

/**
 * Hook for hold-to-sign functionality in custom implementations.
 */
export function useHoldToSign(options: {
  holdDuration?: number;
  onComplete: () => void | Promise<void>;
}) {
  const { holdDuration = 1500, onComplete } = options;
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    holdTimerRef.current = null;
    progressIntervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    setIsHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / holdDuration) * 100, 100));
    }, 16);

    holdTimerRef.current = setTimeout(async () => {
      clearTimers();
      setIsHolding(false);
      setProgress(100);
      await onComplete();
      setTimeout(() => setProgress(0), 500);
    }, holdDuration);
  }, [holdDuration, onComplete, clearTimers]);

  const cancel = useCallback(() => {
    clearTimers();
    setIsHolding(false);
    setProgress(0);
  }, [clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { isHolding, progress, start, cancel };
}
