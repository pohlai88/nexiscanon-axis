// packages/domain/src/addons/accounting/manifest.ts
// Accounting addon: ledger posting and accounting event stream
//
// Provides:
// - LedgerService (immutable posting journal)

import type { AddonManifest, AddonAPI } from "../../types";
import { ACCOUNTING_TOKENS } from "./tokens";
import { LedgerServiceImpl } from "./ledger/services/ledger-service";
import { SEQUENCE_SERVICE } from "../erp.base/services/sequence-service";

// ---- Addon Manifest ----

export const accountingAddon: AddonManifest = {
  id: "accounting",
  version: "0.1.0",
  dependsOn: ["erp.base"], // needs SequenceService for entry numbers

  async register(api: AddonAPI) {
    const { provideValue, container } = api;

    // LedgerService implementation
    const sequenceService = container.get(SEQUENCE_SERVICE);
    const ledgerService = new LedgerServiceImpl(sequenceService);

    provideValue(ACCOUNTING_TOKENS.LedgerService, ledgerService);
  },
};
