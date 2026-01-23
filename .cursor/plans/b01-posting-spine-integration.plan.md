---
name: ""
overview: ""
todos: []
isProject: false
---

# B01 Posting Spine Integration Plan

**Created:** 2026-01-23

**Status:** Ready to Execute

**Priority:** 🔴 HIGH (Blocking Phase 1 completion)

**Estimated Tasks:** 15

---

## Objective

Complete B01 Posting Spine implementation by integrating service layer with database layer, enabling end-to-end posting flow from documents to GL.

**Current State:** 30% (Schema only)

**Target State:** 100% (Full integration)

---

## Context

From [E00-01-SERVICE-IMPLEMENTATION-SYNC.md](../ERP/E00-01-SERVICE-IMPLEMENTATION-SYNC.md):

- ✅ **11 services implemented** (3,434 lines)
- ✅ **All schemas defined** in `@axis/registry`
- ⏳ **B1 Posting Spine:** Schema only, no DB integration
- ⏳ **Exit criteria:** "Balanced books verification - PENDING DB INTEGRATION"

**The Gap:** Services exist but don't persist to database. The three-layer model (Documents → Events → Postings) exists in code but not in data.

---

## Three-Layer Architecture (B01)

```
┌────────────────────────────────────────────────────────────┐
│ Layer 1: DOCUMENTS (Workflow Layer)                        │
│ ─────────────────────────────────────                      │
│ • sales_invoices, purchase_bills, inventory_moves          │
│ • Editable until POSTED                                    │
│ • State machine governs transitions                        │
│                           │ POST                           │
│                           ▼                                │
│ Layer 2: ECONOMIC EVENTS (Truth Layer)                     │
│ ─────────────────────────────────────────                  │
│ • economic_events table (6W1H context)                     │
│ • IMMUTABLE once created                                   │
│ • Records WHAT happened                                    │
│                           │ GENERATES                      │
│                           ▼                                │
│ Layer 3: POSTINGS (Math Layer)                             │
│ ─────────────────────────────────────                      │
│ • gl_postings (ledger lines)                               │
│ • inventory_valuation_entries (cost layers)                │
│ • IMMUTABLE, Debits = Credits                              │
└────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Phase 1: Database Client Integration (Tasks 1-3)

**Task 1:** Create posting spine transaction wrapper

- **File:** `packages/db/src/client/posting-transaction.ts`
- **Purpose:** Ensure atomic document → event → posting creation
- **Key Function:** `executePostingSpineTransaction()`

**Task 2:** Implement economic event persistence

- **File:** `packages/db/src/services/posting-spine/event-service.ts`
- **Purpose:** Create immutable economic events from documents
- **Functions:**
  - `createEconomicEvent()`
  - `getEventsByDocument()`
  - `validateEventImmutability()`

**Task 3:** Implement posting persistence layer

- **File:** `packages/db/src/services/posting-spine/posting-service.ts`
- **Purpose:** Create GL postings and valuation entries
- **Functions:**
  - `createGLPostings()`
  - `createValuationEntries()`
  - `validateDoubleEntry()` (DB-level)

---

### Phase 2: Document State Machine Integration (Tasks 4-6)

**Task 4:** Implement document state transitions

- **File:** `packages/db/src/services/posting-spine/document-state.ts`
- **Purpose:** State machine for document lifecycle
- **Functions:**
  - `transitionDocumentState()`
  - `canTransitionTo()`
  - `postDocument()` → Creates event + postings

**Task 5:** Add posting trigger to invoice service

- **File:** `packages/db/src/services/sales/invoice-service.ts` (UPDATE)
- **Add:** `postInvoice()` method that calls posting spine
- **Pattern:** Document POST → Event → GL Postings + AR Subledger

**Task 6:** Add posting trigger to bill service

- **File:** `packages/db/src/services/purchase/bill-service.ts` (UPDATE)
- **Add:** `postBill()` method that calls posting spine
- **Pattern:** Document POST → Event → GL Postings + AP Subledger

---

### Phase 3: Reversal Pattern Implementation (Tasks 7-8)

**Task 7:** Implement reversal service

- **File:** `packages/db/src/services/posting-spine/reversal-service.ts`
- **Purpose:** Immutable correction pattern (never UPDATE posted records)
- **Functions:**
  - `createReversalEntry()`
  - `validateReversalEligibility()`
  - `linkReversals()` (bidirectional references)

**Task 8:** Add reversal UI state tracking

- **File:** `packages/db/src/services/posting-spine/reversal-tracking.ts`
- **Purpose:** Track which documents are reversed/reversal-of
- **Functions:**
  - `getReversalChain()`
  - `isReversed()`
  - `findOriginalDocument()`

---

### Phase 4: Validation & Guards (Tasks 9-11)

**Task 9:** Implement danger zone detection

- **File:** `packages/db/src/services/posting-spine/danger-zone.ts`
- **Purpose:** DETECT violations of posting policies (A01 PDR)
- **Functions:**
  - `detectPeriodViolation()`
  - `detectBalanceViolation()`
  - `requireOverride()`

**Task 10:** Add pre-commit hooks (database level)

- **File:** `packages/db/migrations/posting-spine-guards.sql` (custom migration)
- **Purpose:** DB-level guards for immutability
- **Constraints:**
  - TRIGGER on economic_events: Prevent UPDATE
  - TRIGGER on gl_postings: Prevent UPDATE
  - CHECK constraint: Debits = Credits (journal level)

**Task 11:** Implement idempotency keys

- **File:** `packages/db/src/services/posting-spine/idempotency.ts`
- **Purpose:** Prevent duplicate postings on retry
- **Functions:**
  - `registerIdempotencyKey()`
  - `checkDuplicate()`
  - `expireKeys()` (cleanup)

---

### Phase 5: Query & Reporting Layer (Tasks 12-13)

**Task 12:** Implement posting history queries

- **File:** `packages/db/src/queries/posting-spine.ts`
- **Purpose:** Read posting spine data efficiently
- **Functions:**
  - `getPostingsByDocument()`
  - `getEventHistory()`
  - `getReversalChain()`

**Task 13:** Create balanced books verification query

- **File:** `packages/db/src/queries/balanced-books.ts`
- **Purpose:** Verify Debits = Credits across all postings
- **Functions:**
  - `verifyBalancedBooks(tenantId, fiscalPeriodId)`
  - `findUnbalancedJournals()`
  - `getTotalDebitsCredits()`

---

### Phase 6: Testing & Validation (Tasks 14-15)

**Task 14:** Create end-to-end posting test

- **File:** `packages/db/src/services/__tests__/posting-spine.test.ts`
- **Purpose:** Verify complete posting flow
- **Test Cases:**
  - Invoice POST → Event + GL Postings + AR Subledger
  - Bill POST → Event + GL Postings + AP Subledger
  - Reversal → Creates offsetting postings
  - Balanced books verification

**Task 15:** Update B01 documentation with implementation status

- **File:** `.cursor/ERP/B01-DOCUMENTATION.md`
- **Add:** Implementation status section (like F01)
- **Link:** Service files, query files, migration files

---

## Success Criteria

**Exit Criteria (from E00-01):**

1. ✅ Complete business loop (Quote → Cash) - **SERVICE LAYER COMPLETE**
2. 🎯 **Balanced books verification** - **TARGET: COMPLETE**
3. 🎯 **End-to-end testing** - **TARGET: COMPLETE**

**Technical Validation:**

```bash
# 1. Can post invoice and verify GL entries
const invoice = await createInvoice({ ... });
await postInvoice(invoice.id);
const postings = await getPostingsByDocument(invoice.id);
assert(postings.totalDebit === postings.totalCredit);

