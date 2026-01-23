# AXIS: The Business Truth Engine
## Canonical Architecture Document (A01-CANONICAL)

<!-- AXIS ERP Document Series -->
|  A-Series  |                          |                     |                           |                            |                          |
| :--------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| **[A01]**  | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
| Philosophy |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |       |                              |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :---: | :--------------------------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) |  ...  | [B12](./B12-INTELLIGENCE.md) |
|            Posting            |         Domains         |         MDM         |         Sales         |       |         Intelligence         |

|    E-Series (Design System)            |                                |                                    |
| :------------------------------------: | :----------------------------: | :--------------------------------: |
| [E01](./E01-DESIGN-SYSTEM.md)          | [E02](./E02-BLOCKS.md)         | [E03](./E03-IMPLEMENTATION.md)     |
|         Constitution                   |         Block Library          |         Implementation Guide       |

---

> **NEXUS-CANON** — The morphology of business chaos always returns to canonical truth.
> **AXIS** — The compass that always points North, even when you are lost.

---

## Preamble: The Journal Balance Principle

For over 500 years, double-entry bookkeeping has remained unchanged:

```
Debits = Credits
Assets = Liabilities + Equity
```

This is not a feature. This is **truth**. It worked for Venetian merchants. It works for trillion-dollar corporations. It will work 100 years from now.

**AXIS exists to encode such truths** — the invariants of business that transcend ERPs, software versions, and technology waves.

When businesses adopt complex systems (Odoo, SAP, ERPNext, NetSuite, or custom builds), they often lose sight of these truths amid configuration chaos, integration debt, and feature sprawl.

**AXIS is the compass back to canon.**

---

## Part I: The AXIS Philosophy

### §1 — What AXIS Is (And Is Not)

**AXIS IS:**
- A **Business Truth Engine** that captures economic events and produces trustable outputs
- A **Canonical Reference** that complements any ERP ecosystem
- A **Reconciliation Layer** that answers: "Does the data tell the truth?"
- A **Compass** for businesses lost in operational complexity

**AXIS IS NOT:**
- Another ERP competing for feature parity with Odoo/SAP/NetSuite
- A replacement for specialized tools (CRM, WMS, MES, HR)
- A configuration engine pretending to be a platform

### §2 — The Open Source Complement Strategy

We do not kill open-source ERPs. We **complete** them.

| Open-Source ERP       | What It Excels At           | What AXIS Provides                              |
| --------------------- | --------------------------- | ----------------------------------------------- |
| **Odoo**              | Modularity, marketplace, UX | Canonical posting rules, reconciliation truth   |
| **ERPNext**           | SMB simplicity, accounting  | Multi-entity consolidation, audit integrity     |
| **Metabase/Superset** | Analytics, dashboards       | Event provenance, drilldown to source documents |
| **Invoice Ninja**     | Invoicing workflow          | AR/AP reconciliation, payment matching          |
| **GnuCash/Ledger**    | Personal/SMB accounting     | Commercial document flows, inventory costing    |

**The AXIS Promise:** Any business using any ERP can plug AXIS in as their "source of truth reconciler" — the arbiter that answers whether the books balance, stock matches valuation, and obligations are settled.

### §3 — The Three Pillars of Canonical Truth

Every business, regardless of industry, size, or complexity, must answer three questions:

| Pillar          | Question                  | AXIS Answer                                          |
| --------------- | ------------------------- | ---------------------------------------------------- |
| **Money**       | Do the books balance?     | Ledger postings, trial balance, financial statements |
| **Goods**       | Does stock match records? | Inventory valuation, lot tracking, movement history  |
| **Obligations** | Who owes whom?            | AR/AP reconciliation, payment matching, aging        |

If your ERP cannot answer these with **immutable, traceable, auditable evidence**, you don't have truth — you have data.

### §4 — The Dual-Kernel Architecture (Quorum + Cobalt)

