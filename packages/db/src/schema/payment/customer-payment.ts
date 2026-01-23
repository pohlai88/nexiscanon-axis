/**
 * Customer Payment Schema (F01 + B01 Compliant)
 * 
 * Payments received from customers (AR collection).
 */

import { pgTable, uuid, text, timestamp, decimal, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "../tenant";
import { users } from "../user";
import { documents } from "../document";
import { salesInvoices } from "../sales/invoice";

/**
 * Customer Payments table.
 * 
 * B01 Integration: Links to documents table via document_id.
 */
export const customerPayments = pgTable(
  "customer_payments",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Payment details
    paymentNumber: text("payment_number").notNull(),
    paymentDate: timestamp("payment_date", { mode: "date" }).notNull(),
    
    // Customer
    customerId: uuid("customer_id"), // FK to customers table (when implemented)
    customerName: text("customer_name").notNull(),
    
    // Payment method
    paymentMethod: text("payment_method").notNull(),
    // Possible values: cash | check | wire | card | ach
    referenceNumber: text("reference_number"), // Check #, transaction ID, etc.
    
    // Financial details
    amount: decimal("amount", { precision: 15, scale: 4 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    unappliedAmount: decimal("unapplied_amount", { precision: 15, scale: 4 }).notNull(),
    
    // Bank account
    bankAccountId: uuid("bank_account_id"), // FK to bank_accounts (when implemented)
    
    // Invoice linkage (optional - can apply to specific invoice)
    invoiceId: uuid("invoice_id").references(() => salesInvoices.id, { onDelete: "set null" }),
    
    // Status workflow
    status: text("status").notNull().default("pending"),
    // Possible values: pending | cleared | reconciled | void
    
    // Additional details
    notes: text("notes"),
    
    // B01 POSTING SPINE INTEGRATION
    documentId: uuid("document_id").references(() => documents.id, { onDelete: "set null" }),
    postedAt: timestamp("posted_at", { mode: "date" }),
    
    // Metadata
    metadata: text("metadata").$type<Record<string, unknown>>().notNull().default({}),
    
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
    tenantIdIdx: index("idx_customer_payments_tenant_id").on(table.tenantId),
    customerIdIdx: index("idx_customer_payments_customer_id").on(table.customerId),
    invoiceIdIdx: index("idx_customer_payments_invoice_id").on(table.invoiceId),
    bankAccountIdIdx: index("idx_customer_payments_bank_account_id").on(table.bankAccountId),
    documentIdIdx: index("idx_customer_payments_document_id").on(table.documentId), // B01 integration
    paymentDateIdx: index("idx_customer_payments_payment_date").on(table.paymentDate),
    statusIdx: index("idx_customer_payments_status").on(table.status),
    
    // Unique constraint: payment_number per tenant
    tenantNumberUniq: unique("uq_customer_payments_tenant_number").on(
      table.tenantId,
      table.paymentNumber
    ),
  })
);

/**
 * Type inference for customer payments.
 */
export type CustomerPayment = typeof customerPayments.$inferSelect;
export type NewCustomerPayment = typeof customerPayments.$inferInsert;
