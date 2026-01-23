"use client"

/**
 * Audit Trail Viewer - Audit Component
 *
 * Comprehensive audit log display with filtering and drill-down.
 * Implements A01-CANONICAL.md §5 — "100-Year Recall Promise"
 *
 * Features:
 * - Chronological event timeline
 * - Advanced filtering (date, user, action, entity)
 * - 6W1H context expansion
 * - Export to PDF/CSV
 * - Search within audit log
 *
 * @example
 * ```tsx
 * import { AuditTrailViewer } from "@workspace/design-system"
 *
 * <AuditTrailViewer
 *   entries={auditLog}
 *   onViewDetails={(entry) => showManifest(entry)}
 *   onExport={(format) => exportLog(format)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/collapsible"
import { ScrollArea } from "@/components/scroll-area"
import {
  History,
  Search,
  Download,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Edit,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  X,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type AuditAction = "create" | "read" | "update" | "delete" | "approve" | "reject" | "login" | "logout" | "export" | "import" | "other"

export interface AuditActor {
  id: string
  name: string
  email?: string
  role?: string
  ipAddress?: string
}

export interface AuditChange {
  field: string
  oldValue: string | null
  newValue: string | null
}

export interface AuditEntry {
  id: string
  action: AuditAction
  entityType: string
  entityId: string
  entityLabel?: string
  actor: AuditActor
  timestamp: string | Date
  changes?: AuditChange[]
  reason?: string
  metadata?: Record<string, unknown>
  riskLevel?: "low" | "medium" | "high"
}

export interface AuditFilters {
  search?: string
  action?: AuditAction | "all"
  entityType?: string
  actorId?: string
  dateFrom?: string
  dateTo?: string
  riskLevel?: "low" | "medium" | "high" | "all"
}

export interface AuditTrailViewerProps {
  /** Audit log entries */
  entries: AuditEntry[]
  /** View details callback */
  onViewDetails?: (entry: AuditEntry) => void
  /** Export callback */
  onExport?: (format: "csv" | "pdf" | "json") => void
  /** Filter change callback */
  onFilterChange?: (filters: AuditFilters) => void
  /** Entity types for filter dropdown */
  entityTypes?: string[]
  /** Actors for filter dropdown */
  actors?: AuditActor[]
  /** Show risk indicators */
  showRiskIndicators?: boolean
  /** Maximum height (enables scroll) */
  maxHeight?: number | string
  /** Custom className */
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const ACTION_CONFIG: Record<
  AuditAction,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    label: string
  }
