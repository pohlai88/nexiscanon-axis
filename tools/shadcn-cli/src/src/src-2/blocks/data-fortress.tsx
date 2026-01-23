'use client';

import { Badge } from '@workspace/design-system/components/badge';
import { Button } from '@workspace/design-system/components/button';
import { Checkbox } from '@workspace/design-system/components/checkbox';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@workspace/design-system/components/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/design-system/components/dropdown-menu';
import { Empty } from '@workspace/design-system/components/empty';
import { Input } from '@workspace/design-system/components/input';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/design-system/components/resizable';
import { ScrollArea } from '@workspace/design-system/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/design-system/components/select';
import { Skeleton } from '@workspace/design-system/components/skeleton';
import { Spinner } from '@workspace/design-system/components/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/design-system/components/table';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  MoreHorizontal,
  Settings2,
  X,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
} from 'lucide-react';
import * as React from 'react';

// ============================================================
// TYPES
// ============================================================

export type DataFortressColumn<T = any> = {
  id: string;
  accessorKey?: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  hidden?: boolean;
  pinned?: 'left' | 'right' | false;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  filterOptions?: Array<{ label: string; value: string }>;
};

export type DataFortressSortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

export type DataFortressFilterConfig = {
  column: string;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte';
  value: string;
};

export type DataFortressRow<T = any> = T & {
  _id: string | number;
  _audit?: AuditTrail[];
};

export type AuditTrail = {
  timestamp: Date;
  user: string;
  action: 'created' | 'updated' | 'deleted';
  field?: string;
  oldValue?: any;
  newValue?: any;
  note?: string;
};

export type DataFortressProps<T = any> = {
  // Data
  data: DataFortressRow<T>[];
  columns: DataFortressColumn<T>[];

  // Loading & Empty States
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;

  // Selection
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;

  // Sorting
  sortable?: boolean;
  defaultSort?: DataFortressSortConfig[];
  onSortChange?: (sort: DataFortressSortConfig[]) => void;

  // Filtering
  filterable?: boolean;
  defaultFilters?: DataFortressFilterConfig[];
  onFilterChange?: (filters: DataFortressFilterConfig[]) => void;

  // Pagination
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Actions
  rowActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: DataFortressRow<T>) => void;
    variant?: 'default' | 'destructive';
  }>;
  bulkActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedRows: DataFortressRow<T>[]) => void;
    variant?: 'default' | 'destructive';
  }>;

  // Export
  exportable?: boolean;
  onExport?: (format: 'csv' | 'excel' | 'json') => void;

  // Audit Trail
  auditEnabled?: boolean;
  onViewAudit?: (row: DataFortressRow<T>) => void;

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  // Refresh
  refreshable?: boolean;
  onRefresh?: () => void;

  // Customization
  className?: string;
  rowClassName?: (row: DataFortressRow<T>) => string;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;

  // Advanced
  virtualScroll?: boolean;
  resizableColumns?: boolean;
  reorderableColumns?: boolean;
};

// ============================================================
// COMPONENT
// ============================================================

