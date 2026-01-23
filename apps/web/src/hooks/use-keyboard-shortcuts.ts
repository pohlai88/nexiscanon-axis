"use client";

/**
 * Keyboard Shortcuts Hook (Phase 5 - Cobalt Power Feature)
 *
 * Provides vim-style and ERP-specific keyboard navigation.
 *
 * AXIS UX Pattern:
 * - j/k: Navigate rows
 * - Enter: Open selected
 * - e: Edit selected
 * - n: New item
 * - /: Focus search
 * - Escape: Clear selection / close dialogs
 * - g then g: Go to top
 * - G: Go to bottom
 * - ?: Show keyboard shortcuts help
 */

import { useEffect, useCallback, useRef, useState } from "react";

export interface KeyboardShortcut {
  /** Key or key combination (e.g., "j", "ctrl+s", "g g") */
  key: string;
  /** Description for help dialog */
  description: string;
  /** Handler function */
  handler: (e: KeyboardEvent) => void;
  /** Whether to prevent default behavior */
  preventDefault?: boolean;
  /** Scope - global or specific context */
  scope?: "global" | "list" | "form" | "dialog";
  /** Whether shortcut requires Cobalt mode */
  cobaltOnly?: boolean;
}

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean;
  /** Current persona (quorum or cobalt) */
  persona?: "quorum" | "cobalt";
  /** Active scope */
  scope?: "global" | "list" | "form" | "dialog";
}

/**
 * Hook for registering and handling keyboard shortcuts.
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, persona = "cobalt", scope = "global" } = options;
  const pendingKeyRef = useRef<string | null>(null);
  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in input/textarea (unless it's a global shortcut)
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Build the key string
      const modifiers: string[] = [];
      if (e.ctrlKey || e.metaKey) modifiers.push("ctrl");
      if (e.altKey) modifiers.push("alt");
      if (e.shiftKey) modifiers.push("shift");

      const keyName = e.key.toLowerCase();
      const fullKey = [...modifiers, keyName].join("+");

      // Check for sequence shortcuts (e.g., "g g")
      const sequenceKey = pendingKeyRef.current
        ? `${pendingKeyRef.current} ${keyName}`
        : null;

      for (const shortcut of shortcuts) {
        // Check if this is a Cobalt-only shortcut
        if (shortcut.cobaltOnly && persona !== "cobalt") continue;

        // Check scope
        if (shortcut.scope && shortcut.scope !== scope && shortcut.scope !== "global") continue;

        // Skip if in input and not a ctrl/cmd shortcut
        if (isInputFocused && !modifiers.length && shortcut.scope !== "global") continue;

        // Check if matches
        const matches =
          shortcut.key === fullKey ||
          shortcut.key === keyName ||
          (sequenceKey && shortcut.key === sequenceKey);

        if (matches) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);

          // Clear pending key
          pendingKeyRef.current = null;
          if (pendingTimeoutRef.current) {
            clearTimeout(pendingTimeoutRef.current);
          }
          return;
        }
      }

      // Check if this could be the start of a sequence
      const potentialSequences = shortcuts.filter((s) => s.key.startsWith(keyName + " "));
      if (potentialSequences.length > 0) {
        pendingKeyRef.current = keyName;
        // Clear pending after 1 second
        pendingTimeoutRef.current = setTimeout(() => {
          pendingKeyRef.current = null;
        }, 1000);
      } else {
        pendingKeyRef.current = null;
      }
    },
    [enabled, persona, scope, shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);
}

/**
 * Pre-built list navigation shortcuts.
 */
