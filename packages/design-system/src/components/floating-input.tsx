"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function FloatingInput({
  className,
  label,
  error,
  type,
  ref,
  ...props
}: FloatingInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value !== "");
    props.onBlur?.(e);
  };

  const isActive = isFocused || hasValue || props.value || props.defaultValue;

  return (
    <div className="relative">
      <motion.div
        className="relative"
        initial={false}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          type={type}
          className={cn(
            "peer h-12 w-full rounded-lg border border-border/50 bg-background/50 px-4 pt-5 pb-1 text-sm backdrop-blur-sm transition-all",
            "placeholder-transparent",
            "focus:border-primary/50 focus:bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "hover:border-border hover:bg-background/60",
            error &&
              "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={label}
          {...props}
        />

        <motion.label
          className={cn(
            "pointer-events-none absolute left-4 top-3 origin-left text-sm text-muted-foreground transition-all",
            "peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary",
            error && "peer-focus:text-destructive"
          )}
          initial={false}
          animate={{
            top: isActive ? "0.375rem" : "0.75rem",
            fontSize: isActive ? "0.75rem" : "0.875rem",
            color: isFocused
              ? error
                ? "var(--destructive)"
                : "var(--primary)"
              : "var(--muted-foreground)",
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>

        {/* Animated underline */}
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-primary",
            error && "bg-destructive"
          )}
          initial={{ width: "0%", left: "50%" }}
          animate={{
            width: isFocused ? "100%" : "0%",
            left: isFocused ? "0%" : "50%",
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}

      {/* Focus glow */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-lg bg-primary/5 blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
  );
}

export { FloatingInput };
