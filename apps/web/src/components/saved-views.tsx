"use client";

/**
 * Saved Views Component (Phase 5 - Cobalt Power Feature)
 *
 * Allows users to save and restore table configurations:
 * - Column visibility
 * - Column order
 * - Sort settings
 * - Filter presets
 *
 * AXIS UX Pattern: Cobalt users can save their preferred views.
 */

import { useState, useCallback } from "react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  config: ViewConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ViewConfig {
  columns: ColumnConfig[];
  sortBy?: { column: string; direction: "asc" | "desc" };
  filters?: FilterConfig[];
  groupBy?: string;
  pageSize?: number;
}

export interface ColumnConfig {
  id: string;
  visible: boolean;
  width?: number;
  order: number;
}

export interface FilterConfig {
  column: string;
  operator: "equals" | "contains" | "gt" | "lt" | "between" | "in";
  value: unknown;
}

interface SavedViewsProps {
  /** Entity type (e.g., "invoices", "customers") - used for persistence */
  entityType?: string;
  /** Currently active view */
  activeView: SavedView | null;
  /** Available saved views */
  views: SavedView[];
  /** Callback when view is selected */
  onSelectView: (view: SavedView) => void;
  /** Callback to save current view */
  onSaveView: (name: string, config: ViewConfig) => void;
  /** Callback to delete a view */
  onDeleteView: (viewId: string) => void;
  /** Current view configuration */
  currentConfig: ViewConfig;
  /** Whether user has Cobalt permissions */
  isCobalt?: boolean;
}

export function SavedViews({
  entityType: _entityType,
  activeView,
  views,
  onSelectView,
  onSaveView,
  onDeleteView,
  currentConfig,
  isCobalt = true,
}: SavedViewsProps) {
  // TODO: Use entityType for API persistence
  void _entityType;
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const handleSave = useCallback(() => {
    if (!newViewName.trim()) return;
    onSaveView(newViewName, currentConfig);
    setNewViewName("");
    setIsSaving(false);
  }, [newViewName, currentConfig, onSaveView]);

  if (!isCobalt) return null;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
          "border border-border bg-background hover:bg-muted",
          "transition-colors duration-200"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span>{activeView?.name ?? "All Items"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-lg border border-border bg-background shadow-lg">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Saved Views
              </p>
            </div>

            {/* Views list */}
            <div className="max-h-64 overflow-y-auto p-1">
              {/* Default view */}
              <button
                onClick={() => {
                  onSelectView({
                    id: "default",
                    name: "All Items",
                    isDefault: true,
                    config: { columns: [] },
                    createdAt: "",
                    updatedAt: "",
                  });
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm",
                  "hover:bg-muted transition-colors",
                  !activeView && "bg-muted"
                )}
              >
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
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                </svg>
                <span>All Items</span>
                <span className="ml-auto text-xs text-muted-foreground">Default</span>
              </button>

              {/* Saved views */}
              {views.map((view) => (
                <div
                  key={view.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-md",
                    "hover:bg-muted transition-colors",
                    activeView?.id === view.id && "bg-muted"
                  )}
                >
                  <button
                    onClick={() => {
                      onSelectView(view);
                      setIsOpen(false);
                    }}
                    className="flex-1 flex items-center gap-2 text-left text-sm"
                  >
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
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span className="truncate">{view.name}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteView(view.id);
                    }}
                    className={cn(
                      "p-1 rounded opacity-0 group-hover:opacity-100",
                      "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                      "transition-all"
                    )}
                    aria-label="Delete view"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    </svg>
                  </button>
                </div>
              ))}

              {views.length === 0 && (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                  No saved views yet
                </p>
              )}
            </div>

            {/* Save new view */}
            <div className="border-t border-border p-2">
              {isSaving ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="View name..."
                    autoFocus
                    className={cn(
                      "flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                      if (e.key === "Escape") setIsSaving(false);
                    }}
                  />
                  <button
                    onClick={handleSave}
                    disabled={!newViewName.trim()}
                    className={cn(
                      "px-2 py-1 rounded-md text-sm font-medium",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      !newViewName.trim() && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSaving(true)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm",
                    "text-primary hover:bg-primary/10",
                    "transition-colors"
                  )}
                >
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
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  Save current view
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Hook for managing saved views state.
 */
export function useSavedViews(_entityType: string) {
  // TODO: Use entityType for API persistence
  void _entityType;
  const [views, setViews] = useState<SavedView[]>([]);
  const [activeView, setActiveView] = useState<SavedView | null>(null);

  const saveView = useCallback(
    (name: string, config: ViewConfig) => {
      const newView: SavedView = {
        id: crypto.randomUUID(),
        name,
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setViews((prev) => [...prev, newView]);
      setActiveView(newView);
      // TODO: Persist to API/localStorage
    },
    []
  );

  const deleteView = useCallback((viewId: string) => {
    setViews((prev) => prev.filter((v) => v.id !== viewId));
    setActiveView((prev) => (prev?.id === viewId ? null : prev));
    // TODO: Persist to API/localStorage
  }, []);

  const selectView = useCallback((view: SavedView) => {
    setActiveView(view.isDefault ? null : view);
  }, []);

  return {
    views,
    activeView,
    saveView,
    deleteView,
    selectView,
  };
}
