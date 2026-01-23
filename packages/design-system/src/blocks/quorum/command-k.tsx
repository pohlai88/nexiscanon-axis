"use client"

/**
 * CommandK (⌘K) - Quorum Kernel Command Palette
 *
 * A comprehensive command palette for white-collar users (CFO, Controller, Auditor, etc.)
 * Implements A01-CANONICAL.md §4 — "Surface the truth before they ask"
 *
 * Features:
 * - Global fuzzy search across all entities
 * - Recent actions history
 * - Suggested next actions based on context
 * - Keyboard shortcuts for power users
 * - Quick navigation to any module
 *
 * @example
 * ```tsx
 * import { CommandK, useCommandK } from "@workspace/design-system"
 *
 * function App() {
 *   const { open, setOpen } = useCommandK()
 *
 *   return (
 *     <CommandK
 *       open={open}
 *       onOpenChange={setOpen}
 *       recentItems={recentItems}
 *       suggestions={suggestions}
 *       onSearch={handleSearch}
 *       onNavigate={handleNavigate}
 *     />
 *   )
 * }
 * ```
 */

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/command"
import { Badge } from "@/components/badge"
import { cn } from "@/lib/utils"
import {
  Search,
  Clock,
  Lightbulb,
  FileText,
  Users,
  Package,
  DollarSign,
  ArrowRight,
  Calculator,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type CommandKItemType =
  | "navigation"
  | "action"
  | "entity"
  | "search"
  | "document"
  | "customer"
  | "supplier"
  | "item"
  | "invoice"
  | "order"

export interface CommandKItem {
  id: string
  type: CommandKItemType
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  metadata?: Record<string, unknown>
  onSelect?: () => void
}

export interface CommandKGroup {
  id: string
  heading: string
  items: CommandKItem[]
  priority?: number
}

export interface CommandKProps {
  /** Controlled open state */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Recently accessed items */
  recentItems?: CommandKItem[]
  /** Suggested actions based on context */
  suggestions?: CommandKItem[]
  /** Navigation links */
  navigation?: CommandKItem[]
  /** Quick actions */
  quickActions?: CommandKItem[]
  /** Custom groups */
  groups?: CommandKGroup[]
  /** Search callback - return search results */
  onSearch?: (query: string) => Promise<CommandKItem[]> | CommandKItem[]
  /** Navigation callback */
  onNavigate?: (item: CommandKItem) => void
  /** Loading state during search */
  isSearching?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Empty state message */
  emptyMessage?: string
  /** Custom className */
  className?: string
}

// ============================================================================
// Icon Mapping
// ============================================================================

const TYPE_ICONS: Record<CommandKItemType, React.ComponentType<{ className?: string }>> = {
  navigation: ArrowRight,
  action: Lightbulb,
  entity: Package,
  search: Search,
  document: FileText,
  customer: Users,
  supplier: Users,
  item: Package,
  invoice: DollarSign,
  order: FileText,
}

// ============================================================================
// CommandK Component
// ============================================================================

export function CommandK({
  open,
  onOpenChange,
  recentItems = [],
  suggestions = [],
  navigation = [],
  quickActions = [],
  groups = [],
  onSearch,
  onNavigate,
  isSearching = false,
  placeholder = "Search anything... ⌘K",
  emptyMessage = "No results found. Try a different search term.",
  className,
}: CommandKProps) {
  const [query, setQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<CommandKItem[]>([])
  const [localSearching, setLocalSearching] = React.useState(false)

  // Debounced search
  React.useEffect(() => {
    if (!query || !onSearch) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLocalSearching(true)
      try {
        const results = await onSearch(query)
        setSearchResults(results)
      } catch (error) {
        console.error("CommandK search error:", error)
        setSearchResults([])
      } finally {
        setLocalSearching(false)
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch])

  // Reset query when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setSearchResults([])
    }
  }, [open])

  const handleSelect = React.useCallback(
    (item: CommandKItem) => {
      if (item.onSelect) {
        item.onSelect()
      }
      if (onNavigate) {
        onNavigate(item)
      }
      onOpenChange(false)
    },
    [onNavigate, onOpenChange]
  )

  const renderItem = React.useCallback(
    (item: CommandKItem) => {
      const Icon = item.icon || TYPE_ICONS[item.type] || Search
      return (
        <CommandItem
          key={item.id}
          value={`${item.label} ${item.description || ""}`}
          onSelect={() => handleSelect(item)}
          className="flex items-center gap-3 px-3 py-2"
        >
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-1 flex-col">
            <span className="font-medium">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            )}
          </div>
          {item.badge && (
            <Badge variant={item.badgeVariant || "secondary"} className="ml-2">
              {item.badge}
            </Badge>
          )}
          {item.shortcut && (
            <CommandShortcut>{item.shortcut}</CommandShortcut>
          )}
        </CommandItem>
      )
    },
    [handleSelect]
  )

  const showLoading = isSearching || localSearching
  const showRecent = !query && recentItems.length > 0
  const showSuggestions = !query && suggestions.length > 0
  const showNavigation = !query && navigation.length > 0
  const showQuickActions = !query && quickActions.length > 0
  const showSearchResults = query && searchResults.length > 0
  const showCustomGroups = !query && groups.length > 0

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search, navigate, or run commands"
    >
      <Command
        className={cn(
          "rounded-lg border-0 shadow-2xl",
          "[&_[data-slot=command-input-wrapper]]:border-b",
          className
        )}
        shouldFilter={!onSearch}
      >
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px]">
          {/* Loading State */}
          {showLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}

          {/* Empty State */}
          {!showLoading && query && searchResults.length === 0 && (
            <CommandEmpty className="py-6 text-center">
              <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </CommandEmpty>
          )}

          {/* Search Results */}
          {!showLoading && showSearchResults && (
            <CommandGroup heading="Search Results">
              {searchResults.map(renderItem)}
            </CommandGroup>
          )}

          {/* Recent Items */}
          {!showLoading && showRecent && (
            <>
              <CommandGroup heading="Recent">
                {recentItems.slice(0, 5).map((item) => ({
                  ...item,
                  icon: item.icon || Clock,
                })).map(renderItem)}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Suggestions */}
          {!showLoading && showSuggestions && (
            <>
              <CommandGroup heading="Suggestions">
                {suggestions.slice(0, 5).map((item) => ({
                  ...item,
                  icon: item.icon || Lightbulb,
                })).map(renderItem)}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Quick Actions */}
          {!showLoading && showQuickActions && (
            <>
              <CommandGroup heading="Quick Actions">
                {quickActions.map(renderItem)}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Navigation */}
          {!showLoading && showNavigation && (
            <>
              <CommandGroup heading="Navigation">
                {navigation.map(renderItem)}
              </CommandGroup>
            </>
          )}

          {/* Custom Groups */}
          {!showLoading &&
            showCustomGroups &&
            groups
              .sort((a, b) => (a.priority || 0) - (b.priority || 0))
              .map((group, index) => (
                <React.Fragment key={group.id}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.heading}>
                    {group.items.map(renderItem)}
                  </CommandGroup>
                </React.Fragment>
              ))}
        </CommandList>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  )
}

