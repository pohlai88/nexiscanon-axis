/**
 * EntityPicker - Party/Item/Account Selector (B10-01)
 *
 * Universal entity selector with:
 * - Fuzzy search
 * - Recent items
 * - Quick preview on hover
 * - Inline create option
 * - Keyboard navigation
 */

import React, { useState, useCallback, useMemo, type ReactNode } from "react";

import { cn } from "../lib/utils";

export interface EntityPickerItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Secondary text (e.g., code, description) */
  sublabel?: string;
  /** Entity type for grouping */
  type?: string;
  /** Additional metadata for preview */
  metadata?: Record<string, unknown>;
  /** Whether item is disabled */
  disabled?: boolean;
}

export interface EntityPickerProps<T extends EntityPickerItem> {
  /** Currently selected item */
  value?: T | null;
  /** Callback when item is selected */
  onChange: (item: T | null) => void;
  /** Available items to choose from */
  items: T[];
  /** Recently used items (shown at top) */
  recentItems?: T[];
  /** Placeholder text */
  placeholder?: string;
  /** Label for the picker */
  label?: string;
  /** Whether picker is disabled */
  disabled?: boolean;
  /** Whether picker is in loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Enable inline create option */
  allowCreate?: boolean;
  /** Callback for create action */
  onCreate?: (query: string) => void;
  /** Create button label */
  createLabel?: string;
  /** Custom render for item */
  renderItem?: (item: T) => ReactNode;
  /** Custom render for preview */
  renderPreview?: (item: T) => ReactNode;
  /** Filter function for search */
  filterFn?: (item: T, query: string) => boolean;
  className?: string;
}

/**
 * Simple fuzzy match function
 */
function defaultFilter<T extends EntityPickerItem>(
  item: T,
  query: string
): boolean {
  const q = query.toLowerCase();
  return (
    item.label.toLowerCase().includes(q) ||
    (item.sublabel?.toLowerCase().includes(q) ?? false) ||
    item.id.toLowerCase().includes(q)
  );
}

/**
 * EntityPicker implements the entity selection pattern from B10-01.
 *
 * @example
 * ```tsx
 * <EntityPicker
 *   label="Customer"
 *   value={selectedCustomer}
 *   onChange={setSelectedCustomer}
 *   items={customers}
 *   recentItems={recentCustomers}
 *   allowCreate
 *   onCreate={(name) => openCreateCustomer(name)}
 * />
 * ```
 */
export function EntityPicker<T extends EntityPickerItem>({
  value,
  onChange,
  items,
  recentItems = [],
  placeholder = "Search...",
  label,
  disabled = false,
  loading = false,
  error,
  allowCreate = false,
  onCreate,
  createLabel = "+ Create New",
  renderItem,
  renderPreview,
  filterFn = defaultFilter,
  className,
}: EntityPickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<T | null>(null);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter((item) => filterFn(item, query));
  }, [items, query, filterFn]);

  // Combined list: recent + filtered (avoiding duplicates)
  const displayItems = useMemo(() => {
    if (!query && recentItems.length > 0) {
      const recentIds = new Set(recentItems.map((r) => r.id));
      const nonRecent = items.filter((item) => !recentIds.has(item.id));
      return [...recentItems, ...nonRecent];
    }
    return filteredItems;
  }, [filteredItems, recentItems, items, query]);

  const handleSelect = useCallback(
    (item: T) => {
      onChange(item);
      setIsOpen(false);
      setQuery("");
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setQuery("");
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((i) =>
            Math.min(i + 1, displayItems.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (displayItems[highlightedIndex]) {
            handleSelect(displayItems[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [displayItems, highlightedIndex, handleSelect]
  );

  const defaultRenderItem = (item: T) => (
    <div className="flex flex-col">
      <span className="font-medium">{item.label}</span>
      {item.sublabel && (
        <span className="text-xs text-muted-foreground">{item.sublabel}</span>
      )}
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      {/* Label */}
      {label && (
        <label className="mb-1.5 block text-sm font-medium">{label}</label>
      )}

      {/* Input / Trigger */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2",
          "focus-within:ring-2 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-destructive"
        )}
      >
        <input
          type="text"
          value={isOpen ? query : value?.label ?? ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading && (
          <span className="animate-spin text-muted-foreground">⟳</span>
        )}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
        <span className="text-muted-foreground">▼</span>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          <div className="max-h-60 overflow-y-auto p-1">
            {/* Recent items section */}
            {!query && recentItems.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Recent
                </div>
                {recentItems.map((item, index) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    isHighlighted={index === highlightedIndex}
                    onSelect={() => handleSelect(item)}
                    onHover={() => setHoveredItem(item)}
                    renderItem={renderItem ?? defaultRenderItem}
                  />
                ))}
                <div className="my-1 border-t border-border" />
              </>
            )}

            {/* All items */}
            {displayItems.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              displayItems
                .slice(query ? 0 : recentItems.length)
                .map((item, index) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    isHighlighted={
                      index + (query ? 0 : recentItems.length) ===
                      highlightedIndex
                    }
                    onSelect={() => handleSelect(item)}
                    onHover={() => setHoveredItem(item)}
                    renderItem={renderItem ?? defaultRenderItem}
                  />
                ))
            )}

            {/* Create option */}
            {allowCreate && query && onCreate && (
              <>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => {
                    onCreate(query);
                    setIsOpen(false);
                  }}
                  className="w-full rounded-md px-2 py-2 text-left text-sm text-primary hover:bg-muted"
                >
                  {createLabel} "{query}"
                </button>
              </>
            )}
          </div>

          {/* Preview panel */}
          {hoveredItem && renderPreview && (
            <div className="border-t border-border p-3">
              {renderPreview(hoveredItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Individual item row */
function ItemRow<T extends EntityPickerItem>({
  item,
  isHighlighted,
  onSelect,
  onHover,
  renderItem,
}: {
  item: T;
  isHighlighted: boolean;
  onSelect: () => void;
  onHover: () => void;
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      disabled={item.disabled}
      className={cn(
        "w-full rounded-md px-2 py-2 text-left text-sm",
        "transition-colors duration-75",
        isHighlighted && "bg-accent",
        item.disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {renderItem(item)}
    </button>
  );
}
