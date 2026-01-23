# Next Development Batch Recommendation
## Phase 1.5: Integration & Activation (Foundation Before Growth)

> **Current State:** ✅ Service Layer Complete (11 services, 4,681 lines, 0 type errors)
> **Gap:** Services exist but cannot execute (no DB, no API, no UI, no tests)
> **Recommendation:** Complete Phase 1 activation BEFORE starting Phase 2 (B8 Controls)

---

## Strategic Analysis

### Why NOT Jump to Phase 2 (B8 Controls) Yet?

**Current Services Are "Theoretical":**
- ✅ TypeScript logic exists
- ✅ AXIS principles implemented
- ❌ Cannot run (no DB connection)
- ❌ Cannot test (no test harness)
- ❌ Cannot use (no API endpoints)
- ❌ Cannot see (no UI)

**Building B8 Controls now would be:**
- Building on untested foundation
- Adding complexity before proving core works
- Violating "ship early, ship often" principle

### Recommended Approach: Phase 1.5 (Make It Work)

Complete the foundation FIRST, then build governance on top of proven services.

---

## Batch 1: Database Integration (CRITICAL PATH) 🔴

**Duration:** 3-5 days
**Priority:** HIGHEST (blocks everything else)
**Complexity:** Medium (schemas exist, need queries)

### Deliverables

#### 1. Drizzle Table Definitions (Update Existing)
```typescript
// packages/db/src/schema/accounting.ts
export const glJournalEntries = pgTable("gl_journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  fiscalPeriodId: uuid("fiscal_period_id").notNull(),
  // ... rest of schema from @axis/registry
});

export const glLedgerPostings = pgTable("gl_ledger_postings", { /* ... */ });
export const glPostingBatches = pgTable("gl_posting_batches", { /* ... */ });
export const arSubledger = pgTable("ar_subledger", { /* ... */ });
export const apSubledger = pgTable("ap_subledger", { /* ... */ });
```

**Files to Update:**
- `packages/db/src/schema/accounting.ts` (expand existing)
- `packages/db/src/schema/inventory.ts` (expand existing)
- `packages/db/src/schema/sales.ts` (expand existing)
- `packages/db/src/schema/purchase.ts` (expand existing)
- `packages/db/src/schema/master-data.ts` (expand existing)

#### 2. Query Layer (CRUD Operations)
```typescript
// packages/db/src/queries/accounting/journal-entry.ts
export async function insertJournalEntry(
  db: NeonHttpDatabase,
  journal: JournalEntry
): Promise<JournalEntry> {
  const [inserted] = await db
    .insert(glJournalEntries)
    .values(journal)
    .returning();
  return inserted;
}

export async function insertLedgerPostings(
  db: NeonHttpDatabase,
  postings: LedgerPosting[]
): Promise<LedgerPosting[]> {
  return await db
    .insert(glLedgerPostings)
    .values(postings)
    .returning();
}

export async function findJournalsByPeriod(
  db: NeonHttpDatabase,
  tenantId: string,
  periodId: string
): Promise<JournalEntry[]> {
  return await db
    .select()
    .from(glJournalEntries)
    .where(
      and(
        eq(glJournalEntries.tenantId, tenantId),
        eq(glJournalEntries.fiscalPeriodId, periodId)
      )
    );
}
```

**Files to Create:**
- `packages/db/src/queries/accounting/journal-entry.ts`
- `packages/db/src/queries/accounting/fiscal-period.ts`
- `packages/db/src/queries/accounting/subledger.ts`
- `packages/db/src/queries/accounting/chart-of-accounts.ts`
- `packages/db/src/queries/inventory/stock-move.ts`
- `packages/db/src/queries/inventory/valuation.ts`
- `packages/db/src/queries/sales/invoice.ts`
- `packages/db/src/queries/sales/payment.ts`
- `packages/db/src/queries/purchase/bill.ts`
- `packages/db/src/queries/purchase/payment.ts`
- `packages/db/src/queries/purchase/receipt.ts`

