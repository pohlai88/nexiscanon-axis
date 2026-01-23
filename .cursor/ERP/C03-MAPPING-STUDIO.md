# C03 — Mapping Studio
## The Machine's "Few Clicks" Column Mapping

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|                        C-Series                        |                                |                            |                             |                         |
| :----------------------------------------------------: | :----------------------------: | :------------------------: | :-------------------------: | :---------------------: |
| [C01](./C01-MIGRATION-PHILOSOPHY.md)                   | [C02](./C02-COLUMN-ADAPTER.md) |         **[C03]**          | [C04](./C04-DUAL-LEDGER.md) | [C05](./C05-CUTOVER.md) |
|                       Philosophy                       |         Column Adapter         |       Mapping Studio       |         Dual Ledger         |         Cutover         |

---

> **Derived From:** [C02-COLUMN-ADAPTER.md](./C02-COLUMN-ADAPTER.md) v1.0.0, [A01-01-LYNX.md](./A01-01-LYNX.md) v1.2.0, [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) v1.1.0
>
> **Tag:** `MAPPING-STUDIO` | `THE-MACHINE` | `COA-MAPPING` | `ALIAS-RESOLUTION` | `PHASE-C03`

---

## 🛑 DEV NOTE: Respect @axis/registry & The Machine

> **ALL DEVELOPERS MUST READ THIS BEFORE WRITING ANY CODE**

### The Law

All Mapping Studio schemas follow the **Single Source of Truth** pattern:

| Component            | Source                                          |
| -------------------- | ----------------------------------------------- |
| Mapping Status       | `@axis/registry/schemas/mapping/constants.ts`   |
| Column Mapping       | `@axis/registry/schemas/mapping/mapping.ts`     |
| COA Mapping Schema   | `@axis/registry/schemas/mapping/coa.ts`         |
| Alias Mapping Schema | `@axis/registry/schemas/mapping/alias.ts`       |
| Tax Code Mapping     | `@axis/registry/schemas/mapping/tax.ts`         |
| Mapping Version      | `@axis/registry/schemas/mapping/version.ts`     |
| Mapping Events       | `@axis/registry/schemas/events/mapping.ts`      |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

### The Machine in Mapping Studio

