// packages/validation/src/erp/base/index.ts
// Barrel export for erp.base validation contracts
//
// Phase 1.2: Complete SSOT for erp.base entities

// UoM
export * from "./uom";

// Sequence (internal)
export * from "./sequence";

// Partner
export * from "./partner";

// Product
export * from "./product";

// Permissions
export * from "./permissions";

// Re-export audit contracts (shared infrastructure)
export * from "../audit";
