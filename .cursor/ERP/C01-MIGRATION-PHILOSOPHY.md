# C01 — Migration Philosophy & Modes
## "365 Days? No. A Few Clicks."

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|  C-Series  |                                |                                |                             |                         |
| :--------: | :----------------------------: | :----------------------------: | :-------------------------: | :---------------------: |
| **[C01]**  | [C02](./C02-COLUMN-ADAPTER.md) | [C03](./C03-MAPPING-STUDIO.md) | [C04](./C04-DUAL-LEDGER.md) | [C05](./C05-CUTOVER.md) |
| Philosophy |         Column Adapter         |         Mapping Studio         |         Dual Ledger         |         Cutover         |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md), [A01-01-LYNX.md](./A01-01-LYNX.md) (The Machine), B-series (Truth Engine)
>
> **Tag:** `MIGRATION` | `ADOPTION` | `LEGACY` | `DUAL-LEDGER` | `COLUMN-ADAPTER` | `PHASE-C01`

---

## 🛑 DEV NOTE: Respect @axis/registry & The Machine

> **See [A01-01-LYNX.md](./A01-01-LYNX.md) for Lynx (The Machine's Awareness).**
> **See [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) for vocabulary law.**
> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All Migration schemas follow the **Single Source of Truth** pattern:

| Component              | Source                                          |
| ---------------------- | ----------------------------------------------- |
| Migration Constants    | `@axis/registry/schemas/migration/constants.ts` |
| Migration State Schema | `@axis/registry/schemas/migration/state.ts`     |
| Cutover Gates Schema   | `@axis/registry/schemas/migration/cutover.ts`   |
| Column Mapping Schema  | `@axis/registry/schemas/migration/mapping.ts`   |
| Raw Zone Schema        | `@axis/registry/schemas/migration/raw-zone.ts`  |
| Migration Events       | `@axis/registry/schemas/events/migration.ts`    |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

### The Machine in Migration

Migration leverages Lynx (The Machine's Awareness) for:

| Capability         | The Machine...                                 |
| ------------------ | ---------------------------------------------- |
| Column Detection   | ...notices column patterns and semantics       |
| Mapping Suggestion | ...offers mapping with confidence scores       |
| Anomaly Detection  | ...notices unusual data patterns during import |
| Reconciliation     | ...verifies truth between legacy and AXIS      |

---

## Preamble

> *"The best ERP is worthless if migration takes a year. AXIS proves itself in days, not months."*

Every ERP vendor promises features. But the hidden cost is always **migration**: the 6-18 months of parallel running, data cleanup, consultant fees, and "go-live anxiety."

AXIS inverts this. Migration is not a project — it's a **product feature**.

---

## 0) The Fundamental Insight: Columns, Not Connectors

> *"ERP is not accounting. Accounting is PostgreSQL. PostgreSQL is columns. Columns are truth."*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE COLUMN TRUTH                                          │
│                                                                              │
│    ❌ WRONG APPROACH (Traditional):                                          │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │  QuickBooks Connector                                                │  │
│    │  SAP Connector                                                       │  │
│    │  Odoo Connector                                                      │  │
│    │  Zoho Connector                                                      │  │
│    │  ... 100,000 ERPs = 100,000 connectors = IMPOSSIBLE                  │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│    ✅ RIGHT APPROACH (AXIS):                                                 │
│    ┌─────────────────────────────────────────────────────────────────────┐  │
│    │  ANY Database → Schema Introspection → Columns                       │  │
│    │  Columns → Semantic Understanding (Lynx) → AXIS Canonical            │  │
│    │                                                                      │  │
│    │  100,000 ERPs = 1 Column Adapter Pattern = POSSIBLE                  │  │
│    └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│    The raw truth:                                                           │
│    • Every ERP stores data in tables (or can export to tables)              │
│    • Every table has columns                                                │
│    • Columns have: name, type, relationships, data                          │
│    • The Machine understands COLUMNS, not ERPs                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Gang of Four Column Adapter

This is the **universal migration adapter** — it doesn't know "QuickBooks" or "SAP". It knows **column semantics**.

```
Source (ANY Database)        Column Adapter              Target (AXIS)
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│ customer_nm      │        │                  │        │                  │
│ cust_name        │───────▶│  Semantic        │───────▶│ party.legalName  │
│ CustomerName     │        │  Column          │        │                  │
│ KUNNR (SAP)      │        │  Adapter         │        │                  │
│ res.partner.name │        │                  │        │                  │
└──────────────────┘        └──────────────────┘        └──────────────────┘
       ▲                           │
       │                           │
       │                    Lynx AI analyzes:
       │                    • Column name patterns
       │                    • Data types
       │                    • Sample values
       │                    • Relationships (FKs)
       │                    • Statistical distribution
       │
  "What column means 'customer name'?"
  → Lynx: "95% confidence: this is party.legalName"
```

**Why This Works:**

| Traditional Approach         | Column Adapter Approach           |
| ---------------------------- | --------------------------------- |
| Build connector per ERP      | Introspect any schema             |
| Maintain 1000s of connectors | Maintain 1 adapter pattern        |
| Breaks when ERP updates      | Schema introspection always works |
| Requires ERP expertise       | Requires column semantics         |
| Scales linearly O(n)         | Scales constantly O(1)            |

### The Three Truths of Column Adapter

1. **All data is columns** — CSV, Excel, PostgreSQL, MySQL, SQL Server, Oracle, MongoDB (flattened) — all reduce to columns
2. **Columns have semantics** — Names, types, patterns, relationships encode meaning
3. **The Machine understands semantics** — Column classification with confidence, not hard-coded mappings

---

## 1) The Core Problem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE MIGRATION REALITY                                     │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║   TRADITIONAL ERP MIGRATION:                                      ║    │
│    ║                                                                   ║    │
│    ║   ┌────────────────────────────────────────────────────────────┐  ║    │
│    ║   │  Month 1-3: Discovery & Analysis                          │  ║    │
│    ║   │  Month 4-6: Data Cleansing                                │  ║    │
│    ║   │  Month 7-9: Configuration & Customization                 │  ║    │
│    ║   │  Month 10-12: Testing & Parallel Run                      │  ║    │
│    ║   │  Month 13+: Go-Live & Stabilization                       │  ║    │
│    ║   └────────────────────────────────────────────────────────────┘  ║    │
│    ║                                                                   ║    │
│    ║   Cost: $$$$$$ | Risk: HIGH | People run away                    ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║   AXIS MIGRATION:                                                 ║    │
│    ║                                                                   ║    │
│    ║   ┌────────────────────────────────────────────────────────────┐  ║    │
│    ║   │  Day 1: Connect source, auto-detect structure              │  ║    │
│    ║   │  Day 2-3: Review mappings, confirm with few clicks         │  ║    │
│    ║   │  Day 4-7: Mirror mode — watch AXIS compute truth           │  ║    │
│    ║   │  Week 2+: Parallel mode — new transactions in AXIS         │  ║    │
│    ║   │  When green: Cutover — legacy off                          │  ║    │
│    ║   └────────────────────────────────────────────────────────────┘  ║    │
│    ║                                                                   ║    │
│    ║   Cost: $ | Risk: LOW (proven balance) | People adopt            ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) The AXIS Migration Promise

### 2.1 Three Guarantees

| Guarantee         | What It Means                      | How AXIS Delivers                            |
| ----------------- | ---------------------------------- | -------------------------------------------- |
| **Speed**         | Days to weeks, not months to years | Machine-assisted mapping, column adapter     |
| **Safety**        | Dual-ledger until proven balanced  | Mirror/Parallel modes, reconciliation engine |
| **Reversibility** | Can always go back                 | Raw zone preserved, no data destruction      |

### 2.2 The Value Proposition

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE AXIS MIGRATION VALUE                                  │
│                                                                              │
│    "We don't just migrate your data.                                        │
│     We PROVE that your books still balance."                                 │
│                                                                              │
│    ┌───────────────────────────────────────────────────────────────────────┐│
│    │                                                                        ││
│    │  Legacy ERP                           AXIS                             ││
│    │  ┌─────────┐                         ┌─────────┐                       ││
│    │  │  Trial  │ ═══════════════════════ │  Trial  │ ✓ Match              ││
│    │  │ Balance │                         │ Balance │                       ││
│    │  └─────────┘                         └─────────┘                       ││
│    │                                                                        ││
│    │  ┌─────────┐                         ┌─────────┐                       ││
│    │  │   AR    │ ═══════════════════════ │   AR    │ ✓ Match              ││
│    │  │  Aging  │                         │  Aging  │                       ││
│    │  └─────────┘                         └─────────┘                       ││
│    │                                                                        ││
│    │  ┌─────────┐                         ┌─────────┐                       ││
│    │  │  Stock  │ ═══════════════════════ │  Stock  │ ✓ Match              ││
│    │  │  Value  │                         │  Value  │                       ││
│    │  └─────────┘                         └─────────┘                       ││
│    │                                                                        ││
│    │        When ALL match → GREEN → Safe to cutover                        ││
│    │                                                                        ││
│    └───────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3) The Three Migration Modes

