// packages/domain/src/addons/erp.base/index.ts
// Barrel export for erp.base addon
//
// This is the foundation addon for all ERP modules.
// Provides: AuditService, SequenceService, and shared types

// Services
export * from "./services/audit-service";

// Note: manifest.ts is intentionally NOT exported here
// It will be imported directly by the addon loader
