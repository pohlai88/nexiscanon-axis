# E01 — Design System Constitution
## @workspace/design-system: The Single Source of UI Truth

<!-- AXIS ERP Document Series -->
|  A-Series  |                          |                     |                           |                            |                          |
| :--------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
| Philosophy |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |       |                     |
| :---------------------------: | :---------------------: | :---: | :-----------------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) |  ...  | [B10](./B10-UX.md)  |
|            Posting            |         Domains         |       |         UX          |

|    E-Series (Design System)    |                                |                                    |
| :----------------------------: | :----------------------------: | :--------------------------------: |
|           **[E01]**            | [E02](./E02-BLOCKS.md)         | [E03](./E03-IMPLEMENTATION.md)     |
|         Constitution           |         Block Library          |         Implementation Guide       |

---

> **NEXUS-CANON** — One design system. One source of truth. Zero duplication.

---

## The Design System Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE SINGLE SOURCE OF UI TRUTH                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ╔═══════════════════════════════════════════════════════════════════╗    │
│   ║                                                                   ║    │
│   ║   @workspace/design-system is the ONLY source for UI components   ║    │
│   ║                                                                   ║    │
│   ║   • 54 base components from shadcn-ui v4                          ║    │
│   ║   • Tailwind CSS v4 with @theme inline syntax                     ║    │
│   ║   • @base-ui/react primitives for accessibility                   ║    │
│   ║   • TypeScript strict mode with full type safety                  ║    │
│   ║                                                                   ║    │
│   ║   NEVER create UI components in apps/                             ║    │
│   ║   ALWAYS import from @workspace/design-system                     ║    │
│   ║                                                                   ║    │
│   ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part I: The Design System Philosophy

### §1 — What the Design System Is (And Is Not)

**THE DESIGN SYSTEM IS:**
- A **Single Source of Truth** for all UI components in AXIS
- A **Canonical Reference** that ensures visual and behavioral consistency
- A **Productivity Multiplier** that eliminates duplicate component creation
- A **Compliance Enforcer** for accessibility, theming, and code quality

