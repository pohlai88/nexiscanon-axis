# AFANDA Theme Integration Guide
## next-themes + AXIS Multi-Dimensional Theming

> **Version:** 1.0.0 | **Last Updated:** 2026-01-24
> **Status:** ✅ Fully Integrated

---

## 📋 Overview

AFANDA now features a comprehensive theme system that combines:
- **next-themes** for light/dark mode management
- **AXIS Design System** with 9 base themes, 5 style presets, 9 accent colors
- **Texture Effects** with per-theme SVG noise patterns
- **Glass Morphism** with backdrop blur and tint variants

---

## 🎨 Theme Architecture

### 1. Multi-Dimensional Theming

```
Theme Configuration = Base Theme + Style Preset + Accent Color + Dark Mode + Texture
```

#### Base Themes (9)

| Theme | Category | Description | Warmth | Contrast |
|-------|----------|-------------|--------|----------|
| **midnight** ⭐ | Premium | Electric ink, professional dashboard | Cold | Medium |
| neutral | Standard | Pure grayscale | Cold | Medium |
| gray | Standard | Cool blue-tinted gray | Cold | Medium |
| stone | Standard | Warm cream and charcoal | Warm | Medium |
| zinc | Standard | Purple-tinted modern gray | Cold | Medium |
| slate | Standard | Deep blue-gray, navy depths | Cold | Medium |
| opulence | Premium | Luxury gold and bronze accents | Warm | High |
| heirloom | Premium | Historic warmth with aged leather | Warm | High |
| zenith | Minimal | Modern minimal, content-first | Neutral | High |

#### Style Presets (5)

| Style | Description | Radius | Spacing | Best For |
|-------|-------------|--------|---------|----------|
| **mia** ⭐ | Soft, rounded | 1rem | Generous | Dashboards, cards |
| vega | Default balanced | 0.625rem | Standard | General purpose |
| nova | Sharp, minimal | 0 | Standard | Modern, clean |
| lyra | Compact, tight | 0.375rem | Tight | Dense data tables |
| mira | Pill-shaped | 9999px | Standard | Playful, consumer |

#### Accent Colors (9)

neutral, rose, orange, amber, emerald, cyan, blue, violet, fuchsia

---

## 🚀 Implementation

### File Structure

```
apps/afanda/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Theme initialization script
│   │   └── globals.css                   # Theme imports + AFANDA styles
│   └── components/
│       ├── providers.tsx                 # Root providers
│       ├── providers/
│       │   └── theme-provider.tsx        # Theme context + next-themes wrapper
│       └── widgets/
│           ├── theme-switcher.tsx        # Full theme customization UI
│           └── theme-toggle.tsx          # Quick light/dark toggle
└── DESIGN_SYSTEM_GUIDE.md                # Complete design system reference
```

### 1. Theme Provider Setup

**`src/components/providers/theme-provider.tsx`**

Integrates next-themes with AXIS theming:

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";

<ThemeProvider
  defaultBaseTheme="midnight"
  defaultStyle="mia"
  defaultAccent="neutral"
  defaultTextureEnabled={true}
>
  {children}
</ThemeProvider>
```

**Features:**
- Light/dark mode via next-themes
- Base theme persistence (localStorage)
- Style preset persistence
- Accent color persistence
- Texture effects toggle
- System theme detection

### 2. Root Layout Integration

**`src/app/layout.tsx`**

Prevents flash of unstyled content (FOUC):

```tsx
<html
  lang="en"
  data-theme="midnight"
  data-style="mia"
  suppressHydrationWarning
  className={inter.variable}
>
  <head>
    {/* Theme initialization script - runs before render */}
    <script dangerouslySetInnerHTML={{...}} />
  </head>
  <body>
    <Providers>{children}</Providers>
  </body>
</html>
```

**Initialization Script:**
- Reads theme from localStorage
- Applies dark class if needed
- Sets data-theme attribute
- Sets data-style attribute
- Sets data-accent attribute
- Sets data-texture attribute

### 3. Global Styles

**`src/app/globals.css`**

```css
/* Import design system globals (all 9 themes) */
@import "@workspace/design-system/styles/globals.css";

/* Import glass morphism effects */
@import "@workspace/design-system/styles/glass.css";

/* Texture effects integration */
[data-texture="enabled"] .afanda-widget::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,...");
  mix-blend-mode: overlay;
}
```

---

## 🎯 Usage

### 1. Theme Hooks

```tsx
import { useTheme, useThemeConfig } from "@/components/providers/theme-provider";

function MyComponent() {
  // Light/dark mode (from next-themes)
  const { theme, setTheme } = useTheme();
  
  // Extended theme config (AXIS)
  const {
    baseTheme,
    setBaseTheme,
    style,
    setStyle,
    accent,
    setAccent,
    textureEnabled,
    setTextureEnabled,
  } = useThemeConfig();
  
  return (
    <button onClick={() => setTheme("dark")}>
      Toggle Dark Mode
    </button>
  );
}
```

### 2. Theme Switcher Component

Full theme customization UI:

```tsx
import { ThemeSwitcher } from "@/components/widgets/theme-switcher";

function SettingsPage() {
  return (
    <div>
      <h1>Theme Settings</h1>
      <ThemeSwitcher />
    </div>
  );
}
```

**Features:**
- Light/dark/system mode toggle
- Base theme selection (9 themes)
- Style preset selection (5 styles)
- Accent color picker (9 colors)
- Texture effects toggle with preview

### 3. Quick Theme Toggle

Simple light/dark toggle button:

```tsx
import { ThemeToggle } from "@/components/widgets/theme-toggle";

function Header() {
  return (
    <header>
      <nav>...</nav>
      <ThemeToggle />
    </header>
  );
}
```

### 4. Programmatic Theme Changes

```tsx
import { applyThemeConfig } from "@workspace/design-system/tokens";

