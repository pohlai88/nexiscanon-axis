# C05 — Cutover Runbook
## The Final Transition: Legacy Off, AXIS Primary

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|                        C-Series                        |                                |                                |                             |                     |
| :----------------------------------------------------: | :----------------------------: | :----------------------------: | :-------------------------: | :-----------------: |
| [C01](./C01-MIGRATION-PHILOSOPHY.md)                   | [C02](./C02-COLUMN-ADAPTER.md) | [C03](./C03-MAPPING-STUDIO.md) | [C04](./C04-DUAL-LEDGER.md) |     **[C05]**       |
|                       Philosophy                       |         Column Adapter         |         Mapping Studio         |         Dual Ledger         |       Cutover       |

---

> **Derived From:** [C01-MIGRATION-PHILOSOPHY.md](./C01-MIGRATION-PHILOSOPHY.md) v1.0.0, [C04-DUAL-LEDGER.md](./C04-DUAL-LEDGER.md) v1.0.0, [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) v1.1.0
>
> **Tag:** `CUTOVER` | `THE-MACHINE` | `GO-LIVE` | `SIGN-OFF` | `ROLLBACK` | `PHASE-C05`

---

## 🛑 DEV NOTE: Respect @axis/registry & The Machine

> **ALL DEVELOPERS MUST READ THIS BEFORE WRITING ANY CODE**

### The Law

All Cutover schemas follow the **Single Source of Truth** pattern:

| Component               | Source                                           |
| ----------------------- | ------------------------------------------------ |
| Cutover Phase/Status    | `@axis/registry/schemas/cutover/constants.ts`    |
| Prerequisites Schema    | `@axis/registry/schemas/cutover/prerequisites.ts`|
| Execution Schema        | `@axis/registry/schemas/cutover/execution.ts`    |
| Rollback Schema         | `@axis/registry/schemas/cutover/rollback.ts`     |
| Checklist Schema        | `@axis/registry/schemas/cutover/checklist.ts`    |
| Cutover Events          | `@axis/registry/schemas/events/cutover.ts`       |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

### The Machine in Cutover

