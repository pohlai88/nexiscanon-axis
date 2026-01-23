# C04 — Dual Ledger Reconciliation
## Proving Balance: Legacy ↔ AXIS

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|                        C-Series                        |                                |                                |                         |                         |
| :----------------------------------------------------: | :----------------------------: | :----------------------------: | :---------------------: | :---------------------: |
| [C01](./C01-MIGRATION-PHILOSOPHY.md)                   | [C02](./C02-COLUMN-ADAPTER.md) | [C03](./C03-MAPPING-STUDIO.md) |       **[C04]**         | [C05](./C05-CUTOVER.md) |
|                       Philosophy                       |         Column Adapter         |         Mapping Studio         |       Dual Ledger       |         Cutover         |

---

> **Derived From:** [C01-MIGRATION-PHILOSOPHY.md](./C01-MIGRATION-PHILOSOPHY.md) v1.0.0, [B09-RECONCILIATION.md](./B09-RECONCILIATION.md) v1.0.0, [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) v1.1.0
>
> **Tag:** `DUAL-LEDGER` | `THE-MACHINE` | `GREEN-GATES` | `MIGRATION-RECON` | `PHASE-C04`

---

## 🛑 DEV NOTE: Respect @axis/registry & The Machine

> **ALL DEVELOPERS MUST READ THIS BEFORE WRITING ANY CODE**

### The Law

All Dual Ledger Reconciliation schemas follow the **Single Source of Truth** pattern:

| Component               | Source                                          |
| ----------------------- | ----------------------------------------------- |
| Recon Types             | `@axis/registry/schemas/dual-ledger/constants.ts`   |
| Migration Recon Schema  | `@axis/registry/schemas/dual-ledger/recon.ts`       |
| Migration Gates Schema  | `@axis/registry/schemas/dual-ledger/gates.ts`       |
| Exception Schema        | `@axis/registry/schemas/dual-ledger/exception.ts`   |
| Dual Ledger Events      | `@axis/registry/schemas/events/dual-ledger.ts`      |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

### The Machine in Dual Ledger

