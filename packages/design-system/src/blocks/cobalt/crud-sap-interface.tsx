"use client"

/**
 * CRUD-SAP Interface - Cobalt Kernel Component
 *
 * Create, Read, Update, Delete, Search, Audit, Predict
 * Implements A01-CANONICAL.md §4 — Cobalt Kernel execution patterns
 *
 * Features:
 * - Unified CRUD operations
 * - Global search-first navigation
 * - Automatic audit logging
 * - AI-powered next action predictions
 * - Inline editing
 *
 * @example
 * ```tsx
 * import { CRUDSAPTable } from "@workspace/design-system"
 *
 * <CRUDSAPTable
 *   data={invoices}
 *   columns={invoiceColumns}
 *   onSearch={handleSearch}
 *   onCreate={() => openCreateModal()}
 *   onUpdate={(row) => saveChanges(row)}
 *   onDelete={(ids) => deleteRows(ids)}
 *   predictedActions={aiPredictions}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Checkbox } from "@/components/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/alert-dialog"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  History,
  Sparkles,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Check,
  X,
  Loader2,
  Zap,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey: keyof T | ((row: T) => unknown)
  cell?: (row: T) => React.ReactNode
  editable?: boolean
  sortable?: boolean
  width?: number | string
}

export interface PredictedAction {
  id: string
  label: string
  description?: string
  confidence: number
  action: () => void
}

export interface CRUDSAPTableProps<T extends { id: string }> {
  /** Data rows */
  data: T[]
  /** Column definitions */
  columns: ColumnDef<T>[]
  /** Search callback */
  onSearch?: (query: string) => void
  /** Create callback */
  onCreate?: () => void
  /** Read/View callback */
  onRead?: (row: T) => void
  /** Update callback */
  onUpdate?: (row: T) => Promise<void>
  /** Delete callback */
  onDelete?: (ids: string[]) => Promise<void>
  /** Audit log callback */
  onViewAudit?: (row: T) => void
  /** AI predicted actions */
  predictedActions?: PredictedAction[]
  /** Row selection enabled */
  selectable?: boolean
  /** Inline edit enabled */
  inlineEdit?: boolean
  /** Pagination */
  pageSize?: number
  /** Total count (for server-side pagination) */
  totalCount?: number
  /** Page change callback */
  onPageChange?: (page: number) => void
  /** Current page */
  currentPage?: number
  /** Loading state */
  isLoading?: boolean
  /** Title */
  title?: string
  /** Description */
  description?: string
  /** Custom className */
  className?: string
}

// ============================================================================
// Pagination Component
// ============================================================================

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalCount,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  totalCount: number
}) {
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalCount}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Predicted Actions Bar
// ============================================================================

function PredictedActionsBar({ actions }: { actions: PredictedAction[] }) {
  if (!actions || actions.length === 0) return null

  return (
    <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 mb-4">
      <Sparkles className="h-4 w-4 text-primary shrink-0" />
      <span className="text-sm font-medium">Suggested:</span>
      <div className="flex items-center gap-2 flex-wrap">
        {actions.slice(0, 3).map((action) => (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={action.action}
                >
                  <Zap className="mr-1 h-3 w-3 text-primary" />
                  {action.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {action.confidence}%
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Editable Cell
// ============================================================================

function EditableCell<_T>({
  value,
  isEditing,
  onChange,
  onSave,
  onCancel,
}: {
  value: string
  isEditing: boolean
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  if (!isEditing) {
    return <span>{value}</span>
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave()
          if (e.key === "Escape") onCancel()
        }}
      />
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onSave}>
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancel}>
        <X className="h-3 w-3 text-red-600" />
      </Button>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function CRUDSAPTable<T extends { id: string }>({
  data,
  columns,
  onSearch,
  onCreate,
  onRead,
  onUpdate,
  onDelete,
  onViewAudit,
  predictedActions,
  selectable = true,
  inlineEdit = true,
  pageSize = 10,
  totalCount,
  onPageChange,
  currentPage = 1,
  isLoading = false,
  title,
  description,
  className,
}: CRUDSAPTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; columnId: string } | null>(null)
  const [editValue, setEditValue] = React.useState("")
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [_isSaving, setIsSaving] = React.useState(false)
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [_sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")

  const effectiveTotalCount = totalCount ?? data.length
  const totalPages = Math.ceil(effectiveTotalCount / pageSize)

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  // Handle selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map((row) => row.id)))
    }
  }

  // Handle inline edit
  const startEdit = (rowId: string, columnId: string, currentValue: string) => {
    setEditingCell({ rowId, columnId })
    setEditValue(currentValue)
  }

  const saveEdit = async () => {
    if (!editingCell || !onUpdate) return

    setIsSaving(true)
    try {
      const row = data.find((r) => r.id === editingCell.rowId)
      if (row) {
        const updatedRow = { ...row, [editingCell.columnId]: editValue }
        await onUpdate(updatedRow as T)
      }
    } finally {
      setIsSaving(false)
      setEditingCell(null)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete || selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      await onDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle sort
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  // Get cell value
  const getCellValue = (row: T, column: ColumnDef<T>): string => {
    if (typeof column.accessorKey === "function") {
      return String(column.accessorKey(row) ?? "")
    }
    return String(row[column.accessorKey] ?? "")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {onCreate && (
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {selectable && selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedIds.size} selected</Badge>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Predicted Actions */}
        <PredictedActionsBar actions={predictedActions || []} />

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === data.length && data.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    style={{ width: column.width }}
                    className={cn(column.sortable && "cursor-pointer hover:bg-muted/50")}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 2 : 1)}
                    className="h-24 text-center"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 2 : 1)}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(selectedIds.has(row.id) && "bg-muted/50")}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={() => toggleSelection(row.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = getCellValue(row, column)
                      const isEditing =
                        editingCell?.rowId === row.id &&
                        editingCell?.columnId === column.id

                      return (
                        <TableCell
                          key={column.id}
                          onDoubleClick={() => {
                            if (inlineEdit && column.editable) {
                              startEdit(row.id, column.id, value)
                            }
                          }}
                          className={cn(
                            inlineEdit && column.editable && "cursor-pointer hover:bg-muted/30"
                          )}
                        >
                          {column.cell ? (
                            column.cell(row)
                          ) : inlineEdit && column.editable ? (
                            <EditableCell
                              value={isEditing ? editValue : value}
                              isEditing={isEditing}
                              onChange={setEditValue}
                              onSave={saveEdit}
                              onCancel={cancelEdit}
                            />
                          ) : (
                            value
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onRead && (
                            <DropdownMenuItem onClick={() => onRead(row)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          )}
                          {onUpdate && (
                            <DropdownMenuItem onClick={() => onRead?.(row)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onViewAudit && (
                            <DropdownMenuItem onClick={() => onViewAudit(row)}>
                              <History className="mr-2 h-4 w-4" />
                              Audit Log
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedIds(new Set([row.id]))
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && onPageChange && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            totalCount={effectiveTotalCount}
          />
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} item(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected items will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ColumnDef, PredictedAction }