AXIS serves two fundamentally different user personas. Each deserves a purpose-built experience:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AXIS DUAL-KERNEL                                   │
├─────────────────────────────────┬───────────────────────────────────────────┤
│           QUORUM ◇              │              COBALT ■                      │
│        (White Collar)           │           (Blue Collar)                    │
├─────────────────────────────────┼───────────────────────────────────────────┤
│  "I need to understand WHY"     │  "I need to GET IT DONE"                   │
│  Analysis, Strategy, Oversight  │  Execution, Speed, Accuracy                │
├─────────────────────────────────┼───────────────────────────────────────────┤
│  6W1H Thinking:                 │  DRY + KISS Execution:                     │
│  • WHO is responsible?          │  • Don't make me type twice                │
│  • WHAT happened?               │  • Don't make me click twice               │
│  • WHEN did it occur?           │  • If one button solves it, give me ONE    │
│  • WHERE in the process?        │  • Predict what I need next                │
│  • WHY was this decision made?  │  • Search before I ask                     │
│  • WHICH options were available?│  • Audit without interrupting flow         │
│  • HOW was it executed?         │                                            │
├─────────────────────────────────┼───────────────────────────────────────────┤
│  Interface: CommandK ⌘          │  Interface: CRUD-SAP                       │
│  • Materialized Manifests       │  • Create / Read / Update / Delete         │
│  • Drill-down dashboards        │  • Search (instant, fuzzy, contextual)     │
│  • What-if scenarios            │  • Audit (automatic, invisible)            │
│  • Exception hunting            │  • Predict (next action, autofill)         │
│  • Trend analysis               │                                            │
├─────────────────────────────────┼───────────────────────────────────────────┤
│  Power Users:                   │  Power Users:                              │
│  • CFO, Controller, Auditor     │  • Warehouse staff, Cashiers, Clerks       │
│  • Business Analyst             │  • Data Entry Operators                    │
│  • Board Member                 │  • Field Sales, Procurement Officers       │
└─────────────────────────────────┴───────────────────────────────────────────┘
```

**The Quorum Principle:** Give analysts the **6W1H Manifest** — a materialized view that answers every investigative question before they ask. Supercharge them with **CommandK** (⌘K) — a command palette that surfaces insights, not just navigation.

**The Cobalt Principle:** Respect the operator's time. They don't need dashboards; they need **SUMMIT buttons** — single actions that complete workflows. They don't need training; they need **predictive forms** that know what they're about to enter.

| Kernel | Design Mantra                       | Anti-Pattern                   |
| ------ | ----------------------------------- | ------------------------------ |
| Quorum | "Surface the truth before they ask" | Hiding data behind 5 clicks    |
| Cobalt | "One tap, done"                     | Asking for the same data twice |

**CRUD-SAP Explained:**

| Letter | Capability | Cobalt Benefit                                       |
| ------ | ---------- | ---------------------------------------------------- |
| **C**  | Create     | Smart defaults, template-based, minimal required     |
| **R**  | Read       | Fast lookup, recent items, favorites                 |
| **U**  | Update     | Inline editing, no page reloads                      |
| **D**  | Delete     | Soft delete with undo, never lose work accidentally  |
| **S**  | Search     | Global, fuzzy, contextual — find before you navigate |
| **A**  | Audit      | Invisible, automatic — every action traced           |
| **P**  | Predict    | Next action suggested, autofill from patterns        |

### §5 — The Nexus Doctrine (Flexibility with Memory)

> *"We do not block the nexus (the thread) — for business chaos needs flexibility NOW. But 10 years later, you will need to recall WHY."*

Traditional ERP systems enforce rigid rules: "You cannot post this invoice because it violates policy X." This creates workarounds, shadow systems, and frustrated users.

**AXIS takes a different path:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE NEXUS DOCTRINE                                       │
│                                                                              │
│   PAST ◀────────────────── PRESENT ──────────────────▶ FUTURE               │
│                                                                              │
│   Immutable Record         Flexible Action           Predictive Guidance    │
│   "What happened"          "What you can do"         "What may happen"      │
│                                                                              │
│   • Cannot be changed      • Warn, don't block       • Risk indicators      │
│   • 6W1H preserved         • Danger zones visible    • Compliance forecast  │
│   • 100-year recall        • Override with evidence  • Scenario modeling    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The Immutable Past:**
Every action that happened is recorded with full **6W1H context**:

```typescript
interface NexusRecord {
  // 6W1H Immutable Context
  who: ActorRef;           // WHO performed this action
  what: ActionType;        // WHAT action was taken
  when: ISO8601;           // WHEN it occurred (immutable timestamp)
  where: LocationContext;  // WHERE in the system/process
  why: ReasonCode;         // WHY (reason selected or provided)
  which: OptionsPresented; // WHICH alternatives were available
  how: ExecutionPath;      // HOW it was executed (method, approval chain)