#### 3. Update Services to Use Queries
```typescript
// Before (currently):
export async function postJournalToGL(
  journal: JournalEntry,
  _db: NeonHttpDatabase, // unused
  _context: PostingContext
): Promise<PostingResult> {
  // Logic exists but doesn't persist to DB
}

// After:
export async function postJournalToGL(
  journal: JournalEntry,
  db: NeonHttpDatabase,
  context: PostingContext
): Promise<PostingResult> {
  // 1. Validate (existing logic)
  const validation = validateDoubleEntry(journal);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  // 2. Persist to DB (NEW)
  const batch = await insertPostingBatch(db, {
    tenantId: journal.tenantId,
    postedBy: context.userId,
    postedAt: context.timestamp,
  });

  const insertedJournal = await insertJournalEntry(db, {
    ...journal,
    batchId: batch.id,
  });

  const postings = await insertLedgerPostings(db, journal.lines);

  return {
    success: true,
    batch,
    journal: insertedJournal,
    postings,
  };
}
```

#### 4. Database Migrations
```bash
# Generate migration
pnpm --filter @axis/db db:generate

# Apply migration
pnpm --filter @axis/db db:push

# Verify
pnpm --filter @axis/db db:studio
```

### Exit Criteria
- [ ] All 11 services connected to Drizzle queries
- [ ] Migrations generated and applied
- [ ] Manual test: Create invoice → See in DB
- [ ] Manual test: Post journal → See postings in DB
- [ ] Manual test: Run trial balance → Returns data

---

## Batch 2: Unit Testing (CONFIDENCE LAYER) 🟡

**Duration:** 4-6 days
**Priority:** HIGH (proves services work)
**Complexity:** Medium

### Deliverables

#### 1. Test Infrastructure Setup
```typescript
// packages/db/src/services/__tests__/setup.ts
import { beforeAll, afterAll } from "vitest";
import { createTestDatabase, cleanupTestDatabase } from "../test-utils";

beforeAll(async () => {
  await createTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});
```

#### 2. Service Unit Tests (Priority Order)

**Critical Path (Do First):**
1. **GL Posting Engine** - Foundation for all posting
   - `validateDoubleEntry()` - Must enforce Debits = Credits
   - `postJournalToGL()` - End-to-end posting
   - `createReversalEntry()` - Immutability pattern

2. **Trial Balance** - Proof books balance
   - `calculateTrialBalance()` - Aggregation logic
   - `prepareBalanceSheet()` - Classification logic
   - `prepareProfitAndLoss()` - P&L calculation

3. **Subledger Service** - AR/AP reconciliation
   - `createAREntry()` / `applyARPayment()` - Invoice → Payment
   - `createAPEntry()` / `applyAPPayment()` - Bill → Payment
   - `getARAging()` / `getAPAging()` - Aging buckets

4. **Valuation Engine** - Inventory costing
   - `valuateWeightedAverage()` - Running average
   - `valuateFIFO()` - FIFO layers
   - `valuateStandardCost()` - Variance tracking

**Secondary (Do After):**
5. **Period Close** - Fiscal period controls
6. **Invoice/Payment Services** - Sales cycle
7. **Bill/Payment/Receipt Services** - Purchase cycle
8. **Stock Move Posting** - Inventory → GL
9. **COA Service** - Chart of accounts
10. **Fiscal Period Service** - Period management

#### 3. Test Coverage Targets

| Service | Target Coverage | Critical Tests |
|---------|----------------|----------------|
| GL Posting Engine | >90% | Double-entry, reversal, Danger Zone |
| Trial Balance | >85% | Balance calculation, classification |
| Subledger Service | >80% | AR/AP creation, payment reconciliation |
| Valuation Engine | >80% | All 3 costing methods |
| Others | >75% | Happy path + error cases |

