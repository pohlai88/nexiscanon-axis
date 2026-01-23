/**
 * Danger Zone Table (B08)
 *
 * Override-required actions.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type DangerZoneType,
  type DangerZoneStatus,
} from "@axis/registry/schemas";

export const ctrlDangerZoneRequests = pgTable(
  "ctrl_danger_zone_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Type
    dangerZoneType: varchar("danger_zone_type", { length: 30 })
      .notNull()
      .$type<DangerZoneType>(),

    // Request
    requestedBy: uuid("requested_by").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
    reason: text("reason").notNull(),

    // Context (cross-domain reference by UUID, not FK per B02)
    targetDocumentType: varchar("target_document_type", { length: 50 }).notNull(),
    targetDocumentId: uuid("target_document_id").notNull(),
    targetDocumentNumber: varchar("target_document_number", { length: 50 }),

    // Action details
    actionDetails: jsonb("action_details")
      .notNull()
      .$type<Record<string, unknown>>(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<DangerZoneStatus>(),

    // Approval
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvalNotes: text("approval_notes"),

    // Rejection
    rejectedBy: uuid("rejected_by"),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),

    // Execution
    executedAt: timestamp("executed_at", { withTimezone: true }),
    executionResult: jsonb("execution_result").$type<Record<string, unknown>>(),

    // Expiry
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    // Audit
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_ctrl_danger_zone_tenant").on(table.tenantId),
    index("idx_ctrl_danger_zone_type").on(table.tenantId, table.dangerZoneType),
    index("idx_ctrl_danger_zone_status").on(table.tenantId, table.status),
    index("idx_ctrl_danger_zone_target").on(
      table.tenantId,
      table.targetDocumentType,
      table.targetDocumentId
    ),
    index("idx_ctrl_danger_zone_requester").on(
      table.tenantId,
      table.requestedBy
    ),
    index("idx_ctrl_danger_zone_expires").on(table.tenantId, table.expiresAt),
  ]
);

export const ctrlDangerZoneRequestsRelations = relations(
  ctrlDangerZoneRequests,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [ctrlDangerZoneRequests.tenantId],
      references: [tenants.id],
    }),
  })
);

export type CtrlDangerZoneRequestRow =
  typeof ctrlDangerZoneRequests.$inferSelect;
export type NewCtrlDangerZoneRequestRow =
  typeof ctrlDangerZoneRequests.$inferInsert;