export function DataFortress<T = any>({
  data,
  columns: initialColumns,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No records found',
  emptyDescription = 'Try adjusting your filters or search query',
  selectable = false,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  sortable = true,
  defaultSort = [],
  onSortChange,
  filterable = true,
  defaultFilters = [],
  onFilterChange,
  pagination = true,
  pageSize: controlledPageSize = 50,
  currentPage: controlledCurrentPage = 1,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  rowActions = [],
  bulkActions = [],
  exportable = true,
  onExport,
  auditEnabled = true,
  onViewAudit,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  refreshable = true,
  onRefresh,
  className,
  rowClassName,
  striped = true,
  bordered = false,
  compact = false,
  virtualScroll = false,
  resizableColumns = true,
  reorderableColumns = false,
}: DataFortressProps<T>) {
  // State
  const [columns, setColumns] = React.useState(initialColumns);
  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >({});
  const [sort, setSort] = React.useState<DataFortressSortConfig[]>(defaultSort);
  const [filters, setFilters] =
    React.useState<DataFortressFilterConfig[]>(defaultFilters);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<Set<string | number>>(
    new Set(),
  );
  const [auditDrawerOpen, setAuditDrawerOpen] = React.useState(false);
  const [auditDrawerRow, setAuditDrawerRow] =
    React.useState<DataFortressRow<T> | null>(null);
  const [pageSize, setPageSize] = React.useState(controlledPageSize);
  const [currentPage, setCurrentPage] = React.useState(controlledCurrentPage);
  const [columnSettingsOpen, setColumnSettingsOpen] = React.useState(false);

  // Use controlled or internal state
  const selected = controlledSelectedRows ?? selectedRows;
  const setSelected = onSelectionChange ?? setSelectedRows;

  // Handlers
  const handleSelectAll = React.useCallback(() => {
    if (selected.size === data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.map((row) => row._id)));
    }
  }, [data, selected, setSelected]);

  const handleSelectRow = React.useCallback(
    (rowId: string | number) => {
      const newSelected = new Set(selected);
      if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
      } else {
        newSelected.add(rowId);
      }
      setSelected(newSelected);
    },
    [selected, setSelected],
  );

  const handleSort = React.useCallback(
    (columnId: string) => {
      const existingSort = sort.find((s) => s.column === columnId);
      let newSort: DataFortressSortConfig[];

      if (!existingSort) {
        newSort = [...sort, { column: columnId, direction: 'asc' }];
      } else if (existingSort.direction === 'asc') {
        newSort = sort.map((s) =>
          s.column === columnId ? { ...s, direction: 'desc' as const } : s,
        );
      } else {
        newSort = sort.filter((s) => s.column !== columnId);
      }

      setSort(newSort);
      onSortChange?.(newSort);
    },
    [sort, onSortChange],
  );

  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch],
  );

  const handleViewAudit = React.useCallback(
    (row: DataFortressRow<T>) => {
      setAuditDrawerRow(row);
      setAuditDrawerOpen(true);
      onViewAudit?.(row);
    },
    [onViewAudit],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [onPageChange],
  );

  const handlePageSizeChange = React.useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
      onPageSizeChange?.(size);
    },
    [onPageSizeChange],
  );

  const handleToggleColumn = React.useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, hidden: !col.hidden } : col,
      ),
    );
  }, []);

  // Computed
  const visibleColumns = columns.filter((col) => !col.hidden);
  const totalPages = totalRecords
    ? Math.ceil(totalRecords / pageSize)
    : Math.ceil(data.length / pageSize);
  const hasSelection = selected.size > 0;
  const selectedRowData = data.filter((row) => selected.has(row._id));

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataFortressToolbar
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          filterable={filterable}
          refreshable={refreshable}
          onRefresh={onRefresh}
          exportable={exportable}
          onExport={onExport}
          bulkActions={bulkActions}
          selectedRows={selectedRowData}
          hasSelection={hasSelection}
          columns={columns}
          onToggleColumn={handleToggleColumn}
          columnSettingsOpen={columnSettingsOpen}
          setColumnSettingsOpen={setColumnSettingsOpen}
        />
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
                {visibleColumns.map((col) => (
                  <TableHead key={col.id}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
                {(rowActions.length > 0 || auditEnabled) && (
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {(rowActions.length > 0 || auditEnabled) && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty State
  if (isEmpty || data.length === 0) {
    return (
      <div className="space-y-4">
        <DataFortressToolbar
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          filterable={filterable}
          refreshable={refreshable}
          onRefresh={onRefresh}
          exportable={exportable}
          onExport={onExport}
          bulkActions={bulkActions}
          selectedRows={selectedRowData}
          hasSelection={hasSelection}
          columns={columns}
          onToggleColumn={handleToggleColumn}
          columnSettingsOpen={columnSettingsOpen}
          setColumnSettingsOpen={setColumnSettingsOpen}
        />
        <div className="rounded-lg border p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Search className="text-muted-foreground h-12 w-12" />
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">{emptyMessage}</h3>
              <p className="text-muted-foreground text-sm">
                {emptyDescription}
              </p>
            </div>
            {refreshable && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className={`space-y-4 ${className || ''}`}>
      <DataFortressToolbar
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        filterable={filterable}
        refreshable={refreshable}
        onRefresh={onRefresh}
        exportable={exportable}
        onExport={onExport}
        bulkActions={bulkActions}
        selectedRows={selectedRowData}
        hasSelection={hasSelection}
        columns={columns}
        onToggleColumn={handleToggleColumn}
        columnSettingsOpen={columnSettingsOpen}
        setColumnSettingsOpen={setColumnSettingsOpen}
      />

      <div className={`rounded-lg ${bordered ? 'border' : ''}`}>
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selected.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.id}
                    className={`${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                    style={{
                      minWidth: col.minWidth,
                      maxWidth: col.maxWidth,
                      width: columnWidths[col.id] || col.defaultWidth,
                    }}
                  >
                    {sortable && col.sortable !== false ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8"
                        onClick={() => handleSort(col.id)}
                      >
                        {col.header}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
                {(rowActions.length > 0 || auditEnabled) && (
                  <TableHead className="w-12"></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={row._id}
                  className={`${
                    striped && index % 2 === 0 ? 'bg-muted/50' : ''
                  } ${rowClassName?.(row) || ''} ${
                    selected.has(row._id) ? 'bg-primary/5' : ''
                  } ${compact ? 'h-10' : ''}`}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row._id)}
                        onCheckedChange={() => handleSelectRow(row._id)}
                        aria-label={`Select row ${row._id}`}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => {
                    const value = col.accessorKey ? row[col.accessorKey] : null;
                    const formatted =
                      col.format && value ? col.format(value) : value;
                    const content = col.cell ? col.cell(row) : formatted;

                    return (
                      <TableCell
                        key={col.id}
                        className={`${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                      >
                        {content as React.ReactNode}
                      </TableCell>
                    );
                  })}
                  {(rowActions.length > 0 || auditEnabled) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {auditEnabled && row._audit && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleViewAudit(row)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Audit Trail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {rowActions.map((action, i) => (
                            <DropdownMenuItem
                              key={i}
                              onClick={() => action.onClick(row)}
                              className={
                                action.variant === 'destructive'
                                  ? 'text-destructive'
                                  : ''
                              }
                            >
                              {action.icon && (
                                <action.icon className="mr-2 h-4 w-4" />
                              )}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {pagination && (
        <DataFortressPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalRecords || data.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {auditEnabled && (
        <Drawer open={auditDrawerOpen} onOpenChange={setAuditDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Audit Trail</DrawerTitle>
              <DrawerDescription>
                Complete history of changes for this record
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              {auditDrawerRow?._audit ? (
                <AuditTrailList audit={auditDrawerRow._audit} />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 py-12">
                  <h3 className="text-lg font-semibold">No audit trail</h3>
                  <p className="text-muted-foreground text-sm">
                    This record has no change history
                  </p>
                </div>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

// ============================================================
// TOOLBAR
// ============================================================

type DataFortressToolbarProps<T = any> = {
  searchable: boolean;
  searchPlaceholder: string;
  searchQuery: string;
  onSearch: (query: string) => void;
  filterable: boolean;
  refreshable: boolean;
  onRefresh?: () => void;
  exportable: boolean;
  onExport?: (format: 'csv' | 'excel' | 'json') => void;
  bulkActions: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedRows: any[]) => void;
    variant?: 'default' | 'destructive';
  }>;
  selectedRows: any[];
  hasSelection: boolean;
  columns: DataFortressColumn[];
  onToggleColumn: (columnId: string) => void;
  columnSettingsOpen: boolean;
  setColumnSettingsOpen: (open: boolean) => void;
};

function DataFortressToolbar<T>({
  searchable,
  searchPlaceholder,
  searchQuery,
  onSearch,
  filterable,
  refreshable,
  onRefresh,
  exportable,
  onExport,
  bulkActions,
  selectedRows,
  hasSelection,
  columns,
  onToggleColumn,
  columnSettingsOpen,
  setColumnSettingsOpen,
}: DataFortressToolbarProps<T>) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        {searchable && (
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        {hasSelection && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedRows.length} selected</Badge>
            {bulkActions.map((action, i) => (
              <Button
                key={i}
                variant={
                  action.variant === 'destructive' ? 'destructive' : 'outline'
                }
                size="sm"
                onClick={() => action.onClick(selectedRows)}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {refreshable && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {exportable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport?.('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu
          open={columnSettingsOpen}
          onOpenChange={setColumnSettingsOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={!col.hidden}
                onCheckedChange={() => onToggleColumn(col.id)}
              >
                {col.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ============================================================
// PAGINATION
// ============================================================

type DataFortressPaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function DataFortressPagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: DataFortressPaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-sm">
          Showing {start} to {end} of {totalRecords} records
        </p>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="25">25 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
            <SelectItem value="100">100 / page</SelectItem>
            <SelectItem value="200">200 / page</SelectItem>
          </SelectContent>
        </Select>
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
  );
}

// ============================================================
// AUDIT TRAIL LIST
// ============================================================

type AuditTrailListProps = {
  audit: AuditTrail[];
};

function AuditTrailList({ audit }: AuditTrailListProps) {
  return (
    <div className="space-y-4">
      {audit.map((entry, i) => (
        <div key={i} className="flex gap-4 rounded-lg border p-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  entry.action === 'created'
                    ? 'default'
                    : entry.action === 'updated'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {entry.action}
              </Badge>
              <span className="text-sm font-medium">{entry.user}</span>
              <span className="text-muted-foreground text-xs">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            {entry.field && (
              <div className="text-sm">
                <span className="text-muted-foreground">Field:</span>{' '}
                <span className="font-medium">{entry.field}</span>
              </div>
            )}
            {entry.oldValue !== undefined && entry.newValue !== undefined && (
              <div className="text-sm">
                <span className="text-destructive line-through">
                  {String(entry.oldValue)}
                </span>
                {' → '}
                <span className="text-primary">{String(entry.newValue)}</span>
              </div>
            )}
            {entry.note && (
              <p className="text-muted-foreground text-sm">{entry.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Type exports already declared above
