# B09 — Reconciliation Engine
## Matching, Exception Handling & Truth Verification

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |                          |                           |                             |                           |                                 |           |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: | :-------------------------: | :-----------------------: | :-----------------------------: | :-------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) | [B07](./B07-ACCOUNTING.md)  | [B08](./B08-CONTROLS.md)  | [B08-01](./B08-01-WORKFLOW.md)  | **[B09]** |
|            Posting            |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         |         Accounting          |         Controls          |            Workflow             |   Recon   |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §P8 (Reconciliation as Design Goal), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B9
>
> **Tag:** `RECONCILIATION` | `MATCHING` | `EXCEPTIONS` | `PHASE-B9`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B09 Reconciliation schemas follow the **Single Source of Truth** pattern:

| Component                | Source                                                  |
| ------------------------ | ------------------------------------------------------- |
| Reconciliation types     | `@axis/registry/schemas/reconciliation/constants.ts`    |
| Reconciliation Job       | `@axis/registry/schemas/reconciliation/job.ts`          |
| Match Result             | `@axis/registry/schemas/reconciliation/match.ts`        |
| Exception schema         | `@axis/registry/schemas/reconciliation/exception.ts`    |
| Bank Statement           | `@axis/registry/schemas/reconciliation/bank.ts`         |
| Reconciliation events    | `@axis/registry/schemas/events/reconciliation.ts`       |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"If two numbers should be equal but aren't, that's a problem to surface, not hide."*

From A01 §P8:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE RECONCILIATION PRINCIPLE                             │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     RECONCILIATION IS NOT A FEATURE. IT'S A DESIGN GOAL.          ║    │
│    ║                                                                   ║    │
│    ║     Every transaction that creates two records must:              ║    │
│    ║     1. Link them at creation time                                 ║    │
│    ║     2. Provide automatic matching                                 ║    │
│    ║     3. Surface exceptions immediately                             ║    │
│    ║     4. Track resolution to closure                                ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    If your ERP requires manual reconciliation spreadsheets,                  │
│    you have built an application, not an ERP.                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without reconciliation, errors accumulate silently
- Without reconciliation, audits become archaeology
- Without reconciliation, financial statements are unreliable

---

## 2) Reconciliation Types

### 2.1 Core Reconciliation Domains

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECONCILIATION DOMAINS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SUBLEDGER ↔ GL                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  AR Subledger Balance = AR Control Account (GL)                          ││
│  │  AP Subledger Balance = AP Control Account (GL)                          ││
│  │  Inventory Subledger  = Inventory Control Account (GL)                   ││
│  │                                                                          ││
│  │  Frequency: Daily or real-time                                           ││
│  │  Tolerance: Zero (must match exactly)                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  2. BANK ↔ GL                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Bank Statement Balance = Bank Account (GL)                              ││
│  │                                                                          ││
│  │  Process: Import statement → Auto-match → Review exceptions              ││
│  │  Frequency: Daily                                                        ││
│  │  Tolerance: Zero after adjustments                                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  3. INTER-COMPANY                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Entity A's IC Receivable = Entity B's IC Payable                        ││
│  │                                                                          ││
│  │  Challenge: Timing differences, FX rates                                 ││
│  │  Frequency: Monthly                                                      ││
│  │  Tolerance: Configurable (FX rounding)                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  4. THREE-WAY MATCH (PURCHASE)                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PO Quantity/Price ↔ Receipt Quantity ↔ Bill Quantity/Price              ││
│  │                                                                          ││
│  │  Process: Auto-match on receipt/bill post → Flag exceptions              ││
│  │  Frequency: Real-time                                                    ││
│  │  Tolerance: Configurable (price variance %, qty variance)                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  5. ORDER ↔ FULFILLMENT (SALES)                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  SO Quantity ↔ Delivered Quantity ↔ Invoiced Quantity                    ││
│  │                                                                          ││
│  │  Track: Open orders, partial deliveries, over/under invoicing            ││
│  │  Frequency: Real-time                                                    ││
│  │  Tolerance: Zero (quantity match)                                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  6. INVENTORY ↔ PHYSICAL                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Book Stock = Physical Count                                             ││
│  │                                                                          ││
│  │  Process: Physical count → Variance report → Adjustment approval         ││
│  │  Frequency: Periodic (cycle count, annual)                               ││
│  │  Tolerance: Configurable (value threshold, % variance)                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  7. INVOICE ↔ PAYMENT                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Invoice Amount = Sum of Applied Payments + Remaining Balance            ││
│  │                                                                          ││
│  │  Track: Open invoices, partial payments, overpayments                    ││
│  │  Frequency: Real-time                                                    ││
│  │  Tolerance: Zero                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Reconciliation Constants

```typescript
// packages/axis-registry/src/schemas/reconciliation/constants.ts

export const RECONCILIATION_TYPE = [
  "subledger_gl",       // AR/AP/Inventory subledger vs GL
  "bank_gl",            // Bank statement vs GL
  "intercompany",       // IC receivable vs IC payable
  "three_way_match",    // PO vs Receipt vs Bill
  "order_fulfillment",  // SO vs Delivery vs Invoice
  "inventory_physical", // Book stock vs Physical count
  "invoice_payment",    // Invoice vs Payments applied
  "custom",             // User-defined reconciliation
] as const;

export const RECONCILIATION_STATUS = [
  "pending",
  "in_progress",
  "matched",
  "exception",
  "resolved",
  "cancelled",
] as const;

export const MATCH_STATUS = [
  "auto_matched",     // System matched automatically
  "manual_matched",   // User matched manually
  "partial_match",    // Partial match (amount differs)
  "no_match",         // No matching record found
  "multiple_match",   // Multiple potential matches
] as const;

export const EXCEPTION_STATUS = [
  "open",
  "investigating",
  "pending_approval",
  "resolved",
  "written_off",
  "escalated",
] as const;

export const EXCEPTION_TYPE = [
  "missing_source",     // Source exists, no target
  "missing_target",     // Target exists, no source
  "amount_mismatch",    // Records match but amounts differ
  "date_mismatch",      // Records match but dates differ
  "duplicate",          // Potential duplicate
  "timing_difference",  // Will resolve in future period
  "fx_variance",        // Foreign exchange difference
  "rounding",           // Rounding difference within tolerance
  "other",              // Other exception
] as const;
```

