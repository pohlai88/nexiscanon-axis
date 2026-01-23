/**
 * Purchase Request Table (B05)
 *
 * Internal request capturing department/user needs.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  integer,
  numeric,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type PrStatus,
  type PrPriority,
  type PurchaseRequestLine,
  type ApprovalEntry,
} from "@axis/registry/schemas";

export const purchaseRequests = pgTable(
  "purchase_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Identity
    documentNumber: varchar("document_number", { length: 50 }).notNull(),

    // Requester
    requesterId: uuid("requester_id").notNull(),
    requesterName: varchar("requester_name", { length: 255 }).notNull(),
    departmentId: uuid("department_id"),
    departmentName: varchar("department_name", { length: 255 }),

    // PR specifics
    status: varchar("status", { length: 30 })
      .notNull()
      .default("draft")
      .$type<PrStatus>(),
    priority: varchar("priority", { length: 20 })
      .notNull()
      .default("normal")
      .$type<PrPriority>(),
    requiredByDate: timestamp("required_by_date", { withTimezone: true }),

    // Suggested supplier
    suggestedSupplierId: uuid("suggested_supplier_id"),
    suggestedSupplierName: varchar("suggested_supplier_name", { length: 255 }),

    // Lines
    lines: jsonb("lines").notNull().$type<PurchaseRequestLine[]>(),

    // Totals
    estimatedTotal: numeric("estimated_total", { precision: 18, scale: 4 }),
    currency: varchar("currency", { length: 3 }),

    // Budget reference
    budgetCode: varchar("budget_code", { length: 50 }),
    costCenterId: uuid("cost_center_id"),
    projectId: uuid("project_id"),

    // Justification
    justification: text("justification"),

    // Approval tracking
    approvalChain: jsonb("approval_chain").$type<ApprovalEntry[]>(),

    // PO tracking
    poIds: jsonb("po_ids").$type<string[]>(),

    // Audit
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),

    // Version
    version: integer("version").notNull().default(1),
  },
  (table) => [
    index("idx_purchase_requests_tenant").on(table.tenantId),
    index("idx_purchase_requests_requester").on(
      table.tenantId,
      table.requesterId
    ),
    index("idx_purchase_requests_status").on(table.tenantId, table.status),
    index("idx_purchase_requests_doc_number").on(
      table.tenantId,
      table.documentNumber
    ),
  ]
);

export const purchaseRequestsRelations = relations(
  purchaseRequests,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [purchaseRequests.tenantId],
      references: [tenants.id],
    }),
  })
);

export type PurchaseRequestRow = typeof purchaseRequests.$inferSelect;
export type NewPurchaseRequestRow = typeof purchaseRequests.$inferInsert;