# 2. Can verify balanced books for tenant
const verification = await verifyBalancedBooks(tenantId, periodId);
assert(verification.isBalanced === true);
assert(verification.totalDebits === verification.totalCredits);

# 3. Can create reversal and maintain balance
const reversal = await createReversalEntry(journalId);
const verification2 = await verifyBalancedBooks(tenantId, periodId);
assert(verification2.isBalanced === true);
```

---

## Dependencies

**Must be complete first:**

- ✅ F01-DB-GOVERNED.md implementation (connection setup, migrations)
- ✅ Service layer implementations (11 services)
- ✅ Schema definitions in @axis/registry

**Blocks:**

- Phase 2 completion (UI integration)
- Production readiness
- Audit compliance

---

## Deliverables

1. **6 new service files** in `packages/db/src/services/posting-spine/`
2. **2 updated service files** (invoice-service.ts, bill-service.ts)
3. **2 query files** in `packages/db/src/queries/`
4. **1 custom migration** (posting-spine-guards.sql)
5. **1 test file** (posting-spine.test.ts)
6. **Updated B01 documentation** with implementation status

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |

|-------|-------|----------------|

| Phase 1 | 1-3 | 4 hours |

| Phase 2 | 4-6 | 3 hours |

| Phase 3 | 7-8 | 2 hours |

| Phase 4 | 9-11 | 3 hours |

| Phase 5 | 12-13 | 2 hours |

| Phase 6 | 14-15 | 2 hours |

| **Total** | **15 tasks** | **16 hours** |

---

## References

- [B01-DOCUMENTATION.md](../ERP/B01-DOCUMENTATION.md) - Posting Spine Constitution
- [E00-01-SERVICE-IMPLEMENTATION-SYNC.md](../ERP/E00-01-SERVICE-IMPLEMENTATION-SYNC.md) - Current status
- [F01-DB-GOVERNED.md](../ERP/F01-DB-GOVERNED.md) - Database governance
- [A01-CANONICAL.md](../ERP/A01-CANONICAL.md) §P3 - Double-Entry Immutability