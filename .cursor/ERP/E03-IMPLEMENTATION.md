# E03 — Implementation Guide & Best Practices
## Building with @workspace/design-system

<!-- AXIS ERP Document Series -->
|  A-Series  |                          |                     |                           |                            |                          |
| :--------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
| Philosophy |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|    E-Series (Design System)    |                                |                                    |
| :----------------------------: | :----------------------------: | :--------------------------------: |
| [E01](./E01-DESIGN-SYSTEM.md)  | [E02](./E02-BLOCKS.md)         |           **[E03]**                |
|         Constitution           |         Block Library          |         Implementation Guide       |

---

> **Derived From:** [E01-DESIGN-SYSTEM.md](./E01-DESIGN-SYSTEM.md), [SHADCN_BEST_PRACTICES_GAP.md](../../packages/design-system/SHADCN_BEST_PRACTICES_GAP.md)
>
> **Tag:** `IMPLEMENTATION` | `BEST-PRACTICES` | `FORMS` | `TABLES` | `THEMING`

---

## Part I: Gap Analysis (Shadcn v4 vs Our Design System)

> **Source:** [SHADCN_BEST_PRACTICES_GAP.md](../../packages/design-system/SHADCN_BEST_PRACTICES_GAP.md)
>
> After analyzing the official shadcn-ui repository (438 registry items), here are the gaps and implementation priorities.

### 1.1 Current State Comparison

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

### 1.2 Priority Matrix

| Priority | Gap | Effort | Impact | Status |
|----------|-----|--------|--------|--------|
| 🔴 P0 | Form Component | Medium | Critical | ✅ Complete |
| 🔴 P0 | Data Table | Medium | Critical | ✅ Complete |
| 🔴 P0 | Block System | High | Critical | ✅ Foundation (3 blocks) |
| 🔴 P0 | Theme System | Medium | High | ✅ Complete (5 themes) |
| 🔴 P0 | Hooks Library | Medium | High | ✅ Complete (15 hooks) |
| 🔴 P0 | Animation System | Medium | High | ✅ Complete |
| 🟡 P1 | Examples | Medium | High | 📋 Planned |
| 🟡 P1 | Natural Language Date | Low | Medium | ✅ Complete |
| 🟡 P1 | DnD Kit | Medium | Medium | ✅ Complete |
| 🟡 P1 | Responsive Drawer | Low | Medium | ✅ Complete |
| 🟢 P2 | Tanstack Form | Medium | Low | 📋 Optional |
| 🟢 P2 | Multiple Icons | Low | Low | 📋 Optional |
| 🟢 P2 | Motion Integration | Medium | Low | ✅ Complete (animations) |
| 🟢 P2 | components.json | Low | Low | 📋 Future |

### 1.3 Shadcn Block Inventory (What We're Missing)

| Category | Count | Examples |
|----------|-------|----------|
| **Sidebars** | 16 | sidebar-01 to sidebar-16 (collapsible, floating, icons, calendar, file tree) |
| **Login/Auth** | 10 | login-01 to login-05, signup-01 to signup-05 |
| **Calendars** | 32 | calendar-01 to calendar-32 (date pickers, range, time, natural language) |
| **OTP** | 5 | otp-01 to otp-05 |
| **Charts** | 60+ | Area, Bar, Line, Pie, Radar, Radial, Tooltip variations |
| **Dashboard** | 1 | dashboard-01 (full dashboard with sidebar, charts, data table) |

### 1.4 Action Plan

#### Phase 1: Critical (Immediate)

```bash
# 1. Add Form Component dependencies
pnpm --filter @workspace/design-system add react-hook-form @hookform/resolvers zod

# 2. Add Data Table dependencies
pnpm --filter @workspace/design-system add @tanstack/react-table

# 3. Create Block System structure
mkdir -p packages/design-system/src/blocks/{sidebars,auth,calendars,charts,dashboards}
```

#### Phase 2: Important (Next Sprint)

```bash
# 4. Add Theme System (5 themes)
mkdir -p packages/design-system/src/styles/themes

# 5. Add Examples Directory
mkdir -p packages/design-system/src/examples

# 6. Add Natural Language Date
pnpm --filter @workspace/design-system add chrono-node
```

