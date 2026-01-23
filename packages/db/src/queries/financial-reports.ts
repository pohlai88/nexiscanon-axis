/**
 * Financial Report Queries
 * 
 * Generate standard financial statements from posting spine.
 */

import { eq, and, lte, gte } from "drizzle-orm";
import type { Database } from "../client";
import { accounts, ledgerPostings, documents } from "../schema";
import type {
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  TrialBalance,
  AccountLedger,
  AccountBalance,
} from "../types/reports";
import {
  calculateAccountBalance,
  calculateDebitCreditTotals,
  addAmounts,
  subtractAmounts,
  sumAmounts,
  groupAccountsByType,
  verifyBalanceSheet,
  verifyTrialBalance,
} from "./report-helpers";

/**
 * Generate Balance Sheet (Statement of Financial Position)
 * 
 * Assets = Liabilities + Equity (as of a specific date)
 */
export async function getBalanceSheet(
  db: Database,
  tenantId: string,
  asOfDate: Date
): Promise<BalanceSheet> {
  // 1. Get all accounts for tenant
  const allAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.tenantId, tenantId));

  // 2. Get all postings up to asOfDate
  const postings = await db
    .select()
    .from(ledgerPostings)
    .where(
      and(
        eq(ledgerPostings.tenantId, tenantId),
        lte(ledgerPostings.postingDate, asOfDate)
      )
    );

  // 3. Calculate balance for each account
  const accountBalances: Map<string, AccountBalance> = new Map();
  
  for (const account of allAccounts) {
    const accountPostings = postings.filter((p) => p.accountId === account.id);
    const balance = calculateAccountBalance(accountPostings, account.accountType);
    
    accountBalances.set(account.id, {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.accountType,
      balance,
    });
  }

  // 4. Group accounts by type
  const grouped = groupAccountsByType(allAccounts);

  // 5. Build asset section
  const assetAccounts = grouped.assets.map((a) => accountBalances.get(a.id)!);
  const currentAssets = assetAccounts.filter((a) => 
    a.accountCode.startsWith("1") && parseInt(a.accountCode) < 1500
  );
  const fixedAssets = assetAccounts.filter((a) => 
    a.accountCode.startsWith("1") && parseInt(a.accountCode) >= 1500
  );
  const otherAssets = assetAccounts.filter((a) => !a.accountCode.startsWith("1"));
  
  const assetsTotal = sumAmounts(assetAccounts.map((a) => a.balance));

  // 6. Build liability section
  const liabilityAccounts = grouped.liabilities.map((a) => accountBalances.get(a.id)!);
  const currentLiabilities = liabilityAccounts.filter((a) => 
    a.accountCode.startsWith("2") && parseInt(a.accountCode) < 2500
  );
  const longTermLiabilities = liabilityAccounts.filter((a) => 
    a.accountCode.startsWith("2") && parseInt(a.accountCode) >= 2500
  );
  const otherLiabilities = liabilityAccounts.filter((a) => !a.accountCode.startsWith("2"));
  
  const liabilitiesTotal = sumAmounts(liabilityAccounts.map((a) => a.balance));

  // 7. Build equity section
  const equityAccounts = grouped.equity.map((a) => accountBalances.get(a.id)!);
  const capitalAccounts = equityAccounts;
  
  // Calculate net income from revenue - expenses
  const revenueAccounts = grouped.revenue.map((a) => accountBalances.get(a.id)!);
  const expenseAccounts = grouped.expenses.map((a) => accountBalances.get(a.id)!);
  const revenueTotal = sumAmounts(revenueAccounts.map((a) => a.balance));
  const expenseTotal = sumAmounts(expenseAccounts.map((a) => a.balance));
  const netIncome = subtractAmounts(revenueTotal, expenseTotal);
  
  const equityTotal = addAmounts(
    sumAmounts(equityAccounts.map((a) => a.balance)),
    netIncome
  );

  // 8. Verify balance sheet equation
  const verification = verifyBalanceSheet(assetsTotal, liabilitiesTotal, equityTotal);

  return {
    asOfDate,
    tenantId,
    assets: {
      current: currentAssets,
      fixed: fixedAssets,
      other: otherAssets,
      total: assetsTotal,
    },
    liabilities: {
      current: currentLiabilities,
      longTerm: longTermLiabilities,
      other: otherLiabilities,
      total: liabilitiesTotal,
    },
    equity: {
      capital: capitalAccounts,
      retained: sumAmounts(equityAccounts.map((a) => a.balance)),
      netIncome,
      total: equityTotal,
    },
    verified: verification.verified,
    difference: verification.difference,
  };
}

/**
 * Generate Income Statement (Profit & Loss)
 * 
 * Revenue - Expenses = Net Income (for a date range)
 */
