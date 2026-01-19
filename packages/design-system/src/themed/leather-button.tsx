"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { SurfaceNoise } from "../components/surface-noise";

export function LeatherButton({
  className,
  children,
  variant = "default",
  noiseStrength = 1,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost";
  noiseStrength?: number;
}) {
  const variantStyles = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 border border-border/30",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border/30",
    outline:
      "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    ghost: "text-foreground hover:bg-accent/50 border border-transparent",
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md",
        "px-4 py-2 text-sm font-medium shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <SurfaceNoise kind="button" strength={noiseStrength} />
      <span className="relative">{children}</span>
    </button>
  );
}
