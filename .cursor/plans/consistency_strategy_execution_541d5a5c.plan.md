---
name: Consistency Strategy Execution
overview: Execute E04 validation pipeline, establish AXIS registry with Shadcn schema, and fix TypeScript errors for a clean, consistent design system.
todos:
  - id: mcp-audit
    content: Run Shadcn MCP get_audit_checklist
    status: completed
  - id: mcp-registry
    content: Run list_items_in_registries for @shadcn
    status: completed
  - id: axis-registry
    content: Create AXIS registry.json with schema for all 26 canonical blocks
    status: completed
  - id: registry-items
    content: Define registry-item metadata for each block category
    status: completed
  - id: registry-build
    content: Add registry:build script and generate registry JSON
    status: completed
  - id: fix-types
    content: Create shared types file and fix duplicate exports
    status: completed
  - id: fix-aschild
    content: Remove asChild from TooltipTrigger/CollapsibleTrigger
    status: completed
  - id: fix-select
    content: Fix Select onValueChange null handling
    status: completed
  - id: fix-animations
    content: Fix animation barrel re-exports
    status: completed
  - id: validate
    content: Re-run lint and check-types to verify 0 errors
    status: completed
  - id: report
    content: Generate final consistency report
    status: completed
isProject: false
---

# Design System Consistency & AXIS Registry Plan

## Goal

1. Execute the 7-layer consistency enforcement stack from [E04-CONSISTENCY-STRATEGY.md](.cursor/ERP/E04-CONSISTENCY-STRATEGY.md)
2. Establish a proper AXIS Registry following Shadcn schema specifications
3. Fix TypeScript errors for clean lint/type-check passes

---

## Part 1: AXIS Registry Establishment (Shadcn Best Practice)

Following the official Shadcn registry schema, we will create a proper registry for the AXIS design system.

### 1.1 Registry Structure

```
packages/design-system/
├── registry.json                    # Main registry definition
├── registry/
│   └── axis/                        # AXIS style (like new-york)
│       ├── quorum/                  # Quorum kernel blocks
│       │   ├── command-k/
│       │   ├── six-w1h-manifest/
│       │   ├── exception-hunter/
│       │   ├── drilldown-dashboard/
│       │   └── trend-analysis-widget/
│       ├── cobalt/                  # Cobalt kernel blocks
│       ├── audit/                   # Audit blocks
│       ├── erp/                     # ERP domain blocks
│       └── afanda/                  # AFANDA blocks
└── public/r/                        # Built registry JSON (generated)
```

### 1.2 Registry.json Schema

Create `packages/design-system/registry.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "axis",
  "homepage": "https://axis.nexuscanon.com",
  "items": [
    {
      "name": "summit-button",
      "type": "registry:block",
      "title": "SUMMIT Button",
      "description": "Multi-step workflow button with S.U.M.M.I.T. protocol (Save, Upload, Message, Migrate, Integrate, Terminate)",
      "categories": ["cobalt", "workflow", "erp"],
      "registryDependencies": ["button", "tooltip", "progress"],
      "dependencies": ["motion"],
      "files": [
        {
          "path": "registry/axis/cobalt/summit-button/summit-button.tsx",
          "type": "registry:component"
        }
      ]
    }
    // ... 25 more blocks
  ]
}
```

### 1.3 Registry-Item Metadata for Each Block Category

| Category | Blocks | Key Metadata |

|----------|--------|--------------|

| **Quorum** | command-k, six-w1h-manifest, exception-hunter, drilldown-dashboard, trend-analysis-widget | `categories: ["quorum", "analysis"]` |

| **Cobalt** | summit-button, predictive-form, crud-sap-interface, autofill-engine | `categories: ["cobalt", "execution"]` |

| **Audit** | danger-zone-indicator, audit-trail-viewer, risk-score-display, policy-override-record | `categories: ["audit", "compliance"]` |

| **ERP** | ar-aging-table, ap-aging-table, inventory-valuation-card, trial-balance-table, reconciliation-widget | `categories: ["erp", "accounting"]` |

| **AFANDA** | approval-queue, sharing-board, escalation-ladder, consultation-thread, read-receipt-system | `categories: ["afanda", "collaboration"]` |

### 1.4 Add Registry to components.json

Update root `components.json` to include AXIS registry:

```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/styles/new-york-v4/{name}.json",
    "@axis": "http://localhost:3000/r/{name}.json"  // Local dev
  }
}
```

### 1.5 Build Script

Add to `packages/design-system/package.json`:

```json
{
  "scripts": {
    "registry:build": "shadcn build",
    "registry:serve": "pnpm dev"
  }
}
```

---

## Part 2: Consistency Checks to Execute

### Layer 1-4: Built-in Validation

Run the core validation commands on `packages/design-system`:

```bash
# TypeScript type check
pnpm check-types

# ESLint validation
pnpm lint

# Tailwind CSS build (validates classes)
pnpm css:build
```

### Layer 5: Shadcn MCP Audit

Use MCP tools to validate component registry:

1. **`get_audit_checklist`** - Post-generation validation checklist
2. **`list_items_in_registries`** - Verify components exist in registry
3. **`get-blocks-metadata`** (Studio) - Catalog available blocks

---

## Part 3: Cleanup Actions (TypeScript Errors)

The current design-system has ~150 TypeScript errors from the new canonical blocks:

- **`asChild` prop not in types** (~40 errors): Remove `asChild` or wrap in div
- **Duplicate type exports** (~60 errors): Consolidate to shared types file
- **Select `onValueChange` type** (~10 errors): Add null coalescing
- **Animation re-exports** (3 errors): Use explicit re-exports

### Fix Strategy

1. **Create shared types file**: `packages/design-system/src/blocks/types.ts`

                                                                                                - Move common types: `TrendDirection`, `AgingBucket`, `OverrideReason`
                                                                                                - Remove duplicate exports from individual blocks

2. **Fix `asChild` usage**: Remove from TooltipTrigger/CollapsibleTrigger (not supported in current types)

3. **Fix Select handlers**: Add null coalescing:
   ```tsx
   onValueChange={(value) => value && setPeriod(value)}
   ```

4. **Fix animation re-exports**: Use explicit named exports in `animations/index.ts`

---

## Part 4: Execution Order

1. **MCP Audit** - Run `get_audit_checklist` and `list_items_in_registries`
2. **Create AXIS Registry** - Build `registry.json` with all 26 blocks
3. **Fix TypeScript Errors** - Shared types, asChild, Select handlers, animations
4. **Validate** - Re-run lint and check-types
5. **Build Registry** - Run `shadcn build` to generate JSON
6. **Generate Report** - Final consistency metrics

---

## Expected Output

```
AXIS Design System Health Report
================================
Registry:
 - AXIS Registry: ✓ Established (registry.json)
 - Blocks Cataloged: 26 canonical blocks
 - Categories: 5 (Quorum, Cobalt, Audit, ERP, AFANDA)

Validation:
 - TypeScript: 0 errors (fixed)
 - ESLint: warnings only (acceptable)
 - Tailwind CSS: builds successfully

Shadcn MCP Audit:
 - get_audit_checklist: ✓ Passed
 - Registry items discoverable: 26/26
```
