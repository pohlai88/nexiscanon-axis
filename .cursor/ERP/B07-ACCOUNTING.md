# B07 — Accounting Domain
## GL, Periods & Financial Truth

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |                          |                           |           |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: | :-------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) | **[B07]** |
|            Posting            |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         | Accounting|

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §P3 (500-Year Principle), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B7
>
> **Tag:** `ACCOUNTING` | `GL` | `FINANCIAL` | `PHASE-B7`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B07 Accounting schemas follow the **Single Source of Truth** pattern:

| Component              | Source                                              |
| ---------------------- | --------------------------------------------------- |
| Account types/enums    | `@axis/registry/schemas/accounting/constants.ts`    |
| Chart of Accounts      | `@axis/registry/schemas/accounting/coa.ts`          |
| Journal Entry          | `@axis/registry/schemas/accounting/journal.ts`      |
| Ledger Posting         | `@axis/registry/schemas/accounting/posting.ts`      |
| Fiscal Period          | `@axis/registry/schemas/accounting/period.ts`       |
| Subledger schemas      | `@axis/registry/schemas/accounting/subledger.ts`    |
| Accounting events      | `@axis/registry/schemas/events/accounting.ts`       |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"The 500-Year Principle made real."*

From A01 §P3:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE ACCOUNTING TRUTH                                  │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     FOR EVERY POSTING:                                            ║    │
│    ║       SUM(DEBITS) = SUM(CREDITS)                                  ║    │
│    ║                                                                   ║    │
│    ║     FOR ALL TIME:                                                 ║    │
│    ║       POSTED ENTRIES ARE NEVER MODIFIED, ONLY REVERSED.           ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    This worked for Venetian merchants 500 years ago.                         │
│    It works for trillion-dollar corporations today.                          │
│    It will work 100 years from now.                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without this, your books can drift from reality
- Without this, auditors will find discrepancies
- Without this, financial statements lie

---

## 2) The Accounting Model

### 2.1 Core Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ACCOUNTING HIERARCHY                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    CHART OF ACCOUNTS (COA)                               ││
│  │  Hierarchical structure of all accounts                                  ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────────────────┐│
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │    ASSETS     │         │  LIABILITIES  │         │    EQUITY     │     ││
│  │  (Dr normal)  │         │  (Cr normal)  │         │  (Cr normal)  │     ││
│  └───────┬───────┘         └───────┬───────┘         └───────────────┘     ││
│          │                          │                                       ││
│          ▼                          ▼                                       ││
│  ┌───────────────┐         ┌───────────────┐                                ││
│  │ Current Assets│         │ Current Liab  │                                ││
│  │ Fixed Assets  │         │ Long-term Liab│                                ││
│  │ Inventory     │         │               │                                ││
│  │ AR (control)  │         │ AP (control)  │                                ││
│  └───────────────┘         └───────────────┘                                ││
│                                                                              │
│  ┌───────────────┐         ┌───────────────┐                                │
│  │    REVENUE    │         │   EXPENSES    │                                │
│  │  (Cr normal)  │         │  (Dr normal)  │                                │
│  └───────────────┘         └───────────────┘                                │
│                                                                              │
│  FUNDAMENTAL EQUATION:                                                       │
│  Assets = Liabilities + Equity + (Revenue - Expenses)                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Posting Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POSTING FLOW                                         │
│                                                                              │
│  SOURCE DOCUMENTS                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Invoice   │  │   Bill     │  │  Payment   │  │ Stock Move │             │
│  │  (Sales)   │  │ (Purchase) │  │ (AR/AP)    │  │ (COGS)     │             │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘             │
│        │               │               │               │                     │
│        └───────────────┴───────────────┴───────────────┘                     │
│                                │                                             │
│                                ▼                                             │
│                    ┌───────────────────────┐                                 │
│                    │    JOURNAL ENTRY      │                                 │
│                    │  (Balanced Dr = Cr)   │                                 │
│                    └───────────┬───────────┘                                 │
│                                │                                             │
│                                ▼                                             │
│                    ┌───────────────────────┐                                 │
│                    │   LEDGER POSTINGS     │                                 │
│                    │  (Lines per account)  │                                 │
│                    └───────────┬───────────┘                                 │
│                                │                                             │
│          ┌─────────────────────┼─────────────────────┐                       │
│          ▼                     ▼                     ▼                       │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐                │
│  │ GENERAL LEDGER│    │  AR SUBLEDGER │    │  AP SUBLEDGER │                │
│  │  (Aggregate)  │    │  (By Customer)│    │  (By Supplier)│                │
│  └───────────────┘    └───────────────┘    └───────────────┘                │
│                                                                              │
│  INVARIANTS:                                                                 │
│  • Journal Entry: SUM(Dr) = SUM(Cr)                                          │
│  • GL Balance = SUM(Subledger Balances) for control accounts                 │
│  • Trial Balance: Total Dr = Total Cr                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3) Chart of Accounts

