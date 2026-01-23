/**
 * AXIS Registry Schemas - Single Source of Truth
 *
 * All Zod schemas are defined here. Everything else is derived:
 * - TypeScript types: Inferred via z.infer<>
 * - Drizzle schemas: Generated from registry definitions
 * - Validation: Re-exported from here
 *
 * Pattern: Define once, use everywhere, zero drift.
 */

export * from "./constants";
export * from "./common";
export * from "./document";
export * from "./economic-event";
export * from "./ledger-posting";
export * from "./account";
export * from "./versioning";

// Domain events (B02)
export * from "./events";

// Sales domain (B04)
export * from "./sales";

// Purchase domain (B05)
export * from "./purchase";

// Inventory domain (B06)
export * from "./inventory";

// Accounting domain (B07)
export * from "./accounting";

// Controls domain (B08)
export * from "./controls";

// Workflow domain (B08-01)
export * from "./workflow";

// Reconciliation domain (B09)
export * from "./reconciliation";

// UX domain (B10)
export * from "./ux";

// AFANDA domain (B11)
export * from "./afanda";

// Lynx domain (A01-01)
export * from "./lynx";

// Intelligence domain (B12)
export * from "./intelligence";

// Migration domain (C01)
export * from "./migration";

// Column Adapter domain (C02)
export * from "./adapter";

// Mapping Studio domain (C03)
export * from "./mapping";

// Dual Ledger domain (C04)
export * from "./dual-ledger";

// Cutover domain (C05)
export * from "./cutover";
