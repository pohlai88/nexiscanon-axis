/**
 * Purchase Request Schema (F01 Compliant)
 * 
 * Internal purchase requests awaiting approval.
 */

import { pgTable, uuid, text, timestamp, decimal, jsonb, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "../tenant";
import { users } from "../user";

/**
 * Purchase request line item structure.
 */
export interface RequestLineItem {
  description: string;
  quantity: number;
  unit_price: string; // Decimal as string
  amount: string; // Decimal as string
  tax_rate?: string; // Decimal as string
  notes?: string;
}

/**
 * Purchase Requests table.
 */
export const purchaseRequests = pgTable(
  "purchase_requests",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Request details
    requestNumber: text("request_number").notNull(),
    requestDate: timestamp("request_date", { mode: "date" }).notNull(),
    
    // Status workflow
    status: text("status").notNull().default("draft"),
    // Possible values: draft | submitted | approved | rejected | converted
    
    // Requester
    requesterId: uuid("requester_id").references(() => users.id, { onDelete: "set null" }),
    requesterName: text("requester_name").notNull(),
    
    // Vendor (optional at request stage)
    vendorId: uuid("vendor_id"), // FK to vendors table (when implemented)
    vendorName: text("vendor_name"),
    
    // Financial details
    currency: text("currency").notNull().default("USD"),
    subtotal: decimal("subtotal", { precision: 15, scale: 4 }).notNull(),
    taxTotal: decimal("tax_total", { precision: 15, scale: 4 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 15, scale: 4 }).notNull(),
    
    // Line items (JSONB)
    lineItems: jsonb("line_items").$type<RequestLineItem[]>().notNull(),
    
    // Additional details
    justification: text("justification"),
    approvalNotes: text("approval_notes"),
    
    // Conversion tracking
    convertedToPoId: uuid("converted_to_po_id"), // FK to purchase_orders
    convertedAt: timestamp("converted_at", { mode: "date" }),
    
    // Metadata
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    
    // Audit fields (F01 LAW F01-02)
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    modifiedBy: uuid("modified_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    // Indexes (F01 LAW F01-04)
    tenantIdIdx: index("idx_purchase_requests_tenant_id").on(table.tenantId),
    statusIdx: index("idx_purchase_requests_status").on(table.status),
    requesterIdIdx: index("idx_purchase_requests_requester_id").on(table.requesterId),
    requestDateIdx: index("idx_purchase_requests_request_date").on(table.requestDate),
    
    // Unique constraint: request_number per tenant
    tenantNumberUniq: unique("uq_purchase_requests_tenant_number").on(
      table.tenantId,
      table.requestNumber
    ),
  })
);

/**
 * Type inference for purchase requests.
 */
export type PurchaseRequest = typeof purchaseRequests.$inferSelect;
export type NewPurchaseRequest = typeof purchaseRequests.$inferInsert;
