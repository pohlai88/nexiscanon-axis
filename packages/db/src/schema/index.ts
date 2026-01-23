/**
 * Database schema exports.
 *
 * Single source of truth for all database types.
 */

// Core multi-tenant schemas
export * from "./tenant";
export * from "./user";
export * from "./api-key";
export * from "./audit-log";

// Master Data
export * from "./customer";
export * from "./vendor";

// AI/Vector search schemas
export * from "./embeddings";

// B1 — Posting Spine (Canonical truth layer)
export * from "./document";
export * from "./economic-event";
export * from "./ledger-posting";
export * from "./idempotency";

// B2 — Domain Bounded Contexts (Outbox pattern)
export * from "./outbox";

// B4 — Sales Domain
export * from "./sales";

// B5 — Purchase Domain (Phase 3)
export * from "./purchase";

// Payment Processing (Phase 4)
export * from "./payment";

// B6 — Inventory Domain
export * from "./inventory";

// B7 — Accounting Domain
export * from "./accounting";

// B8 — Controls Domain
export * from "./controls";

// B8-01 — Workflow Domain
export * from "./workflow";

// B9 — Reconciliation Domain
export * from "./reconciliation";

// B10 — UX Domain
export * from "./ux";

// B11 — AFANDA Domain
export * from "./afanda";

// A01-01 — Lynx Domain
export * from "./lynx";

// B12 — Intelligence Domain
export * from "./intelligence";

// C01 — Migration Domain
export * from "./migration";

// C02 — Column Adapter Domain
export * from "./adapter";

// C03 — Mapping Studio Domain
export * from "./mapping";

// C04 — Dual Ledger Reconciliation Domain
export * from "./dual-ledger";

// C05 — Cutover Runbook Domain
export * from "./cutover";

// ERP domain schemas (future phases)
// B2 — Chart of Accounts
// B3 — Sales & Receivables
// B4 — Purchasing & Payables
// B5 — Inventory & Warehousing