The Mapping Studio leverages Lynx (The Machine's Awareness) for:

| Capability        | The Machine...                                   |
| ----------------- | ------------------------------------------------ |
| COA Analysis      | ...notices account patterns and balance types    |
| Alias Resolution  | ...recognizes duplicate entities ("Apple vs APPLE") |
| Tax Code Mapping  | ...offers jurisdiction and rate suggestions      |
| Confidence Scoring| ...indicates certainty with transparency         |
| Batch Accept      | ...enables "few clicks" for high-confidence maps |

---

## Preamble

> *"94% mapped automatically. Confirm the remaining 6% with a few clicks."*

The Mapping Studio is where column semantics become AXIS canonical mappings. It's the **"few clicks" moment** — The Machine does the heavy lifting, humans confirm the edge cases.

---

## 1) The Core Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE MAPPING STUDIO PRINCIPLE                              │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║   Input: Column Semantics (from C02)                              ║    │
│    ║   Output: Confirmed Mappings → AXIS Canonical                     ║    │
│    ║                                                                   ║    │
│    ║   ┌────────────────────────────────────────────────────────────┐  ║    │
│    ║   │                                                            │  ║    │
│    ║   │   Lynx Analysis           User Confirmation               │  ║    │
│    ║   │   ┌────────────┐          ┌────────────────────────────┐  │  ║    │
│    ║   │   │ 94%        │          │ ✓ Accept All High Conf     │  │  ║    │
│    ║   │   │ confidence │  ───▶    │ ⚠ Review 12 items          │  │  ║    │
│    ║   │   │ mappings   │          │   - Account X → [select]   │  │  ║    │
│    ║   │   └────────────┘          │   - Party Y → [select]     │  │  ║    │
│    ║   │                           └────────────────────────────┘  │  ║    │
│    ║   │                                                            │  ║    │
│    ║   └────────────────────────────────────────────────────────────┘  ║    │
│    ║                                                                   ║    │
│    ║   Result: 100% mapped, ready for trial import                     ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Mapping Studio Architecture

### 2.1 Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MAPPING STUDIO ARCHITECTURE                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      INPUTS (from C02)                                   ││
│  │  Column Semantics │ Confidence Scores │ Alternatives │ Sample Data      ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      MAPPING ENGINE                                      ││
│  │                                                                          ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                ││
│  │  │ Auto-Accept   │  │ Review Queue  │  │ Exception     │                ││
│  │  │ (conf > 0.9)  │  │ (0.7 - 0.9)   │  │ (conf < 0.7)  │                ││
│  │  └───────────────┘  └───────────────┘  └───────────────┘                ││
│  │                                                                          ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      SPECIALIZED MAPPERS                                 ││
│  │                                                                          ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                ││
│  │  │ COA Mapper    │  │ Party/Item    │  │ Tax Code      │                ││
│  │  │ (Account Type │  │ Resolver      │  │ Mapper        │                ││
│  │  │  Balance Dir) │  │ (Alias Match) │  │               │                ││
│  │  └───────────────┘  └───────────────┘  └───────────────┘                ││
│  │                                                                          ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      MAPPING UI                                          ││
│  │                                                                          ││
│  │  ┌───────────────────────────────────────────────────────────────────┐  ││
│  │  │ Confidence Dashboard │ Review List │ Bulk Actions │ Export       │  ││
│  │  └───────────────────────────────────────────────────────────────────┘  ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Mapping Schema

```typescript
// packages/axis-registry/src/schemas/migration/mapping.ts

export const MAPPING_STATUS = [
  "auto_accepted",     // High confidence, auto-approved
  "pending_review",    // Medium confidence, needs human review
  "user_confirmed",    // Human confirmed
  "user_rejected",     // Human rejected, needs remapping
  "exception",         // Low confidence, requires manual mapping
] as const;

export const columnMappingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  // Source
  sourceTable: z.string(),
  sourceColumn: z.string(),
  sourceDataType: z.string(),
  
  // Semantic analysis (from C02)
  semanticCategory: z.string(),
  confidence: z.number().min(0).max(1),
  
  // Target mapping
  targetSchema: z.string(),              // e.g., "party", "item", "account"
  targetField: z.string(),               // e.g., "legalName", "code", "balance"
  
  // Transform
  transform: z.object({
    name: z.string(),
    options: z.record(z.unknown()).optional(),
  }).optional(),
  
  // Status
  status: z.enum(MAPPING_STATUS),
  
  // Review trail
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().datetime().optional(),
  reviewNote: z.string().max(500).optional(),
  
  // Alternatives (for user selection)
  alternatives: z.array(z.object({
    targetField: z.string(),
    confidence: z.number(),
  })).optional(),
  
  // Versioning
  version: z.number().int().default(1),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ColumnMapping = z.infer<typeof columnMappingSchema>;
```

---

## 3) Chart of Accounts (COA) Mapping

### 3.1 The COA Challenge

Every ERP has a different chart of accounts. The challenge is mapping legacy accounts to AXIS account types with correct:
- **Account Type** (asset, liability, equity, revenue, expense)
- **Normal Balance** (debit or credit)
- **Control Account** flags (AR, AP, Inventory)

### 3.2 COA Mapping Schema

```typescript
// packages/axis-registry/src/schemas/migration/coa-mapping.ts

export const coaMappingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  // Source account
  sourceCode: z.string(),
  sourceName: z.string(),
  sourceBalance: z.string().optional(),    // Current balance for validation
  
  // Machine analysis
  suggestedAccountType: z.string(),
  suggestedNormalBalance: z.enum(["debit", "credit"]),
  suggestedIsControl: z.boolean(),
  suggestedControlType: z.enum(["ar", "ap", "inventory"]).optional(),
  confidence: z.number().min(0).max(1),
  
  // Confirmed mapping
  confirmedAccountType: z.string().optional(),
  confirmedNormalBalance: z.enum(["debit", "credit"]).optional(),
  confirmedIsControl: z.boolean().optional(),
  confirmedControlType: z.enum(["ar", "ap", "inventory"]).optional(),
  
  // Status
  status: z.enum(MAPPING_STATUS),
  
  // Validation
  balanceValidation: z.object({
    expectedBalance: z.string(),
    matchesNormalBalance: z.boolean(),
    warning: z.string().optional(),
  }).optional(),
  
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type COAMapping = z.infer<typeof coaMappingSchema>;
```

### 3.3 COA Mapping Engine

```typescript
// packages/migration/src/mapping/coa-mapper.ts

/**
 * Map legacy COA to AXIS account types
 */
export class COAMapper {
  constructor(private readonly lynx: LynxService) {}

  /**
   * Analyze and suggest mappings for all accounts
   */
  async mapChartOfAccounts(
    tenantId: string,
    migrationId: string,
    accounts: LegacyAccount[]
  ): Promise<COAMapping[]> {
    const mappings: COAMapping[] = [];
    
    for (const account of accounts) {
      const mapping = await this.analyzeAccount(tenantId, migrationId, account);
      mappings.push(mapping);
    }
    
    // Validate the complete COA
    const validation = await this.validateCOA(mappings);
    
    // Update mappings with validation warnings
    for (const mapping of mappings) {
      const accountValidation = validation.find(v => v.sourceCode === mapping.sourceCode);
      if (accountValidation?.warning) {
        mapping.balanceValidation = accountValidation;
      }
    }
    
    return mappings;
  }

  /**
   * Analyze a single account
   */
  private async analyzeAccount(
    tenantId: string,
    migrationId: string,
    account: LegacyAccount
  ): Promise<COAMapping> {
    // The Machine analyzes the account
    const analysis = await this.lynx.generateObject({
      schema: z.object({
        accountType: z.enum(ACCOUNT_TYPE),
        normalBalance: z.enum(["debit", "credit"]),
        isControlAccount: z.boolean(),
        controlType: z.enum(["ar", "ap", "inventory"]).optional(),
        confidence: z.number(),
        reasoning: z.string(),
      }),
      prompt: `Analyze this account from a legacy ERP and determine its AXIS account type.
               
               Account Code: ${account.code}
               Account Name: ${account.name}
               Current Balance: ${account.balance}
               Parent Account: ${account.parent || "none"}
               
               Determine:
               1. Account type (asset, liability, equity, revenue, expense)
               2. Normal balance direction (debit or credit)
               3. Is it a control account (AR, AP, Inventory)?
               
               Common patterns:
               - "Accounts Receivable" → asset_receivable, debit, control: ar
               - "Accounts Payable" → liability_payable, credit, control: ap
               - "Inventory" → asset_inventory, debit, control: inventory
               - "Sales" → revenue, credit
               - "Cost of Goods Sold" → expense_cogs, debit
               - "Bank" → asset_bank, debit
               - "Retained Earnings" → equity_retained_earnings, credit`,
    });
    
    // Validate balance against normal balance
    const balance = parseDecimal(account.balance || "0");
    const matchesNormalBalance = 
      (analysis.normalBalance === "debit" && balance >= 0) ||
      (analysis.normalBalance === "credit" && balance >= 0);
    
    return {
      id: generateUUID(),
      tenantId,
      migrationId,
      sourceCode: account.code,
      sourceName: account.name,
      sourceBalance: account.balance,
      suggestedAccountType: analysis.accountType,
      suggestedNormalBalance: analysis.normalBalance,
      suggestedIsControl: analysis.isControlAccount,
      suggestedControlType: analysis.controlType,
      confidence: analysis.confidence,
      status: analysis.confidence > 0.9 ? "auto_accepted" : 
              analysis.confidence > 0.7 ? "pending_review" : "exception",
      balanceValidation: {
        expectedBalance: account.balance || "0",
        matchesNormalBalance,
        warning: matchesNormalBalance ? undefined : 
          `Balance ${account.balance} suggests opposite normal balance`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate complete COA
   */
  private async validateCOA(mappings: COAMapping[]): Promise<COAValidation[]> {
    const validations: COAValidation[] = [];
    
    // Check for required control accounts
    const hasAR = mappings.some(m => m.suggestedControlType === "ar");
    const hasAP = mappings.some(m => m.suggestedControlType === "ap");
    const hasInventory = mappings.some(m => m.suggestedControlType === "inventory");
    
    if (!hasAR) {
      validations.push({
        type: "missing_control",
        warning: "No AR control account identified",
      });
    }
    
    if (!hasAP) {
      validations.push({
        type: "missing_control",
        warning: "No AP control account identified",
      });
    }
    
    // Check balance sheet equation (Assets = Liabilities + Equity)
    const assets = mappings
      .filter(m => m.suggestedAccountType.startsWith("asset"))
      .reduce((sum, m) => sum + parseDecimal(m.sourceBalance || "0"), 0);
    const liabilities = mappings
      .filter(m => m.suggestedAccountType.startsWith("liability"))
      .reduce((sum, m) => sum + parseDecimal(m.sourceBalance || "0"), 0);
    const equity = mappings
      .filter(m => m.suggestedAccountType.startsWith("equity"))
      .reduce((sum, m) => sum + parseDecimal(m.sourceBalance || "0"), 0);
    
    const difference = Math.abs(assets - (liabilities + equity));
    if (difference > 0.01) {
      validations.push({
        type: "balance_mismatch",
        warning: `Balance sheet doesn't balance: Assets (${assets}) ≠ Liabilities + Equity (${liabilities + equity})`,
      });
    }
    
    return validations;
  }
}
```

---

## 4) Party & Item Alias Resolution

### 4.1 The Alias Problem

> *"Apple ≠ APPLE ≠ Apples Inc. → But they're all the same customer"*

Legacy data often has duplicate entries with different spellings. The Mapping Studio uses B03 MDM's alias system to resolve these.

### 4.2 Alias Resolution Engine

```typescript
// packages/migration/src/mapping/alias-resolver.ts