---

## 3) Reconciliation Job

### 3.1 Job Schema

```typescript
// packages/axis-registry/src/schemas/reconciliation/job.ts

import { z } from "zod";

export const reconciliationJobSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  jobNumber: z.string().max(50),
  name: z.string().max(255),
  description: z.string().max(1000).optional(),
  
  // Type
  reconciliationType: z.enum(RECONCILIATION_TYPE),
  
  // Scope
  fiscalPeriodId: z.string().uuid().optional(),
  asOfDate: z.string().datetime(),
  
  // Source and Target
  sourceType: z.string(), // e.g., "ar_subledger", "bank_statement"
  sourceId: z.string().uuid().optional(), // Specific source (e.g., bank account)
  targetType: z.string(), // e.g., "gl_account"
  targetId: z.string().uuid().optional(), // Specific target
  
  // Status
  status: z.enum(RECONCILIATION_STATUS).default("pending"),
  
  // Results summary
  totalSourceRecords: z.number().int().default(0),
  totalTargetRecords: z.number().int().default(0),
  matchedRecords: z.number().int().default(0),
  unmatchedRecords: z.number().int().default(0),
  exceptionCount: z.number().int().default(0),
  
  // Amounts
  sourceTotal: z.string().default("0"),
  targetTotal: z.string().default("0"),
  varianceAmount: z.string().default("0"),
  
  // Tolerance
  toleranceAmount: z.string().default("0"),
  tolerancePercent: z.number().default(0),
  
  // Execution
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  
  // Approval
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().datetime().optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type ReconciliationJob = z.infer<typeof reconciliationJobSchema>;
```

### 3.2 Job Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECONCILIATION JOB LIFECYCLE                              │
│                                                                              │
│                           ┌──────────────┐                                   │
│                           │   PENDING    │                                   │
│                           └──────┬───────┘                                   │
│                                  │ Start                                     │
│                                  ▼                                           │
│                           ┌──────────────┐                                   │
│                           │ IN_PROGRESS  │                                   │
│                           └──────┬───────┘                                   │
│                                  │                                           │
│              ┌───────────────────┼───────────────────┐                       │
│              │ All matched       │ Some unmatched    │                       │
│              ▼                   ▼                   ▼                       │
│     ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│     │    MATCHED     │  │   EXCEPTION    │  │   CANCELLED    │              │
│     │  (Complete)    │  │  (Has issues)  │  │  (Aborted)     │              │
│     └────────────────┘  └────────┬───────┘  └────────────────┘              │
│                                  │                                           │
│                                  │ Resolve all                               │
│                                  ▼                                           │
│                         ┌────────────────┐                                   │
│                         │    RESOLVED    │                                   │
│                         │  (Complete)    │                                   │
│                         └────────────────┘                                   │
│                                                                              │
│  PROCESS:                                                                    │
│  1. Create job with scope (date range, accounts)                             │
│  2. Load source records                                                      │
│  3. Load target records                                                      │
│  4. Run matching algorithm                                                   │
│  5. Create match records and exceptions                                      │
│  6. Review and resolve exceptions                                            │
│  7. Approve and close job                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4) Matching Engine

### 4.1 Match Record Schema

```typescript
// packages/axis-registry/src/schemas/reconciliation/match.ts

export const matchRecordSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Match status
  matchStatus: z.enum(MATCH_STATUS),
  
  // Source record
  sourceType: z.string(),
  sourceId: z.string().uuid(),
  sourceReference: z.string().optional(),
  sourceDate: z.string().datetime(),
  sourceAmount: z.string(),
  sourceCurrency: z.string().length(3),
  
  // Target record (if matched)
  targetType: z.string().optional(),
  targetId: z.string().uuid().optional(),
  targetReference: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  targetAmount: z.string().optional(),
  targetCurrency: z.string().length(3).optional(),
  
  // Variance
  amountVariance: z.string().default("0"),
  dateVarianceDays: z.number().int().default(0),
  
  // Match confidence (for auto-match)
  matchScore: z.number().min(0).max(100).optional(),
  matchReason: z.string().max(500).optional(),
  
  // Manual match
  matchedBy: z.string().uuid().optional(),
  matchedAt: z.string().datetime().optional(),
  matchNotes: z.string().max(1000).optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MatchRecord = z.infer<typeof matchRecordSchema>;
```

### 4.2 Matching Algorithms

