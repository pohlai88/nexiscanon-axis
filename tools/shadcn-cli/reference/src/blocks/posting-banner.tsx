/**
 * PostingBanner - Document Status Header (B10-01)
 *
 * The sticky banner that shows document status, amount, and posting actions.
 * Implements the "Draft Form + Posting Banner" pattern.
 */

import type { ReactNode } from "react";

import { cn } from "../lib/utils";
import {
  type DocumentState,
  STATUS_BADGE_STYLES,
  STATUS_LABELS,
} from "../types/document-state";

/** Gate status for posting validation */
export interface PostingGate {
  id: string;
  label: string;
  passed: boolean;
  message?: string;
}

export interface PostingBannerProps {
  /** Current document state */
  status: DocumentState;
  /** Total amount to display */
  amount?: number;
  /** Currency code for formatting */
  currency?: string;
  /** Entity identifier (e.g., "INV-2024-0001") */
  entityId?: string;
  /** Entity type label (e.g., "Invoice") */
  entityType?: string;
  /** Validation gates for posting */
  postingGates?: PostingGate[];
  /** Save draft action */
  onSave?: () => void;
  /** Post document action */
  onPost?: () => void;
  /** Submit for approval action */
  onSubmit?: () => void;
  /** Cancel document action */
  onCancel?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Whether post is in progress */
  isPosting?: boolean;
  /** Additional actions */
  actions?: ReactNode;
  className?: string;
}

/**
 * PostingBanner shows document status and actions.
 *
 * @example
 * ```tsx
 * <PostingBanner
 *   status="draft"
 *   amount={1234.56}
 *   entityId="INV-2024-0001"
 *   entityType="Invoice"
 *   onSave={handleSave}
 *   onPost={handlePost}
 *   postingGates={[
 *     { id: "balance", label: "Balanced", passed: true },
 *     { id: "approval", label: "Approved", passed: false },
 *   ]}
 * />
 * ```
 */
export function PostingBanner({
  status,
  amount,
  currency = "USD",
  entityId,
  entityType,
  postingGates = [],
  onSave,
  onPost,
  onSubmit,
  onCancel,
  isSaving = false,
  isPosting = false,
  actions,
  className,
}: PostingBannerProps) {
  const allGatesPassed = postingGates.every((gate) => gate.passed);
  const canPost = status === "draft" && allGatesPassed;
  const canSubmit = status === "draft";
  const canSave = status === "draft";
  const isLocked = status === "posted" || status === "reversed";

  // Format amount with currency
  const formattedAmount =
    amount !== undefined
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
        }).format(amount)
      : null;

  return (
    <div
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isLocked && "bg-muted/50",
        className
      )}
    >
      {/* Left: Entity Info + Status */}
      <div className="flex items-center gap-4">
        {entityType && entityId && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{entityType}</span>
            <span className="font-mono font-medium">{entityId}</span>
          </div>
        )}
        <StatusBadge status={status} />
      </div>

      {/* Center: Amount + Gates */}
      <div className="flex items-center gap-4">
        {formattedAmount && (
          <span className="text-lg font-semibold tabular-nums">
            {formattedAmount}
          </span>
        )}
        {postingGates.length > 0 && (
          <div className="flex items-center gap-2">
            {postingGates.map((gate) => (
              <GateIndicator key={gate.id} gate={gate} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {actions}

        {canSave && onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className={cn(
              "rounded-md border border-border bg-background px-4 py-2 text-sm font-medium",
              "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        )}

        {canSubmit && onSubmit && (
          <button
            onClick={onSubmit}
            className={cn(
              "rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary",
              "hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            Submit
          </button>
        )}

        {onPost && (
          <button
            onClick={onPost}
            disabled={!canPost || isPosting}
            className={cn(
              "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isPosting ? "Posting..." : "Post ▶"}
          </button>
        )}
      </div>
    </div>
  );
}

/** Status badge component */
function StatusBadge({ status }: { status: DocumentState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_BADGE_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Gate indicator (pass/fail) */
function GateIndicator({ gate }: { gate: PostingGate }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-xs",
        gate.passed
          ? "bg-success/10 text-success-foreground"
          : "bg-destructive/10 text-destructive-foreground"
      )}
      title={gate.message}
    >
      <span>{gate.passed ? "✓" : "✗"}</span>
      <span>{gate.label}</span>
    </div>
  );
}