  // Danger Zone Metadata
  violated_policies: PolicyRef[];      // What rules this violated
  override_justification: string;      // Why user proceeded anyway
  risk_score_at_time: number;          // Risk assessment when action taken
  acknowledged_warnings: WarningRef[]; // What warnings were shown and accepted
}
```

**The Flexible Present:**
We do not block legitimate business needs. Instead:

| Situation                    | Traditional ERP        | AXIS Approach                       |
| ---------------------------- | ---------------------- | ----------------------------------- |
| Invoice exceeds credit limit | ❌ "Error: Cannot post" | ⚠️ "Danger Zone" + require approval  |
| Posting to closed period     | ❌ "Period is closed"   | ⚠️ Record override + audit trail     |
| Price below cost             | ❌ "Margin violation"   | ⚠️ Flag + manager notification       |
| Unusual transaction pattern  | ❌ Block or ignore      | ⚠️ Risk score + evidence requirement |

**The 100-Year Recall Promise:**
Every decision, especially those that override policies, is preserved so that:
- Auditors 10 years later can understand **why** it was done
- Regulators can see the **evidence** that justified the exception
- New management can learn from **patterns** of past decisions

### §6 — The PROTECT. DETECT. REACT. Mantra

> *"It's never too late to REACT when you DETECT it, because you PROTECTED it."*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│         ╔═══════════════╗                                                    │
│         ║   PROTECT     ║  ◀── Foundation: Immutable records, access        │
│         ║   (Always On) ║       controls, encryption, audit trail           │
│         ╚═══════╦═══════╝                                                    │
│                 │                                                            │
│                 ▼                                                            │
│         ╔═══════════════╗                                                    │
│         ║    DETECT     ║  ◀── Continuous: Anomaly detection, policy        │
│         ║  (Vigilant)   ║       violations, reconciliation gaps             │
│         ╚═══════╦═══════╝                                                    │
│                 │                                                            │
│                 ▼                                                            │
│         ╔═══════════════╗                                                    │
│         ║    REACT      ║  ◀── Timely: Alerts, workflows, corrections,      │
│         ║  (Responsive) ║       reversals, escalations                      │
│         ╚═══════════════╝                                                    │
│                                                                              │
│   The chain is unbroken: You can REACT because you DETECT.                   │
│   You can DETECT because you PROTECT.                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**PROTECT (The Foundation)**

| Protection Layer        | What It Preserves                             |
| ----------------------- | --------------------------------------------- |
| Immutable Event Log     | Every action, forever, tamper-evident         |
| 6W1H Contextual Records | Full decision context, not just outcomes      |
| Access Control (RBAC)   | Who can do what, enforced at every layer      |
| Encryption at Rest      | Data protected even if storage is compromised |
| Tenant Isolation        | One customer's data never visible to another  |

**DETECT (The Vigilance)**

| Detection Mechanism       | What It Catches                               |
| ------------------------- | --------------------------------------------- |
| Reconciliation Engine     | Subledger ≠ GL, Stock ≠ Valuation             |
| Policy Violation Monitor  | Actions in "Danger Zone" over threshold       |
| Anomaly Detection         | Unusual patterns (amount, frequency, actor)   |
| Aging Alerts              | Unpaid invoices, stale inventory, open orders |
| Segregation of Duty Check | Same actor in conflicting roles               |

**REACT (The Response)**

| Reaction Type       | When It Triggers                            |
| ------------------- | ------------------------------------------- |
| Real-time Alert     | Critical threshold breached                 |
| Workflow Escalation | Approval chain invoked                      |
| Automatic Hold      | High-risk transaction paused for review     |
| Corrective Entry    | System-suggested reversal + re-entry        |
| Compliance Report   | Periodic summary of all Danger Zone actions |

**The PDR Promise:**

> Because AXIS protects every action with immutable 6W1H records, we can detect anomalies against a trusted baseline. Because we detect, we can react — even years later — with full context of what happened and why.

**There is no statute of limitations on truth.**

### §7 — The Human-Machine Symbiosis (Adapt. Adopt. Alive.)

> *"AI is not here to replace humans. But humans will be replaced by AI — if they do not adapt, adopt, and stay alive with AI."*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HUMAN-MACHINE SYMBIOSIS                                   │
│                                                                              │
│   ┌─────────────────────────────┐     ┌─────────────────────────────────┐   │
│   │         HUMAN               │     │           MACHINE               │   │
│   │     (The Conductor)         │     │       (The Orchestra)           │   │
│   ├─────────────────────────────┤     ├─────────────────────────────────┤   │
│   │ • Drifts (forgets, varies)  │     │ • Stays consistent (never drifts)│  │
│   │ • Judges (context, ethics)  │     │ • Remembers (logs, caches, clouds)│ │
│   │ • Adapts (learns, evolves)  │     │ • Executes (fast, accurate, 24/7)│  │
│   │ • Optimizes (strategy)      │     │ • Scales (unlimited capacity)    │  │
│   │ • Decides (accountability)  │     │ • Tracks (every action, forever) │  │
│   └─────────────────────────────┘     └─────────────────────────────────┘   │
│                                                                              │
│              │                                   │                           │
│              └───────────────┬───────────────────┘                           │
│                              ▼                                               │
│                    ┌─────────────────────┐                                   │
│                    │    EQUILIBRIUM      │                                   │
│                    │  Human + Machine    │                                   │
│                    │  = Opportunity      │                                   │
│                    └─────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The Machine Promise:**

| What Humans Forget...          | Machine Remembers                            |
| ------------------------------ | -------------------------------------------- |
| That conversation last quarter | Cookies, session logs, interaction history   |
| Why we made that decision      | 6W1H context stored forever                  |
| What the approval chain was    | Workflow audit trail with timestamps         |
| How we calculated that price   | Formula snapshots, version history           |
| When the policy changed        | Configuration changelog with effective dates |

**The Symbiosis Principle:**

```
LET Machine excel at:           LET Human excel at:
├─ Consistency                  ├─ Judgment
├─ Memory (never forgets)       ├─ Context (understands nuance)
├─ Speed (instant recall)       ├─ Ethics (right vs. wrong)
├─ Scale (handle millions)      ├─ Strategy (long-term vision)
├─ Logging (every action)       ├─ Relationships (trust, empathy)
└─ Automation (repetitive)      └─ Optimization (continuous improvement)
```

**The Equilibrium Opportunity:**

> *"Let machines improve our daily business life with what they do best — consistency, memory, and tireless execution. Let humans know them, practice them, optimize them — and together return to equilibrium."*

| Without Symbiosis            | With Symbiosis (AXIS)                         |
| ---------------------------- | --------------------------------------------- |
| Human forgets → data lost    | Machine remembers → human recalls when needed |
| Human drifts → inconsistency | Machine anchors → human stays on canon        |
| Human overloaded → errors    | Machine handles load → human focuses on value |
| Human unavailable → blocked  | Machine available 24/7 → business continues   |

**AXIS does not replace your team. AXIS amplifies your team.**

The logger somewhere is always running. The cache is always warm. The cloud is always available. As long as you named it, and the machine is alive, the truth will return.

### §8 — AFANDA: The Unified Board (Life is Chaos, Work Doesn't Have to Be)

> *"Let business come back to business. Life is chaos, but work doesn't have to be."*

**AFANDA** unifies communication, collaboration, and accountability across the hierarchy — inspired by the best of modern collaboration tools (Figma, FigJam, Slack) but anchored to **canonical business workflows**.

> *AFANDA* — from "Agenda" + "Panda" (reliable, ever-present, nurturing) — the always-available board that ensures nothing falls through the cracks.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE AFANDA HIERARCHY                                 │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      ORGANIZATION BOARD                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ • Strategic announcements    • Company-wide policies            │  │  │
│  │  │ • Cross-team visibility      • Executive dashboards             │  │  │
│  │  │ • Consolidated approvals     • Compliance summaries             │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ▲                                       │
│                                      │ escalates / reports                   │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                         TEAM BOARD                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ • Team discussions           • Shared brainstorming (FigJam-style)│ │  │
│  │  │ • Approval workflows         • Task assignments                  │  │  │
│  │  │ • Team dashboards            • Collaborative documents           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ▲                                       │
│                                      │ contributes / requests                │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                       INDIVIDUAL BOARD                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ • Personal tasks             • Self-service requests            │  │  │
│  │  │ • My approvals pending       • My notifications                 │  │  │
│  │  │ • My performance metrics     • My learning path                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The "No Excuse" Accountability Model:**

> *"You can never say you missed the message. People know when you haven't read it. This is not surveillance — this is fair equilibrium."*

| Traditional Excuse            | AXIS Reality                                     |
| ----------------------------- | ------------------------------------------------ |
| "I didn't see the email"      | Read receipts show you opened it at 2:47 PM      |
| "I wasn't informed"           | Notification log shows delivery + acknowledgment |
| "I didn't know it was urgent" | Priority flag was set; SLA timer was visible     |
| "No one told me to approve"   | Approval request in your queue for 3 days        |
| "I forgot to follow up"       | System reminded you twice; escalated on day 5    |

**This is not spying. This is fair equilibrium.**

Everyone operates under the same rules. Visibility creates accountability. Accountability creates trust. Trust enables delegation. Delegation enables scale.

**AFANDA Capabilities:**

| Capability                | What It Enables                                    |
| ------------------------- | -------------------------------------------------- |
| **Sharing Board**         | FigJam-style brainstorming, sticky notes, diagrams |
| **Approval Queue**        | Hierarchical approval with SLA timers              |
| **Consultation Thread**   | Structured discussion with canonical outcomes      |
| **Employee Self-Service** | Leave requests, expense claims, asset requests     |
| **Read Receipts**         | Know who saw what, when                            |
| **Escalation Ladder**     | Auto-escalate when SLA breaches                    |
| **Mention & Notify**      | @person with audit trail                           |

**The Hierarchical Approval Flow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  REQUESTER  │────▶│  MANAGER    │────▶│  DIRECTOR   │────▶│  EXECUTIVE  │
│  (Creates)  │     │  (Reviews)  │     │  (Approves) │     │  (Ratifies) │
└─────────────┘     └──────┬──────┘     └──────┬──────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌──────────────────────────────────┐
                    │         AUDIT TRAIL              │
                    │  WHO approved, WHEN, with WHAT   │
                    │  evidence, under WHICH policy    │
                    └──────────────────────────────────┘
```

