/**
 * Theme token definitions following shadcn/ui best practices.
 * These types represent the semantic color tokens used throughout the design system.
 *
 * @see {@link https://ui.shadcn.com/docs/theming} shadcn/ui theming documentation
 */

/**
 * Base color theme names.
 * These correspond to the `data-theme` attribute values.
 */
export type ThemeName =
  | 'neutral'
  | 'gray'
  | 'stone'
  | 'slate'
  | 'zinc'
  | 'midnight'
  | 'opulence'
  | 'heirloom'
  | 'zenith';

/**
 * Array of all valid theme names.
 * Used for validation and iteration.
 */
export const THEME_NAMES: readonly ThemeName[] = [
  'neutral',
  'gray',
  'stone',
  'slate',
  'zinc',
  'midnight',
  'opulence',
  'heirloom',
  'zenith',
] as const;

/**
 * Human-readable labels for theme names.
 * Used in UI components like theme switchers.
 */
export const THEME_LABELS: Record<ThemeName, string> = {
  neutral: 'Neutral',
  gray: 'Gray',
  stone: 'Stone',
  slate: 'Slate',
  zinc: 'Zinc',
  midnight: 'Midnight',
  opulence: 'Opulence',
  heirloom: 'Heirloom',
  zenith: 'Zenith',
} as const;

/**
 * Semantic color token names matching CSS variable names.
 * These correspond to the CSS custom properties defined in globals.css.
 *
 * @example
 * ```css
 * :root {
 *   --background: oklch(1 0 0);
 *   --foreground: oklch(0.145 0 0);
 * }
 * ```
 */
export type ThemeColorToken =
  | 'background'
  | 'foreground'
  | 'card'
  | 'card-foreground'
  | 'popover'
  | 'popover-foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'border'
  | 'input'
  | 'ring'
  | 'sidebar'
  | 'sidebar-foreground'
  | 'sidebar-primary'
  | 'sidebar-primary-foreground'
  | 'sidebar-accent'
  | 'sidebar-accent-foreground'
  | 'sidebar-border'
  | 'sidebar-ring'
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'
  | 'radius';

/**
 * Type-safe mapping of theme color tokens to their CSS variable names.
 * Useful for programmatic access to CSS variables.
 */
export const THEME_COLOR_TOKENS: Record<ThemeColorToken, string> = {
  background: 'background',
  foreground: 'foreground',
  card: 'card',
  'card-foreground': 'card-foreground',
  popover: 'popover',
  'popover-foreground': 'popover-foreground',
  primary: 'primary',
  'primary-foreground': 'primary-foreground',
  secondary: 'secondary',
  'secondary-foreground': 'secondary-foreground',
  muted: 'muted',
  'muted-foreground': 'muted-foreground',
  accent: 'accent',
  'accent-foreground': 'accent-foreground',
  destructive: 'destructive',
  'destructive-foreground': 'destructive-foreground',
  border: 'border',
  input: 'input',
  ring: 'ring',
  sidebar: 'sidebar',
  'sidebar-foreground': 'sidebar-foreground',
  'sidebar-primary': 'sidebar-primary',
  'sidebar-primary-foreground': 'sidebar-primary-foreground',
  'sidebar-accent': 'sidebar-accent',
  'sidebar-accent-foreground': 'sidebar-accent-foreground',
  'sidebar-border': 'sidebar-border',
  'sidebar-ring': 'sidebar-ring',
  'chart-1': 'chart-1',
  'chart-2': 'chart-2',
  'chart-3': 'chart-3',
  'chart-4': 'chart-4',
  'chart-5': 'chart-5',
  radius: 'radius',
} as const;

/**
 * Legacy type for theme colors (camelCase format).
 * @deprecated Use ThemeColorToken type instead for better alignment with CSS variables.
 * This type is kept for backward compatibility.
 */
export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
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
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  radius: string;
};

/**
 * Legacy theme type.
 * @deprecated This type is kept for backward compatibility but is not actively used.
 * Theme colors are managed via CSS variables, not JavaScript objects.
 */
export type Theme = {
  name: ThemeName;
  colors: ThemeColors;
};
