// packages/db/src/erp/index.ts
// Barrel export for all ERP database schemas
//
// ERP modules add their schemas here as they are implemented.
// Current: Phase 0 - Audit infrastructure + Phase 1.1 - erp.base tables + Phase 2.1 - erp.sales tables

export * from "./audit";
export * from "./base";
export * from "./sales";

// Re-export accounting ledger at erp namespace level
export * from "../acct";