**The AFANDA Promise:**

| Chaos (Before)                 | Order (With AFANDA)                        |
| ------------------------------ | ------------------------------------------ |
| Emails lost in inbox           | Everything in one AFANDA board             |
| Approvals delayed indefinitely | SLA timers with auto-escalation            |
| "I'll check and get back"      | Real-time visibility, instant decisions    |
| Information silos              | Hierarchical boards with proper visibility |
| Accountability gaps            | Read receipts + audit trail + timestamps   |

> *"Life is chaos, but work doesn't have to be. AXIS brings business back to business."*

---

## Part II: Prime Directives (Non-Negotiable Laws)

These are the **invariants** that never change. They are not features. They are physics.

### P1 — Canonical Source of Truth (The Ledger Never Lies)

One definition for:
- **Master data** (customers, suppliers, items, chart of accounts)
- **Transactions** (sales, purchases, stock moves, journal entries)
- **State** (document lifecycle + approvals)

**Law:** If two systems can disagree on the same entity, you have applications, not an ERP.

**Implementation:** Every entity has exactly one canonical home. References are by stable ID, never by copy.

---

### P2 — Economic Event Model (Events, Not Screens)

Everything important in business is an **event** that affects:

| Domain         | Event Effect                                  |
| -------------- | --------------------------------------------- |
| **Money**      | Creates ledger postings (debit/credit)        |
| **Stock**      | Creates inventory movements (in/out/transfer) |
| **Obligation** | Creates or settles AR/AP entries              |
| **Commitment** | Advances the order→delivery→invoice chain     |

**Law:** Model *events and postings*, not UI screens. Screens are views; events are truth.

**Implementation:** Every business operation is captured as an immutable event with:
- `event_id` (UUID)
- `event_type` (canonical taxonomy)
- `actor` (who)
- `timestamp` (when)
- `source_document` (traceability)
- `postings[]` (what changed)

---

### P3 — Double-Entry Immutability (The 500-Year Principle)

```
For every posting:
  SUM(debits) = SUM(credits)

For all time:
  Posted entries are NEVER modified, only reversed.
```

**Law:** Once posted, an entry becomes history. History is corrected by new entries, never by erasure.

**Implementation:**
- Posted documents are locked
- Corrections create reversal entries + new entries
- Audit trail captures the complete correction chain

---

### P4 — Strong Boundaries (DDD / Bounded Contexts)

ERP is many domains. Don't let them bleed:

```
Sales ≠ Accounting ≠ Inventory ≠ Procurement
```

**Law:** Cross-domain access happens via *published contracts*, not internal tables.

**Implementation:**
- Each domain owns its schema
- Inter-domain communication via events and APIs
- No direct foreign keys across domain boundaries (use correlation IDs)

---

### P5 — Configurable, Not Customizable

**Law:** The engine is invariant. Behavior changes through configuration, not code forks.

**Configuration Surface:**
| Category          | Examples                                 |
| ----------------- | ---------------------------------------- |
| **Numbering**     | Invoice sequences, prefixes per entity   |
| **Approval**      | Thresholds, roles, evidence requirements |
| **Tax Rules**     | GST/VAT mapping, inclusive/exclusive     |
| **Costing**       | FIFO/Weighted Average, per warehouse     |
| **Posting Rules** | Document → Account mappings              |
| **Workflows**     | State transitions, gate conditions       |

**Implementation:** Custom code requires explicit gates:
1. Review by maintainer
2. Isolation in extension namespace
3. Versioned contract compatibility

---

### P6 — Multi-Tenant Safety as First-Class

**Law:** Tenant isolation, audit, and permissions are the product — not hardening to add later.

**Implementation:**
- Every query is tenant-scoped (RLS enforced at database level)
- Every write is policy-checked before execution
- Every action is traceable to actor + timestamp

---

### P7 — Auditability Everywhere (The Evidence Chain)

**Law:** ERP must answer: **who did what, when, why "approved", based on what evidence**.

