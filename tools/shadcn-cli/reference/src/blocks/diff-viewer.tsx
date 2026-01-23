/**
 * DiffViewer - Before/After Comparison (B10-01)
 *
 * Shows changes between document versions for audit trail.
 * Implements the "Diff Viewer" canonical pattern.
 */

import { useMemo, useState } from "react";

import { cn } from "../lib/utils";

export type ChangeType = "added" | "removed" | "modified" | "unchanged";

export interface FieldChange {
  /** Field path (e.g., "customer.name" or "lines[0].amount") */
  path: string;
  /** Field label for display */
  label: string;
  /** Previous value */
  oldValue?: unknown;
  /** New value */
  newValue?: unknown;
  /** Type of change */
  changeType: ChangeType;
}

export interface VersionInfo {
  /** Version identifier */
  version: string | number;
  /** Timestamp of the version */
  timestamp: Date;
  /** Actor who made the change */
  actor?: {
    id: string;
    name: string;
  };
  /** Reason for the change */
  reason?: string;
}

export interface DiffViewerProps {
  /** Changes between versions */
  changes: FieldChange[];
  /** Source version info */
  sourceVersion: VersionInfo;
  /** Target version info */
  targetVersion: VersionInfo;
  /** Display mode */
  mode?: "side-by-side" | "inline" | "unified";
  /** Filter to show only certain change types */
  filter?: ChangeType[];
  /** Group changes by category */
  groupBy?: (change: FieldChange) => string;
  /** Expand all groups by default */
  expandAll?: boolean;
  /** Custom value formatter */
  formatValue?: (value: unknown, path: string) => string;
  className?: string;
}

/** Change type styles */
const CHANGE_STYLES: Record<ChangeType, { bg: string; text: string; icon: string }> = {
  added: {
    bg: "bg-success/10",
    text: "text-success-foreground",
    icon: "+",
  },
  removed: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    icon: "−",
  },
  modified: {
    bg: "bg-warning/10",
    text: "text-warning-foreground",
    icon: "~",
  },
  unchanged: {
    bg: "",
    text: "text-muted-foreground",
    icon: " ",
  },
};

/**
 * DiffViewer shows version differences for audit purposes.
 *
 * @example
 * ```tsx
 * <DiffViewer
 *   changes={[
 *     { path: "amount", label: "Amount", oldValue: 100, newValue: 150, changeType: "modified" },
 *     { path: "notes", label: "Notes", newValue: "Updated", changeType: "added" },
 *   ]}
 *   sourceVersion={{ version: 1, timestamp: new Date("2024-01-01") }}
 *   targetVersion={{ version: 2, timestamp: new Date("2024-01-15"), actor: { id: "1", name: "John" } }}
 * />
 * ```
 */
