"use client";

/**
 * Bulk Actions Component (Phase 5 - Cobalt Power Feature)
 *
 * Provides multi-select and batch operations for lists.
 *
 * AXIS UX Pattern:
 * - Cobalt users can select multiple items and perform batch operations
 * - Actions include: Post, Approve, Export, Delete, Assign
 * - Selection persists across pagination
 */

import { useState, useCallback, useMemo } from "react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface BulkAction<T = unknown> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Handler receives selected items */
  handler: (items: T[]) => void | Promise<void>;
  /** Whether action is destructive (shows warning) */
  destructive?: boolean;
  /** Minimum items required */
  minItems?: number;
  /** Maximum items allowed */
  maxItems?: number;
  /** Custom validation */
  validate?: (items: T[]) => boolean | string;
}

interface BulkActionsProps<T> {
  /** All items in the current view */
  items: T[];
  /** Currently selected item IDs */
  selectedIds: Set<string>;
  /** Get ID from item */
  getItemId: (item: T) => string;
  /** Available bulk actions */
  actions: BulkAction<T>[];
  /** Callback when selection changes */
  onSelectionChange: (ids: Set<string>) => void;
  /** Whether user has Cobalt permissions */
  isCobalt?: boolean;
}

export function BulkActions<T>({
  items,
  selectedIds,
  getItemId,
  actions,
  onSelectionChange,
  isCobalt = true,
}: BulkActionsProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(getItemId(item))),
    [items, selectedIds, getItemId]
  );

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isPartialSelected = selectedIds.size > 0 && !isAllSelected;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(getItemId)));
    }
  }, [items, getItemId, isAllSelected, onSelectionChange]);

  const handleAction = useCallback(
    async (action: BulkAction<T>) => {
      // Validate
      if (action.minItems && selectedItems.length < action.minItems) {
        return;
      }
      if (action.maxItems && selectedItems.length > action.maxItems) {
        return;
      }
      if (action.validate) {
        const result = action.validate(selectedItems);
        if (result !== true) {
          alert(typeof result === "string" ? result : "Invalid selection");
          return;
        }
      }

      // Confirm destructive actions
      if (action.destructive) {
        const confirmed = confirm(
          `Are you sure you want to ${action.label.toLowerCase()} ${selectedItems.length} item(s)?`
        );
        if (!confirmed) return;
      }

      setIsProcessing(true);
      setProcessingAction(action.id);

      try {
        await action.handler(selectedItems);
        // Clear selection after successful action
        onSelectionChange(new Set());
      } finally {
        setIsProcessing(false);
        setProcessingAction(null);
      }
    },
    [selectedItems, onSelectionChange]
  );

  if (!isCobalt || selectedIds.size === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-y border-primary/20 animate-in slide-in-from-top-2">
      {/* Selection info */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSelectAll}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center",
            "transition-colors duration-150",
            isAllSelected
              ? "bg-primary border-primary"
              : isPartialSelected
                ? "bg-primary/50 border-primary"
                : "border-border hover:border-primary"
          )}
        >
          {(isAllSelected || isPartialSelected) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isAllSelected ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <line x1="5" y1="12" x2="19" y2="12" />
              )}
            </svg>
          )}
        </button>
        <span className="text-sm font-medium">
          {selectedIds.size} selected
        </span>
        <button
          onClick={() => onSelectionChange(new Set())}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {actions.map((action) => {
          const minCheck = action.minItems ? selectedItems.length < action.minItems : false;
          const maxCheck = action.maxItems ? selectedItems.length > action.maxItems : false;
          const isDisabled = isProcessing || minCheck || maxCheck;

          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={isDisabled}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium",
                "transition-colors duration-150",
                action.destructive
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-muted",
                isDisabled && "opacity-50 cursor-not-allowed",
                processingAction === action.id && "animate-pulse"
              )}
            >
              {processingAction === action.id ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                action.icon
              )}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hook for managing bulk selection state.
 */
export function useBulkSelection<T>(getItemId: (item: T) => string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleItem = useCallback(
    (item: T) => {
      const id = getItemId(item);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [getItemId]
  );

  const selectItems = useCallback(
    (items: T[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        items.forEach((item) => next.add(getItemId(item)));
        return next;
      });
    },
    [getItemId]
  );

  const deselectItems = useCallback(
    (items: T[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        items.forEach((item) => next.delete(getItemId(item)));
        return next;
      });
    },
    [getItemId]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (item: T) => selectedIds.has(getItemId(item)),
    [selectedIds, getItemId]
  );

  return {
    selectedIds,
    setSelectedIds,
    toggleItem,
    selectItems,
    deselectItems,
    clearSelection,
    isSelected,
    selectedCount: selectedIds.size,
  };
}

/**
 * Common bulk action icons.
 */
export const BulkActionIcons = {
  post: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  approve: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  export: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  delete: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  ),
  assign: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  email: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
};
