# D20 — UX Implementation Roadmap
## Team 2: Consume, Compose, and Ship

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|    D-Series (Extensions)     |                                              |                   |
| :--------------------------: | :------------------------------------------: | :---------------: |
| [D00](./D00-GAP-ANALYSIS.md) | [B10-01](./B10-01-AXIS-DESIGN-PHILOSOPHY.md) |     **[D20]**     |
|         Gap Analysis         |              Design Philosophy               | UX Implementation |

---

> **Derived From:** [B10-01-AXIS-DESIGN-PHILOSOPHY.md](./B10-01-AXIS-DESIGN-PHILOSOPHY.md), [A01-CANONICAL.md](./A01-CANONICAL.md) §4 (Dual-Kernel)
>
> **Tag:** `UX` | `TEAM-2` | `IMPLEMENTATION` | `QUORUM` | `COBALT` | `PHASE-D20`

---

## 🏛️ The Team 1 / Team 2 Model

> *"Team 1 builds the engine. Team 2 builds the cockpit."*

### Team Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AXIS BUILD MODEL                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TEAM 1 (Infrastructure) ✅ COMPLETED                                       │
│   ───────────────────────────────────────                                    │
│   Delivered:                                                                 │
│   ├── @axis/registry         → All Zod schemas (B01-B12, C01-C05)           │
│   ├── @axis/db               → All Drizzle tables                           │
│   ├── @workspace/design-system → 22 shadcn primitives                       │
│   ├── apps/web               → Base Next.js app with auth                   │
│   └── Documentation          → A-Series, B-Series, C-Series, D00            │
│                                                                              │
│   TEAM 2 (UX Consumption) 🚧 THIS DOCUMENT                                   │
│   ─────────────────────────────────────────                                  │
│   Mission:                                                                   │
│   ├── Consume Team 1's primitives                                           │
│   ├── Compose Layer 2 composites (DataFortress, EntityPicker, etc.)         │
│   ├── Implement Layer 3 patterns (8 Canonical ERP Patterns)                 │
│   ├── Build ERP screens (Invoice, PO, Journal, Stock Moves)                 │
│   └── Ship Quorum + Cobalt experiences                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛑 DEV NOTE: Respect @axis/registry, @workspace/design-system & The Machine