```typescript
// packages/db/src/queries/reconciliation/matching.ts

export interface MatchingRule {
  field: string;
  matchType: "exact" | "fuzzy" | "range" | "contains";
  weight: number; // 0-100, contribution to match score
  required: boolean;
  tolerance?: number; // For range matching
}

/**
 * Default matching rules by reconciliation type
 */
export const DEFAULT_MATCHING_RULES: Record<ReconciliationType, MatchingRule[]> = {
  bank_gl: [
    { field: "amount", matchType: "exact", weight: 40, required: true },
    { field: "date", matchType: "range", weight: 30, required: false, tolerance: 3 },
    { field: "reference", matchType: "fuzzy", weight: 30, required: false },
  ],
  subledger_gl: [
    { field: "amount", matchType: "exact", weight: 50, required: true },
    { field: "date", matchType: "exact", weight: 25, required: true },
    { field: "reference", matchType: "exact", weight: 25, required: false },
  ],
  three_way_match: [
    { field: "poNumber", matchType: "exact", weight: 30, required: true },
    { field: "itemId", matchType: "exact", weight: 30, required: true },
    { field: "quantity", matchType: "range", weight: 20, required: true, tolerance: 0.01 },
    { field: "unitPrice", matchType: "range", weight: 20, required: false, tolerance: 0.05 },
  ],
  // ... other types
};

/**
 * Run matching algorithm for a reconciliation job
 */
export async function runMatchingAlgorithm(
  db: Database,
  job: ReconciliationJob
): Promise<{
  matched: number;
  unmatched: number;
  exceptions: number;
}> {
  const rules = DEFAULT_MATCHING_RULES[job.reconciliationType] || [];
  
  // Load source and target records
  const sourceRecords = await loadSourceRecords(db, job);
  const targetRecords = await loadTargetRecords(db, job);
  
  let matched = 0;
  let unmatched = 0;
  let exceptions = 0;
  
  // Create index of target records for faster matching
  const targetIndex = createTargetIndex(targetRecords, rules);
  const matchedTargets = new Set<string>();
  
  for (const source of sourceRecords) {
    // Find potential matches
    const candidates = findCandidates(source, targetIndex, rules);
    
    if (candidates.length === 0) {
      // No match found
      await createMatchRecord(db, job, source, null, "no_match");
      await createException(db, job, source, null, "missing_target");
      unmatched++;
      exceptions++;
      
    } else if (candidates.length === 1 && candidates[0].score >= 80) {
      // Single high-confidence match
      const target = candidates[0].record;
      
      // Check for variance
      const variance = calculateVariance(source, target);
      
      if (isWithinTolerance(variance, job)) {
        await createMatchRecord(db, job, source, target, "auto_matched", candidates[0].score);
        matchedTargets.add(target.id);
        matched++;
      } else {
        await createMatchRecord(db, job, source, target, "partial_match", candidates[0].score);
        await createException(db, job, source, target, "amount_mismatch", variance);
        matchedTargets.add(target.id);
        exceptions++;
      }
      
    } else {
      // Multiple candidates or low confidence
      await createMatchRecord(db, job, source, null, "multiple_match");
      await createException(db, job, source, null, "multiple_match", { candidates });
      unmatched++;
      exceptions++;
    }
  }
  
  // Find unmatched targets (orphans)
  for (const target of targetRecords) {
    if (!matchedTargets.has(target.id)) {
      await createMatchRecord(db, job, null, target, "no_match");
      await createException(db, job, null, target, "missing_source");
      exceptions++;
    }
  }
  
  // Update job summary
  await db.update(reconciliationJobs)
    .set({
      matchedRecords: matched,
      unmatchedRecords: unmatched,
      exceptionCount: exceptions,
      status: exceptions > 0 ? "exception" : "matched",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(reconciliationJobs.id, job.id));
  
  return { matched, unmatched, exceptions };
}

/**
 * Calculate match score based on rules
 */
function calculateMatchScore(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  rules: MatchingRule[]
): number {
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const rule of rules) {
    const sourceValue = source[rule.field];
    const targetValue = target[rule.field];
    
    let fieldScore = 0;
    
    switch (rule.matchType) {
      case "exact":
        fieldScore = sourceValue === targetValue ? 100 : 0;
        break;
        
      case "fuzzy":
        fieldScore = calculateFuzzyScore(String(sourceValue), String(targetValue));
        break;
        
      case "range":
        const diff = Math.abs(Number(sourceValue) - Number(targetValue));
        const tolerance = rule.tolerance || 0;
        fieldScore = diff <= tolerance ? 100 : Math.max(0, 100 - (diff / tolerance) * 100);
        break;
        
      case "contains":
        fieldScore = String(targetValue).includes(String(sourceValue)) ? 100 : 0;
        break;
    }
    
    // Check if required field fails
    if (rule.required && fieldScore === 0) {
      return 0; // Immediate failure
    }
    
    totalScore += fieldScore * rule.weight;
    totalWeight += rule.weight;
  }
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}
```

---

## 5) Exception Handling

### 5.1 Exception Schema

```typescript
// packages/axis-registry/src/schemas/reconciliation/exception.ts

export const reconciliationExceptionSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  matchRecordId: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  
  // Classification
  exceptionType: z.enum(EXCEPTION_TYPE),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  
  // Status
  status: z.enum(EXCEPTION_STATUS).default("open"),
  
  // Details
  sourceType: z.string().optional(),
  sourceId: z.string().uuid().optional(),
  sourceReference: z.string().optional(),
  sourceAmount: z.string().optional(),
  
  targetType: z.string().optional(),
  targetId: z.string().uuid().optional(),
  targetReference: z.string().optional(),
  targetAmount: z.string().optional(),
  
  // Variance
  varianceAmount: z.string().optional(),
  variancePercent: z.number().optional(),
  
  // Description
  description: z.string().max(1000),
  suggestedAction: z.string().max(500).optional(),
  
  // Investigation
  assignedTo: z.string().uuid().optional(),
  investigationNotes: z.string().max(2000).optional(),
  
  // Resolution
  resolutionType: z.enum([
    "matched_manually",
    "adjusted",
    "written_off",
    "timing_resolved",
    "duplicate_removed",
    "other",
  ]).optional(),
  resolutionNotes: z.string().max(1000).optional(),
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  
  // For adjustments
  adjustmentJournalId: z.string().uuid().optional(),
  
  // Approval (for write-offs)
  approvalRequired: z.boolean().default(false),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ReconciliationException = z.infer<typeof reconciliationExceptionSchema>;
```

### 5.2 Exception Resolution