#### 4. Example Test Structure
```typescript
// packages/db/src/services/accounting/__tests__/gl-posting-engine.test.ts
import { describe, it, expect } from "vitest";
import { GLPostingEngine } from "../gl-posting-engine";

describe("GLPostingEngine", () => {
  describe("validateDoubleEntry", () => {
    it("should pass when debits = credits", () => {
      const journal = createMockJournal({
        lines: [
          { account: "1000", debit: "100.00", credit: "0.00" },
          { account: "4000", debit: "0.00", credit: "100.00" },
        ],
      });

      const result = GLPostingEngine.validateDoubleEntry(journal);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when debits ≠ credits", () => {
      const journal = createMockJournal({
        lines: [
          { account: "1000", debit: "100.00", credit: "0.00" },
          { account: "4000", debit: "0.00", credit: "99.00" },
        ],
      });

      const result = GLPostingEngine.validateDoubleEntry(journal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("UNBALANCED_ENTRY");
    });
  });

  describe("postJournalToGL", () => {
    it("should create journal + postings + batch", async () => {
      const journal = createValidJournal();
      const db = await getTestDatabase();
      const context = createTestContext();

      const result = await GLPostingEngine.postJournalToGL(
        journal,
        db,
        context
      );

      expect(result.success).toBe(true);
      expect(result.batch).toBeDefined();
      expect(result.journal).toBeDefined();
      expect(result.postings).toHaveLength(2);

      // Verify DB persistence
      const savedJournal = await db
        .select()
        .from(glJournalEntries)
        .where(eq(glJournalEntries.id, result.journal!.id));

      expect(savedJournal).toHaveLength(1);
    });
  });
});
```

### Exit Criteria
- [ ] All 11 services have unit tests
- [ ] Test coverage >80% overall
- [ ] Critical path tests >90% coverage
- [ ] All tests pass: `pnpm test --filter @axis/db`
- [ ] CI/CD integration: Tests run on every commit

---

## Batch 3: API Endpoints (EXPOSURE LAYER) 🟡

**Duration:** 3-4 days
**Priority:** HIGH (makes services usable)
**Complexity:** Low (Next.js Server Actions)

### Deliverables

#### 1. Server Actions Structure
```typescript
// apps/web/src/app/[tenant]/accounting/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { db } from "@axis/db";
import { GLPostingEngine } from "@axis/db/services/accounting";
import { journalEntrySchema } from "@axis/registry";
import type { ActionResult } from "@/types/action";

export async function postJournalAction(
  formData: FormData
): Promise<ActionResult> {
  // 1. Auth check
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Validate with Zod
  const parsed = journalEntrySchema.safeParse({
    tenantId: formData.get("tenantId"),
    fiscalPeriodId: formData.get("fiscalPeriodId"),
    documentNumber: formData.get("documentNumber"),
    lines: JSON.parse(formData.get("lines") as string),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Call service
  const result = await GLPostingEngine.postJournalToGL(parsed.data, db, {
    userId: session.user.id,
    timestamp: new Date().toISOString(),
  });

  if (!result.success) {
    return { success: false, error: result.errors[0].message };
  }

  // 4. Return success
  return {
    success: true,
    data: { journalId: result.journal!.id },
  };
}
```

#### 2. API Routes to Create

**B07 Accounting:**
- `apps/web/src/app/[tenant]/accounting/actions.ts`
  - `postJournalAction()`
  - `calculateTrialBalanceAction()`
  - `closePeriodAction()`
  - `createAREntryAction()`
  - `applyARPaymentAction()`

**B04 Sales:**
- `apps/web/src/app/[tenant]/sales/actions.ts`
  - `postInvoiceAction()`
  - `postPaymentAction()`
  - `createCreditNoteAction()`

**B05 Purchase:**
- `apps/web/src/app/[tenant]/purchase/actions.ts`
  - `postBillAction()`
  - `postPaymentAction()`
  - `postReceiptAction()`

**B06 Inventory:**
- `apps/web/src/app/[tenant]/inventory/actions.ts`
  - `postStockMoveAction()`
  - `getInventoryValuationAction()`

**B03 Master Data:**
- `apps/web/src/app/[tenant]/master-data/actions.ts`
  - `createAccountAction()`
  - `createFiscalYearAction()`
  - `openNextPeriodAction()`

#### 3. Type-Safe Action Results
```typescript
// apps/web/src/types/action.ts
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }
  | { success: false; fieldErrors: Record<string, string[]> };
```

