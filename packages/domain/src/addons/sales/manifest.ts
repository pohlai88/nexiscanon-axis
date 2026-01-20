// packages/domain/src/addons/sales/manifest.ts
// erp.sales addon: sales quote, order, and invoice management
//
// Provides:
// - SalesQuoteService (quote lifecycle + line management)
// - SalesOrderService (order lifecycle + line management + quote conversion)
// - SalesInvoiceService (invoice lifecycle + line management + order conversion)
// - SalesCreditService (credit note lifecycle + line management + invoice reversal)

import type { AddonManifest, AddonAPI } from "../../types";
import { SALES_QUOTE_SERVICE, SalesQuoteServiceImpl } from "./services/quote-service";
import { SALES_ORDER_SERVICE, SalesOrderServiceImpl } from "./orders/services/order-service";
import { SALES_INVOICE_SERVICE, SalesInvoiceServiceImpl } from "./invoices/services/invoice-service";
import { SALES_CREDIT_SERVICE, SalesCreditServiceImpl } from "./credits/services/credit-service";
import { ERP_BASE_TOKENS } from "../erp.base/tokens";
import { ACCOUNTING_TOKENS } from "../accounting/tokens";

// ---- Addon Manifest ----

export const salesAddon: AddonManifest = {
  id: "erp.sales",
  version: "0.2.0",
  dependsOn: ["erp.base", "accounting"], // needs SequenceService + LedgerService

  async register(api: AddonAPI) {
    const { provideValue } = api;

    // Get dependencies
    const sequenceService = api.container.get(ERP_BASE_TOKENS.SequenceService);
    const ledgerService = api.container.get(ACCOUNTING_TOKENS.LedgerService);

    // Register SalesQuoteService
    const quoteService = new SalesQuoteServiceImpl(sequenceService);
    provideValue(SALES_QUOTE_SERVICE, quoteService);

    // Register SalesOrderService
    const orderService = new SalesOrderServiceImpl(sequenceService);
    provideValue(SALES_ORDER_SERVICE, orderService);

    // Register SalesInvoiceService (with ledger posting)
    const invoiceService = new SalesInvoiceServiceImpl(sequenceService, ledgerService);
    provideValue(SALES_INVOICE_SERVICE, invoiceService);

    // Register SalesCreditService (with ledger posting)
    const creditService = new SalesCreditServiceImpl(sequenceService, ledgerService);
    provideValue(SALES_CREDIT_SERVICE, creditService);
  },
};

export default salesAddon;