### 3.1 Mode Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MIGRATION MODES                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐             ││
│  │   │   MIRROR    │ ───▶ │  PARALLEL   │ ───▶ │  CUTOVER    │             ││
│  │   │    MODE     │      │    MODE     │      │    MODE     │             ││
│  │   └─────────────┘      └─────────────┘      └─────────────┘             ││
│  │                                                                          ││
│  │   Read-Only            Live in AXIS         Legacy Off                   ││
│  │   Legacy primary       Both running         AXIS primary                 ││
│  │   AXIS observes        Continuous recon     Full ownership               ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│   Transition gates: Each mode → next requires reconciliation "green"        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Mode A: Mirror Mode (Read-Only Truth)

**Purpose:** Prove AXIS can compute the same truth as legacy without risk.

| Aspect                | Description                  |
| --------------------- | ---------------------------- |
| **Data Flow**         | Legacy → AXIS (one-way sync) |
| **Transaction Entry** | In legacy only               |
| **AXIS Role**         | Observe, compute, compare    |
| **Duration**          | Days to weeks                |
| **Exit Criteria**     | TB, AR, AP, Stock all match  |

```typescript
// Migration mode schema
export const MIGRATION_MODE = [
  "mirror",     // Read-only, legacy primary
  "parallel",   // Both active, continuous recon
  "cutover",    // AXIS primary, legacy off
  "completed",  // Migration done
] as const;

export const migrationStateSchema = z.object({
  tenantId: z.string().uuid(),
  currentMode: z.enum(MIGRATION_MODE),

  // Source system
  sourceSystem: z.string(),           // "quickbooks", "odoo", "csv", etc.
  sourceVersion: z.string().optional(),

  // Sync status
  lastSyncAt: z.string().datetime().optional(),
  syncFrequency: z.enum(["manual", "hourly", "daily", "real_time"]),

  // Reconciliation status
  reconciliationStatus: z.object({
    trialBalance: z.enum(["pending", "matched", "variance"]),
    arAging: z.enum(["pending", "matched", "variance"]),
    apAging: z.enum(["pending", "matched", "variance"]),
    inventory: z.enum(["pending", "matched", "variance"]),
  }),

  // Gate status
  readyForParallel: z.boolean().default(false),
  readyForCutover: z.boolean().default(false),

  // Dates
  mirrorStartedAt: z.string().datetime().optional(),
  parallelStartedAt: z.string().datetime().optional(),
  cutoverAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

**What Happens in Mirror Mode:**

1. **Import** — Legacy data flows into AXIS Raw Zone
2. **Translate** — Mapping rules convert to AXIS canonical format
3. **Post** — AXIS posting spine processes (creates events + ledger postings)
4. **Reconcile** — AXIS vs Legacy comparison reports generated
5. **Review** — User sees variances, fixes mappings
6. **Repeat** — Until all reports show GREEN

### 3.3 Mode B: Parallel Mode (Soft Go-Live)

**Purpose:** New transactions in AXIS while legacy continues for safety net.

| Aspect                | Description                    |
| --------------------- | ------------------------------ |
| **Data Flow**         | Bidirectional monitoring       |
| **Transaction Entry** | In AXIS (primary)              |
| **Legacy Role**       | Reference, validation          |
| **Duration**          | Weeks to months                |
| **Exit Criteria**     | Sustained reconciliation match |

**What Happens in Parallel Mode:**

1. **New Transactions** — Entered in AXIS
2. **Legacy Reference** — Legacy may still have some activity (or frozen)
3. **Continuous Recon** — Daily/hourly comparison
4. **Exception Handling** — Variance queue, resolution workflow
5. **Confidence Building** — Days without variance → cutover readiness

### 3.4 Mode C: Cutover Mode (Hard Go-Live)

**Purpose:** Legacy is off. AXIS is the only source of truth.

| Aspect                | Description        |
| --------------------- | ------------------ |
| **Data Flow**         | AXIS only          |
| **Transaction Entry** | AXIS only          |
| **Legacy Role**       | Archived reference |
| **Duration**          | Permanent          |
| **Prerequisites**     | All gates green    |

**Cutover Gates (All Must Be GREEN):**

```typescript
export const cutoverGatesSchema = z.object({
  tenantId: z.string().uuid(),

  // Balance gates
  trialBalanceMatched: z.boolean(),
  trialBalanceVariance: z.string().default("0"),

  // Subledger gates
  arAgingMatched: z.boolean(),
  arVariance: z.string().default("0"),
  apAgingMatched: z.boolean(),
  apVariance: z.string().default("0"),

  // Inventory gates
  inventoryQtyMatched: z.boolean(),
  inventoryQtyVariance: z.number().int().default(0),
  inventoryValueMatched: z.boolean(),
  inventoryValueVariance: z.string().default("0"),

  // Master data gates
  partiesResolved: z.boolean(),
  unmappedParties: z.number().int().default(0),
  itemsResolved: z.boolean(),
  unmappedItems: z.number().int().default(0),
  accountsMapped: z.boolean(),
  unmappedAccounts: z.number().int().default(0),

  // Operational gates
  openTransactionsMigrated: z.boolean(),
  pendingApprovalsCleared: z.boolean(),

  // Sign-off
  financialSignOff: z.object({
    signedBy: z.string().uuid().optional(),
    signedAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  }).optional(),

  operationalSignOff: z.object({
    signedBy: z.string().uuid().optional(),
    signedAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  }).optional(),

  // Overall status
  allGatesGreen: z.boolean().default(false),
  cutoverApproved: z.boolean().default(false),

  evaluatedAt: z.string().datetime(),
});
```

---

## 4) The Migration Architecture

### 4.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MIGRATION ARCHITECTURE                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                       LEGACY SYSTEMS                                     ││
│  │  QuickBooks │ Odoo │ Zoho │ SAP │ CSV/Excel │ Custom DB                 ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   C02: CONNECTOR LAYER                                   ││
│  │  Extract │ Transform (minimal) │ Load to Raw Zone                       ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      RAW ZONE (Untouched)                                ││
│  │  raw.parties │ raw.items │ raw.accounts │ raw.transactions             ││
│  │  raw.documents │ raw.attachments                                        ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   C03: MAPPING STUDIO                                    ││
│  │  Machine Detection │ User Mapping │ Alias Resolution │ COA Mapping      ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   AXIS CANONICAL ZONE                                    ││
│  │  B-Series: MDM │ Sales │ Purchase │ Inventory │ Accounting              ││
│  │  Posting Spine │ Events │ Ledger                                        ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   C04: DUAL LEDGER RECON                                 ││
│  │  TB Compare │ AR Compare │ AP Compare │ Stock Compare                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Why This Works (The Technical Foundation)

AXIS migration speed comes from the B-series architecture:

| B-Series Component        | Migration Benefit                                       |
| ------------------------- | ------------------------------------------------------- |
| **@axis/registry**        | Single target schema — translators have ONE destination |
| **B01 Posting Spine**     | Any transaction → standard economic events              |
| **B02 Domain Boundaries** | Clean mapping — legacy entity → AXIS domain             |
| **B03 MDM + Aliases**     | "Apple vs APPLE" solved — no duplicate entities         |
| **B07 Accounting**        | Standard COA types — legacy accounts map to AXIS types  |
| **B09 Reconciliation**    | Built-in comparison engine — migration recon reuses it  |
| **B12 Intelligence**      | Machine-assisted mapping with confidence scores         |

---

## 5) The "Few Clicks" Experience

### 5.1 Migration Wizard Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MIGRATION WIZARD                                       │
│                                                                              │
│  Step 1: SELECT SOURCE                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            ││
│  │  │QuickBooks│ │  Odoo   │ │  Zoho   │ │CSV/Excel│ │ Custom  │            ││
│  │  │   ✓     │ │         │ │         │ │         │ │   DB    │            ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Step 2: CONNECT & SAMPLE                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Connecting to QuickBooks... ✓                                           ││
│  │  Sampling data...                                                        ││
│  │  Found: 1,247 Customers │ 3,891 Items │ 15,234 Invoices                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Step 3: AUTO-MAP (The Machine)                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │  Mapping Confidence: 94%                                            │││
│  │  │  ────────────────────────────────────────────────────────────────── │││
│  │  │  ✓ Customers → Parties (isCustomer: true)         100%              │││
│  │  │  ✓ Vendors → Parties (isSupplier: true)           100%              │││
│  │  │  ✓ Products → Items (type: stockable)              98%              │││
│  │  │  ✓ Services → Items (type: service)               100%              │││
│  │  │  ⚠ Accounts → COA (needs review: 12)               85%              │││
│  │  │  ✓ Tax Codes → Tax Codes                           97%              │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Step 4: CONFIRM MAPPING (The "Few Clicks")                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Review 12 accounts needing confirmation:                                ││
│  │                                                                          ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │  Legacy: "Misc Income"     →  AXIS: [revenue_other ▼]    [Confirm]  │││
│  │  │  Legacy: "Other Expense"   →  AXIS: [expense_other ▼]    [Confirm]  │││
│  │  │  Legacy: "Petty Cash"      →  AXIS: [asset_cash ▼]       [Confirm]  │││
│  │  │  ...                                                                │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                                                          ││
│  │  [Confirm All Suggested]                                                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Step 5: TRIAL IMPORT                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Importing 15,234 transactions... ████████████████████ 100%              ││
│  │  Processing through Posting Spine...                                     ││
│  │  Generating ledger postings...                                           ││
│  │  ✓ Complete                                                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Step 6: RECONCILIATION REPORT                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌───────────────────────────────────────────────────────┐              ││
│  │  │              RECONCILIATION STATUS                     │              ││
│  │  ├───────────────────────────────────────────────────────┤              ││
│  │  │  Trial Balance          ✓ MATCHED       Variance: $0  │              ││
│  │  │  AR Aging               ✓ MATCHED       Variance: $0  │              ││
│  │  │  AP Aging               ✓ MATCHED       Variance: $0  │              ││
│  │  │  Inventory Value        ✓ MATCHED       Variance: $0  │              ││
│  │  │  Inventory Quantity     ✓ MATCHED       Variance: 0   │              ││
│  │  └───────────────────────────────────────────────────────┘              ││
│  │                                                                          ││
│  │  🟢 ALL GATES GREEN — Ready for Mirror Mode                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Step 7: ENABLE MODE                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ○ Mirror Mode (recommended for first week)                              ││
│  │  ○ Parallel Mode (ready when confident)                                  ││
│  │                                                                          ││
│  │  [Start Mirror Mode]                                                     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Migration Timeline (Typical)

| Day        | Activity                     | Mode     |
| ---------- | ---------------------------- | -------- |
| 1          | Connect source, sample data  | Setup    |
| 1-2        | AI auto-mapping, user review | Setup    |
| 2-3        | Trial import, fix variances  | Setup    |
| 4-7        | Daily sync, reconciliation   | Mirror   |
| Week 2+    | New transactions in AXIS     | Parallel |
| When green | Cutover decision             | Cutover  |

---

## 6) Migration is a State Machine

> *"Every mode transition requires green gates. Every mapping change triggers re-run. Every import is replayable."*

This aligns with B01's immutability mindset: migration is not a one-time event, it's a **deterministic state machine**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MIGRATION STATE MACHINE                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │   ┌─────────┐     Gates      ┌─────────┐     Gates      ┌─────────┐     ││
│  │   │  SETUP  │ ─────────────▶ │ MIRROR  │ ─────────────▶ │PARALLEL │     ││
│  │   │         │   Green: TB    │         │   Green: All   │         │     ││
│  │   └────┬────┘                └────┬────┘                └────┬────┘     ││
│  │        │                          │                          │          ││
│  │        │ Mapping change?          │ Variance?                │ Gates    ││
│  │        │ ◀───── Re-run ──────────│                          │ Green?   ││
│  │        │                          │                          │          ││
│  │        ▼                          ▼                          ▼          ││
│  │   ┌─────────┐               ┌─────────┐               ┌─────────┐       ││
│  │   │ RE-MAP  │               │EXCEPTION│               │ CUTOVER │       ││
│  │   │         │               │  QUEUE  │               │         │       ││
│  │   └─────────┘               └─────────┘               └─────────┘       ││
│  │                                                             │            ││
│  │                                                             ▼            ││
│  │                                                       ┌─────────┐       ││
│  │                                                       │COMPLETED│       ││
│  │                                                       │         │       ││
│  │                                                       └─────────┘       ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│   INVARIANTS:                                                               │
│   • Raw zone is NEVER mutated (replayable)                                  │
│   • Every state transition is logged (auditable)                            │
│   • Mapping changes invalidate downstream (consistent)                      │
│   • Gate checks are idempotent (deterministic)                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### State Transition Rules

```typescript
// Migration state transitions
export const MIGRATION_TRANSITIONS = {
  setup: {
    next: "mirror",
    requires: ["schemaIntrospected", "columnsMapped", "trialImportSuccess"],
  },
  mirror: {
    next: "parallel",
    requires: ["trialBalanceMatched", "arAgingMatched", "apAgingMatched", "inventoryMatched"],
    rollback: "setup", // If mapping needs change
  },
  parallel: {
    next: "cutover",
    requires: ["allGatesGreen", "financialSignOff", "operationalSignOff"],
    rollback: "mirror", // If major variance found
  },
  cutover: {
    next: "completed",
    requires: ["legacyFrozen", "finalDeltaImported", "cutoverApproved"],
    rollback: null, // No rollback from cutover (but raw zone preserved)
  },
  completed: {
    next: null,
    requires: [],
  },
} as const;

