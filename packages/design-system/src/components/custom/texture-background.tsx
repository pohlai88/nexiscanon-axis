"use client";

import { SurfaceNoise } from "./surface-noise";

export function TextureBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <SurfaceNoise kind="bg" strength={1} className="rounded-none" />
    </div>
  );
}