### Exit Criteria
- [ ] All 11 services exposed via Server Actions
- [ ] Auth check on every action
- [ ] Zod validation on all inputs
- [ ] Type-safe return types
- [ ] Manual test: Call action → Service executes → DB updates

---

## Batch 4: Basic UI (USABILITY LAYER) 🟢

**Duration:** 5-7 days
**Priority:** MEDIUM (visual confirmation)
**Complexity:** Medium

### Deliverables

#### 1. CRUD Interface Pattern (Cobalt ■)

**Create Journal Entry Form:**
```tsx
// apps/web/src/app/[tenant]/accounting/journal/new/page.tsx
import { JournalEntryForm } from "@/components/accounting/journal-entry-form";
import { postJournalAction } from "../actions";

export default function NewJournalEntryPage() {
  return (
    <ApplicationShell01>
      <PageHeader01
        title="New Journal Entry"
        subtitle="Record accounting transaction"
      />
      <JournalEntryForm action={postJournalAction} />
    </ApplicationShell01>
  );
}
```

**Journal Entry Form Component:**
```tsx
// apps/web/src/components/accounting/journal-entry-form.tsx
"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

export function JournalEntryForm({ action }) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className={cn("space-y-6")}>
      <div>
        <Label htmlFor="documentNumber">Document Number</Label>
        <Input
          id="documentNumber"
          name="documentNumber"
          required
          className={cn(
            "transition-all duration-300",
            state?.fieldErrors?.documentNumber && "border-destructive"
          )}
        />
        {state?.fieldErrors?.documentNumber && (
          <p className={cn("text-sm text-destructive")}>
            {state.fieldErrors.documentNumber[0]}
          </p>
        )}
      </div>

      <JournalLines />

      <Button
        type="submit"
        disabled={isPending}
        className={cn("transition-all duration-300")}
      >
        {isPending ? "Posting..." : "Post Journal Entry"}
      </Button>

      {state?.success === false && state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success === true && (
        <Alert variant="success">
          <AlertDescription>Journal entry posted successfully!</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
```

#### 2. List Views (Quorum ◇)

**Trial Balance Table:**
```tsx
// apps/web/src/app/[tenant]/accounting/trial-balance/page.tsx
import { DataFortress } from "@workspace/design-system/blocks";
import { calculateTrialBalanceAction } from "../actions";

export default async function TrialBalancePage({ params }) {
  const trialBalance = await calculateTrialBalanceAction(params.tenant);

  return (
    <ApplicationShell01>
      <PageHeader01 title="Trial Balance" />
      <DataFortress
        data={trialBalance.accounts}
        columns={[
          { key: "accountCode", label: "Account" },
          { key: "accountName", label: "Name" },
          { key: "debit", label: "Debit", align: "right" },
          { key: "credit", label: "Credit", align: "right" },
        ]}
        searchable
        exportable
      />
    </ApplicationShell01>
  );
}
```

#### 3. Pages to Create (Priority Order)

**Phase 1 (Critical Path):**
1. **Trial Balance** - Proof books balance
2. **Journal Entry Form** - Core posting interface
3. **Invoice Form** - Sales cycle entry point
4. **Bill Form** - Purchase cycle entry point
5. **Chart of Accounts List** - Master data foundation

**Phase 2 (Secondary):**
6. **AR Aging Report** - Customer balances
7. **AP Aging Report** - Supplier balances
8. **Inventory Valuation Report** - Stock values
9. **Payment Forms** - AR/AP reconciliation
10. **Stock Move Form** - Inventory transactions

### Exit Criteria
- [ ] Basic CRUD for all critical entities
- [ ] Forms use workspace design system components
- [ ] Lists use DataFortress block
- [ ] All forms have validation feedback
- [ ] Manual test: Full business cycle via UI

---

## Batch 5: Integration Testing (CONFIDENCE LAYER) 🟢

**Duration:** 3-4 days
**Priority:** MEDIUM (proves end-to-end flows)
**Complexity:** Medium

### Deliverables

#### 1. End-to-End Test Flows

