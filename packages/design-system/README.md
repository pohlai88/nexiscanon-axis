# @workspace/design-system

Official design system package for NexusCanon AXIS - built on shadcn-ui v4 with Tailwind CSS v4 and Base UI primitives.

## Overview

This package provides a comprehensive set of beautifully-designed, accessible UI components built for enterprise ERP applications. It's based on shadcn-ui v4 with Tailwind CSS v4 and @base-ui/react primitives.

## Tech Stack

- **shadcn-ui v4** - Component architecture and patterns
- **Tailwind CSS v4** - Utility-first CSS with @theme inline syntax
- **@base-ui/react 1.1.0** - Headless UI primitives
- **Radix UI** - Accessible component primitives (some components)
- **class-variance-authority** - Component variant management
- **lucide-react** - Icon library

## Installation

This package is part of the NexusCanon AXIS monorepo and uses workspace protocol:

```bash
# Install dependencies
pnpm install
```

## Usage

### Importing Components

```tsx
import { Button, Card, Input } from "@workspace/design-system"
import { cn } from "@workspace/design-system"
```

### Basic Example

```tsx
import { Button } from "@workspace/design-system"

export function MyComponent() {
  return (
    <Button variant="default" size="lg">
      Click me
    </Button>
  )
}
```

### Using with Tailwind CSS

In your app's CSS file:

```css
@import "@workspace/design-system/styles/globals.css";
```

## Available Components

### Layout (6)
- Card
- Separator
- Skeleton
- Aspect Ratio
- Resizable
- Scroll Area

### Forms (19)
- Button, Button Group
- Input, Input Group, Input OTP
- Textarea
- Select, Native Select
- Checkbox
- Radio Group
- Switch
- Label
- Field
- **Form** (NEW - React Hook Form + Zod)
- Combobox
- Calendar
- **Natural Date Input** (NEW - Natural language parsing)
- Slider

### Navigation (6)
- Navigation Menu
- Menubar
- Breadcrumb
- Pagination
- Sidebar
- Tabs

### Overlays (11)
- Dialog
- Sheet
- Drawer
- **Responsive Modal** (NEW - Adaptive dialog/drawer)
- Popover
- Hover Card
- Tooltip
- Alert Dialog
- Context Menu
- Dropdown Menu
- Command

### Data Display
- **Data Table** (NEW - TanStack Table)
- **Data Table Column Header** (NEW)
- **Data Table Pagination** (NEW)
- **Sortable List** (NEW - Drag & drop)
- Table
- Badge
- Avatar
- Empty
- KBD
- Progress
- Spinner
- Chart
- Carousel

### Feedback
- Alert
- Toast (Sonner)

### Miscellaneous
- Accordion
- Collapsible
- Tabs
- Toggle
- Toggle Group
- Item
- Button Group
- Scroll Area

---

## AXIS Registry (Canonical Blocks)

The AXIS Registry is a Shadcn-compatible registry containing **23 canonical blocks** organized into 5 domain-specific categories. These blocks follow the Nexus Doctrine patterns and are designed for enterprise ERP applications.

### Registry Schema

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "axis",
  "homepage": "https://axis.nexuscanon.com",
  "items": [...]
}
```

### Domain Categories

| Domain | Purpose | Blocks |
|--------|---------|--------|
| **Quorum** | Analysis & inquiry kernel | command-k, six-w1h-manifest, exception-hunter, drilldown-dashboard, trend-analysis-widget |
| **Cobalt** | Execution & action kernel | summit-button, predictive-form, crud-sap-interface, autofill-engine |
| **Audit** | Compliance & governance | danger-zone-indicator, audit-trail-viewer, risk-score-display, policy-override-record |
| **ERP** | Accounting & finance | ar-aging-table, ap-aging-table, inventory-valuation-card, trial-balance-table, reconciliation-widget |
| **AFANDA** | Approval & collaboration | approval-queue, sharing-board, escalation-ladder, consultation-thread, read-receipt-system |

### Installing Blocks

```bash
# Install a single block
shadcn add @axis/summit-button

# Install multiple blocks
shadcn add @axis/command-k @axis/approval-queue
```

### Registry Configuration

In your `components.json`:

```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/styles/new-york-v4/{name}.json",
    "@axis": "http://localhost:3000/r/{name}.json"
  }
}
```

### Building the Registry

```bash
# Build registry JSON files to public/r/
pnpm registry:build

