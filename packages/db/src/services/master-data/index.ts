/**
 * Master Data Services (B03)
 *
 * AXIS Canonical Implementation:
 * - Chart of Accounts: Hierarchical account structure
 * - Fiscal Periods: Period management and status
 *
 * @see .cursor/ERP/A01-CANONICAL.md (AXIS Philosophy)
 * @see .cursor/ERP/B03-MASTER-DATA.md (Master Data Core)
 */

// Chart of Accounts
export { COAService } from "./coa-service";
export type {
  AccountValidation,
  AccountHierarchy,
} from "./coa-service";

// Fiscal Periods
export { FiscalPeriodService } from "./fiscal-period-service";
export type {
  FiscalYearSetup,
  PeriodValidation,
} from "./fiscal-period-service";
