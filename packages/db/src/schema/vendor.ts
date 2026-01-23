/**
 * Vendor Schema (F01 Compliant)
 * 
 * Vendor master data for purchase transactions.
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";
import { tenants } from "./tenant";
import { users } from "./user";

/**
 * Vendor contact information structure.
 */
export interface VendorContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  fax?: string;
}

/**
 * Vendor address structure.
 */
export interface VendorAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

/**
 * Vendors table.
 */
export const vendors = pgTable(
  "vendors",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Vendor details
    vendorNumber: varchar("vendor_number", { length: 50 }).notNull(),
    vendorName: varchar("vendor_name", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }),

    // Contact information
    contactInfo: jsonb("contact_info").$type<VendorContactInfo>(),
    
    // Addresses
    address: jsonb("address").$type<VendorAddress>(),
    remittanceAddress: jsonb("remittance_address").$type<VendorAddress>(),

    // Business terms
    paymentTerms: varchar("payment_terms", { length: 50 }), // e.g., "Net 30", "2/10 Net 30"
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    taxId: varchar("tax_id", { length: 50 }), // Tax ID / VAT number
    
    // Banking details (for payments)
    bankingInfo: jsonb("banking_info").$type<{
      bankName?: string;
      accountNumber?: string;
      routingNumber?: string;
      swiftCode?: string;
      iban?: string;
    }>(),

    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // active | inactive | suspended
    isActive: boolean("is_active").notNull().default(true),
    isPreferred: boolean("is_preferred").notNull().default(false),

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
    tenantIdIdx: index("idx_vendors_tenant_id").on(table.tenantId),
    statusIdx: index("idx_vendors_status").on(table.status),
    vendorNameIdx: index("idx_vendors_name").on(table.vendorName),

    // Unique constraint: vendor_number per tenant
    tenantNumberUniq: unique("uq_vendors_tenant_number").on(
      table.tenantId,
      table.vendorNumber
    ),
  })
);

/**
 * Type inference for vendors.
 */
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
