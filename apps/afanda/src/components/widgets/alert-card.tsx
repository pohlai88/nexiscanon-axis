"use client";

import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

/**
 * AFANDA Alert Card Widget
 *
 * Displays an alert with severity, title, description, and actions.
 *
 * @see AFANDA.md §5.3 AFANDA-Specific CSS Classes
 * @see B11-AFANDA.md §6 Alert System
 */

export interface AlertCardProps {
  /** Alert ID */
  id: string;
  /** Alert title */
  title: string;
  /** Alert description/message */
  description: string;
  /** Severity level */
  severity: "critical" | "warning" | "info" | "success";
  /** When the alert was fired */
  timestamp?: string;
  /** Alert status */
  status?: "active" | "acknowledged" | "resolved";
  /** Callback when acknowledged */
  onAcknowledge?: (id: string) => void;
  /** Callback when dismissed */
  onDismiss?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    className: "afanda-alert-critical",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "afanda-alert-warning",
    iconColor: "text-yellow-500",
  },
  info: {
    icon: Info,
    className: "afanda-alert-info",
    iconColor: "text-blue-500",
  },
  success: {
    icon: CheckCircle,
    className: "afanda-alert-success",
    iconColor: "text-green-500",
  },
};

export function AlertCard({
  id,
  title,
  description,
  severity,
  timestamp,
  status = "active",
  onAcknowledge,
  onDismiss,
  className,
}: AlertCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "afanda-alert rounded-lg border-l-4 bg-card/60 p-4 backdrop-blur-sm",
        config.className,
        status === "acknowledged" && "opacity-60",
        status === "resolved" && "opacity-40",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconColor)} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="afanda-alert-title font-medium text-foreground">
              {title}
            </h4>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => onDismiss(id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>
          <p className="afanda-alert-description text-sm text-muted-foreground">
            {description}
          </p>
          <div className="flex items-center justify-between pt-2">
            {timestamp && (
              <span className="afanda-alert-timestamp text-xs text-muted-foreground">
                {timestamp}
              </span>
            )}
            {status === "active" && onAcknowledge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(id)}
              >
                Acknowledge
              </Button>
            )}
            {status === "acknowledged" && (
              <span className="text-xs text-muted-foreground">Acknowledged</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Alert List Widget
 *
 * A list of alerts with optional filtering.
 */
export interface AlertListProps {
  alerts: AlertCardProps[];
  maxItems?: number;
  className?: string;
}

export function AlertList({ alerts, maxItems, className }: AlertListProps) {
  const displayAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

  return (
    <div className={cn("space-y-3", className)}>
      {displayAlerts.map((alert) => (
        <AlertCard key={alert.id} {...alert} />
      ))}
      {maxItems && alerts.length > maxItems && (
        <p className="text-center text-sm text-muted-foreground">
          +{alerts.length - maxItems} more alerts
        </p>
      )}
    </div>
  );
}