/**
 * Resolve party/item aliases during migration
 */
export class AliasResolver {
  constructor(
    private readonly lynx: LynxService,
    private readonly db: Database
  ) {}

  /**
   * Find potential duplicates in source data
   */
  async findPotentialDuplicates(
    tenantId: string,
    records: { id: string; name: string; type: "party" | "item" }[]
  ): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = [];
    
    // Normalize all names
    const normalized = records.map(r => ({
      ...r,
      normalized: this.normalizeForMatching(r.name),
    }));
    
    // Group by normalized name
    const groupMap = new Map<string, typeof normalized>();
    for (const record of normalized) {
      const existing = groupMap.get(record.normalized);
      if (existing) {
        existing.push(record);
      } else {
        groupMap.set(record.normalized, [record]);
      }
    }
    
    // Find groups with multiple records
    for (const [normalized, members] of groupMap) {
      if (members.length > 1) {
        groups.push({
          normalized,
          members: members.map(m => ({ id: m.id, name: m.name })),
          suggestedCanonical: this.selectCanonical(members),
          confidence: this.calculateDuplicateConfidence(members),
        });
      }
    }
    
    // Use Lynx for fuzzy matching
    const fuzzyGroups = await this.findFuzzyDuplicates(tenantId, normalized);
    groups.push(...fuzzyGroups);
    