// State transition function
export async function transitionMigration(
  tenantId: string,
  toState: MigrationMode
): Promise<{ success: boolean; blockers?: string[] }> {
  const current = await getMigrationState(tenantId);
  const rules = MIGRATION_TRANSITIONS[current.currentMode];

  if (rules.next !== toState) {
    return { success: false, blockers: [`Cannot transition from ${current.currentMode} to ${toState}`] };
  }

  // Check all gate requirements
  const blockers: string[] = [];
  for (const requirement of rules.requires) {
    if (!await checkGate(tenantId, requirement)) {
      blockers.push(requirement);
    }
  }

  if (blockers.length > 0) {
    return { success: false, blockers };
  }

  // Log transition
  await logMigrationEvent(tenantId, {
    event: "state_transition",
    from: current.currentMode,
    to: toState,
    timestamp: new Date().toISOString(),
  });

  // Update state
  await updateMigrationState(tenantId, { currentMode: toState });

  return { success: true };
}
```

### Replayability Guarantee

Every migration import is **replayable** because:

1. **Raw zone is immutable** — Original data is never modified
2. **Mappings are versioned** — Each mapping version produces deterministic output
3. **Transformations are pure functions** — Same input + same mapping = same output
4. **Imports are idempotent** — Re-running produces identical results

```typescript
// Replay migration from any point
export async function replayMigration(
  tenantId: string,
  options: {
    fromRawSnapshot?: string;      // Specific raw snapshot
    withMappingVersion?: number;   // Specific mapping version
    dryRun?: boolean;              // Don't persist, just validate
  }
): Promise<ReplayResult> {
  // 1. Load raw data (original, unchanged)
  const rawData = await loadRawZone(tenantId, options.fromRawSnapshot);

  // 2. Load mapping rules (versioned)
  const mappings = await loadMappings(tenantId, options.withMappingVersion);

  // 3. Apply transformations (pure functions)
  const normalized = await applyMappings(rawData, mappings);

  // 4. Validate against AXIS schemas
  const validated = await validateAgainstRegistry(normalized);

  // 5. Generate comparison report
  const comparison = await compareWithCurrent(tenantId, validated);

  if (!options.dryRun) {
    // 6. Persist to normalized zone
    await persistNormalized(tenantId, validated);
  }

  return {
    recordsProcessed: validated.length,
    validationErrors: validated.errors,
    comparison,
  };
}
```

---

## 7) Exit Criteria (C01 Gate)

**C01 is complete ONLY when ALL of the following are true:**

| #   | Criterion                             | Status |
| --- | ------------------------------------- | ------ |
| 1   | Column Adapter insight documented     | ✅      |
| 2   | Three migration modes defined         | ✅      |
| 3   | Mode transition gates specified       | ✅      |
| 4   | Migration state schema defined        | ✅      |
| 5   | Cutover gates schema defined          | ✅      |
| 6   | Migration as State Machine documented | ✅      |
| 7   | Migration wizard UX flow documented   | ✅      |
| 8   | Integration with B-series documented  | ✅      |
| 9   | Replayability guarantee specified     | ✅      |

---

## 8) C-Series Overview

| Document       | Purpose                                   | Status     |
| -------------- | ----------------------------------------- | ---------- |
| **C01 (this)** | Philosophy, Modes, Column Adapter Insight | ✅ Complete |
| **C02**        | Column Adapter (Gang of Four pattern)     | ⏳ Pending  |
| **C03**        | Mapping Studio (Lynx-powered)             | ⏳ Pending  |
| **C04**        | Dual Ledger Reconciliation                | ⏳ Pending  |
| **C05**        | Cutover Runbook                           | ⏳ Pending  |

### C-Series Architecture Flow

```
C02: Column Adapter          C03: Mapping Studio         C04: Dual Ledger
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│ ANY Database     │        │ The Machine      │        │ Legacy vs AXIS   │
│ → Schema Intro   │───────▶│ → Column Mapping │───────▶│ → Reconciliation │
│ → Column Extract │        │ → Confidence     │        │ → Green Gates    │
│ → Raw Zone       │        │ → User Confirm   │        │ → Exception Q    │
└──────────────────┘        └──────────────────┘        └──────────────────┘
                                                                 │
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │ C05: Cutover     │
                                                        │ → Sign-off       │
                                                        │ → Legacy Off     │
                                                        │ → AXIS Primary   │
                                                        └──────────────────┘
