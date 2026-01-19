// packages/db/src/erp/base/partners.ts
// ERP Partners - customers and vendors

import { pgTable, uuid, text, boolean, timestamp, integer, index, unique } from "drizzle-orm/pg-core";
import { tenants, users } from "../../schema";

/**
 * Partners (Business Counterparties)
 *
 * Represents customers, vendors, or both.
 * All commercial relationships flow through partners.
 */
export const erpPartners = pgTable(
  "erp_partners",
  {
    // Identity
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    // Business identity
    code: text("code").notNull(), // e.g., "CUST-000001"
    name: text("name").notNull(),
    displayName: text("display_name"), // optional trading name
    partyType: text("party_type").notNull(), // CUSTOMER, VENDOR, BOTH

    // Tax/Legal
    taxId: text("tax_id"), // VAT number, EIN, etc.
    companyRegistry: text("company_registry"), // company registration number

    // Contact
    email: text("email"),
    phone: text("phone"),
    website: text("website"),

    // Address (flattened for v0; normalize later if needed)
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    stateProvince: text("state_province"),
    postalCode: text("postal_code"),
    countryCode: text("country_code"), // ISO 3166-1 alpha-2

    // Defaults
    defaultCurrencyCode: text("default_currency_code"), // ISO 4217
    defaultPaymentTermsDays: integer("default_payment_terms_days"),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid("created_by").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id),
    version: integer("version").notNull().default(1),

    // Notes
    internalNotes: text("internal_notes"),
  },
  (table) => ({
    // Indexes
    tenantIdx: index("idx_erp_partners_tenant").on(table.tenantId),
    tenantTypeIdx: index("idx_erp_partners_tenant_type").on(table.tenantId, table.partyType),
    tenantNameIdx: index("idx_erp_partners_tenant_name").on(table.tenantId, table.name),

    // Unique constraints
    uniqueCode: unique("uq_erp_partners_tenant_code").on(table.tenantId, table.code),
  })
);

// ---- Type exports ----

export type ErpPartner = typeof erpPartners.$inferSelect;
export type NewErpPartner = typeof erpPartners.$inferInsert;

// ---- Party Types ----

export const PARTY_TYPES = {
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
  BOTH: "BOTH",
} as const;

export type PartyType = (typeof PARTY_TYPES)[keyof typeof PARTY_TYPES];