**Implementation:**
- Every state transition produces an immutable audit entry
- Approvals capture: approver, timestamp, delegation chain, attached evidence
- Audit entries reference the exact schema version active at time of action

---

### P8 — Reconciliation as a Design Goal

ERP is 60% reconciliation:

| Reconciliation    | Question                                  |
| ----------------- | ----------------------------------------- |
| Invoice ↔ Payment | Is this invoice settled?                  |
| Stock ↔ Valuation | Does physical inventory match book value? |
| Order ↔ Delivery  | Has the commitment been fulfilled?        |
| Subledger ↔ GL    | Do subsidiary accounts roll up correctly? |

**Law:** Build reconciliation primitives early — not as reports later.

**Implementation:**
- Every document type has a defined reconciliation target
- Reconciliation status is a first-class field, not derived
- Discrepancies trigger workflow alerts

---

## Part III: The Core Domains (Canonical ERP Map)

Think in **stable domains**, not modules-by-feature:

### A) Master Data (MDM) — The Nouns

| Entity            | Purpose                        | Canonical Home        |
| ----------------- | ------------------------------ | --------------------- |
| Customer          | Who we sell to                 | `mdm.customer`        |
| Supplier          | Who we buy from                | `mdm.supplier`        |
| Item              | What we trade                  | `mdm.item`            |
| UoM               | How we measure                 | `mdm.unit_of_measure` |
| Warehouse         | Where we store                 | `mdm.warehouse`       |
| Chart of Accounts | How we classify money          | `accounting.coa`      |
| Tax Code          | How government takes its share | `mdm.tax_code`        |
| Price List        | How we price                   | `mdm.price_list`      |

---

### B) Commercial Documents — The Verbs

**Sales Flow:**
```
Quote → Sales Order → Delivery → Invoice → Payment
```

**Purchase Flow:**
```
Purchase Request → Purchase Order → Receipt → Supplier Bill → Payment
```

**Document Invariants:**
- Has a lifecycle state machine
- Composed of line items
- Transitions are controlled (RBAC + approval + evidence gates)

---

### C) Inventory & Costing — Physical Truth

| Capability          | Description                              |
| ------------------- | ---------------------------------------- |
| Stock Moves         | In/Out/Transfer with full traceability   |
| Reservations        | Committed stock against orders           |
| Lot/Serial Tracking | Batch and unit-level traceability        |
| Valuation           | FIFO / Weighted Average / Standard       |
| Adjustments         | Reconciliation entries with reason codes |

---

### D) Accounting (GL + Subledgers) — Financial Truth

| Component      | Purpose                            |
| -------------- | ---------------------------------- |
| Journal Entry  | The atomic unit of financial truth |
| General Ledger | Aggregated account balances        |
| AR Subledger   | Customer receivables detail        |
| AP Subledger   | Supplier payables detail           |
| Cash/Bank      | Monetary position tracking         |
| Period Close   | Temporal boundary enforcement      |

**Subledger Law:** Financial statements derive from GL. GL derives from posted journals. Journals derive from economic events. The chain is unbroken.

---

### E) Controls & Governance — Trust Infrastructure

| Component          | Purpose                       |
| ------------------ | ----------------------------- |
| RBAC               | Who can do what               |
| Approval Workflows | Multi-step authorization      |
| Policies           | Business rules as code        |
| Audit Trail        | Immutable history             |
| Evidence Store     | Attachments linked to actions |

---

### F) Reporting & Analytics — Derived Views

| Type                   | Purpose                           |
| ---------------------- | --------------------------------- |
| Operational Dashboards | Real-time business pulse          |
| Financial Reports      | Statements, trial balance, aging  |
| Drilldown              | From aggregate to source document |
| Reconciliation Reports | Discrepancy identification        |

**Reporting Law:** Reports are projections of truth, never sources of truth.

---

## Part IV: Canonical Object Model

### 4.1 Documents (The Workflow Spine)

Every document follows the canonical spine:

```
DRAFT → SUBMITTED → APPROVED → POSTED → (VOID/REVERSED)
```

| State         | Meaning                             |
| ------------- | ----------------------------------- |
| **DRAFT**     | Work in progress, fully editable    |
| **SUBMITTED** | Pending approval, limited edits     |
| **APPROVED**  | Permission checkpoint passed        |
| **POSTED**    | Creates immutable events + postings |
| **VOID**      | Cancelled before posting            |
| **REVERSED**  | Corrected after posting             |

**Spine Law:** Never allow "editing posted history." Corrections create new entries.

---

### 4.2 Economic Events (The Truth Layer)

Examples:
- `StockMovePosted`
- `InvoicePosted`
- `PaymentApplied`
- `JournalPosted`

**Event Schema (Canonical with 6W1H):**
```typescript
interface EconomicEvent {
  id: UUID;
  type: EventType;
  postings: Posting[];

  // ═══════════════════════════════════════════════════════════════
  // 6W1H CONTEXT (The Nexus Doctrine)
  // ═══════════════════════════════════════════════════════════════
  who: {
    actor: ActorRef;              // WHO performed this action
    on_behalf_of?: ActorRef;      // Delegation/impersonation
    approval_chain: ActorRef[];   // WHO approved (if applicable)
  };
  what: {
    action: ActionType;           // WHAT action was taken
    source_document: DocumentRef; // WHAT document triggered this
    affected_entities: EntityRef[];
  };
  when: {
    timestamp: ISO8601;           // WHEN it occurred (immutable)
    effective_date: Date;         // WHEN it takes effect (accounting)
    period: FiscalPeriod;         // WHEN in fiscal calendar
  };
  where: {
    tenant: TenantRef;            // WHERE (organization)
    location?: LocationRef;       // WHERE (warehouse, branch)
    system_context: SystemContext;// WHERE in the system
  };
  why: {
    reason_code?: ReasonCode;     // WHY (from predefined list)
    justification?: string;       // WHY (free text explanation)
    business_context?: string;    // WHY (broader context)
  };
  which: {
    options_presented?: Option[]; // WHICH alternatives were available
    selected_option?: Option;     // WHICH was chosen
    policy_overrides?: PolicyRef[];// WHICH rules were overridden
  };
  how: {
    execution_path: ExecutionPath;// HOW it was executed
    method: 'ui' | 'api' | 'import' | 'automation';
    evidence?: EvidenceRef[];     // HOW it was justified
  };

  // ═══════════════════════════════════════════════════════════════
  // DANGER ZONE METADATA (If action violated policies)
  // ═══════════════════════════════════════════════════════════════
  danger_zone?: {
    violated_policies: PolicyRef[];
    risk_score: number;           // 0-100 at time of action
    warnings_acknowledged: WarningRef[];
    override_approved_by?: ActorRef;
  };

  // Immutability enforced
  readonly: true;
}
```

