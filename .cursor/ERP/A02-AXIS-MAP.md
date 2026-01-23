# A02 — AXIS Implementation Roadmap
## From Philosophy to Production (Phase B0 → B12)

<!-- AXIS ERP Document Series -->
|         A-Series          |           |                     |                           |                            |                          |
| :-----------------------: | :-------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | **[A02]** | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |  Roadmap  |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |       |                              |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :---: | :--------------------------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) |  ...  | [B12](./B12-INTELLIGENCE.md) |
|            Posting            |         Domains         |         MDM         |         Sales         |       |         Intelligence         |

---

> *Derived from [A01-CANONICAL.md](./A01-CANONICAL.md) — The Business Truth Engine*

---

## Preamble: The Build Philosophy

**A01 defines WHAT we believe.** This document defines **HOW we build it.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         A01 → A02 DERIVATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  A01 PHILOSOPHY              │  A02 IMPLEMENTATION                          │
│  ─────────────────────────── │  ─────────────────────────────────────────── │
│  Debits = Credits            │  B1: Posting Spine                           │
│  Bounded Contexts            │  B2: Domain Map                              │
│  Canonical Source of Truth   │  B3: MDM Registry                            │
│  Money + Obligations         │  B4-B5: Sales + Purchase Flows               │
│  Goods Truth                 │  B6: Inventory Spine                         │
│  The 500-Year Principle      │  B7: Accounting Core                         │
│  Nexus Doctrine + PDR        │  B8: Controls & Governance                   │
│  Reconciliation Goal         │  B9: Reconciliation Engine                   │
│  Quorum + Cobalt             │  B10: Dual-Kernel UX                         │
│  AFANDA Boards               │  B11: AFANDA Platform                        │
│  Human-Machine Symbiosis     │  B12: Intelligence Layer                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The Anti-Feature-Race Principle:** We build phases, not features. Each phase has clear exit criteria. No phase is "done" until it passes its exit gate.

---

## Phase Dependency Map

```
                              ┌─────────┐
                              │   B0    │ Context (A01)
                              │ (Given) │
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │   B1    │ Posting Spine
                              │ ENGINE  │ (The Core)
                              └────┬────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
               ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
               │   B2    │   │   B3    │   │   B7    │
               │ Domains │   │   MDM   │   │   GL    │
               └────┬────┘   └────┬────┘   └────┬────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
               ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
               │   B4    │   │   B5    │   │   B6    │
               │  Sales  │   │Purchase │   │  Stock  │
               └────┬────┘   └────┬────┘   └────┬────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                              ┌────▼────┐
                              │   B8    │ Controls + PDR
                              │GOVERNANCE│
                              └────┬────┘
                                   │
                              ┌────▼────┐
                              │   B9    │ Reconciliation
                              │  TRUTH  │
                              └────┬────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
               ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
               │   B10   │   │   B11   │   │   B12   │
               │ Quorum/ │   │ AFANDA  │   │   AI    │
               │ Cobalt  │   │         │   │         │
               └─────────┘   └─────────┘   └─────────┘
```

---

## 🛑 DEV NOTE: @axis/registry — Single Source of Truth

> **ALL DEVELOPERS MUST READ THIS BEFORE WRITING ANY CODE**

### The Law