# Validate registry.json
pnpm registry:validate
```

**Output:**
```
packages/design-system/public/r/
├── index.json              # Registry index
├── summit-button.json      # Individual block files
├── command-k.json
└── ... (23 total blocks)
```

### Block Import Examples

```tsx
// Quorum blocks (analysis)
import { CommandK, ExceptionHunter, DrilldownDashboard } from "@workspace/design-system/blocks"

// Cobalt blocks (execution)
import { SUMMITButton, PredictiveForm, CRUDSAPInterface } from "@workspace/design-system/blocks"

// Audit blocks (compliance)
import { DangerZoneIndicator, AuditTrailViewer, RiskScoreDisplay } from "@workspace/design-system/blocks"

// ERP blocks (accounting)
import { ARAgingTable, APAgingTable, TrialBalanceTable } from "@workspace/design-system/blocks"

// AFANDA blocks (collaboration)
import { ApprovalQueue, SharingBoard, EscalationLadder } from "@workspace/design-system/blocks"
```

---

## Blocks (Pre-built Compositions)

Import from `@workspace/design-system/blocks`:

```tsx
import { AppSidebar01, LoginForm01, StatsGrid01 } from "@workspace/design-system/blocks"
```

### General Blocks

- **AppSidebar01** - Application sidebar with navigation
- **LoginForm01** - Login form with email/password
- **StatsGrid01** - Dashboard statistics grid

See [E02-BLOCKS.md](../../.cursor/ERP/E02-BLOCKS.md) for full block library.

## Utilities

### `cn()` Function

Utility for merging Tailwind CSS classes with proper conflict resolution:

```tsx
import { cn } from "@workspace/design-system"

// Merge classes
cn("px-4 py-2", "bg-red-500") // "px-4 py-2 bg-red-500"

// Conflicts are resolved (last wins)
cn("px-2", "px-4") // "px-4"

// Conditional classes
cn("base-class", condition && "conditional-class")
```

## Hooks

### `useMobile()`

Detect mobile viewport:

```tsx
import { useMobile } from "@workspace/design-system"

function MyComponent() {
  const isMobile = useMobile()
  
  return (
    <div>{isMobile ? "Mobile" : "Desktop"}</div>
  )
}
```

## Advanced Features

### Form Component with Validation

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
} from "@workspace/design-system"

const schema = z.object({
  email: z.string().email(),
})

export function MyForm() {
  const form = useForm({ resolver: zodResolver(schema) })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Data Table with Sorting & Pagination

```tsx
import { DataTable, DataTableColumnHeader } from "@workspace/design-system"

const columns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
]

export function MyTable({ data }) {
  return <DataTable columns={columns} data={data} />
}
```

### Natural Language Date Input

```tsx
import { NaturalDateInput } from "@workspace/design-system"

export function DatePicker() {
  const [date, setDate] = useState<Date>()
  
  return (
    <NaturalDateInput
      value={date}
      onChange={setDate}
      placeholder="e.g., 'next friday', 'in 2 weeks'"
    />
  )
}
```

### Sortable List (Drag & Drop)

```tsx
import { SortableList } from "@workspace/design-system"

export function TaskList() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Task 1" },
    { id: "2", title: "Task 2" },
  ])

  return (
    <SortableList
      items={tasks}
      onReorder={setTasks}
      renderItem={(task) => <span>{task.title}</span>}
    />
  )
}
```

---

## Theming

### Theme System (5 Themes)

```tsx
import { ThemeProvider } from "@workspace/design-system"
import "@workspace/design-system/styles/themes/index.css"

// Wrap your app
<ThemeProvider defaultTheme="stone">
  <App />
</ThemeProvider>
```

**Available Themes:**
- `stone` (default) - Warm, natural tones
- `zinc` - Cool, modern grays
- `neutral` - Pure grayscale
- `gray` - Balanced grays
- `slate` - Blue-tinted grays

### Semantic Color Tokens

The design system uses semantic color tokens for consistent theming:

- `background` / `foreground`
- `card` / `card-foreground`
- `popover` / `popover-foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `border`, `input`, `ring`
- `chart-1` through `chart-5`
- `sidebar-*` (sidebar-specific tokens)

### Customizing Theme

Modify CSS variables in `globals.css`:

```css
:root {
  --radius: 0.625rem;
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... other tokens */
}
```

## Component Architecture

### Base UI Integration

Components use @base-ui/react primitives for accessibility and behavior:

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"

function Button({ className, ...props }) {
  return (
    <ButtonPrimitive
      className={cn("cn-button cn-button-variant-default", className)}
      {...props}
    />
  )
}
```

### CSS Class Naming Convention

v4 uses prefixed class names:

- `cn-button` - Base button styles
- `cn-button-variant-default` - Default button variant
- `cn-button-size-lg` - Large button size

This prevents conflicts and improves specificity control.

## TypeScript

All components are fully typed with TypeScript 5.x. Component props extend their primitive counterparts:

```tsx
import type { Button } from "@workspace/design-system"

