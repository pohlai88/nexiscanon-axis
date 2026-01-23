# B01 — Posting Spine Constitution
## The Non-Negotiable Engine

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

| B-Series  |                         |                     |                       |                          |                           |
| :-------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: |
| **[B01]** | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) |
|  Posting  |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §P3 (Double-Entry Immutability), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B1
>
> **Tag:** `ENGINE` | `NON-NEGOTIABLE` | `PHASE-B1`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B01 schemas follow the **Single Source of Truth** pattern:

| Component | Source | Consumer |
|-----------|--------|----------|
| `DOCUMENT_TYPE`, `DOCUMENT_STATE` | `@axis/registry/types` | `@axis/db/schema/document.ts` |
| `EVENT_TYPE` | `@axis/registry/types` | `@axis/db/schema/economic-event.ts` |
| `sixW1HContextSchema` | `@axis/registry/schemas` | `@axis/db/validation/posting-spine.ts` |
| `dangerZoneSchema` | `@axis/registry/schemas` | `@axis/db/validation/posting-spine.ts` |

**Rule**: Never duplicate schema definitions. Import from registry, re-export if needed.

---

## 1) The Core Law (The 500-Year Principle)

From A01 §P3:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE IMMUTABLE TRUTH                                  │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     POSTED IS IMMUTABLE.                                          ║    │
│    ║     CORRECTIONS ARE REVERSALS.                                    ║    │
│    ║     DEBITS = CREDITS.                                             ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    This is the spine that prevents ERP feature sprawl from corrupting       │
│    truth. It worked for Venetian merchants 500 years ago. It will work      │
│    100 years from now.                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without this, you have applications, not an ERP
- Without this, your books can drift from reality
- Without this, auditors will find discrepancies

---

## 2) The Three-Layer Model

ERP reality splits into three layers with distinct mutability rules:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Layer 1: DOCUMENTS (Workflow Layer)                                         │
│  ════════════════════════════════════                                        │
│  • Editable until POSTED                                                     │
│  • State machine governs transitions                                         │
│  • Human-facing (forms, approvals)                                           │
│                                                                              │
│                              │ POST                                          │
│                              ▼                                               │
│  Layer 2: ECONOMIC EVENTS (Truth Layer)                                      │
│  ═══════════════════════════════════════                                     │
│  • IMMUTABLE once created                                                    │
│  • Full 6W1H context (A01 §5)                                                │
│  • Records WHAT happened, not just the outcome                               │
│                                                                              │
│                              │ GENERATES                                     │
│                              ▼                                               │
│  Layer 3: POSTINGS (Math Layer)                                              │
│  ══════════════════════════════                                              │
│  • IMMUTABLE once created                                                    │
│  • Debits = Credits (always)                                                 │
│  • Ledger lines + stock valuation lines                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Invariant:** Documents can be revised; Events and Postings cannot.

| Layer          | Mutable?           | Purpose                             |
| -------------- | ------------------ | ----------------------------------- |
| Document       | Yes (until POSTED) | Human workflow, approvals, edits    |
| Economic Event | **NO**             | Immutable record of business action |
| Posting        | **NO**             | Double-entry math that must balance |

---

## 3) Document Lifecycle (Canonical State Machine)

From A01 Part IV (Workflow Spine):

```
┌─────────┐     ┌───────────┐     ┌──────────┐     ┌────────┐
│  DRAFT  │────▶│ SUBMITTED │────▶│ APPROVED │────▶│ POSTED │
└────┬────┘     └─────┬─────┘     └────┬─────┘     └────┬───┘
     │                │                │                │
     │                │                │                ▼
     │                │                │          ┌──────────┐
     ▼                ▼                ▼          │ REVERSED │
┌─────────────────────────────────────────┐      └──────────┘
│                  VOID                    │
│           (cancelled before POST)        │
└─────────────────────────────────────────┘
```

### State Definitions

| State         | Meaning          | Editable?  | Next States           |
| ------------- | ---------------- | ---------- | --------------------- |
| **DRAFT**     | Work in progress | ✅ Full     | SUBMITTED, VOID       |
| **SUBMITTED** | Pending approval | ⚠️ Limited  | APPROVED, DRAFT, VOID |
| **APPROVED**  | Ready to post    | ❌ No       | POSTED, VOID          |
| **POSTED**    | Truth created    | ❌ Locked   | REVERSED only         |
| **VOID**      | Cancelled        | ❌ Terminal | —                     |
| **REVERSED**  | Corrected        | ❌ Terminal | —                     |

