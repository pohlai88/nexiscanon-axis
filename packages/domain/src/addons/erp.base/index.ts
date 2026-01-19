// packages/domain/src/addons/erp.base/index.ts
// Barrel export for erp.base addon
//
// This is the foundation addon for all ERP modules.
// Provides: AuditService, SequenceService, and shared types

// Service types
export type { ErpAuditService } from "./services/audit-service";
export type { SequenceService } from "./services/sequence-service";
export type { UomService } from "./services/uom-service";
export type { PartnerService } from "./services/partner-service";
export type { ProductService } from "./services/product-service";

// Addon manifest (for domain bootstrap)
export { erpBaseAddon } from "./manifest";

// Note: manifest.ts is intentionally NOT exported here
// It will be imported directly by the addon loader