**Event Invariants:**
- Immutable once created
- Full 6W1H traceability (100-year recall guarantee)
- Produces downstream postings
- Danger Zone metadata preserved if policies were overridden

---

### 4.3 Ledger Postings (Accounting Truth)

```typescript
interface LedgerPosting {
  id: UUID;
  journal_entry_id: UUID;
  account_id: AccountRef;
  debit: Decimal;
  credit: Decimal;
  currency: CurrencyCode;
  effective_date: Date;

  // Invariant: (debit > 0) XOR (credit > 0)
}
```

**Posting Law:** Financial statements are derived from postings, not from documents directly.

---

## Part V: The Posting Spine (How Documents Become Truth)

When a document transitions to **POSTED**:

```
1. VALIDATE
   ├─ Schema validation (Zod contract)
   ├─ Policy validation (business rules)
   └─ Invariant validation (domain constraints)

2. CREATE EVENTS
   └─ Immutable economic event(s)

3. CREATE INVENTORY POSTINGS (if applicable)
   ├─ Stock movements
   └─ Valuation entries

4. CREATE ACCOUNTING POSTINGS
   ├─ Journal entry lines
   └─ Subledger updates

5. LOCK DOCUMENT
   └─ No further edits allowed

6. EMIT OUTBOX MESSAGE
   └─ Integrations + async workflows
```

This is how you prevent **ERP drift** — the silent divergence between operational systems and financial truth.

---

## Part VI: Multi-Tenancy Pattern

### Hierarchy

```
Organization (Legal Entity)
    │
    ├── Team (Business Unit / Branch)
    │       │
    │       └── User (Individual)
    │
    └── Accounting Entity Boundary
            │
            └── Where the books close
```

**Multi-Tenant Law:** Your *accounting entity boundary* must be explicit:
- The Organization is typically the legal/accounting entity
- Teams are operational subdivisions, not separate ledgers (unless configured)
- Consolidation rolls up multiple Organizations

---

## Part VII: Integration Pattern (No Silos)

### Required Integration Patterns

| Pattern              | Purpose                                 |
| -------------------- | --------------------------------------- |
| **Stable APIs**      | Public contracts with versioning        |
| **Webhooks**         | Outbound event notifications            |
| **Outbox**           | Reliable event delivery (at-least-once) |
| **Idempotency Keys** | Safe retry semantics                    |
| **Import Pipelines** | CSV/Excel → validated via schemas       |

### Open Standard Support

| Standard      | Domain                                         |
| ------------- | ---------------------------------------------- |
| **UBL**       | Universal Business Language (invoices, orders) |
| **PEPPOL**    | Pan-European e-invoicing                       |
| **ISO 20022** | Financial messaging                            |
| **GS1**       | Product identification (barcodes, GTINs)       |
| **XBRL**      | Financial reporting                            |

---

## Part VIII: Regulatory Compliance Patterns

### Tax Compliance

| Jurisdiction     | Requirements                                 |
| ---------------- | -------------------------------------------- |
| **India GST**    | E-invoicing (IRN), E-way bills, GSTR returns |
| **EU VAT**       | Reverse charge, intra-community, OSS         |
| **US Sales Tax** | Nexus-based, marketplace facilitator         |
| **MENA VAT**     | KSA ZATCA, UAE FTA                           |

### Audit Compliance

| Framework     | What AXIS Provides                                    |
| ------------- | ----------------------------------------------------- |
| **SOX**       | Internal controls, segregation of duties, audit trail |
| **GDPR**      | Data subject rights, consent tracking, erasure        |
| **ISO 27001** | Access controls, audit logging, incident response     |

---

## Part IX: The Level 1 / 2 / 3 Build Plan (Anti-Feature-Race)

### Level 1 — Essential to Ship (Business Backbone)

**Non-Negotiable for v1.0:**
- [ ] Tenant + RBAC + Audit Trail
- [ ] Master Data (customers, suppliers, items, COA, taxes)
- [ ] Sales: Order → Invoice → Payment Applied
- [ ] Purchase: PO → Bill → Payment Applied
- [ ] Inventory: Stock In/Out + On-Hand + Adjustments
- [ ] Accounting: Journal Entries, AR/AP, Trial Balance, Period Lock
- [ ] Posting Spine + Reversal/Correction Mechanisms
- [ ] Basic Reconciliation (Invoice ↔ Payment)

### Level 2 — Operational Excellence

**After Product-Market Fit:**
- [ ] Approvals + Evidence Gates per Document Type
- [ ] Costing (FIFO/Weighted Average), Inventory Valuation Reports
- [ ] Partial Delivery / Partial Invoicing
- [ ] Bank Reconciliation
- [ ] Multi-Warehouse, Transfers, Reservations
- [ ] Role-Based Dashboards + Drilldown
- [ ] Import/Export Pipelines + Scheduled Jobs

### Level 3 — Premium Unlock (Competitive Moat)

