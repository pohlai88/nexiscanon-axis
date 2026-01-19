// packages/domain/src/addons/sales/index.ts
// Sales addon barrel export

export { salesAddon } from "./manifest";

// Services
export {
  type SalesQuoteService,
  SalesQuoteServiceImpl,
  SALES_QUOTE_SERVICE,
} from "./services/quote-service";

// Tokens
export { SALES_TOKENS } from "./tokens";
