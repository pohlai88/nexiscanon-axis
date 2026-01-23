/**
 * Currency & Exchange Rate Schemas (B07)
 *
 * Multi-currency support.
 */

import { z } from "zod";
import { EXCHANGE_RATE_SOURCE } from "./constants";

// ============================================================================
// Currency Schema
// ============================================================================

export const currencySchema = z.object({
  code: z.string().length(3),
  name: z.string().max(100),
  symbol: z.string().max(10),
  decimalPlaces: z.number().int().min(0).max(6).default(2),
  isBaseCurrency: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type Currency = z.infer<typeof currencySchema>;

// ============================================================================
// Exchange Rate Schema
// ============================================================================

export const exchangeRateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),

  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),

  rate: z.number().positive(),

  effectiveDate: z.string().datetime(),
  expiresDate: z.string().datetime().optional(),

  source: z.enum(EXCHANGE_RATE_SOURCE).default("manual"),

  createdAt: z.string().datetime(),
});

export type ExchangeRate = z.infer<typeof exchangeRateSchema>;