#### Phase 3: Nice to Have (Future)

```bash
# 7. Add DnD Kit
pnpm --filter @workspace/design-system add @dnd-kit/core @dnd-kit/sortable

# 8. Add Motion
pnpm --filter @workspace/design-system add motion

# 9. Add components.json for CLI
```

---

## Part II: Hooks & Animations Implementation

### 2.1 React Hooks Library (✅ Complete)

**Location:** `packages/design-system/src/hooks/`

We've implemented 15 production-ready React hooks optimized for Tailwind v4 and modern React patterns:

#### Media Queries & Responsive
- `useMobile` - Mobile device detection (768px breakpoint)
- `useMediaQuery` - Generic media query hook with SSR safety

#### DOM & Browser
- `useClickOutside` - Detect clicks outside elements
- `useEventListener` - Event listener management with cleanup
- `useIntersectionObserver` - Viewport visibility tracking
- `useWindowSize` - Window dimensions tracking
- `useScrollPosition` - Scroll position with throttling

#### State Management
- `useLocalStorage` - Sync state with localStorage
- `useDebounce` - Value debouncing (default 500ms)
- `useThrottle` - Value throttling (default 500ms)
- `usePrevious` - Track previous value
- `useToggle` - Boolean toggle helper

#### Animation & Accessibility
- `useReducedMotion` - Check prefers-reduced-motion
- `useMeasure` - Element dimensions with ResizeObserver

#### Forms & Input
- `useCopyToClipboard` - Clipboard operations

**Usage Example:**
```tsx
import { useMobile, useDebounce, useToggle } from "@workspace/design-system"

function SearchComponent() {
  const isMobile = useMobile()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [isOpen, toggleOpen] = useToggle(false)

  useEffect(() => {
    if (debouncedSearch) {
      // Perform search
    }
  }, [debouncedSearch])

  return isMobile ? <MobileSearch /> : <DesktopSearch />
}
```

### 2.2 Animation System (✅ Complete)

**Location:** `packages/design-system/src/animations/`

Comprehensive animation utilities for Framer Motion:

#### Variants (`variants.ts`)
- **Fade variants:** `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- **Scale variants:** `scaleIn`, `scaleUp`, `scaleDown`
- **Slide variants:** `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`
- **Blur variants:** `blurIn`, `blurInUp`, `blurInDown`
- **Stagger containers:** `staggerContainer`, `staggerFast`, `staggerSlow`
- **Utility functions:** `createFadeVariant()`, `createScaleVariant()`, `createBlurVariant()`

#### Transitions (`transitions.ts`)
- **Spring presets:** `springDefault`, `springBouncy`, `springSmooth`, `springSnappy`, `springGentle`
- **Tween presets:** `tweenFast` (150ms), `tweenDefault` (300ms), `tweenSlow` (500ms)
- **Easing transitions:** `easeInOut`, `easeIn`, `easeOut`
- **Utility functions:** `createSpring()`, `createTween()`, `withDelay()`, `createStagger()`

#### Easings (`easings.ts`)
- **Standard:** `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`
- **Custom cubic:** `easeInOutCubic`, `easeInOutQuart`, `easeOutBack`
- **Material Design:** `materialStandard`, `materialDecelerate`, `materialAccelerate`
- **iOS:** `iosStandard`, `iosDecelerate`, `iosAccelerate`

**Usage Example:**
```tsx
import { motion } from "motion/react"
import { fadeInUp, springDefault } from "@workspace/design-system/animations"

function AnimatedCard() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={springDefault}
      className="rounded-lg border bg-card p-6"
    >
      <h3>Animated Content</h3>
    </motion.div>
  )
}
```

### 2.3 Implementation Status

| Feature | Files | Status | Notes |
|---------|-------|--------|-------|
| Hooks Library | 15 hooks | ✅ Complete | SSR-safe, TypeScript strict |
| Animation Variants | 20+ variants | ✅ Complete | Framer Motion compatible |
| Transitions | 10+ presets | ✅ Complete | Matches Tailwind durations |
| Easings | 20+ curves | ✅ Complete | Standard + Material + iOS |

---

## Part III: Form Component Implementation

### 2.1 Dependencies

```bash
# Add to @workspace/design-system
pnpm --filter @workspace/design-system add react-hook-form @hookform/resolvers zod
```

### 2.2 Form Component Architecture

```
packages/design-system/src/components/
├── form.tsx           # Main Form component
└── form/
    ├── form-field.tsx
    ├── form-item.tsx
    ├── form-label.tsx
    ├── form-control.tsx
    ├── form-description.tsx
    ├── form-message.tsx
    └── index.ts