The Cutover Runbook leverages Lynx (The Machine's Awareness) for:

| Capability              | The Machine...                                    |
| ----------------------- | ------------------------------------------------- |
| Prerequisites Check     | ...evaluates readiness automatically              |
| Validation Tests        | ...orchestrates post-switch verification          |
| Delta Capture           | ...tracks transactions since freeze               |
| Rollback Analysis       | ...suggests rollback actions if issues arise      |

---

## Preamble

> *"Cutover is not a leap of faith. It's a calculated step with proof."*

The Cutover Runbook defines the final transition from legacy to AXIS. It only happens when all gates are GREEN and sign-offs are complete.

---

## 1) The Cutover Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUTOVER PRINCIPLE                                         │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║   CUTOVER IS NOT:                                                 ║    │
│    ║   • A deadline                                                    ║    │
│    ║   • A management decision                                         ║    │
│    ║   • A leap of faith                                               ║    │
│    ║                                                                   ║    │
│    ║   CUTOVER IS:                                                     ║    │
│    ║   • A state machine transition                                    ║    │
│    ║   • Enabled ONLY when all gates are green                         ║    │
│    ║   • Supported by signed reconciliation proof                      ║    │
│    ║   • Reversible (raw zone preserved)                               ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    ┌───────────────────────────────────────────────────────────────────────┐│
│    │                                                                        ││
│    │   Parallel Mode                      Cutover                           ││
│    │   ┌─────────────┐                   ┌─────────────┐                   ││
│    │   │ Both Active │  ──── Gates ────▶ │ AXIS Only   │                   ││
│    │   │             │      GREEN        │             │                   ││
│    │   └─────────────┘                   └─────────────┘                   ││
│    │        │                                  │                            ││
│    │        │ Gates RED?                       │ Complete                   ││
│    │        ▼                                  ▼                            ││
│    │   ┌─────────────┐                   ┌─────────────┐                   ││
│    │   │ Stay in     │                   │ Legacy      │                   ││
│    │   │ Parallel    │                   │ Archived    │                   ││
│    │   └─────────────┘                   └─────────────┘                   ││
│    │                                                                        ││
│    └───────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Cutover Prerequisites

### 2.1 Gate Requirements

All gates from C04 must be GREEN for a minimum period:

```typescript
// packages/axis-registry/src/schemas/migration/cutover.ts

export const cutoverPrerequisitesSchema = z.object({
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  // Gate status
  gates: z.object({
    trialBalance: z.enum(["green", "red"]),
    arAging: z.enum(["green", "red"]),
    apAging: z.enum(["green", "red"]),
    inventoryQty: z.enum(["green", "red"]),
    inventoryValue: z.enum(["green", "red"]),
  }),
  
  // Duration requirements
  consecutiveGreenDays: z.number().int(),
  minimumGreenDays: z.number().int().default(3),
  
  // Sign-off requirements
  signOffs: z.object({
    financial: z.object({
      required: z.boolean().default(true),
      signed: z.boolean().default(false),
      signedBy: z.string().uuid().optional(),
      signedAt: z.string().datetime().optional(),
    }),
    operational: z.object({
      required: z.boolean().default(true),
      signed: z.boolean().default(false),
      signedBy: z.string().uuid().optional(),
      signedAt: z.string().datetime().optional(),
    }),
    it: z.object({
      required: z.boolean().default(false),
      signed: z.boolean().default(false),
      signedBy: z.string().uuid().optional(),
      signedAt: z.string().datetime().optional(),
    }),
  }),
  
  // Operational readiness
  operational: z.object({
    usersTrainedPercent: z.number().min(0).max(100),
    minimumTrainedPercent: z.number().default(80),
    openTicketsCount: z.number().int(),
    maxOpenTickets: z.number().int().default(5),
  }),
  
  // Overall readiness
  allPrerequisitesMet: z.boolean(),
  blockers: z.array(z.string()),
  
  evaluatedAt: z.string().datetime(),
});

export type CutoverPrerequisites = z.infer<typeof cutoverPrerequisitesSchema>;
```

### 2.2 Prerequisites Check

```typescript
// packages/migration/src/cutover/prerequisites.ts

/**
 * Evaluate cutover prerequisites
 */
export async function evaluatePrerequisites(
  db: Database,
  tenantId: string,
  migrationId: string
): Promise<CutoverPrerequisites> {
  const blockers: string[] = [];
  
  // 1. Check gate status
  const gates = await getMigrationGates(db, tenantId, migrationId);
  const allGatesGreen = Object.values(gates.gates).every(g => g.status === "matched");
  
  if (!allGatesGreen) {
    blockers.push("Not all reconciliation gates are green");
  }
  
  // 2. Check consecutive green days
  const consecutiveGreenDays = await getConsecutiveGreenDays(db, tenantId, migrationId);
  const minimumGreenDays = 3;
  
  if (consecutiveGreenDays < minimumGreenDays) {
    blockers.push(`Need ${minimumGreenDays} consecutive days with green gates (currently ${consecutiveGreenDays})`);
  }
  
  // 3. Check sign-offs
  const signOffs = await getSignOffs(db, tenantId, migrationId);
  
  if (signOffs.financial.required && !signOffs.financial.signed) {
    blockers.push("Financial sign-off required");
  }
  if (signOffs.operational.required && !signOffs.operational.signed) {
    blockers.push("Operational sign-off required");
  }
  
  // 4. Check operational readiness
  const operational = await getOperationalReadiness(db, tenantId, migrationId);
  
  if (operational.usersTrainedPercent < operational.minimumTrainedPercent) {
    blockers.push(`User training incomplete (${operational.usersTrainedPercent}% trained, need ${operational.minimumTrainedPercent}%)`);
  }
  if (operational.openTicketsCount > operational.maxOpenTickets) {
    blockers.push(`Too many open migration tickets (${operational.openTicketsCount}, max ${operational.maxOpenTickets})`);
  }
  
  return {
    tenantId,
    migrationId,
    gates: {
      trialBalance: gates.gates.trialBalance.status === "matched" ? "green" : "red",
      arAging: gates.gates.arAging.status === "matched" ? "green" : "red",
      apAging: gates.gates.apAging.status === "matched" ? "green" : "red",
      inventoryQty: gates.gates.inventoryQty.status === "matched" ? "green" : "red",
      inventoryValue: gates.gates.inventoryValue.status === "matched" ? "green" : "red",
    },
    consecutiveGreenDays,
    minimumGreenDays,
    signOffs,
    operational,
    allPrerequisitesMet: blockers.length === 0,
    blockers,
    evaluatedAt: new Date().toISOString(),
  };
}
```

---

## 3) Cutover Process

### 3.1 Cutover Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUTOVER PHASES                                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PHASE 1: PREPARATION (T-24h)                                           ││
│  │  • Verify all prerequisites                                             ││
│  │  • Schedule freeze window                                               ││
│  │  • Notify stakeholders                                                  ││
│  │  • Backup legacy data                                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PHASE 2: FREEZE (T-0)                                                  ││
│  │  • Freeze legacy system (no new transactions)                           ││
│  │  • Final delta import                                                   ││
│  │  • Final reconciliation                                                 ││
│  │  • All gates must be GREEN                                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PHASE 3: SWITCH (T+1h)                                                 ││
│  │  • Disable legacy access                                                ││
│  │  • Enable AXIS as primary                                               ││
│  │  • Redirect integrations                                                ││
│  │  • Audit log: cutover event                                             ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PHASE 4: VALIDATION (T+2h)                                             ││
│  │  • Verify AXIS operations                                               ││
│  │  • Test critical workflows                                              ││
│  │  • Monitor for errors                                                   ││
│  │  • Confirm with stakeholders                                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PHASE 5: COMPLETION (T+24h)                                            ││
│  │  • Archive legacy system                                                ││
│  │  • Update migration status: completed                                   ││
│  │  • Post-migration report                                                ││
│  │  • Close migration project                                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Cutover Execution Schema

```typescript
// packages/axis-registry/src/schemas/migration/cutover-execution.ts

export const CUTOVER_PHASE = [
  "preparation",
  "freeze",
  "switch",
  "validation",
  "completion",
  "rollback",      // If needed
] as const;

export const CUTOVER_STATUS = [
  "not_started",
  "in_progress",
  "completed",
  "failed",
  "rolled_back",
] as const;

export const cutoverExecutionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  // Scheduling
  scheduledAt: z.string().datetime(),
  freezeWindowStart: z.string().datetime(),
  freezeWindowEnd: z.string().datetime(),
  
  // Current phase
  currentPhase: z.enum(CUTOVER_PHASE),
  
  // Phase status
  phases: z.object({
    preparation: z.object({
      status: z.enum(CUTOVER_STATUS),
      startedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      notes: z.string().optional(),
    }),
    freeze: z.object({
      status: z.enum(CUTOVER_STATUS),
      startedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      legacyFrozenAt: z.string().datetime().optional(),
      deltaImportedAt: z.string().datetime().optional(),
      finalReconAt: z.string().datetime().optional(),
      notes: z.string().optional(),
    }),
    switch: z.object({
      status: z.enum(CUTOVER_STATUS),
      startedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      legacyDisabledAt: z.string().datetime().optional(),
      axisEnabledAt: z.string().datetime().optional(),
      notes: z.string().optional(),
    }),
    validation: z.object({
      status: z.enum(CUTOVER_STATUS),
      startedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      testsRun: z.number().int().optional(),
      testsPassed: z.number().int().optional(),
      notes: z.string().optional(),
    }),
    completion: z.object({
      status: z.enum(CUTOVER_STATUS),
      startedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      notes: z.string().optional(),
    }),
  }),
  
  // Overall status
  overallStatus: z.enum(CUTOVER_STATUS),
  
  // Participants
  cutoverLead: z.string().uuid(),
  participants: z.array(z.object({
    userId: z.string().uuid(),
    role: z.string(),
    confirmedAt: z.string().datetime().optional(),
  })),
  
  // Sign-offs
  finalSignOff: z.object({
    signedBy: z.string().uuid().optional(),
    signedAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CutoverExecution = z.infer<typeof cutoverExecutionSchema>;
```

### 3.3 Cutover Execution Engine

```typescript
// packages/migration/src/cutover/executor.ts

/**
 * Execute cutover process
 */
export class CutoverExecutor {
  constructor(
    private readonly db: Database,
    private readonly lynx: LynxService
  ) {}

  /**
   * Start cutover process
   */
  async startCutover(
    tenantId: string,
    migrationId: string,
    options: {
      scheduledAt: Date;
      freezeWindowHours: number;
      cutoverLead: string;
    }
  ): Promise<CutoverExecution> {
    // 1. Verify prerequisites
    const prerequisites = await evaluatePrerequisites(this.db, tenantId, migrationId);
    if (!prerequisites.allPrerequisitesMet) {
      throw new Error(`Cannot start cutover: ${prerequisites.blockers.join(", ")}`);
    }
    
    // 2. Create cutover execution record
    const cutover: CutoverExecution = {
      id: generateUUID(),
      tenantId,
      migrationId,
      scheduledAt: options.scheduledAt.toISOString(),
      freezeWindowStart: options.scheduledAt.toISOString(),
      freezeWindowEnd: addHours(options.scheduledAt, options.freezeWindowHours).toISOString(),
      currentPhase: "preparation",
      phases: {
        preparation: { status: "in_progress", startedAt: new Date().toISOString() },
        freeze: { status: "not_started" },
        switch: { status: "not_started" },
        validation: { status: "not_started" },
        completion: { status: "not_started" },
      },
      overallStatus: "in_progress",
      cutoverLead: options.cutoverLead,
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await this.db.insert(cutoverExecutions).values(cutover);
    
    // 3. Log cutover start
    await logMigrationEvent(this.db, {
      tenantId,
      migrationId,
      event: "cutover_started",
      details: { cutoverId: cutover.id },
    });
    
    return cutover;
  }

  /**
   * Execute freeze phase
   */
  async executeFreeze(cutoverId: string): Promise<void> {
    const cutover = await this.getCutover(cutoverId);
    
    // 1. Freeze legacy system
    await this.freezeLegacy(cutover.tenantId, cutover.migrationId);
    
    // 2. Run final delta import
    await this.runFinalDeltaImport(cutover.tenantId, cutover.migrationId);
    
    // 3. Run final reconciliation
    const recon = await runFullReconciliation(this.db, cutover.tenantId, cutover.migrationId);
    
    // 4. Verify all gates are green
    if (!recon.allGatesGreen) {
      throw new Error("Final reconciliation failed - gates not green");
    }
    
    // 5. Update phase status
    await this.updatePhase(cutoverId, "freeze", {
      status: "completed",
      completedAt: new Date().toISOString(),
      legacyFrozenAt: new Date().toISOString(),
      deltaImportedAt: new Date().toISOString(),
      finalReconAt: new Date().toISOString(),
    });
    
    await this.advancePhase(cutoverId, "switch");
  }

  /**
   * Execute switch phase
   */
  async executeSwitch(cutoverId: string): Promise<void> {
    const cutover = await this.getCutover(cutoverId);
    
    // 1. Disable legacy access
    await this.disableLegacyAccess(cutover.tenantId);
    
    // 2. Enable AXIS as primary
    await this.enableAXISPrimary(cutover.tenantId);
    
    // 3. Redirect integrations
    await this.redirectIntegrations(cutover.tenantId);
    
    // 4. Log switch event
    await logMigrationEvent(this.db, {
      tenantId: cutover.tenantId,
      migrationId: cutover.migrationId,
      event: "cutover_switched",
      details: { cutoverId },
    });
    
    // 5. Update phase status
    await this.updatePhase(cutoverId, "switch", {
      status: "completed",
      completedAt: new Date().toISOString(),
      legacyDisabledAt: new Date().toISOString(),
      axisEnabledAt: new Date().toISOString(),
    });
    
    await this.advancePhase(cutoverId, "validation");
  }

  /**
   * Execute validation phase
   */
  async executeValidation(cutoverId: string): Promise<ValidationResult> {
    const cutover = await this.getCutover(cutoverId);
    
    // Run validation tests
    const tests = [
      { name: "Create Sales Order", fn: () => this.testCreateSalesOrder(cutover.tenantId) },
      { name: "Create Purchase Order", fn: () => this.testCreatePurchaseOrder(cutover.tenantId) },
      { name: "Create Invoice", fn: () => this.testCreateInvoice(cutover.tenantId) },
      { name: "Record Payment", fn: () => this.testRecordPayment(cutover.tenantId) },
      { name: "Check Stock", fn: () => this.testCheckStock(cutover.tenantId) },
      { name: "Run Report", fn: () => this.testRunReport(cutover.tenantId) },
    ];
    
    const results = await Promise.all(
      tests.map(async (test) => {
        try {
          await test.fn();
          return { name: test.name, passed: true };
        } catch (error) {
          return { name: test.name, passed: false, error: String(error) };
        }
      })
    );
    
    const testsRun = results.length;
    const testsPassed = results.filter(r => r.passed).length;
    
    await this.updatePhase(cutoverId, "validation", {
      status: testsPassed === testsRun ? "completed" : "failed",
      completedAt: new Date().toISOString(),
      testsRun,
      testsPassed,
    });
    
    if (testsPassed === testsRun) {
      await this.advancePhase(cutoverId, "completion");
    }
    
    return { testsRun, testsPassed, results };
  }

  /**
   * Complete cutover
   */
  async completeCutover(
    cutoverId: string,
    signOff: { userId: string; notes?: string }
  ): Promise<void> {
    const cutover = await this.getCutover(cutoverId);
    
    // 1. Archive legacy system
    await this.archiveLegacy(cutover.tenantId, cutover.migrationId);
    
    // 2. Update migration status
    await this.db.update(migrationStates)
      .set({
        currentMode: "completed",
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(migrationStates.id, cutover.migrationId));
    
    // 3. Record sign-off
    await this.db.update(cutoverExecutions)
      .set({
        finalSignOff: {
          signedBy: signOff.userId,
          signedAt: new Date().toISOString(),
          notes: signOff.notes,
        },
        phases: {
          ...cutover.phases,
          completion: {
            status: "completed",
            completedAt: new Date().toISOString(),
          },
        },
        overallStatus: "completed",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(cutoverExecutions.id, cutoverId));
    
    // 4. Log completion
    await logMigrationEvent(this.db, {
      tenantId: cutover.tenantId,
      migrationId: cutover.migrationId,
      event: "cutover_completed",
      details: { cutoverId, signedBy: signOff.userId },
    });
  }
}
```

---

## 4) Rollback Plan

### 4.1 Rollback Triggers

```typescript
export const ROLLBACK_TRIGGERS = [
  "validation_failed",         // Validation tests failed
  "critical_error",            // Critical error in AXIS
  "data_integrity_issue",      // Data integrity problem detected
  "user_request",              // Authorized user requested rollback
] as const;
```

### 4.2 Rollback Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROLLBACK PROCESS                                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 1: INITIATE ROLLBACK                                              ││
│  │  • Authorized user approves rollback                                    ││
│  │  • Log rollback decision                                                ││
│  │  • Notify stakeholders                                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 2: DISABLE AXIS                                                   ││
│  │  • Freeze AXIS transactions                                             ││
│  │  • Capture any delta since cutover                                      ││
│  │  • Disable AXIS access                                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 3: RESTORE LEGACY                                                 ││
│  │  • Re-enable legacy access                                              ││
│  │  • Apply delta transactions (if any)                                    ││
│  │  • Verify legacy operational                                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  STEP 4: POST-ROLLBACK                                                  ││
│  │  • Update migration status: rolled_back                                 ││
│  │  • Generate rollback report                                             ││
│  │  • Schedule post-mortem                                                 ││
│  │  • Plan re-migration                                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  INVARIANT: Raw zone is NEVER deleted — always replayable                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Rollback Execution

```typescript
// packages/migration/src/cutover/rollback.ts

/**
 * Execute rollback
 */
export async function executeRollback(
  db: Database,
  cutoverId: string,
  reason: RollbackTrigger,
  authorizedBy: string
): Promise<RollbackResult> {
  const cutover = await getCutover(db, cutoverId);
  
  // 1. Verify rollback is authorized
  const authorized = await verifyRollbackAuthorization(db, cutover.tenantId, authorizedBy);
  if (!authorized) {
    throw new Error("Rollback not authorized");
  }
  
  // 2. Log rollback initiation
  await logMigrationEvent(db, {
    tenantId: cutover.tenantId,
    migrationId: cutover.migrationId,
    event: "rollback_initiated",
    details: { cutoverId, reason, authorizedBy },
  });
  
  // 3. Capture AXIS delta (transactions since cutover)
  const delta = await captureAXISDelta(db, cutover.tenantId, cutover.phases.switch.axisEnabledAt!);
  
  // 4. Disable AXIS
  await disableAXISAccess(cutover.tenantId);
  
  // 5. Re-enable legacy
  await reenableLegacyAccess(cutover.tenantId);
  
  // 6. Apply delta to legacy (if any and if possible)
  let deltaApplied = false;
  if (delta.transactions.length > 0) {
    try {
      await applyDeltaToLegacy(cutover.tenantId, delta);
      deltaApplied = true;
    } catch (error) {
      // Log but continue — delta can be applied manually
      await logMigrationEvent(db, {
        tenantId: cutover.tenantId,
        migrationId: cutover.migrationId,
        event: "rollback_delta_failed",
        details: { error: String(error), deltaCount: delta.transactions.length },
      });
    }
  }
  
  // 7. Update cutover status
  await db.update(cutoverExecutions)
    .set({
      currentPhase: "rollback",
      overallStatus: "rolled_back",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(cutoverExecutions.id, cutoverId));
  
  // 8. Update migration status
  await db.update(migrationStates)
    .set({
      currentMode: "parallel", // Back to parallel mode
      updatedAt: new Date().toISOString(),
    })
    .where(eq(migrationStates.id, cutover.migrationId));
  
  // 9. Log rollback completion
  await logMigrationEvent(db, {
    tenantId: cutover.tenantId,
    migrationId: cutover.migrationId,
    event: "rollback_completed",
    details: { cutoverId, deltaApplied, deltaCount: delta.transactions.length },
  });
  
  return {
    success: true,
    deltaTransactions: delta.transactions.length,
    deltaApplied,
    rolledBackAt: new Date().toISOString(),
  };
}
```

---

## 5) Cutover Checklist

### 5.1 Pre-Cutover Checklist

```typescript
export const PRE_CUTOVER_CHECKLIST = [
  // Technical
  { id: "tech-1", category: "technical", item: "All gates green for 3+ days", required: true },
  { id: "tech-2", category: "technical", item: "Final reconciliation completed", required: true },
  { id: "tech-3", category: "technical", item: "Backup of legacy data taken", required: true },
  { id: "tech-4", category: "technical", item: "AXIS system health verified", required: true },
  { id: "tech-5", category: "technical", item: "Integration endpoints configured", required: true },
  
  // Business
  { id: "biz-1", category: "business", item: "Financial sign-off obtained", required: true },
  { id: "biz-2", category: "business", item: "Operational sign-off obtained", required: true },
  { id: "biz-3", category: "business", item: "Users trained (>80%)", required: true },
  { id: "biz-4", category: "business", item: "Communication sent to stakeholders", required: true },
  
  // Operational
  { id: "ops-1", category: "operational", item: "Support team briefed", required: true },
  { id: "ops-2", category: "operational", item: "Rollback plan documented", required: true },
  { id: "ops-3", category: "operational", item: "Escalation contacts confirmed", required: true },
  { id: "ops-4", category: "operational", item: "Freeze window scheduled", required: true },
];
```

### 5.2 Cutover Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUTOVER DASHBOARD                                         │
│                                                                              │
│  Migration: QuickBooks → AXIS                                                │
│  Cutover Scheduled: 2026-01-25 22:00 UTC                                    │
│  Freeze Window: 4 hours                                                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PREREQUISITES                                                           ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  🟢 All gates green                      5 consecutive days              ││
│  │  🟢 Financial sign-off                   Signed by CFO                   ││
│  │  🟢 Operational sign-off                 Signed by COO                   ││
│  │  🟢 Users trained                        92%                             ││
│  │  🟢 Open tickets                         2 (max 5)                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  PHASE STATUS                                                            ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  ✅ Preparation      Completed      2026-01-25 20:00                     ││
│  │  🔄 Freeze           In Progress    Started 2026-01-25 22:00             ││
│  │  ⏳ Switch           Pending                                              ││
│  │  ⏳ Validation       Pending                                              ││
│  │  ⏳ Completion       Pending                                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  CURRENT PHASE: FREEZE                                                   ││
│  │                                                                          ││
│  │  ✅ Legacy frozen                    22:00                               ││
│  │  ✅ Final delta import               22:15 (127 transactions)            ││
│  │  🔄 Final reconciliation             In progress...                      ││
│  │  ⏳ Verify all gates green                                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  [Proceed to Switch]  [Initiate Rollback]  [Pause Cutover]              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6) Post-Cutover

