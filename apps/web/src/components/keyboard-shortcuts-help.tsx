"use client";

/**
 * Keyboard Shortcuts Help Dialog (Phase 5 - Cobalt Power Feature)
 *
 * Shows available keyboard shortcuts for power users.
 * Activated with ? key.
 */

import { useKeyboardShortcutsHelp, KEYBOARD_SHORTCUTS_HELP } from "@/hooks/use-keyboard-shortcuts";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface KeyboardShortcutsHelpProps {
  /** Whether user is in Cobalt mode */
  isCobalt?: boolean;
}

export function KeyboardShortcutsHelp({ isCobalt = true }: KeyboardShortcutsHelpProps) {
  const { isOpen, setIsOpen } = useKeyboardShortcutsHelp();

  if (!isOpen || !isCobalt) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div className="bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Navigation */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Navigation
              </h3>
              <div className="space-y-2">
                {KEYBOARD_SHORTCUTS_HELP.navigation.map((shortcut) => (
                  <ShortcutRow
                    key={shortcut.key}
                    shortcutKey={shortcut.key}
                    description={shortcut.description}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                {KEYBOARD_SHORTCUTS_HELP.actions.map((shortcut) => (
                  <ShortcutRow
                    key={shortcut.key}
                    shortcutKey={shortcut.key}
                    description={shortcut.description}
                  />
                ))}
              </div>
            </div>

            {/* Global */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Global
              </h3>
              <div className="space-y-2">
                {KEYBOARD_SHORTCUTS_HELP.global.map((shortcut) => (
                  <ShortcutRow
                    key={shortcut.key}
                    shortcutKey={shortcut.key}
                    description={shortcut.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">?</kbd> to toggle this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({
  shortcutKey,
  description,
}: {
  shortcutKey: string;
  description: string;
}) {
  // Parse compound keys like "⌘K" or "g g"
  const keys = shortcutKey.split(/\s+/);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className={cn(
              "inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5",
              "bg-muted border border-border rounded",
              "text-xs font-mono"
            )}
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

/**
 * Floating keyboard shortcut hint button.
 */
export function KeyboardShortcutsHint() {
  const { setIsOpen } = useKeyboardShortcutsHelp();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        "fixed bottom-4 right-4 z-40",
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-background border border-border shadow-lg",
        "text-sm text-muted-foreground hover:text-foreground",
        "transition-colors duration-200"
      )}
      aria-label="Keyboard shortcuts"
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
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="M6 8h.001" />
        <path d="M10 8h.001" />
        <path d="M14 8h.001" />
        <path d="M18 8h.001" />
        <path d="M8 12h.001" />
        <path d="M12 12h.001" />
        <path d="M16 12h.001" />
        <path d="M7 16h10" />
      </svg>
      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">?</kbd>
    </button>
  );
}