```

### 2.3 Form Component Implementation

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

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
```

### 2.4 Form Usage Example

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
} from "@workspace/design-system"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export function CustomerForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                Enter the customer's full name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
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

---

## Part IV: Data Table Implementation

### 3.1 Dependencies

```bash
# Add to @workspace/design-system
pnpm --filter @workspace/design-system add @tanstack/react-table
```

### 3.2 Data Table Architecture

```
packages/design-system/src/components/
├── data-table.tsx           # Main DataTable component
└── data-table/
    ├── data-table-column-header.tsx
    ├── data-table-pagination.tsx
    ├── data-table-toolbar.tsx
    ├── data-table-faceted-filter.tsx
    ├── data-table-view-options.tsx
    └── index.ts
```

### 3.3 Data Table Core Implementation

```tsx
// packages/design-system/src/components/data-table.tsx

"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

### 3.4 Column Header with Sorting

```tsx
// packages/design-system/src/components/data-table/data-table-column-header.tsx

import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

### 3.5 Pagination Component

```tsx
// packages/design-system/src/components/data-table/data-table-pagination.tsx

import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## Part V: Theme System Implementation

### 4.1 Theme Architecture

```
packages/design-system/src/styles/
├── globals.css          # Base theme (current)
├── themes/
│   ├── stone.css        # Stone theme
│   ├── zinc.css         # Zinc theme
│   ├── neutral.css      # Neutral theme
│   ├── gray.css         # Gray theme
│   └── slate.css        # Slate theme
└── index.css            # Theme exports
```

### 4.2 Theme Variables Template

```css
/* packages/design-system/src/styles/themes/stone.css */

.theme-stone {
  --background: 0 0% 100%;
  --foreground: 20 14.3% 4.1%;
  --card: 0 0% 100%;
  --card-foreground: 20 14.3% 4.1%;
  --popover: 0 0% 100%;
  --popover-foreground: 20 14.3% 4.1%;
  --primary: 24 9.8% 10%;
  --primary-foreground: 60 9.1% 97.8%;
  --secondary: 60 4.8% 95.9%;
  --secondary-foreground: 24 9.8% 10%;
  --muted: 60 4.8% 95.9%;
  --muted-foreground: 25 5.3% 44.7%;
  --accent: 60 4.8% 95.9%;
  --accent-foreground: 24 9.8% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 60 9.1% 97.8%;
  --border: 20 5.9% 90%;
  --input: 20 5.9% 90%;
  --ring: 20 14.3% 4.1%;
  --radius: 0.5rem;
}

.theme-stone.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 60 9.1% 97.8%;
  --card: 20 14.3% 4.1%;
  --card-foreground: 60 9.1% 97.8%;
  --popover: 20 14.3% 4.1%;
  --popover-foreground: 60 9.1% 97.8%;
  --primary: 60 9.1% 97.8%;
  --primary-foreground: 24 9.8% 10%;
  --secondary: 12 6.5% 15.1%;
  --secondary-foreground: 60 9.1% 97.8%;
  --muted: 12 6.5% 15.1%;
  --muted-foreground: 24 5.4% 63.9%;
  --accent: 12 6.5% 15.1%;
  --accent-foreground: 60 9.1% 97.8%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 60 9.1% 97.8%;
  --border: 12 6.5% 15.1%;
  --input: 12 6.5% 15.1%;
  --ring: 24 5.7% 82.9%;
}
```

### 4.3 Theme Provider

```tsx
// packages/design-system/src/components/theme-provider.tsx

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type Theme = "stone" | "zinc" | "neutral" | "gray" | "slate"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "stone",
  storageKey = "axis-theme",
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      storageKey={storageKey}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