export async function getIncomeStatement(
  db: Database,
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<IncomeStatement> {
  // 1. Get all accounts for tenant
  const allAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.tenantId, tenantId));

  // 2. Get postings for date range
  const postings = await db
    .select()
    .from(ledgerPostings)
    .where(
      and(
        eq(ledgerPostings.tenantId, tenantId),
        gte(ledgerPostings.postingDate, startDate),
        lte(ledgerPostings.postingDate, endDate)
      )
    );

  // 3. Calculate balance for each account
  const accountBalances: Map<string, AccountBalance> = new Map();
  
  for (const account of allAccounts) {
    const accountPostings = postings.filter((p) => p.accountId === account.id);
    const balance = calculateAccountBalance(accountPostings, account.accountType);
    
    accountBalances.set(account.id, {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.accountType,
      balance,
    });
  }

  // 4. Group revenue accounts
  const revenueAccounts = allAccounts
    .filter((a) => a.accountType === "revenue")
    .map((a) => accountBalances.get(a.id)!);
  
  const salesRevenue = revenueAccounts.filter((a) => a.accountCode.startsWith("4"));
  const servicesRevenue = revenueAccounts.filter((a) => a.accountCode.startsWith("41"));
  const otherRevenue = revenueAccounts.filter((a) => !a.accountCode.startsWith("4"));
  
  const revenueTotal = sumAmounts(revenueAccounts.map((a) => a.balance));

  // 5. Group expense accounts
  const expenseAccounts = allAccounts
    .filter((a) => a.accountType === "expense")
    .map((a) => accountBalances.get(a.id)!);
  
  const cogs = expenseAccounts.filter((a) => a.accountCode.startsWith("5"));
  const operating = expenseAccounts.filter((a) => a.accountCode.startsWith("6"));
  const administrative = expenseAccounts.filter((a) => a.accountCode.startsWith("7"));
  const other = expenseAccounts.filter((a) => 
    !a.accountCode.startsWith("5") && 
    !a.accountCode.startsWith("6") && 
    !a.accountCode.startsWith("7")
  );
  
  const expenseTotal = sumAmounts(expenseAccounts.map((a) => a.balance));

  // 6. Calculate income metrics
  const grossProfit = subtractAmounts(
    revenueTotal,
    sumAmounts(cogs.map((a) => a.balance))
  );
  
  const operatingIncome = subtractAmounts(
    grossProfit,
    sumAmounts(operating.map((a) => a.balance))
  );
  
  const netIncome = subtractAmounts(revenueTotal, expenseTotal);

  return {
    startDate,
    endDate,
    tenantId,
    revenue: {
      sales: salesRevenue,
      services: servicesRevenue,
      other: otherRevenue,
      total: revenueTotal,
    },
    expenses: {
      cogs,
      operating,
      administrative,
      other,
      total: expenseTotal,
    },
    grossProfit,
    operatingIncome,
    netIncome,
  };
}

/**
 * Generate Cash Flow Statement
 * 
 * Track cash inflows/outflows by activity type.
 */
export async function getCashFlowStatement(
  db: Database,
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<CashFlowStatement> {
  // 1. Get cash accounts (code starts with "1110" or similar)
  const cashAccounts = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.tenantId, tenantId),
        eq(accounts.accountType, "asset")
      )
    );

  const cashAccountIds = cashAccounts
    .filter((a) => a.code.startsWith("111") || a.name.toLowerCase().includes("cash"))
    .map((a) => a.id);

  // 2. Get beginning balance (all postings before startDate)
  const beginningPostings = await db
    .select()
    .from(ledgerPostings)
    .where(
      and(
        eq(ledgerPostings.tenantId, tenantId),
        lte(ledgerPostings.postingDate, startDate)
      )
    );

  const beginningCashPostings = beginningPostings.filter((p) =>
    cashAccountIds.includes(p.accountId)
  );
  const beginningBalance = calculateAccountBalance(beginningCashPostings, "asset");

  // 3. Get period postings
  const periodPostings = await db
    .select()
    .from(ledgerPostings)
    .where(
      and(
        eq(ledgerPostings.tenantId, tenantId),
        gte(ledgerPostings.postingDate, startDate),
        lte(ledgerPostings.postingDate, endDate)
      )
    );

  const cashPostings = periodPostings.filter((p) =>
    cashAccountIds.includes(p.accountId)
  );

  // 4. Categorize cash flows (simplified: all are operating for now)
  const operatingInflows = cashPostings
    .filter((p) => p.direction === "debit")
    .map((p) => ({
      accountId: p.accountId,
      accountCode: "",
      accountName: p.description,
      accountType: "cash_inflow",
      balance: p.amount,
    }));

  const operatingOutflows = cashPostings
    .filter((p) => p.direction === "credit")
    .map((p) => ({
      accountId: p.accountId,
      accountCode: "",
      accountName: p.description,
      accountType: "cash_outflow",
      balance: p.amount,
    }));

  const operatingNet = subtractAmounts(
    sumAmounts(operatingInflows.map((p) => p.balance)),
    sumAmounts(operatingOutflows.map((p) => p.balance))
  );

  // 5. Calculate ending balance
  const netChange = operatingNet; // Only operating for now
  const endingBalance = addAmounts(beginningBalance, netChange);

  return {
    startDate,
    endDate,
    tenantId,
    operating: {
      inflows: operatingInflows,
      outflows: operatingOutflows,
      net: operatingNet,
    },
    investing: {
      inflows: [],
      outflows: [],
      net: "0.0000",
    },
    financing: {
      inflows: [],
      outflows: [],
      net: "0.0000",
    },
    netChange,
    beginningBalance,
    endingBalance,
  };
}

