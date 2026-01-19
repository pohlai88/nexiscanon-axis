// lib/theme.ts
export type ThemeName = "neutral" | "gray" | "stone" | "zinc" | "midnight" | "opulence" | "heirloom";

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  destructive: string;
  destructiveForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
};

export type Theme = {
  name: ThemeName;
  colors: ThemeColors;
};

export const THEME_NAMES: ThemeName[] = ["neutral", "gray", "stone", "zinc", "midnight", "opulence", "heirloom"];

export const THEME_LABELS: Record<ThemeName, string> = {
  neutral: "Neutral",
  gray: "Gray",
  stone: "Stone",
  zinc: "Zinc",
  midnight: "Midnight",
  opulence: "Opulence",
  heirloom: "Heirloom",
};