// ============================================================================
// useCommandK Hook
// ============================================================================

export interface UseCommandKOptions {
  /** Keyboard shortcut key (default: "k") */
  shortcutKey?: string
  /** Require meta key (default: true) */
  requireMeta?: boolean
}

export function useCommandK(options: UseCommandKOptions = {}) {
  const { shortcutKey = "k", requireMeta = true } = options
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const metaPressed = e.metaKey || e.ctrlKey
      const keyMatch = e.key.toLowerCase() === shortcutKey.toLowerCase()

      if (keyMatch && (requireMeta ? metaPressed : true)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [shortcutKey, requireMeta])

  return { open, setOpen, toggle: () => setOpen((prev) => !prev) }
}

// ============================================================================
// Preset Action Builders (A01-CANONICAL.md aligned)
// ============================================================================

export const CommandKActions = {
  /** Create navigation item */
  navigation: (
    id: string,
    label: string,
    path: string,
    options?: Partial<CommandKItem>
  ): CommandKItem => ({
    id,
    type: "navigation",
    label,
    description: path,
    onSelect: () => {
      if (typeof window !== "undefined") {
        window.location.href = path
      }
    },
    ...options,
  }),

  /** Create document action */
  document: (
    id: string,
    label: string,
    docType: string,
    docId: string,
    options?: Partial<CommandKItem>
  ): CommandKItem => ({
    id,
    type: "document",
    label,
    description: `${docType} #${docId}`,
    icon: FileText,
    ...options,
  }),

  /** Create quick action */
  action: (
    id: string,
    label: string,
    onSelect: () => void,
    options?: Partial<CommandKItem>
  ): CommandKItem => ({
    id,
    type: "action",
    label,
    onSelect,
    ...options,
  }),

  /** Create exception/alert item (Quorum: Exception Hunting) */
  exception: (
    id: string,
    label: string,
    severity: "high" | "medium" | "low",
    options?: Partial<CommandKItem>
  ): CommandKItem => ({
    id,
    type: "action",
    label,
    icon: AlertTriangle,
    badge: severity.toUpperCase(),
    badgeVariant: severity === "high" ? "destructive" : "secondary",
    ...options,
  }),

  /** Create trend item (Quorum: Trend Analysis) */
  trend: (
    id: string,
    label: string,
    change: string,
    options?: Partial<CommandKItem>
  ): CommandKItem => ({
    id,
    type: "action",
    label,
    icon: TrendingUp,
    badge: change,
    badgeVariant: change.startsWith("+") ? "default" : "destructive",
    ...options,
  }),

  /** Create approval item (A01 §8 AFANDA: Approval Queue) */
  approval: (
    id: string,
    label: string,
    status: "pending" | "approved" | "rejected",
    options?: Partial<CommandKItem>
  ): CommandKItem => ({
    id,
    type: "action",
    label,
    icon: status === "approved" ? CheckCircle : status === "rejected" ? XCircle : Clock,
    badge: status.toUpperCase(),
    badgeVariant: status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary",
    ...options,
  }),

  /** Create calculation/report item */
  calculation: (
    id: string,
    label: string,
    value: string,
    options?: Partial<CommandKItem>
  ): CommandKItem => ({
    id,
    type: "action",
    label,
    icon: Calculator,
    badge: value,
    ...options,
  }),
}