> = {
  create: { icon: Plus, color: "text-green-600", bgColor: "bg-green-100", label: "Created" },
  read: { icon: Eye, color: "text-blue-600", bgColor: "bg-blue-100", label: "Viewed" },
  update: { icon: Edit, color: "text-amber-600", bgColor: "bg-amber-100", label: "Updated" },
  delete: { icon: Trash2, color: "text-red-600", bgColor: "bg-red-100", label: "Deleted" },
  approve: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", label: "Approved" },
  reject: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", label: "Rejected" },
  login: { icon: User, color: "text-blue-600", bgColor: "bg-blue-100", label: "Logged In" },
  logout: { icon: User, color: "text-gray-600", bgColor: "bg-gray-100", label: "Logged Out" },
  export: { icon: Download, color: "text-purple-600", bgColor: "bg-purple-100", label: "Exported" },
  import: { icon: RefreshCw, color: "text-purple-600", bgColor: "bg-purple-100", label: "Imported" },
  other: { icon: FileText, color: "text-gray-600", bgColor: "bg-gray-100", label: "Action" },
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

// ============================================================================
// Sub-components
// ============================================================================

function ActionIcon({ action }: { action: AuditAction }) {
  const config = ACTION_CONFIG[action]
  const Icon = config.icon
  return (
    <div className={cn("rounded-full p-2", config.bgColor)}>
      <Icon className={cn("h-4 w-4", config.color)} />
    </div>
  )
}

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const config = {
    low: { color: "bg-green-100 text-green-700", label: "Low Risk" },
    medium: { color: "bg-amber-100 text-amber-700", label: "Medium Risk" },
    high: { color: "bg-red-100 text-red-700", label: "High Risk" },
  }
  return (
    <Badge className={cn("text-xs", config[level].color)}>
      {level === "high" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {config[level].label}
    </Badge>
  )
}

function ChangesDisplay({ changes }: { changes: AuditChange[] }) {
  return (
    <div className="mt-2 rounded-lg bg-muted p-3 text-sm">
      <h5 className="font-medium mb-2">Changes</h5>
      <div className="space-y-1">
        {changes.map((change, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="font-medium text-muted-foreground min-w-[100px]">
              {change.field}:
            </span>
            <div className="flex-1">
              {change.oldValue && (
                <span className="line-through text-red-600/70 mr-2">
                  {change.oldValue}
                </span>
              )}
              {change.newValue && (
                <span className="text-green-600">{change.newValue}</span>
              )}
              {!change.oldValue && !change.newValue && (
                <span className="text-muted-foreground italic">Empty</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditEntryCard({
  entry,
  onViewDetails,
  showRiskIndicators,
}: {
  entry: AuditEntry
  onViewDetails?: (entry: AuditEntry) => void
  showRiskIndicators: boolean
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const actionConfig = ACTION_CONFIG[entry.action]
  const hasChanges = entry.changes && entry.changes.length > 0

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />

      {/* Timeline dot */}
      <div className="absolute left-0">
        <ActionIcon action={entry.action} />
      </div>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div
          className={cn(
            "ml-4 rounded-lg border p-3 transition-all",
            isExpanded && "bg-muted/50"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{actionConfig.label}</Badge>
                <span className="font-medium">{entry.entityType}</span>
                {entry.entityLabel && (
                  <span className="text-muted-foreground">
                    — {entry.entityLabel}
                  </span>
                )}
                {showRiskIndicators && entry.riskLevel && (
                  <RiskBadge level={entry.riskLevel} />
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {entry.actor.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(entry.timestamp)}
                </span>
                {entry.actor.ipAddress && (
                  <span className="text-xs">{entry.actor.ipAddress}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <CollapsibleTrigger>
                  <Button variant="ghost" size="sm" className="h-7">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="ml-1 text-xs">
                      {entry.changes!.length} change{entry.changes!.length !== 1 ? "s" : ""}
                    </span>
                  </Button>
                </CollapsibleTrigger>
              )}
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => onViewDetails(entry)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              )}
            </div>
          </div>

          {/* Reason if provided */}
          {entry.reason && (
            <p className="mt-2 text-sm text-muted-foreground italic">
              "{entry.reason}"
            </p>
          )}

          {/* Expanded Content */}
          <CollapsibleContent>
            {hasChanges && <ChangesDisplay changes={entry.changes!} />}
            <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Entity ID:</span>{" "}
                <code className="bg-muted px-1 rounded">{entry.entityId}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Event ID:</span>{" "}
                <code className="bg-muted px-1 rounded">{entry.id}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp:</span>{" "}
                {formatDate(entry.timestamp)}
              </div>
              {entry.actor.role && (
                <div>
                  <span className="text-muted-foreground">Role:</span>{" "}
                  {entry.actor.role}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function AuditTrailViewer({
  entries,
  onViewDetails,
  onExport,
  onFilterChange,
  entityTypes = [],
  actors = [],
  showRiskIndicators = true,
  maxHeight,
  className,
}: AuditTrailViewerProps) {
  const [filters, setFilters] = React.useState<AuditFilters>({
    action: "all",
    riskLevel: "all",
  })
  const [showFilters, setShowFilters] = React.useState(false)

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: AuditFilters = { action: "all", riskLevel: "all" }
    setFilters(emptyFilters)
    onFilterChange?.(emptyFilters)
  }

  const hasActiveFilters =
    filters.search ||
    (filters.action && filters.action !== "all") ||
    filters.entityType ||
    filters.actorId ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.riskLevel && filters.riskLevel !== "all")

  // Apply client-side filters
  const filteredEntries = React.useMemo(() => {
    return entries.filter((entry) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          entry.entityLabel?.toLowerCase().includes(searchLower) ||
          entry.entityId.toLowerCase().includes(searchLower) ||
          entry.actor.name.toLowerCase().includes(searchLower) ||
          entry.reason?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      if (filters.action && filters.action !== "all" && entry.action !== filters.action) {
        return false
      }

      if (filters.entityType && entry.entityType !== filters.entityType) {
        return false
      }

      if (filters.actorId && entry.actor.id !== filters.actorId) {
        return false
      }

      if (filters.riskLevel && filters.riskLevel !== "all" && entry.riskLevel !== filters.riskLevel) {
        return false
      }

      return true
    })
  }, [entries, filters])

  const content = (
    <div className="space-y-4">
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <History className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No entries found</h3>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "No audit events recorded yet"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="mt-2" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        filteredEntries.map((entry) => (
          <AuditEntryCard
            key={entry.id}
            entry={entry}
            onViewDetails={onViewDetails}
            showRiskIndicators={showRiskIndicators}
          />
        ))
      )}
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              {filteredEntries.length} of {entries.length} events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(hasActiveFilters && "border-primary")}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
            {onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport("json")}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.action || "all"}
                onValueChange={(value) => handleFilterChange("action", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {entityTypes.length > 0 && (
                <Select
                  value={filters.entityType || ""}
                  onValueChange={(value) => handleFilterChange("entityType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {entityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select
                value={filters.riskLevel || "all"}
                onValueChange={(value) => handleFilterChange("riskLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {maxHeight ? (
          <ScrollArea style={{ height: maxHeight }}>{content}</ScrollArea>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { AuditAction, AuditActor, AuditChange, AuditEntry, AuditFilters }