```typescript
// packages/db/src/queries/reconciliation/exception.ts

/**
 * Resolve an exception by manual matching
 */
export async function resolveByManualMatch(
  db: Database,
  exceptionId: string,
  targetId: string,
  userId: string,
  notes?: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const exception = await tx.query.reconciliationExceptions.findFirst({
      where: eq(reconciliationExceptions.id, exceptionId),
    });
    
    if (!exception) {
      throw new Error("Exception not found");
    }
    
    // Update match record
    if (exception.matchRecordId) {
      await tx.update(matchRecords)
        .set({
          targetId,
          matchStatus: "manual_matched",
          matchedBy: userId,
          matchedAt: new Date().toISOString(),
          matchNotes: notes,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(matchRecords.id, exception.matchRecordId));
    }
    
    // Close exception
    await tx.update(reconciliationExceptions)
      .set({
        status: "resolved",
        resolutionType: "matched_manually",
        resolutionNotes: notes,
        resolvedBy: userId,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reconciliationExceptions.id, exceptionId));
    
    // Update job counts
    await updateJobExceptionCount(tx, exception.jobId);
  });
}

/**
 * Resolve an exception by creating adjustment
 */
export async function resolveByAdjustment(
  db: Database,
  exceptionId: string,
  adjustment: {
    accountId: string;
    amount: string;
    description: string;
  },
  userId: string
): Promise<string> {
  return db.transaction(async (tx) => {
    const exception = await tx.query.reconciliationExceptions.findFirst({
      where: eq(reconciliationExceptions.id, exceptionId),
      with: { job: true },
    });
    
    // Create adjustment journal entry
    const journal = await createJournalEntry(tx, {
      tenantId: exception.tenantId,
      journalType: "adjustment",
      description: `Reconciliation adjustment: ${adjustment.description}`,
      reference: `RECON-${exception.job.jobNumber}`,
      lines: [
        {
          accountId: adjustment.accountId,
          debit: parseFloat(adjustment.amount) > 0 ? adjustment.amount : "0",
          credit: parseFloat(adjustment.amount) < 0 ? Math.abs(parseFloat(adjustment.amount)).toString() : "0",
          description: adjustment.description,
        },
        {
          accountId: getReconciliationVarianceAccountId(),
          debit: parseFloat(adjustment.amount) < 0 ? Math.abs(parseFloat(adjustment.amount)).toString() : "0",
          credit: parseFloat(adjustment.amount) > 0 ? adjustment.amount : "0",
          description: adjustment.description,
        },
      ],
    });
    
    // Post the journal
    await postJournalEntry(tx, journal.id, userId);
    
    // Close exception
    await tx.update(reconciliationExceptions)
      .set({
        status: "resolved",
        resolutionType: "adjusted",
        resolutionNotes: adjustment.description,
        adjustmentJournalId: journal.id,
        resolvedBy: userId,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reconciliationExceptions.id, exceptionId));
    
    return journal.id;
  });
}

/**
 * Resolve an exception by write-off (requires approval)
 */
export async function resolveByWriteOff(
  db: Database,
  exceptionId: string,
  writeOff: {
    amount: string;
    reason: string;
    accountId: string;
  },
  userId: string
): Promise<void> {
  const exception = await db.query.reconciliationExceptions.findFirst({
    where: eq(reconciliationExceptions.id, exceptionId),
  });
  
  // Check write-off threshold for approval
  const threshold = await getWriteOffThreshold(db, exception.tenantId);
  const requiresApproval = Math.abs(parseFloat(writeOff.amount)) > parseFloat(threshold);
  
  if (requiresApproval) {
    // Request approval via workflow
    await db.update(reconciliationExceptions)
      .set({
        status: "pending_approval",
        approvalRequired: true,
        resolutionType: "written_off",
        resolutionNotes: writeOff.reason,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reconciliationExceptions.id, exceptionId));
    
    // Start approval workflow
    await startWorkflow(db, exception.tenantId, userId, {
      type: "reconciliation_exception",
      id: exceptionId,
      action: "write_off",
      data: { amount: writeOff.amount, reason: writeOff.reason },
    });
    
  } else {
    // Auto-approve small write-offs
    await executeWriteOff(db, exceptionId, writeOff, userId);
  }
}
```

---

## 6) Bank Reconciliation

### 6.1 Bank Statement Schema

```typescript
// packages/axis-registry/src/schemas/reconciliation/bank.ts

export const BANK_TRANSACTION_TYPE = [
  "credit",     // Money in
  "debit",      // Money out
  "transfer",   // Internal transfer
  "fee",        // Bank fee
  "interest",   // Interest earned
  "reversal",   // Transaction reversal
] as const;

export const bankStatementSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Bank account
  bankAccountId: z.string().uuid(),
  bankAccountName: z.string(),
  
  // Statement info
  statementNumber: z.string().max(50),
  statementDate: z.string().datetime(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  
  // Balances
  openingBalance: z.string(),
  closingBalance: z.string(),
  
  // Import info
  importedAt: z.string().datetime(),
  importedBy: z.string().uuid(),
  importSource: z.enum(["manual", "file", "api"]).default("manual"),
  importFileName: z.string().optional(),
  
  // Reconciliation
  reconciliationJobId: z.string().uuid().optional(),
  isReconciled: z.boolean().default(false),
  reconciledAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
});

export const bankStatementLineSchema = z.object({
  id: z.string().uuid(),
  statementId: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Transaction details
  transactionDate: z.string().datetime(),
  valueDate: z.string().datetime().optional(),
  
  // Type
  transactionType: z.enum(BANK_TRANSACTION_TYPE),
  
  // Amounts
  debitAmount: z.string().default("0"),
  creditAmount: z.string().default("0"),
  runningBalance: z.string().optional(),
  
  // Reference
  reference: z.string().max(100).optional(),
  description: z.string().max(500),
  checkNumber: z.string().max(50).optional(),
  
  // Counterparty
  counterpartyName: z.string().max(255).optional(),
  counterpartyAccount: z.string().max(50).optional(),
  
  // Matching
  isReconciled: z.boolean().default(false),
  matchedToType: z.string().optional(),
  matchedToId: z.string().uuid().optional(),
  matchedAt: z.string().datetime().optional(),
  matchedBy: z.string().uuid().optional(),
  
  createdAt: z.string().datetime(),
});

export type BankStatement = z.infer<typeof bankStatementSchema>;
export type BankStatementLine = z.infer<typeof bankStatementLineSchema>;
```

