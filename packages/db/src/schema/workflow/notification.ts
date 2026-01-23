/**
 * Workflow Notification Table (B08-01)
 *
 * Pending/sent notification queue.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { wfInstances } from "./instance";
import { wfTasks } from "./task";
import {
  type NotificationType,
  type NotificationChannel,
  type NotificationStatus,
} from "@axis/registry/schemas";

export const wfNotifications = pgTable(
  "wf_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Type
    notificationType: varchar("notification_type", { length: 30 })
      .notNull()
      .$type<NotificationType>(),
    channel: varchar("channel", { length: 20 })
      .notNull()
      .$type<NotificationChannel>(),

    // Recipient
    recipientId: uuid("recipient_id").notNull(),
    recipientEmail: varchar("recipient_email", { length: 255 }),
    recipientPhone: varchar("recipient_phone", { length: 20 }),

    // Content
    subject: varchar("subject", { length: 255 }).notNull(),
    body: text("body").notNull(),
    htmlBody: text("html_body"),

    // Reference (same domain, FK allowed)
    workflowInstanceId: uuid("workflow_instance_id").references(
      () => wfInstances.id,
      { onDelete: "cascade" }
    ),
    taskId: uuid("task_id").references(() => wfTasks.id, {
      onDelete: "cascade",
    }),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<NotificationStatus>(),

    // Timing
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),

    // Error tracking
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_wf_notifications_tenant").on(table.tenantId),
    index("idx_wf_notifications_recipient").on(table.tenantId, table.recipientId),
    index("idx_wf_notifications_status").on(table.tenantId, table.status),
    index("idx_wf_notifications_channel").on(
      table.tenantId,
      table.channel,
      table.status
    ),
    index("idx_wf_notifications_instance").on(
      table.tenantId,
      table.workflowInstanceId
    ),
    index("idx_wf_notifications_task").on(table.tenantId, table.taskId),
    index("idx_wf_notifications_scheduled").on(
      table.tenantId,
      table.status,
      table.scheduledAt
    ),
  ]
);

export const wfNotificationsRelations = relations(
  wfNotifications,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [wfNotifications.tenantId],
      references: [tenants.id],
    }),
    instance: one(wfInstances, {
      fields: [wfNotifications.workflowInstanceId],
      references: [wfInstances.id],
    }),
    task: one(wfTasks, {
      fields: [wfNotifications.taskId],
      references: [wfTasks.id],
    }),
  })
);

export type WfNotificationRow = typeof wfNotifications.$inferSelect;
export type NewWfNotificationRow = typeof wfNotifications.$inferInsert;