**Platform Maturity:**
- [ ] Advanced Workflow Designer (Visual Policy Builder)
- [ ] Forecasting + Scenario Planning (Boardroom-Grade)
- [ ] Multi-Entity Consolidation (Group Reporting)
- [ ] Advanced Permissions (Field-Level, Row-Level Policies)
- [ ] Full Event-Sourcing Views + Audit Replay
- [ ] Marketplace Extensions / App Ecosystem

---

## Part X: The Practical Drift Prevention Rule

When tempted to add a "feature," ask which bucket it belongs to:

| Bucket                | What It Means                       | Example               |
| --------------------- | ----------------------------------- | --------------------- |
| **New Document Type** | Needs state machine + posting rules | Credit Note           |
| **New Posting Rule**  | Accounting/inventory truth changes  | Consignment           |
| **New Configuration** | Same engine, different behavior     | Tax inclusive pricing |
| **New View/Report**   | Derived, not new truth              | Aging report          |
| **New Automation**    | Outbox/webhook/scheduled job        | Payment reminder      |

**If you can't classify it, it's a one-off that will drift.**

---

## Part XI: The AXIS Mental Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DUAL-KERNEL UI LAYER                                │
│  ┌─────────────────────────────────┬───────────────────────────────────────┐│
│  │       QUORUM ◇ (Analysis)       │          COBALT ■ (Execution)         ││
│  │  ┌───────────────────────────┐  │  ┌─────────────────────────────────┐  ││
│  │  │ CommandK ⌘ + Manifests    │  │  │ CRUD-SAP + SUMMIT Buttons       │  ││
│  │  │ 6W1H Dashboards           │  │  │ One Tap, Done                   │  ││
│  │  │ Drill-down to Source      │  │  │ Predictive Forms                │  ││
│  │  └───────────────────────────┘  │  └─────────────────────────────────┘  ││
│  └─────────────────────────────────┴───────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BFF / API GATEWAY                                │
│   ┌──────────────┬──────────────┬──────────────┬──────────────────────────┐ │
│   │ Auth Boundary│ Input Valid. │ Idempotency  │ Danger Zone Detection    │ │
│   └──────────────┴──────────────┴──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN SERVICES                                    │
│   ┌──────────┬──────────┬───────────┬────────────┬───────────┬───────────┐  │
│   │  Sales   │ Purchase │ Inventory │ Accounting │ Controls  │   PDR     │  │
│   │          │          │           │            │           │ Engine    │  │
│   └──────────┴──────────┴───────────┴────────────┴───────────┴───────────┘  │
│                                     │                                        │
│              ┌──────────────────────┼──────────────────────┐                 │
│              ▼                      ▼                      ▼                 │
│   ┌──────────────────────┐ ┌─────────────────┐ ┌───────────────────────────┐│
│   │ DOCUMENTS            │ │ EVENTS + 6W1H   │ │ POSTINGS                  ││
│   │ (State Machine)      │ │ (Nexus Records) │ │ (Ledger/Stock/Subledger)  ││
│   │ Danger Zone Warnings │ │ Immutable Truth │ │ Double-Entry Enforced     ││
│   └──────────────────────┘ └─────────────────┘ └───────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROTECT. DETECT. REACT. LAYER                             │
│  ┌────────────────────┬─────────────────────┬──────────────────────────────┐│
│  │      PROTECT       │       DETECT        │           REACT              ││
│  │ ─────────────────  │ ──────────────────  │ ────────────────────────     ││
│  │ • Immutable Logs   │ • Reconciliation    │ • Real-time Alerts           ││
│  │ • 6W1H Context     │ • Anomaly Detection │ • Workflow Escalation        ││
│  │ • Access Control   │ • Policy Violation  │ • Corrective Entries         ││
│  │ • Encryption       │ • Aging Monitors    │ • Compliance Reports         ││
│  └────────────────────┴─────────────────────┴──────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PERSISTENCE & INTEGRATION                              │
│   ┌────────────────────┬─────────────────────┬────────────────────────────┐ │
│   │ PostgreSQL         │ Outbox Pattern      │ External Integrations      │ │
│   │ (Source of Truth)  │ (Reliable Delivery) │ (Webhooks, APIs, UBL)      │ │
│   │ RLS + Audit Tables │ Event Sourcing      │ Open Standards             │ │
│   └────────────────────┴─────────────────────┴────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Flow of Truth

```
User Action (Quorum or Cobalt)
         │
         ▼
┌─────────────────┐     ┌──────────────────────────────────────────────────┐
│ Danger Zone?    │────▶│ YES: Show warning, require acknowledgment,       │
│ (Policy Check)  │     │      record 6W1H context, allow with evidence    │
└────────┬────────┘     └──────────────────────────────────────────────────┘
         │ NO (or acknowledged)
         ▼
┌─────────────────┐
│ Create Event    │────▶ Immutable 6W1H Record (PROTECT)
│ with 6W1H       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Postings │────▶ Debits = Credits (The 500-Year Law)
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PDR Engine      │────▶ DETECT anomalies ──▶ REACT with alerts/workflows
│ (Continuous)    │
└─────────────────┘
```

---

## Appendix A: Canonical Event Taxonomy

| Event Type          | Domain         | Creates Postings             |
| ------------------- | -------------- | ---------------------------- |
| `order.created`     | Sales/Purchase | No (commitment only)         |
| `order.confirmed`   | Sales/Purchase | No (commitment firmed)       |
| `delivery.posted`   | Inventory      | Stock movement + valuation   |
| `invoice.posted`    | Accounting     | AR/AP + revenue/expense      |
| `payment.applied`   | Accounting     | Cash/bank + AR/AP settlement |
| `journal.posted`    | Accounting     | GL postings                  |
| `adjustment.posted` | Inventory      | Stock + valuation correction |

---

## Appendix B: Open Source Reference Stack

