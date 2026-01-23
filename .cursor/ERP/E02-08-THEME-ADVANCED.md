# E02-08: Advanced Theme System (Tailwind v4)

> Status: **Active** | Priority: **HIGH**
> Architecture: **Multi-dimensional Theming** | Tailwind: **v4**

---

## Overview

A comprehensive theming system built on **Tailwind v4** that provides **9 base themes**, **5 style presets**, **9 accent colors**, **4 fonts**, and **per-component texture presets**.

**Architecture:**

```
Theme = Base × Style × Accent × Font × Menu × Texture
         ↓       ↓       ↓       ↓      ↓       ↓
       9 opts  5 opts  9 opts  4 opts 2×3 opts  per-component
```

---

## Tailwind v4 Features Used

### 1. `@theme inline` Directive

Maps CSS custom properties to Tailwind utility classes:

```css
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --radius-lg: var(--radius);
}
```

**Result:** Enables `bg-background`, `text-primary`, `rounded-lg` utilities.

### 2. `@custom-variant` for Dark Mode

```css
@custom-variant dark (&:is(.dark *));
```

**Enables:** Class-based dark mode via `<html class="dark">`.

### 3. OKLCH Color Space

All colors use OKLCH for perceptually uniform transitions:

```css
--primary: oklch(0.205 0 0);        /* Lightness, Chroma, Hue */
--ring: oklch(0.72 0.13 255);       /* Electric blue ring */
--border: oklch(1 0 0 / 10%);       /* With alpha */
```

**Benefits:**
- Consistent perceived brightness across hues
- Smooth gradients and animations
- Better accessibility contrast calculations

### 4. `@layer base` for Defaults

```css
@layer base {
  :root { color-scheme: light; }
  .dark { color-scheme: dark; }
  
  * { @apply border-border outline-ring/50; }
  html { @apply font-sans; }
  body { @apply bg-background text-foreground antialiased; }
}
```

---

## File Structure

```
packages/design-system/src/
├── styles/
│   ├── globals.css              ← Tailwind v4 + 9 theme overrides
│   ├── glass.css                ← Glass utilities (E02-07)
│   └── styles/
│       ├── index.css            ← Style imports
│       ├── vega.css             ← Default balanced
│       ├── nova.css             ← Sharp, minimal
│       ├── mia.css              ← Soft, rounded
│       ├── lyra.css             ← Compact, tight
│       └── mira.css             ← Pill-shaped, glow
├── tokens/
│   ├── index.ts                 ← Exports
│   ├── theme-config.ts          ← Type definitions & constants
│   └── theme-textures.ts        ← Per-component texture presets
└── providers/
    └── theme-provider.tsx       ← Already exists
```

---

## Base Themes (9 total)

| Theme | Character | Light | Dark |
|-------|-----------|-------|------|
| **neutral** | Pure grayscale | Clean white | Neutral black |
| **gray** | Blue-tinted gray | Cool paper | Blue-gray depths |
| **stone** | Warm gray | Cream tones | Warm charcoal |
| **zinc** | Purple-tinted | Crisp white | Purple-black |
| **slate** | Deep blue-gray | Soft blue-white | Navy depths |
| **midnight** | Electric ink | Cool paper | Deep ink + electric ring |
| **opulence** | Luxury gold | Alabaster + bronze | Obsidian + gilded gold |
| **heirloom** | Historic warmth | Vellum + aged leather | Dark walnut + gold leaf |
| **zenith** | Modern minimal | Pure white + ink | Onyx + pure white |

### Usage

```html
<!-- Set on html element -->
<html data-theme="opulence" class="dark">
```

```tsx
// Programmatic
document.documentElement.setAttribute('data-theme', 'midnight')

// With helper
import { applyThemeConfig } from "@workspace/design-system"
applyThemeConfig({ base: "opulence", style: "mia" })
```

---

## Style Presets (5 total)

| Style | Radius | Shadows | Character |
|-------|--------|---------|-----------|
| **vega** | 0.625rem | Subtle | Default balanced |
| **nova** | 0 | Borders only | Sharp, minimal |
| **mia** | 1rem | Soft diffuse | Friendly, rounded |
| **lyra** | 0.375rem | Tight | Compact density |
| **mira** | 9999px | Glow | Pill-shaped, energetic |

```html
<html data-theme="opulence" data-style="mia">
```

---

## Accent Colors (9 total)