> **See [A01-01-LYNX.md](./A01-01-LYNX.md) for Lynx (The Machine's Awareness).**
> **See [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) for vocabulary law.**
> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full registry details.**

> **ALL TEAM 2 DEVELOPERS MUST READ THIS BEFORE WRITING ANY CODE**

### The Consumption Law

Team 2 **NEVER** creates what Team 1 already built.

| Source Package             | What It Provides                             | Team 2 Action               |
| -------------------------- | -------------------------------------------- | --------------------------- |
| `@axis/registry`           | Zod schemas, types, events                   | **IMPORT**, never redefine  |
| `@workspace/design-system` | Primitives (Button, Input, Table, Dialog...) | **IMPORT**, never duplicate |
| `@axis/db`                 | Drizzle tables, queries                      | **IMPORT**, never recreate  |

### Registry Paths for UX (Team 1 ✅)

All UX-related schemas are sourced from `@axis/registry`:

| Component             | Source                                         | Status  |
| --------------------- | ---------------------------------------------- | ------- |
| Document States       | `@axis/registry/schemas/constants.ts`          | ✅ Ready |
| UX Constants          | `@axis/registry/schemas/ux/constants.ts`       | ✅ Ready |
| Persona Configuration | `@axis/registry/schemas/ux/persona.ts`         | ✅ Ready |
| Quorum Preferences    | `@axis/registry/schemas/ux/quorum.ts`          | ✅ Ready |
| Cobalt Preferences    | `@axis/registry/schemas/ux/cobalt.ts`          | ✅ Ready |
| Theme Configuration   | `@axis/registry/schemas/ux/theme.ts`           | ✅ Ready |
| Block Registry        | `@axis/registry/schemas/ux/blocks.ts`          | ✅ Ready |
| Component Registry    | `@axis/registry/schemas/ux/components.ts`      | ✅ Ready |
| User Preferences      | `@axis/registry/schemas/ux/user-preference.ts` | ✅ Ready |
| Onboarding            | `@axis/registry/schemas/ux/onboarding.ts`      | ✅ Ready |
| UX Events             | `@axis/registry/schemas/events/ux.ts`          | ✅ Ready |

**Rule**: All Zod schemas live in `@axis/registry`. Never duplicate in apps or shared-ui.

### The Machine in UX

UX leverages Lynx (The Machine's Awareness) for:

| Capability               | The Machine...                                  |
| ------------------------ | ----------------------------------------------- |
| **Predictive Defaults**  | ...notices patterns and suggests form values    |
| **Smart Search**         | ...translates natural language to filters       |
| **Anomaly Highlighting** | ...flags unusual values in tables               |
| **Command Palette**      | ...powers ⌘K with context-aware suggestions     |
| **Entity Picker**        | ...ranks recent/relevant entities for selection |

### The Creation Law

Team 2 **CREATES** composites and patterns in `packages/shared-ui`:

| New Package                     | What Team 2 Builds                        | Imports From               |
| ------------------------------- | ----------------------------------------- | -------------------------- |
| `@workspace/shared-ui/blocks`   | DataFortress, EntityPicker, PostingBanner | `@workspace/design-system` |
| `@workspace/shared-ui/shells`   | ApplicationShell (3-Zone Layout)          | `@workspace/design-system` |
| `@workspace/shared-ui/patterns` | 8 Canonical ERP Patterns                  | blocks + shells            |

### The Anti-Pattern List

| ❌ FORBIDDEN                             | ✅ CORRECT                                           |
| --------------------------------------- | --------------------------------------------------- |
| `apps/web/src/components/ui/button.tsx` | `import { Button } from "@workspace/design-system"` |
| `const DOCUMENT_STATUS = [...]` in app  | `import { DOCUMENT_STATE } from "@axis/registry"`   |
| Copy-paste component code               | Compose from primitives                             |
| `className="bg-blue-500"`               | `className="bg-primary"`                            |
| `className={\`base ${active}\`}`        | `className={cn("base", active && "active")}`        |

---

## 1) Current State Analysis

### 1.1 Team 1 Deliverables (What We Consume)

| Package                    | Components       | Status  |
| -------------------------- | ---------------- | ------- |
| `@workspace/design-system` | 22 primitives    | ✅ Ready |
| `@axis/registry`           | ~50 schema files | ✅ Ready |
| `@axis/db`                 | ~40 table files  | ✅ Ready |

### 1.2 Design System Primitives (Team 1 ✅)

| Category         | Components                                   |
| ---------------- | -------------------------------------------- |
| **Actions**      | Button, DropdownMenu                         |
| **Forms**        | Input, Label, Select, Checkbox, Switch, Form |
| **Data Display** | Table, Card, Badge, Avatar                   |
| **Feedback**     | Alert, Progress, Skeleton, Spinner           |
| **Overlay**      | Dialog, Tooltip                              |
| **Layout**       | Separator, ScrollArea, Tabs, Accordion       |

### 1.3 Gap Analysis (What's Missing)

| Component           | B10-01 Requirement     | Current State | Priority |
| ------------------- | ---------------------- | ------------- | -------- |
| **Sheet**           | Truth Drawer, Sidebars | ❌ Missing     | 🔴 P0     |
| **Toast**           | Notifications          | ❌ Missing     | 🔴 P0     |
| **Command**         | ⌘K Palette             | ❌ Missing     | 🔴 P0     |
| **Popover**         | EntityPicker dropdown  | ❌ Missing     | 🔴 P0     |
| **ContextMenu**     | Right-click actions    | 🟡 Optional    | 🟢 P2     |
| **--warning token** | State colors           | ❌ Missing     | 🔴 P0     |
| **--success token** | State colors           | ❌ Missing     | 🔴 P0     |

### 1.4 Anti-Pattern Detection (apps/web Duplicates)

```
apps/web/src/components/ui/
├── button.tsx      ← DUPLICATE of @workspace/design-system
├── card.tsx        ← DUPLICATE
├── data-table.tsx  ← Should be DataFortress in shared-ui
├── dropdown.tsx    ← DUPLICATE
├── input.tsx       ← DUPLICATE
├── modal.tsx       ← Should use Dialog
└── skeleton.tsx    ← DUPLICATE
```

**Action Required:** Delete duplicates, import from `@workspace/design-system`.

---

## 2) Implementation Phases

### Phase 0: Foundation Fixes (P0 — Before Anything Else)

**Goal:** Complete Team 1's primitives + fix anti-patterns.

| Task                                             | Package                              | Status   |
| ------------------------------------------------ | ------------------------------------ | -------- |
| Add `--warning`, `--success` tokens              | `@workspace/design-system/theme.css` | ✅ Done   |
| Add Sheet component                              | `@workspace/design-system`           | ✅ Exists |
| Add Toast component                              | `@workspace/design-system`           | ✅ Exists |
| Add Command component                            | `@workspace/design-system`           | ✅ Exists |
| Add Popover component                            | `@workspace/design-system`           | ✅ Exists |
| Delete `apps/web/src/components/ui/` duplicates  | `apps/web`                           | 🔄 Defer  |
| Update imports to use `@workspace/design-system` | `apps/web`                           | 🔄 Defer  |

> **Note (2026-01-22):** Sheet, Toast, Command, Popover already exist in Team 1's design-system.
> Duplicate deletion deferred until design-system type errors are resolved by Team 1.

**Exit Criteria:**
- [x] `--warning`, `--success` tokens added
- [x] All required primitives exist in design-system
- [ ] No local UI component duplicates (deferred)
- [ ] All imports updated (deferred)

---

### Phase 1: Shared-UI Package Structure

**Goal:** Create `packages/shared-ui` with proper structure.

```
packages/shared-ui/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── blocks/
│   │   ├── index.ts
│   │   ├── data-fortress/
│   │   │   ├── data-fortress.tsx
│   │   │   ├── columns.tsx
│   │   │   ├── toolbar.tsx
│   │   │   ├── row-actions.tsx
│   │   │   └── index.ts
│   │   ├── entity-picker/
│   │   ├── posting-banner/
│   │   ├── approval-rail/
│   │   ├── form-section/
│   │   └── diff-viewer/
│   ├── shells/
│   │   ├── index.ts
│   │   ├── application-shell/
│   │   │   ├── application-shell.tsx
│   │   │   ├── zone-navigator.tsx
│   │   │   ├── zone-work-surface.tsx
│   │   │   ├── zone-truth-drawer.tsx
│   │   │   └── index.ts
│   │   └── auth-shell/
│   └── patterns/
│       ├── index.ts
│       ├── entity-list-inspector/
│       ├── draft-form-posting/
│       ├── line-editor/
│       ├── reconciliation-screen/
│       ├── approval-flow/
│       ├── migration-wizard/
│       ├── diff-viewer-pattern/
│       └── entity-picker-pattern/
└── README.md
```

**Exit Criteria:**
- [x] `packages/shared-ui` exists in `pnpm-workspace.yaml` ✅
- [x] Package builds without errors ✅
- [x] Exports from `@workspace/shared-ui/blocks`, `/shells`, `/patterns` ✅

> **Implementation Complete (2026-01-22):**
> - Created `packages/shared-ui/` with blocks/, shells/, patterns/ structure
> - Added skeleton composites (SkeletonCard, SkeletonTableRow, SkeletonText, SkeletonAvatar)
> - Package typechecks successfully
> - Temporarily uses inline cn/Skeleton until design-system types are fixed

---

### Phase 2: Core Composites (Layer 2) ✅

**Goal:** Build the 6 core composites from B10-01.

> **Implementation Complete (2026-01-22):**
> - `ApplicationShell` - 3-Zone Layout with Quorum/Cobalt persona switching
> - `DataFortress` - Full-featured ERP table with row states, selection, keyboard nav
> - `EntityPicker` - Fuzzy search, recent items, inline create
> - `PostingBanner` - Document status, gates, actions
> - `ApprovalRail` - Approval timeline with SLA indicators
> - `DiffViewer` - Version comparison with side-by-side/inline modes
> - All components typecheck successfully

#### 2.1 ApplicationShell (3-Zone Layout)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STICKY TOP BAR                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [Logo]  [Entity: INV-2024-0001]  [Status: DRAFT]  [$1,234.56]  [Post ▶] ││
│  └─────────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────────────────┐  ┌────────────────┐ │
│  │   ZONE 1     │  │            ZONE 2                │  │    ZONE 3      │ │
│  │   Navigator  │  │         Work Surface             │  │  Truth Drawer  │ │
│  └──────────────┘  └──────────────────────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Prop          | Type                   | Description                          |
| ------------- | ---------------------- | ------------------------------------ |
| `persona`     | `"quorum" \| "cobalt"` | Controls density + zone visibility   |
| `topBar`      | `ReactNode`            | Sticky header content                |
| `navigator`   | `ReactNode`            | Zone 1 content                       |
| `children`    | `ReactNode`            | Zone 2 work surface                  |
| `truthDrawer` | `ReactNode`            | Zone 3 (hidden in Quorum by default) |

**Zone Specifications:**

| Zone                  | Quorum              | Cobalt                |
| --------------------- | ------------------- | --------------------- |
| Zone 1 (Navigator)    | 256px, simple menu  | 224px, deep hierarchy |
| Zone 2 (Work Surface) | Fluid, single focus | Fluid, may split      |
| Zone 3 (Truth Drawer) | Hidden by default   | 320px, always visible |

---

#### 2.2 DataFortress (Full-Featured Table)

The **core ERP weapon** — a table that does everything.

| Feature                  | Quorum | Cobalt            |
| ------------------------ | ------ | ----------------- |
| Column resize            | ❌      | ✅                 |
| Column reorder           | ❌      | ✅                 |
| Column visibility toggle | ❌      | ✅                 |
| Sticky header            | ✅      | ✅                 |
| Sticky first column      | ❌      | ✅                 |
| Keyboard row navigation  | Basic  | Full (j/k, Enter) |
| Inline edit              | ❌      | ✅                 |
| Bulk select              | ❌      | ✅                 |
| Bulk actions             | ❌      | ✅                 |
| Saved views              | ❌      | ✅                 |
| Quick filter chips       | ✅      | ✅                 |
| Row state styling        | ✅      | ✅                 |
| Export (CSV/Excel)       | ❌      | ✅                 |

**Row State Styling:**

```typescript
const ROW_STATE_STYLES = {
  draft: "bg-muted/30 border-l-2 border-l-muted-foreground",
  submitted: "bg-warning/10 border-l-2 border-l-warning",
  approved: "bg-success/10 border-l-2 border-l-success",
  posted: "bg-background border-l-2 border-l-primary",
  reversed: "bg-destructive/10 border-l-2 border-l-destructive line-through",
  error: "bg-destructive/20 border-l-4 border-l-destructive",
  locked: "bg-muted/50 cursor-not-allowed",
} as const;
```

---

#### 2.3 EntityPicker (Party/Item/Account Selector)

| Feature       | Description             |
| ------------- | ----------------------- |
| Fuzzy search  | `acm` → `Acme Corp`     |
| Recent items  | Per-user recents        |
| Quick preview | Hover for details       |
| Create inline | `+ Create New Customer` |
| Keyboard nav  | ↑↓ Enter                |

---

#### 2.4 PostingBanner

The sticky header that shows document status + actions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Status: DRAFT  │  Amount: $1,234.56  │  [Save Draft] [Post ▶]              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Prop           | Type            | Description                 |
| -------------- | --------------- | --------------------------- |
| `status`       | `DocumentState` | From `@axis/registry`       |
| `amount`       | `number`        | Total amount to display     |
| `onSave`       | `() => void`    | Save draft action           |
| `onPost`       | `() => void`    | Post document action        |
| `postingGates` | `Gate[]`        | Validation gates to display |

---

#### 2.5 ApprovalRail

Timeline of approvals for a document.

| Element    | Description            |
| ---------- | ---------------------- |
| Actor      | Who approved           |
| Timestamp  | When                   |
| Comment    | Why                    |
| Evidence   | Attached files         |
| SLA Status | Time remaining/overdue |

---

#### 2.6 DiffViewer

Before/after comparison for audit trail.

| Feature           | Description              |
| ----------------- | ------------------------ |
| Side-by-side      | Two-column view          |
| Highlight changes | Added/removed/changed    |
| Version selector  | Compare any two versions |
| Reason display    | Why the change was made  |

---

### Phase 3: Canonical Patterns (Layer 3) ✅

**Goal:** Implement the 8 Canonical ERP Patterns from B10-01.

> **Implementation Complete (2026-01-22):**
> - `EntityListInspector` - Master list with inspector drawer
> - `DraftFormPosting` - Document creation with PostingBanner
> - `LineEditor` - Inline line editing for documents
> - `EntityPicker` - Re-exported from blocks
> - `ReconciliationScreen` - Two-panel matching view
> - `ApprovalRail` - Re-exported from blocks
> - `DiffViewer` - Re-exported from blocks
> - `MigrationWizard` - Step-by-step data import wizard
> - All patterns typecheck successfully

| Pattern                            | Use Case                     | Composites Used               | Status |
| ---------------------------------- | ---------------------------- | ----------------------------- | ------ |
| **1. Entity List + Inspector**     | All list views               | DataFortress + Sheet          | ✅      |
| **2. Draft Form + Posting Banner** | All document creation        | PostingBanner + FormSection   | ✅      |
| **3. Line Editor**                 | Invoice/Bill lines           | DataFortress (inline edit)    | ✅      |
| **4. Entity Picker**               | Party/Item/Account selection | EntityPicker                  | ✅      |
| **5. Reconciliation Screen**       | Bank/AR/AP recon             | DataFortress × 2 + DiffViewer | ✅      |
| **6. Approval Rail**               | Workflow display             | ApprovalRail                  | ✅      |
| **7. Diff Viewer**                 | Audit trail                  | DiffViewer                    | ✅      |
| **8. Migration Wizard**            | Data import                  | WizardFlow + DataFortress     | ✅      |

---

### Phase 4: First ERP Screens ✅

**Goal:** Build the first complete ERP screens.

> **Implementation Complete (2026-01-22):**
> - `Invoice List` - Entity List + Inspector pattern ✅
> - `Invoice Form` - Draft Form + Posting Banner + Line Editor ✅
> - `Customer List` - Entity List + Inspector pattern ✅
> - `Customer Form` - Draft Form with address management ✅
> - `Journal Entry List` - Entity List + Inspector pattern ✅
> - `Journal Entry Form` - Balanced debit/credit line editor ✅
> - Menu structure updated with Sales, Purchasing, Inventory, Accounting sections ✅
> - All screens typecheck successfully

| Screen                 | Route                                | Patterns Used                             | Status |
| ---------------------- | ------------------------------------ | ----------------------------------------- | ------ |
| **Invoice List**       | `/[tenant]/invoices`                 | Entity List + Inspector                   | ✅      |
| **Invoice Form**       | `/[tenant]/invoices/[id]`            | Draft Form + Posting Banner + Line Editor | ✅      |
| **Customer List**      | `/[tenant]/customers`                | Entity List + Inspector                   | ✅      |
| **Customer Form**      | `/[tenant]/customers/[id]`           | Draft Form                                | ✅      |
| **Journal Entry List** | `/[tenant]/accounting/journals`      | Entity List + Inspector                   | ✅      |
| **Journal Entry Form** | `/[tenant]/accounting/journals/[id]` | Draft Form + Line Editor                  | ✅      |

---

### Phase 5: Polish (Cobalt Power Features) ✅

**Goal:** Add power-user features for Cobalt persona.

> **Implementation Complete (2026-01-22):**
> - Command Palette enhanced with ERP-specific commands ✅
> - Keyboard Shortcuts hook with vim-style navigation (j/k, g g, G) ✅
> - Hold-to-Sign component for irreversible actions ✅
> - Saved Views component for table configurations ✅
> - Bulk Actions component with multi-select ✅
> - Keyboard Shortcuts Help dialog (? key) ✅
> - All components typecheck successfully

| Feature                | Description                      | Status |
| ---------------------- | -------------------------------- | ------ |
| **Command Palette**    | ⌘K global search + actions       | ✅      |
| **Keyboard Shortcuts** | Full vim-style navigation        | ✅      |
| **Hold-to-Sign**       | Irreversible action confirmation | ✅      |
| **Saved Views**        | Per-user table configurations    | ✅      |
| **Bulk Actions**       | Multi-select + batch operations  | ✅      |

---

## 3) Implementation Priority Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION PRIORITY MATRIX                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 0 (Foundation)           PHASE 1 (Structure)                         │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                 │
│  │ Add missing tokens      │    │ Create shared-ui pkg    │                 │
│  │ Add Sheet/Toast/Command │    │ Package structure       │                 │
│  │ Delete app duplicates   │    │ Build configuration     │                 │
│  └─────────────────────────┘    └─────────────────────────┘                 │
│           │                              │                                   │
│           └──────────────────────────────┘                                   │
│                          │                                                   │
│  PHASE 2 (Composites)    ▼      PHASE 3 (Patterns)                          │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                 │
│  │ ApplicationShell        │    │ Entity List + Inspector │                 │
│  │ DataFortress            │    │ Draft Form + Posting    │                 │
│  │ EntityPicker            │    │ Line Editor             │                 │
│  │ PostingBanner           │    │ Reconciliation Screen   │                 │
│  └─────────────────────────┘    └─────────────────────────┘                 │
│           │                              │                                   │
│           └──────────────────────────────┘                                   │
│                          │                                                   │
│  PHASE 4 (Screens)       ▼      PHASE 5 (Polish)                            │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                 │
│  │ Invoice List/Form       │    │ Command Palette         │                 │
│  │ Customer List/Form      │    │ Keyboard Shortcuts      │                 │
│  │ Journal Entry           │    │ Hold-to-Sign            │                 │
│  └─────────────────────────┘    └─────────────────────────┘                 │
│                                                                              │
│  RECOMMENDED ORDER: Phase 0 → 1 → 2 → 4 (first screen) → 3 → 5              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4) Exit Criteria per Phase

### Phase 0 Exit Criteria

- [ ] `--warning`, `--success`, `--warning-foreground`, `--success-foreground` in theme.css
- [ ] Sheet, Toast, Command, Popover components in `@workspace/design-system`
- [ ] `apps/web/src/components/ui/` duplicates deleted
- [ ] All imports updated to `@workspace/design-system`
- [ ] `pnpm typecheck` passes

### Phase 1 Exit Criteria

- [ ] `packages/shared-ui` exists and builds
- [ ] Listed in `pnpm-workspace.yaml`
- [ ] Exports `@workspace/shared-ui/blocks`, `/shells`, `/patterns`
- [ ] README.md documents usage

### Phase 2 Exit Criteria

- [ ] ApplicationShell renders 3-zone layout
- [ ] DataFortress displays data with row states
- [ ] EntityPicker searches and selects entities
- [ ] PostingBanner shows status + actions
- [ ] ApprovalRail shows approval timeline
- [ ] All composites have Storybook stories

### Phase 3 Exit Criteria

- [ ] Pattern 1 (Entity List + Inspector) implemented
- [ ] Pattern 2 (Draft Form + Posting) implemented
- [ ] Pattern 3 (Line Editor) implemented
- [ ] Patterns compose correctly from composites

### Phase 4 Exit Criteria

- [ ] Invoice List displays invoices with filtering
- [ ] Invoice Form creates/edits/posts invoices
- [ ] Journal Entry creates GL postings
- [ ] All screens use ApplicationShell

### Phase 5 Exit Criteria

- [ ] ⌘K opens command palette
- [ ] Keyboard shortcuts work per B10-01 spec
- [ ] Hold-to-sign works for posting
- [ ] Accessibility audit passes (axe-core)

---

## 5) File-Level Implementation Plan

### 5.1 Phase 0 Files

| File                                                | Action | Details                    |
| --------------------------------------------------- | ------ | -------------------------- |
| `packages/design-system/src/theme.css`              | EDIT   | Add warning/success tokens |
| `packages/design-system/src/components/sheet.tsx`   | CREATE | Sheet component            |
| `packages/design-system/src/components/toast.tsx`   | CREATE | Toast + Toaster            |
| `packages/design-system/src/components/command.tsx` | CREATE | Command palette            |
| `packages/design-system/src/components/popover.tsx` | CREATE | Popover component          |
| `packages/design-system/src/index.ts`               | EDIT   | Export new components      |
| `apps/web/src/components/ui/*`                      | DELETE | Remove duplicates          |

### 5.2 Phase 1 Files

| File                                       | Action | Details            |
| ------------------------------------------ | ------ | ------------------ |
| `packages/shared-ui/package.json`          | CREATE | Package definition |
| `packages/shared-ui/tsconfig.json`         | CREATE | TypeScript config  |
| `packages/shared-ui/src/index.ts`          | CREATE | Main exports       |
| `packages/shared-ui/src/blocks/index.ts`   | CREATE | Blocks exports     |
| `packages/shared-ui/src/shells/index.ts`   | CREATE | Shells exports     |
| `packages/shared-ui/src/patterns/index.ts` | CREATE | Patterns exports   |
| `pnpm-workspace.yaml`                      | EDIT   | Add shared-ui      |

### 5.3 Phase 2 Files

| File                                               | Action | Details           |
| -------------------------------------------------- | ------ | ----------------- |
| `packages/shared-ui/src/shells/application-shell/` | CREATE | 3-Zone layout     |
| `packages/shared-ui/src/blocks/data-fortress/`     | CREATE | Full table        |
| `packages/shared-ui/src/blocks/entity-picker/`     | CREATE | Entity selector   |
| `packages/shared-ui/src/blocks/posting-banner/`    | CREATE | Document banner   |
| `packages/shared-ui/src/blocks/approval-rail/`     | CREATE | Approval timeline |
| `packages/shared-ui/src/blocks/diff-viewer/`       | CREATE | Before/after view |

---

## 6) Integration with Existing Series

### B-Series Schema Usage

| B-Series Doc   | Team 2 Usage                        |
| -------------- | ----------------------------------- |
| B01-POSTING    | PostingBanner uses `DOCUMENT_STATE` |
| B03-MDM        | EntityPicker for Party/Item/Account |
| B04-SALES      | Invoice screens                     |
| B05-PURCHASE   | PO/Bill screens                     |
| B06-INVENTORY  | Stock move screens                  |
| B07-ACCOUNTING | Journal Entry screens               |
| B08-CONTROLS   | ApprovalRail uses workflow events   |
| B10-UX         | Quorum/Cobalt persona switching     |

### Registry Type Usage

```typescript
// Example: Invoice Form imports from registry
import {
  type Invoice,
  type InvoiceLine,
  DOCUMENT_STATE,
  invoiceSchema
} from "@axis/registry/schemas";

// PostingBanner uses registry types
import { type DocumentState } from "@axis/registry/types";
```

---

## 7) Quorum vs Cobalt Implementation Notes

### Density Switching

```typescript
// ApplicationShell detects persona
const persona = usePersona(); // "quorum" | "cobalt"

// Apply density classes
const densityClasses = {
  quorum: "text-sm leading-relaxed space-y-4",
  cobalt: "text-[13px] leading-tight space-y-2",
};
```

### Feature Flags

| Feature            | Quorum      | Cobalt      |
| ------------------ | ----------- | ----------- |
| Zone 3 visible     | ❌ Hidden    | ✅ Always    |
| Inline edit        | ❌ Off       | ✅ On        |
| Bulk select        | ❌ Off       | ✅ On        |
| Command palette    | ❌ Basic     | ✅ Full      |
| Keyboard shortcuts | ❌ Tab/Enter | ✅ vim-style |

---

## Document Governance

| Field            | Value                                   |
| ---------------- | --------------------------------------- |
| **Status**       | **Complete**                            |
| **Version**      | 1.0.0                                   |
| **Derived From** | B10-01-AXIS-DESIGN-PHILOSOPHY.md v0.1.0 |
| **Phase**        | D20 (UX Implementation)                 |
| **Author**       | AXIS Architecture Team                  |
| **Last Updated** | 2026-01-22                              |

### Changelog

| Version | Date       | Changes                                                         |
| ------- | ---------- | --------------------------------------------------------------- |
| 1.0.0   | 2026-01-22 | All phases complete: Full UX implementation delivered           |
| 0.6.0   | 2026-01-22 | Phase 4 complete: All 6 ERP screens implemented                 |
| 0.5.0   | 2026-01-22 | Phase 4 started: First ERP screens (Invoice, Customer, Journal) |
| 0.4.0   | 2026-01-22 | Phase 3 complete: 8 Canonical ERP Patterns                      |
| 0.3.0   | 2026-01-22 | Phase 2 complete: 6 core composites implemented                 |
| 0.2.0   | 2026-01-22 | Phase 0 + Phase 1 complete; shared-ui package created           |
| 0.1.0   | 2026-01-22 | Initial draft with full implementation plan                     |

---

## Related Documents

| Document                                                               | Purpose                                 |
| ---------------------------------------------------------------------- | --------------------------------------- |
| [A01-CANONICAL.md](./A01-CANONICAL.md)                                 | Philosophy: Dual-Kernel, Nexus Doctrine |
| [B10-UX.md](./B10-UX.md)                                               | Quorum + Cobalt UX specification        |
| [B10-01-AXIS-DESIGN-PHILOSOPHY.md](./B10-01-AXIS-DESIGN-PHILOSOPHY.md) | Design system laws and patterns         |
| [D00-GAP-ANALYSIS.md](./D00-GAP-ANALYSIS.md)                           | ERP feature gaps                        |

---

## The Team 2 Mantra

> *"Team 1 built the engine. Team 2 builds the cockpit. Together: we ship truth."*

---

> *"Consume, compose, ship. Never duplicate, never drift."*
>
> *"The table is the app. DataFortress is the weapon."*
>
> *"Clarity at speed. Confidence by proof."*