### Transition Rules

| Transition             | Requirement                  | Creates               |
| ---------------------- | ---------------------------- | --------------------- |
| `DRAFT → SUBMITTED`    | Schema validation passes     | —                     |
| `SUBMITTED → APPROVED` | Approval chain satisfied     | Approval audit entry  |
| `APPROVED → POSTED`    | Posting pipeline succeeds    | Events + Postings     |
| `POSTED → REVERSED`    | Reversal command with reason | New Events + Postings |
| `* → VOID`             | Not yet POSTED               | Void audit entry      |

### Nexus Doctrine Integration (A01 §5)

The Posting Spine supports the **Danger Zone** pattern:

```typescript
// When action violates policy but user proceeds with acknowledgment
if (dangerZone.detected) {
  // Don't block — capture 6W1H context
  event.context.dangerZone = {
    violatedPolicies: [...],
    riskScore: calculateRisk(),
    warningsAcknowledged: [...],
    overrideApprovedBy: approver.id
  };
  // Proceed with posting + full audit trail
}
```

---

## 4) Posting Pipeline (How Documents Become Truth)

When a document transitions to **POSTED**, execute this pipeline atomically:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POSTING PIPELINE                                     │
│                                                                              │
│  ┌─────────────┐                                                             │
│  │ 1. VALIDATE │──▶ Zod schema validation                                    │
│  └──────┬──────┘    Input contracts enforced                                 │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                             │
│  │ 2. GUARD    │──▶ State must be APPROVED                                   │
│  └──────┬──────┘    (or Danger Zone override path)                           │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                             │
│  │ 3. CREATE   │──▶ Generate EconomicEvent(s)                                │
│  │    EVENTS   │    Capture full 6W1H context                                │
│  └──────┬──────┘    Mark as IMMUTABLE                                        │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                             │
│  │ 4. GENERATE │──▶ Create LedgerPostings                                    │
│  │   POSTINGS  │    Create InventoryPostings (if applicable)                 │
│  └──────┬──────┘                                                             │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                             │
│  │ 5. ENFORCE  │──▶ SUM(debits) = SUM(credits)                               │
│  │ CONSTRAINTS │    No negative stock (or Danger Zone)                       │
│  └──────┬──────┘                                                             │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                             │
│  │ 6. PERSIST  │──▶ Single atomic transaction                                │
│  │  ATOMICALLY │    All or nothing                                           │
│  └──────┬──────┘                                                             │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                             │
│  │ 7. LOCK     │──▶ Document becomes read-only                               │
│  │  DOCUMENT   │    No further edits allowed                                 │
│  └──────┬──────┘                                                             │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐                                                             │
│  │ 8. EMIT     │──▶ Outbox message for integrations                          │
│  │   OUTBOX    │    (async, not blocking)                                    │
│  └─────────────┘                                                             │
│                                                                              │
│  OUTCOME: Pipeline succeeds → Truth exists                                   │
│           Pipeline fails → Nothing is posted (full rollback)                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Atomicity Guarantee:** The entire pipeline runs in a single database transaction. If any step fails, the entire operation rolls back. There is no partial truth.

---

## 5) Canonical Data Contracts

These are the **engine contracts** that all domain-specific documents (Invoice, Receipt, PO, etc.) must adapt into.

### 5.1 PostingSpineEnvelope

```typescript
// packages/domain/posting-spine/types.ts

export type DocState =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "POSTED"
  | "REVERSED"
  | "VOID";

export interface PostingSpineEnvelope {
  // Identity
  tenantId: string;              // RLS boundary (always present)
  documentId: string;            // UUID
  documentType: string;          // e.g. "sales.invoice", "purchase.bill"
  documentVersion: number;       // Schema evolution (lean integer)

  // State
  state: DocState;

  // Immutable once POSTED
  postedAt?: string;             // ISO8601
  postedBy?: string;             // ActorId

  // Proof artifacts
  eventIds?: string[];           // Links to EconomicEvents
  postingBatchId?: string;       // Links to posting batch

  // 6W1H context snapshot (A01 §5)
  context: SixW1HContext;

  // Transition history (append-only)
  transitions: StateTransition[];
}

export interface StateTransition {
  from: DocState;
  to: DocState;
  at: string;                    // ISO8601
  by: string;                    // ActorId
  reason?: string;
}
```

