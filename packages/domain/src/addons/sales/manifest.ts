// packages/domain/src/addons/sales/manifest.ts
// erp.sales addon: sales quote management
//
// Provides:
// - SalesQuoteService (quote lifecycle + line management)

import type { AddonManifest, AddonAPI } from "../../types";
import { SALES_QUOTE_SERVICE, SalesQuoteServiceImpl } from "./services/quote-service";
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
  },
};

export default salesAddon;
