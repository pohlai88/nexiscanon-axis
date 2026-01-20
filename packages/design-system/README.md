# @workspace/design-system

> **Core Design System**
>
> Tokens, themes, and base UI components built on shadcn/ui principles with Tailwind CSS v4.

---

> [!CAUTION]
> **DESIGN SYSTEM FROZEN + SEALED**
>
> | Status | Details |
> |--------|---------|
> | Package | `@workspace/design-system` |
> | Freeze Level | **Hard Freeze (No Drift Allowed)** |
> | Effective | 2026-01-20 |
>
> **Allowed:**
> - Bug fixes (runtime, variants, broken exports)
> - Security fixes
> - Performance fixes
> - Documentation updates
>
> **Forbidden:**
> - Token renames / theme variable remaps (`--background`, `--primary`, etc.)
> - Deep imports into `src/**` from apps
> - New styling systems / new architecture patterns
> - Apps overriding design-system theme variables
>
> **Required checks before merging any DS change:**
> ```bash
> pnpm check-types && pnpm lint && pnpm validate:architecture
> ```

---

## Architecture Position

```
┌────────────────────────────────────────────┐
│  @workspace/tailwind-config                │
│  Base Tailwind CSS + PostCSS config        │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│  @workspace/design-system  (THIS PACKAGE)  │
│  Tokens + Themes + Base Components         │
│                                            │
│  globals.css:                              │
│    @import "@workspace/tailwind-config"    │
│    @import "tw-animate-css"                │
│    CSS variables (:root, .dark, themes)    │
│    @theme inline { color mappings }        │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│  @workspace/shared-ui                      │
│  App-level shared components               │
└────────────────────────────────────────────┘
                    │
               ┌────┴────┐
               ▼         ▼
           apps/web   apps/docs
```

## Installation

```bash
pnpm add @workspace/design-system
```

## Usage

### Import Styles

```tsx
// In your app's root layout
import "@workspace/design-system/styles/globals.css";
```

### Import Components

```tsx
import { Button, Card, Input } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";
```

### Theme Provider

```tsx
import { ThemeProvider } from "@workspace/design-system/providers";

export default function RootLayout({ children }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}
```

## Structure

```
packages/design-system/
├── package.json
├── src/
│   ├── components/     # UI primitives (Button, Card, Dialog, etc.)
│   ├── hooks/          # React hooks (use-theme, use-mobile, etc.)
│   ├── lib/            # Utilities (cn, formatters, etc.)
│   ├── providers/      # Context providers (ThemeProvider)
│   ├── styles/
│   │   ├── globals.css       # Main stylesheet (imports tailwind-config)
│   │   ├── themes/           # Base color themes
│   │   ├── accents/          # Accent color overlays
│   │   ├── styles/           # Visual style presets
│   │   ├── fonts/            # Font family overrides
│   │   └── menu/             # Sidebar variants
│   └── tokens/
│       ├── theme.ts          # Base theme types
│       ├── theme-config.ts   # Advanced config
│       └── theme-textures.ts # SVG noise textures
└── tsconfig.json
```

## Exports

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts",
    "./providers": "./src/providers/index.ts",
    "./styles/globals.css": "./src/styles/globals.css"
  }
}
```

## Theming System

### Multi-Dimensional Theming

The design system supports 6 independent theming dimensions:

| Dimension | Attribute | Options |
|-----------|-----------|---------|
| Base Theme | `data-theme` | neutral, gray, slate, stone, zinc, midnight, opulence, heirloom, zenith |
| Style | `data-style` | vega, nova, mia, lyra, mira |
| Accent | `data-accent` | neutral, rose, orange, amber, emerald, cyan, blue, violet, fuchsia |
| Font | `data-font` | inter, noto, nunito, figtree |
| Menu Color | `data-menu-color` | default, inverted |
| Menu Accent | `data-menu-accent` | subtle, bold, minimal |

### CSS Variables

All components use semantic CSS variables:

```css
/* Core */
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring

/* Sidebar */
--sidebar, --sidebar-foreground
--sidebar-primary, --sidebar-primary-foreground
--sidebar-accent, --sidebar-accent-foreground
--sidebar-border, --sidebar-ring

/* Charts */
--chart-1, --chart-2, --chart-3, --chart-4, --chart-5
```

### Tailwind v4 Theme Mapping

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... maps CSS vars to Tailwind utilities */
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@workspace/tailwind-config` | Base Tailwind CSS + PostCSS |
| `tw-animate-css` | Animation utilities |
| `class-variance-authority` | Component variants |
| `tailwind-merge` | Class merging |

## Scripts

```bash
pnpm lint          # Run ESLint
pnpm check-types   # Run TypeScript type checking
```

## Related Documentation

- **Cursor Rules:** `.cursor/rules/design-system.delta.mdc`
- **Architecture Validation:** `pnpm validate:architecture`
- **Tailwind Config:** `packages/tailwind-config/README.md`

---

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=flat-square" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/OKLCH-Colors-8B5CF6?style=flat-square" alt="OKLCH Colors" />
</p>

<p align="center">
  <strong>Built with</strong> <a href="https://ui.shadcn.com">shadcn/ui</a> · <a href="https://tailwindcss.com">Tailwind CSS v4</a> · <a href="https://turborepo.dev">Turborepo</a>
</p>