// Change base theme
applyThemeConfig({ base: "opulence" });

// Change style preset
applyThemeConfig({ style: "nova" });

// Change accent color
applyThemeConfig({ accent: "blue" });

// Change multiple at once
applyThemeConfig({
  base: "midnight",
  style: "mia",
  accent: "violet",
});
```

---

## 🎨 Styling with Themes

### 1. Semantic Color Tokens

Always use semantic tokens (not hardcoded colors):

```tsx
// ✅ CORRECT: Semantic tokens
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border"

// ❌ WRONG: Hardcoded colors
className="bg-blue-500 text-white"
className="text-gray-400"
```

### 2. Glass Effects

```tsx
// Base glass with theme-aware colors
<div className="glass glass-solid">

// Glass with grain texture (respects data-texture attribute)
<div className="glass glass-grain">

// Glass with semantic tint
<div className="glass glass-tint-primary">

// Contextual glass classes
<header className="glass-header">
<aside className="glass-sidebar">
<Card className="glass-card">
```

### 3. Texture Effects

Textures are automatically applied when `data-texture="enabled"`:

```tsx
// Texture applied automatically to AFANDA components
<div className="afanda-widget">
  {/* Texture overlay added via ::before pseudo-element */}
</div>

// Manual texture application
<div className="glass glass-grain">
  {/* Uses glass.css grain texture */}
</div>
```

### 4. Dark Mode Variants

```tsx
// Tailwind dark mode variants
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-white"

// CSS custom properties (auto-adapts to dark mode)
className="bg-background text-foreground"
```

---

## 📊 Theme Persistence

### Storage Keys

| Key | Value | Description |
|-----|-------|-------------|
| `theme` | `"light"` \| `"dark"` \| `"system"` | next-themes mode |
| `axis:base-theme` | `ThemeName` | Base color scale |
| `axis:style` | `StyleName` | Style preset |
| `axis:accent` | `AccentName` | Accent color |
| `afanda-texture-enabled` | `"true"` \| `"false"` | Texture effects |

### Default Values

```typescript
{
  theme: "system",              // Follow system preference
  baseTheme: "midnight",        // AFANDA default
  style: "mia",                 // Soft, rounded
  accent: "neutral",            // No accent overlay
  textureEnabled: true,         // Subtle grain texture
}
```

---

## 🔧 Advanced Customization

### 1. Custom Theme Textures

Per-theme texture configurations in `theme-textures.ts`:

```typescript
export const TEXTURE_PRESETS: Record<ThemeName, ThemeTextures> = {
  midnight: {
    bg: { baseFrequency: 0.95, opacity: 0.06, octaves: 3 },
    card: { baseFrequency: 0.9, opacity: 0.11, octaves: 3 },
    button: { baseFrequency: 1.0, opacity: 0.08, octaves: 2 },
    panel: { baseFrequency: 0.88, opacity: 0.1, octaves: 3 },
  },
  // ... other themes
};
```

### 2. Custom Accent Colors

Add new accent colors to `theme-config.ts`:

```typescript
export const ACCENT_SWATCHES: Record<AccentName, string> = {
  neutral: "oklch(0.45 0 0)",
  rose: "oklch(0.65 0.22 350)",
  // Add custom accent
  custom: "oklch(0.60 0.20 180)",
};
```

### 3. CSS Variable Access

```tsx
import { getCSSVariable, setCSSVariable } from "@workspace/design-system/tokens";

// Read current value
const primaryColor = getCSSVariable("--primary");

// Set custom value
setCSSVariable("--primary", "oklch(0.5 0.2 260)");
```

---

## 🧪 Testing Theme Changes

### 1. Manual Testing

```tsx
// Test all themes
THEME_NAMES.forEach(theme => {
  applyThemeConfig({ base: theme });
  // Verify colors, contrast, readability
});

// Test light/dark mode
setTheme("light");
setTheme("dark");

// Test texture effects
setTextureEnabled(true);
setTextureEnabled(false);
```

### 2. Visual Regression

Use ThemeSwitcher component to cycle through all combinations:
- 9 base themes × 2 modes = 18 theme variants
- 5 style presets
- 9 accent colors
- 2 texture states (on/off)

---

## 📚 References

### Internal Documentation
- [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) - Complete design system reference
- [B11-AFANDA.md](../../.cursor/ERP/B11-AFANDA.md) - AFANDA architecture
- [E02-08-THEME-ADVANCED.md](../../.cursor/ERP/E02-08-THEME-ADVANCED.md) - Advanced theming
- [E02-07-THEME-GLASS.md](../../.cursor/ERP/E02-07-THEME-GLASS.md) - Glass morphism

### Design System Files
- `packages/design-system/src/styles/globals.css` - All theme CSS variables
- `packages/design-system/src/styles/glass.css` - Glass morphism utilities
- `packages/design-system/src/tokens/theme-config.ts` - Theme configuration
- `packages/design-system/src/tokens/theme-textures.ts` - Texture presets

### External Resources
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

## ✅ Checklist

- [x] next-themes integrated
- [x] 9 base themes configured
- [x] 5 style presets configured
- [x] 9 accent colors configured
- [x] Texture effects system
- [x] Glass morphism utilities
- [x] Theme persistence (localStorage)
- [x] FOUC prevention script
- [x] ThemeProvider component
- [x] ThemeSwitcher UI component
- [x] ThemeToggle button component
- [x] Documentation complete

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | ✅ Implementation Complete |
| **Version** | 1.0.0 |
| **Author** | AXIS Architecture Team |
| **Created** | 2026-01-24 |
| **Last Updated** | 2026-01-24 |
