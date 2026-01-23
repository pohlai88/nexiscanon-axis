/**
 * Notification System
 *
 * Provides a unified interface for sending notifications through multiple channels:
 * - In-app notifications (stored in database)
 * - Email notifications (via Resend)
 * - Future: Push notifications, Slack, etc.
 *
 * Pattern: Queue-based with immediate fallback for development.
 */

import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { isEnabled } from "@/lib/feature-flags";

/**
 * Notification types for categorization and routing.
 */
export type NotificationType =
  | "team.invite"
  | "team.member_joined"
  | "team.member_left"
  | "billing.payment_failed"
  | "billing.subscription_updated"
  | "billing.trial_ending"
  | "security.password_changed"
  | "security.api_key_created"
  | "security.login_new_device"
  | "system.maintenance"
  | "system.announcement";

/**
 * Notification priority levels.
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * Notification channels.
 */
export type NotificationChannel = "in_app" | "email" | "push";

/**
 * Notification payload.
 */
export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Notification recipient.
 */
export interface NotificationRecipient {
  userId: string;
  email?: string;
  tenantId?: string;
}

/**
 * Send a notification to a user.
 */
export async function sendNotification(
  recipient: NotificationRecipient,
  payload: NotificationPayload
): Promise<{ success: boolean; notificationId?: string }> {
  const log = logger.child({
    userId: recipient.userId,
    notificationType: payload.type,
  });

  const channels = payload.channels ?? ["in_app"];
  const results: { channel: NotificationChannel; success: boolean }[] = [];

  // In-app notification
  if (channels.includes("in_app") && isEnabled("IN_APP_NOTIFICATIONS_ENABLED")) {
    try {
      const notificationId = await createInAppNotification(recipient, payload);
      results.push({ channel: "in_app", success: true });
      log.info("In-app notification created", { notificationId });
    } catch (error) {
      log.error("Failed to create in-app notification", error);
      results.push({ channel: "in_app", success: false });
    }
  }

  // Email notification
  if (channels.includes("email") && isEnabled("EMAIL_NOTIFICATIONS_ENABLED")) {
    if (recipient.email) {
      try {
        await sendEmailNotification(recipient, payload);
        results.push({ channel: "email", success: true });
        log.info("Email notification sent");
      } catch (error) {
        log.error("Failed to send email notification", error);
        results.push({ channel: "email", success: false });
      }
    } else {
      log.warn("Email channel requested but no email provided");
    }
  }

  const allSucceeded = results.every((r) => r.success);
  return { success: allSucceeded || results.length === 0 };
}

/**
 * Send notification to multiple users.
 */
export async function sendBulkNotification(
  recipients: NotificationRecipient[],
  payload: NotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  let successCount = 0;
  let failureCount = 0;

  // Process in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((r) => sendNotification(r, payload))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.success) {
        successCount++;
      } else {
        failureCount++;
      }
    }
  }

  return { successCount, failureCount };
}

/**
 * Get unread notifications for a user.
 */
export async function getUnreadNotifications(
  userId: string,
  limit = 20
): Promise<InAppNotification[]> {
  const result = await query(async (sql) => {
    return sql`
      SELECT id, type, title, message, priority, metadata, action_url, action_label, created_at
      FROM notifications
      WHERE user_id = ${userId}::uuid
        AND read_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  });

  return result.map(mapNotification);
}

/**
 * Get all notifications for a user (paginated).
 */
export async function getNotifications(
  userId: string,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {}
): Promise<{ notifications: InAppNotification[]; total: number }> {
  const { limit = 20, offset = 0, unreadOnly = false } = options;

  const notifications = await query(async (sql) => {
    if (unreadOnly) {
      return sql`
        SELECT id, type, title, message, priority, metadata, action_url, action_label, created_at, read_at
        FROM notifications
        WHERE user_id = ${userId}::uuid AND read_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return sql`
      SELECT id, type, title, message, priority, metadata, action_url, action_label, created_at, read_at
      FROM notifications
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  });

  const countResult = await query(async (sql) => {
    if (unreadOnly) {
      return sql`
        SELECT COUNT(*) as count FROM notifications
        WHERE user_id = ${userId}::uuid AND read_at IS NULL
      `;
    }
    return sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId}::uuid
    `;
  });

  return {
    notifications: notifications.map(mapNotification),
    total: Number(countResult[0]?.count ?? 0),
  };
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await query(async (sql) => {
    return sql`
      UPDATE notifications
      SET read_at = now()
      WHERE id = ${notificationId}::uuid AND user_id = ${userId}::uuid
    `;
  });
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await query(async (sql) => {
    return sql`
      UPDATE notifications
      SET read_at = now()
      WHERE user_id = ${userId}::uuid AND read_at IS NULL
    `;
  });
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await query(async (sql) => {
    return sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId}::uuid AND read_at IS NULL
    `;
  });

  return Number(result[0]?.count ?? 0);
}

// --- Internal types ---

interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  readAt?: Date;
}

// --- Internal helpers ---

async function createInAppNotification(
  recipient: NotificationRecipient,
  payload: NotificationPayload
): Promise<string> {
  const result = await query(async (sql) => {
    return sql`
      INSERT INTO notifications (
        user_id, tenant_id, type, title, message, priority, metadata, action_url, action_label
      ) VALUES (
        ${recipient.userId}::uuid,
        ${recipient.tenantId ?? null}::uuid,
        ${payload.type},
        ${payload.title},
        ${payload.message},
        ${payload.priority ?? "normal"},
        ${JSON.stringify(payload.metadata ?? {})}::jsonb,
        ${payload.actionUrl ?? null},
        ${payload.actionLabel ?? null}
      )
      RETURNING id
    `;
  });

  return result[0]?.id as string;
}

async function sendEmailNotification(
  recipient: NotificationRecipient,
  payload: NotificationPayload
): Promise<void> {
  if (!recipient.email) return;

  // Build email HTML
  const actionHtml = payload.actionUrl
    ? `<p><a href="${payload.actionUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">${payload.actionLabel ?? "View Details"}</a></p>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${payload.title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #111827; font-size: 24px; margin-bottom: 16px;">${payload.title}</h1>
      <p style="font-size: 16px; margin-bottom: 24px;">${payload.message}</p>
      ${actionHtml}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
      <p style="font-size: 12px; color: #6b7280;">This notification was sent from NexusCanon AXIS.</p>
    </body>
    </html>
  `;

  await sendEmail({
    to: recipient.email,
    subject: payload.title,
    html,
    text: payload.message,
  });
}

function mapNotification(row: Record<string, unknown>): InAppNotification {
  return {
    id: row.id as string,
    type: row.type as NotificationType,
    title: row.title as string,
    message: row.message as string,
    priority: (row.priority as NotificationPriority) ?? "normal",
    metadata: row.metadata as Record<string, unknown> | undefined,
    actionUrl: row.action_url as string | undefined,
    actionLabel: row.action_label as string | undefined,
    createdAt: new Date(row.created_at as string),
    readAt: row.read_at ? new Date(row.read_at as string) : undefined,
  };
}
