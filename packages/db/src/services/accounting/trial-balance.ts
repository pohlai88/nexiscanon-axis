/**
 * Trial Balance Calculation (B07)
 *
 * AXIS Canonical Implementation:
 * - Derives from GL postings (single source of truth)
 * - Validates: SUM(debits) = SUM(credits)
 * - Provides drill-down to source documents (6W1H)
 *
 * @see .cursor/ERP/A01-CANONICAL.md §3 (Money Pillar)
 * @see .cursor/ERP/B07-ACCOUNTING.md (Trial Balance)
 */

import type { Database } from "../..";

// ============================================================================
// Trial Balance Types
// ============================================================================

/**
 * Trial Balance Line
 */
export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: "asset" | "liability" | "equity" | "revenue" | "expense";
  
  // Opening balance
  openingDebit: string;
  openingCredit: string;
  openingBalance: string;
  
  // Period movements
  periodDebit: string;
  periodCredit: string;
  periodMovement: string;
  
  // Closing balance
  closingDebit: string;
  closingCredit: string;
  closingBalance: string;
  
  // Drill-down metadata
  postingCount: number;
  lastPostedAt?: string;
}

/**
 * Trial Balance Report
 */
export interface TrialBalanceReport {
  tenantId: string;
  fiscalPeriodId: string;
  fiscalYear: number;
  fiscalMonth: number;
  generatedAt: string;
  generatedBy: string;
  
  // Lines
  lines: TrialBalanceLine[];
  
  // Totals (MUST balance)
  totalOpeningDebit: string;
  totalOpeningCredit: string;
  totalPeriodDebit: string;
  totalPeriodCredit: string;
  totalClosingDebit: string;
  totalClosingCredit: string;
  
  // Validation
  isBalanced: boolean;
  balanceDiscrepancy: string;
}

/**
 * Trial Balance Query _filters
 */
export interface TrialBalanceFilters {
  tenantId: string;
  fiscalPeriodId: string;
  
  // Optional _filters
  accountTypes?: Array<"asset" | "liability" | "equity" | "revenue" | "expense">;
  costCenterId?: string;
  projectId?: string;
  
  // Display options
  showZeroBalances?: boolean;
  includeSubAccounts?: boolean;
}

// ============================================================================
// Trial Balance Calculation
// ============================================================================

/**
 * Calculates trial balance from GL postings
 *
 * AXIS Flow:
 * 1. Query GL postings for period
 * 2. Aggregate by account
 * 3. Calculate opening, period, closing balances
 * 4. Validate: Total Debits = Total Credits
 *
 * @param db - Database connection
 * @param _filters - Query _filters
 * @returns Trial balance report
 */
export async function calculateTrialBalance(
  _db: Database,
  _filters: TrialBalanceFilters
): Promise<TrialBalanceReport> {
  const { tenantId, fiscalPeriodId } = _filters;
  
  // TODO: Implement database query when tables are ready
  // For now, return mock structure
  
  const lines: TrialBalanceLine[] = [];
  
  // Calculate totals
  let totalOpeningDebit = 0;
  let totalOpeningCredit = 0;
  let totalPeriodDebit = 0;
  let totalPeriodCredit = 0;
  let totalClosingDebit = 0;
  let totalClosingCredit = 0;
  
  for (const line of lines) {
    totalOpeningDebit += parseFloat(line.openingDebit);
    totalOpeningCredit += parseFloat(line.openingCredit);
    totalPeriodDebit += parseFloat(line.periodDebit);
    totalPeriodCredit += parseFloat(line.periodCredit);
    totalClosingDebit += parseFloat(line.closingDebit);
    totalClosingCredit += parseFloat(line.closingCredit);
  }
  
  // Validate balance (The 500-Year Law)
  const tolerance = 0.01;
  const openingDiscrepancy = Math.abs(totalOpeningDebit - totalOpeningCredit);
  const periodDiscrepancy = Math.abs(totalPeriodDebit - totalPeriodCredit);
  const closingDiscrepancy = Math.abs(totalClosingDebit - totalClosingCredit);
  
  const isBalanced = 
    openingDiscrepancy < tolerance &&
    periodDiscrepancy < tolerance &&
    closingDiscrepancy < tolerance;
  
  const report: TrialBalanceReport = {
    tenantId,
    fiscalPeriodId,
    fiscalYear: 2024, // TODO: Get from period
    fiscalMonth: 1, // TODO: Get from period
    generatedAt: new Date().toISOString(),
    generatedBy: "system", // TODO: Get from context
    lines,
    totalOpeningDebit: totalOpeningDebit.toFixed(2),
    totalOpeningCredit: totalOpeningCredit.toFixed(2),
    totalPeriodDebit: totalPeriodDebit.toFixed(2),
    totalPeriodCredit: totalPeriodCredit.toFixed(2),
    totalClosingDebit: totalClosingDebit.toFixed(2),
    totalClosingCredit: totalClosingCredit.toFixed(2),
    isBalanced,
    balanceDiscrepancy: closingDiscrepancy.toFixed(2),
  };
  
  return report;
}

