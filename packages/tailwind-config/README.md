# @workspace/tailwind-config

> **Tailwind CSS v4 Infrastructure Layer**
>
> Shared Tailwind CSS and PostCSS configuration for the monorepo.

---

## Architecture Position

```
┌────────────────────────────────────────────┐
│  @workspace/tailwind-config (THIS PACKAGE) │
│  Base Tailwind CSS + PostCSS config        │
│                                            │
│  shared-styles.css: @import "tailwindcss"  │
│  postcss.config.js: exports postcssConfig  │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│  @workspace/design-system                  │
│  @import "@workspace/tailwind-config"      │
│  + themes, tokens, components              │
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
           (postcss.config.mjs imports
            from tailwind-config/postcss)
```

## Purpose

| Principle | Description |
|-----------|-------------|
| **Single Source** | One place for Tailwind/PostCSS config |
| **Turborepo Pattern** | Follows official with-tailwind example |
| **Tailwind v4** | Config-less CSS-based setup |
| **Internal Package** | Shared across all packages and apps |

## Structure

```
packages/tailwind-config/
├── package.json
├── shared-styles.css   # Exports base @import "tailwindcss"
├── postcss.config.js   # Exports postcssConfig
└── README.md
```

## Exports

```json
{
  "exports": {
    ".": "./shared-styles.css",
    "./postcss": "./postcss.config.js"
  }
}
```

## Usage

### In Packages (design-system)

```css
/* packages/design-system/src/styles/globals.css */
@import "@workspace/tailwind-config";
@import "tw-animate-css";

@theme inline {
  /* Theme configuration in CSS (Tailwind v4 pattern) */
}
```

### In Apps (web, docs)

**postcss.config.mjs:**
```js
import { postcssConfig } from "@workspace/tailwind-config/postcss";

export default postcssConfig;
```

**package.json:**
```json
{
  "dependencies": {
    "@workspace/tailwind-config": "workspace:*"
  }
}
```

## PostCSS Plugins

```js
// postcss.config.js
export const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-nesting": {},
  },
};
```

## Tailwind v4 Pattern

This package follows the **config-less Tailwind v4 pattern**:

- No `tailwind.config.js` needed
- Configuration done in CSS via `@theme` directive
- Base styles via `@import "tailwindcss"`
- PostCSS handles processing

```css
/* Tailwind v4: CSS-based configuration */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.5 0.2 250);
  --radius-lg: 0.5rem;
}
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.1.5 | Tailwind CSS v4 |
| `@tailwindcss/postcss` | ^4.1.5 | PostCSS plugin |
| `postcss` | ^8.5.3 | CSS processor |
| `postcss-nesting` | ^14.0.0 | CSS nesting support |

## Related Documentation

- [Turborepo Tailwind Guide](https://turborepo.dev/docs/guides/tools/tailwind)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- **Design System:** `packages/design-system/README.md`
- **Shared UI:** `apps/_shared/README.md`

---

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/PostCSS-8.x-DD3A0A?style=flat-square&logo=postcss&logoColor=white" alt="PostCSS" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

<p align="center">
  <strong>Based on</strong> <a href="https://github.com/vercel/turborepo/tree/main/examples/with-tailwind">Turborepo with-tailwind example</a>
</p>