### 5.2 SixW1HContext (From A01 §5 Nexus Doctrine)

```typescript
export interface SixW1HContext {
  // WHO
  who: {
    actorId: string;
    onBehalfOfId?: string;       // Delegation
    approvalChain?: string[];    // Approval actors
  };

  // WHAT
  what: {
    action: "POST" | "REVERSE" | "VOID";
    source: {
      type: string;              // Document type
      id: string;                // Document ID
    };
  };

  // WHEN
  when: {
    at: string;                  // Timestamp (immutable)
    effectiveDate: string;       // Accounting date
    fiscalPeriod?: string;       // e.g. "2026-01"
  };

  // WHERE
  where: {
    tenantId: string;
    locationId?: string;         // Warehouse, branch
    channel: "ui" | "api" | "import" | "automation";
  };

  // WHY
  why: {
    reasonCode?: string;         // From predefined list
    justification?: string;      // Free text
  };

  // WHICH
  which: {
    optionsPresented?: string[]; // What alternatives existed
    selectedOption?: string;     // What was chosen
  };

  // HOW
  how: {
    method: "ui" | "api" | "import" | "automation";
    evidenceIds?: string[];      // Attached evidence
  };

  // DANGER ZONE (A01 §5)
  dangerZone?: {
    violatedPolicies: string[];
    riskScore: number;           // 0-100 at time of action
    warningsAcknowledged: string[];
    overrideApprovedBy?: string;
  };
}
```

### 5.3 EconomicEvent (Immutable Truth)

```typescript
export interface EconomicEvent {
  // Identity
  id: string;                    // UUID
  tenantId: string;              // RLS boundary

  // Event metadata
  type: string;                  // e.g. "invoice.posted", "payment.applied"
  occurredAt: string;            // Immutable timestamp
  effectiveDate: string;         // Accounting date

  // Source traceability
  source: {
    documentType: string;
    documentId: string;
  };

  // Full 6W1H context
  context: SixW1HContext;

  // Links to postings
  postingBatchId: string;

  // Integrity (future: blockchain seal)
  hash?: string;
}
```

### 5.4 LedgerPosting (Double-Entry Unit)

```typescript
export interface LedgerPosting {
  // Identity
  id: string;                    // UUID
  tenantId: string;              // RLS boundary

  // Batch grouping
  postingBatchId: string;
  journalId: string;             // Groups balanced lines

  // Account
  accountId: string;             // Chart of Accounts reference

  // Amounts (Decimal as string for precision)
  debit: string;                 // "0.00" if credit
  credit: string;                // "0.00" if debit

  // Metadata
  currency: string;              // ISO 4217: "MYR", "USD"
  effectiveDate: string;         // Accounting date

  // Optional dimensions
  partyId?: string;              // AR/AP control party
  costCenterId?: string;
  projectId?: string;
}

// INVARIANT: For each journalId:
// SUM(debit) === SUM(credit)
```

---

## 6) Database Invariants (Must-Enforce)

These constraints prevent drift at the database level:

### 6.1 Journal Balance Constraint

```sql
-- Option A: Check constraint via trigger
CREATE OR REPLACE FUNCTION check_journal_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT SUM(debit::numeric) - SUM(credit::numeric)
    FROM ledger_postings
    WHERE journal_id = NEW.journal_id
  ) != 0 THEN
    RAISE EXCEPTION 'Journal % is unbalanced', NEW.journal_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Option B: PostingBatch with SEALED status (recommended)
CREATE TABLE posting_batches (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  status VARCHAR(10) CHECK (status IN ('OPEN', 'SEALED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only allow SEALED when balanced
CREATE OR REPLACE FUNCTION seal_posting_batch(batch_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  balance NUMERIC;
BEGIN
  SELECT SUM(debit::numeric) - SUM(credit::numeric) INTO balance
  FROM ledger_postings WHERE posting_batch_id = batch_id;

  IF balance != 0 THEN
    RAISE EXCEPTION 'Cannot seal: batch % is unbalanced by %', batch_id, balance;
  END IF;

  UPDATE posting_batches SET status = 'SEALED' WHERE id = batch_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 Immutability Enforcement

```sql
-- Prevent updates to economic_events
CREATE OR REPLACE FUNCTION prevent_event_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'economic_events are immutable. Use reversal pattern.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_economic_events
  BEFORE UPDATE ON economic_events
  FOR EACH ROW EXECUTE FUNCTION prevent_event_update();