// ============================================================================
// Account Balance Query (Drill-Down)
// ============================================================================

/**
 * Gets account balance with drill-down to postings
 *
 * Supports 6W1H drill-down: From balance → postings → source documents
 *
 * @param db - Database connection
 * @param accountId - Account to query
 * @param _filters - Period and dimension _filters
 * @returns Account balance with posting details
 */
export async function getAccountBalance(
  db: Database,
  accountId: string,
  _filters: {
    tenantId: string;
    fiscalPeriodId: string;
    costCenterId?: string;
    projectId?: string;
  }
): Promise<{
  account: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  balance: {
    opening: string;
    debit: string;
    credit: string;
    closing: string;
  };
  postings: Array<{
    id: string;
    journalNumber: string;
    effectiveDate: string;
    debit: string;
    credit: string;
    description?: string;
    sourceDocumentType?: string;
    sourceDocumentId?: string;
  }>;
}> {
  // TODO: Implement database query when tables are ready
  
  return {
    account: {
      id: accountId,
      code: "1000",
      name: "Cash",
      type: "asset",
    },
    balance: {
      opening: "0.00",
      debit: "0.00",
      credit: "0.00",
      closing: "0.00",
    },
    postings: [],
  };
}

// ============================================================================
// Balance Sheet Preparation
// ============================================================================

/**
 * Prepares Balance Sheet from trial balance
 *
 * Formula: Assets = Liabilities + Equity
 *
 * @param trialBalance - Trial balance report
 * @returns Balance sheet structure
 */
export function prepareBalanceSheet(trialBalance: TrialBalanceReport): {
  assets: {
    current: TrialBalanceLine[];
    nonCurrent: TrialBalanceLine[];
    total: string;
  };
  liabilities: {
    current: TrialBalanceLine[];
    nonCurrent: TrialBalanceLine[];
    total: string;
  };
  equity: {
    lines: TrialBalanceLine[];
    total: string;
  };
  isBalanced: boolean;
  balanceCheck: string; // Assets - (Liabilities + Equity)
} {
  const assets = trialBalance.lines.filter(l => l.accountType === "asset");
  const liabilities = trialBalance.lines.filter(l => l.accountType === "liability");
  const equity = trialBalance.lines.filter(l => l.accountType === "equity");
  
  const totalAssets = assets.reduce((sum, l) => sum + parseFloat(l.closingBalance), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + parseFloat(l.closingBalance), 0);
  const totalEquity = equity.reduce((sum, l) => sum + parseFloat(l.closingBalance), 0);
  
  const balanceCheck = totalAssets - (totalLiabilities + totalEquity);
  const tolerance = 0.01;
  
  return {
    assets: {
      current: assets, // TODO: Classify as current/non-current
      nonCurrent: [],
      total: totalAssets.toFixed(2),
    },
    liabilities: {
      current: liabilities, // TODO: Classify as current/non-current
      nonCurrent: [],
      total: totalLiabilities.toFixed(2),
    },
    equity: {
      lines: equity,
      total: totalEquity.toFixed(2),
    },
    isBalanced: Math.abs(balanceCheck) < tolerance,
    balanceCheck: balanceCheck.toFixed(2),
  };
}

// ============================================================================
// P&L Preparation
// ============================================================================

/**
 * Prepares Profit & Loss from trial balance
 *
 * Formula: Net Profit = Revenue - Expenses
 *
 * @param trialBalance - Trial balance report
 * @returns P&L structure
 */
export function prepareProfitAndLoss(trialBalance: TrialBalanceReport): {
  revenue: {
    lines: TrialBalanceLine[];
    total: string;
  };
  expenses: {
    lines: TrialBalanceLine[];
    total: string;
  };
  netProfit: string;
  netProfitMargin: string;
} {
  const revenue = trialBalance.lines.filter(l => l.accountType === "revenue");
  const expenses = trialBalance.lines.filter(l => l.accountType === "expense");
  
  const totalRevenue = revenue.reduce((sum, l) => sum + parseFloat(l.closingCredit), 0);
  const totalExpenses = expenses.reduce((sum, l) => sum + parseFloat(l.closingDebit), 0);
  
  const netProfit = totalRevenue - totalExpenses;
  const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  return {
    revenue: {
      lines: revenue,
      total: totalRevenue.toFixed(2),
    },
    expenses: {
      lines: expenses,
      total: totalExpenses.toFixed(2),
    },
    netProfit: netProfit.toFixed(2),
    netProfitMargin: netProfitMargin.toFixed(2) + "%",
  };
}

// ============================================================================
// Export Public API
// ============================================================================

export const TrialBalanceService = {
  calculateTrialBalance,
  getAccountBalance,
  prepareBalanceSheet,
  prepareProfitAndLoss,
} as const;