The Dual Ledger leverages Lynx (The Machine's Awareness) for:

| Capability               | The Machine...                                     |
| ------------------------ | -------------------------------------------------- |
| Exception Analysis       | ...notices variance patterns and root causes       |
| Suggested Resolution     | ...offers fix recommendations based on context     |
| Gate Status Monitoring   | ...continuously verifies all reconciliations       |
| Variance Explanation     | ...provides clear reasoning for discrepancies      |

---

## Preamble

> *"We don't just migrate your data. We PROVE your books still balance."*

Dual Ledger Reconciliation is the **trust mechanism** of AXIS migration. It continuously compares Legacy and AXIS until all gates are GREEN.

---

## 1) The Core Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DUAL LEDGER PRINCIPLE                                     │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║   Legacy ERP                           AXIS                       ║    │
│    ║   ┌─────────┐                         ┌─────────┐                 ║    │
│    ║   │  Trial  │ ═══════════════════════ │  Trial  │                 ║    │
│    ║   │ Balance │     MUST MATCH          │ Balance │                 ║    │
│    ║   └─────────┘                         └─────────┘                 ║    │
│    ║                                                                   ║    │
│    ║   ┌─────────┐                         ┌─────────┐                 ║    │
│    ║   │   AR    │ ═══════════════════════ │   AR    │                 ║    │
│    ║   │  Aging  │     MUST MATCH          │  Aging  │                 ║    │
│    ║                                                                   ║    │
│    ║   ┌─────────┐                         ┌─────────┐                 ║    │
│    ║   │   AP    │ ═══════════════════════ │   AP    │                 ║    │
│    ║   │  Aging  │     MUST MATCH          │  Aging  │                 ║    │
│    ║   └─────────┘                         └─────────┘                 ║    │
│    ║                                                                   ║    │
│    ║   ┌─────────┐                         ┌─────────┐                 ║    │
│    ║   │  Stock  │ ═══════════════════════ │  Stock  │                 ║    │
│    ║   │  Value  │     MUST MATCH          │  Value  │                 ║    │
│    ║   └─────────┘                         └─────────┘                 ║    │
│    ║                                                                   ║    │
│    ║   When ALL match → GREEN GATES → Safe to cutover                 ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Reconciliation Types

### 2.1 Migration Reconciliation Categories

| Category | What It Compares | Tolerance | Priority |
| -------- | ---------------- | --------- | -------- |
| **Trial Balance** | GL account balances | $0.01 | Critical |
| **AR Aging** | Customer receivables by age bucket | $0.01 | Critical |
| **AP Aging** | Supplier payables by age bucket | $0.01 | Critical |
| **Inventory Qty** | Item quantities on hand | 0 units | Critical |
| **Inventory Value** | Stock valuation | $0.01 | Critical |
| **Open Orders** | Unfulfilled sales orders | Count match | High |
| **Open POs** | Unfulfilled purchase orders | Count match | High |
| **Open Invoices** | Unpaid invoices | Amount match | Critical |
| **Open Bills** | Unpaid bills | Amount match | Critical |

### 2.2 Reconciliation Schema

```typescript
// packages/axis-registry/src/schemas/migration/recon.ts

export const MIGRATION_RECON_TYPE = [
  "trial_balance",
  "ar_aging",
  "ap_aging",
  "inventory_qty",
  "inventory_value",
  "open_orders",
  "open_pos",
  "open_invoices",
  "open_bills",
] as const;

export const RECON_STATUS = [
  "matched",      // Within tolerance
  "variance",     // Outside tolerance
  "pending",      // Not yet compared
  "exception",    // Requires investigation
] as const;

export const migrationReconSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  // Type
  reconType: z.enum(MIGRATION_RECON_TYPE),
  
  // Timing
  asOfDate: z.string().datetime(),
  executedAt: z.string().datetime(),
  
  // Totals
  legacyTotal: z.string(),           // Decimal string
  axisTotal: z.string(),             // Decimal string
  variance: z.string(),              // Decimal string (absolute)
  variancePercent: z.number(),
  
  // Tolerance
  toleranceAmount: z.string(),
  tolerancePercent: z.number(),
  
  // Status
  status: z.enum(RECON_STATUS),
  
  // Details (line-level comparison)
  details: z.array(z.object({
    key: z.string(),                 // Account code, customer ID, item code, etc.
    name: z.string(),
    legacyValue: z.string(),
    axisValue: z.string(),
    variance: z.string(),
    status: z.enum(RECON_STATUS),
  })),
  
  // Exceptions
  exceptionCount: z.number().int(),
  exceptions: z.array(z.object({
    key: z.string(),
    reason: z.string(),
    suggestedAction: z.string(),
  })).optional(),
  
  createdAt: z.string().datetime(),
});

export type MigrationRecon = z.infer<typeof migrationReconSchema>;
```

---

## 3) Reconciliation Engine

### 3.1 Trial Balance Reconciliation

```typescript
// packages/migration/src/recon/trial-balance.ts

/**
 * Compare trial balances between Legacy and AXIS
 */
export async function reconcileTrialBalance(
  db: Database,
  tenantId: string,
  migrationId: string,
  asOfDate: Date
): Promise<MigrationRecon> {
  // 1. Get Legacy trial balance (from raw zone with mapping)
  const legacyTB = await getLegacyTrialBalance(db, tenantId, migrationId, asOfDate);
  
  // 2. Get AXIS trial balance (from B07 accounting)
  const axisTB = await getAXISTrialBalance(db, tenantId, asOfDate);
  
  // 3. Compare account by account
  const details: ReconDetail[] = [];
  const allAccounts = new Set([
    ...legacyTB.map(a => a.code),
    ...axisTB.map(a => a.code),
  ]);
  
  let totalLegacy = "0";
  let totalAxis = "0";
  let exceptionCount = 0;
  
  for (const accountCode of allAccounts) {
    const legacy = legacyTB.find(a => a.code === accountCode);
    const axis = axisTB.find(a => a.code === accountCode);
    
    const legacyBalance = legacy?.balance || "0";
    const axisBalance = axis?.balance || "0";
    const variance = subtractDecimals(axisBalance, legacyBalance);
    const varianceAbs = Math.abs(parseFloat(variance));
    
    const status: ReconStatus = 
      varianceAbs <= 0.01 ? "matched" :
      !legacy || !axis ? "exception" : "variance";
    
    if (status !== "matched") exceptionCount++;
    
    details.push({
      key: accountCode,
      name: legacy?.name || axis?.name || accountCode,
      legacyValue: legacyBalance,
      axisValue: axisBalance,
      variance,
      status,
    });
    
    totalLegacy = addDecimals(totalLegacy, legacyBalance);
    totalAxis = addDecimals(totalAxis, axisBalance);
  }
  
  const totalVariance = subtractDecimals(totalAxis, totalLegacy);
  const totalVarianceAbs = Math.abs(parseFloat(totalVariance));
  const overallStatus: ReconStatus = totalVarianceAbs <= 0.01 ? "matched" : "variance";
  
  return {
    id: generateUUID(),
    tenantId,
    migrationId,
    reconType: "trial_balance",
    asOfDate: asOfDate.toISOString(),
    executedAt: new Date().toISOString(),
    legacyTotal: totalLegacy,
    axisTotal: totalAxis,
    variance: totalVariance,
    variancePercent: parseFloat(totalLegacy) !== 0 
      ? (totalVarianceAbs / Math.abs(parseFloat(totalLegacy))) * 100 
      : 0,
    toleranceAmount: "0.01",
    tolerancePercent: 0,
    status: overallStatus,
    details,
    exceptionCount,
    createdAt: new Date().toISOString(),
  };
}
```

### 3.2 AR Aging Reconciliation

```typescript
// packages/migration/src/recon/ar-aging.ts

/**
 * Compare AR aging between Legacy and AXIS
 */
export async function reconcileARAging(
  db: Database,
  tenantId: string,
  migrationId: string,
  asOfDate: Date
): Promise<MigrationRecon> {
  // Standard aging buckets
  const buckets = ["current", "1-30", "31-60", "61-90", "90+"];
  
  // 1. Get Legacy AR aging
  const legacyAR = await getLegacyARAging(db, tenantId, migrationId, asOfDate);
  
  // 2. Get AXIS AR aging (from B07 subledger)
  const axisAR = await getAXISARAging(db, tenantId, asOfDate);
  
  // 3. Compare by customer and bucket
  const details: ReconDetail[] = [];
  const allCustomers = new Set([
    ...legacyAR.map(a => a.customerId),
    ...axisAR.map(a => a.customerId),
  ]);
  
  let totalLegacy = "0";
  let totalAxis = "0";
  let exceptionCount = 0;
  
  for (const customerId of allCustomers) {
    const legacy = legacyAR.find(a => a.customerId === customerId);
    const axis = axisAR.find(a => a.customerId === customerId);
    
    const legacyTotal = legacy?.total || "0";
    const axisTotal = axis?.total || "0";
    const variance = subtractDecimals(axisTotal, legacyTotal);
    const varianceAbs = Math.abs(parseFloat(variance));
    
    const status: ReconStatus = 
      varianceAbs <= 0.01 ? "matched" : "variance";
    
    if (status !== "matched") exceptionCount++;
    
    details.push({
      key: customerId,
      name: legacy?.customerName || axis?.customerName || customerId,
      legacyValue: legacyTotal,
      axisValue: axisTotal,
      variance,
      status,
    });
    
    totalLegacy = addDecimals(totalLegacy, legacyTotal);
    totalAxis = addDecimals(totalAxis, axisTotal);
  }
  
  const totalVariance = subtractDecimals(totalAxis, totalLegacy);
  const overallStatus: ReconStatus = 
    Math.abs(parseFloat(totalVariance)) <= 0.01 ? "matched" : "variance";
  
  return {
    id: generateUUID(),
    tenantId,
    migrationId,
    reconType: "ar_aging",
    asOfDate: asOfDate.toISOString(),
    executedAt: new Date().toISOString(),
    legacyTotal: totalLegacy,
    axisTotal: totalAxis,
    variance: totalVariance,
    variancePercent: parseFloat(totalLegacy) !== 0 
      ? (Math.abs(parseFloat(totalVariance)) / Math.abs(parseFloat(totalLegacy))) * 100 
      : 0,
    toleranceAmount: "0.01",
    tolerancePercent: 0,
    status: overallStatus,
    details,
    exceptionCount,
    createdAt: new Date().toISOString(),
  };
}
```

### 3.3 Inventory Reconciliation

```typescript
// packages/migration/src/recon/inventory.ts

/**
 * Compare inventory quantities and values
 */
export async function reconcileInventory(
  db: Database,
  tenantId: string,
  migrationId: string,
  asOfDate: Date,
  type: "inventory_qty" | "inventory_value"
): Promise<MigrationRecon> {
  // 1. Get Legacy inventory
  const legacyInv = await getLegacyInventory(db, tenantId, migrationId, asOfDate);
  
  // 2. Get AXIS inventory (from B06)
  const axisInv = await getAXISInventory(db, tenantId, asOfDate);
  
  // 3. Compare by item
  const details: ReconDetail[] = [];
  const allItems = new Set([
    ...legacyInv.map(i => i.itemCode),
    ...axisInv.map(i => i.itemCode),
  ]);
  
  let totalLegacy = "0";
  let totalAxis = "0";
  let exceptionCount = 0;
  
  for (const itemCode of allItems) {
    const legacy = legacyInv.find(i => i.itemCode === itemCode);
    const axis = axisInv.find(i => i.itemCode === itemCode);
    
    const legacyValue = type === "inventory_qty" 
      ? String(legacy?.quantity || 0)
      : legacy?.value || "0";
    const axisValue = type === "inventory_qty"
      ? String(axis?.quantity || 0)
      : axis?.value || "0";
    
    const variance = type === "inventory_qty"
      ? String(parseInt(axisValue) - parseInt(legacyValue))
      : subtractDecimals(axisValue, legacyValue);
    
    const varianceAbs = Math.abs(parseFloat(variance));
    const tolerance = type === "inventory_qty" ? 0 : 0.01;
    
    const status: ReconStatus = 
      varianceAbs <= tolerance ? "matched" : "variance";
    
    if (status !== "matched") exceptionCount++;
    
    details.push({
      key: itemCode,
      name: legacy?.itemName || axis?.itemName || itemCode,
      legacyValue,
      axisValue,
      variance,
      status,
    });
    
    totalLegacy = addDecimals(totalLegacy, legacyValue);
    totalAxis = addDecimals(totalAxis, axisValue);
  }
  
  const totalVariance = subtractDecimals(totalAxis, totalLegacy);
  const tolerance = type === "inventory_qty" ? 0 : 0.01;
  const overallStatus: ReconStatus = 
    Math.abs(parseFloat(totalVariance)) <= tolerance ? "matched" : "variance";
  
  return {
    id: generateUUID(),
    tenantId,
    migrationId,
    reconType: type,
    asOfDate: asOfDate.toISOString(),
    executedAt: new Date().toISOString(),
    legacyTotal: totalLegacy,
    axisTotal: totalAxis,
    variance: totalVariance,
    variancePercent: parseFloat(totalLegacy) !== 0 
      ? (Math.abs(parseFloat(totalVariance)) / Math.abs(parseFloat(totalLegacy))) * 100 
      : 0,
    toleranceAmount: String(tolerance),
    tolerancePercent: 0,
    status: overallStatus,
    details,
    exceptionCount,
    createdAt: new Date().toISOString(),
  };
}
```

---

## 4) Green Gates Dashboard

### 4.1 Gate Status Schema

```typescript
// packages/axis-registry/src/schemas/migration/gates.ts

export const migrationGatesSchema = z.object({
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  // Individual gates
  gates: z.object({
    trialBalance: z.object({
      status: z.enum(RECON_STATUS),
      lastChecked: z.string().datetime(),
      variance: z.string(),
    }),
    arAging: z.object({
      status: z.enum(RECON_STATUS),
      lastChecked: z.string().datetime(),
      variance: z.string(),
    }),
    apAging: z.object({
      status: z.enum(RECON_STATUS),
      lastChecked: z.string().datetime(),
      variance: z.string(),
    }),
    inventoryQty: z.object({
      status: z.enum(RECON_STATUS),
      lastChecked: z.string().datetime(),
      variance: z.string(),
    }),
    inventoryValue: z.object({
      status: z.enum(RECON_STATUS),
      lastChecked: z.string().datetime(),
      variance: z.string(),
    }),
  }),
  
  // Overall status
  allGatesGreen: z.boolean(),
  readyForCutover: z.boolean(),
  
  // Blockers
  blockers: z.array(z.string()),
  
  evaluatedAt: z.string().datetime(),
});

export type MigrationGates = z.infer<typeof migrationGatesSchema>;
```

### 4.2 Gates Dashboard UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MIGRATION GATES                                           │
│                                                                              │
│  Migration: QuickBooks → AXIS     │     Mode: Mirror                        │
│  Last Sync: 2026-01-22 09:00 AM   │     Days in Mode: 5                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      RECONCILIATION STATUS                               ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                          ││
│  │  🟢 Trial Balance          MATCHED       Variance: $0.00                ││
│  │     Legacy: $1,234,567.89  │  AXIS: $1,234,567.89                       ││
│  │     Last checked: 5 minutes ago                                          ││
│  │                                                                          ││
│  │  🟢 AR Aging               MATCHED       Variance: $0.00                ││
│  │     Legacy: $45,678.90     │  AXIS: $45,678.90                          ││
│  │     Last checked: 5 minutes ago                                          ││
│  │                                                                          ││
│  │  🟢 AP Aging               MATCHED       Variance: $0.00                ││
│  │     Legacy: $23,456.78     │  AXIS: $23,456.78                          ││
│  │     Last checked: 5 minutes ago                                          ││
│  │                                                                          ││
│  │  🟢 Inventory Qty          MATCHED       Variance: 0 units              ││
│  │     Legacy: 12,345 units   │  AXIS: 12,345 units                        ││
│  │     Last checked: 5 minutes ago                                          ││
│  │                                                                          ││
│  │  🟢 Inventory Value        MATCHED       Variance: $0.00                ││
│  │     Legacy: $567,890.12    │  AXIS: $567,890.12                         ││
│  │     Last checked: 5 minutes ago                                          ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  🟢 ALL GATES GREEN                                                      ││
│  │                                                                          ││
│  │  ✓ Ready to transition to Parallel Mode                                 ││
│  │  ✓ 5 consecutive days with zero variance                                ││
│  │                                                                          ││
│  │  [Transition to Parallel Mode]                                           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Exception View (When Gates Are RED)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MIGRATION GATES                                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  🟢 Trial Balance          MATCHED       Variance: $0.00                ││
│  │  🔴 AR Aging               VARIANCE      Variance: $1,234.56            ││
│  │  🟢 AP Aging               MATCHED       Variance: $0.00                ││
│  │  🟢 Inventory Qty          MATCHED       Variance: 0 units              ││
│  │  🟢 Inventory Value        MATCHED       Variance: $0.00                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  🔴 GATES NOT READY — 1 Blocker                                          ││
│  │                                                                          ││
│  │  AR Aging Variance: $1,234.56                                            ││
│  │                                                                          ││
│  │  [View Details]                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  AR AGING EXCEPTIONS (3 items)                                           ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                                                                          ││
│  │  Customer: Acme Corp                                                     ││
│  │  Legacy: $5,678.90  │  AXIS: $4,444.34  │  Variance: $1,234.56          ││
│  │  Suggested: Check invoice #INV-2024-0892 mapping                        ││
│  │  [Investigate] [Adjust Mapping] [Accept Variance]                       ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5) Exception Resolution

