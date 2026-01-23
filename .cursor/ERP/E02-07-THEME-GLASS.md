# E02-07: Glass Theme Layer

> Status: **Active** | Priority: **MEDIUM**
> Concept: **Theme-based "Cloth" Layer** | Architecture: **CSS-first + Component**

---

## Overview

A composable glass theme system that works like a "cloth" layer - any component can "wear" the effect through utility classes or wrapper components. This replaces per-component glass effects with a unified, themeable approach.

**Philosophy:**
- CSS utilities for simple cases (90% of usage)
- Components for complex/animated effects
- Semantic tokens for consistency with design system
- Performance-first: GPU-accelerated, minimal DOM

---

## Architecture

```
packages/design-system/src/
├── styles/
│   └── glass.css              ← Theme variables + utility classes
└── effects/
    └── grain-overlay.tsx      ← Component for complex grain effects
```

**Integration:** Import `glass.css` in your app's CSS entry point:

```css
/* app/globals.css or similar */
@import "@workspace/design-system/styles/glass.css";
```

---

## Quick Start

### CSS Utilities (Recommended)

```tsx
// Any component can "wear" glass
<Card className="glass">Content</Card>

// With grain texture
<Card className="glass glass-grain">Content</Card>

// Full preset
<Card className="glass-card">Content</Card>
```

### Component Approach

```tsx
import { GlassSurface, GrainOverlay } from "@workspace/design-system/effects"

// Full control
<GlassSurface blur="lg" grain tint="primary">
  <Card>...</Card>
</GlassSurface>

// Animated grain
<GrainOverlay animated intensity="medium">
  <div>Dynamic texture</div>
</GrainOverlay>
```

---

## CSS Utility Classes

### Base Glass

| Class | Description |
|-------|-------------|
| `glass` | Base glass effect (blur + transparency + border) |
| `glass-solid` | More opaque (85% light, 75% dark) |
| `glass-subtle` | More transparent (50% light, 40% dark) |
| `glass-ethereal` | Very transparent (30% light, 25% dark) |

### Grain Texture

| Class | Description |
|-------|-------------|
| `glass-grain` | Add grain overlay (medium intensity) |
| `glass-grain-subtle` | Subtle grain (2% opacity) |
| `glass-grain-medium` | Medium grain (4% opacity) |
| `glass-grain-heavy` | Heavy grain (8% opacity) |

### Blur Intensity

| Class | Blur Amount |
|-------|-------------|
| `glass-blur-none` | 0px |
| `glass-blur-sm` | 8px |
| `glass-blur-md` | 12px (default) |
| `glass-blur-lg` | 20px |
| `glass-blur-xl` | 32px |

### Tint Colors (Semantic)

| Class | Effect |
|-------|--------|
| `glass-tint-primary` | Primary color tint |
| `glass-tint-secondary` | Secondary color tint |
| `glass-tint-accent` | Accent color tint |
| `glass-tint-destructive` | Destructive color tint |
| `glass-tint-muted` | Muted color tint |

### Shadow

| Class | Effect |
|-------|--------|
| `glass-shadow` | Standard glass shadow |
| `glass-shadow-lg` | Large glass shadow |
| `glass-shadow-none` | No shadow |

### Border

| Class | Effect |
|-------|--------|
| `glass-border-none` | No border |
| `glass-border-subtle` | Subtle border (8% opacity) |
| `glass-border-strong` | Strong border (25% opacity) |

### Interactive States

| Class | Effect |
|-------|--------|
| `glass-interactive` | Hover/active/focus states |

### Content Layer

| Class | Effect |
|-------|--------|
| `glass-content` | Ensures content is above grain (z-index: 2) |

### Animation

| Class | Effect |
|-------|--------|
| `glass-shimmer` | Shimmer animation across surface |

---

## Preset Combinations

Pre-composed utility combinations for common patterns:

