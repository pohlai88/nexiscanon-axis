/**
 * ApprovalRail - Approval Timeline (B10-01)
 *
 * Displays the approval history and pending approvals for a document.
 * Shows who, when, why, and evidence for each approval step.
 */

import type { ReactNode } from "react";

import { cn } from "../lib/utils";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "delegated"
  | "escalated"
  | "expired";

export interface ApprovalStep {
  /** Unique step identifier */
  id: string;
  /** Approval step name */
  name: string;
  /** Current status */
  status: ApprovalStatus;
  /** Actor who performed the action */
  actor?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  /** When the action was performed */
  timestamp?: Date;
  /** Comment/reason for the action */
  comment?: string;
  /** Attached evidence files */
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  /** SLA deadline */
  deadline?: Date;
  /** Whether this step is the current active one */
  isCurrent?: boolean;
}

export interface ApprovalRailProps {
  /** Approval steps to display */
  steps: ApprovalStep[];
  /** Orientation of the rail */
  orientation?: "vertical" | "horizontal";
  /** Show SLA status indicators */
  showSLA?: boolean;
  /** Action button for pending steps */
  onApprove?: (stepId: string) => void;
  /** Reject action for pending steps */
  onReject?: (stepId: string) => void;
  /** Custom render for step content */
  renderStep?: (step: ApprovalStep) => ReactNode;
  className?: string;
}

/** Status colors and icons */
const STATUS_CONFIG: Record<
  ApprovalStatus,
  { color: string; icon: string; label: string }
> = {
  pending: {
    color: "bg-warning/20 text-warning-foreground border-warning",
    icon: "○",
    label: "Pending",
  },
  approved: {
    color: "bg-success/20 text-success-foreground border-success",
    icon: "✓",
    label: "Approved",
  },
  rejected: {
    color: "bg-destructive/20 text-destructive-foreground border-destructive",
    icon: "✗",
    label: "Rejected",
  },
  delegated: {
    color: "bg-primary/20 text-primary-foreground border-primary",
    icon: "→",
    label: "Delegated",
  },
  escalated: {
    color: "bg-warning/30 text-warning-foreground border-warning",
    icon: "↑",
    label: "Escalated",
  },
  expired: {
    color: "bg-muted text-muted-foreground border-muted",
    icon: "⏱",
    label: "Expired",
  },
};

/**
 * ApprovalRail shows the approval workflow timeline.
 *
 * @example
 * ```tsx
 * <ApprovalRail
 *   steps={[
 *     { id: "1", name: "Manager", status: "approved", actor: {...} },
 *     { id: "2", name: "Finance", status: "pending", isCurrent: true },
 *     { id: "3", name: "CFO", status: "pending" },
 *   ]}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 * />
 * ```
 */
export function ApprovalRail({
  steps,
  orientation = "vertical",
  showSLA = true,
  onApprove,
  onReject,
  renderStep,
  className,
}: ApprovalRailProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex gap-4",
        isVertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "relative flex gap-3",
            isVertical ? "flex-row" : "flex-col items-center"
          )}
        >
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "absolute bg-border",
                isVertical
                  ? "left-4 top-8 h-full w-0.5"
                  : "left-8 top-4 h-0.5 w-full"
              )}
            />
          )}

          {/* Status indicator */}
          <div
            className={cn(
              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium",
              STATUS_CONFIG[step.status].color,
              step.isCurrent && "ring-2 ring-ring ring-offset-2"
            )}
          >
            {STATUS_CONFIG[step.status].icon}
          </div>

          {/* Step content */}
          <div className="flex-1 pb-4">
            {renderStep ? (
              renderStep(step)
            ) : (
              <DefaultStepContent
                step={step}
                showSLA={showSLA}
                onApprove={onApprove}
                onReject={onReject}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Default step content renderer */
function DefaultStepContent({
  step,
  showSLA,
  onApprove,
  onReject,
}: {
  step: ApprovalStep;
  showSLA: boolean;
  onApprove?: (stepId: string) => void;
  onReject?: (stepId: string) => void;
}) {
  const config = STATUS_CONFIG[step.status];
  const slaStatus = step.deadline ? getSLAStatus(step.deadline) : null;

  return (
    <div className="space-y-2">
      {/* Step name + status */}
      <div className="flex items-center gap-2">
        <span className="font-medium">{step.name}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
            config.color
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Actor + timestamp */}
      {step.actor && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {step.actor.avatar ? (
            <img
              src={step.actor.avatar}
              alt={step.actor.name}
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
              {step.actor.name.charAt(0)}
            </div>
          )}
          <span>{step.actor.name}</span>
          {step.actor.role && (
            <span className="text-xs">({step.actor.role})</span>
          )}
          {step.timestamp && (
            <span className="text-xs">
              {step.timestamp.toLocaleDateString()}{" "}
              {step.timestamp.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Comment */}
      {step.comment && (
        <p className="text-sm text-muted-foreground italic">"{step.comment}"</p>
      )}

      {/* Attachments */}
      {step.attachments && step.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {step.attachments.map((att) => (
            <a
              key={att.id}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs hover:bg-muted/80"
            >
              📎 {att.name}
            </a>
          ))}
        </div>
      )}

      {/* SLA indicator */}
      {showSLA && slaStatus && (
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs",
            slaStatus.isOverdue
              ? "bg-destructive/20 text-destructive"
              : slaStatus.isUrgent
                ? "bg-warning/20 text-warning-foreground"
                : "bg-muted text-muted-foreground"
          )}
        >
          ⏱ {slaStatus.label}
        </div>
      )}

      {/* Actions for pending steps */}
      {step.status === "pending" && step.isCurrent && (
        <div className="flex gap-2 pt-2">
          {onApprove && (
            <button
              onClick={() => onApprove(step.id)}
              className="rounded-md bg-success px-3 py-1.5 text-sm font-medium text-success-foreground hover:bg-success/90"
            >
              Approve
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(step.id)}
              className="rounded-md border border-destructive bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Calculate SLA status */
function getSLAStatus(deadline: Date): {
  isOverdue: boolean;
  isUrgent: boolean;
  label: string;
} {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (diff < 0) {
    const overdueDays = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
    return { isOverdue: true, isUrgent: false, label: `${overdueDays}d overdue` };
  }

  if (hours < 4) {
    return { isOverdue: false, isUrgent: true, label: `${hours}h remaining` };
  }

  if (hours < 24) {
    return { isOverdue: false, isUrgent: true, label: `${hours}h remaining` };
  }

  const days = Math.floor(hours / 24);
  return { isOverdue: false, isUrgent: false, label: `${days}d remaining` };
}
