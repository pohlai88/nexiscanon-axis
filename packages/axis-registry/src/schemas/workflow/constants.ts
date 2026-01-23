/**
 * Workflow Domain Constants (B08-01)
 *
 * Approvals, State Machines & Process Orchestration
 */

// ============================================================================
// Workflow Types
// ============================================================================

export const WORKFLOW_TYPE = [
  "approval",
  "review",
  "multi_step",
  "parallel",
  "conditional",
] as const;

export type WorkflowType = (typeof WORKFLOW_TYPE)[number];

export const WORKFLOW_STATUS = [
  "draft",
  "active",
  "suspended",
  "archived",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUS)[number];

// ============================================================================
// Step Types
// ============================================================================

export const STEP_TYPE = [
  "approval",
  "notification",
  "condition",
  "parallel_start",
  "parallel_end",
  "escalation",
] as const;

export type StepType = (typeof STEP_TYPE)[number];

// ============================================================================
// Approver Types
// ============================================================================

export const APPROVER_TYPE = [
  "user",
  "role",
  "manager",
  "document_owner",
  "field_value",
  "script",
] as const;

export type ApproverType = (typeof APPROVER_TYPE)[number];

export const APPROVAL_MODE = ["any", "all", "majority", "threshold"] as const;

export type ApprovalMode = (typeof APPROVAL_MODE)[number];

// ============================================================================
// Instance Status
// ============================================================================

export const INSTANCE_STATUS = [
  "pending",
  "in_progress",
  "approved",
  "rejected",
  "cancelled",
  "expired",
] as const;

export type InstanceStatus = (typeof INSTANCE_STATUS)[number];

// ============================================================================
// Task Status
// ============================================================================

export const TASK_STATUS = [
  "pending",
  "approved",
  "rejected",
  "delegated",
  "escalated",
  "expired",
  "cancelled",
] as const;

export type TaskStatus = (typeof TASK_STATUS)[number];

export const TASK_PRIORITY = ["low", "normal", "high", "urgent"] as const;

export type TaskPriority = (typeof TASK_PRIORITY)[number];

// ============================================================================
// Task History Actions
// ============================================================================

export const TASK_HISTORY_ACTION = [
  "created",
  "viewed",
  "approved",
  "rejected",
  "delegated",
  "escalated",
  "reminded",
  "cancelled",
] as const;

export type TaskHistoryAction = (typeof TASK_HISTORY_ACTION)[number];

// ============================================================================
// Timeout Actions
// ============================================================================

export const TIMEOUT_ACTION = [
  "escalate",
  "auto_approve",
  "auto_reject",
  "remind",
] as const;

export type TimeoutAction = (typeof TIMEOUT_ACTION)[number];

// ============================================================================
// Delegation Types
// ============================================================================

export const DELEGATION_TYPE = [
  "all",
  "document_type",
  "amount_threshold",
] as const;

export type DelegationType = (typeof DELEGATION_TYPE)[number];

// ============================================================================
// Escalation Actions
// ============================================================================

export const ESCALATION_ACTION = [
  "reassign",
  "notify_manager",
  "auto_approve",
  "auto_reject",
  "expire",
] as const;

export type EscalationAction = (typeof ESCALATION_ACTION)[number];

// ============================================================================
// Notification Types
// ============================================================================

export const NOTIFICATION_TYPE = [
  "task_assigned",
  "task_reminder",
  "task_escalated",
  "workflow_approved",
  "workflow_rejected",
  "delegation_created",
  "delegation_expiring",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[number];

export const NOTIFICATION_CHANNEL = ["in_app", "email", "sms", "push"] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNEL)[number];

export const NOTIFICATION_STATUS = [
  "pending",
  "sent",
  "failed",
  "read",
] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUS)[number];