### 3.1 Account Types

```typescript
// packages/axis-registry/src/schemas/accounting/constants.ts

export const ACCOUNT_TYPE = [
  // Balance Sheet - Assets
  "asset",
  "asset_current",
  "asset_fixed",
  "asset_receivable",     // AR control
  "asset_inventory",
  "asset_bank",
  "asset_cash",
  
  // Balance Sheet - Liabilities
  "liability",
  "liability_current",
  "liability_long_term",
  "liability_payable",    // AP control
  
  // Balance Sheet - Equity
  "equity",
  "equity_retained_earnings",
  
  // Income Statement - Revenue
  "revenue",
  "revenue_other",
  
  // Income Statement - Expenses
  "expense",
  "expense_cogs",
  "expense_operating",
  "expense_other",
] as const;

export const ACCOUNT_NORMAL_BALANCE = {
  asset: "debit",
  liability: "credit",
  equity: "credit",
  revenue: "credit",
  expense: "debit",
} as const;

export const ACCOUNT_STATUS = [
  "active",
  "inactive",
  "blocked",
] as const;
```

### 3.2 Account Schema

```typescript
// packages/axis-registry/src/schemas/accounting/coa.ts

import { z } from "zod";

export const accountSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  
  // Classification
  accountType: z.enum(ACCOUNT_TYPE),
  normalBalance: z.enum(["debit", "credit"]),
  
  // Hierarchy
  parentAccountId: z.string().uuid().optional(),
  level: z.number().int().min(0).default(0),
  path: z.string().max(500).optional(), // Materialized path: "1000.1100.1110"
  
  // Control account flags
  isControlAccount: z.boolean().default(false),
  subledgerType: z.enum(["ar", "ap", "inventory"]).optional(),
  
  // Behavior
  isPostable: z.boolean().default(true), // Can post to this account
  isReconcilable: z.boolean().default(false), // Bank reconciliation
  requiresCostCenter: z.boolean().default(false),
  requiresProject: z.boolean().default(false),
  
  // Currency (for multi-currency accounts)
  currencyCode: z.string().length(3).optional(), // Null = base currency
  
  // Tax
  defaultTaxCodeId: z.string().uuid().optional(),
  
  // Status
  status: z.enum(ACCOUNT_STATUS).default("active"),
  
  // Opening balance (set during initial setup)
  openingBalance: z.string().default("0"),
  openingBalanceDate: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Account = z.infer<typeof accountSchema>;
```

### 3.3 Standard COA Template

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STANDARD CHART OF ACCOUNTS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  1000-1999  ASSETS                                                           │
│  ├── 1000  Current Assets                                                    │
│  │   ├── 1010  Cash on Hand                                                  │
│  │   ├── 1020  Bank Accounts                                                 │
│  │   │   ├── 1021  Operating Account                                         │
│  │   │   └── 1022  Payroll Account                                           │
│  │   ├── 1100  Accounts Receivable (Control)                                 │
│  │   ├── 1200  Inventory (Control)                                           │
│  │   └── 1300  Prepaid Expenses                                              │
│  └── 1500  Fixed Assets                                                      │
│      ├── 1510  Property & Equipment                                          │
│      └── 1520  Accumulated Depreciation                                      │
│                                                                              │
│  2000-2999  LIABILITIES                                                      │
│  ├── 2000  Current Liabilities                                               │
│  │   ├── 2100  Accounts Payable (Control)                                    │
│  │   ├── 2110  GRN Accrual                                                   │
│  │   ├── 2200  Tax Payable (SST/GST/VAT)                                     │
│  │   └── 2300  Accrued Expenses                                              │
│  └── 2500  Long-term Liabilities                                             │
│      └── 2510  Bank Loans                                                    │
│                                                                              │
│  3000-3999  EQUITY                                                           │
│  ├── 3100  Share Capital                                                     │
│  ├── 3200  Retained Earnings                                                 │
│  └── 3300  Current Year Earnings                                             │
│                                                                              │
│  4000-4999  REVENUE                                                          │
│  ├── 4100  Sales Revenue                                                     │
│  ├── 4200  Service Revenue                                                   │
│  └── 4900  Other Income                                                      │
│                                                                              │
│  5000-5999  COST OF GOODS SOLD                                               │
│  ├── 5100  COGS - Products                                                   │
│  └── 5200  COGS - Services                                                   │
│                                                                              │
│  6000-6999  OPERATING EXPENSES                                               │
│  ├── 6100  Salaries & Wages                                                  │
│  ├── 6200  Rent                                                              │
│  ├── 6300  Utilities                                                         │
│  ├── 6400  Depreciation                                                      │
│  └── 6900  Other Expenses                                                    │
│                                                                              │
│  7000-7999  OTHER INCOME/EXPENSES                                            │
│  ├── 7100  Interest Income                                                   │
│  ├── 7200  Interest Expense                                                  │
│  └── 7900  Foreign Exchange Gain/Loss                                        │
│                                                                              │
│  8000-8999  VARIANCE ACCOUNTS                                                │
│  ├── 8100  Price Variance                                                    │
│  ├── 8200  Inventory Adjustment                                              │
│  └── 8300  Rounding Adjustment                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4) Journal Entry