### 6.1 Post-Cutover Report

```typescript
// packages/migration/src/cutover/report.ts

export interface PostCutoverReport {
  tenantId: string;
  migrationId: string;
  cutoverId: string;
  
  // Timeline
  timeline: {
    migrationStarted: string;
    mirrorModeStarted: string;
    parallelModeStarted: string;
    cutoverStarted: string;
    cutoverCompleted: string;
    totalDays: number;
  };
  
  // Data summary
  dataSummary: {
    partiesMigrated: number;
    itemsMigrated: number;
    accountsMigrated: number;
    transactionsMigrated: number;
    totalRecords: number;
  };
  
  // Quality metrics
  qualityMetrics: {
    mappingConfidence: number;
    finalReconciliationVariance: string;
    exceptionsResolved: number;
    exceptionsAccepted: number;
  };
  
  // Sign-offs
  signOffs: {
    financial: { signedBy: string; signedAt: string };
    operational: { signedBy: string; signedAt: string };
    final: { signedBy: string; signedAt: string };
  };
  
  // Recommendations
  recommendations: string[];
  
  generatedAt: string;
}
```

---

## 7) Exit Criteria (C05 Gate)

**C05 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                    | Status |
| --- | -------------------------------------------- | ------ |
| 1   | Cutover prerequisites defined                | ✅      |
| 2   | Cutover phases documented                    | ✅      |
| 3   | Cutover execution engine                     | ✅      |
| 4   | Rollback plan and execution                  | ✅      |
| 5   | Pre-cutover checklist                        | ✅      |
| 6   | Cutover dashboard UI                         | ✅      |
| 7   | Post-cutover report                          | ✅      |
| 8   | Integration with C04 gates                   | ✅      |

