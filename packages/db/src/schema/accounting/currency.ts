/**
 * Currency & Exchange Rate Tables (B07)
 *
 * Multi-currency support.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  numeric,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type ExchangeRateSource } from "@axis/registry/schemas";

// ============================================================================
// Currency Table
// ============================================================================

export const currencies = pgTable(
  "currencies",
  {
    code: varchar("code", { length: 3 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    symbol: varchar("symbol", { length: 10 }).notNull(),
    decimalPlaces: integer("decimal_places").notNull().default(2),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [index("idx_currencies_active").on(table.isActive)]
);

export type CurrencyRow = typeof currencies.$inferSelect;
export type NewCurrencyRow = typeof currencies.$inferInsert;

// ============================================================================
// Tenant Currency Settings
// ============================================================================

export const tenantCurrencies = pgTable(
  "tenant_currencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    currencyCode: varchar("currency_code", { length: 3 })
      .notNull()
      .references(() => currencies.code),

    // Base currency flag
    isBaseCurrency: boolean("is_base_currency").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_tenant_currencies").on(table.tenantId, table.currencyCode),
    index("idx_tenant_currencies_tenant").on(table.tenantId),
  ]
);

export const tenantCurrenciesRelations = relations(
  tenantCurrencies,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantCurrencies.tenantId],
      references: [tenants.id],
    }),
    currency: one(currencies, {
      fields: [tenantCurrencies.currencyCode],
      references: [currencies.code],
    }),
  })
);

export type TenantCurrencyRow = typeof tenantCurrencies.$inferSelect;
export type NewTenantCurrencyRow = typeof tenantCurrencies.$inferInsert;

// ============================================================================
// Exchange Rate Table
// ============================================================================

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    fromCurrency: varchar("from_currency", { length: 3 })
      .notNull()
      .references(() => currencies.code),
    toCurrency: varchar("to_currency", { length: 3 })
      .notNull()
      .references(() => currencies.code),

    rate: numeric("rate", { precision: 18, scale: 10 }).notNull(),

    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    expiresDate: timestamp("expires_date", { withTimezone: true }),

    source: varchar("source", { length: 20 })
      .notNull()
      .default("manual")
      .$type<ExchangeRateSource>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_exchange_rates_tenant").on(table.tenantId),
    index("idx_exchange_rates_pair").on(
      table.tenantId,
      table.fromCurrency,
      table.toCurrency
    ),
    index("idx_exchange_rates_effective").on(
      table.tenantId,
      table.effectiveDate
    ),
  ]
);

export const exchangeRatesRelations = relations(exchangeRates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [exchangeRates.tenantId],
    references: [tenants.id],
  }),
  fromCurrencyRef: one(currencies, {
    fields: [exchangeRates.fromCurrency],
    references: [currencies.code],
  }),
  toCurrencyRef: one(currencies, {
    fields: [exchangeRates.toCurrency],
    references: [currencies.code],
  }),
}));

export type ExchangeRateRow = typeof exchangeRates.$inferSelect;
export type NewExchangeRateRow = typeof exchangeRates.$inferInsert;
