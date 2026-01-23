/**
 * Customer Schema (F01 Compliant)
 * 
 * Customer master data for sales transactions.
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "./tenant";
import { users } from "./user";

/**
 * Contact information structure.
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  fax?: string;
}

/**
 * Address structure.
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

/**
 * Customers table.
 */
export const customers = pgTable(
  "customers",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Customer details
    customerNumber: varchar("customer_number", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }),

    // Contact information
    contactInfo: jsonb("contact_info").$type<ContactInfo>(),
    
    // Addresses
    billingAddress: jsonb("billing_address").$type<Address>(),
    shippingAddress: jsonb("shipping_address").$type<Address>(),

    // Business terms
    paymentTerms: varchar("payment_terms", { length: 50 }), // e.g., "Net 30", "Net 60"
    creditLimit: varchar("credit_limit", { length: 20 }), // String for decimal precision
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    taxExempt: boolean("tax_exempt").notNull().default(false),
    taxId: varchar("tax_id", { length: 50 }), // Tax ID / VAT number

    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // active | inactive | suspended
    isActive: boolean("is_active").notNull().default(true),

    // Additional details
    notes: text("notes"),
    tags: jsonb("tags").$type<string[]>().default([]),
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
    tenantIdIdx: index("idx_customers_tenant_id").on(table.tenantId),
    statusIdx: index("idx_customers_status").on(table.status),
    customerNameIdx: index("idx_customers_name").on(table.customerName),

    // Unique constraint: customer_number per tenant
    tenantNumberUniq: unique("uq_customers_tenant_number").on(
      table.tenantId,
      table.customerNumber
    ),
  })
);

/**
 * Type inference for customers.
 */
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