---

## 8) C-Series Complete

The C-series is now complete:

| Document | Purpose | Status |
| -------- | ------- | ------ |
| **C01** | Migration Philosophy & Modes | ✅ Complete |
| **C02** | Column Adapter (Gang of Four) | ✅ Complete |
| **C03** | Mapping Studio (Lynx-powered) | ✅ Complete |
| **C04** | Dual Ledger Reconciliation | ✅ Complete |
| **C05** | Cutover Runbook | ✅ Complete |

---

## 9) Integration with Other Phases

| Phase               | Integration                                           |
| ------------------- | ----------------------------------------------------- |
| **C01** (Philosophy)| Cutover is the final mode transition                  |
| **C04** (Dual Ledger)| Gates must be GREEN before cutover is allowed        |
| **B08** (Controls)  | Cutover requires sign-off approvals via workflow      |
| **A01-01** (Lynx)   | The Machine assists with validation tests             |

---

## Related Documents

| Document                                                             | Purpose                                 |
| -------------------------------------------------------------------- | --------------------------------------- |
| [C01-MIGRATION-PHILOSOPHY.md](./C01-MIGRATION-PHILOSOPHY.md)         | Migration modes and state machine       |
| [C04-DUAL-LEDGER.md](./C04-DUAL-LEDGER.md)                           | Green gates prerequisite                |
| [B08-CONTROLS.md](./B08-CONTROLS.md)                                 | Sign-off workflow                       |
| [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) | The Vocabulary of Truth                 |

---

## Document Governance

| Field            | Value                                                                |
| ---------------- | -------------------------------------------------------------------- |
| **Status**       | **Implemented**                                                      |
| **Version**      | 1.0.0                                                                |
| **Derived From** | C01-MIGRATION-PHILOSOPHY.md v1.0.0, C04-DUAL-LEDGER.md v1.0.0        |
| **Phase**        | C05 (Cutover Runbook)                                                |
| **Author**       | AXIS Architecture Team                                               |
| **Last Updated** | 2026-01-22                                                           |

---

> *"Cutover is not a leap of faith. The Machine provides calculated proof."*
