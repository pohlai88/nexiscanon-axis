/**
 * Mapping Studio Constants (C03)
 *
 * "94% mapped automatically. Confirm the rest with a few clicks."
 */

import { z } from "zod";

// ============================================================================
// Mapping Status
// ============================================================================

export const STUDIO_MAPPING_STATUS = [
  "auto_accepted", // High confidence, auto-approved
  "pending_review", // Medium confidence, needs human review
  "user_confirmed", // Human confirmed
  "user_rejected", // Human rejected, needs remapping
  "exception", // Low confidence, requires manual mapping
] as const;

export const studioMappingStatusSchema = z.enum(STUDIO_MAPPING_STATUS);
export type StudioMappingStatus = z.infer<typeof studioMappingStatusSchema>;

// ============================================================================
// COA Account Types (AXIS Canonical)
// ============================================================================

export const COA_ACCOUNT_TYPE = [
  // Assets
  "asset_bank",
  "asset_cash",
  "asset_receivable",
  "asset_inventory",
  "asset_prepaid",
  "asset_fixed",
  "asset_accumulated_depreciation",
  "asset_other",

  // Liabilities
  "liability_payable",
  "liability_credit_card",
  "liability_accrued",
  "liability_deferred_revenue",
  "liability_current",
  "liability_long_term",
  "liability_other",

  // Equity
  "equity_common_stock",
  "equity_retained_earnings",
  "equity_opening_balance",
  "equity_owner_draw",
  "equity_other",

  // Revenue
  "revenue_sales",
  "revenue_service",
  "revenue_interest",
  "revenue_other",

  // Expenses
  "expense_cogs",
  "expense_operating",
  "expense_payroll",
  "expense_depreciation",
  "expense_interest",
  "expense_tax",
  "expense_other",
] as const;

export const coaAccountTypeSchema = z.enum(COA_ACCOUNT_TYPE);
export type COAAccountType = z.infer<typeof coaAccountTypeSchema>;

// ============================================================================
// Normal Balance Direction
// ============================================================================

export const COA_NORMAL_BALANCE = ["debit", "credit"] as const;

export const coaNormalBalanceSchema = z.enum(COA_NORMAL_BALANCE);
export type COANormalBalance = z.infer<typeof coaNormalBalanceSchema>;

// ============================================================================
// Control Account Types
// ============================================================================

export const CONTROL_ACCOUNT_TYPE = ["ar", "ap", "inventory", "bank"] as const;

export const controlAccountTypeSchema = z.enum(CONTROL_ACCOUNT_TYPE);
export type ControlAccountType = z.infer<typeof controlAccountTypeSchema>;

// ============================================================================
// Tax Types
// ============================================================================

export const TAX_TYPE = [
  "sales_tax",
  "vat",
  "gst",
  "service_tax",
  "withholding",
  "exempt",
  "zero_rated",
] as const;

export const taxTypeSchema = z.enum(TAX_TYPE);
export type TaxType = z.infer<typeof taxTypeSchema>;

// ============================================================================
// Mapping Version Status
// ============================================================================

export const MAPPING_VERSION_STATUS = [
  "draft",
  "active",
  "superseded",
] as const;

export const mappingVersionStatusSchema = z.enum(MAPPING_VERSION_STATUS);
export type MappingVersionStatus = z.infer<typeof mappingVersionStatusSchema>;

// ============================================================================
// Trial Import Status
// ============================================================================

export const TRIAL_IMPORT_STATUS = [
  "pending",
  "running",
  "success",
  "partial",
  "failed",
] as const;

export const trialImportStatusSchema = z.enum(TRIAL_IMPORT_STATUS);
export type TrialImportStatus = z.infer<typeof trialImportStatusSchema>;

// ============================================================================
// Duplicate Resolution Status
// ============================================================================

export const DUPLICATE_RESOLUTION_STATUS = [
  "pending",
  "merged",
  "kept_separate",
  "ignored",
] as const;

export const duplicateResolutionStatusSchema = z.enum(DUPLICATE_RESOLUTION_STATUS);
export type DuplicateResolutionStatus = z.infer<typeof duplicateResolutionStatusSchema>;
