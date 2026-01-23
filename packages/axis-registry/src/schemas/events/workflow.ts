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
    instanceId: z.uuid(),
    workflowCode: z.string(),
    workflowVersion: z.number().int(),
    documentType: z.string(),
    documentId: z.uuid(),
    documentNumber: z.string().optional(),
    requestedBy: z.uuid(),
  })
);

export type WorkflowStartedEvent = z.infer<typeof workflowStartedEventSchema>;

export const workflowApprovedEventSchema = createEventSchema(
  "workflow.approved",
  z.object({
    instanceId: z.uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.uuid(),
    documentNumber: z.string().optional(),
    approvedAt: z.string().datetime(),
    totalSteps: z.number().int(),
  })
);

export type WorkflowApprovedEvent = z.infer<typeof workflowApprovedEventSchema>;

export const workflowRejectedEventSchema = createEventSchema(
  "workflow.rejected",
  z.object({
    instanceId: z.uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.uuid(),
    documentNumber: z.string().optional(),
    rejectedBy: z.uuid(),
    rejectedAtStep: z.number().int(),
    rejectionComments: z.string(),
  })
);

export type WorkflowRejectedEvent = z.infer<typeof workflowRejectedEventSchema>;

export const workflowCancelledEventSchema = createEventSchema(
  "workflow.cancelled",
  z.object({
    instanceId: z.uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.uuid(),
    cancelledBy: z.uuid(),
    cancellationReason: z.string().optional(),
  })
);

export type WorkflowCancelledEvent = z.infer<typeof workflowCancelledEventSchema>;

export const workflowExpiredEventSchema = createEventSchema(
  "workflow.expired",
  z.object({
    instanceId: z.uuid(),
    workflowCode: z.string(),
    documentType: z.string(),
    documentId: z.uuid(),
    expiredAt: z.string().datetime(),
    pendingAtStep: z.number().int(),
  })
);

export type WorkflowExpiredEvent = z.infer<typeof workflowExpiredEventSchema>;

export const workflowStepAdvancedEventSchema = createEventSchema(
  "workflow.step_advanced",
  z.object({
    instanceId: z.uuid(),
    workflowCode: z.string(),
    fromStep: z.number().int(),
    toStep: z.number().int(),
    advancedBy: z.uuid(),
  })
);

export type WorkflowStepAdvancedEvent = z.infer<typeof workflowStepAdvancedEventSchema>;

// ============================================================================
// Task Events
// ============================================================================

export const taskAssignedEventSchema = createEventSchema(
  "task.assigned",
  z.object({
    taskId: z.uuid(),
    workflowInstanceId: z.uuid(),
    stepNumber: z.number().int(),
    assignedToId: z.uuid(),
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
    taskId: z.uuid(),
    workflowInstanceId: z.uuid(),
    stepNumber: z.number().int(),
    approvedBy: z.uuid(),
    comments: z.string().optional(),
  })
);

export type TaskApprovedEvent = z.infer<typeof taskApprovedEventSchema>;

export const taskRejectedEventSchema = createEventSchema(
  "task.rejected",
  z.object({
    taskId: z.uuid(),
    workflowInstanceId: z.uuid(),
    stepNumber: z.number().int(),
    rejectedBy: z.uuid(),
    comments: z.string(),
  })
);

export type TaskRejectedEvent = z.infer<typeof taskRejectedEventSchema>;

export const taskDelegatedEventSchema = createEventSchema(
  "task.delegated",
  z.object({
    taskId: z.uuid(),
    workflowInstanceId: z.uuid(),
    originalAssigneeId: z.uuid(),
    delegatedToId: z.uuid(),
    delegatedToName: z.string(),
    delegationId: z.uuid(),
  })
);

export type TaskDelegatedEvent = z.infer<typeof taskDelegatedEventSchema>;

export const taskEscalatedEventSchema = createEventSchema(
  "task.escalated",
  z.object({
    taskId: z.uuid(),
    workflowInstanceId: z.uuid(),
    escalationRuleId: z.uuid(),
    escalationAction: z.enum(ESCALATION_ACTION),
    escalatedToId: z.uuid().optional(),
    escalatedToName: z.string().optional(),
  })
);

export type TaskEscalatedEvent = z.infer<typeof taskEscalatedEventSchema>;

export const taskReminderSentEventSchema = createEventSchema(
  "task.reminder_sent",
  z.object({
    taskId: z.uuid(),
    workflowInstanceId: z.uuid(),
    recipientId: z.uuid(),
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
    delegationId: z.uuid(),
    delegatorId: z.uuid(),
    delegatorName: z.string(),
    delegateId: z.uuid(),
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
    delegationId: z.uuid(),
    delegatorId: z.uuid(),
    delegateId: z.uuid(),
    revokedBy: z.uuid(),
    revokedAt: z.string().datetime(),
  })
);

export type DelegationRevokedEvent = z.infer<typeof delegationRevokedEventSchema>;

export const delegationExpiringEventSchema = createEventSchema(
  "delegation.expiring",
  z.object({
    delegationId: z.uuid(),
    delegatorId: z.uuid(),
    delegateId: z.uuid(),
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
    notificationId: z.uuid(),
    notificationType: z.string(),
    channel: z.string(),
    recipientId: z.uuid(),
    workflowInstanceId: z.uuid().optional(),
    taskId: z.uuid().optional(),
    sentAt: z.string().datetime(),
  })
);

export type NotificationSentEvent = z.infer<typeof notificationSentEventSchema>;

export const notificationFailedEventSchema = createEventSchema(
  "notification.failed",
  z.object({
    notificationId: z.uuid(),
    notificationType: z.string(),
    channel: z.string(),
    recipientId: z.uuid(),
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
