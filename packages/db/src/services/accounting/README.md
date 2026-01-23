# B07 Accounting Services

> AXIS Canonical Implementation of Financial Truth

## Overview

This package implements the **Money Pillar** from A01-CANONICAL:

```
Do the books balance?
├─ Ledger postings (Debits = Credits)
├─ Trial balance (validation)
├─ Financial statements (Balance Sheet, P&L)
└─ Subledgers (AR/AP reconciliation)
```

## Architecture

### AXIS Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **PROTECT** | Immutable GL postings with 6W1H context |
| **DETECT** | Double-entry validation, period checks |
| **REACT** | Danger Zone warnings for policy violations |
| **Nexus Doctrine** | Warn, don't block (override with approval) |
| **100-Year Recall** | Full audit trail on all transactions |

## Services

### 1. GL Posting Engine

**File:** `gl-posting-engine.ts`

**Purpose:** Posts journal entries to General Ledger with double-entry validation

**Key Functions:**
- `validateDoubleEntry()` - The 500-Year Law: Debits = Credits
- `postJournalToGL()` - Creates immutable GL postings
- `createReversalEntry()` - Correction pattern (never modify history)

**Example:**
```typescript
import { GLPostingEngine } from "@axis/db/services/accounting";

const result = await GLPostingEngine.postJournalToGL(
  journal,
  db,
  {
    userId: "user-123",
    timestamp: new Date().toISOString(),
    reason: "Monthly close",
  }
);

if (!result.success) {
  console.error("Posting failed:", result.errors);
}

if (result.dangerZone) {
  console.warn("Danger Zone warnings:", result.dangerZone);
}
```

### 2. Trial Balance Service

**File:** `trial-balance.ts`

**Purpose:** Calculates trial balance from GL postings

**Key Functions:**
- `calculateTrialBalance()` - Aggregates postings by account
- `getAccountBalance()` - Drill-down to source documents (6W1H)
- `prepareBalanceSheet()` - Assets = Liabilities + Equity
- `prepareProfitAndLoss()` - Net Profit = Revenue - Expenses

**Example:**
```typescript
import { TrialBalanceService } from "@axis/db/services/accounting";

const report = await TrialBalanceService.calculateTrialBalance(db, {
  tenantId: "tenant-123",
  fiscalPeriodId: "period-456",
  showZeroBalances: false,
});

console.log("Balanced:", report.isBalanced);
console.log("Discrepancy:", report.balanceDiscrepancy);
```

### 3. Subledger Service

**File:** `subledger-service.ts`

**Purpose:** AR/AP subledger management with reconciliation

**Key Functions:**
- `createAREntry()` - Customer receivable (invoice)
- `applyARPayment()` - Payment application
- `getARAging()` - Aging report (Current, 30, 60, 90+ days)
- `createAPEntry()` - Supplier payable (bill)
- `applyAPPayment()` - Payment application
- `getAPAging()` - Aging report

**Example:**
```typescript
import { SubledgerService } from "@axis/db/services/accounting";

// Create AR entry from invoice
const arEntry = await SubledgerService.createAREntry(
  invoice,
  journalId,
  postingBatchId,
  { timestamp: new Date().toISOString() }
);

// Apply payment
const payment = await SubledgerService.applyARPayment(
  paymentDoc,
  invoice.id,
  paymentJournalId,
  paymentBatchId,
  { timestamp: new Date().toISOString() }
);
```

### 4. Period Close Service

**File:** `period-close.ts`

**Purpose:** Fiscal period close with Danger Zone override

**Key Functions:**
- `validatePeriodClose()` - Pre-close checks
- `closePeriod()` - Lock period (with override)
- `reopenPeriod()` - Danger Zone: requires executive approval
- `closeYear()` - Year-end close (P&L → Retained Earnings)

**Example:**
```typescript
import { PeriodCloseService } from "@axis/db/services/accounting";

// Validate before closing
const validation = await PeriodCloseService.validatePeriodClose(
  db,
  tenantId,
  periodId
);

if (!validation.canClose) {
  console.error("Cannot close:", validation.warnings);
}

// Close period (with override if needed)
const result = await PeriodCloseService.closePeriod(db, {
  tenantId,
  fiscalPeriodId: periodId,
  closedBy: userId,
  closedAt: new Date().toISOString(),
  overrideWarnings: true, // Danger Zone
  approvedBy: managerId, // Required for override
  reason: "Month-end close with open transactions",
});
```

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| GL Posting Engine | ✅ Complete | Double-entry validation, reversal pattern |
| Trial Balance | ✅ Complete | Balance Sheet & P&L preparation |
| AR Subledger | ✅ Complete | Invoice → Payment reconciliation |
| AP Subledger | ✅ Complete | Bill → Payment reconciliation |
| Period Close | ✅ Complete | Danger Zone override with approval |
| Year-End Close | ⏳ Pending | P&L transfer to Retained Earnings |
| Database Integration | ⏳ Pending | Drizzle table queries (TODO markers) |

## Integration Points

### B04 - Sales Domain
```typescript
// When invoice is posted
const journal = createInvoiceJournal(invoice);
const glResult = await GLPostingEngine.postJournalToGL(journal, db, context);
const arEntry = await SubledgerService.createAREntry(invoice, glResult.batch.id, context);
```

### B05 - Purchase Domain
```typescript
// When bill is posted
const journal = createBillJournal(bill);
const glResult = await GLPostingEngine.postJournalToGL(journal, db, context);
const apEntry = await SubledgerService.createAPEntry(bill, glResult.batch.id, context);
```

### B06 - Inventory Domain
```typescript
// When stock move is posted
const journal = createStockMoveJournal(stockMove);
const glResult = await GLPostingEngine.postJournalToGL(journal, db, context);
```

## Danger Zone Examples

### 1. Posting to Closed Period
```typescript
// System warns but allows with approval
const result = await GLPostingEngine.postJournalToGL(journal, db, context);

if (result.dangerZone) {
  // Warning: "Posting to closed period 2024-01"
  // Requires: Manager approval + justification
  // Audit: Full 6W1H context preserved
}
```

### 2. Reopening Closed Period
```typescript
// High-risk action requiring executive approval
const result = await PeriodCloseService.reopenPeriod(db, {
  fiscalPeriodId: "period-123",
  reopenedBy: userId,
  reopenedAt: new Date().toISOString(),
  reason: "Correction required for audit",
  approvedBy: cfoUserId, // REQUIRED
});

// Risk score: 90/100 (logged in danger_zone_log)
```

## Testing

```bash
# Type check
pnpm typecheck --filter @axis/db

# Lint
pnpm lint --filter @axis/db

# Unit tests (when implemented)
pnpm test --filter @axis/db
```

## References

- [A01-CANONICAL.md](../../../../../.cursor/ERP/A01-CANONICAL.md) - AXIS Philosophy
- [B07-ACCOUNTING.md](../../../../../.cursor/ERP/B07-ACCOUNTING.md) - Accounting Spec
- [Zod v4 Contract-First](../../../../../.cursor/rules/zod.contract-first.delta.mdc) - Schema patterns

---

> *"The ledger never lies. Debits = Credits. The 500-year truth that never changes."*