// ============================================================================
// Default Navigation Items (ERP-focused)
// ============================================================================

export const DEFAULT_ERP_NAVIGATION: CommandKItem[] = [
  CommandKActions.navigation("nav-dashboard", "Dashboard", "/dashboard", { shortcut: "⌘D" }),
  CommandKActions.navigation("nav-invoices", "Invoices", "/invoices", { shortcut: "⌘I" }),
  CommandKActions.navigation("nav-orders", "Sales Orders", "/orders"),
  CommandKActions.navigation("nav-purchases", "Purchase Orders", "/purchases"),
  CommandKActions.navigation("nav-inventory", "Inventory", "/inventory"),
  CommandKActions.navigation("nav-customers", "Customers", "/customers"),
  CommandKActions.navigation("nav-suppliers", "Suppliers", "/suppliers"),
  CommandKActions.navigation("nav-reports", "Reports", "/reports"),
  CommandKActions.navigation("nav-settings", "Settings", "/settings", { shortcut: "⌘," }),
]

export const DEFAULT_QUICK_ACTIONS: CommandKItem[] = [
  CommandKActions.action("action-new-invoice", "Create Invoice", () => {}, {
    shortcut: "⌘N",
    description: "Create a new sales invoice",
    icon: FileText,
  }),
  CommandKActions.action("action-trial-balance", "Run Trial Balance", () => {}, {
    description: "Generate trial balance report",
    icon: Calculator,
  }),
  CommandKActions.action("action-aging-report", "AR Aging Report", () => {}, {
    description: "View accounts receivable aging",
    icon: DollarSign,
  }),
]
