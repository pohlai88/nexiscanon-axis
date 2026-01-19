// packages/domain/src/addons/sales/tokens.ts
// Sales addon service tokens for DI

import { SALES_QUOTE_SERVICE } from "./services/quote-service";
import { SALES_ORDER_SERVICE } from "./orders/services/order-service";

/**
 * Sales addon service tokens
 * Import these in route handlers to get services from domain container
 */
export const SALES_TOKENS = {
  SalesQuoteService: SALES_QUOTE_SERVICE,
  SalesOrderService: SALES_ORDER_SERVICE,
} as const;