### 6.2 Bank Reconciliation Process

```typescript
// packages/db/src/queries/reconciliation/bank.ts

/**
 * Import bank statement and create reconciliation job
 */
export async function importBankStatement(
  db: Database,
  tenantId: string,
  bankAccountId: string,
  data: {
    lines: Array<{
      transactionDate: Date;
      type: BankTransactionType;
      amount: string;
      reference?: string;
      description: string;
    }>;
    openingBalance: string;
    closingBalance: string;
    periodStart: Date;
    periodEnd: Date;
  },
  userId: string
): Promise<{ statement: BankStatement; job: ReconciliationJob }> {
  return db.transaction(async (tx) => {
    // Create statement
    const statement = await tx.insert(bankStatements).values({
      id: generateUUID(),
      tenantId,
      bankAccountId,
      statementNumber: await generateStatementNumber(tx, tenantId, bankAccountId),
      statementDate: new Date().toISOString(),
      periodStart: data.periodStart.toISOString(),
      periodEnd: data.periodEnd.toISOString(),
      openingBalance: data.openingBalance,
      closingBalance: data.closingBalance,
      importedAt: new Date().toISOString(),
      importedBy: userId,
      importSource: "file",
      createdAt: new Date().toISOString(),
    }).returning();
    
    // Create statement lines
    for (const line of data.lines) {
      await tx.insert(bankStatementLines).values({
        id: generateUUID(),
        statementId: statement[0].id,
        tenantId,
        transactionDate: line.transactionDate.toISOString(),
        transactionType: line.type,
        debitAmount: line.type === "debit" || line.type === "fee" ? line.amount : "0",
        creditAmount: line.type === "credit" || line.type === "interest" ? line.amount : "0",
        reference: line.reference,
        description: line.description,
        isReconciled: false,
        createdAt: new Date().toISOString(),
      });
    }
    
    // Create reconciliation job
    const job = await tx.insert(reconciliationJobs).values({
      id: generateUUID(),
      tenantId,
      jobNumber: await generateJobNumber(tx, tenantId),
      name: `Bank Reconciliation - ${statement[0].statementNumber}`,
      reconciliationType: "bank_gl",
      asOfDate: data.periodEnd.toISOString(),
      sourceType: "bank_statement",
      sourceId: statement[0].id,
      targetType: "gl_account",
      targetId: bankAccountId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
    }).returning();
    
    // Link statement to job
    await tx.update(bankStatements)
      .set({ reconciliationJobId: job[0].id })
      .where(eq(bankStatements.id, statement[0].id));
    
    return { statement: statement[0], job: job[0] };
  });
}

/**
 * Run bank reconciliation
 */
export async function runBankReconciliation(
  db: Database,
  jobId: string
): Promise<BankReconciliationResult> {
  const job = await db.query.reconciliationJobs.findFirst({
    where: eq(reconciliationJobs.id, jobId),
    with: { statement: { with: { lines: true } } },
  });
  
  // Get GL transactions for the bank account in the same period
  const glTransactions = await getGLTransactions(db, {
    tenantId: job.tenantId,
    accountId: job.targetId,
    fromDate: job.statement.periodStart,
    toDate: job.statement.periodEnd,
  });
  
  // Run matching
  const result = await runMatchingAlgorithm(db, job);
  
  // Calculate reconciliation summary
  const summary = {
    statementBalance: job.statement.closingBalance,
    glBalance: calculateGLBalance(glTransactions),
    adjustedGLBalance: "0",
    difference: "0",
    outstandingDeposits: [] as MatchRecord[],
    outstandingChecks: [] as MatchRecord[],
  };
  
  // Find outstanding items (in GL but not on statement)
  summary.outstandingDeposits = await findOutstandingDeposits(db, jobId);
  summary.outstandingChecks = await findOutstandingChecks(db, jobId);
  
  // Calculate adjusted balance
  const depositsTotal = summary.outstandingDeposits.reduce(
    (sum, d) => addDecimals(sum, d.sourceAmount), "0"
  );
  const checksTotal = summary.outstandingChecks.reduce(
    (sum, c) => addDecimals(sum, c.sourceAmount), "0"
  );
  
  summary.adjustedGLBalance = subtractDecimals(
    addDecimals(summary.glBalance, depositsTotal),
    checksTotal
  );
  
  summary.difference = subtractDecimals(
    summary.statementBalance,
    summary.adjustedGLBalance
  );
  
  return {
    ...result,
    summary,
  };
}
```

---

## 7) Subledger Reconciliation

### 7.1 AR/AP to GL Reconciliation