export function useListKeyboardShortcuts(options: {
  items: unknown[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpen?: (index: number) => void;
  onEdit?: (index: number) => void;
  onNew?: () => void;
  onDelete?: (index: number) => void;
  onSearch?: () => void;
  enabled?: boolean;
  persona?: "quorum" | "cobalt";
}) {
  const {
    items,
    selectedIndex,
    onSelectIndex,
    onOpen,
    onEdit,
    onNew,
    onDelete,
    onSearch,
    enabled = true,
    persona = "cobalt",
  } = options;

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "j",
      description: "Move down",
      handler: () => {
        const next = Math.min(selectedIndex + 1, items.length - 1);
        onSelectIndex(next);
      },
      cobaltOnly: true,
      scope: "list",
    },
    {
      key: "k",
      description: "Move up",
      handler: () => {
        const prev = Math.max(selectedIndex - 1, 0);
        onSelectIndex(prev);
      },
      cobaltOnly: true,
      scope: "list",
    },
    {
      key: "arrowdown",
      description: "Move down",
      handler: () => {
        const next = Math.min(selectedIndex + 1, items.length - 1);
        onSelectIndex(next);
      },
      scope: "list",
    },
    {
      key: "arrowup",
      description: "Move up",
      handler: () => {
        const prev = Math.max(selectedIndex - 1, 0);
        onSelectIndex(prev);
      },
      scope: "list",
    },
    // Go to top/bottom
    {
      key: "g g",
      description: "Go to first item",
      handler: () => onSelectIndex(0),
      cobaltOnly: true,
      scope: "list",
    },
    {
      key: "shift+g",
      description: "Go to last item",
      handler: () => onSelectIndex(items.length - 1),
      cobaltOnly: true,
      scope: "list",
    },
    // Actions
    {
      key: "enter",
      description: "Open selected",
      handler: () => {
        if (onOpen && selectedIndex >= 0) {
          onOpen(selectedIndex);
        }
      },
      scope: "list",
    },
    {
      key: "e",
      description: "Edit selected",
      handler: () => {
        if (onEdit && selectedIndex >= 0) {
          onEdit(selectedIndex);
        }
      },
      cobaltOnly: true,
      scope: "list",
    },
    {
      key: "n",
      description: "New item",
      handler: () => {
        if (onNew) onNew();
      },
      cobaltOnly: true,
      scope: "list",
    },
    {
      key: "d",
      description: "Delete selected",
      handler: () => {
        if (onDelete && selectedIndex >= 0) {
          onDelete(selectedIndex);
        }
      },
      cobaltOnly: true,
      scope: "list",
    },
    {
      key: "/",
      description: "Focus search",
      handler: () => {
        if (onSearch) onSearch();
      },
      scope: "list",
    },
    {
      key: "escape",
      description: "Clear selection",
      handler: () => onSelectIndex(-1),
      scope: "list",
    },
  ];

  useKeyboardShortcuts(shortcuts, { enabled, persona, scope: "list" });
}

/**
 * Keyboard shortcuts help dialog content.
 */
export const KEYBOARD_SHORTCUTS_HELP = {
  navigation: [
    { key: "j / ↓", description: "Move down" },
    { key: "k / ↑", description: "Move up" },
    { key: "g g", description: "Go to first" },
    { key: "G", description: "Go to last" },
    { key: "Enter", description: "Open selected" },
  ],
  actions: [
    { key: "n", description: "New item" },
    { key: "e", description: "Edit selected" },
    { key: "d", description: "Delete selected" },
    { key: "/", description: "Focus search" },
    { key: "Esc", description: "Clear / close" },
  ],
  global: [
    { key: "⌘K", description: "Command palette" },
    { key: "?", description: "Show shortcuts" },
  ],
};

/**
 * Hook to show/hide keyboard shortcuts help.
 */
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts(
    [
      {
        key: "shift+/", // ? key
        description: "Show keyboard shortcuts",
        handler: () => setIsOpen((prev) => !prev),
        scope: "global",
      },
      {
        key: "escape",
        description: "Close help",
        handler: () => setIsOpen(false),
        scope: "global",
      },
    ],
    { enabled: true }
  );

  return { isOpen, setIsOpen };
}
