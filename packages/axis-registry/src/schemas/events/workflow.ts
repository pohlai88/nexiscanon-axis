/**
 * Workflow Domain Events (B08-01)
 *
 * Events for Approvals, State Machines & Process Orchestration
 */

import { z } from "zod";
import { createEventSchema } from "./base";
import { ESCALATION_ACTION } from "../workflow/constants";

// ============================================================================
// Workflow Instance Events
// ============================================================================

export const workflowStartedEventSchema = createEventSchema(
  "workflow.started",
  z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    workflowVersion: z.number().int(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    documentNumber: z.string().optional(),
    requestedBy: z.string().uuid(),
  })
);

export type WorkflowStartedEvent = z.infer<typeof workflowStartedEventSchema>;

export const workflowApprovedEventSchema = createEventSchema(
  "workflow.approved",
  z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    documentNumber: z.string().optional(),
    approvedAt: z.string().datetime(),
    totalSteps: z.number().int(),
  })
);

export type WorkflowApprovedEvent = z.infer<typeof workflowApprovedEventSchema>;

export const workflowRejectedEventSchema = createEventSchema(
  "workflow.rejected",
  z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    documentNumber: z.string().optional(),
    rejectedBy: z.string().uuid(),
    rejectedAtStep: z.number().int(),
    rejectionComments: z.string(),
  })
);

export type WorkflowRejectedEvent = z.infer<typeof workflowRejectedEventSchema>;

export const workflowCancelledEventSchema = createEventSchema(
  "workflow.cancelled",
  z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    cancelledBy: z.string().uuid(),
    cancellationReason: z.string().optional(),
  })
);

export type WorkflowCancelledEvent = z.infer<typeof workflowCancelledEventSchema>;

export const workflowExpiredEventSchema = createEventSchema(
  "workflow.expired",
  z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.string().uuid(),
    expiredAt: z.string().datetime(),
    pendingAtStep: z.number().int(),
  })
);

export type WorkflowExpiredEvent = z.infer<typeof workflowExpiredEventSchema>;

export const workflowStepAdvancedEventSchema = createEventSchema(
  "workflow.step_advanced",
  z.object({
    instanceId: z.string().uuid(),
    workflowCode: z.string(),
    fromStep: z.number().int(),
    toStep: z.number().int(),
    advancedBy: z.string().uuid(),
  })
);

export type WorkflowStepAdvancedEvent = z.infer<typeof workflowStepAdvancedEventSchema>;

// ============================================================================
// Task Events
// ============================================================================

export const taskAssignedEventSchema = createEventSchema(
  "task.assigned",
  z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    stepNumber: z.number().int(),
    assignedToId: z.string().uuid(),
    assignedToType: z.enum(["user", "role"]),
    assignedToName: z.string(),
    dueAt: z.string().datetime().optional(),
    priority: z.string(),
  })
);

export type TaskAssignedEvent = z.infer<typeof taskAssignedEventSchema>;

export const taskApprovedEventSchema = createEventSchema(
  "task.approved",
  z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    stepNumber: z.number().int(),
    approvedBy: z.string().uuid(),
    comments: z.string().optional(),
  })
);

export type TaskApprovedEvent = z.infer<typeof taskApprovedEventSchema>;

export const taskRejectedEventSchema = createEventSchema(
  "task.rejected",
  z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    stepNumber: z.number().int(),
    rejectedBy: z.string().uuid(),
    comments: z.string(),
  })
);

export type TaskRejectedEvent = z.infer<typeof taskRejectedEventSchema>;

export const taskDelegatedEventSchema = createEventSchema(
  "task.delegated",
  z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    originalAssigneeId: z.string().uuid(),
    delegatedToId: z.string().uuid(),
    delegatedToName: z.string(),
    delegationId: z.string().uuid(),
  })
);

export type TaskDelegatedEvent = z.infer<typeof taskDelegatedEventSchema>;