```typescript
// packages/db/src/queries/reconciliation/subledger.ts

/**
 * Reconcile AR subledger to GL control account
 */
export async function reconcileARToGL(
  db: Database,
  tenantId: string,
  asOfDate: Date,
  userId: string
): Promise<ReconciliationJob> {
  return db.transaction(async (tx) => {
    // Get AR control account
    const config = await getAccountingConfig(tx, tenantId);
    const arControlAccountId = config.arControlAccountId;
    
    // Calculate subledger balance
    const subledgerBalance = await calculateARSubledgerBalance(tx, tenantId, asOfDate);
    
    // Calculate GL balance
    const glBalance = await getAccountBalance(tx, arControlAccountId, asOfDate);
    
    // Create reconciliation job
    const job = await tx.insert(reconciliationJobs).values({
      id: generateUUID(),
      tenantId,
      jobNumber: await generateJobNumber(tx, tenantId),
      name: `AR Reconciliation - ${formatDate(asOfDate)}`,
      reconciliationType: "subledger_gl",
      asOfDate: asOfDate.toISOString(),
      sourceType: "ar_subledger",
      targetType: "gl_account",
      targetId: arControlAccountId,
      status: "in_progress",
      sourceTotal: subledgerBalance,
      targetTotal: glBalance,
      varianceAmount: subtractDecimals(subledgerBalance, glBalance),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
    }).returning();
    
    // If variance exists, find discrepancies
    if (job[0].varianceAmount !== "0") {
      await findSubledgerDiscrepancies(tx, job[0]);
    } else {
      // Perfect match
      await tx.update(reconciliationJobs)
        .set({ status: "matched" })
        .where(eq(reconciliationJobs.id, job[0].id));
    }
    
    return job[0];
  });
}

/**
 * Find discrepancies between subledger and GL
 */
async function findSubledgerDiscrepancies(
  tx: Transaction,
  job: ReconciliationJob
): Promise<void> {
  // Get all subledger entries
  const subledgerEntries = await tx.query.arSubledger.findMany({
    where: and(
      eq(arSubledger.tenantId, job.tenantId),
      lte(arSubledger.effectiveDate, job.asOfDate)
    ),
  });
  
  // Get all GL postings to AR control
  const glPostings = await tx.query.ledgerPostings.findMany({
    where: and(
      eq(ledgerPostings.tenantId, job.tenantId),
      eq(ledgerPostings.accountId, job.targetId),
      lte(ledgerPostings.effectiveDate, job.asOfDate)
    ),
  });
  
  // Match by journal ID
  const subledgerByJournal = groupBy(subledgerEntries, "journalId");
  const glByJournal = groupBy(glPostings, "journalId");
  
  // Find journals in subledger but not GL
  for (const [journalId, entries] of Object.entries(subledgerByJournal)) {
    if (!glByJournal[journalId]) {
      await createException(tx, job, entries[0], null, "missing_target", {
        description: "Subledger entry has no corresponding GL posting",
      });
    }
  }
  
  // Find journals in GL but not subledger
  for (const [journalId, postings] of Object.entries(glByJournal)) {
    if (!subledgerByJournal[journalId]) {
      await createException(tx, job, null, postings[0], "missing_source", {
        description: "GL posting has no corresponding subledger entry",
      });
    }
  }
  
  // Find amount mismatches
  for (const [journalId, entries] of Object.entries(subledgerByJournal)) {
    if (glByJournal[journalId]) {
      const subledgerAmount = sumAmounts(entries);
      const glAmount = sumAmounts(glByJournal[journalId]);
      
      if (subledgerAmount !== glAmount) {
        await createException(tx, job, entries[0], glByJournal[journalId][0], "amount_mismatch", {
          description: `Amount mismatch: Subledger ${subledgerAmount} vs GL ${glAmount}`,
          varianceAmount: subtractDecimals(subledgerAmount, glAmount),
        });
      }
    }
  }
  
  // Update job status
  const exceptionCount = await countExceptions(tx, job.id);
  await tx.update(reconciliationJobs)
    .set({
      exceptionCount,
      status: exceptionCount > 0 ? "exception" : "matched",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(reconciliationJobs.id, job.id));
}
```

---

## 8) Inventory Reconciliation

### 8.1 Book vs Physical Reconciliation

```typescript
// packages/db/src/queries/reconciliation/inventory.ts

/**
 * Reconcile book stock to physical count
 */
export async function reconcileInventoryToPhysical(
  db: Database,
  tenantId: string,
  physicalCountId: string,
  userId: string
): Promise<ReconciliationJob> {
  return db.transaction(async (tx) => {
    const physicalCount = await tx.query.physicalCounts.findFirst({
      where: eq(physicalCounts.id, physicalCountId),
      with: { lines: true },
    });
    
    // Create reconciliation job
    const job = await tx.insert(reconciliationJobs).values({
      id: generateUUID(),
      tenantId,
      jobNumber: await generateJobNumber(tx, tenantId),
      name: `Inventory Reconciliation - ${physicalCount.countNumber}`,
      reconciliationType: "inventory_physical",
      asOfDate: physicalCount.countDate,
      sourceType: "stock_level",
      targetType: "physical_count",
      targetId: physicalCountId,
      status: "in_progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
    }).returning();
    
    let totalVarianceValue = "0";
    let exceptionCount = 0;
    
    // Compare each counted item to book stock
    for (const countLine of physicalCount.lines) {
      const bookStock = await getStockLevel(tx, tenantId, countLine.itemId, countLine.locationId);
      
      const bookQuantity = bookStock?.onHandQuantity || 0;
      const countedQuantity = countLine.countedQuantity;
      const variance = countedQuantity - bookQuantity;
      
      if (variance !== 0) {
        // Calculate variance value
        const unitCost = await getItemUnitCost(tx, tenantId, countLine.itemId, countLine.locationId);
        const varianceValue = multiplyDecimals(Math.abs(variance).toString(), unitCost);
        totalVarianceValue = addDecimals(totalVarianceValue, varianceValue);
        
        // Create exception
        await createException(tx, job[0], 
          { type: "stock_level", id: `${countLine.itemId}-${countLine.locationId}`, amount: bookQuantity.toString() },
          { type: "count_line", id: countLine.id, amount: countedQuantity.toString() },
          "amount_mismatch",
          {
            itemId: countLine.itemId,
            locationId: countLine.locationId,
            bookQuantity,
            countedQuantity,
            variance,
            varianceValue,
          }
        );
        exceptionCount++;
      }
      
      // Create match record
      await createMatchRecord(tx, job[0],
        { type: "stock_level", id: countLine.itemId, amount: bookQuantity.toString() },
        { type: "count_line", id: countLine.id, amount: countedQuantity.toString() },
        variance === 0 ? "auto_matched" : "partial_match"
      );
    }
    
    // Update job
    await tx.update(reconciliationJobs)
      .set({
        varianceAmount: totalVarianceValue,
        exceptionCount,
        status: exceptionCount > 0 ? "exception" : "matched",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reconciliationJobs.id, job[0].id));
    
    return job[0];
  });
}
```

---

## 9) Three-Way Match (Purchase)

### 9.1 PO-Receipt-Bill Matching