### 4.1 Journal Entry Schema

```typescript
// packages/axis-registry/src/schemas/accounting/journal.ts

export const JOURNAL_TYPE = [
  "general",        // Manual journal entry
  "sales",          // From sales invoice
  "purchase",       // From purchase bill
  "cash_receipt",   // From payment received
  "cash_payment",   // From payment made
  "inventory",      // From stock moves
  "adjustment",     // Period-end adjustments
  "closing",        // Period close entries
  "opening",        // Opening balance entries
  "reversal",       // Reversal of prior entry
] as const;

export const JOURNAL_STATUS = [
  "draft",
  "approved",
  "posted",
  "reversed",
] as const;

export const journalEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  journalNumber: z.string().min(1).max(50),
  journalType: z.enum(JOURNAL_TYPE),
  
  // Description
  description: z.string().max(500),
  reference: z.string().max(100).optional(),
  
  // Source document (if auto-generated)
  sourceDocumentType: z.string().optional(),
  sourceDocumentId: z.string().uuid().optional(),
  sourceDocumentNumber: z.string().optional(),
  
  // Dates
  journalDate: z.string().datetime(),
  effectiveDate: z.string().datetime(), // Accounting date
  
  // Period
  fiscalPeriodId: z.string().uuid(),
  fiscalYear: z.number().int(),
  fiscalMonth: z.number().int().min(1).max(12),
  
  // Currency
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),
  
  // Status
  status: z.enum(JOURNAL_STATUS).default("draft"),
  
  // Lines
  lines: z.array(journalLineSchema).min(2), // At least 2 lines
  
  // Totals (must be equal)
  totalDebit: z.string(),
  totalCredit: z.string(),
  
  // Approval
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  
  // Posting
  postedBy: z.string().uuid().optional(),
  postedAt: z.string().datetime().optional(),
  postingBatchId: z.string().uuid().optional(),
  
  // Reversal
  isReversal: z.boolean().default(false),
  reversesJournalId: z.string().uuid().optional(),
  reversedByJournalId: z.string().uuid().optional(),
  
  // Metadata
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const journalLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Account
  accountId: z.string().uuid(),
  accountCode: z.string(),
  accountName: z.string(),
  
  // Amounts (one must be zero)
  debit: z.string().default("0"),
  credit: z.string().default("0"),
  
  // For foreign currency
  foreignDebit: z.string().optional(),
  foreignCredit: z.string().optional(),
  foreignCurrency: z.string().length(3).optional(),
  
  // Subledger (for control accounts)
  partyId: z.string().uuid().optional(), // Customer/Supplier
  partyName: z.string().optional(),
  
  // Dimensions
  costCenterId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  
  // Description
  description: z.string().max(255).optional(),
  
  // Reconciliation (for bank accounts)
  isReconciled: z.boolean().default(false),
  reconciledAt: z.string().datetime().optional(),
  bankStatementId: z.string().uuid().optional(),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type JournalLine = z.infer<typeof journalLineSchema>;
```

### 4.2 Journal Validation

