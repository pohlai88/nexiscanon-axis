/**
 * Financial Report Types
 * 
 * TypeScript interfaces for standard financial statements.
 */

/**
 * Account balance with metadata.
 */
export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  balance: string;
  debitBalance?: string;
  creditBalance?: string;
}

/**
 * Balance Sheet (Statement of Financial Position)
 * 
 * Assets = Liabilities + Equity
 */
export interface BalanceSheet {
  asOfDate: Date;
  tenantId: string;
  assets: {
    current: AccountBalance[];
    fixed: AccountBalance[];
    other: AccountBalance[];
    total: string;
  };
  liabilities: {
    current: AccountBalance[];
    longTerm: AccountBalance[];
    other: AccountBalance[];
    total: string;
  };
  equity: {
    capital: AccountBalance[];
    retained: string;
    netIncome: string;
    total: string;
  };
  verified: boolean; // assets === liabilities + equity
  difference: string; // Should be 0
}

/**
 * Income Statement (Profit & Loss)
 * 
 * Revenue - Expenses = Net Income
 */
export interface IncomeStatement {
  startDate: Date;
  endDate: Date;
  tenantId: string;
  revenue: {
    sales: AccountBalance[];
    services: AccountBalance[];
    other: AccountBalance[];
    total: string;
  };
  expenses: {
    cogs: AccountBalance[];
    operating: AccountBalance[];
    administrative: AccountBalance[];
    other: AccountBalance[];
    total: string;
  };
  grossProfit: string;
  operatingIncome: string;
  netIncome: string;
}

/**
 * Cash Flow Statement
 * 
 * Tracks cash inflows and outflows by activity type.
 */
export interface CashFlowStatement {
  startDate: Date;
  endDate: Date;
  tenantId: string;
  operating: {
    inflows: AccountBalance[];
    outflows: AccountBalance[];
    net: string;
  };
  investing: {
    inflows: AccountBalance[];
    outflows: AccountBalance[];
    net: string;
  };
  financing: {
    inflows: AccountBalance[];
    outflows: AccountBalance[];
    net: string;
  };
  netChange: string;
  beginningBalance: string;
  endingBalance: string;
}

/**
 * Trial Balance
 * 
 * List of all accounts with balances, verifies Debits = Credits.
 */
export interface TrialBalance {
  asOfDate: Date;
  tenantId: string;
  accounts: {
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    debitBalance: string;
    creditBalance: string;
    netBalance: string;
  }[];
  totalDebits: string;
  totalCredits: string;
  balanced: boolean;
  difference: string; // Should be 0
}

/**
 * Account Ledger Entry
 */
export interface AccountLedgerEntry {
  date: Date;
  postingId: string;
  documentId?: string;
  documentNumber?: string;
  documentType?: string;
  eventType?: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
}

/**
 * Account Ledger Report
 * 
 * Detailed transaction history for a single account.
 */
export interface AccountLedger {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  startDate: Date;
  endDate: Date;
  beginningBalance: string;
  entries: AccountLedgerEntry[];
  endingBalance: string;
  totalDebits: string;
  totalCredits: string;
}
