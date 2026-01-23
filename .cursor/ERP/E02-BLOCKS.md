# E02 — Block Library & Patterns
## Pre-Built UI Compositions for AXIS Applications

<!-- AXIS ERP Document Series -->
|  A-Series  |                          |                     |                           |                            |                          |
| :--------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
| Philosophy |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|    E-Series (Design System)    |                                |                                    |
| :----------------------------: | :----------------------------: | :--------------------------------: |
| [E01](./E01-DESIGN-SYSTEM.md)  |           **[E02]**            | [E03](./E03-IMPLEMENTATION.md)     |
|         Constitution           |         Block Library          |         Implementation Guide       |

---

> **Derived From:** [E01-DESIGN-SYSTEM.md](./E01-DESIGN-SYSTEM.md), [B10-UX.md](./B10-UX.md)
>
> **Tag:** `BLOCKS` | `PATTERNS` | `COMPOSITIONS` | `UX`

---

## The Block System Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE BLOCK HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PRIMITIVES (E01)                                                           │
│   └── Button, Card, Input, Table, Dialog, etc.                               │
│       │                                                                      │
│       ▼                                                                      │
│   BLOCKS (E02 - This Document)                                               │
│   └── LoginForm, DataFortress, Sidebar, Dashboard, etc.                      │
│       │                                                                      │
│       ▼                                                                      │
│   PAGES (apps/)                                                              │
│   └── /invoices, /customers, /dashboard, etc.                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Blocks are pre-composed UI patterns** that combine primitives from `@workspace/design-system` into reusable, production-ready compositions.

---

## Part I: Block Categories

### 1.1 Block Taxonomy

| Category | Purpose | Examples |
|----------|---------|----------|
| **Auth** | Authentication flows | Login, Register, Forgot Password, OTP |
| **Sidebars** | Navigation patterns | App Sidebar, Collapsible, Multi-level |
| **Dashboards** | Data overview layouts | Stats Cards, Charts Grid, KPI Panels |
| **Forms** | Data entry patterns | CRUD Forms, Multi-step, Wizard |
| **Tables** | Data display patterns | DataFortress, Sortable, Filterable |
| **Cards** | Content containers | Stat Card, Profile Card, Action Card |
| **Calendars** | Date/time patterns | Event Calendar, Date Range Picker |
| **Charts** | Data visualization | Line, Bar, Pie, Area, Composed |
| **Empty States** | No-data patterns | Empty Table, No Results, First Use |
| **Error States** | Error patterns | 404, 500, Permission Denied |

---

## Part II: Auth Blocks

### 2.1 Login Block

```tsx
// Location: @workspace/shared-ui/blocks/auth/login-form.tsx

import { 
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  Input, Label, Button, cn 
} from "@workspace/design-system"

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Sign in to AXIS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
        <Button variant="link" className="text-sm">
          Forgot password?
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 2.2 Auth Block Variants

| Block | Description | Status |
|-------|-------------|--------|
| `LoginForm` | Email/password login | 📋 Planned |
| `RegisterForm` | New user registration | 📋 Planned |
| `ForgotPasswordForm` | Password reset request | 📋 Planned |
| `ResetPasswordForm` | Set new password | 📋 Planned |
| `OTPForm` | One-time password entry | 📋 Planned |
| `MagicLinkForm` | Passwordless login | 📋 Planned |

---

## Part III: Sidebar Blocks

### 3.1 Application Sidebar

```tsx
// Location: @workspace/shared-ui/blocks/sidebars/app-sidebar.tsx

import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  cn
} from "@workspace/design-system"

