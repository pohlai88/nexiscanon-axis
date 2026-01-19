// packages/domain/src/addons/index.ts
// Explicit addons list (like Odoo addons-path)
// Add new addons here to include them in the domain bootstrap

import { coreAddon } from "./core/manifest";
import { requestsAddon } from "./requests/manifest";
import { erpBaseAddon } from "./erp.base/manifest";
import { salesAddon } from "./sales/manifest";
import type { AddonManifest } from "../types";

/**
 * All addons to load during domain bootstrap.
 * Order doesn't matter - bootstrap uses topological sort by dependsOn.
 */
export const allAddons: AddonManifest[] = [coreAddon, requestsAddon, erpBaseAddon, salesAddon];

// Re-export core addon and tokens for convenience
export { coreAddon, CORE_TOKENS } from "./core/manifest";
export type { IdService, AuditService } from "./core/manifest";

// Re-export requests addon and tokens
export { requestsAddon } from "./requests/manifest";
export { REQUESTS_TOKENS } from "./requests/tokens";
export type {
  RequestService,
  Request,
  RequestStatus,
} from "./requests/manifest";

// Re-export ERP base addon and tokens
export { erpBaseAddon } from "./erp.base/manifest";
export { ERP_BASE_TOKENS } from "./erp.base/tokens";
export type {
  SequenceService,
  UomService,
  PartnerService,
  ProductService,
} from "./erp.base";

// Re-export Sales addon and tokens
export { salesAddon } from "./sales/manifest";
export { SALES_TOKENS } from "./sales/tokens";
export type { SalesQuoteService } from "./sales";
