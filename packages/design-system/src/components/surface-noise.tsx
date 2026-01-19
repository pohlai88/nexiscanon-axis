"use client";

import * as React from "react";
import type { TextureKind } from "../tokens/theme-textures";
import { TEXTURE_PRESETS } from "../tokens/theme-textures";
import { useThemeName } from "../hooks/use-theme-name";

function svgNoiseDataUri(baseFrequency: number, octaves: number, seed: number) {
  const svg = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
</svg>`.trim();

  // Encode for data URI
  const encoded = encodeURIComponent(svg)
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/");

  return `url("data:image/svg+xml,${encoded}")`;
}

export function SurfaceNoise({
  kind = "card",
  className,
  strength = 1,
  seed = 7,
  sizePx,
}: {
  kind?: TextureKind;
  className?: string;
  /** Multiplies theme preset opacity */
  strength?: number;
  /** Keep stable so it doesn't "swim" */
  seed?: number;
  /** Override backgroundSize in px */
  sizePx?: number;
}) {
  const theme = useThemeName();
  const preset = TEXTURE_PRESETS[theme][kind];

  const opacity = Math.max(0, Math.min(1, preset.opacity * strength));
  const bgSize = sizePx ?? (kind === "bg" ? 140 : kind === "button" ? 110 : 96);

  const blend = kind === "bg" ? "mix-blend-soft-light" : "mix-blend-overlay";

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        blend,
        className ?? "",
      ].join(" ")}
      style={{
        opacity,
        backgroundImage: svgNoiseDataUri(preset.baseFrequency, preset.octaves, seed),
        backgroundSize: `${bgSize}px ${bgSize}px`,
      }}
    />
  );
}