export const taskEscalatedEventSchema = createEventSchema(
  "task.escalated",
  z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    escalationRuleId: z.string().uuid(),
    escalationAction: z.enum(ESCALATION_ACTION),
    escalatedToId: z.string().uuid().optional(),
    escalatedToName: z.string().optional(),
  })
);

export type TaskEscalatedEvent = z.infer<typeof taskEscalatedEventSchema>;

export const taskReminderSentEventSchema = createEventSchema(
  "task.reminder_sent",
  z.object({
    taskId: z.string().uuid(),
    workflowInstanceId: z.string().uuid(),
    recipientId: z.string().uuid(),
    reminderNumber: z.number().int(),
    channel: z.string(),
  })
);

export type TaskReminderSentEvent = z.infer<typeof taskReminderSentEventSchema>;

// ============================================================================
// Delegation Events
// ============================================================================

export const delegationCreatedEventSchema = createEventSchema(
  "delegation.created",
  z.object({
    delegationId: z.string().uuid(),
    delegatorId: z.string().uuid(),
    delegatorName: z.string(),
    delegateId: z.string().uuid(),
    delegateName: z.string(),
    delegationType: z.string(),
    effectiveFrom: z.string().datetime(),
    effectiveTo: z.string().datetime(),
    reason: z.string().optional(),
  })
);

export type DelegationCreatedEvent = z.infer<typeof delegationCreatedEventSchema>;

export const delegationRevokedEventSchema = createEventSchema(
  "delegation.revoked",
  z.object({
    delegationId: z.string().uuid(),
    delegatorId: z.string().uuid(),
    delegateId: z.string().uuid(),
    revokedBy: z.string().uuid(),
    revokedAt: z.string().datetime(),
  })
);

export type DelegationRevokedEvent = z.infer<typeof delegationRevokedEventSchema>;

export const delegationExpiringEventSchema = createEventSchema(
  "delegation.expiring",
  z.object({
    delegationId: z.string().uuid(),
    delegatorId: z.string().uuid(),
    delegateId: z.string().uuid(),
    expiresAt: z.string().datetime(),
    hoursRemaining: z.number().int(),
  })
);

export type DelegationExpiringEvent = z.infer<typeof delegationExpiringEventSchema>;

// ============================================================================
// Notification Events
// ============================================================================

export const notificationSentEventSchema = createEventSchema(
  "notification.sent",
  z.object({
    notificationId: z.string().uuid(),
    notificationType: z.string(),
    channel: z.string(),
    recipientId: z.string().uuid(),
    workflowInstanceId: z.string().uuid().optional(),
    taskId: z.string().uuid().optional(),
    sentAt: z.string().datetime(),
  })
);

export type NotificationSentEvent = z.infer<typeof notificationSentEventSchema>;

export const notificationFailedEventSchema = createEventSchema(
  "notification.failed",
  z.object({
    notificationId: z.string().uuid(),
    notificationType: z.string(),
    channel: z.string(),
    recipientId: z.string().uuid(),
    errorMessage: z.string(),
    retryCount: z.number().int(),
  })
);

export type NotificationFailedEvent = z.infer<typeof notificationFailedEventSchema>;

// ============================================================================
// Workflow Event Union
// ============================================================================

export const workflowEventSchema = z.union([
  workflowStartedEventSchema,
  workflowApprovedEventSchema,
  workflowRejectedEventSchema,
  workflowCancelledEventSchema,
  workflowExpiredEventSchema,
  workflowStepAdvancedEventSchema,
  taskAssignedEventSchema,
  taskApprovedEventSchema,
  taskRejectedEventSchema,
  taskDelegatedEventSchema,
  taskEscalatedEventSchema,
  taskReminderSentEventSchema,
  delegationCreatedEventSchema,
  delegationRevokedEventSchema,
  delegationExpiringEventSchema,
  notificationSentEventSchema,
  notificationFailedEventSchema,
]);

export type WorkflowEvent = z.infer<typeof workflowEventSchema>;
