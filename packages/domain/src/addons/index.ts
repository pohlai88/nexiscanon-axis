// packages/domain/src/addons/index.ts
// Explicit addons list (like Odoo addons-path)
// Add new addons here to include them in the domain bootstrap

import { coreAddon } from "./core/manifest";
import { requestsAddon } from "./requests/manifest";
import type { AddonManifest } from "../types";

/**
 * All addons to load during domain bootstrap.
 * Order doesn't matter - bootstrap uses topological sort by dependsOn.
 */
export const allAddons: AddonManifest[] = [coreAddon, requestsAddon];

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