**Sales Cycle Test:**
```typescript
// packages/db/src/services/__tests__/flows/sales-cycle.test.ts
import { describe, it, expect } from "vitest";

describe("Sales Cycle (End-to-End)", () => {
  it("should complete: Invoice → AR → Payment → Reconciliation", async () => {
    const db = await getTestDatabase();
    const context = createTestContext();

    // 1. Post invoice
    const invoiceResult = await InvoiceService.postInvoiceToGL(
      createTestInvoice({ amount: "1000.00" }),
      db,
      context
    );
    expect(invoiceResult.success).toBe(true);

    // 2. Verify AR subledger entry created
    const arEntry = await db
      .select()
      .from(arSubledger)
      .where(eq(arSubledger.invoiceId, invoiceResult.invoice!.id));
    expect(arEntry).toHaveLength(1);
    expect(arEntry[0].outstandingAmount).toBe("1000.00");

    // 3. Post payment
    const paymentResult = await PaymentService.postPaymentToGL(
      createTestPayment({
        allocations: [
          { invoiceId: invoiceResult.invoice!.id, amount: "1000.00" },
        ],
      }),
      db,
      context
    );
    expect(paymentResult.success).toBe(true);

    // 4. Verify AR reconciliation
    const updatedArEntry = await db
      .select()
      .from(arSubledger)
      .where(eq(arSubledger.invoiceId, invoiceResult.invoice!.id));
    expect(updatedArEntry[0].outstandingAmount).toBe("0.00");
    expect(updatedArEntry[0].isReconciled).toBe(true);

    // 5. Verify trial balance still balances
    const trialBalance = await TrialBalanceService.calculateTrialBalance(
      db,
      { tenantId: context.tenantId, periodId: context.periodId }
    );
    expect(trialBalance.isBalanced).toBe(true);
  });
});
```

**Purchase Cycle Test:**
```typescript
describe("Purchase Cycle (End-to-End)", () => {
  it("should complete: Receipt → GRN → Bill → AP → Payment → Reconciliation", async () => {
    // Similar structure to sales cycle
    // 1. Post receipt → creates stock move + GRN accrual
    // 2. Post bill → creates AP + reverses GRN accrual
    // 3. Post payment → reconciles AP
    // 4. Verify trial balance
  });
});
```

**Month-End Close Test:**
```typescript
describe("Month-End Close (End-to-End)", () => {
  it("should close period with validation checks", async () => {
    // 1. Post multiple journals
    // 2. Validate period close (should warn on unreconciled)
    // 3. Close period (with override)
    // 4. Verify period locked
    // 5. Generate reports
  });
});
```

#### 2. Test Coverage

| Flow | Complexity | Priority | Duration |
|------|-----------|----------|----------|
| Sales Cycle | Medium | 🔴 Critical | 1 day |
| Purchase Cycle | High | 🔴 Critical | 2 days |
| Month-End Close | Medium | 🟡 High | 1 day |
| Inventory Valuation | Medium | 🟡 High | 1 day |

### Exit Criteria
- [ ] Sales cycle test passes
- [ ] Purchase cycle test passes
- [ ] Month-End close test passes
- [ ] All tests automated in CI/CD
- [ ] Test runs on every PR

---

## Recommended Execution Order

### Week 1: Database Foundation
```
Mon-Tue:  Drizzle table definitions + migrations
Wed-Thu:  Query layer implementation
Fri:      Connect services to queries + manual testing
```

### Week 2: Testing Infrastructure
```
Mon-Tue:  Test setup + GL Posting Engine tests
Wed:      Trial Balance + Subledger tests
Thu:      Valuation Engine tests
Fri:      Remaining service tests
```

### Week 3: API Exposure
```
Mon:      Server Actions for B07 Accounting
Tue:      Server Actions for B04 Sales + B05 Purchase
Wed:      Server Actions for B06 Inventory + B03 Master Data
Thu:      Manual API testing
Fri:      Error handling + validation refinement
```

### Week 4: UI Development
```
Mon-Tue:  Trial Balance + Journal Entry Form
Wed:      Invoice Form + Bill Form
Thu:      Chart of Accounts List + Fiscal Period Management
Fri:      UI polish + manual testing
```