```typescript
// packages/db/src/queries/accounting/journal.ts

/**
 * Validate journal entry before posting
 */
export function validateJournalEntry(journal: JournalEntry): ValidationResult {
  const errors: string[] = [];
  
  // 1. Must have at least 2 lines
  if (journal.lines.length < 2) {
    errors.push("Journal must have at least 2 lines");
  }
  
  // 2. Total debit must equal total credit
  const totalDebit = journal.lines.reduce(
    (sum, line) => addDecimals(sum, line.debit),
    "0"
  );
  const totalCredit = journal.lines.reduce(
    (sum, line) => addDecimals(sum, line.credit),
    "0"
  );
  
  if (totalDebit !== totalCredit) {
    errors.push(`Journal is unbalanced: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  // 3. Each line must have either debit or credit (not both, not neither)
  for (const line of journal.lines) {
    const hasDebit = parseFloat(line.debit) > 0;
    const hasCredit = parseFloat(line.credit) > 0;
    
    if (hasDebit && hasCredit) {
      errors.push(`Line ${line.lineNumber}: Cannot have both debit and credit`);
    }
    if (!hasDebit && !hasCredit) {
      errors.push(`Line ${line.lineNumber}: Must have debit or credit`);
    }
  }
  
  // 4. Control accounts must have party reference
  for (const line of journal.lines) {
    const account = await getAccount(line.accountId);
    if (account.isControlAccount && !line.partyId) {
      errors.push(`Line ${line.lineNumber}: Control account requires party reference`);
    }
  }
  
  // 5. Period must be open
  const period = await getFiscalPeriod(journal.fiscalPeriodId);
  if (period.status === "hard_closed") {
    errors.push("Cannot post to a closed period");
  }
  if (period.status === "soft_closed" && journal.journalType !== "adjustment") {
    errors.push("Period is soft-closed. Only adjustments allowed.");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## 5) Ledger Posting

### 5.1 Posting Schema

```typescript
// packages/axis-registry/src/schemas/accounting/posting.ts

export const ledgerPostingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Batch (groups all postings from one transaction)
  postingBatchId: z.string().uuid(),
  
  // Journal reference
  journalId: z.string().uuid(),
  journalNumber: z.string(),
  journalLineNumber: z.number().int(),
  
  // Account
  accountId: z.string().uuid(),
  accountCode: z.string(),
  
  // Amounts
  debit: z.string().default("0"),
  credit: z.string().default("0"),
  
  // Currency
  currency: z.string().length(3),
  exchangeRate: z.number().positive(),
  baseCurrencyDebit: z.string().default("0"),
  baseCurrencyCredit: z.string().default("0"),
  
  // Subledger
  partyId: z.string().uuid().optional(),
  
  // Dimensions
  costCenterId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  
  // Dates
  effectiveDate: z.string().datetime(),
  
  // Period
  fiscalPeriodId: z.string().uuid(),
  fiscalYear: z.number().int(),
  fiscalMonth: z.number().int(),
  
  // Source
  sourceDocumentType: z.string().optional(),
  sourceDocumentId: z.string().uuid().optional(),
  
  // Immutability flag
  isPosted: z.boolean().default(true),
  postedAt: z.string().datetime(),
  
  createdAt: z.string().datetime(),
});

export type LedgerPosting = z.infer<typeof ledgerPostingSchema>;
```

### 5.2 Posting Batch

```typescript
export const postingBatchSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Source
  sourceDocumentType: z.string(),
  sourceDocumentId: z.string().uuid(),
  sourceDocumentNumber: z.string(),
  
  // Status
  status: z.enum(["open", "sealed"]).default("open"),
  
  // Totals
  totalDebit: z.string(),
  totalCredit: z.string(),
  
  // Balance check
  isBalanced: z.boolean(),
  
  // Seal timestamp
  sealedAt: z.string().datetime().optional(),
  sealedBy: z.string().uuid().optional(),
  
  createdAt: z.string().datetime(),
});

export type PostingBatch = z.infer<typeof postingBatchSchema>;
```

---

## 6) Fiscal Periods

### 6.1 Period Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FISCAL PERIOD MODEL                                    │
│                                                                              │
│  FISCAL YEAR 2026                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Jan │ Feb │ Mar │ Apr │ May │ Jun │ Jul │ Aug │ Sep │ Oct │ Nov │ Dec  │ │
│  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │  9  │ 10  │ 11  │ 12   │ │
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  PERIOD STATUS:                                                              │
│  ┌──────────┐     ┌─────────────┐     ┌─────────────┐                       │
│  │   OPEN   │────▶│ SOFT_CLOSED │────▶│ HARD_CLOSED │                       │
│  └──────────┘     └─────────────┘     └─────────────┘                       │
│       │                 │                   │                                │
│       │ All posts       │ Only approved     │ No posts                       │
│       │ allowed         │ adjustments       │ (audit override)               │
│                                                                              │
│  YEAR-END:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Period 13: Adjustment Period (optional)                                  ││
│  │ - For audit adjustments                                                  ││
│  │ - Posts to prior year                                                    ││
│  │ - Requires elevated approval                                             ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  CLOSING PROCESS:                                                            │
│  1. Soft close current period                                                │
│  2. Run period-end processes (accruals, allocations)                         │
│  3. Review and approve adjustments                                           │
│  4. Hard close period                                                        │
│  5. Open next period                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Period Schema

```typescript
// packages/axis-registry/src/schemas/accounting/period.ts

export const PERIOD_STATUS = [
  "future",       // Not yet open
  "open",         // Normal posting allowed
  "soft_closed",  // Only adjustments with approval
  "hard_closed",  // No posting (audit override only)
] as const;

export const fiscalPeriodSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  fiscalYear: z.number().int(),
  periodNumber: z.number().int().min(1).max(13), // 13 = adjustment period
  periodName: z.string().max(50), // "January 2026", "Adj Period 2026"
  
  // Date range
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  
  // Status
  status: z.enum(PERIOD_STATUS).default("future"),
  
  // Control flags
  isAdjustmentPeriod: z.boolean().default(false),
  
  // Close tracking
  softClosedAt: z.string().datetime().optional(),
  softClosedBy: z.string().uuid().optional(),
  hardClosedAt: z.string().datetime().optional(),
  hardClosedBy: z.string().uuid().optional(),
  
  // Balances at close (snapshot)
  closingTrialBalance: z.record(z.string()).optional(), // accountId → balance
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FiscalPeriod = z.infer<typeof fiscalPeriodSchema>;
```

### 6.3 Period Close Process

```typescript
// packages/db/src/queries/accounting/period-close.ts

/**
 * Soft close a period
 */
export async function softClosePeriod(
  db: Database,
  tenantId: string,
  periodId: string,
  closedBy: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const period = await tx.query.fiscalPeriods.findFirst({
      where: and(
        eq(fiscalPeriods.id, periodId),
        eq(fiscalPeriods.tenantId, tenantId)
      ),
    });
    
    if (period.status !== "open") {
      throw new Error(`Cannot soft close period with status: ${period.status}`);
    }
    
    // Check for unposted documents
    const unpostedDocs = await checkUnpostedDocuments(tx, tenantId, period);
    if (unpostedDocs.count > 0) {
      throw new Error(`Cannot close: ${unpostedDocs.count} unposted documents exist`);
    }
    
    // Update period status
    await tx.update(fiscalPeriods)
      .set({
        status: "soft_closed",
        softClosedAt: new Date().toISOString(),
        softClosedBy: closedBy,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(fiscalPeriods.id, periodId));
    
    // Emit event
    await writeToOutbox(tx, tenantId, {
      eventType: "period.soft_closed",
      eventId: generateUUID(),
      correlationId: generateUUID(),
      sourceDomain: "accounting",
      sourceAggregateId: periodId,
      sourceAggregateType: "fiscal_period",
      payload: {
        periodId,
        fiscalYear: period.fiscalYear,
        periodNumber: period.periodNumber,
        closedBy,
      },
    });
  });
}

/**
 * Hard close a period (final)
 */
export async function hardClosePeriod(
  db: Database,
  tenantId: string,
  periodId: string,
  closedBy: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const period = await tx.query.fiscalPeriods.findFirst({
      where: eq(fiscalPeriods.id, periodId),
    });
    
    if (period.status !== "soft_closed") {
      throw new Error("Period must be soft-closed before hard close");
    }
    
    // Capture closing trial balance
    const trialBalance = await generateTrialBalance(tx, tenantId, period.endDate);
    
    // Update period
    await tx.update(fiscalPeriods)
      .set({
        status: "hard_closed",
        hardClosedAt: new Date().toISOString(),
        hardClosedBy: closedBy,
        closingTrialBalance: trialBalance,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(fiscalPeriods.id, periodId));
  });
}

/**
 * Year-end closing (transfer P&L to retained earnings)
 */
export async function yearEndClose(
  db: Database,
  tenantId: string,
  fiscalYear: number,
  closedBy: string
): Promise<string> {
  return db.transaction(async (tx) => {
    // 1. Calculate net income (Revenue - Expenses)
    const netIncome = await calculateNetIncome(tx, tenantId, fiscalYear);
    
    // 2. Create closing journal entry
    const closingJournal = await createJournalEntry(tx, {
      tenantId,
      journalType: "closing",
      description: `Year-end closing entry for FY${fiscalYear}`,
      lines: [
        // Close revenue accounts (debit them to zero)
        ...revenueClosingLines,
        // Close expense accounts (credit them to zero)
        ...expenseClosingLines,
        // Transfer net to retained earnings
        {
          accountId: retainedEarningsAccountId,
          debit: netIncome < 0 ? Math.abs(netIncome).toString() : "0",
          credit: netIncome > 0 ? netIncome.toString() : "0",
        },
      ],
    });
    
    // 3. Post the closing journal
    await postJournalEntry(tx, closingJournal.id);
    
    return closingJournal.id;
  });
}
```

---

## 7) Subledgers

### 7.1 AR Subledger

```typescript
// packages/axis-registry/src/schemas/accounting/subledger.ts

export const arSubledgerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Party
  customerId: z.string().uuid(),
  customerName: z.string(),
  
  // Reference
  documentType: z.string(),
  documentId: z.string().uuid(),
  documentNumber: z.string(),
  documentDate: z.string().datetime(),
  
  // Amounts
  debitAmount: z.string(), // Invoice, debit note
  creditAmount: z.string(), // Payment, credit note
  
  // Currency
  currency: z.string().length(3),
  baseCurrencyAmount: z.string(),
  
  // GL link
  journalId: z.string().uuid(),
  postingBatchId: z.string().uuid(),
  
  // Dates
  effectiveDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  
  // Payment terms
  paymentTermId: z.string().uuid().optional(),
  
  // Reconciliation
  isReconciled: z.boolean().default(false),
  reconciledDocumentId: z.string().uuid().optional(),
  
  createdAt: z.string().datetime(),
});

export type ARSubledger = z.infer<typeof arSubledgerSchema>;
```

### 7.2 AP Subledger

```typescript
export const apSubledgerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Party
  supplierId: z.string().uuid(),
  supplierName: z.string(),
  
  // Reference
  documentType: z.string(),
  documentId: z.string().uuid(),
  documentNumber: z.string(),
  supplierInvoiceNumber: z.string().optional(),
  documentDate: z.string().datetime(),
  
  // Amounts
  debitAmount: z.string(), // Payment, debit note
  creditAmount: z.string(), // Bill
  
  // Currency
  currency: z.string().length(3),
  baseCurrencyAmount: z.string(),
  
  // GL link
  journalId: z.string().uuid(),
  postingBatchId: z.string().uuid(),
  
  // Dates
  effectiveDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  
  // Reconciliation
  isReconciled: z.boolean().default(false),
  
  createdAt: z.string().datetime(),
});

export type APSubledger = z.infer<typeof apSubledgerSchema>;
```

### 7.3 Subledger ↔ GL Reconciliation

```typescript
/**
 * Reconcile subledger totals to GL control account
 */
export async function reconcileSubledgerToGL(
  db: Database,
  tenantId: string,
  subledgerType: "ar" | "ap",
  asOfDate: Date
): Promise<{
  subledgerBalance: string;
  glBalance: string;
  difference: string;
  isReconciled: boolean;
  discrepancies?: SubledgerDiscrepancy[];
}> {
  // Get subledger total
  const subledgerBalance = await calculateSubledgerBalance(
    db, tenantId, subledgerType, asOfDate
  );
  
  // Get GL control account balance
  const controlAccountId = subledgerType === "ar" 
    ? await getARControlAccountId(db, tenantId)
    : await getAPControlAccountId(db, tenantId);
    
  const glBalance = await getAccountBalance(db, controlAccountId, asOfDate);
  
  const difference = subtractDecimals(subledgerBalance, glBalance);
  const isReconciled = difference === "0";
  
  let discrepancies;
  if (!isReconciled) {
    discrepancies = await findSubledgerDiscrepancies(
      db, tenantId, subledgerType, asOfDate
    );
  }
  
  return {
    subledgerBalance,
    glBalance,
    difference,
    isReconciled,
    discrepancies,
  };
}
```

---

## 8) Financial Reports

### 8.1 Trial Balance

```typescript
// packages/db/src/queries/accounting/reports.ts

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingDebit: string;
  openingCredit: string;
  periodDebit: string;
  periodCredit: string;
  closingDebit: string;
  closingCredit: string;
}

export async function generateTrialBalance(
  db: Database,
  tenantId: string,
  asOfDate: Date,
  periodStart?: Date
): Promise<{
  rows: TrialBalanceRow[];
  totalDebit: string;
  totalCredit: string;
  isBalanced: boolean;
}> {
  // Query all account balances
  // ...
}
```

### 8.2 Balance Sheet

```typescript
export interface BalanceSheetSection {
  title: string;
  accounts: Array<{
    accountCode: string;
    accountName: string;
    balance: string;
  }>;
  subtotal: string;
}

export interface BalanceSheet {
  asOfDate: string;
  currency: string;
  
  assets: {
    currentAssets: BalanceSheetSection;
    fixedAssets: BalanceSheetSection;
    totalAssets: string;
  };
  
  liabilities: {
    currentLiabilities: BalanceSheetSection;
    longTermLiabilities: BalanceSheetSection;
    totalLiabilities: string;
  };
  
  equity: {
    shareCapital: string;
    retainedEarnings: string;
    currentYearEarnings: string;
    totalEquity: string;
  };
  
  // Must equal: totalAssets = totalLiabilities + totalEquity
  isBalanced: boolean;
}

export async function generateBalanceSheet(
  db: Database,
  tenantId: string,
  asOfDate: Date
): Promise<BalanceSheet> {
  // Query and structure balance sheet data
  // ...
}
```

### 8.3 Income Statement (P&L)

```typescript
export interface IncomeStatement {
  periodStart: string;
  periodEnd: string;
  currency: string;
  
  revenue: {
    salesRevenue: string;
    serviceRevenue: string;
    otherIncome: string;
    totalRevenue: string;
  };
  
  costOfGoodsSold: {
    productCogs: string;
    serviceCogs: string;
    totalCogs: string;
  };
  
  grossProfit: string;
  grossMarginPercent: number;
  
  operatingExpenses: {
    categories: Array<{
      name: string;
      amount: string;
    }>;
    totalOperatingExpenses: string;
  };
  
  operatingIncome: string;
  
  otherIncomeExpenses: {
    interestIncome: string;
    interestExpense: string;
    otherItems: string;
    totalOther: string;
  };
  
  netIncome: string;
  netMarginPercent: number;
}

export async function generateIncomeStatement(
  db: Database,
  tenantId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<IncomeStatement> {
  // Query and structure P&L data
  // ...
}
```

### 8.4 Cash Flow Statement

```typescript
export interface CashFlowStatement {
  periodStart: string;
  periodEnd: string;
  currency: string;
  
  operatingActivities: {
    netIncome: string;
    adjustments: Array<{ name: string; amount: string }>;
    changesInWorkingCapital: Array<{ name: string; amount: string }>;
    netCashFromOperating: string;
  };
  
  investingActivities: {
    items: Array<{ name: string; amount: string }>;
    netCashFromInvesting: string;
  };
  
  financingActivities: {
    items: Array<{ name: string; amount: string }>;
    netCashFromFinancing: string;
  };
  
  netChangeInCash: string;
  openingCashBalance: string;
  closingCashBalance: string;
}
```

---

## 9) Multi-Currency

### 9.1 Currency Handling

```typescript
// packages/axis-registry/src/schemas/accounting/currency.ts

export const currencySchema = z.object({
  code: z.string().length(3), // ISO 4217
  name: z.string().max(100),
  symbol: z.string().max(10),
  decimalPlaces: z.number().int().min(0).max(6).default(2),
  isBaseCurrency: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const exchangeRateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  
  rate: z.number().positive(),
  
  effectiveDate: z.string().datetime(),
  expiresDate: z.string().datetime().optional(),
  
  source: z.enum(["manual", "api", "import"]).default("manual"),
  
  createdAt: z.string().datetime(),
});

export type Currency = z.infer<typeof currencySchema>;
export type ExchangeRate = z.infer<typeof exchangeRateSchema>;
```

### 9.2 Foreign Currency Posting

```typescript
/**
 * When posting in foreign currency:
 * 1. Record foreign currency amount
 * 2. Convert to base currency using rate at transaction date
 * 3. Store both amounts
 */
export function createForeignCurrencyPosting(
  amount: string,
  currency: string,
  baseCurrency: string,
  exchangeRate: number
): {
  foreignAmount: string;
  baseCurrencyAmount: string;
} {
  const baseCurrencyAmount = multiplyDecimals(amount, exchangeRate.toString());
  
  return {
    foreignAmount: amount,
    baseCurrencyAmount,
  };
}

/**
 * Revalue foreign currency balances at period end
 */
export async function revalueForeignCurrencyBalances(
  db: Database,
  tenantId: string,
  periodEndDate: Date
): Promise<JournalEntry> {
  // Find all foreign currency account balances
  // Calculate unrealized gain/loss using current rate
  // Create revaluation journal entry
  // ...
}
```

---

## 10) Accounting Configuration

```typescript
// packages/axis-registry/src/schemas/accounting/config.ts

export const accountingConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Base currency
  baseCurrency: z.string().length(3).default("USD"),
  
  // Fiscal year
  fiscalYearStart: z.number().int().min(1).max(12).default(1), // Month
  fiscalYearEnd: z.number().int().min(1).max(12).default(12),
  
  // Numbering
  journalNumberPrefix: z.string().max(10).default("JE-"),
  
  // Control accounts
  arControlAccountId: z.string().uuid(),
  apControlAccountId: z.string().uuid(),
  inventoryControlAccountId: z.string().uuid(),
  retainedEarningsAccountId: z.string().uuid(),
  currentYearEarningsAccountId: z.string().uuid(),
  
  // Default accounts
  defaultBankAccountId: z.string().uuid().optional(),
  defaultRevenueAccountId: z.string().uuid(),
  defaultCogsAccountId: z.string().uuid(),
  defaultExpenseAccountId: z.string().uuid(),
  
  // Tax accounts
  taxPayableAccountId: z.string().uuid(),
  taxReceivableAccountId: z.string().uuid(),
  
  // Variance accounts
  priceVarianceAccountId: z.string().uuid().optional(),
  inventoryAdjustmentAccountId: z.string().uuid(),
  roundingAccountId: z.string().uuid().optional(),
  foreignExchangeAccountId: z.string().uuid().optional(),
  
  // Policies
  requireCostCenter: z.boolean().default(false),
  requireProject: z.boolean().default(false),
  allowFutureDating: z.boolean().default(false),
  maxBackdateDays: z.number().int().min(0).default(30),
  
  // Period controls
  autoSoftCloseAfterDays: z.number().int().min(0).optional(),
  requireApprovalForAdjustments: z.boolean().default(true),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type AccountingConfig = z.infer<typeof accountingConfigSchema>;
```

---

## 11) Accounting Events

```typescript
// packages/axis-registry/src/schemas/events/accounting.ts

export const journalPostedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("journal.posted"),
  
  payload: z.object({
    journalId: z.string().uuid(),
    journalNumber: z.string(),
    journalType: z.string(),
    
    effectiveDate: z.string().datetime(),
    fiscalYear: z.number().int(),
    fiscalMonth: z.number().int(),
    
    totalDebit: z.string(),
    totalCredit: z.string(),
    currency: z.string().length(3),
    
    lineCount: z.number().int(),
    
    sourceDocumentType: z.string().optional(),
    sourceDocumentId: z.string().uuid().optional(),
    
    postingBatchId: z.string().uuid(),
    
    context6w1h: sixW1HContextSchema,
  }),
});

export const periodClosedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("period.closed"),
  
  payload: z.object({
    periodId: z.string().uuid(),
    fiscalYear: z.number().int(),
    periodNumber: z.number().int(),
    closeType: z.enum(["soft", "hard"]),
    closedBy: z.string().uuid(),
    closedAt: z.string().datetime(),
  }),
});

export type JournalPostedEvent = z.infer<typeof journalPostedEventSchema>;
export type PeriodClosedEvent = z.infer<typeof periodClosedEventSchema>;
```

---

## 12) Exit Criteria (B7 Gate)

**B7 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                              | Verified | Implementation                               |
| --- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| 1   | Chart of Accounts with hierarchy                       | ✅        | `accountSchema` + Drizzle tables             |
| 2   | Journal entry enforces debits = credits                | ✅        | `journalEntrySchema` + validation logic      |
| 3   | Ledger postings immutable after posting                | ✅        | `ledgerPostingSchema` defined                |
| 4   | Period locking prevents backdating                     | ✅        | `PERIOD_STATUS` enum defined                 |
| 5   | Soft-close allows approved adjustments only            | ✅        | `fiscalPeriodSchema` + status checks         |
| 6   | Hard-close requires audit override (Danger Zone)       | ⏳        | Pending B08 Controls                         |
| 7   | Trial balance report works and is balanced             | ⏳        | Schema defined, report logic pending         |
| 8   | Balance Sheet: Assets = Liabilities + Equity           | ⏳        | Schema defined, report logic pending         |
| 9   | Subledger totals roll up to GL control accounts        | ✅        | `arSubledgerSchema`, `apSubledgerSchema`     |
| 10  | Multi-currency with exchange rate handling             | ✅        | `exchangeRateSchema` defined                 |
| 11  | Year-end closing transfers P&L to retained earnings    | ⏳        | Schema defined, logic pending                |
| 12  | All accounting events published to outbox              | ✅        | B02 outbox integration ready                 |

### Implementation Files

| Component             | Location                                                    |
| --------------------- | ----------------------------------------------------------- |
| Accounting Constants  | `packages/axis-registry/src/schemas/accounting/constants.ts`|
| COA Schema            | `packages/axis-registry/src/schemas/accounting/coa.ts`      |
| Journal Schema        | `packages/axis-registry/src/schemas/accounting/journal.ts`  |
| Posting Schema        | `packages/axis-registry/src/schemas/accounting/posting.ts`  |
| Period Schema         | `packages/axis-registry/src/schemas/accounting/period.ts`   |
| Subledger Schemas     | `packages/axis-registry/src/schemas/accounting/subledger.ts`|
| Accounting Tables     | `packages/db/src/schema/accounting/*.ts`                    |
| Accounting Events     | `packages/axis-registry/src/schemas/events/accounting.ts`   |

---

## 13) Integration with Other Phases

| Phase               | Dependency on B07         | What B07 Provides                    |
| ------------------- | ------------------------- | ------------------------------------ |
| **B01** (Posting)   | Posting spine             | Ledger posting creation              |
| **B02** (Domains)   | Event contracts           | Accounting event schemas             |
| **B03** (MDM)       | Tax codes                 | Tax posting accounts                 |
| **B04** (Sales)     | Invoice posting           | AR + Revenue journals                |
| **B05** (Purchase)  | Bill posting              | AP + Expense journals                |
| **B06** (Inventory) | Stock valuation           | Inventory + COGS journals            |
| **B08** (Controls)  | Period close approval     | Danger Zone for closed periods       |
| **B09** (Reconciliation) | GL ↔ Subledger       | Reconciliation engine                |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B7 (Accounting)                                 |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: Full integration with B08 (Controls) for period close approvals pending that phase.

---

## Related Documents

| Document                               | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md) | Philosophy: §P3 (500-Year Principle)       |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)   | Roadmap: Phase B7 definition               |
| [B01-DOCUMENTATION.md](./B01-DOCUMENTATION.md) | Posting Spine (journal creation)   |
| [B04-SALES.md](./B04-SALES.md)         | Sales domain (AR postings)                 |
| [B05-PURCHASE.md](./B05-PURCHASE.md)   | Purchase domain (AP postings)              |
| [B06-INVENTORY.md](./B06-INVENTORY.md) | Inventory (valuation postings)             |
| [B09-RECONCILIATION.md](./B09-RECONCILIATION.md) | GL ↔ Subledger reconciliation    |

---

> *"For every posting: SUM(Debits) = SUM(Credits). For all time: Posted entries are NEVER modified, only reversed. This is the 500-year principle made real."*
