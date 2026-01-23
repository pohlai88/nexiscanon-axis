/**
 * Purchase Bill Schema (F01 + B01 Compliant)
 * 
 * Vendor bills with AP posting integration to posting spine.
 */

import { pgTable, uuid, text, timestamp, decimal, jsonb, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "../tenant";
import { users } from "../user";
import { vendors } from "../vendor";
import { documents } from "../document";
import { purchaseOrders } from "./order";

/**
 * Purchase bill line item structure.
 * 
 * CRITICAL: Includes account_code for GL posting integration.
 */
export interface BillLineItem {
  description: string;
  quantity: number;
  unit_price: string; // Decimal as string
  amount: string; // Decimal as string
  tax_rate?: string; // Decimal as string
  account_code: string; // For GL posting (e.g., "5100" for expense)
  notes?: string;
}

/**
 * Purchase Bills table.
 * 
 * B01 Integration: Links to documents table via document_id.
 */
export const purchaseBills = pgTable(
  "purchase_bills",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Bill details
    billNumber: text("bill_number").notNull(),
    billDate: timestamp("bill_date", { mode: "date" }).notNull(),
    dueDate: timestamp("due_date", { mode: "date" }).notNull(),
    
    // Status workflow
    status: text("status").notNull().default("draft"),
    // Possible values: draft | received | approved | posted | paid | cancelled
    
    // Vendor
    vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "restrict" }),
    vendorName: text("vendor_name").notNull(),
    vendorEmail: text("vendor_email"),
    
    // Link to purchase order
    poId: uuid("po_id").references(() => purchaseOrders.id, { onDelete: "set null" }),
    
    // Financial details
    currency: text("currency").notNull().default("USD"),
    subtotal: decimal("subtotal", { precision: 15, scale: 4 }).notNull(),
    taxTotal: decimal("tax_total", { precision: 15, scale: 4 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 15, scale: 4 }).notNull(),
    amountPaid: decimal("amount_paid", { precision: 15, scale: 4 }).notNull().default("0"),
    amountDue: decimal("amount_due", { precision: 15, scale: 4 }).notNull(),
    
    // Line items (JSONB) with account_code for posting
    lineItems: jsonb("line_items").$type<BillLineItem[]>().notNull(),
    
    // Additional details
    paymentTerms: text("payment_terms"),
    notes: text("notes"),
    
    // B01 POSTING SPINE INTEGRATION
    documentId: uuid("document_id").references(() => documents.id, { onDelete: "set null" }),
    postedAt: timestamp("posted_at", { mode: "date" }),
    
    // Payment tracking
    lastPaymentDate: timestamp("last_payment_date", { mode: "date" }),
    
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
    tenantIdIdx: index("idx_purchase_bills_tenant_id").on(table.tenantId),
    statusIdx: index("idx_purchase_bills_status").on(table.status),
    vendorIdIdx: index("idx_purchase_bills_vendor_id").on(table.vendorId),
    poIdIdx: index("idx_purchase_bills_po_id").on(table.poId),
    documentIdIdx: index("idx_purchase_bills_document_id").on(table.documentId), // B01 integration
    billDateIdx: index("idx_purchase_bills_bill_date").on(table.billDate),
    dueDateIdx: index("idx_purchase_bills_due_date").on(table.dueDate),
    
    // Unique constraint: bill_number per tenant
    tenantNumberUniq: unique("uq_purchase_bills_tenant_number").on(
      table.tenantId,
      table.billNumber
    ),
  })
);

/**
 * Type inference for purchase bills.
 */
export type PurchaseBill = typeof purchaseBills.$inferSelect;
export type NewPurchaseBill = typeof purchaseBills.$inferInsert;
