import type { ThemeName } from './theme';

/**
 * Texture preset configuration for SVG noise effects.
 * These presets control the visual texture applied to different component types.
 */

/**
 * Component types that support texture effects.
 */
export type TextureKind = 'bg' | 'card' | 'button' | 'panel';

export const TEXTURE_PRESETS: Record<
  ThemeName,
  {
    bg: { baseFrequency: number; opacity: number; octaves: number };
    card: { baseFrequency: number; opacity: number; octaves: number };
    button: { baseFrequency: number; opacity: number; octaves: number };
    panel: { baseFrequency: number; opacity: number; octaves: number };
  }
> = {
  neutral: {
    bg: { baseFrequency: 0.85, opacity: 0.08, octaves: 3 },
    card: { baseFrequency: 0.75, opacity: 0.14, octaves: 3 },
    button: { baseFrequency: 0.85, opacity: 0.1, octaves: 2 },
    panel: { baseFrequency: 0.7, opacity: 0.12, octaves: 3 },
  },
  gray: {
    bg: { baseFrequency: 0.85, opacity: 0.07, octaves: 3 },
    card: { baseFrequency: 0.8, opacity: 0.12, octaves: 3 },
    button: { baseFrequency: 0.9, opacity: 0.09, octaves: 2 },
    panel: { baseFrequency: 0.78, opacity: 0.1, octaves: 3 },
  },
  stone: {
    bg: { baseFrequency: 0.7, opacity: 0.08, octaves: 3 },
    card: { baseFrequency: 0.65, opacity: 0.14, octaves: 3 },
    button: { baseFrequency: 0.75, opacity: 0.1, octaves: 2 },
    panel: { baseFrequency: 0.6, opacity: 0.12, octaves: 3 },
  },
  zinc: {
    bg: { baseFrequency: 0.9, opacity: 0.07, octaves: 3 },
    card: { baseFrequency: 0.85, opacity: 0.12, octaves: 3 },
    button: { baseFrequency: 0.92, opacity: 0.09, octaves: 2 },
    panel: { baseFrequency: 0.82, opacity: 0.1, octaves: 3 },
  },
  midnight: {
    bg: { baseFrequency: 0.95, opacity: 0.06, octaves: 3 },
    card: { baseFrequency: 0.9, opacity: 0.11, octaves: 3 },
    button: { baseFrequency: 1.0, opacity: 0.08, octaves: 2 },
    panel: { baseFrequency: 0.88, opacity: 0.1, octaves: 3 },
  },
  opulence: {
    bg: { baseFrequency: 0.75, opacity: 0.07, octaves: 3 },
    card: { baseFrequency: 0.7, opacity: 0.15, octaves: 3 },
    button: { baseFrequency: 0.8, opacity: 0.11, octaves: 2 },
    panel: { baseFrequency: 0.68, opacity: 0.13, octaves: 3 },
  },
  heirloom: {
    bg: { baseFrequency: 0.6, opacity: 0.08, octaves: 3 },
    card: { baseFrequency: 0.55, opacity: 0.16, octaves: 3 },
    button: { baseFrequency: 0.65, opacity: 0.12, octaves: 2 },
    panel: { baseFrequency: 0.52, opacity: 0.14, octaves: 3 },
  },
  slate: {
    bg: { baseFrequency: 0.82, opacity: 0.075, octaves: 3 },
    card: { baseFrequency: 0.77, opacity: 0.13, octaves: 3 },
    button: { baseFrequency: 0.87, opacity: 0.095, octaves: 2 },
    panel: { baseFrequency: 0.74, opacity: 0.11, octaves: 3 },
  },
  zenith: {
    bg: { baseFrequency: 0.88, opacity: 0.065, octaves: 3 },
    card: { baseFrequency: 0.83, opacity: 0.115, octaves: 3 },
    button: { baseFrequency: 0.93, opacity: 0.085, octaves: 2 },
    panel: { baseFrequency: 0.8, opacity: 0.105, octaves: 3 },
  },
};