    return groups;
  }

  /**
   * Normalize name for matching (B03 MDM pattern)
   */
  private normalizeForMatching(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")  // Remove non-alphanumeric
      .replace(/\s+/g, "")         // Remove whitespace
      .replace(/(inc|llc|ltd|corp|company|co)$/i, ""); // Remove suffixes
  }

  /**
   * The Machine performs fuzzy duplicate detection
   */
  private async findFuzzyDuplicates(
    tenantId: string,
    records: Array<{ id: string; name: string; normalized: string }>
  ): Promise<DuplicateGroup[]> {
    // Batch records for Lynx analysis
    const batches = chunkArray(records, 50);
    const groups: DuplicateGroup[] = [];
    
    for (const batch of batches) {
      const result = await this.lynx.generateObject({
        schema: z.object({
          duplicateGroups: z.array(z.object({
            memberIds: z.array(z.string()),
            reasoning: z.string(),
            confidence: z.number(),
          })),
        }),
        prompt: `Analyze these names and identify potential duplicates that refer to the same entity.
                 
                 Names:
                 ${batch.map(r => `${r.id}: ${r.name}`).join("\n")}
                 
                 Consider:
                 - Different spellings (McDonald's vs McDonalds)
                 - Abbreviations (IBM vs International Business Machines)
                 - Typos (Microsft vs Microsoft)
                 - Suffixes (Apple Inc vs Apple)
                 - Unicode variations (Café vs Cafe)`,
      });
      
      for (const group of result.duplicateGroups) {
        if (group.memberIds.length > 1) {
          const members = group.memberIds
            .map(id => batch.find(r => r.id === id))
            .filter(Boolean);
          
          groups.push({
            normalized: members[0]!.normalized,
            members: members.map(m => ({ id: m!.id, name: m!.name })),
            suggestedCanonical: this.selectCanonical(members as any),
            confidence: group.confidence,
          });
        }
      }
    }
    
    return groups;
  }

  /**
   * Create alias mappings from resolved duplicates
   */
  async createAliasMappings(
    tenantId: string,
    migrationId: string,
    duplicateGroups: DuplicateGroup[],
    confirmations: DuplicateConfirmation[]
  ): Promise<AliasMapping[]> {
    const aliasMappings: AliasMapping[] = [];
    
    for (const confirmation of confirmations) {
      const group = duplicateGroups.find(g => 
        g.members.some(m => m.id === confirmation.canonicalId)
      );
      
      if (!group) continue;
      
      // Create alias entries for non-canonical members
      for (const member of group.members) {
        if (member.id !== confirmation.canonicalId) {
          aliasMappings.push({
            id: generateUUID(),
            tenantId,
            migrationId,
            sourceId: member.id,
            sourceName: member.name,
            canonicalId: confirmation.canonicalId,
            canonicalName: group.members.find(m => m.id === confirmation.canonicalId)!.name,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    
    return aliasMappings;
  }
}
```

---

## 5) Tax Code Mapping

```typescript
// packages/migration/src/mapping/tax-mapper.ts

/**
 * Map legacy tax codes to AXIS tax codes
 */
export class TaxCodeMapper {
  constructor(private readonly lynx: LynxService) {}

  async mapTaxCodes(
    tenantId: string,
    migrationId: string,
    legacyTaxCodes: LegacyTaxCode[]
  ): Promise<TaxCodeMapping[]> {
    const mappings: TaxCodeMapping[] = [];
    
    for (const taxCode of legacyTaxCodes) {
      const analysis = await this.lynx.generateObject({
        schema: z.object({
          taxType: z.enum(["sales_tax", "vat", "gst", "service_tax", "withholding", "exempt", "zero_rated"]),
          rate: z.number(),
          jurisdiction: z.string().optional(),
          confidence: z.number(),
        }),
        prompt: `Analyze this tax code from a legacy ERP:
                 
                 Code: ${taxCode.code}
                 Name: ${taxCode.name}
                 Rate: ${taxCode.rate}%
                 
                 Determine:
                 1. Tax type (sales_tax, vat, gst, etc.)
                 2. Jurisdiction if identifiable
                 3. Is it exempt or zero-rated?`,
      });
      
      mappings.push({
        id: generateUUID(),
        tenantId,
        migrationId,
        sourceCode: taxCode.code,
        sourceName: taxCode.name,
        sourceRate: taxCode.rate,
        suggestedTaxType: analysis.taxType,
        suggestedRate: analysis.rate,
        suggestedJurisdiction: analysis.jurisdiction,
        confidence: analysis.confidence,
        status: analysis.confidence > 0.9 ? "auto_accepted" : "pending_review",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    return mappings;
  }
}
```

---

## 6) Mapping Studio UI

### 6.1 Confidence Dashboard

```typescript
// The "few clicks" experience starts with the confidence dashboard

export interface ConfidenceDashboard {
  totalMappings: number;
  
  // By status
  autoAccepted: number;      // High confidence (>90%)
  pendingReview: number;     // Medium confidence (70-90%)
  exceptions: number;        // Low confidence (<70%)
  userConfirmed: number;     // Already confirmed
  
  // Overall confidence
  overallConfidence: number; // Weighted average
  
  // By category
  byCategory: {
    parties: { total: number; confirmed: number; pending: number };
    items: { total: number; confirmed: number; pending: number };
    accounts: { total: number; confirmed: number; pending: number };
    taxCodes: { total: number; confirmed: number; pending: number };
  };
  
  // Ready status
  readyForTrialImport: boolean;
  blockers: string[];
}
```

### 6.2 Review List UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MAPPING REVIEW                                            │
│                                                                              │
│  Overall Confidence: 94%   │   12 items need review                         │
│  ████████████████░░░░░░░░░░│                                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [Accept All High Confidence (847 items)]  [Export]  [Reset]            │││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ ACCOUNTS (12 need review)                                               ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ Source: "Misc Income"                                                   ││
│  │ Suggested: revenue_other (85% confidence)                               ││
│  │ Alternatives: [revenue ▼] [expense_other ▼] [other ▼]                   ││
│  │ Balance: $12,450.00 (credit)                                            ││
│  │ [Confirm Suggested] [Select Alternative] [Skip]                         ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ Source: "Petty Cash"                                                    ││
│  │ Suggested: asset_cash (82% confidence)                                  ││
│  │ Alternatives: [asset_bank ▼] [expense ▼]                                ││
│  │ Balance: $500.00 (debit)                                                ││
│  │ [Confirm Suggested] [Select Alternative] [Skip]                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ PARTIES - DUPLICATES DETECTED (3 groups)                                ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ Group 1: Potential duplicates (95% confidence)                          ││
│  │   ○ Apple Inc.                                                          ││
│  │   ○ APPLE                                                               ││
│  │   ○ Apple Computer Inc                                                  ││
│  │ Select canonical: [Apple Inc. ▼]    [Merge All] [Keep Separate]         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [Proceed to Trial Import]  (Enabled when all reviewed)                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7) Mapping Versioning

```typescript
// packages/axis-registry/src/schemas/migration/mapping-version.ts

export const mappingVersionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  version: z.number().int(),
  
  // Snapshot of all mappings at this version
  mappingsSnapshot: z.array(columnMappingSchema),
  
  // Change summary
  changes: z.array(z.object({
    mappingId: z.string().uuid(),
    field: z.string(),
    oldValue: z.unknown(),
    newValue: z.unknown(),
    changedBy: z.string().uuid(),
  })),
  
  // Status
  status: z.enum(["draft", "active", "superseded"]),
  
  // Trial import results (if run)
  trialImportId: z.string().uuid().optional(),
  trialImportResult: z.enum(["success", "partial", "failed"]).optional(),
  
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type MappingVersion = z.infer<typeof mappingVersionSchema>;
```

---

## 8) Exit Criteria (C03 Gate)

**C03 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                 | Status |
| --- | ----------------------------------------- | ------ |
| 1   | Mapping schema defined                    | ✅      |
| 2   | COA mapping engine (account type, balance)| ✅      |
| 3   | Party/Item alias resolution               | ✅      |
| 4   | Tax code mapping                          | ✅      |
| 5   | Confidence scoring and thresholds         | ✅      |
| 6   | "Few clicks" UI flow documented           | ✅      |
| 7   | Mapping versioning                        | ✅      |
| 8   | Integration with C02 semantic output      | ✅      |

---

## 9) Integration with Other Phases

| Phase               | Integration                                       |
| ------------------- | ------------------------------------------------- |
| **C02** (Adapter)   | Mapping Studio consumes Column Adapter semantics  |
| **C04** (Dual Ledger)| Mappings used for parallel reconciliation        |
| **C05** (Cutover)   | Mapping completeness is a cutover gate            |
| **A01-01** (Lynx)   | The Machine powers COA + alias + tax analysis     |
| **B03** (MDM)       | Alias mappings integrate with MDM registry        |
| **B07** (Accounting)| COA mappings define target account structure      |

---

## Related Documents

| Document                                                             | Purpose                                 |
| -------------------------------------------------------------------- | --------------------------------------- |
| [C02-COLUMN-ADAPTER.md](./C02-COLUMN-ADAPTER.md)                     | Column Adapter (semantic input)         |
| [C04-DUAL-LEDGER.md](./C04-DUAL-LEDGER.md)                           | Dual Ledger (uses mappings)             |
| [A01-01-LYNX.md](./A01-01-LYNX.md)                                   | Lynx (The Machine's Awareness)          |
| [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) | The Vocabulary of Truth                 |
| [B03-MDM.md](./B03-MDM.md)                                           | MDM (alias integration)                 |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)                             | Accounting (COA target)                 |

---

## Document Governance

| Field            | Value                                                               |
| ---------------- | ------------------------------------------------------------------- |
| **Status**       | **Implemented**                                                     |
| **Version**      | 1.0.0                                                               |
| **Derived From** | C02-COLUMN-ADAPTER.md v1.0.0, A01-01-LYNX.md v1.2.0, A01-07 v1.1.0  |
| **Phase**        | C03 (Mapping Studio)                                                |
| **Author**       | AXIS Architecture Team                                              |
| **Last Updated** | 2026-01-22                                                          |

---

> *"94% mapped automatically. The Machine handles it. Confirm the rest with a few clicks."*
