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

// ERP domain schemas (to be added)
// export * from "./erp/inventory";
// export * from "./erp/orders";
// export * from "./erp/customers";