export function DiffViewer({
  changes,
  sourceVersion,
  targetVersion,
  mode = "side-by-side",
  filter,
  groupBy,
  expandAll = true,
  formatValue = defaultFormatValue,
  className,
}: DiffViewerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    expandAll ? new Set(["all"]) : new Set()
  );

  // Filter changes
  const filteredChanges = useMemo(() => {
    if (!filter || filter.length === 0) return changes;
    return changes.filter((c) => filter.includes(c.changeType));
  }, [changes, filter]);

  // Group changes
  const groupedChanges = useMemo(() => {
    if (!groupBy) return { "All Changes": filteredChanges };
    return filteredChanges.reduce(
      (acc, change) => {
        const group = groupBy(change);
        if (!acc[group]) acc[group] = [];
        acc[group].push(change);
        return acc;
      },
      {} as Record<string, FieldChange[]>
    );
  }, [filteredChanges, groupBy]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const isGroupExpanded = (group: string) =>
    expandedGroups.has("all") || expandedGroups.has(group);

  // Summary stats
  const stats = useMemo(() => {
    return {
      added: filteredChanges.filter((c) => c.changeType === "added").length,
      removed: filteredChanges.filter((c) => c.changeType === "removed").length,
      modified: filteredChanges.filter((c) => c.changeType === "modified").length,
    };
  }, [filteredChanges]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Version header */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
        <VersionBadge version={sourceVersion} label="From" />
        <div className="text-muted-foreground">→</div>
        <VersionBadge version={targetVersion} label="To" />
      </div>

      {/* Stats summary */}
      <div className="flex gap-4 text-sm">
        <span className={cn("flex items-center gap-1", CHANGE_STYLES.added.text)}>
          <span className="font-mono">{CHANGE_STYLES.added.icon}</span>
          {stats.added} added
        </span>
        <span className={cn("flex items-center gap-1", CHANGE_STYLES.removed.text)}>
          <span className="font-mono">{CHANGE_STYLES.removed.icon}</span>
          {stats.removed} removed
        </span>
        <span className={cn("flex items-center gap-1", CHANGE_STYLES.modified.text)}>
          <span className="font-mono">{CHANGE_STYLES.modified.icon}</span>
          {stats.modified} modified
        </span>
      </div>

      {/* Reason */}
      {targetVersion.reason && (
        <div className="rounded-md border border-border bg-background p-3">
          <span className="text-sm font-medium">Reason: </span>
          <span className="text-sm text-muted-foreground">
            {targetVersion.reason}
          </span>
        </div>
      )}

      {/* Changes */}
      <div className="space-y-2">
        {Object.entries(groupedChanges).map(([group, groupChanges]) => (
          <div key={group} className="rounded-lg border border-border">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group)}
              className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
            >
              <span className="font-medium">{group}</span>
              <span className="text-sm text-muted-foreground">
                {groupChanges.length} changes{" "}
                {isGroupExpanded(group) ? "▼" : "▶"}
              </span>
            </button>

            {/* Changes list */}
            {isGroupExpanded(group) && (
              <div className="border-t border-border">
                {mode === "side-by-side" ? (
                  <SideBySideView changes={groupChanges} formatValue={formatValue} />
                ) : (
                  <InlineView changes={groupChanges} formatValue={formatValue} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Version badge */
function VersionBadge({
  version,
  label,
}: {
  version: VersionInfo;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono font-medium">v{version.version}</div>
      <div className="text-xs text-muted-foreground">
        {version.timestamp.toLocaleDateString()}
      </div>
      {version.actor && (
        <div className="text-xs text-muted-foreground">
          by {version.actor.name}
        </div>
      )}
    </div>
  );
}

/** Side-by-side diff view */
function SideBySideView({
  changes,
  formatValue,
}: {
  changes: FieldChange[];
  formatValue: (value: unknown, path: string) => string;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted/30">
          <th className="px-3 py-2 text-left font-medium">Field</th>
          <th className="w-[35%] px-3 py-2 text-left font-medium">Before</th>
          <th className="w-[35%] px-3 py-2 text-left font-medium">After</th>
        </tr>
      </thead>
      <tbody>
        {changes.map((change) => {
          const styles = CHANGE_STYLES[change.changeType];
          return (
            <tr key={change.path} className={cn("border-b border-border", styles.bg)}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono text-xs", styles.text)}>
                    {styles.icon}
                  </span>
                  <span className="font-medium">{change.label}</span>
                </div>
                <div className="text-xs text-muted-foreground">{change.path}</div>
              </td>
              <td className={cn("px-3 py-2", change.changeType === "removed" && "line-through")}>
                {change.oldValue !== undefined ? formatValue(change.oldValue, change.path) : "—"}
              </td>
              <td className="px-3 py-2">
                {change.newValue !== undefined ? formatValue(change.newValue, change.path) : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Inline diff view */
function InlineView({
  changes,
  formatValue,
}: {
  changes: FieldChange[];
  formatValue: (value: unknown, path: string) => string;
}) {
  return (
    <div className="space-y-1 p-2">
      {changes.map((change) => {
        const styles = CHANGE_STYLES[change.changeType];
        return (
          <div key={change.path} className={cn("rounded px-3 py-2", styles.bg)}>
            <div className="flex items-center gap-2">
              <span className={cn("font-mono", styles.text)}>{styles.icon}</span>
              <span className="font-medium">{change.label}</span>
            </div>
            {change.changeType === "modified" && (
              <div className="ml-5 text-sm">
                <span className="text-destructive line-through">
                  {formatValue(change.oldValue, change.path)}
                </span>
                {" → "}
                <span className="text-success-foreground">
                  {formatValue(change.newValue, change.path)}
                </span>
              </div>
            )}
            {change.changeType === "added" && (
              <div className="ml-5 text-sm text-success-foreground">
                {formatValue(change.newValue, change.path)}
              </div>
            )}
            {change.changeType === "removed" && (
              <div className="ml-5 text-sm text-destructive line-through">
                {formatValue(change.oldValue, change.path)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Default value formatter */
function defaultFormatValue(value: unknown, _path: string): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
