# Shadcn-UI Best Practices Gap Analysis

**Date:** 2026-01-23  
**Source:** [shadcn-ui/ui](https://github.com/shadcn-ui/ui) v4  
**Target:** `@workspace/design-system`

---

> **📋 INTEGRATED INTO E-SERIES**
>
> This analysis has been integrated into the canonical E-Series documentation:
> - **[E01-DESIGN-SYSTEM.md](../../.cursor/ERP/E01-DESIGN-SYSTEM.md)** — Gap summary & comparison table
> - **[E02-BLOCKS.md](../../.cursor/ERP/E02-BLOCKS.md)** — Block system patterns
> - **[E03-IMPLEMENTATION.md](../../.cursor/ERP/E03-IMPLEMENTATION.md)** — Full implementation guide with code
>
> This file is retained as the original analysis source.

---

## Executive Summary

After analyzing the official shadcn-ui repository (438 registry items), here are the **best practices and patterns we haven't implemented** that would significantly improve our design system.

---

## 🔴 Critical Gaps (Must Implement)

### 1. Form Component with React Hook Form Integration

**What shadcn has:**
- `@shadcn/form` - Full integration with `react-hook-form` + `zod`
- Dependencies: `@hookform/resolvers`, `zod`, `react-hook-form`
- Provides: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`

**What we're missing:**
- No `form.tsx` component in our design system
- No standardized form validation pattern
- No `useFormField` hook

**Impact:** Every form in the app needs to reinvent form handling

**Solution:**
```tsx
// Add to packages/design-system/src/components/form.tsx
export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField }
```

---

### 2. Data Table Pattern

**What shadcn has:**
- `data-table-demo` example with full `@tanstack/react-table` integration
- Column definitions, sorting, filtering, pagination
- Row selection, column visibility
- Dependencies: `@tanstack/react-table`

**What we're missing:**
- No standardized DataTable component
- No column definition helpers
- No pagination integration

**Impact:** Every table in the ERP needs custom implementation

**Solution:**
```tsx
// Add to packages/design-system/src/components/data-table.tsx
export { DataTable, DataTablePagination, DataTableColumnHeader, DataTableViewOptions }
```

---

### 3. Block System (Pre-built Layouts)

**What shadcn has (438 items!):**

| Category | Count | Examples |
|----------|-------|----------|
| **Sidebars** | 16 | sidebar-01 to sidebar-16 (collapsible, floating, icons, calendar, file tree) |
| **Login/Auth** | 10 | login-01 to login-05, signup-01 to signup-05 |
| **Calendars** | 32 | calendar-01 to calendar-32 (date pickers, range, time, natural language) |
| **OTP** | 5 | otp-01 to otp-05 |
| **Charts** | 60+ | Area, Bar, Line, Pie, Radar, Radial, Tooltip variations |
| **Dashboard** | 1 | dashboard-01 (full dashboard with sidebar, charts, data table) |

**What we're missing:**
- No block system at all
- No pre-built layouts
- No standardized dashboard templates

**Impact:** Team 2 has to build every layout from scratch

**Solution:**
```
packages/design-system/
├── src/
│   ├── components/     # ✅ We have this (54 primitives)
│   └── blocks/         # ❌ MISSING - Add pre-built layouts
│       ├── sidebars/
│       ├── auth/
│       ├── calendars/
│       ├── charts/
│       └── dashboards/
```

---

### 4. Theme System (Multiple Themes)

**What shadcn has:**
- 5 base themes: `stone`, `zinc`, `neutral`, `gray`, `slate`
- Theme registry: `registry:theme` type
- Theme switching via CSS variables

**What we're missing:**
- Only one theme in `globals.css`
- No theme registry
- No theme switching utilities

**Impact:** Can't easily switch between Quorum (light/simple) and Cobalt (dark/power) themes

**Solution:**
```css
/* Add theme files */
packages/design-system/src/styles/themes/
├── stone.css
├── zinc.css
├── neutral.css
├── gray.css
└── slate.css
```

---

## 🟡 Important Gaps (Should Implement)

### 5. Example Registry

**What shadcn has:**
- 200+ examples showing component usage
- Each component has multiple examples (e.g., `button-demo`, `button-loading`, `button-icon`)
- Examples are copy-pasteable

**What we're missing:**
- No examples directory
- No standardized usage patterns
- No Storybook or similar

**Impact:** Developers don't know how to use components correctly

**Solution:**
```
packages/design-system/
├── src/
│   └── examples/       # ❌ MISSING
│       ├── button-demo.tsx
│       ├── button-loading.tsx
│       ├── form-rhf-demo.tsx
│       └── ...
```

---

### 6. Tanstack Form Integration

**What shadcn has:**
- `form-tanstack-*` examples (9 variants)
- Full `@tanstack/react-form` integration
- Alternative to React Hook Form

**What we're missing:**
- No Tanstack Form support
- Only React Hook Form (if we add it)

**Impact:** Missing modern form library option

---

### 7. Natural Language Date Picker

**What shadcn has:**
- `calendar-29` - Natural language date picker using `chrono-node`
- Parse "next friday", "in 2 weeks", "tomorrow"

**What we're missing:**
- No natural language parsing
- Basic date picker only

**Impact:** Missing "magic" UX for date inputs (important for ERP!)

---

### 8. Drag & Drop (DnD Kit Integration)

**What shadcn has:**
- `dashboard-01` uses `@dnd-kit/core`, `@dnd-kit/sortable`
- Draggable cards, sortable lists

**What we're missing:**
- No DnD integration
- No sortable components

**Impact:** Can't build drag-to-reorder features (important for dashboards)

---

### 9. Responsive Drawer/Dialog Pattern

**What shadcn has:**
- `drawer-dialog` example
- Shows Dialog on desktop, Drawer on mobile
- Uses `useMobile()` hook

**What we're missing:**
- No responsive overlay pattern
- Dialog and Drawer are separate

**Impact:** Poor mobile UX for modals

---

### 10. Field Component (Simplified Forms)

**What shadcn has:**
- `@shadcn/field` - Simpler alternative to Form
- `field-demo`, `field-input`, `field-textarea`, etc.
- No react-hook-form dependency

**What we're missing:**
- We have `field.tsx` but may not match shadcn's pattern

**Impact:** Need to verify our implementation matches

---

## 🟢 Nice to Have (Future)

### 11. Multiple Icon Library Support

**What shadcn has:**
- `@tabler/icons-react`
- `lucide-react`
- `@phosphor-icons/react`
- `@hugeicons/react`
- `@remixicon/react`

**What we have:**
- Only `lucide-react`

**Impact:** Limited icon choices

---

### 12. Animation Library (Motion)

**What shadcn has:**
- `motion` (Framer Motion successor)
- Used for page transitions, micro-interactions

**What we're missing:**
- No animation library
- No standardized transitions

---

### 13. Components.json Configuration

**What shadcn has:**
- `components.json` for CLI configuration
- Defines aliases, styles, registry URLs

**What we're missing:**
- No `components.json`
- Can't use `shadcn add` command

**Impact:** Can't easily add new components from registry

---

## Implementation Priority Matrix

| Priority | Gap | Effort | Impact | Recommendation |
|----------|-----|--------|--------|----------------|
| 🔴 P0 | Form Component | Medium | Critical | Add immediately |
| 🔴 P0 | Data Table | Medium | Critical | Add immediately |
| 🔴 P0 | Block System | High | Critical | Start with sidebars + auth |
| 🔴 P0 | Theme System | Medium | High | Add 5 base themes |
| 🟡 P1 | Examples | Medium | High | Add with each component |
| 🟡 P1 | Natural Language Date | Low | Medium | Add chrono-node |
| 🟡 P1 | DnD Kit | Medium | Medium | Add for dashboard |
| 🟡 P1 | Responsive Drawer | Low | Medium | Create pattern |
| 🟢 P2 | Tanstack Form | Medium | Low | Optional |
| 🟢 P2 | Multiple Icons | Low | Low | Optional |
| 🟢 P2 | Motion | Medium | Low | Future |
| 🟢 P2 | components.json | Low | Low | Future |

---

## Recommended Action Plan

### Phase 1: Critical (This Week)

1. **Add Form Component**
   ```bash
   # Dependencies to add
   pnpm add @hookform/resolvers zod
   ```

2. **Add Data Table Component**
   ```bash
   # Dependencies to add
   pnpm add @tanstack/react-table
   ```

3. **Create Block System Structure**
   ```
   src/blocks/
   ├── index.ts
   ├── sidebars/
   │   └── sidebar-01.tsx
   └── auth/
       └── login-01.tsx
   ```

### Phase 2: Important (Next Week)

4. **Add Theme System**
   - Create 5 theme CSS files
   - Add theme switcher hook

5. **Add Examples Directory**
   - Create example for each component
   - Add to documentation

6. **Add Natural Language Date**
   ```bash
   pnpm add chrono-node
   ```

### Phase 3: Nice to Have (Future)

7. Add DnD Kit integration
8. Add Motion for animations
9. Add components.json for CLI

---

## Code Snippets to Add

### Form Component (Priority 1)

```tsx
// packages/design-system/src/components/form.tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/label"

const Form = FormProvider

// ... rest of form component
```

### Data Table Component (Priority 1)

```tsx
// packages/design-system/src/components/data-table.tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // ... implementation
}
```

---

## Comparison: Our Design System vs Shadcn

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

---

## Summary

**We have:** 54 base components (good foundation)

**We're missing:**
1. 🔴 Form component with validation
2. 🔴 Data Table with TanStack
3. 🔴 Block system (100+ pre-built layouts)
4. 🔴 Theme system (5 themes)
5. 🟡 Examples (200+ usage patterns)
6. 🟡 Natural language date parsing
7. 🟡 Drag & drop integration

**Recommendation:** Focus on Form + Data Table + Blocks first. These are critical for ERP development.

---

## References

- [shadcn-ui/ui GitHub](https://github.com/shadcn-ui/ui)
- [shadcn-ui Documentation](https://ui.shadcn.com/docs)
- [Registry API](https://ui.shadcn.com/r/styles/new-york-v4/)
- [B10-UX.md](../../.cursor/ERP/B10-UX.md) - Our UX requirements
- [D20-UX-IMPLEMENTATION.md](../../.cursor/ERP/D20-UX-IMPLEMENTATION.md) - Team 2 roadmap