-- Same for ledger_postings
CREATE TRIGGER no_update_ledger_postings
  BEFORE UPDATE ON ledger_postings
  FOR EACH ROW EXECUTE FUNCTION prevent_event_update();
```

### 6.3 Idempotency

```sql
CREATE TABLE posting_idempotency_keys (
  tenant_id UUID NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  document_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, idempotency_key)
);

-- On duplicate key, return existing result instead of re-posting
```

---

## 7) Engine Commands (API-Level Semantics)

These are the commands that the Posting Spine exposes:

| Command                        | Input                          | Effect                   | Creates               |
| ------------------------------ | ------------------------------ | ------------------------ | --------------------- |
| `submit(documentId)`           | Document ID                    | DRAFT → SUBMITTED        | Audit entry           |
| `approve(documentId, context)` | Document ID + approver context | SUBMITTED → APPROVED     | Approval audit entry  |
| `post(documentId, options)`    | Document ID + idempotency key  | APPROVED → POSTED        | Events + Postings     |
| `reverse(documentId, options)` | Document ID + reason           | POSTED → REVERSED        | New Events + Postings |
| `void(documentId, options)`    | Document ID + reason           | * → VOID (if not POSTED) | Void audit entry      |

### Command Signatures

```typescript
// packages/domain/posting-spine/commands.ts

interface PostOptions {
  idempotencyKey: string;
  effectiveDate: string;
  context: Partial<SixW1HContext>;
}

interface ReverseOptions {
  idempotencyKey: string;
  reason: string;
  context: Partial<SixW1HContext>;
}

interface VoidOptions {
  reason: string;
  context: Partial<SixW1HContext>;
}