`@axis/registry` is the **canonical source** for all schema definitions in AXIS ERP.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCHEMA HIERARCHY (NON-NEGOTIABLE)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    @axis/registry (Single Source of Truth)                                  │
│    ├── src/schemas/constants.ts    → Enums (DOCUMENT_TYPE, EVENT_TYPE...)   │
│    ├── src/schemas/common.ts       → Shared schemas (6W1H, DangerZone)      │
│    ├── src/schemas/document.ts     → Document registry schema               │
│    ├── src/schemas/events/*.ts     → Domain event contracts                 │
│    └── src/types/index.ts          → Inferred TypeScript types              │
│                   │                                                         │
│                   ▼                                                         │
│    @axis/db (Consumer — NEVER defines schemas)                              │
│    ├── src/schema/*.ts             → Drizzle tables IMPORT from registry    │
│    └── src/validation/*.ts         → RE-EXPORTS from registry               │
│                   │                                                         │
│                   ▼                                                         │
│    @axis/web, domain packages (Consumers)                                   │
│    └── Import from @axis/db/schema OR @axis/registry directly              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Rules

| Rule   | Description                                                     | Violation                                        |
| ------ | --------------------------------------------------------------- | ------------------------------------------------ |
| **R1** | All Zod schemas live in `@axis/registry`                        | ❌ Never define Zod schemas in `@axis/db` or apps |
| **R2** | Drizzle schemas import enums/types from registry                | ❌ Never duplicate enum arrays in Drizzle files   |
| **R3** | Validation files re-export, never redefine                      | ❌ Never copy-paste schema definitions            |
| **R4** | Domain events are contracts in `@axis/registry/schemas/events/` | ❌ Never define event shapes elsewhere            |
| **R5** | TypeScript types are inferred via `z.infer<>`                   | ❌ Never manually duplicate type definitions      |

### The Pattern

```typescript
// ✅ CORRECT: @axis/db imports from @axis/registry
// packages/db/src/schema/document.ts
import { DOCUMENT_TYPE, DOCUMENT_STATE } from "@axis/registry/types";

export const documents = pgTable("documents", {
  documentType: varchar("document_type", { length: 50 })
    .notNull()
    .$type<(typeof DOCUMENT_TYPE)[number]>(),
  // ...
});

// Re-export for consumers
export { DOCUMENT_TYPE, DOCUMENT_STATE } from "@axis/registry/types";
```

```typescript
// ❌ WRONG: Duplicating definitions
// packages/db/src/schema/document.ts
const DOCUMENT_TYPE = ["invoice", "bill", ...] as const;  // ❌ DUPLICATION!
```

### Why This Matters

1. **Zero Drift**: One definition → zero type mismatches
2. **Codegen Ready**: Registry drives SQL generation, migrations
3. **Contract Enforcement**: Event schemas are versioned, validated
4. **Refactoring Safety**: Change once, propagates everywhere
5. **500-Year Principle**: Truth survives developer turnover

### Quick Reference

| Need            | Location                                         |
| --------------- | ------------------------------------------------ |
| Enum values     | `@axis/registry/types`                           |
| Zod schemas     | `@axis/registry/schemas`                         |
| Event contracts | `@axis/registry/schemas/events`                  |
| Drizzle tables  | `@axis/db/schema` (imports from registry)        |
| Validation      | `@axis/db/validation` (re-exports from registry) |

---

## B0 — Context (Prerequisites)

**Source:** A01-CANONICAL.md

**You Already Have:**
- ✅ Business Truth Engine philosophy
- ✅ Three Pillars (Money, Goods, Obligations)
- ✅ Dual-Kernel Architecture (Quorum + Cobalt)
- ✅ Nexus Doctrine (Past-Present-Future)
- ✅ PROTECT. DETECT. REACT. mantra
- ✅ AFANDA concept
- ✅ Human-Machine Symbiosis vision

**Everything below is "how we implement A01 without feature-racing."**

---

## B1 — Posting Spine Constitution (The Non-Negotiable Engine)

> *"Posted is immutable. Debits = Credits. Forever."*

**Goal:** Define HOW documents become truth.

**A01 Reference:** P3 (Double-Entry Immutability), Part V (Posting Spine)

### Deliverables

| Deliverable           | Description                                               |
| --------------------- | --------------------------------------------------------- |
| Document Lifecycle    | `DRAFT → SUBMITTED → APPROVED → POSTED → (REVERSED/VOID)` |
| State Machine         | XState or similar for document transitions                |
| Posting Engine        | Creates immutable events from documents                   |
| Posting Invariants    | Debits = Credits enforced at DB level                     |
| Economic Event Schema | 6W1H context + danger zone metadata                       |
| Reversal Pattern      | Correction = reversal entry + new entry                   |

### Schema Baseline

```typescript
// packages/domain/posting-spine/types.ts
interface PostingSpine {
  document_id: UUID;
  state: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'POSTED' | 'REVERSED' | 'VOID';

  // State transitions
  transitions: StateTransition[];

  // When POSTED, creates:
  events: EconomicEvent[];      // Immutable truth
  postings: LedgerPosting[];    // Debits = Credits

  // 6W1H (from A01 §5)
  context: SixW1HContext;
}
```

### Exit Criteria

- [ ] One document can be posted end-to-end
- [ ] Posted document produces immutable `EconomicEvent`
- [ ] Postings pass `SUM(debits) = SUM(credits)` constraint
- [ ] Reversal creates new entries (never modifies existing)
- [ ] Audit trail captures full 6W1H context

---

## B2 — Domain Map & Bounded Contexts (Stop Cross-Bleeding)

> *"Sales ≠ Accounting ≠ Inventory ≠ Procurement"*

**Goal:** Define the ERP as domains with strict boundaries.

**A01 Reference:** P4 (Strong Boundaries), Part III (Core Domains)

### Domain Registry

| Domain         | Owns                                         | Publishes                             | Consumes               |
| -------------- | -------------------------------------------- | ------------------------------------- | ---------------------- |
| **MDM**        | Customers, Suppliers, Items, UoM, Warehouses | `party.created`, `item.created`       | —                      |
| **Sales**      | Quotes, Orders, Deliveries, Invoices         | `order.confirmed`, `invoice.posted`   | MDM events             |
| **Purchase**   | PRs, POs, Receipts, Bills                    | `po.confirmed`, `bill.posted`         | MDM events             |
| **Inventory**  | Stock Moves, Reservations, Valuation         | `stock.moved`, `valuation.calculated` | Sales, Purchase events |
| **Accounting** | COA, Journals, GL, Subledgers                | `journal.posted`, `period.closed`     | All posting events     |
| **Controls**   | RBAC, Approvals, Policies, Audit             | `approval.granted`, `policy.violated` | All domain events      |
| **Reporting**  | Manifests, Dashboards, Exports               | —                                     | All domain events      |

### Cross-Domain Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DOMAIN BOUNDARY ENFORCEMENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✅ ALLOWED                          │  ❌ FORBIDDEN                         │
│  ──────────────────────────────────  │  ──────────────────────────────────  │
│  Events via outbox                   │  Direct foreign keys across domains  │
│  Published contracts (Zod schemas)   │  Shared internal tables              │
│  Correlation IDs for tracing         │  Calling internal services directly  │
│  Read replicas for reporting         │  Modifying another domain's data     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Exit Criteria

- [ ] Domain ownership table documented
- [ ] Cross-domain event contracts defined (Zod)
- [ ] No direct foreign keys across domain boundaries
- [ ] Outbox pattern implemented for inter-domain events

---

## B3 — Master Data Canon (MDM Truth Registry)

> *"Apple ≠ APPLE ≠ apples — solved forever."*

**Goal:** Eliminate drift in master data. One source of nouns.

**A01 Reference:** P1 (Canonical Source of Truth), Part III-A (MDM)

### Deliverables

| Deliverable      | Description                                     |
| ---------------- | ----------------------------------------------- |
| Party Model      | Customer/Supplier as unified "Party" with roles |
| Item Model       | SKU, UoM, variants, categories                  |
| Location Model   | Warehouses, bins, locations                     |
| COA Model        | Chart of accounts with hierarchy                |
| Tax Registry     | Tax codes, rates, jurisdictions                 |
| Alias Registry   | Normalization rules for name matching           |
| Effective Dating | Valid-from/valid-to for time-travel queries     |

### Anti-Drift Mechanisms

| Problem                  | Solution                                     |
| ------------------------ | -------------------------------------------- |
| Free-text customer names | Registry lookup + alias matching             |
| Duplicate items          | Canonical SKU + variant system               |
| COA sprawl               | Governance rules + approval for new accounts |
| Tax code chaos           | Jurisdiction-based registry                  |

### Exit Criteria

- [ ] Party model supports Customer/Supplier/Both roles
- [ ] Item creation enforces canonical SKU rules
- [ ] Alias registry catches "Apple" vs "APPLE" on create
- [ ] Effective dating works for historical queries
- [ ] No free-text drift in master data

---

## B4 — Sales Flow Minimal (Quote → Order → Invoice → Payment)

> *"One complete Money + Obligation loop."*

**Goal:** Build the full sales cycle that creates AR and GL postings.

**A01 Reference:** Part III-B (Commercial Documents), §3 (Money + Obligations)

### Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Quote   │────▶│  Order   │────▶│ Delivery │────▶│ Invoice  │────▶│ Payment  │
│  (Draft) │     │(Confirmed)     │ (Shipped)│     │ (Posted) │     │(Applied) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                         │               │
                                                         ▼               ▼
                                                   ┌───────────┐   ┌───────────┐
                                                   │ AR Entry  │   │ AR Clear  │
                                                   │ GL Journal│   │ Cash Entry│
                                                   └───────────┘   └───────────┘
```

### Postings Created

| Event             | AR Subledger         | GL Journal          |
| ----------------- | -------------------- | ------------------- |
| `invoice.posted`  | Debit AR (customer)  | Dr: AR, Cr: Revenue |
| `payment.applied` | Credit AR (customer) | Dr: Cash, Cr: AR    |

### Exit Criteria

- [ ] Quote → Order → Delivery → Invoice lifecycle works
- [ ] Invoice posting creates AR subledger entry
- [ ] Invoice posting creates GL journal (Dr AR, Cr Revenue)
- [ ] Payment application clears AR
- [ ] Trial balance stays balanced after full cycle
- [ ] Reconciliation status tracks invoice ↔ payment

---

## B5 — Purchase Flow Minimal (PR → PO → Receipt → Bill → Payment)

> *"Symmetric Obligation loop for suppliers."*

**Goal:** Build the full purchase cycle that creates AP and GL postings.

**A01 Reference:** Part III-B (Commercial Documents), §3 (Obligations)

### Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│    PR    │────▶│    PO    │────▶│ Receipt  │────▶│   Bill   │────▶│ Payment  │
│ (Request)│     │(Confirmed)     │(Received)│     │ (Posted) │     │(Applied) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                       │               │               │
                                       ▼               ▼               ▼
                                 ┌───────────┐   ┌───────────┐   ┌───────────┐
                                 │Stock Move │   │ AP Entry  │   │ AP Clear  │
                                 │ Inv. Val. │   │ GL Journal│   │ Cash Entry│
                                 └───────────┘   └───────────┘   └───────────┘
```

### Postings Created

| Event             | AP Subledger         | GL Journal                     | Inventory |
| ----------------- | -------------------- | ------------------------------ | --------- |
| `receipt.posted`  | —                    | Dr: Inventory, Cr: GRN Accrual | Stock In  |
| `bill.posted`     | Credit AP (supplier) | Dr: GRN Accrual, Cr: AP        | —         |
| `payment.applied` | Debit AP (supplier)  | Dr: AP, Cr: Cash               | —         |

### Exit Criteria

- [ ] PR → PO → Receipt → Bill → Payment lifecycle works
- [ ] Receipt creates stock move + inventory valuation
- [ ] Bill posting creates AP subledger entry
- [ ] Bill posting creates GL journal
- [ ] Payment application clears AP
- [ ] Three-way match (PO ↔ Receipt ↔ Bill) visible

---

## B6 — Inventory Spine Minimal (Stock Moves + Valuation)

> *"Goods truth that ties to accounting."*

**Goal:** Build physical inventory tracking with financial valuation.

**A01 Reference:** §3 (Goods Pillar), Part III-C (Inventory & Costing)

### Stock Move Types

| Move Type      | Direction | Creates                               |
| -------------- | --------- | ------------------------------------- |
| **Receipt**    | IN        | Stock increase + valuation entry      |
| **Delivery**   | OUT       | Stock decrease + COGS entry           |
| **Transfer**   | INTERNAL  | Location change (no valuation impact) |
| **Adjustment** | IN/OUT    | Reconciliation entry with reason code |

### Valuation Methods

| Method               | When to Use             | Implementation                       |
| -------------------- | ----------------------- | ------------------------------------ |
| **Weighted Average** | Default for most        | Recalculate avg cost on each receipt |
| **FIFO**             | Perishables, compliance | Layer-based costing                  |
| **Standard**         | Manufacturing           | Variance accounts for differences    |

### Postings Created

| Event               | GL Journal                                  |
| ------------------- | ------------------------------------------- |
| `receipt.posted`    | Dr: Inventory Asset, Cr: GRN Accrual        |
| `delivery.posted`   | Dr: COGS, Cr: Inventory Asset               |
| `adjustment.posted` | Dr/Cr: Inventory, Cr/Dr: Adjustment Account |

### Exit Criteria

- [ ] Stock moves tracked with full traceability
- [ ] On-hand calculation correct per warehouse/location
- [ ] Weighted Average valuation working
- [ ] Inventory valuation report matches GL balance
- [ ] Adjustment entries require reason codes

---

## B7 — Accounting Core (GL + Period Controls)

> *"The 500-Year Principle made real."*

**Goal:** Build the accounting engine that all domains post to.

**A01 Reference:** P3 (Double-Entry Immutability), Part III-D (Accounting)

### Components

| Component             | Purpose                              |
| --------------------- | ------------------------------------ |
| **Chart of Accounts** | Hierarchical account structure       |
| **Journal Entry**     | Atomic unit of financial truth       |
| **General Ledger**    | Aggregated account balances          |
| **Subledgers**        | AR, AP detail with customer/supplier |
| **Period Controls**   | Fiscal calendar + locking            |
| **Trial Balance**     | Proof that books balance             |

### Period Locking Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PERIOD STATE MACHINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  OPEN ──────▶ SOFT_CLOSE ──────▶ HARD_CLOSE                                 │
│    │              │                   │                                      │
│    │ All posts    │ Only approved     │ No posts allowed                    │
│    │ allowed      │ adjustments       │ (audit override only)               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Exit Criteria

- [ ] Journal entry model enforces debits = credits
- [ ] Trial balance report works
- [ ] Period locking prevents backdating
- [ ] Soft-close allows approved adjustments only
- [ ] Hard-close requires audit override (Danger Zone)
- [ ] Subledger totals roll up to GL control accounts

---

## B8 — Controls & Governance (RBAC + Approvals + Audit + PDR)

> *"Truth with memory. PROTECT. DETECT. REACT."*

**Goal:** Enforce the Nexus Doctrine and PDR mantra.

**A01 Reference:** §5 (Nexus Doctrine), §6 (PDR), Part III-E (Controls)

### PROTECT Layer

| Capability          | Implementation                              |
| ------------------- | ------------------------------------------- |
| RBAC                | Role-based access control at API + DB level |
| Row-Level Security  | PostgreSQL RLS policies                     |
| Encryption          | At-rest encryption for sensitive data       |
| Immutable Audit Log | Append-only audit table                     |
| 6W1H Context        | Full context on every event                 |

### DETECT Layer

| Capability          | Implementation                              |
| ------------------- | ------------------------------------------- |
| Policy Engine       | Rules that flag Danger Zone actions         |
| Anomaly Detection   | Unusual patterns (amount, frequency, actor) |
| Reconciliation Gaps | Subledger ≠ GL, Stock ≠ Valuation           |
| SoD Violations      | Same actor in conflicting roles             |

### REACT Layer

| Capability            | Implementation                       |
| --------------------- | ------------------------------------ |
| Real-time Alerts      | Webhook + notification on violations |
| Approval Workflows    | Multi-step authorization chains      |
| Evidence Requirements | Attachments required for Danger Zone |
| Escalation Engine     | Auto-escalate on SLA breach          |

### Danger Zone Pattern

```typescript
// When action violates policy
interface DangerZoneAction {
  action: ActionType;
  violations: PolicyViolation[];
  risk_score: number;

  // User acknowledgment
  acknowledged_at: ISO8601;
  acknowledged_by: ActorRef;
  justification: string;
  evidence: EvidenceRef[];

  // Approval (if required)
  approved_by?: ActorRef;
  approval_chain: ApprovalStep[];
}
```

### Exit Criteria

- [ ] RBAC enforced on all API endpoints
- [ ] RLS policies active on all tenant data
- [ ] 6W1H audit log captures every state change
- [ ] Danger Zone warnings appear for policy violations
- [ ] Danger Zone actions require acknowledgment + evidence
- [ ] Approval workflows can be configured per document type
- [ ] SLA escalation working

---

## B9 — Reconciliation Engine (The Real ERP Differentiator)

> *"The truth arbiter. Does the data tell the truth?"*

**Goal:** Build the reconciliation layer that proves the system is correct.

**A01 Reference:** P8 (Reconciliation as Design Goal), §3 (Three Pillars)

### Reconciliation Types

| Reconciliation        | Question                                   | Frequency |
| --------------------- | ------------------------------------------ | --------- |
| **Subledger ↔ GL**    | Do AR/AP totals match GL control accounts? | Daily     |
| **Stock ↔ Valuation** | Does physical inventory match book value?  | Daily     |
| **Invoice ↔ Payment** | Is this invoice fully settled?             | Real-time |
| **Order ↔ Delivery**  | Has the commitment been fulfilled?         | Real-time |
| **Bank ↔ Cash Book**  | Does bank statement match our records?     | Daily     |

### Reconciliation Status Model

```typescript
interface ReconciliationStatus {
  type: ReconciliationType;
  left_side: { source: string; value: Decimal };
  right_side: { source: string; value: Decimal };

  status: 'MATCHED' | 'PARTIAL' | 'DISCREPANCY' | 'PENDING';
  discrepancy_amount?: Decimal;

  // For investigation
  discrepancy_queue?: DiscrepancyRef;
  last_reconciled_at: ISO8601;
}
```

### Exit Criteria

- [ ] Subledger ↔ GL reconciliation runs automatically
- [ ] Stock ↔ Valuation reconciliation runs automatically
- [ ] Invoice ↔ Payment status visible on invoice
- [ ] Discrepancy queue exists for investigation
- [ ] Reconciliation dashboard exists (Quorum view)
- [ ] Alerts trigger on discrepancies over threshold

---

## B10 — Quorum + Cobalt Productization (Dual-Kernel UX)

> *"Surface before they ask. One tap, done."*

**Goal:** Convert engine into Quorum (analysis) + Cobalt (execution) experiences.

**A01 Reference:** §4 (Dual-Kernel Architecture)

### Cobalt (Execution) Features

| Feature                | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| **CRUD-SAP**           | Create, Read, Update, Delete + Search, Audit, Predict |
| **SUMMIT Buttons**     | Single-action workflow completion                     |
| **Predictive Forms**   | Autofill based on patterns                            |
| **Recent Items**       | Fast access to frequently used entities               |
| **Inline Editing**     | No page reloads for simple updates                    |
| **Keyboard Shortcuts** | Power user efficiency                                 |

### Quorum (Analysis) Features

| Feature                    | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| **Materialized Manifests** | Pre-computed truth views                 |
| **CommandK (⌘K)**          | Command palette for insights             |
| **Drilldown Chains**       | From aggregate to source document        |
| **6W1H Explorer**          | Answer who/what/when/where/why/which/how |
| **Exception Hunting**      | Find anomalies and investigate           |
| **What-If Scenarios**      | Simulate outcomes                        |

### Exit Criteria

- [ ] Cobalt: CRUD-SAP pattern implemented
- [ ] Cobalt: SUMMIT buttons for common workflows
- [ ] Cobalt: Predictive defaults working
- [ ] Quorum: Manifests for key metrics
- [ ] Quorum: ⌘K command palette working
- [ ] Quorum: Drilldown from dashboard to source document
- [ ] Both: Operators complete workflows fast; analysts explain truth fast

---

## B11 — AFANDA Platform (Unified Collaboration)

> *"Life is chaos, but work doesn't have to be."*

**Goal:** Build the unified collaboration layer for accountability.

**A01 Reference:** §8 (AFANDA)

### Board Hierarchy

| Level                  | Purpose                                        | Visibility      |
| ---------------------- | ---------------------------------------------- | --------------- |
| **Individual Board**   | Personal tasks, my approvals, self-service     | Private to user |
| **Team Board**         | Team discussions, shared tasks, brainstorming  | Team members    |
| **Organization Board** | Announcements, policies, cross-team visibility | All employees   |

### AFANDA Capabilities

| Capability                | Description                               |
| ------------------------- | ----------------------------------------- |
| **Sharing Board**         | FigJam-style brainstorming, sticky notes  |
| **Approval Queue**        | Hierarchical approval with SLA timers     |
| **Consultation Thread**   | Structured discussion → canonical outcome |
| **Read Receipts**         | Know who saw what, when                   |
| **Escalation Ladder**     | Auto-escalate on SLA breach               |
| **Mention & Notify**      | @person with audit trail                  |
| **Employee Self-Service** | Leave, expenses, asset requests           |

### No-Excuse Accountability

```typescript
interface NotificationRecord {
  recipient: ActorRef;
  message: MessageRef;

  // Delivery tracking
  delivered_at: ISO8601;
  read_at?: ISO8601;
  acknowledged_at?: ISO8601;

  // SLA tracking
  sla_deadline?: ISO8601;
  escalated_at?: ISO8601;
  escalated_to?: ActorRef;
}
```

### Exit Criteria

- [ ] Individual → Team → Organization board hierarchy works
- [ ] Sharing board with collaborative editing
- [ ] Approval queue with SLA timers
- [ ] Read receipts tracking
- [ ] Auto-escalation on SLA breach
- [ ] "You can't say you missed it" — full visibility

---

## B12 — Intelligence Layer (Human-Machine Symbiosis)

> *"Adapt. Adopt. Alive. Human drifts, machine anchors."*

**Goal:** Build the AI/ML layer that amplifies human capability.

**A01 Reference:** §7 (Human-Machine Symbiosis)

### Intelligence Capabilities

| Capability                 | What Machine Does        | What Human Does          |
| -------------------------- | ------------------------ | ------------------------ |
| **Predictive Defaults**    | Suggest likely values    | Confirm or override      |
| **Anomaly Detection**      | Flag unusual patterns    | Investigate and decide   |
| **Natural Language Query** | Translate to SQL/filters | Ask questions naturally  |
| **Document Extraction**    | OCR + field mapping      | Verify and correct       |
| **Forecasting**            | Project trends           | Make strategic decisions |
| **Recommendation Engine**  | Suggest next actions     | Choose and execute       |

### Integration Points

| Touchpoint     | AI Assistance                       |
| -------------- | ----------------------------------- |
| Form Fill      | Predictive autofill from history    |
| Search         | Natural language → structured query |
| Reconciliation | Suggest matches, flag anomalies     |
| Approval       | Risk scoring, recommendation        |
| Reporting      | Natural language report generation  |

### Exit Criteria

- [ ] Predictive defaults working on key forms
- [ ] Anomaly detection integrated with PDR
- [ ] Natural language search available
- [ ] Document OCR for invoice/receipt capture
- [ ] AI suggestions clearly marked as machine-generated
- [ ] Human always has final decision authority

---

## Build Order Summary

### Phase 1: Essential Core (Ship-Worthy MVP)

```
B1 (Posting Spine) → B2 (Domains) → B3 (MDM) → B7 (Accounting)
        │                                            │
        └──────────► B4 (Sales) ◄────────────────────┘
                     B5 (Purchase)
                     B6 (Inventory)
```

**Exit:** Complete business loop (Quote → Cash) with balanced books.

### Phase 2: Governance (Prevent Drift)

```
B8 (Controls + PDR)
```

**Exit:** Every action audited, Danger Zone enforced, approvals working.

### Phase 3: Differentiation (Become AXIS)

```
B9 (Reconciliation) → B10 (Quorum + Cobalt)
```

**Exit:** Truth arbiter working, dual-kernel UX implemented.

### Phase 4: Premium Experience

```
B11 (AFANDA) → B12 (Intelligence)
```

**Exit:** Full collaboration platform, AI-assisted workflows.

---

## Document Governance

| Field            | Value                   |
| ---------------- | ----------------------- |
| **Status**       | Draft                   |
| **Version**      | 0.2.0                   |
| **Derived From** | A01-CANONICAL.md v0.3.0 |
| **Author**       | AXIS Architecture Team  |
| **Last Updated** | 2026-01-22              |

---

## Related Documents

### A-Series (Architecture)

| Document                                 | Status    | Purpose                           |
| ---------------------------------------- | --------- | --------------------------------- |
| [A01-CANONICAL.md](./A01-CANONICAL.md)   | ✅ v0.3.0  | Philosophy, principles, mantras   |
| [A01-01-LYNX.md](./A01-01-LYNX.md)       | ✅ v1.2.0  | Lynx: The Machine's Awareness     |
| [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) | ✅ v1.1.0 | The Vocabulary of Truth |
| **A02-AXIS-MAP.md**                      | ✅ v0.2.0  | Implementation roadmap (this doc) |
| [A03-TSD.md](./A03-TSD.md)               | 📋 Planned | Technical schema design           |
| [A04-CONTRACTS.md](./A04-CONTRACTS.md)   | 📋 Planned | Zod contract registry             |
| [A05-DEPLOYMENT.md](./A05-DEPLOYMENT.md) | 📋 Planned | Infrastructure patterns           |
| [A06-GLOSSARY.md](./A06-GLOSSARY.md)     | 📋 Planned | Terms and definitions             |

### B-Series (Implementation)

| Document                                         | Phase | Status    | Purpose                    |
| ------------------------------------------------ | ----- | --------- | -------------------------- |
| [B01-POSTING.md](./B01-DOCUMENTATION.md)         | B1    | ✅ v1.0.0  | Posting Spine Constitution |
| [B02-DOMAINS.md](./B02-DOMAINS.md)               | B2    | ✅ v1.0.0  | Domain Map & Boundaries    |
| [B03-MDM.md](./B03-MDM.md)                       | B3    | ✅ v1.0.0  | Master Data Registry       |
| [B04-SALES.md](./B04-SALES.md)                   | B4    | ✅ v1.0.0  | Sales Flow                 |
| [B05-PURCHASE.md](./B05-PURCHASE.md)             | B5    | ✅ v1.0.0  | Purchase Flow              |
| [B06-INVENTORY.md](./B06-INVENTORY.md)           | B6    | ✅ v1.0.0  | Inventory Spine            |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)         | B7    | ✅ v1.0.0  | Accounting Core            |
| [B08-CONTROLS.md](./B08-CONTROLS.md)             | B8    | ✅ v1.0.0  | Controls & PDR             |
| [B08-01-WORKFLOW.md](./B08-01-WORKFLOW.md)       | B8-01 | ✅ v1.0.0  | Workflow Engine            |
| [B09-RECONCILIATION.md](./B09-RECONCILIATION.md) | B9    | ✅ v1.0.0  | Reconciliation Engine      |
| [B10-UX.md](./B10-UX.md)                         | B10   | ✅ v1.0.0  | Quorum + Cobalt UX         |
| [B11-AFANDA.md](./B11-AFANDA.md)                 | B11   | ✅ v1.0.0  | AFANDA Platform            |
| [B12-INTELLIGENCE.md](./B12-INTELLIGENCE.md)     | B12   | ✅ v1.0.0  | Intelligence Layer         |

### C-Series (Migration)

| Document                                                             | Phase | Status     | Purpose                      |
| -------------------------------------------------------------------- | ----- | ---------- | ---------------------------- |
| [C01-MIGRATION-PHILOSOPHY.md](./C01-MIGRATION-PHILOSOPHY.md)         | C01   | ✅ v1.0.0  | Migration Philosophy & Modes |
| [C02-COLUMN-ADAPTER.md](./C02-COLUMN-ADAPTER.md)                     | C02   | ✅ v1.0.0  | Column Adapter Pattern       |
| [C03-MAPPING-STUDIO.md](./C03-MAPPING-STUDIO.md)                     | C03   | ✅ v1.0.0  | Mapping Studio               |
| [C04-DUAL-LEDGER.md](./C04-DUAL-LEDGER.md)                           | C04   | ✅ v1.0.0  | Dual Ledger Reconciliation   |
| [C05-CUTOVER.md](./C05-CUTOVER.md)                                   | C05   | ✅ v1.0.0  | Cutover Runbook              |

### D-Series (Extensions)

| Document                                                             | Phase | Status     | Purpose                       |
| -------------------------------------------------------------------- | ----- | ---------- | ----------------------------- |
| [D00-GAP-ANALYSIS.md](./D00-GAP-ANALYSIS.md)                         | D00   | ✅ v1.1.0   | Gap tracking & roadmap        |
| [D01-CURRENCY.md](./D01-CURRENCY.md)                                 | D01   | 📋 Planned  | Multi-Currency Engine         |
| [D02-BANK-RECONCILIATION.md](./D02-BANK-RECONCILIATION.md)           | D02   | 📋 Planned  | Bank Statement Reconciliation |
| [D03-TAX-ENGINE.md](./D03-TAX-ENGINE.md)                             | D03   | 📋 Planned  | Tax Computation & Reporting   |
| [D04-FIXED-ASSETS.md](./D04-FIXED-ASSETS.md)                         | D04   | 📋 Planned  | Asset Depreciation            |
| [D05-BUDGETING.md](./D05-BUDGETING.md)                               | D05   | 📋 Planned  | Budget Management             |
| [D06-CONSOLIDATION.md](./D06-CONSOLIDATION.md)                       | D06   | 📋 Planned  | Multi-Company Consolidation   |
| [D20-UX-IMPLEMENTATION.md](./D20-UX-IMPLEMENTATION.md)               | D20   | ✅ v0.1.0   | Team 2 UX Implementation      |

---

> *"We build phases, not features. Each phase has exit criteria. No phase is 'done' until it passes its exit gate."*