| Accent | OKLCH (L C H) | Character |
|--------|---------------|-----------|
| neutral | `0.45 0 0` | Grayscale |
| rose | `0.65 0.22 350` | Warm pink |
| orange | `0.70 0.18 45` | Energetic |
| amber | `0.75 0.18 75` | Golden |
| emerald | `0.60 0.17 160` | Natural |
| cyan | `0.65 0.15 195` | Cool tech |
| blue | `0.55 0.22 260` | Trust |
| violet | `0.55 0.22 290` | Creative |
| fuchsia | `0.60 0.24 320` | Bold |

---

## Tailwind v4 Theme Mapping

The `@theme inline` block maps CSS variables to Tailwind utilities:

```css
@theme inline {
  /* Breakpoints */
  --breakpoint-3xl: 1600px;
  --breakpoint-4xl: 2000px;

  /* Typography */
  --font-sans: "Inter Variable", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, ...;

  /* Colors → Tailwind utilities */
  --color-background: var(--background);      /* bg-background */
  --color-foreground: var(--foreground);      /* text-foreground */
  --color-primary: var(--primary);            /* bg-primary, text-primary */
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-destructive: var(--destructive);
  --color-border: var(--border);              /* border-border */
  --color-input: var(--input);
  --color-ring: var(--ring);                  /* ring-ring */
  
  /* Charts */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  
  /* Sidebar */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Radius (computed from --radius) */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}
```

---

## Texture Presets (Per-Component)

Each theme has optimized SVG noise settings:

| Component | baseFrequency | opacity | octaves |
|-----------|--------------|---------|---------|
| `bg` | 0.65-0.95 | 0.06-0.08 | 3 |
| `card` | 0.55-0.90 | 0.11-0.16 | 3 |
| `button` | 0.65-1.00 | 0.08-0.12 | 2 |
| `panel` | 0.52-0.88 | 0.10-0.14 | 3 |

```tsx
import { TEXTURE_PRESETS, getTextureConfig } from "@workspace/design-system"

const cardTexture = getTextureConfig("opulence", "card")
// { baseFrequency: 0.70, opacity: 0.15, octaves: 3 }
```

---

## Theme Configuration Types

```typescript
import type {
  ThemeName,      // "neutral" | "gray" | ... | "zenith"
  StyleName,      // "vega" | "nova" | "mia" | "lyra" | "mira"
  AccentName,     // "neutral" | "rose" | ... | "fuchsia"
  FontName,       // "inter" | "noto" | "nunito" | "figtree"
  MenuColorName,  // "default" | "inverted"
  MenuAccentName, // "subtle" | "bold" | "minimal"
  ThemeConfig,    // Combined configuration
} from "@workspace/design-system"
```

---

## API Reference

### Constants

```typescript
import {
  // Theme arrays (as const for type inference)
  THEME_NAMES,        // readonly ["neutral", "gray", ...]
  STYLE_NAMES,        // readonly ["vega", "nova", ...]
  ACCENT_NAMES,       // readonly ["neutral", "rose", ...]
  FONT_NAMES,         // readonly ["inter", "noto", ...]
  
  // Labels & descriptions
  THEME_LABELS,       // { neutral: "Neutral", ... }
  THEME_DESCRIPTIONS, // { neutral: "Pure grayscale...", ... }
  THEME_METADATA,     // Full metadata with warmth, contrast, category
  
  // Style configuration
  STYLE_RADIUS,       // { vega: "0.625rem", nova: "0", ... }
  
  // Colors (OKLCH)
  ACCENT_SWATCHES,    // { neutral: "oklch(0.45 0 0)", ... }
  
  // Fonts
  FONT_FAMILIES,      // CSS font-family strings
  FONT_PACKAGES,      // NPM package names
  
  // Defaults
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEYS,
  
  // Texture
  TEXTURE_PRESETS,    // Per-theme, per-component textures
  TEXTURE_CSS_VARS,   // CSS variable names
  TEXTURE_CLASSES,    // CSS class names
} from "@workspace/design-system"
```

### Functions

