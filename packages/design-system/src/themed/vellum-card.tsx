import * as React from "react";
import { cn } from "../lib/utils";
import { SurfaceNoise } from "../components/surface-noise";

export function VellumCard({
  className,
  children,
  noiseStrength = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { noiseStrength?: number }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      <SurfaceNoise kind="card" strength={noiseStrength} />
      <div className="relative">{children}</div>
    </div>
  );
}