```

---

## Document Governance

| Field            | Value                                             |
| ---------------- | ------------------------------------------------- |
| **Status**       | **Implemented**                                   |
| **Version**      | 1.0.0                                             |
| **Derived From** | A01-CANONICAL.md, A01-01-LYNX.md v1.2.0, B-series |
| **Phase**        | C01 (Migration Philosophy)                        |
| **Author**       | AXIS Architecture Team                            |
| **Last Updated** | 2026-01-22                                        |

---

## Related Documents

| Document                                                             | Purpose                                 |
| -------------------------------------------------------------------- | --------------------------------------- |
| [A01-CANONICAL.md](./A01-CANONICAL.md)                               | AXIS Philosophy (truth engine)          |
| [B03-MDM.md](./B03-MDM.md)                                           | MDM (alias resolution for migration)    |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)                             | Accounting (COA mapping target)         |
| [B09-RECONCILIATION.md](./B09-RECONCILIATION.md)                     | Reconciliation (reused for migration)   |
| [A01-01-LYNX.md](./A01-01-LYNX.md)                                   | Lynx (The Machine's Awareness)          |
| [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) | The Vocabulary of Truth                 |
| [B12-INTELLIGENCE.md](./B12-INTELLIGENCE.md)                         | Intelligence (Machine-assisted mapping) |
| [C02-COLUMN-ADAPTER.md](./C02-COLUMN-ADAPTER.md)                     | Column Adapter (Gang of Four pattern)   |
| [C03-MAPPING-STUDIO.md](./C03-MAPPING-STUDIO.md)                     | Mapping Studio                          |
| [C04-DUAL-LEDGER.md](./C04-DUAL-LEDGER.md)                           | Dual Ledger Reconciliation              |
| [C05-CUTOVER.md](./C05-CUTOVER.md)                                   | Cutover Runbook                         |

---

> *"Migration is not a project. It's a product feature. AXIS proves balance in days, not months."*