| Preset | Classes Included | Use Case |
|--------|------------------|----------|
| `glass-card` | glass, solid, grain-subtle, shadow | Cards, panels |
| `glass-modal` | glass, blur-xl, grain, shadow-lg | Modals, dialogs |
| `glass-sidebar` | glass, subtle, blur-sm, border-subtle | Sidebars |
| `glass-header` | glass, solid, blur-lg, shadow | Headers, navbars |
| `glass-popover` | glass, grain-subtle, shadow | Popovers, dropdowns |
| `glass-toast` | glass, ethereal, blur-lg, grain-subtle, shadow | Toasts, notifications |

---

## Usage Examples

### Basic Glass Card

```tsx
<Card className="glass rounded-xl p-4">
  <CardHeader>
    <CardTitle>Glass Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content shows through with blur effect
  </CardContent>
</Card>
```

### Dashboard Panel with Grain

```tsx
<div className="glass-card rounded-2xl p-6">
  <div className="glass-content">
    <h2 className="text-lg font-semibold">Analytics</h2>
    <p className="text-muted-foreground">
      Your data at a glance
    </p>
    {/* Charts, tables, etc. */}
  </div>
</div>
```

### Modal Overlay

```tsx
<Dialog>
  <DialogContent className="glass-modal rounded-2xl">
    <div className="glass-content">
      <DialogHeader>
        <DialogTitle>Confirm Action</DialogTitle>
      </DialogHeader>
      {/* Modal content */}
    </div>
  </DialogContent>
</Dialog>
```

### Interactive Glass Button

```tsx
<button className="glass glass-interactive glass-tint-primary rounded-lg px-4 py-2 transition-all duration-200">
  Click Me
</button>
```

### Header with Glass Effect

```tsx
<header className="glass-header sticky top-0 z-50 px-4 py-3">
  <nav className="flex items-center justify-between">
    <Logo />
    <Navigation />
  </nav>
</header>
```

### Composing Multiple Effects

```tsx
{/* Deep blur + heavy grain + primary tint + large shadow */}
<div className={cn(
  "glass glass-blur-xl glass-grain-heavy glass-tint-primary glass-shadow-lg",
  "rounded-3xl p-8"
)}>
  <div className="glass-content">
    Premium content area
  </div>
</div>
```

---

## Component API

### GrainOverlay

Wrapper component for complex grain effects.

```tsx
import { GrainOverlay } from "@workspace/design-system/effects"

<GrainOverlay
  intensity="medium"      // "subtle" | "medium" | "heavy" | "custom"
  opacity={0.05}          // Custom opacity (0-1), used with intensity="custom"
  blendMode="overlay"     // "overlay" | "soft-light" | "multiply" | "screen"
  animated={false}        // Enable grain animation
  animationSpeed={0.3}    // Animation speed in seconds
  frequency={0.85}        // Noise pattern frequency (0.1-2)
  enabled={true}          // Toggle grain on/off
>
  {children}
</GrainOverlay>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `"subtle" \| "medium" \| "heavy" \| "custom"` | `"medium"` | Grain intensity |
| `opacity` | `number` | — | Custom opacity (0-1), requires `intensity="custom"` |
| `blendMode` | `"overlay" \| "soft-light" \| "multiply" \| "screen"` | `"overlay"` | CSS blend mode |
| `animated` | `boolean` | `false` | Enable grain shift animation |
| `animationSpeed` | `number` | `0.3` | Animation speed (seconds) |
| `frequency` | `number` | `0.85` | Noise pattern frequency |
| `enabled` | `boolean` | `true` | Toggle grain on/off |

### GlassSurface

Complete glass surface component with all options.

```tsx
import { GlassSurface } from "@workspace/design-system/effects"

<GlassSurface
  blur="lg"                // "none" | "sm" | "md" | "lg" | "xl"
  opacity="solid"          // "solid" | "medium" | "subtle" | "ethereal"
  grain={true}             // Enable grain
  grainIntensity="subtle"  // "subtle" | "medium" | "heavy"
  tint="primary"           // "none" | "primary" | "secondary" | "accent" | "destructive" | "muted"
  shadow="lg"              // boolean | "lg"
  interactive={false}      // Enable hover/active states
>
  {children}