### 5.1 Exception Types

```typescript
export const EXCEPTION_TYPE = [
  "missing_in_axis",      // Record exists in legacy but not in AXIS
  "missing_in_legacy",    // Record exists in AXIS but not in legacy
  "value_mismatch",       // Values don't match
  "mapping_error",        // Incorrect mapping caused variance
  "timing_difference",    // Transaction in different periods
  "rounding_difference",  // Small rounding differences
  "duplicate_detected",   // Duplicate in one system
] as const;

export const migrationExceptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  reconId: z.string().uuid(),
  
  // Exception details
  exceptionType: z.enum(EXCEPTION_TYPE),
  reconType: z.enum(MIGRATION_RECON_TYPE),
  
  // Affected entity
  entityType: z.string(),
  entityKey: z.string(),
  entityName: z.string(),
  
  // Values
  legacyValue: z.string(),
  axisValue: z.string(),
  variance: z.string(),
  
  // AI analysis
  suggestedAction: z.string(),
  suggestedReason: z.string(),
  confidence: z.number(),
  
  // Resolution
  status: z.enum(["open", "investigating", "resolved", "accepted"]),
  resolution: z.object({
    action: z.enum(["adjust_mapping", "adjust_data", "accept_variance", "exclude"]),
    note: z.string(),
    resolvedBy: z.string().uuid(),
    resolvedAt: z.string().datetime(),
  }).optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MigrationException = z.infer<typeof migrationExceptionSchema>;
```

