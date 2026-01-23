import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  numeric,
  jsonb,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { users } from "../user";

/**
 * Quote status values.
 */
export const QUOTE_STATUS = ["draft", "sent", "accepted", "rejected", "expired", "converted"] as const;
export type QuoteStatus = (typeof QUOTE_STATUS)[number];

/**
 * Quote line item structure.
 */
export interface QuoteLineItem {
  description: string;
  quantity: number;
  unit_price: string; // String for decimal precision
  tax_rate?: string;
  amount: string;
}

/**
 * Sales Quotes table.
 * 
 * First step in sales cycle: Quote → Order → Invoice
 */
export const salesQuotes = pgTable(
  "sales_quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** Tenant isolation */
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    /** Quote details */
    quoteNumber: varchar("quote_number", { length: 50 }).notNull(),
    quoteDate: timestamp("quote_date", { withTimezone: true }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }),

    /** Customer reference */
    customerId: uuid("customer_id"),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }),

    /** Status & workflow */
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<QuoteStatus>(),

    /** Financial */
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: numeric("subtotal", { precision: 19, scale: 4 }).notNull(),
    taxTotal: numeric("tax_total", { precision: 19, scale: 4 }).notNull().default("0"),
    totalAmount: numeric("total_amount", { precision: 19, scale: 4 }).notNull(),

    /** Line items (JSONB array) */
    lineItems: jsonb("line_items").notNull().$type<QuoteLineItem[]>(),

    /** Metadata */
    notes: text("notes"),
    termsConditions: text("terms_conditions"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

    /** Conversion tracking */
    convertedToOrderId: uuid("converted_to_order_id"),
    convertedAt: timestamp("converted_at", { withTimezone: true }),

    /** Audit */
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    modifiedBy: uuid("modified_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_sales_quotes_tenant").on(table.tenantId),
    index("idx_sales_quotes_customer").on(table.tenantId, table.customerId),
    index("idx_sales_quotes_status").on(table.tenantId, table.status),
    uniqueIndex("sales_quotes_tenant_number_idx").on(table.tenantId, table.quoteNumber),
  ]
);

/**
 * Sales Quotes relations.
 */
export const salesQuotesRelations = relations(salesQuotes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [salesQuotes.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [salesQuotes.createdBy],
    references: [users.id],
    relationName: "quote_creator",
  }),
  modifier: one(users, {
    fields: [salesQuotes.modifiedBy],
    references: [users.id],
    relationName: "quote_modifier",
  }),
}));

/**
 * TypeScript types inferred from schema.
 */
export type SalesQuote = typeof salesQuotes.$inferSelect;
export type NewSalesQuote = typeof salesQuotes.$inferInsert;