---

## Part VI: Additional Features Implementation

### 5.1 Natural Language Date Picker

**What shadcn has:** `calendar-29` - Natural language date picker using `chrono-node`

```bash
# Dependencies
pnpm --filter @workspace/design-system add chrono-node
```

```tsx
// packages/design-system/src/components/natural-date-input.tsx

"use client"

import * as React from "react"
import * as chrono from "chrono-node"
import { format } from "date-fns"
import { Calendar } from "@/components/calendar"
import { Input } from "@/components/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { cn } from "@/lib/utils"

interface NaturalDateInputProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
}

export function NaturalDateInput({
  value,
  onChange,
  placeholder = "Type a date like 'next friday' or 'in 2 weeks'",
}: NaturalDateInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputValue(text)

    // Parse natural language
    const parsed = chrono.parseDate(text)
    if (parsed) {
      onChange?.(parsed)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={inputValue || (value ? format(value, "PPP") : "")}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(!value && "text-muted-foreground")}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
```

**Usage:**
```tsx
<NaturalDateInput
  value={dueDate}
  onChange={setDueDate}
  placeholder="e.g., 'next friday', 'in 2 weeks', 'tomorrow'"
/>
```

---

### 5.2 Drag & Drop (DnD Kit Integration)

**What shadcn has:** `dashboard-01` uses `@dnd-kit/core`, `@dnd-kit/sortable`

```bash
# Dependencies
pnpm --filter @workspace/design-system add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

```tsx
// packages/design-system/src/components/sortable-list.tsx

"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableItemProps {
  id: string
  children: React.ReactNode
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-3",
        isDragging && "opacity-50"
      )}
    >
      <button
        className="cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      {children}
    </div>
  )
}

interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T) => React.ReactNode
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      onReorder(arrayMove(items, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

**Usage:**
```tsx
<SortableList
  items={tasks}
  onReorder={setTasks}
  renderItem={(task) => (
    <div className="flex-1">
      <span>{task.title}</span>
    </div>
  )}
/>
```

---

### 5.3 Responsive Drawer/Dialog Pattern

**What shadcn has:** `drawer-dialog` - Shows Dialog on desktop, Drawer on mobile

```tsx
// packages/design-system/src/components/responsive-modal.tsx

"use client"

import * as React from "react"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/drawer"

interface ResponsiveModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}

export function ResponsiveModal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: ResponsiveModalProps) {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
```

**Usage:**
```tsx
<ResponsiveModal
  title="Edit Profile"
  description="Make changes to your profile here."
  trigger={<Button>Edit Profile</Button>}
>
  <ProfileForm />
</ResponsiveModal>
```

---

## Part VII: Component Development Guidelines

### 6.1 Adding a New Component

```bash
# Step 1: Check if shadcn has it
# Visit ui.shadcn.com or use shadcn MCP

# Step 2: Create the component file
touch packages/design-system/src/components/new-component.tsx

# Step 3: Implement following the pattern
```

### 6.2 Component Template

```tsx
// packages/design-system/src/components/new-component.tsx

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const newComponentVariants = cva(
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "default-variant-classes",
        secondary: "secondary-variant-classes",
      },
      size: {
        default: "default-size-classes",
        sm: "small-size-classes",
        lg: "large-size-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface NewComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newComponentVariants> {
  // Additional props
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(newComponentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
NewComponent.displayName = "NewComponent"

export { NewComponent, newComponentVariants }
```

### 6.3 Export from Index

```tsx
// packages/design-system/src/index.ts

// Add to exports
export * from "./components/new-component"
```

### 6.4 Verification Checklist

```bash
# Run type check
pnpm --filter @workspace/design-system check-types

# Run lint
pnpm --filter @workspace/design-system lint

# Verify export
pnpm --filter @workspace/design-system build
```

---

## Part VIII: Best Practices

### 7.1 Component Composition

```tsx
// ✅ CORRECT - Compose from design-system
import { Card, CardHeader, CardContent, Button, cn } from "@workspace/design-system"

export function FeatureCard({ title, description, onAction }) {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
        <Button onClick={onAction} className="mt-4">
          Learn More
        </Button>
      </CardContent>
    </Card>
  )
}

// ❌ WRONG - Creating custom Card
export function FeatureCard({ title, description }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow">
      {/* ... */}
    </div>
  )
}
```

### 7.2 Variant Usage

```tsx
// ✅ CORRECT - Use existing variants
<Button variant="destructive" size="sm">Delete</Button>
<Badge variant="secondary">Draft</Badge>

// ❌ WRONG - Custom inline styles
<Button className="bg-red-500 text-white text-xs px-2 py-1">Delete</Button>
```

### 7.3 Responsive Design

```tsx
// ✅ CORRECT - Tailwind responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// ✅ CORRECT - useMobile hook for complex logic
const isMobile = useMobile()
return isMobile ? <MobileNav /> : <DesktopNav />
```

### 7.4 Accessibility

```tsx
// ✅ CORRECT - Proper labels and ARIA
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" aria-describedby="email-description" {...field} />
      </FormControl>
      <FormDescription id="email-description">
        We'll never share your email.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

// ❌ WRONG - Missing labels
<Input type="email" placeholder="Email" />
```

---

## Part IX: Testing Guidelines

### 8.1 Component Testing

```tsx
// packages/design-system/src/components/__tests__/button.test.tsx

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "../button"

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-primary")
  })

  it("renders with destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-destructive")
  })

  it("handles click events", async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
```

### 8.2 Visual Regression Testing

```tsx
// packages/design-system/src/components/__tests__/button.stories.tsx

import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../button"

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
```

---

## Part X: Migration Guide

### 9.1 From Local Components to Design System

```tsx
// BEFORE: Local component
// apps/web/src/components/ui/button.tsx
import { cn } from "@/lib/utils"

export function Button({ className, ...props }) {
  return (
    <button
      className={cn("bg-blue-500 text-white px-4 py-2 rounded", className)}
      {...props}
    />
  )
}

// AFTER: Design system import
// apps/web/src/components/feature.tsx
import { Button } from "@workspace/design-system"

export function Feature() {
  return <Button variant="default">Click me</Button>
}
```

### 9.2 Migration Checklist

1. **Identify local components**
   ```bash
   # Find all local UI components
   find apps/web/src/components/ui -name "*.tsx"
   ```

2. **Map to design-system equivalents**
   | Local | Design System |
   |-------|--------------|
   | `components/ui/button.tsx` | `@workspace/design-system` Button |
   | `components/ui/card.tsx` | `@workspace/design-system` Card |

3. **Update imports**
   ```tsx
   // Find and replace
   - import { Button } from "@/components/ui/button"
   + import { Button } from "@workspace/design-system"
   ```

4. **Delete local components**
   ```bash
   rm -rf apps/web/src/components/ui/
   ```

5. **Verify**
   ```bash
   pnpm check-types
   pnpm lint
   ```

---

## Part XI: Troubleshooting

### 10.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Cannot find module '@workspace/design-system'` | Missing workspace link | Run `pnpm install` |
| TypeScript errors in components | Missing types | Check `tsconfig.json` paths |
| Styles not applying | Missing CSS import | Import `globals.css` in app |
| Dark mode not working | Missing ThemeProvider | Wrap app in ThemeProvider |

### 10.2 Debug Commands

```bash
# Check workspace links
pnpm list --filter @workspace/design-system

# Verify TypeScript
pnpm --filter @workspace/design-system check-types

# Check exports
pnpm --filter @workspace/design-system build

# Verify CSS
cat packages/design-system/src/styles/globals.css | head -50
```

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | ✅ Implementation Complete (All P0 + P1 features) |
| **Version** | 0.3.0 |
| **Owner** | Team 1 (Infrastructure) |
| **Dependencies** | [E01](./E01-DESIGN-SYSTEM.md), [E02](./E02-BLOCKS.md) |
| **Features Implemented** | Form, DataTable, Themes, Natural Date, DnD, Responsive Modal, 15 Hooks, Animation System |
| **Type Check** | ✅ 0 errors |
| **Last Updated** | 2026-01-23 |

---

> *"Implementation is where philosophy meets reality. Follow the guide, trust the patterns, ship with confidence."*