### 5.2 Exception Analysis (The Machine-Powered)

```typescript
// packages/migration/src/recon/exception-analyzer.ts

/**
 * The Machine analyzes reconciliation exceptions
 */
export async function analyzeException(
  lynx: LynxService,
  exception: {
    reconType: string;
    entityKey: string;
    entityName: string;
    legacyValue: string;
    axisValue: string;
    variance: string;
  },
  context: {
    mappings: ColumnMapping[];
    recentTransactions: Transaction[];
  }
): Promise<{
  exceptionType: ExceptionType;
  suggestedAction: string;
  suggestedReason: string;
  confidence: number;
}> {
  const result = await lynx.generateObject({
    schema: z.object({
      exceptionType: z.enum(EXCEPTION_TYPE),
      suggestedAction: z.string(),
      suggestedReason: z.string(),
      confidence: z.number(),
    }),
    prompt: `Analyze this migration reconciliation exception:
             
             Type: ${exception.reconType}
             Entity: ${exception.entityKey} (${exception.entityName})
             Legacy Value: ${exception.legacyValue}
             AXIS Value: ${exception.axisValue}
             Variance: ${exception.variance}
             
             Recent transactions for this entity:
             ${JSON.stringify(context.recentTransactions.slice(0, 5))}
             
             Current mappings:
             ${JSON.stringify(context.mappings.slice(0, 10))}
             
             Determine:
             1. What type of exception is this?
             2. What caused the variance?
             3. How should it be resolved?`,
  });
  
  return result;
}
```