```typescript
// packages/db/src/queries/reconciliation/three-way.ts

/**
 * Perform three-way match for a supplier bill
 */
export async function performThreeWayMatch(
  db: Database,
  tenantId: string,
  billId: string
): Promise<ThreeWayMatchResult> {
  const bill = await db.query.purchaseBills.findFirst({
    where: eq(purchaseBills.id, billId),
    with: { lines: true },
  });
  
  const result: ThreeWayMatchResult = {
    billId,
    status: "matched",
    lines: [],
    totalVariance: "0",
  };
  
  for (const billLine of bill.lines) {
    // Get PO line
    const poLine = await db.query.purchaseOrderLines.findFirst({
      where: eq(purchaseOrderLines.id, billLine.poLineId),
    });
    
    // Get receipt lines for this PO line
    const receiptLines = await db.query.purchaseReceiptLines.findMany({
      where: eq(purchaseReceiptLines.poLineId, billLine.poLineId),
    });
    
    const totalReceivedQty = receiptLines.reduce(
      (sum, r) => sum + r.receivedQuantity, 0
    );
    
    // Match checks
    const lineResult: ThreeWayMatchLine = {
      billLineId: billLine.id,
      itemId: billLine.itemId,
      poQuantity: poLine.quantity,
      receivedQuantity: totalReceivedQty,
      billedQuantity: billLine.quantity,
      poUnitPrice: poLine.unitPrice,
      billedUnitPrice: billLine.unitPrice,
      quantityMatch: true,
      priceMatch: true,
      exceptions: [],
    };
    
    // Check quantity match
    if (billLine.quantity > totalReceivedQty) {
      lineResult.quantityMatch = false;
      lineResult.exceptions.push({
        type: "quantity_exceeds_receipt",
        message: `Billed qty (${billLine.quantity}) > Received qty (${totalReceivedQty})`,
        severity: "high",
      });
      result.status = "exception";
    }
    
    if (billLine.quantity > poLine.quantity) {
      lineResult.quantityMatch = false;
      lineResult.exceptions.push({
        type: "quantity_exceeds_po",
        message: `Billed qty (${billLine.quantity}) > PO qty (${poLine.quantity})`,
        severity: "high",
      });
      result.status = "exception";
    }
    
    // Check price match
    const priceVariance = subtractDecimals(billLine.unitPrice, poLine.unitPrice);
    const priceVariancePercent = Math.abs(parseFloat(priceVariance) / parseFloat(poLine.unitPrice) * 100);
    
    const tolerance = await getPriceMatchTolerance(db, tenantId);
    
    if (priceVariancePercent > tolerance.percent || 
        Math.abs(parseFloat(priceVariance)) > parseFloat(tolerance.amount)) {
      lineResult.priceMatch = false;
      lineResult.exceptions.push({
        type: "price_variance",
        message: `Price variance: ${priceVariance} (${priceVariancePercent.toFixed(2)}%)`,
        severity: priceVariancePercent > 10 ? "high" : "medium",
        variance: priceVariance,
      });
      result.status = "exception";
    }
    
    result.lines.push(lineResult);
    result.totalVariance = addDecimals(result.totalVariance, priceVariance);
  }
  
  // Update bill with match result
  await db.update(purchaseBills)
    .set({
      matchStatus: result.status,
      matchResult: result,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(purchaseBills.id, billId));
  
  return result;
}
```

---

## 10) Reconciliation Reports

### 10.1 Report Types

```typescript
// packages/axis-registry/src/schemas/reconciliation/reports.ts

export interface ReconciliationSummaryReport {
  asOfDate: string;
  reconciliationType: ReconciliationType;
  
  // Counts
  totalJobs: number;
  matchedJobs: number;
  exceptionJobs: number;
  pendingJobs: number;
  
  // Amounts
  totalSourceAmount: string;
  totalTargetAmount: string;
  totalVariance: string;
  
  // Aging of exceptions
  exceptionsAging: {
    current: number;      // < 7 days
    over7Days: number;
    over30Days: number;
    over90Days: number;
  };
}

export interface BankReconciliationReport {
  bankAccountId: string;
  bankAccountName: string;
  asOfDate: string;
  
  // Balances
  statementBalance: string;
  glBalance: string;
  adjustedGLBalance: string;
  difference: string;
  
  // Outstanding items
  outstandingDeposits: Array<{
    date: string;
    reference: string;
    amount: string;
    description: string;
  }>;
  
  outstandingChecks: Array<{
    date: string;
    checkNumber: string;
    amount: string;
    payee: string;
  }>;
  
  // Adjustments needed
  adjustments: Array<{
    type: string;
    amount: string;
    description: string;
  }>;
  
  // Status
  isReconciled: boolean;
  reconciledBy?: string;
  reconciledAt?: string;
}

export interface SubledgerReconciliationReport {
  subledgerType: "ar" | "ap" | "inventory";
  asOfDate: string;
  
  // Balances
  subledgerBalance: string;
  glControlBalance: string;
  variance: string;
  
  // Details by party (for AR/AP)
  partyDetails?: Array<{
    partyId: string;
    partyName: string;
    subledgerBalance: string;
    variance: string;
  }>;
  
  // Discrepancies
  discrepancies: Array<{
    type: string;
    documentNumber: string;
    subledgerAmount: string;
    glAmount: string;
    variance: string;
    description: string;
  }>;
  
  // Status
  isReconciled: boolean;
}
```

---

## 11) Reconciliation Events