</GlassSurface>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blur` | `"none" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Blur intensity |
| `opacity` | `"solid" \| "medium" \| "subtle" \| "ethereal"` | `"medium"` | Glass opacity |
| `grain` | `boolean` | `false` | Enable grain overlay |
| `grainIntensity` | `"subtle" \| "medium" \| "heavy"` | `"subtle"` | Grain intensity |
| `tint` | `"none" \| "primary" \| "secondary" \| "accent" \| "destructive" \| "muted"` | `"none"` | Tint color |
| `shadow` | `boolean \| "lg"` | `false` | Enable shadow |
| `interactive` | `boolean` | `false` | Interactive states |

---

## CSS Variables

All glass properties are controlled via CSS variables, enabling runtime customization:

```css
:root {
  /* Blur & saturation */
  --glass-blur: 12px;
  --glass-saturation: 1.1;
  
  /* Opacity tiers */
  --glass-opacity-solid: 0.85;
  --glass-opacity-medium: 0.7;
  --glass-opacity-subtle: 0.5;
  --glass-opacity-ethereal: 0.3;
  
  /* Border */
  --glass-border-opacity: 0.15;
  --glass-border-width: 1px;
  
  /* Grain */
  --grain-opacity: 0.03;
  
  /* Tint amount */
  --glass-tint-amount: 0.08;
  
  /* Shadows */
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --glass-shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.dark {
  /* Dark mode overrides */
  --glass-opacity-solid: 0.75;
  --glass-opacity-medium: 0.6;
  --glass-border-opacity: 0.2;
  --grain-opacity: 0.05;
}
```

---

## Best Practices

### DO ✅

1. **Use presets for common patterns**
   ```tsx
   <Card className="glass-card" />  // Not manual composition
   ```

2. **Wrap content in `glass-content` when using grain**
   ```tsx
   <div className="glass glass-grain">
     <div className="glass-content">Text is readable</div>
   </div>
   ```

3. **Use semantic tints**
   ```tsx
   <div className="glass glass-tint-primary" />  // Uses --primary token
   ```

4. **Keep grain subtle for data-heavy UIs**
   ```tsx
   <DataTable className="glass glass-grain-subtle" />
   ```

### DON'T ❌

1. **Don't over-blur on text-heavy content**
   ```tsx
   // Bad: hard to read
   <p className="glass glass-blur-xl">Long paragraph...</p>
   ```

2. **Don't use heavy grain on tables/forms**
   ```tsx
   // Bad: grain interferes with data
   <Form className="glass glass-grain-heavy" />
   ```

3. **Don't stack multiple glass layers**
   ```tsx
   // Bad: performance + visual noise
   <div className="glass">
     <div className="glass">  {/* Don't nest */}
   ```

4. **Don't use ethereal glass for primary content**
   ```tsx
   // Bad: too transparent for main content
   <main className="glass glass-ethereal" />
   ```

---

## Performance Notes

- **GPU-accelerated**: Uses `backdrop-filter` (hardware accelerated)
- **Grain is CSS-only**: No JavaScript for static grain
- **Animated grain**: Use sparingly, creates repaints
- **Browser support**: Modern browsers only (`backdrop-filter`)

---

## ERP Context Guidelines

| Surface Type | Recommended Glass |
|--------------|-------------------|
| **Data tables** | `glass` or `glass-solid` (no grain) |
| **Forms** | `glass glass-grain-subtle` |
| **Modals** | `glass-modal` |
| **Cards (read)** | `glass-card` |
| **Cards (action)** | `glass glass-interactive` |
| **Sidebar** | `glass-sidebar` |
| **Header** | `glass-header` |
| **Toasts** | `glass-toast` |

---

## Design System Status

| Source | Components | Blocks | Effects |
|--------|------------|--------|---------|
| Shadcn Base | 54 | — | — |
| ShadcnStudio | — | 109 | — |
| Magic UI | — | — | 28 |
| Aceternity | — | — | 4 |
| ElevenLabs | — | — | 3 |
| Bundui | — | — | 4 |
| Skiper UI | — | — | 2 (19 exports) |
| **Glass Theme** | — | — | **2** (CSS + Components) |
| **TOTAL** | **54** | **109** | **43** |

---

## References

- [Apple Human Interface Guidelines - Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [CSS backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [CSS color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [SVG Filters for Noise](https://css-tricks.com/grainy-gradients/)