```typescript
import {
  // Theme application
  applyThemeConfig,     // Apply partial config to document
  loadThemeConfig,      // Load from localStorage
  resetThemeConfig,     // Reset to defaults
  
  // Dark mode
  toggleDarkMode,       // Toggle/set dark mode
  isDarkMode,           // Check if dark mode active
  getSystemColorScheme, // Get OS preference
  
  // CSS variables
  getCSSVariable,       // Read computed CSS variable
  setCSSVariable,       // Set CSS variable on root
  generateThemeCSS,     // Generate CSS string for config
  
  // Texture helpers
  generateNoisePattern,    // Generate SVG data URL
  generateTextureCSS,      // Generate CSS variables for theme
  getTextureConfig,        // Get texture config for component
  applyTexture,            // Apply texture to element
  createTextureStyle,      // Create React style object
  getAllTextureConfigs,    // Get all textures for theme
  interpolateTextureConfig, // Animate between configs
} from "@workspace/design-system"
```

### Usage Examples

```typescript
// Apply theme
applyThemeConfig({ base: "opulence", style: "mia" })

// Toggle dark mode
toggleDarkMode()           // Toggle
toggleDarkMode(true)       // Force dark
toggleDarkMode(false)      // Force light

// Check system preference
if (getSystemColorScheme() === "dark") {
  toggleDarkMode(true)
}

// Read/write CSS variables
const primary = getCSSVariable("--primary")
setCSSVariable("--radius", "1rem")

// Generate theme preview CSS
const css = generateThemeCSS({ style: "mia", font: "figtree" })

// Texture for inline styles
<Card style={createTextureStyle("opulence", "card")}>
```

---

## Implementation Checklist

### Phase 1: Core Theme System ✅
- [x] E02-07: Glass Theme Layer (CSS utilities + components)

### Phase 2: Advanced Themes ✅
- [x] `tokens/theme-config.ts` - Type definitions and constants
- [x] `tokens/theme-textures.ts` - Per-component texture presets
- [x] `styles/globals.css` - Tailwind v4 + 9 theme overrides
- [x] `styles/styles/*.css` - 5 style presets
- [x] Integration with Glass Theme textures

### Phase 3: ERP Blocks (Next)
- [ ] `ExceptionFirstMode` - Hide normal rows, show exceptions
- [ ] `AuditableField` - Field-level audit on hover
- [ ] `MagicApprovalTable` - Multi-tenant approval workflows
- [ ] `DataFortress` - Enterprise data table

---

## Theme Comparison Chart

| Feature | neutral | opulence | midnight | zenith |
|---------|---------|----------|----------|--------|
| Warmth | Cold | Warm | Cold | Neutral |
| Contrast | Medium | High | Medium | High |
| Ring (OKLCH) | `0.708 0 0` | `0.75 0.10 85` | `0.72 0.13 255` | `0.18 0 0` |
| Character | Professional | Luxury | Tech | Minimal |
| Best for | General | Premium | Dashboard | Content |

---

## Dark Mode Implementation

Tailwind v4 uses class-based dark mode:

```css
/* Custom variant registration */
@custom-variant dark (&:is(.dark *));

/* Theme variables react automatically */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);  /* Semi-transparent white */
}
```

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark')

// With next-themes
import { useTheme } from "next-themes"
const { theme, setTheme } = useTheme()
```

---

## CSS Variable Reference

```css
/* Surfaces */
--background          /* Page background */
--foreground          /* Default text */
--card                /* Card backgrounds */
--card-foreground     /* Card text */
--popover             /* Dropdown/popover backgrounds */
--popover-foreground  /* Dropdown text */

/* Primary actions */
--primary             /* Primary button/link */
--primary-foreground  /* Text on primary */
--secondary           /* Secondary surfaces */
--secondary-foreground

/* States */
--muted               /* Muted backgrounds */
--muted-foreground    /* Muted text */
--accent              /* Hover/selected states */
--accent-foreground
--destructive         /* Error/delete actions */
--destructive-foreground

/* Borders & focus */
--border              /* Default borders */
--input               /* Input borders */
--ring                /* Focus ring color */

/* Charts (1-5) */
--chart-1 through --chart-5

/* Sidebar */
--sidebar, --sidebar-foreground
--sidebar-primary, --sidebar-primary-foreground
--sidebar-accent, --sidebar-accent-foreground
--sidebar-border, --sidebar-ring

/* Layout */
--radius              /* Base border radius */
```

---

## References

- [E02-07: Glass Theme Layer](./E02-07-THEME-GLASS.md)
- [Tailwind v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [OKLCH Color Space](https://oklch.com/)
- [OKLCH Picker](https://oklch.com/#70,0.1,200,100)
