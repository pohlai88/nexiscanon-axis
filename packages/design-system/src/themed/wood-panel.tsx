import * as React from "react";
import { cn } from "../lib/utils";
import { SurfaceNoise } from "../components/surface-noise";

export function WoodPanel({
  className,
  children,
  noiseStrength = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { noiseStrength?: number }) {
  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-xl border bg-sidebar text-sidebar-foreground",
        className
      )}
      {...props}
    >
      <SurfaceNoise kind="panel" strength={noiseStrength} />
      <div className="relative">{children}</div>
    </aside>
  );
}