**THE DESIGN SYSTEM IS NOT:**
- A place for app-specific components (those go in `@workspace/shared-ui`)
- A configuration engine (business logic lives in `@axis/registry`)
- A replacement for thoughtful UX design (it's the implementation layer)

### §2 — The Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **shadcn-ui** | v4 | Component architecture & patterns |
| **Tailwind CSS** | v4.1.11 | Utility-first CSS with @theme inline |
| **@base-ui/react** | 1.1.0 | Headless UI primitives |
| **Radix UI** | Various | Accessible component primitives |
| **class-variance-authority** | 0.7.1 | Component variant management |
| **lucide-react** | 0.474.0 | Icon library |
| **next-themes** | 0.4.6 | Theme management |
| **TypeScript** | 5.x | Type safety |

### §3 — The Package Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AXIS PACKAGE HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   @axis/registry          ← Zod schemas, types, events (BUSINESS TRUTH)     │
│         │                                                                    │
│         ▼                                                                    │
│   @workspace/design-system ← UI primitives (THIS PACKAGE - 54 components)   │
│         │                                                                    │
│         ▼                                                                    │
│   @workspace/shared-ui     ← Composites (DataFortress, EntityPicker, etc.)  │
│         │                                                                    │
│         ▼                                                                    │
│   apps/web                 ← Next.js application (CONSUMES, never creates)  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Package | Can Import From | Cannot Import From |
|---------|-----------------|-------------------|
| `@axis/registry` | Nothing | Everything |
| `@workspace/design-system` | `@axis/registry` | `apps/*`, `shared-ui` |
| `@workspace/shared-ui` | `design-system`, `@axis/registry` | `apps/*` |
| `apps/web` | Everything | Nothing |

---

## Part II: Prime Directives (Non-Negotiable Laws)

### P1 — The Import Law

```tsx
// ✅ CORRECT - Always use workspace imports
import { Button, Card, Input, Table } from "@workspace/design-system"
import { cn } from "@workspace/design-system"
import { useMobile } from "@workspace/design-system"

// ❌ FORBIDDEN - Never create local UI components
import { Button } from "./components/ui/button"
import { Button } from "../../../packages/design-system/src/components/button"
```

**Law:** If a component exists in `@workspace/design-system`, you MUST import it. Never duplicate.

---

### P2 — The cn() Law

```tsx
// ✅ CORRECT - Use cn() for all className merging
className={cn("base-class", condition && "conditional-class")}
className={cn("px-4 py-2", variant === "outline" && "border border-input")}

// ❌ FORBIDDEN - Never use template literals
className={`base ${active ? 'active' : ''}`}
className={"base " + (active ? "active" : "")}
```

**Law:** All className merging MUST use the `cn()` utility. No exceptions.

---

### P3 — The Semantic Token Law

```tsx
// ✅ CORRECT - Use semantic color tokens
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">Action</Button>
  <span className="text-muted-foreground">Helper text</span>
</div>

// ❌ FORBIDDEN - Never use hardcoded colors
<div className="bg-white text-black">
  <Button className="bg-blue-500 text-white">Action</Button>
</div>
```

**Law:** All colors MUST use semantic tokens. No `bg-blue-500`, `text-gray-600`, or hex values.

---

### P4 — The Transition Law

```tsx
// ✅ CORRECT - Explicit transition durations
className="transition-all duration-300"
className="transition-colors duration-200"

// ❌ FORBIDDEN - Implicit durations
className="transition-all"
className="transition"
```

**Law:** All transitions MUST have explicit duration classes.

---

### P5 — The Component Ownership Law

| Location | What Lives There | Who Owns It |
|----------|------------------|-------------|
| `packages/design-system/src/components/` | Base primitives (Button, Card, Table) | Team 1 |
| `packages/shared-ui/blocks/` | ERP composites (DataFortress, EntityPicker) | Team 2 |
| `apps/web/src/components/` | App-specific compositions | App Team |

**Law:** Never create a component in `apps/` that should be in `design-system` or `shared-ui`.

---

## Part III: The Component Inventory (61 Components + 3 Blocks)

### Layout (6)
Card, Separator, Skeleton, Aspect Ratio, Resizable, Scroll Area

### Forms (18)
Button, Button Group, Input, Input Group, Input OTP, Textarea, Select, Native Select, Checkbox, Radio Group, Switch, Slider, Label, Field, **Form** (NEW), Calendar, **Natural Date Input** (NEW), Combobox

### Navigation (6)
Navigation Menu, Menubar, Breadcrumb, Pagination, Sidebar, Tabs

### Overlays (11)
Dialog, Alert Dialog, Sheet, Drawer, **Responsive Modal** (NEW), Popover, Hover Card, Tooltip, Context Menu, Dropdown Menu, Command

### Data Display (13)
**Data Table** (NEW), **Data Table Column Header** (NEW), **Data Table Pagination** (NEW), **Sortable List** (NEW), Table, Badge, Avatar, Empty, KBD, Progress, Spinner, Chart, Carousel

### Feedback (2)
Alert, Sonner (Toast)

### Miscellaneous (5)
Accordion, Collapsible, Toggle, Toggle Group, Item

### Blocks (3 Examples)
**App Sidebar 01**, **Login Form 01**, **Stats Grid 01**

---

## Part IV: The Theming System

### Semantic Color Tokens

| Token | Purpose | Light | Dark |
|-------|---------|-------|------|
| `--background` | Page background | White | Dark gray |
| `--foreground` | Primary text | Black | White |
| `--primary` | Primary actions | Brand | Brand |
| `--secondary` | Secondary actions | Light gray | Dark gray |
| `--muted` | Muted backgrounds | Light gray | Dark gray |
| `--accent` | Accent highlights | Light accent | Dark accent |
| `--destructive` | Error/danger | Red | Red |
| `--border` | Borders | Light gray | Dark gray |

### Quorum vs Cobalt Theming

```tsx
// Quorum: Light, simple, guided (SME)
<ThemeProvider theme="quorum">
  <App />
</ThemeProvider>

// Cobalt: Dark, powerful, configurable (Enterprise)
<ThemeProvider theme="cobalt">
  <App />
</ThemeProvider>
```

---

## Part V: The Gap Analysis (What We Need to Build)

> **Full Analysis:** [E03-IMPLEMENTATION.md](./E03-IMPLEMENTATION.md) Part I
>
> **Source:** [SHADCN_BEST_PRACTICES_GAP.md](../../packages/design-system/SHADCN_BEST_PRACTICES_GAP.md)

### Current State ✅

| Category | Count | Status |
|----------|-------|--------|
| Base Components | 54 | ✅ Complete |
| Utilities (`cn()`) | 1 | ✅ Complete |
| Hooks | 15 | ✅ Complete |
| Animations | 3 modules | ✅ Complete |
| Global CSS | 1 | ✅ Complete |
| TypeScript | Full | ✅ 0 errors |

### Comparison: Our Design System vs Shadcn v4

| Feature | Shadcn v4 | Our Design System | Gap |
|---------|-----------|-------------------|-----|
| Base Components | 56 | 54 | ✅ Close |
| Blocks | 100+ | 0 | 🔴 Critical |
| Examples | 200+ | 0 | 🟡 Important |
| Themes | 5 | 1 | 🟡 Important |
| Form Integration | ✅ | ❌ | 🔴 Critical |
| Data Table | ✅ | ❌ | 🔴 Critical |
| DnD Kit | ✅ | ❌ | 🟡 Important |
| Natural Language | ✅ | ❌ | 🟡 Important |
| CLI Support | ✅ | ❌ | 🟢 Nice to have |

### Implementation Status

| Gap | Shadcn Has | We Have | Priority | Status |
|-----|------------|---------|----------|--------|
| **Form Component** | Full RHF + Zod | ✅ Implemented | 🔴 P0 | ✅ Complete |
| **Data Table** | TanStack Table | ✅ Implemented | 🔴 P0 | ✅ Complete |
| **Block System** | 100+ layouts | ✅ 3 examples | 🔴 P0 | ✅ Foundation |
| **Theme System** | 5 themes | ✅ 5 themes | 🟡 P1 | ✅ Complete |
| **Natural Language Date** | chrono-node | ✅ Implemented | 🟡 P1 | ✅ Complete |
| **DnD Kit** | @dnd-kit | ✅ Implemented | 🟡 P1 | ✅ Complete |
| **Responsive Modal** | drawer-dialog | ✅ Implemented | 🟡 P1 | ✅ Complete |
| **Examples** | 200+ examples | 📋 Planned | 🟡 P1 | 📋 Future |

---

## Part VI: The Anti-Pattern List

| ❌ FORBIDDEN | ✅ CORRECT | Why |
|--------------|-----------|-----|
| `apps/web/src/components/ui/button.tsx` | `import { Button } from "@workspace/design-system"` | Single source of truth |
| `className="bg-blue-500"` | `className="bg-primary"` | Semantic tokens |
| `className={\`base ${active}\`}` | `className={cn("base", active && "active")}` | cn() utility |
| `style={{ color: '#333' }}` | `className="text-foreground"` | No inline styles |
| Copy-paste component code | Import from design-system | DRY principle |
| `transition-all` | `transition-all duration-300` | Explicit durations |

---

## Part VII: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    @workspace/design-system QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  IMPORT:                                                                     │
│  import { Button, Card, Input } from "@workspace/design-system"              │
│  import { cn } from "@workspace/design-system"                               │
│  import { useMobile, useDebounce } from "@workspace/design-system"           │
│  import { fadeInUp, springDefault } from "@workspace/design-system/animations"│
│                                                                              │
│  CLASSNAMES:                                                                 │
│  className={cn("base", condition && "conditional")}                          │
│                                                                              │
│  COLORS:                                                                     │
│  bg-primary, bg-secondary, bg-muted, bg-accent, bg-destructive               │
│  text-foreground, text-muted-foreground, text-primary-foreground             │
│                                                                              │
│  VARIANTS:                                                                   │
│  <Button variant="default|secondary|outline|ghost|destructive|link" />       │
│  <Button size="default|sm|lg|icon" />                                        │
│                                                                              │
│  COMMANDS:                                                                   │
│  pnpm --filter @workspace/design-system check-types                          │
│  pnpm --filter @workspace/design-system lint                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix A: E-Series Document Map

| Document | Purpose | Status |
|----------|---------|--------|
| **E01-DESIGN-SYSTEM.md** | Constitution & Philosophy (this doc) | ✅ v0.1.0 |
| [E02-BLOCKS.md](./E02-BLOCKS.md) | Block Library & Patterns | ✅ v0.1.0 |
| [E03-IMPLEMENTATION.md](./E03-IMPLEMENTATION.md) | Implementation Guide & Best Practices | ✅ v0.1.0 |

---

## Appendix B: Core Mantras

| Mantra | Meaning |
|--------|---------|
| **One Source of Truth** | All UI components live in `@workspace/design-system` |
| **Import, Never Duplicate** | If it exists, import it. Never copy-paste. |
| **cn() Everywhere** | All className merging uses the cn() utility |
| **Semantic Tokens Only** | No hardcoded colors. Ever. |
| **Explicit Transitions** | All animations have duration classes |
| **TypeScript Strict** | 0 errors, no `any` types |

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | ✅ Canonical (Implementation Complete) |
| **Version** | 0.3.0 |
| **Owner** | Team 1 (Infrastructure) |
| **Consumers** | Team 2 (UX), All Apps |
| **Components** | 61 base + 7 advanced + 3 blocks |
| **Hooks** | 15 production-ready hooks |
| **Animations** | Variants, transitions, easings |
| **Type Check** | ✅ 0 errors |
| **Last Updated** | 2026-01-23 |
| **Review Cycle** | Quarterly |

---

> *"The design system does not tell you what to build. It tells you how to build it consistently. In UI, consistency is trust. @workspace/design-system is your foundation."*