type ButtonProps = React.ComponentProps<typeof Button>
```

## Peer Dependencies

This package requires:

- `react` >= 19.0.0
- `react-dom` >= 19.0.0
- `next` >= 15.0.0 (optional, for Next.js-specific features)

## Development

```bash
# Type checking
pnpm check-types

# Linting
pnpm lint

# Format code
pnpm format:write

# Build registry JSON files
pnpm registry:build

# Validate registry
pnpm registry:validate

# Build CSS
pnpm css:build
```

## Shadcn MCP Integration

The design system integrates with Shadcn MCP tools for automated consistency enforcement:

### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `list_items_in_registries` | List all blocks in @axis registry |
| `view_items_in_registries` | View block metadata and source code |
| `get_add_command_for_items` | Get CLI command to install blocks |
| `get_audit_checklist` | Post-generation validation checklist |
| `get-blocks-metadata` | Get catalog of all available blocks |

### Consistency Workflow

```
1. DISCOVERY
   └─ list_items_in_registries(["@axis"]) → Find existing blocks

2. INSTALLATION
   └─ get_add_command_for_items(["@axis/summit-button"]) → CLI command

3. VALIDATION
   └─ get_audit_checklist() → Verify files, imports, dependencies

4. ENFORCEMENT (via registry.json schema)
   └─ registryDependencies → Only approved base components
   └─ categories → Domain-scoped organization
```

### Registry Item Schema

Each block in `public/r/{name}.json` follows the Shadcn registry-item schema:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "summit-button",
  "type": "registry:block",
  "title": "SUMMIT Button (Cobalt)",
  "description": "Multi-step workflow button...",
  "categories": ["cobalt", "execution", "workflow"],
  "registryDependencies": ["button", "tooltip", "progress"],
  "dependencies": ["motion"],
  "files": [
    {
      "path": "src/blocks/cobalt/summit-button.tsx",
      "type": "registry:component",
      "content": "..."
    }
  ]
}
```

## Architecture Decisions

### Why shadcn-ui v4?

- **Tailwind v4** - Modern CSS with @theme inline syntax
- **@base-ui/react** - Better accessibility primitives
- **Copy & paste approach** - Full ownership of component code
- **ERP-grade** - Enterprise-ready patterns and components

### File Structure

```
packages/design-system/
├── registry.json           # AXIS Registry definition (23 blocks)
├── public/r/               # Built registry JSON files (generated)
├── scripts/
│   └── build-registry.mjs  # Registry build script
├── src/
│   ├── components/         # 54 base components
│   ├── blocks/             # Domain blocks (quorum, cobalt, audit, erp, afanda)
│   ├── effects/            # Visual effects (confetti, particles, etc.)
│   ├── hooks/              # Custom hooks (useMobile, etc.)
│   ├── lib/                # Utilities (cn function)
│   ├── tokens/             # Theme tokens and textures
│   ├── styles/             # Global CSS and themes
│   └── index.ts            # Public API exports
└── package.json
```

### Registry Structure

```
registry.json
├── name: "axis"
├── homepage: "https://axis.nexuscanon.com"
└── items: [
    ├── Quorum (5 blocks)     # Analysis kernel
    ├── Cobalt (4 blocks)     # Execution kernel
    ├── Audit (4 blocks)      # Compliance blocks
    ├── ERP (5 blocks)        # Accounting blocks
    └── AFANDA (5 blocks)     # Collaboration blocks
]
```

### Import Strategy

**Always use workspace imports:**

```tsx
// ✅ CORRECT
import { Button } from "@workspace/design-system"

// ❌ WRONG
import { Button } from "../../../packages/design-system/src/components/button"
```

## Compliance with Project Rules

This package follows NexusCanon AXIS conventions:

- **DRY + KISS** - Minimal, focused components
- **Single Source of Truth** - All UI components live here
- **Workspace imports** - `@workspace/design-system` protocol
- **cn() utility** - For all className merging
- **Semantic tokens** - No hardcoded colors
- **TypeScript strict mode** - Type-safe components

## License

MIT

## Links

- [shadcn-ui Official Docs](https://ui.shadcn.com)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Base UI Docs](https://base-ui.com)
- [NexusCanon AXIS Docs](../../docs/)

---

Built with ❤️ for NexusCanon AXIS
