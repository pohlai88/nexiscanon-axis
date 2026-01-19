// packages/domain/src/addons/sales/manifest.ts
// erp.sales addon: sales quote and order management
//
// Provides:
// - SalesQuoteService (quote lifecycle + line management)
// - SalesOrderService (order lifecycle + line management + quote conversion)

import type { AddonManifest, AddonAPI } from "../../types";
import { SALES_QUOTE_SERVICE, SalesQuoteServiceImpl } from "./services/quote-service";
import { SALES_ORDER_SERVICE, SalesOrderServiceImpl } from "./orders/services/order-service";
import { ERP_BASE_TOKENS } from "../erp.base/tokens";

// ---- Addon Manifest ----

export const salesAddon: AddonManifest = {
  id: "erp.sales",
  version: "0.1.0",
  dependsOn: ["erp.base"], // depends on erp.base for SequenceService

  async register(api: AddonAPI) {
    const { provideValue } = api;

    // Get SequenceService from erp.base
    const sequenceService = api.container.get(ERP_BASE_TOKENS.SequenceService);

    // Register SalesQuoteService
    const quoteService = new SalesQuoteServiceImpl(sequenceService);
    provideValue(SALES_QUOTE_SERVICE, quoteService);

    // Register SalesOrderService
    const orderService = new SalesOrderServiceImpl(sequenceService);
    provideValue(SALES_ORDER_SERVICE, orderService);
  },
};

export default salesAddon;