```typescript
// packages/axis-registry/src/schemas/events/reconciliation.ts

export const reconciliationJobStartedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("reconciliation.started"),
  payload: z.object({
    jobId: z.string().uuid(),
    reconciliationType: z.enum(RECONCILIATION_TYPE),
    asOfDate: z.string().datetime(),
    startedBy: z.string().uuid(),
  }),
});

export const reconciliationJobCompletedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("reconciliation.completed"),
  payload: z.object({
    jobId: z.string().uuid(),
    status: z.enum(["matched", "exception"]),
    matchedRecords: z.number().int(),
    exceptionCount: z.number().int(),
    varianceAmount: z.string(),
  }),
});

export const reconciliationExceptionCreatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("exception.created"),
  payload: z.object({
    exceptionId: z.string().uuid(),
    jobId: z.string().uuid(),
    exceptionType: z.enum(EXCEPTION_TYPE),
    severity: z.string(),
    varianceAmount: z.string().optional(),
  }),
});

export const reconciliationExceptionResolvedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("exception.resolved"),
  payload: z.object({
    exceptionId: z.string().uuid(),
    resolutionType: z.string(),
    resolvedBy: z.string().uuid(),
    adjustmentJournalId: z.string().uuid().optional(),
  }),
});
```

---

## 12) Reconciliation Configuration

```typescript
// packages/axis-registry/src/schemas/reconciliation/config.ts

export const reconciliationConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Auto-reconciliation
  enableAutoReconciliation: z.boolean().default(true),
  autoReconciliationSchedule: z.string().default("0 2 * * *"), // Daily at 2 AM
  
  // Matching tolerances
  defaultAmountTolerance: z.string().default("0.01"),
  defaultPercentTolerance: z.number().default(0.01),
  dateToleranceDays: z.number().int().default(3),
  
  // Three-way match
  threeWayMatchRequired: z.boolean().default(true),
  priceVarianceTolerancePercent: z.number().default(5),
  priceVarianceToleranceAmount: z.string().default("10.00"),
  quantityVarianceTolerancePercent: z.number().default(1),
  
  // Exception handling
  autoEscalateAfterDays: z.number().int().default(7),
  writeOffThreshold: z.string().default("100.00"),
  writeOffApprovalRequired: z.boolean().default(true),
  
  // Notifications
  notifyOnException: z.boolean().default(true),
  notifyOnResolution: z.boolean().default(false),
  exceptionNotificationRoles: z.array(z.string()).default(["finance_manager"]),
  
  // Variance accounts
  bankVarianceAccountId: z.string().uuid().optional(),
  inventoryVarianceAccountId: z.string().uuid().optional(),
  apVarianceAccountId: z.string().uuid().optional(),
  arVarianceAccountId: z.string().uuid().optional(),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type ReconciliationConfig = z.infer<typeof reconciliationConfigSchema>;
```

---

## 13) Exit Criteria (B9 Gate)

**B9 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                              | Verified | Implementation                               |
| --- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| 1   | Subledger ↔ GL reconciliation works                    | ✅        | `reconcileARToGL()`, `reconcileAPToGL()`     |
| 2   | Bank reconciliation with statement import              | ✅        | `importBankStatement()`, `runBankRecon()`    |
| 3   | Three-way match for purchases                          | ✅        | `performThreeWayMatch()` logic               |
| 4   | Inventory book vs physical reconciliation              | ✅        | `reconcileInventoryToPhysical()`             |
| 5   | Matching algorithm with configurable rules             | ✅        | `runMatchingAlgorithm()` + rules             |
| 6   | Exception creation and tracking                        | ✅        | `reconciliationExceptionSchema` defined      |
| 7   | Exception resolution (manual match, adjust, write-off) | ✅        | `resolveBy*()` functions                     |
| 8   | Write-off requires approval above threshold            | ✅        | Workflow integration                         |
| 9   | Reconciliation reports                                 | ✅        | Report schemas defined                       |
| 10  | Reconciliation events published to outbox              | ✅        | B02 outbox integration ready                 |
| 11  | Configurable tolerances per tenant                     | ✅        | `reconciliationConfigSchema` defined         |
| 12  | Auto-escalation for aged exceptions                    | ✅        | `autoEscalateAfterDays` config               |

### Implementation Files

| Component               | Location                                                         |
| ----------------------- | ---------------------------------------------------------------- |
| Reconciliation Constants| `packages/axis-registry/src/schemas/reconciliation/constants.ts` |
| Job Schema              | `packages/axis-registry/src/schemas/reconciliation/job.ts`       |
| Match Schema            | `packages/axis-registry/src/schemas/reconciliation/match.ts`     |
| Exception Schema        | `packages/axis-registry/src/schemas/reconciliation/exception.ts` |
| Bank Schema             | `packages/axis-registry/src/schemas/reconciliation/bank.ts`      |
| Reconciliation Tables   | `packages/db/src/schema/reconciliation/*.ts`                     |
| Reconciliation Events   | `packages/axis-registry/src/schemas/events/reconciliation.ts`    |

---

## 14) Integration with Other Phases

| Phase               | Dependency on B09         | What B09 Provides                    |
| ------------------- | ------------------------- | ------------------------------------ |
| **B04** (Sales)     | Invoice-payment matching  | AR aging, payment reconciliation     |
| **B05** (Purchase)  | Three-way match           | PO-Receipt-Bill validation           |
| **B06** (Inventory) | Physical count recon      | Book vs physical variance            |
| **B07** (Accounting)| Subledger-GL recon        | Control account verification         |
| **B08** (Controls)  | Audit trail               | Exception investigation              |
| **B08-01** (Workflow)| Write-off approval       | Exception resolution workflow        |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B9 (Reconciliation)                             |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: Reconciliation engine integrates with all transactional domains (B04-B07).

---

## Related Documents

| Document                                       | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md)         | Philosophy: §P8 (Reconciliation Principle) |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)           | Roadmap: Phase B9 definition               |
| [B05-PURCHASE.md](./B05-PURCHASE.md)           | Purchase (three-way match)                 |
| [B06-INVENTORY.md](./B06-INVENTORY.md)         | Inventory (physical count)                 |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)       | Accounting (subledger-GL)                  |
| [B08-01-WORKFLOW.md](./B08-01-WORKFLOW.md)     | Workflow (exception approval)              |

---

> *"If two numbers should be equal but aren't, that's a problem to surface, not hide. Reconciliation is not a feature — it's a design goal."*