export function AppSidebar({ navigation, user }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <a href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
```

### 3.2 Sidebar Block Variants

| Block | Description | Persona | Status |
|-------|-------------|---------|--------|
| `AppSidebar` | Full application sidebar | Both | 📋 Planned |
| `CollapsibleSidebar` | Collapsible with icons | Cobalt | 📋 Planned |
| `MiniSidebar` | Icon-only sidebar | Cobalt | 📋 Planned |
| `QuorumSidebar` | Analysis-focused nav | Quorum | 📋 Planned |

---

## Part IV: Dashboard Blocks

### 4.1 Stats Grid

```tsx
// Location: @workspace/shared-ui/blocks/dashboards/stats-grid.tsx

import { Card, CardHeader, CardTitle, CardContent, cn } from "@workspace/design-system"

interface StatCardProps {
  title: string
  value: string | number
  change?: { value: number; trend: 'up' | 'down' }
  icon?: React.ComponentType
}

export function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs",
            change.trend === 'up' ? "text-green-600" : "text-red-600"
          )}>
            {change.trend === 'up' ? '+' : ''}{change.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsGrid({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  )
}
```

### 4.2 Dashboard Block Variants

| Block | Description | Persona | Status |
|-------|-------------|---------|--------|
| `StatsGrid` | KPI overview cards | Both | 📋 Planned |
| `ChartsGrid` | Multiple chart layout | Quorum | 📋 Planned |
| `ActivityFeed` | Recent actions list | Both | 📋 Planned |
| `QuickActions` | SUMMIT buttons grid | Cobalt | 📋 Planned |
| `AlertsPanel` | PDR alerts display | Both | 📋 Planned |

---

## Part V: Table Blocks (DataFortress)

### 5.1 DataFortress Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATAFORTRESS BLOCK                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  TOOLBAR                                                             │   │
│   │  ┌──────────┬─────────────┬─────────────┬──────────────────────────┐│   │
│   │  │ Search   │ Filters     │ View Toggle │ Actions (Export, New)    ││   │
│   │  └──────────┴─────────────┴─────────────┴──────────────────────────┘│   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  TABLE                                                               │   │
│   │  ┌──────────┬───────────┬───────────┬───────────┬──────────────────┐│   │
│   │  │ □ Select │ Column 1 ↕│ Column 2 ↕│ Column 3 ↕│ Actions          ││   │
│   │  ├──────────┼───────────┼───────────┼───────────┼──────────────────┤│   │
│   │  │ □        │ Data      │ Data      │ Data      │ ⋮ Menu           ││   │
│   │  │ □        │ Data      │ Data      │ Data      │ ⋮ Menu           ││   │
│   │  │ □        │ Data      │ Data      │ Data      │ ⋮ Menu           ││   │
│   │  └──────────┴───────────┴───────────┴───────────┴──────────────────┘│   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  PAGINATION                                                          │   │
│   │  ┌──────────────────────────────────────────────────────────────────┐│   │
│   │  │ Showing 1-10 of 100    │ Rows per page: [10▼]  │ < 1 2 3 ... >   ││   │
│   │  └──────────────────────────────────────────────────────────────────┘│   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 DataFortress Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Column Sorting** | Click header to sort | 🔴 P0 |
| **Column Filtering** | Per-column filters | 🔴 P0 |
| **Global Search** | Search across columns | 🔴 P0 |
| **Row Selection** | Checkbox selection | 🔴 P0 |
| **Pagination** | Server-side pagination | 🔴 P0 |
| **Column Visibility** | Show/hide columns | 🟡 P1 |
| **Column Reorder** | Drag to reorder | 🟡 P1 |
| **Row Expansion** | Expandable row details | 🟡 P1 |
| **Bulk Actions** | Actions on selection | 🟡 P1 |
| **Export** | CSV/Excel export | 🟡 P1 |

### 5.3 DataFortress Usage

```tsx
// Location: @workspace/shared-ui/blocks/tables/data-fortress.tsx

import { DataFortress, createColumnHelper } from "@workspace/shared-ui/blocks"

const columnHelper = createColumnHelper<Invoice>()

const columns = [
  columnHelper.accessor("number", {
    header: "Invoice #",
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor("customer.name", {
    header: "Customer",
  }),
  columnHelper.accessor("total", {
    header: "Amount",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
]

export function InvoiceTable() {
  return (
    <DataFortress
      columns={columns}
      data={invoices}
      searchable
      filterable
      selectable
      pagination={{ pageSize: 10 }}
      onRowClick={(row) => router.push(`/invoices/${row.id}`)}
    />
  )
}
```

---

## Part VI: Form Blocks

### 6.1 CRUD Form Pattern

```tsx
// Location: @workspace/shared-ui/blocks/forms/crud-form.tsx

import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  Button, Input, Label, Select, cn
} from "@workspace/design-system"

interface CrudFormProps<T> {
  mode: 'create' | 'edit' | 'view'
  data?: T
  schema: ZodSchema<T>
  onSubmit: (data: T) => Promise<void>
  onCancel: () => void
}

export function CrudForm<T>({ mode, data, schema, onSubmit, onCancel }: CrudFormProps<T>) {
  const isReadOnly = mode === 'view'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' && 'Create New'}
          {mode === 'edit' && 'Edit'}
          {mode === 'view' && 'View Details'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Form fields generated from schema */}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {!isReadOnly && (
          <Button type="submit">
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```

### 6.2 Form Block Variants

| Block | Description | Status |
|-------|-------------|--------|
| `CrudForm` | Create/Read/Update form | 📋 Planned |
| `WizardForm` | Multi-step wizard | 📋 Planned |
| `InlineEditForm` | Edit in place | 📋 Planned |
| `SearchForm` | Advanced search | 📋 Planned |
| `FilterForm` | Filter panel | 📋 Planned |

---

## Part VII: Empty & Error States

### 7.1 Empty State Block

```tsx
// Location: @workspace/shared-ui/blocks/states/empty-state.tsx

import { Empty, Button, cn } from "@workspace/design-system"

interface EmptyStateProps {
  icon?: React.ComponentType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

### 7.2 State Block Variants

| Block | Description | Status |
|-------|-------------|--------|
| `EmptyState` | No data to display | 📋 Planned |
| `NoResults` | Search returned nothing | 📋 Planned |
| `FirstUse` | Onboarding prompt | 📋 Planned |
| `Error404` | Page not found | 📋 Planned |
| `Error500` | Server error | 📋 Planned |
| `PermissionDenied` | Access denied | 📋 Planned |

---

## Part VIII: Quorum vs Cobalt Blocks

### 8.1 Persona-Specific Patterns

| Persona | Block Style | Key Features |
|---------|-------------|--------------|
| **Quorum** | Analysis-focused | 6W1H Manifests, Drill-down, CommandK |
| **Cobalt** | Execution-focused | SUMMIT buttons, Predictive forms, Minimal clicks |

### 8.2 Quorum Blocks (Analysis)

```tsx
// CommandK Palette - Quorum's power tool
<CommandPalette
  commands={[
    { id: 'search', label: 'Search invoices...', action: searchInvoices },
    { id: 'drill', label: 'Drill into AR aging', action: drillARAging },
    { id: 'manifest', label: 'Show 6W1H manifest', action: showManifest },
  ]}
/>

// 6W1H Manifest Card
<ManifestCard
  who={event.actor}
  what={event.action}
  when={event.timestamp}
  where={event.location}
  why={event.reason}
  which={event.options}
  how={event.method}
/>
```

### 8.3 Cobalt Blocks (Execution)

```tsx
// SUMMIT Button - One tap, done
<SummitButton
  action="create-invoice"
  label="New Invoice"
  predictedValues={{ customer: lastCustomer, items: frequentItems }}
/>

// Quick Action Grid
<QuickActions
  actions={[
    { icon: Plus, label: 'New Invoice', href: '/invoices/new' },
    { icon: Package, label: 'Receive Stock', href: '/inventory/receive' },
    { icon: CreditCard, label: 'Record Payment', href: '/payments/new' },
  ]}
/>
```

---

## Part IX: Block Registry

### 9.1 Block Index

| Category | Block | Location | Status |
|----------|-------|----------|--------|
| Auth | `LoginForm` | `blocks/auth/login-form.tsx` | 📋 |
| Auth | `RegisterForm` | `blocks/auth/register-form.tsx` | 📋 |
| Sidebar | `AppSidebar` | `blocks/sidebars/app-sidebar.tsx` | 📋 |
| Dashboard | `StatsGrid` | `blocks/dashboards/stats-grid.tsx` | 📋 |
| Dashboard | `ChartsGrid` | `blocks/dashboards/charts-grid.tsx` | 📋 |
| Table | `DataFortress` | `blocks/tables/data-fortress.tsx` | 📋 |
| Form | `CrudForm` | `blocks/forms/crud-form.tsx` | 📋 |
| Form | `WizardForm` | `blocks/forms/wizard-form.tsx` | 📋 |
| State | `EmptyState` | `blocks/states/empty-state.tsx` | 📋 |
| State | `Error404` | `blocks/states/error-404.tsx` | 📋 |

### 9.2 Block Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BLOCK DEPENDENCIES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   DataFortress                                                               │
│   ├── @tanstack/react-table (P0 - Required)                                  │
│   ├── Table, Button, Input, Select, Checkbox (from design-system)            │
│   └── Pagination, DropdownMenu (from design-system)                          │
│                                                                              │
│   CrudForm                                                                   │
│   ├── react-hook-form (P0 - Required)                                        │
│   ├── @hookform/resolvers/zod (P0 - Required)                                │
│   └── Input, Select, Button, Label (from design-system)                      │
│                                                                              │
│   CommandPalette                                                             │
│   └── Command (from design-system)                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part X: Implementation Roadmap

### Phase 1: Foundation Blocks (P0)

| Block | Dependencies | Effort |
|-------|--------------|--------|
| `DataFortress` | @tanstack/react-table | 3 days |
| `CrudForm` | react-hook-form, zod | 2 days |
| `AppSidebar` | None | 1 day |
| `StatsGrid` | None | 0.5 days |
| `EmptyState` | None | 0.5 days |

### Phase 2: Enhanced Blocks (P1)

| Block | Dependencies | Effort |
|-------|--------------|--------|
| `WizardForm` | react-hook-form | 2 days |
| `ChartsGrid` | recharts | 2 days |
| `CommandPalette` | None | 1 day |
| `ManifestCard` | None | 1 day |

### Phase 3: Advanced Blocks (P2)

| Block | Dependencies | Effort |
|-------|--------------|--------|
| `DragDropList` | @dnd-kit | 2 days |
| `CalendarView` | react-day-picker | 2 days |
| `KanbanBoard` | @dnd-kit | 3 days |

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | ✅ Foundation Complete (3 blocks implemented) |
| **Version** | 0.1.0 |
| **Owner** | Team 2 (UX) |
| **Dependencies** | [E01](./E01-DESIGN-SYSTEM.md), [E03](./E03-IMPLEMENTATION.md) |
| **Blocks Implemented** | AppSidebar01, LoginForm01, StatsGrid01 |
| **Last Updated** | 2026-01-23 |

---

> *"Blocks are the vocabulary of AXIS UX. Primitives are letters, blocks are words, pages are sentences. Build with blocks, not from scratch."*
