# AFANDA Design System Guide
## Styles, CSS, and Tokens Reference

> **Version:** 1.0.0 | **Last Updated:** 2026-01-24
> **Source:** `@workspace/design-system`

---

## 📋 Table of Contents

1. [Theme System](#1-theme-system)
2. [Glass Morphism](#2-glass-morphism)
3. [Color Tokens](#3-color-tokens)
4. [Style Presets](#4-style-presets)
5. [Typography](#5-typography)
6. [Component Usage](#6-component-usage)
7. [AFANDA-Specific Patterns](#7-afanda-specific-patterns)

---

## 1. Theme System

### 1.1 Available Themes

AFANDA uses the **midnight** theme by default for a professional dashboard feel.

| Theme | Description | Warmth | Contrast | Category |
|-------|-------------|--------|----------|----------|
| **midnight** ⭐ | Electric ink with cool paper | Cold | Medium | Premium |
| neutral | Pure grayscale, professional default | Cold | Medium | Standard |
| gray | Cool blue-tinted gray | Cold | Medium | Standard |
| stone | Warm cream and charcoal tones | Warm | Medium | Standard |
| zinc | Purple-tinted modern gray | Cold | Medium | Standard |
| slate | Deep blue-gray, navy depths | Cold | Medium | Standard |
| opulence | Luxury gold and bronze accents | Warm | High | Premium |
| heirloom | Historic warmth with aged leather | Warm | High | Premium |
| zenith | Modern minimal, content-first | Neutral | High | Minimal |

### 1.2 Theme Configuration

```tsx
// Set in layout.tsx
<html data-theme="midnight" data-style="mia">
```

**Available Attributes:**
- `data-theme`: Base color scale (see table above)
- `data-style`: Visual density preset (vega, nova, mia, lyra, mira)
- `data-accent`: Accent color overlay (neutral, rose, orange, amber, emerald, cyan, blue, violet, fuchsia)
- `data-menu-color`: Sidebar color (default, inverted)
- `data-menu-accent`: Sidebar accent (subtle, bold, minimal)

---

## 2. Glass Morphism

### 2.1 Base Glass Classes

```css
/* Base glass effect */
.glass {
  background: var(--_glass-bg);
  backdrop-filter: blur(12px) saturate(1.1);
  border: 1px solid var(--_glass-border);
}

/* Opacity variants */
.glass-solid      /* More opaque (85% light, 75% dark) */
.glass-subtle     /* More transparent (50% light, 40% dark) */
.glass-ethereal   /* Very transparent (30% light, 25% dark) */
```

### 2.2 Glass with Grain Texture

```tsx
// Add subtle grain texture
<div className="glass glass-grain">

// Grain intensity variants
<div className="glass glass-grain-subtle">   // 2% opacity
<div className="glass glass-grain-medium">   // 4% opacity
<div className="glass glass-grain-heavy">    // 8% opacity
```

### 2.3 Glass Blur Variants

```css
.glass-blur-none   /* No blur */
.glass-blur-sm     /* 8px blur */
.glass-blur-md     /* 12px blur (default) */
.glass-blur-lg     /* 20px blur */
.glass-blur-xl     /* 32px blur */
```

### 2.4 Glass Tint Variants

Apply semantic color tints to glass surfaces:

```tsx
<div className="glass glass-tint-primary">      // Primary color tint
<div className="glass glass-tint-secondary">    // Secondary color tint
<div className="glass glass-tint-accent">       // Accent color tint
<div className="glass glass-tint-destructive">  // Destructive/error tint
<div className="glass glass-tint-muted">        // Muted tint
```

### 2.5 Contextual Glass Classes

Pre-composed glass effects for common UI elements:

```tsx
// Layout components
<div className="glass-card">        // Card with glass effect
<div className="glass-modal">       // Modal backdrop
<div className="glass-sidebar">     // Sidebar with glass
<div className="glass-header">      // Header with glass
<div className="glass-footer">      // Footer with glass

// Interactive states
<div className="glass-hover">       // Hover effect
<div className="glass-active">      // Active/pressed state
<div className="glass-focus">       // Focus ring
```

---

## 3. Color Tokens

### 3.1 Semantic Color System

All colors use OKLCH color space for perceptual uniformity.

#### Base Colors

```css
/* Background & Foreground */
--background           /* Page background */
--foreground           /* Primary text */

/* Card & Popover */
--card                 /* Card background */
--card-foreground      /* Card text */
--popover              /* Popover background */
--popover-foreground   /* Popover text */

/* Primary (Brand) */
--primary              /* Primary brand color */
--primary-foreground   /* Text on primary */

/* Secondary */
--secondary            /* Secondary actions */
--secondary-foreground /* Text on secondary */

/* Muted */
--muted                /* Muted backgrounds */
--muted-foreground     /* Secondary text */

/* Accent */
--accent               /* Accent highlights */
--accent-foreground    /* Text on accent */

/* Destructive */
--destructive          /* Error/danger */
--destructive-foreground /* Text on destructive */

/* Borders & Inputs */
--border               /* Border color */
--input                /* Input border */
--ring                 /* Focus ring */
```

#### Sidebar Colors

```css
--sidebar                  /* Sidebar background */
--sidebar-foreground       /* Sidebar text */
--sidebar-primary          /* Sidebar primary */
--sidebar-primary-foreground
--sidebar-accent           /* Sidebar accent */
--sidebar-accent-foreground
--sidebar-border           /* Sidebar border */
--sidebar-ring             /* Sidebar focus ring */
```

#### Chart Colors

```css
--chart-1   /* oklch(0.809 0.105 251.813) - Blue */
--chart-2   /* oklch(0.623 0.214 259.815) - Purple */
--chart-3   /* oklch(0.546 0.245 262.881) - Deep purple */
--chart-4   /* oklch(0.488 0.243 264.376) - Indigo */
--chart-5   /* oklch(0.424 0.199 265.638) - Navy */
```

### 3.2 Using Color Tokens in Tailwind

```tsx
// Background colors
className="bg-background"
className="bg-card"
className="bg-primary"

// Text colors
className="text-foreground"
className="text-muted-foreground"
className="text-primary"

// Border colors
className="border-border"
className="border-primary"

// Hover states
className="hover:bg-accent hover:text-accent-foreground"
```

---

## 4. Style Presets

### 4.1 Available Styles

AFANDA uses **mia** style by default for balanced density.

| Style | Description | Radius | Spacing | Best For |
|-------|-------------|--------|---------|----------|
| vega | Default balanced | 0.625rem | Standard | General purpose |
| nova | Sharp, minimal | 0 | Standard | Modern, clean |
| **mia** ⭐ | Soft, rounded | 1rem | Generous | Dashboards, cards |
| lyra | Compact, tight | 0.375rem | Tight | Dense data tables |
| mira | Pill-shaped | 9999px | Standard | Playful, consumer |

### 4.2 Style Configuration

```tsx
// Set in layout.tsx
<html data-style="mia">
```

Each style affects:
- Border radius (`--radius`)
- Component spacing
- Shadow intensity
- Visual density

---

## 5. Typography

### 5.1 Available Fonts

| Font | Family | Best For |
|------|--------|----------|
| **inter** ⭐ | Inter Variable | Default, professional |
| noto | Noto Sans Variable | Multi-language support |
| nunito | Nunito Sans Variable | Friendly, approachable |
| figtree | Figtree Variable | Modern, geometric |

### 5.2 Font Configuration

```tsx
// In layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

<html className={inter.variable}>
```

### 5.3 Typography Classes

```tsx
// Headings
className="text-5xl font-bold tracking-tight"     // Large heading
className="text-2xl font-bold tracking-tight"     // Section heading
className="text-lg font-semibold"                 // Subsection

// Body text
className="text-sm text-muted-foreground"         // Secondary text
className="text-xs text-muted-foreground"         // Tertiary text
className="font-medium"                           // Medium weight
```

---

## 6. Component Usage

### 6.1 Import Pattern

```tsx
// ✅ CORRECT: Workspace imports
import { Button, Card, Badge } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

// ✅ CORRECT: Blocks
import { ApprovalQueue } from "@workspace/design-system/blocks";

// ❌ WRONG: Local imports
import { Button } from "./components/ui/button";
```

### 6.2 Common Components

#### Button

```tsx
import { Button } from "@workspace/design-system";

<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
<Button size="icon-sm">Small Icon</Button>
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@workspace/design-system";

<Card className="glass glass-solid">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

#### Badge

```tsx
import { Badge } from "@workspace/design-system";

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Sidebar

```tsx
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/design-system";

<SidebarProvider>
  <Sidebar>
    <SidebarHeader>Logo</SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>Item</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    <main>Content</main>
  </SidebarInset>
</SidebarProvider>
```

---

## 7. AFANDA-Specific Patterns

### 7.1 Dashboard Layout

```tsx
// Application shell with sidebar + header
import { AfandaShell } from "@/components/layout/shell";

<AfandaShell>
  {/* Dashboard content */}
</AfandaShell>
```

### 7.2 Metric Cards

```tsx
import { MetricCard, MetricCardGroup } from "@/components/widgets/metric-card";

<MetricCardGroup columns={4}>
  <MetricCard
    label="Revenue MTD"
    value="$124,563"
    trend="up"
    change="+12.3%"
    description="vs last month"
    icon={<DollarSign className="h-4 w-4" />}
  />
</MetricCardGroup>
```

### 7.3 Alert Cards

```tsx
import { AlertCard, AlertList } from "@/components/widgets/alert-card";

<AlertCard
  id="1"
  title="Low Cash Position"
  description="Cash position is below threshold"
  severity="critical"
  timestamp="2 minutes ago"
  onAcknowledge={(id) => console.log("Acknowledged:", id)}
/>
```

### 7.4 Glass Effect Combinations

```tsx
// Solid glass widget (primary surfaces)
<div className="afanda-widget rounded-xl border border-border bg-card/60 backdrop-blur-sm">

// Glass with grain texture
<div className="glass glass-solid glass-grain">

// Glass with primary tint
<div className="glass glass-tint-primary">

// Header with glass
<header className="afanda-header glass-header">

// Sidebar with glass
<aside className="afanda-sidebar glass-sidebar">
```

### 7.5 AFANDA CSS Utilities

All AFANDA-specific utilities are defined in `apps/afanda/src/app/globals.css`:

```css
/* Grid System */
.afanda-grid          /* Auto-fit responsive grid */
.afanda-grid-2        /* 2-column grid */
.afanda-grid-3        /* 3-column grid */
.afanda-grid-4        /* 4-column grid */

/* Widget System */
.afanda-widget        /* Base widget container */
.afanda-widget-header /* Widget header */
.afanda-widget-title  /* Widget title */

/* KPI Metrics */
.afanda-metric        /* Metric container */
.afanda-metric-value  /* Large metric value (3xl, bold) */
.afanda-metric-label  /* Metric label (sm, muted) */
.afanda-metric-trend  /* Trend indicator with color */

/* Alerts */
.afanda-alert         /* Alert container */
.afanda-alert-critical  /* Critical alert (red border) */
.afanda-alert-warning   /* Warning alert (yellow border) */
.afanda-alert-info      /* Info alert (blue border) */
.afanda-alert-success   /* Success alert (green border) */

/* Status Indicators */
.afanda-status        /* Status badge */
.afanda-status-dot    /* Status dot indicator */
.afanda-status-dot-active   /* Green dot */
.afanda-status-dot-pending  /* Yellow dot (pulse) */
.afanda-status-dot-inactive /* Gray dot */
.afanda-status-dot-error    /* Red dot */
```

---

## 8. Best Practices

### 8.1 Color Usage

```tsx
// ✅ CORRECT: Use semantic tokens
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border"

// ❌ WRONG: Hardcoded colors
className="bg-blue-500 text-white"
className="text-gray-400"
```

### 8.2 Glass Effects

```tsx
// ✅ CORRECT: Combine glass with semantic colors
<div className="glass glass-solid border border-border bg-card/60">

// ✅ CORRECT: Use contextual glass classes
<header className="glass-header">

// ❌ WRONG: Mixing incompatible patterns
<div className="glass bg-white">  // Don't override glass background
```

### 8.3 Transitions

```tsx
// ✅ CORRECT: Explicit duration
className="transition-all duration-300"
className="transition-colors duration-200"

// ❌ WRONG: No duration specified
className="transition-all"
```

### 8.4 cn() Utility

```tsx
// ✅ CORRECT: Use cn() for conditional classes
import { cn } from "@workspace/design-system/lib/utils";

className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-class"
)}

// ❌ WRONG: Template literals
className={`base-class ${isActive ? 'active-class' : ''}`}
```

---

## 9. Theme Tokens Reference

### 9.1 Midnight Theme (AFANDA Default)

#### Light Mode
```css
--background: oklch(0.985 0 0)           /* Off-white */
--foreground: oklch(0.145 0.028 264)     /* Dark blue-gray */
--primary: oklch(0.488 0.243 264.376)    /* Electric blue */
--muted-foreground: oklch(0.556 0.028 264) /* Medium gray */
```

#### Dark Mode
```css
--background: oklch(0.145 0.028 264)     /* Dark blue-gray */
--foreground: oklch(0.985 0 0)           /* Off-white */
--primary: oklch(0.809 0.105 251.813)    /* Bright blue */
--card: oklch(0.205 0.028 264)           /* Slightly lighter than bg */
```

### 9.2 Chart Colors (Data Visualization)

```tsx
// Use for consistent chart theming
const chartColors = {
  1: "var(--chart-1)",  // Blue
  2: "var(--chart-2)",  // Purple
  3: "var(--chart-3)",  // Deep purple
  4: "var(--chart-4)",  // Indigo
  5: "var(--chart-5)",  // Navy
};
```

---

## 10. Quick Reference

### Import Checklist

```tsx
// Layout components
import { 
  Sidebar, SidebarProvider, SidebarContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton 
} from "@workspace/design-system";

// UI components
import { 
  Button, Card, Badge, Input, Label,
  Select, Tabs, Dialog, Popover
} from "@workspace/design-system";

// AFANDA blocks
import { 
  ApprovalQueue, SharingBoard, ConsultationThread,
  ReadReceiptSystem, EscalationLadder 
} from "@workspace/design-system/blocks";

// Utilities
import { cn } from "@workspace/design-system/lib/utils";

// Icons
import { Icon } from "lucide-react";
```

### Common Patterns

```tsx
// Metric card with glass effect
<div className="afanda-widget rounded-xl border border-border bg-card/60 backdrop-blur-sm">
  <div className="afanda-metric">
    <span className="afanda-metric-label">Revenue MTD</span>
    <span className="afanda-metric-value">$124,563</span>
    <span className="afanda-metric-trend" data-trend="up">+12.3%</span>
  </div>
</div>

// Alert with severity
<div className="afanda-alert afanda-alert-critical">
  <h4 className="afanda-alert-title">Critical Alert</h4>
  <p className="afanda-alert-description">Description here</p>
</div>

// Status indicator
<span className="afanda-status afanda-status-active">
  <span className="afanda-status-dot afanda-status-dot-active" />
  Active
</span>
```

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | ✅ Active Reference |
| **Version** | 1.0.0 |
| **Author** | AXIS Architecture Team |
| **Created** | 2026-01-24 |
| **Last Updated** | 2026-01-24 |

---

## References

- [Design System Package](../../packages/design-system/)
- [E02-08-THEME-ADVANCED.md](../../.cursor/ERP/E02-08-THEME-ADVANCED.md)
- [E02-07-THEME-GLASS.md](../../.cursor/ERP/E02-07-THEME-GLASS.md)
- [globals.css](../../packages/design-system/src/styles/globals.css)
- [glass.css](../../packages/design-system/src/styles/glass.css)
- [theme-config.ts](../../packages/design-system/src/tokens/theme-config.ts)