// Commands
async function submit(documentId: string): Promise<PostingSpineEnvelope>;
async function approve(documentId: string, approverContext: ApprovalContext): Promise<PostingSpineEnvelope>;
async function post(documentId: string, options: PostOptions): Promise<PostingSpineEnvelope>;
async function reverse(documentId: string, options: ReverseOptions): Promise<PostingSpineEnvelope>;
async function voidDocument(documentId: string, options: VoidOptions): Promise<PostingSpineEnvelope>;
```

**Rule:** `post()` and `reverse()` are the **only** entry points that create immutable truth.

---

## 8) Exit Criteria (B1 Gate)

**B1 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                                                                | Verified | Implementation                                                |
| --- | ---------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| 1   | One document type (Sales Invoice) can transition `DRAFT → SUBMITTED → APPROVED → POSTED` | ✅        | `isValidStateTransition()`, `transitionDocumentState()`       |
| 2   | Posting creates **EconomicEvent** with full **6W1H context**                             | ✅        | `postDocument()` → `economicEvents` table                     |
| 3   | Posting creates **LedgerPostings** where `SUM(debits) = SUM(credits)`                    | ✅        | `postDocument()` balance check + `verify_batch_balance()` SQL |
| 4   | Posted document is **non-editable** (writes blocked at DB level)                         | ✅        | `prevent_posted_document_mutation()` SQL trigger              |
| 5   | **Reversal** creates new Events + Postings (never modifies existing)                     | ✅        | `reverseDocument()` + `*_immutable` SQL triggers              |
| 6   | **Idempotency** prevents duplicate posting (same key = same result)                      | ✅        | `posting_idempotency_keys` table + check in `postDocument()`  |
| 7   | **Danger Zone** metadata captured when policies are overridden                           | ✅        | `dangerZone` JSONB column in `documents`, `economicEvents`    |

### Implementation Files

| Component          | Location                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| State Machine      | `packages/db/src/queries/posting.ts`                                                             |
| Drizzle Schemas    | `packages/db/src/schema/document.ts`, `economic-event.ts`, `ledger-posting.ts`, `idempotency.ts` |
| Validation Schemas | `packages/db/src/validation/posting-spine.ts`                                                    |
| Registry (SoT)     | `packages/axis-registry/src/schemas/`                                                            |
| SQL Migrations     | `packages/axis-registry/__generated__/b01-posting-spine.sql`                                     |
| Server Actions     | `apps/web/src/lib/actions/posting.ts`                                                            |

---

## 9) Integration with Other Phases

| Phase                    | Dependency on B01       | What B01 Provides                    |
| ------------------------ | ----------------------- | ------------------------------------ |
| **B02** (Domains)        | Outbox events           | Event emission from posting pipeline |
| **B03** (MDM)            | Document references     | Valid entity IDs for postings        |
| **B04** (Sales)          | Full posting spine      | Invoice → Event → Posting flow       |
| **B05** (Purchase)       | Full posting spine      | Bill → Event → Posting flow          |
| **B06** (Inventory)      | Stock posting extension | Inventory posting alongside ledger   |
| **B07** (Accounting)     | GL/Subledger contracts  | LedgerPosting writes to GL           |
| **B08** (Controls)       | Danger Zone hooks       | Policy evaluation before POST        |
| **B09** (Reconciliation) | Posting data            | Subledger ↔ GL reconciliation source |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Exit Criteria Met)             |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B1 (Posting Spine)                              |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

---

## Related Documents

| Document                                 | Purpose                                             |
| ---------------------------------------- | --------------------------------------------------- |
| [A01-CANONICAL.md](./A01-CANONICAL.md)   | Philosophy: §P3 (Immutability), §5 (Nexus Doctrine) |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)     | Roadmap: Phase B1 definition                        |
| [B02-DOMAINS.md](./B02-DOMAINS.md)       | Domain ownership + event contracts                  |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md) | GL/Subledger formalization                          |
| [B08-CONTROLS.md](./B08-CONTROLS.md)     | PDR layer + policy engine                           |

---

# Implementation Status

**Status:** ✅ Implemented (2026-01-23)

## Completed Implementation

| Component | Status | Location |
|-----------|--------|----------|
| **Transaction Wrapper** | ✅ | `packages/db/src/client/posting-transaction.ts` |
| **Economic Event Service** | ✅ | `packages/db/src/services/posting-spine/event-service.ts` |
| **Posting Service** | ✅ | `packages/db/src/services/posting-spine/posting-service.ts` |
| **Document State Machine** | ✅ | `packages/db/src/services/posting-spine/document-state.ts` |
| **Invoice Posting Trigger** | ✅ | `packages/db/src/services/sales/invoice-service.ts` |
| **Bill Posting Trigger** | ✅ | `packages/db/src/services/purchase/bill-service.ts` |
| **Reversal Service** | ✅ | `packages/db/src/services/posting-spine/reversal-service.ts` |
| **Reversal Tracking** | ✅ | `packages/db/src/services/posting-spine/reversal-tracking.ts` |
| **Posting History Queries** | ✅ | `packages/db/src/queries/posting-spine.ts` |
| **Balanced Books Verification** | ✅ | `packages/db/src/queries/balanced-books.ts` |

## Three-Layer Model (Fully Operational)

```
✅ Layer 1: DOCUMENTS (Workflow Layer)
   - Document state machine with validated transitions
   - postDocument() creates event + postings atomically

✅ Layer 2: ECONOMIC EVENTS (Truth Layer)
   - Immutable economic events with 6W1H context
   - Full reversal chain tracking

✅ Layer 3: POSTINGS (Math Layer)
   - Balanced GL postings (Debits = Credits enforced)
   - Batch management and validation
```

## Exit Criteria Status

1. ✅ **Complete business loop (Quote → Cash)** - **OPERATIONAL** ✅
2. ✅ **Balanced books verification** - **VERIFIED** (5 tests: $1,000, $1,650, $2,500, $1,650, $2,500)
3. ✅ **End-to-end testing** - **PASSED** (5 full cycles tested)

**FULL BUSINESS CYCLES OPERATIONAL:** 🎉
- ✅ Sales: Quote Q-2026-001 → Invoice INV-2026-002 → Payment PAY-CUST-001 → Cash ($1,650)
- ✅ Purchase: PR PR-2026-001 → Bill BILL-2026-001 → Payment PAY-VEND-001 → Cash ($2,500)

---

> *"Posted is immutable. Corrections are reversals. Debits = Credits. This is not a feature — this is physics."*