---

## 6) Continuous Reconciliation

### 6.1 Recon Schedule

```typescript
// packages/migration/src/recon/scheduler.ts

/**
 * Schedule continuous reconciliation during migration
 */
export async function scheduleReconciliation(
  tenantId: string,
  migrationId: string,
  mode: MigrationMode
): Promise<void> {
  // Different schedules for different modes
  const schedule = {
    mirror: {
      trialBalance: "0 */4 * * *",     // Every 4 hours
      arAging: "0 */4 * * *",
      apAging: "0 */4 * * *",
      inventoryQty: "0 */6 * * *",     // Every 6 hours
      inventoryValue: "0 */6 * * *",
    },
    parallel: {
      trialBalance: "0 * * * *",       // Every hour
      arAging: "0 * * * *",
      apAging: "0 * * * *",
      inventoryQty: "0 */2 * * *",     // Every 2 hours
      inventoryValue: "0 */2 * * *",
    },
  };
  
  const modeSchedule = schedule[mode];
  if (!modeSchedule) return;
  
  for (const [reconType, cronExpression] of Object.entries(modeSchedule)) {
    await registerJob({
      type: "migration_recon",
      tenantId,
      migrationId,
      reconType,
      cronExpression,
    });
  }
}
```

---

## 7) Exit Criteria (C04 Gate)

