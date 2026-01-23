# AXIS ERP Services

Canonical implementation of core ERP services following A01-CANONICAL principles.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AXIS Service Layer                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  B04 Sales         B05 Purchase       B06 Inventory          │
│  ├─ Invoice        ├─ Bill            ├─ Valuation Engine   │
│  └─ Payment        ├─ Payment         └─ Stock Move Posting │
│                    └─ Receipt                                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            B07 Accounting (Foundation)               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  GL Posting Engine  │  Trial Balance  │  Subledger  │   │
│  │  Period Close       │  AR/AP Aging    │  Audit Log  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Services Implemented

### B07 Accounting (Foundation Layer)

#### 1. GL Posting Engine (`accounting/gl-posting-engine.ts`)
**Purpose**: Core double-entry accounting engine

**Key Functions**:
- `postJournalToGL()` - Posts journal entries with double-entry validation
- `validateDoubleEntry()` - Enforces Debits = Credits (The 500-Year Law)
- `validatePeriod()` - Danger Zone detection for closed periods
- `createReversalEntry()` - Immutable correction via reversals

**AXIS Principles**:
- ✅ **PROTECT**: Immutable postings, 6W1H audit trail
- ✅ **DETECT**: Double-entry validation (Debits = Credits)
- ✅ **REACT**: Danger Zone warnings for closed periods
- ✅ **100-Year Recall**: Full context on all transactions

#### 2. Trial Balance (`accounting/trial-balance.ts`)
**Purpose**: Financial reporting and balance verification

**Key Functions**:
- `calculateTrialBalance()` - Aggregates GL postings by account
- `getAccountBalance()` - Drill-down to transaction detail
- `prepareBalanceSheet()` - Assets = Liabilities + Equity
- `prepareProfitAndLoss()` - Net Profit = Revenue - Expenses

**Reports Generated**:
- Trial Balance (all accounts)
- Balance Sheet (Assets, Liabilities, Equity)
- Profit & Loss (Revenue, Expenses, Net Profit)

#### 3. Subledger Service (`accounting/subledger-service.ts`)
**Purpose**: AR/AP management and reconciliation

**Key Functions**:
- `createAREntry()` - Creates Accounts Receivable entry from invoice
- `applyARPayment()` - Reconciles customer payment to invoices
- `getARAging()` - Customer aging report (Current, 1-30, 31-60, 61-90, 90+)
- `createAPEntry()` - Creates Accounts Payable entry from bill
- `applyAPPayment()` - Reconciles supplier payment to bills
- `getAPAging()` - Supplier aging report

**Integration Points**:
- B04 Sales → AR Subledger
- B05 Purchase → AP Subledger

#### 4. Period Close (`accounting/period-close.ts`)
**Purpose**: Fiscal period management with Danger Zone controls

**Key Functions**:
- `validatePeriodClose()` - Pre-close validation checks
- `closePeriod()` - Closes fiscal period (with override capability)
- `reopenPeriod()` - Reopens closed period (high-risk, requires approval)
- `closeYear()` - Year-end closing (P&L → Retained Earnings)

