"use client";

/**
 * Data table component with sorting and pagination.
 * 
 * Pattern: Reusable table for displaying data with controls.
 */

import { useState, useMemo, type ReactNode } from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  pageSize = 10,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortDir]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle: asc -> desc -> null
      if (sortDir === "asc") {
        setSortDir("desc");
      } else if (sortDir === "desc") {
        setSortDir(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getValue = (row: T, key: string): unknown => {
    if (key.includes(".")) {
      return key.split(".").reduce((obj, k) => {
        if (obj && typeof obj === "object") {
          return (obj as Record<string, unknown>)[k];
        }
        return undefined;
      }, row as unknown);
    }
    return row[key as keyof T];
  };

  return (
    <div className="w-full">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--muted)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`text-left px-6 py-3 text-sm font-medium ${col.className ?? ""}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(String(col.key))}
                      className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                    >
                      {col.header}
                      <SortIcon
                        active={sortKey === String(col.key)}
                        direction={sortKey === String(col.key) ? sortDir : null}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-[var(--muted-foreground)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={String(row[keyField])}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    border-b border-[var(--border)] last:border-0
                    ${onRowClick ? "cursor-pointer hover:bg-[var(--muted)]/50" : ""}
                  `}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-6 py-4 ${col.className ?? ""}`}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : String(getValue(row, String(col.key)) ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <svg
      className={`w-4 h-4 ${active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {direction === "asc" ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      ) : direction === "desc" ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      )}
    </svg>
  );
}