**C04 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                    | Status |
| --- | -------------------------------------------- | ------ |
| 1   | All recon types defined                      | ✅      |
| 2   | Trial balance reconciliation                 | ✅      |
| 3   | AR/AP aging reconciliation                   | ✅      |
| 4   | Inventory qty/value reconciliation           | ✅      |
| 5   | Green gates dashboard                        | ✅      |
| 6   | Exception schema and analysis                | ✅      |
| 7   | Continuous reconciliation scheduling         | ✅      |
| 8   | Integration with B09 reconciliation engine   | ✅      |

---

## 8) Integration with Other Phases

| Phase               | Integration                                          |
| ------------------- | ---------------------------------------------------- |
| **C01** (Philosophy)| Dual Ledger implements "Reconciliation Gates" concept|
| **C03** (Mapping)   | Uses mappings for Legacy→AXIS value translation      |
| **C05** (Cutover)   | Gates must be GREEN before cutover approval          |
| **B07** (Accounting)| AXIS trial balance, AR/AP aging from subledgers      |
| **B06** (Inventory) | AXIS inventory qty/value from stock engine           |
| **B09** (Recon)     | Shares reconciliation engine and exception patterns  |
| **A01-01** (Lynx)   | The Machine powers exception analysis                |

---

## Related Documents

| Document                                                             | Purpose                                 |
| -------------------------------------------------------------------- | --------------------------------------- |
| [C01-MIGRATION-PHILOSOPHY.md](./C01-MIGRATION-PHILOSOPHY.md)         | Migration modes and reconciliation gates|
| [C03-MAPPING-STUDIO.md](./C03-MAPPING-STUDIO.md)                     | Mappings used for comparison            |
| [C05-CUTOVER.md](./C05-CUTOVER.md)                                   | Cutover requires green gates            |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)                             | AXIS GL and subledgers                  |
| [B09-RECONCILIATION.md](./B09-RECONCILIATION.md)                     | Core reconciliation engine              |
| [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) | The Vocabulary of Truth                 |

---

## Document Governance

| Field            | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| **Status**       | **Implemented**                                                       |
| **Version**      | 1.0.0                                                                 |
| **Derived From** | C01-MIGRATION-PHILOSOPHY.md v1.0.0, B09-RECONCILIATION.md v1.0.0      |
| **Phase**        | C04 (Dual Ledger Reconciliation)                                      |
| **Author**       | AXIS Architecture Team                                                |
| **Last Updated** | 2026-01-22                                                            |

---

> *"We don't just migrate. The Machine PROVES balance."*
