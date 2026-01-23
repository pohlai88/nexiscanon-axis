/**
 * Purchase Order Schema (F01 Compliant)
 * 
 * Confirmed purchase orders sent to vendors.
 */

import { pgTable, uuid, text, timestamp, decimal, jsonb, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "../tenant";
import { users } from "../user";
import { vendors } from "../vendor";
import { purchaseRequests } from "./request";

/**
 * Purchase order line item structure.
 */
export interface PurchaseOrderLineItem {
  description: string;
  quantity: number;
  unit_price: string; // Decimal as string
  amount: string; // Decimal as string
  tax_rate?: string; // Decimal as string
  notes?: string;
}

/**
 * Purchase delivery address structure.
 */
export interface PurchaseDeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

/**
 * Purchase Orders table.
 */
export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // PO details
    poNumber: text("po_number").notNull(),
    poDate: timestamp("po_date", { mode: "date" }).notNull(),
    expectedDeliveryDate: timestamp("expected_delivery_date", { mode: "date" }),
    
    // Status workflow
    status: text("status").notNull().default("pending"),
    // Possible values: pending | sent | acknowledged | received | invoiced | cancelled
    
    // Vendor
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "restrict" }),
    vendorName: text("vendor_name").notNull(),
    vendorEmail: text("vendor_email"),
    
    // Link to purchase request
    requestId: uuid("request_id").references(() => purchaseRequests.id, { onDelete: "set null" }),
    
    // Financial details
    currency: text("currency").notNull().default("USD"),
    subtotal: decimal("subtotal", { precision: 15, scale: 4 }).notNull(),
    taxTotal: decimal("tax_total", { precision: 15, scale: 4 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 15, scale: 4 }).notNull(),
    
    // Line items (JSONB)
    lineItems: jsonb("line_items").$type<PurchaseOrderLineItem[]>().notNull(),
    
    // Delivery details
    deliveryAddress: jsonb("delivery_address").$type<PurchaseDeliveryAddress>(),
    
    // Additional details
    paymentTerms: text("payment_terms"),
    notes: text("notes"),
    
    // Conversion tracking
    billId: uuid("bill_id"), // FK to purchase_bills
    receivedAt: timestamp("received_at", { mode: "date" }),
    invoicedAt: timestamp("invoiced_at", { mode: "date" }),
    
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
    tenantIdIdx: index("idx_purchase_orders_tenant_id").on(table.tenantId),
    statusIdx: index("idx_purchase_orders_status").on(table.status),
    vendorIdIdx: index("idx_purchase_orders_vendor_id").on(table.vendorId),
    requestIdIdx: index("idx_purchase_orders_request_id").on(table.requestId),
    poDateIdx: index("idx_purchase_orders_po_date").on(table.poDate),
    
    // Unique constraint: po_number per tenant
    tenantNumberUniq: unique("uq_purchase_orders_tenant_number").on(
      table.tenantId,
      table.poNumber
    ),
  })
);

/**
 * Type inference for purchase orders.
 */
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;