### Week 5: Integration Testing
```
Mon:      Sales cycle test
Tue:      Purchase cycle test
Wed:      Month-End close test
Thu:      CI/CD integration
Fri:      Documentation + demo preparation
```

---

## Success Metrics

### Phase 1.5 Completion Criteria

| Metric | Target | How to Verify |
|--------|--------|---------------|
| **DB Integration** | 100% | All services persist to DB |
| **Unit Tests** | >80% coverage | `pnpm test --coverage` |
| **API Endpoints** | 11 actions | All services exposed |
| **UI Pages** | 5 critical pages | Manual walkthrough |
| **Integration Tests** | 3 flows passing | CI/CD green |

### Demo-Ready Scenarios

After Phase 1.5, you should be able to:

1. **Sales Cycle Demo:**
   - Create invoice via UI
   - See GL posting in database
   - See AR subledger entry
   - Post payment
   - See reconciliation
   - View trial balance (balanced)

2. **Purchase Cycle Demo:**
   - Create GRN via UI
   - See stock move + inventory posting
   - Create bill (3-way match validation)
   - Post payment
   - View AP aging report

3. **Month-End Demo:**
   - View trial balance
   - Generate Balance Sheet + P&L
   - Close period (with Danger Zone override)
   - Attempt posting to closed period (blocked)

---

## Why This Order?

### 1. Database First (Critical Path)
- **Blocks:** Everything
- **Risk:** High (without DB, services are useless)
- **Value:** Unlocks all other work

### 2. Unit Tests Second (Quality Gate)
- **Blocks:** Confidence in deployment
- **Risk:** Medium (without tests, bugs slip through)
- **Value:** Proves logic correctness

### 3. API Third (Exposure)
- **Blocks:** UI development
- **Risk:** Low (thin wrapper over services)
- **Value:** Makes services callable

### 4. UI Fourth (Visibility)
- **Blocks:** User adoption
- **Risk:** Low (can iterate quickly)
- **Value:** Visual confirmation + usability

### 5. Integration Tests Last (Confidence)
- **Blocks:** Production deployment
- **Risk:** Medium (without E2E tests, regression risk)
- **Value:** Proves complete flows work

---

## What Comes AFTER Phase 1.5?

Once Phase 1 is fully activated (DB + Tests + API + UI), THEN proceed to:

### Phase 2: Governance (B8 Controls)
- RBAC implementation
- Approval workflows
- Danger Zone audit log
- Policy engine
- SoD violation detection

### Phase 3: Differentiation (B9 Reconciliation)
- Subledger ↔ GL reconciliation
- Stock ↔ Valuation reconciliation
- Invoice ↔ Payment matching
- Discrepancy queue

### Phase 4: Premium Experience (B10-B12)
- Quorum + Cobalt UX
- AFANDA platform
- Intelligence layer

---

## Decision Point

### Option A: Follow Recommendation (Phase 1.5)
**Outcome:** Functional ERP with proven foundation
**Timeline:** 5 weeks
**Risk:** Low (completes Phase 1 fully)

### Option B: Jump to Phase 2 (B8 Controls)
**Outcome:** More features, but untested foundation
**Timeline:** Uncertain
**Risk:** High (building on unproven services)

---

## Recommendation

✅ **PROCEED WITH PHASE 1.5**

**Rationale:**
- Services exist but cannot execute
- Need to prove Phase 1 works before Phase 2
- 5 weeks to full activation is reasonable
- Delivers demo-ready ERP at end
- Follows "ship early, ship often" principle

**Start with:** Batch 1 (Database Integration)

---

## Next Steps

If you agree with this plan, I can:

1. **Start Batch 1 immediately:**
   - Create Drizzle table definitions
   - Build query layer
   - Connect services to DB

2. **Create detailed task breakdown:**
   - Daily tickets for 5-week plan
   - Acceptance criteria for each batch
   - Testing checklist

3. **Alternative:** If you prefer to jump to B8 Controls, I can pivot, but recommend against it.

**Your call. What do you want to do?**
