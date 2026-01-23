/**
 * Workflow Notification Schema (B08-01)
 *
 * Pending/sent notification queue.
 */

import { z } from "zod";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
} from "./constants";

// ============================================================================
// Workflow Notification Schema
// ============================================================================

export const workflowNotificationSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),

  // Type
  notificationType: z.enum(NOTIFICATION_TYPE),
  channel: z.enum(NOTIFICATION_CHANNEL),

  // Recipient
  recipientId: z.uuid(),
  recipientEmail: z.email().optional(),
  recipientPhone: z.string().max(20).optional(),

  // Content
  subject: z.string().max(255),
  body: z.string().max(5000),
  htmlBody: z.string().optional(),

  // Reference
  workflowInstanceId: z.uuid().optional(),
  taskId: z.uuid().optional(),

  // Status
  status: z.enum(NOTIFICATION_STATUS).default("pending"),

  // Timing
  scheduledAt: z.string().datetime().optional(),
  sentAt: z.string().datetime().optional(),
  readAt: z.string().datetime().optional(),

  // Error tracking
  errorMessage: z.string().max(1000).optional(),
  retryCount: z.number().int().default(0),

  createdAt: z.string().datetime(),
});

export type WorkflowNotification = z.infer<typeof workflowNotificationSchema>;