**AXIS Nexus Doctrine**:
- Warns on unreconciled entries (doesn't block)
- Allows override with explicit approval + reason
- Records all Danger Zone overrides in audit log

---

### B06 Inventory (Goods Pillar)

#### 1. Valuation Engine (`inventory/valuation-engine.ts`)
**Purpose**: Inventory costing and valuation

**Costing Methods**:
- **Weighted Average**: Running average cost per item/location
- **FIFO**: First-In-First-Out with cost layer tracking
- **Standard Cost**: Fixed cost with variance tracking

**Key Functions**:
- `valuateWeightedAverage()` - Calculates weighted average cost
- `valuateFIFO()` - Creates/consumes FIFO cost layers
- `valuateStandardCost()` - Tracks price variance
- `getInventoryValuation()` - Inventory valuation report

#### 2. Stock Move Posting (`inventory/stock-move-posting.ts`)
**Purpose**: Integration between B06 Inventory and B07 GL

**Key Functions**:
- `postStockMoveToGL()` - Posts stock moves to GL
- `reverseStockMove()` - Creates reversal for corrections

**Journal Entries**:
- **Receipt**: Dr Inventory, Cr GRN Accrual
- **Issue**: Dr COGS, Cr Inventory
- **Transfer**: Dr To-Location, Cr From-Location
- **Adjustment**: Dr/Cr Inventory, Cr/Dr Adjustment Account

---

### B04 Sales (Money Pillar - Revenue)

#### 1. Invoice Service (`sales/invoice-service.ts`)
**Purpose**: Revenue recognition and AR creation

**Key Functions**:
- `postInvoiceToGL()` - Posts invoice with revenue recognition
- `validateInvoice()` - Pre-posting validation
- `createCreditNote()` - Creates credit note for returns

**Journal Entry**:
- Dr Accounts Receivable (grandTotal)
- Cr Revenue (subtotal - discounts, per line)
- Cr Tax Payable (taxTotal)

**Integration**:
- Creates AR subledger entry
- Links to GL posting batch

#### 2. Payment Service (`sales/payment-service.ts`)
**Purpose**: Cash receipt and AR reconciliation

**Key Functions**:
- `postPaymentToGL()` - Posts customer payment
- `validatePayment()` - Validates allocations
- `reversePayment()` - Creates reversal

**Journal Entry**:
- Dr Bank Account (payment amount)
- Cr Accounts Receivable (payment amount)
- Dr Discount Allowed (if early payment discount)
- Dr Bad Debt Expense (if write-off)

**Integration**:
- Reconciles AR subledger entries
- Updates invoice payment status

---

### B05 Purchase (Money Pillar - Expense)

#### 1. Bill Service (`purchase/bill-service.ts`)
**Purpose**: Expense recognition and AP creation

**Key Functions**:
- `postBillToGL()` - Posts supplier bill
- `validate3WayMatch()` - PO → Receipt → Bill matching
- `createDebitNote()` - Creates debit note for returns

**Journal Entry**:
- Dr Expense/Asset (subtotal - discounts, per line)
- Dr Tax Recoverable (taxTotal)
- Cr Accounts Payable (grandTotal)

**3-Way Match** (AXIS Nexus Doctrine):
- Quantity variance > 5%: Warning (doesn't block)
- Price variance > 2%: Warning (doesn't block)
- Unmatched lines: Warning (doesn't block)

#### 2. Payment Service (`purchase/payment-service.ts`)
**Purpose**: Cash payment and AP reconciliation

**Key Functions**:
- `postPaymentToGL()` - Posts supplier payment
- `validatePayment()` - Validates approval + allocations

**Journal Entry**:
- Dr Accounts Payable (payment + discount)
- Cr Bank Account (payment amount)
- Cr Discount Received (if early payment discount)

**AXIS Control Point**:
- Requires approval before posting (PROTECT)

#### 3. Receipt Service (`purchase/receipt-service.ts`)
**Purpose**: Goods received note (GRN) and inventory posting

**Key Functions**:
- `postReceiptToInventory()` - Posts GRN to inventory
- `validateReceipt()` - Validates inspection + quantities
- `createReceiptReturn()` - Creates return for rejected goods

**Integration**:
- Creates stock move (B06)
- Posts to GL via Stock Move Posting
- Creates GRN accrual entry

---

## AXIS Principles Implementation

### 1. PROTECT.DETECT.REACT (PDR Mantra)

| Service | PROTECT | DETECT | REACT |
|---------|---------|--------|-------|
| GL Posting | Immutable postings | Double-entry validation | Danger Zone warnings |
| Period Close | Closed period lock | Unreconciled entries | Override with approval |
| 3-Way Match | PO/Receipt/Bill link | Variance detection | Warn, don't block |
| Payment | Approval workflow | Allocation mismatch | Reject if invalid |

### 2. The 500-Year Law (Debits = Credits)

```typescript
// Enforced in GL Posting Engine
export function validateDoubleEntry(journal: JournalEntry): {
  isValid: boolean;
  errors: PostingError[];
} {
  const totalDebit = journal.lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
  const totalCredit = journal.lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return {
      isValid: false,
      errors: [{
        code: "UNBALANCED_ENTRY",
        message: `Debits (${totalDebit}) ≠ Credits (${totalCredit})`,
      }],
    };
  }
  
  return { isValid: true, errors: [] };
}
```

### 3. 100-Year Recall (6W1H Context)

All transactions include:
- **Who**: `createdBy`, `approvedBy`, `postedBy`
- **What**: `documentType`, `documentNumber`, `description`
- **When**: `createdAt`, `effectiveDate`, `postedAt`
- **Where**: `tenantId`, `fiscalPeriodId`, `locationId`
- **Why**: `reason` (for reversals/overrides)
- **Which**: `sourceDocumentId`, `journalId`, `postingBatchId`
- **How**: `status`, `amount`, `currency`

### 4. Nexus Doctrine (Warn, Don't Block)

**Examples**:
- **3-Way Match**: Variance warnings, but allows posting with approval
- **Period Close**: Warns on unreconciled entries, allows override
- **Inventory Adjustment**: Requires reason code, but doesn't block

### 5. Immutability (Never Modify History)

**Reversal Pattern**:
```typescript
// WRONG: Modify original entry
await db.update(journals).set({ status: "cancelled" });

// RIGHT: Create reversal entry
const reversal = createReversalEntry(originalJournal, {
  reason: "Customer return",
  userId: context.userId,
  timestamp: context.timestamp,
});
await postJournalToGL(reversal, db, context);
```

---

## Integration Flow Examples

### Example 1: Sales Order → Invoice → Payment

```typescript
// 1. Create and post invoice
const invoice = createSalesInvoice({ /* ... */ });
const invoiceResult = await InvoiceService.postInvoiceToGL(invoice, db, context);
// Creates: GL journal + AR subledger entry

// 2. Receive customer payment
const payment = createSalesPayment({
  allocations: [{ invoiceId: invoice.id, amount: "1000.00" }],
});
const paymentResult = await PaymentService.postPaymentToGL(payment, db, context);
// Creates: GL journal + AR reconciliation
```

### Example 2: Purchase Order → Receipt → Bill → Payment

```typescript
// 1. Receive goods (GRN)
const receipt = createPurchaseReceipt({ /* ... */ });
const receiptResult = await ReceiptService.postReceiptToInventory(receipt, db, context);
// Creates: Stock move + GL journal (Dr Inventory, Cr GRN Accrual)

// 2. Receive supplier bill
const bill = createPurchaseBill({ /* ... */ });
const billResult = await BillService.postBillToGL(bill, db, context);
// Creates: GL journal (Dr Expense, Cr AP) + AP subledger entry
// Validates: 3-way match (PO → Receipt → Bill)

// 3. Pay supplier
const payment = createPurchasePayment({
  allocations: [{ billId: bill.id, amount: "1000.00" }],
});
const paymentResult = await PurchasePaymentService.postPaymentToGL(payment, db, context);
// Creates: GL journal + AP reconciliation
```

### Example 3: Month-End Close

```typescript
// 1. Validate period
const validation = await PeriodCloseService.validatePeriodClose(db, tenantId, periodId);
if (!validation.isValid) {
  console.warn("Warnings:", validation.warnings);
  // Nexus Doctrine: Warn, but allow override
}

// 2. Close period
const closeResult = await PeriodCloseService.closePeriod(db, {
  tenantId,
  periodId,
  closedBy: userId,
  closedAt: timestamp,
  overrideWarnings: true, // Danger Zone override
  overrideReason: "Month-end close approved by CFO",
});

// 3. Generate reports
const trialBalance = await TrialBalanceService.calculateTrialBalance(db, { periodId });
const balanceSheet = TrialBalanceService.prepareBalanceSheet(trialBalance);
const profitAndLoss = TrialBalanceService.prepareProfitAndLoss(trialBalance);
```

---

## Implementation Status

| Service | Status | Lines | Tests | DB Integration |
|---------|--------|-------|-------|----------------|
| GL Posting Engine | ✅ Complete | 351 | Pending | TODO |
| Trial Balance | ✅ Complete | 267 | Pending | TODO |
| Subledger Service | ✅ Complete | 341 | Pending | TODO |
| Period Close | ✅ Complete | 301 | Pending | TODO |
| Valuation Engine | ✅ Complete | 435 | Pending | TODO |
| Stock Move Posting | ✅ Complete | 282 | Pending | TODO |
| Invoice Service | ✅ Complete | 305 | Pending | TODO |
| Payment Service | ✅ Complete | 281 | Pending | TODO |
| Bill Service | ✅ Complete | 346 | Pending | TODO |
| Purchase Payment | ✅ Complete | 265 | Pending | TODO |
| Receipt Service | ✅ Complete | 260 | Pending | TODO |

**Total**: 11 services, 3,434 lines of production code

---

## Next Steps

### 1. Database Integration
- [ ] Drizzle table queries (when tables are ready)
- [ ] Transaction handling
- [ ] Fiscal period lookups
- [ ] Audit log persistence

### 2. Testing
- [ ] Unit tests for validation logic
- [ ] Integration tests for posting flows
- [ ] End-to-end tests for complete workflows
- [ ] Danger Zone scenario testing

### 3. Year-End Close Logic
- [ ] P&L transfer to Retained Earnings
- [ ] Opening balance entries for new year
- [ ] Closing entry journal generation

### 4. Advanced Features
- [ ] Multi-currency support (exchange rate handling)
- [ ] Intercompany transactions
- [ ] Batch posting optimization
- [ ] Reconciliation workflows

---

## References

- `.cursor/ERP/A01-CANONICAL.md` - AXIS Philosophy
- `.cursor/ERP/B04-SALES.md` - Sales Core
- `.cursor/ERP/B05-PURCHASE.md` - Purchase Core
- `.cursor/ERP/B06-INVENTORY.md` - Inventory Core
- `.cursor/ERP/B07-ACCOUNTING.md` - Accounting Core
- `packages/axis-registry/README.md` - Schema Registry