/**
 * Generate Trial Balance
 * 
 * List all accounts with balances, verify Debits = Credits.
 */
export async function getTrialBalance(
  db: Database,
  tenantId: string,
  asOfDate: Date
): Promise<TrialBalance> {
  // 1. Get all accounts
  const allAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.tenantId, tenantId));

  // 2. Get all postings up to asOfDate
  const postings = await db
    .select()
    .from(ledgerPostings)
    .where(
      and(
        eq(ledgerPostings.tenantId, tenantId),
        lte(ledgerPostings.postingDate, asOfDate)
      )
    );

  // 3. Calculate balances for each account
  const accountBalances = allAccounts.map((account) => {
    const accountPostings = postings.filter((p) => p.accountId === account.id);
    const { debits, credits } = calculateDebitCreditTotals(accountPostings);
    const netBalance = calculateAccountBalance(accountPostings, account.accountType);

    return {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.accountType,
      debitBalance: debits,
      creditBalance: credits,
      netBalance,
    };
  });

  // 4. Calculate totals
  const totalDebits = sumAmounts(accountBalances.map((a) => a.debitBalance));
  const totalCredits = sumAmounts(accountBalances.map((a) => a.creditBalance));

  // 5. Verify balance
  const verification = verifyTrialBalance(totalDebits, totalCredits);

  return {
    asOfDate,
    tenantId,
    accounts: accountBalances,
    totalDebits,
    totalCredits,
    balanced: verification.balanced,
    difference: verification.difference,
  };
}

/**
 * Generate Account Ledger Report
 * 
 * Detailed transaction history for a single account.
 */
export async function getAccountLedger(
  db: Database,
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<AccountLedger> {
  // 1. Get account details
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);

  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  // 2. Get beginning balance
  const beginningPostings = await db
    .select()
    .from(ledgerPostings)
    .where(
      and(
        eq(ledgerPostings.accountId, accountId),
        lte(ledgerPostings.postingDate, startDate)
      )
    );

  const beginningBalance = calculateAccountBalance(
    beginningPostings,
    account.accountType
  );

  // 3. Get period postings with document linkage
  const periodPostings = await db
    .select({
      posting: ledgerPostings,
      document: documents,
    })
    .from(ledgerPostings)
    .leftJoin(documents, eq(ledgerPostings.economicEventId, documents.id))
    .where(
      and(
        eq(ledgerPostings.accountId, accountId),
        gte(ledgerPostings.postingDate, startDate),
        lte(ledgerPostings.postingDate, endDate)
      )
    );

  // 4. Build ledger entries with running balance
  let runningBalance = parseFloat(beginningBalance);
  const entries = periodPostings.map((row) => {
    const posting = row.posting;
    const doc = row.document;
    
    const amount = parseFloat(posting.amount);
    
    // Update running balance
    if (account.accountType === "asset" || account.accountType === "expense") {
      runningBalance += posting.direction === "debit" ? amount : -amount;
    } else {
      runningBalance += posting.direction === "credit" ? amount : -amount;
    }

    return {
      date: posting.postingDate,
      postingId: posting.id,
      documentId: doc?.id,
      documentNumber: doc?.documentNumber,
      documentType: doc?.documentType,
      eventType: undefined,
      description: posting.description,
      debit: posting.direction === "debit" ? posting.amount : "0.0000",
      credit: posting.direction === "credit" ? posting.amount : "0.0000",
      balance: runningBalance.toFixed(4),
    };
  });

  // 5. Calculate totals
  const totalDebits = sumAmounts(
    entries.filter((e) => e.debit !== "0.0000").map((e) => e.debit)
  );
  const totalCredits = sumAmounts(
    entries.filter((e) => e.credit !== "0.0000").map((e) => e.credit)
  );

  return {
    accountId: account.id,
    accountCode: account.code,
    accountName: account.name,
    accountType: account.accountType,
    startDate,
    endDate,
    beginningBalance,
    entries,
    endingBalance: runningBalance.toFixed(4),
    totalDebits,
    totalCredits,
  };
}