| Layer         | Recommended Open Source | AXIS Role                 |
| ------------- | ----------------------- | ------------------------- |
| **Database**  | PostgreSQL + Citus      | Transactional truth store |
| **Search**    | Meilisearch / Typesense | Operational queries       |
| **Cache**     | Redis / Valkey          | Session + hot data        |
| **Queue**     | Redis Streams / BullMQ  | Job processing            |
| **Auth**      | Auth.js / Lucia         | Identity + sessions       |
| **Analytics** | ClickHouse              | Event aggregations        |
| **Reporting** | Metabase / Superset     | Dashboard layer           |

---

## Appendix C: Document Navigation

### A-Series (Architecture)

| Document                                 | Status    | Purpose                                    |
| ---------------------------------------- | --------- | ------------------------------------------ |
| **A01-CANONICAL.md**                     | ✅ v0.3.0  | Philosophy, principles, mantras (this doc) |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)     | ✅ v0.2.0  | Implementation roadmap                     |
| [A03-TSD.md](./A03-TSD.md)               | 📋 Planned | Technical schema design                    |
| [A04-CONTRACTS.md](./A04-CONTRACTS.md)   | 📋 Planned | Zod contract registry                      |
| [A05-DEPLOYMENT.md](./A05-DEPLOYMENT.md) | 📋 Planned | Infrastructure patterns                    |
| [A06-GLOSSARY.md](./A06-GLOSSARY.md)     | 📋 Planned | Terms and definitions                      |

### B-Series (Implementation Phases)

| Document                                         | Phase | Status    | Purpose                    |
| ------------------------------------------------ | ----- | --------- | -------------------------- |
| [B01-POSTING.md](./B01-DOCUMENTATION.md)         | B1    | ✅ v0.2.0  | Posting Spine Constitution |
| [B02-DOMAINS.md](./B02-DOMAINS.md)               | B2    | 📋 Planned | Domain Map & Boundaries    |
| [B03-MDM.md](./B03-MDM.md)                       | B3    | 📋 Planned | Master Data Registry       |
| [B04-SALES.md](./B04-SALES.md)                   | B4    | 📋 Planned | Sales Flow                 |
| [B05-PURCHASE.md](./B05-PURCHASE.md)             | B5    | 📋 Planned | Purchase Flow              |
| [B06-INVENTORY.md](./B06-INVENTORY.md)           | B6    | 📋 Planned | Inventory Spine            |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)         | B7    | 📋 Planned | Accounting Core            |
| [B08-CONTROLS.md](./B08-CONTROLS.md)             | B8    | 📋 Planned | Controls & PDR             |
| [B09-RECONCILIATION.md](./B09-RECONCILIATION.md) | B9    | 📋 Planned | Reconciliation Engine      |
| [B10-UX.md](./B10-UX.md)                         | B10   | 📋 Planned | Quorum + Cobalt UX         |
| [B11-AFANDA.md](./B11-AFANDA.md)                 | B11   | 📋 Planned | AFANDA Platform            |
| [B12-INTELLIGENCE.md](./B12-INTELLIGENCE.md)     | B12   | 📋 Planned | Intelligence Layer         |

### E-Series (Design System)

| Document                                         | Status    | Purpose                           |
| ------------------------------------------------ | --------- | --------------------------------- |
| [E01-DESIGN-SYSTEM.md](./E01-DESIGN-SYSTEM.md)   | ✅ v0.1.0  | Design System Constitution        |
| [E02-BLOCKS.md](./E02-BLOCKS.md)                 | ✅ v0.1.0  | Block Library & Patterns          |
| [E03-IMPLEMENTATION.md](./E03-IMPLEMENTATION.md) | ✅ v0.1.0  | Implementation Guide & Best Practices |

---

## Document Governance

| Field            | Value                  |
| ---------------- | ---------------------- |
| **Status**       | Draft                  |
| **Version**      | 0.3.0                  |
| **Author**       | AXIS Architecture Team |
| **Last Updated** | 2026-01-22             |
| **Review Cycle** | Quarterly              |

---

## Appendix D: AXIS Core Mantras (Quick Reference)

| Mantra                            | Meaning                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| **Debits = Credits**              | The 500-year truth that never changes                         |
| **Quorum + Cobalt**               | Two kernels: Analysis (6W1H) + Execution (CRUD-SAP)           |
| **Nexus Doctrine**                | Don't block the thread; record the truth with 6W1H            |
| **PROTECT. DETECT. REACT.**       | The chain of trust that enables recovery                      |
| **Danger Zone, Not Dead End**     | Warn and record, don't block legitimate business needs        |
| **100-Year Recall**               | Every decision recoverable with full context, forever         |
| **One Tap, Done**                 | Cobalt users deserve SUMMIT buttons, not workflows            |
| **Surface Before They Ask**       | Quorum users deserve materialized manifests, not report menus |
| **Adapt. Adopt. Alive.**          | Humans thrive with AI, not against it                         |
| **Human Drifts, Machine Anchors** | Let machines excel at consistency; humans excel at judgment   |
| **Life is Chaos, Work Isn't**     | AFANDA boards bring order to business collaboration           |
| **No Excuse Accountability**      | You can't say you missed it; the system knows                 |
| **Fair Equilibrium**              | Visibility is not surveillance; it's trust infrastructure     |

---

> *"The compass does not tell you where to go. It tells you which way is North. In business, North is truth. AXIS is your compass."*
>
> *"We do not block the nexus. We illuminate the danger zone and preserve the 6W1H — so that 100 years from now, the truth is still recoverable."*
>
> *"AI is not here to replace you. But you will be replaced — if you do not adapt, adopt, and stay alive with AI. Human drifts, but machine anchors. Together: equilibrium."*
>
> *"Life is chaos, but work doesn't have to be. Let business come back to business."*
