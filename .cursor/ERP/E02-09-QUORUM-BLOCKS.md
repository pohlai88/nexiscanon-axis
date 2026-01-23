# E02-09: Quorum Kernel UI Blocks
## Analysis & Strategy Components for White-Collar Users

> **Version:** 1.0.0 | **Last Updated:** 2026-01-23
> **Status:** ✅ Fully Implemented | **Priority:** 🔴 HIGH
> **Canonical Reference:** [A01-CANONICAL.md §4 — Dual-Kernel (Quorum + Cobalt)](./A01-CANONICAL.md)

### Implementation Summary
| Component | Status | Location |
|-----------|--------|----------|
| CommandK (⌘K) | ✅ | `blocks/quorum/command-k.tsx` |
| 6W1H Manifest | ✅ | `blocks/quorum/six-w1h-manifest.tsx` |
| Drilldown Dashboard | ✅ | `blocks/quorum/drilldown-dashboard.tsx` |
| Exception Hunter | ✅ | `blocks/quorum/exception-hunter.tsx` |
| Trend Analysis Widget | ✅ | `blocks/quorum/trend-analysis-widget.tsx` |

---

## Overview

> *"I need to understand WHY" — Analysis, Strategy, Oversight*

The **Quorum Kernel** serves white-collar users (CFO, Controller, Auditor, Business Analyst, Board Members) who need to:
- **Investigate** with 6W1H thinking
- **Drill down** from aggregate to source documents
- **Hunt exceptions** and anomalies
- **Analyze trends** over time
- **Model scenarios** before decisions

---

## Canonical Requirements (A01 §4)

From A01-CANONICAL.md:

```
│           QUORUM ◇              │
│        (White Collar)           │
├─────────────────────────────────┤
│  "I need to understand WHY"     │
│  Analysis, Strategy, Oversight  │
├─────────────────────────────────┤
│  6W1H Thinking:                 │
│  • WHO is responsible?          │
│  • WHAT happened?               │
│  • WHEN did it occur?           │
│  • WHERE in the process?        │
│  • WHY was this decision made?  │
│  • WHICH options were available?│
│  • HOW was it executed?         │
├─────────────────────────────────┤
│  Interface: CommandK ⌘          │
│  • Materialized Manifests       │
│  • Drill-down dashboards        │
│  • What-if scenarios            │
│  • Exception hunting            │
│  • Trend analysis               │
```

**Design Mantra:** "Surface the truth before they ask"

---

## Planned Components

### 1. CommandK (⌘K Command Palette)

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/quorum/command-k.tsx`

**Purpose:** Global command palette for instant access to any insight, report, or action.

**Features:**
- Fuzzy search across all entities (customers, suppliers, invoices, etc.)
- Recent actions history
- Suggested next actions based on context
- Keyboard shortcuts for power users
- Quick navigation to any module

**A01 Link:** Interface layer for Quorum users (§4)

**Tech Stack:**
- `cmdk` (shadcn command component)
- React Query for search
- Keyboard event handling
- Search indexing (MeiliSearch/Typesense)

**Wireframe:**
```
┌─────────────────────────────────────────────────┐
│  ⌘K                                             │
│  ┌───────────────────────────────────────────┐  │
│  │ Search anything...                       │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Recent                                         │
│  ▸ Invoice INV-2024-001      Ctrl+1           │
│  ▸ Customer Acme Corp        Ctrl+2           │
│                                                 │
│  Suggestions                                    │
│  ▸ Review aging AR > 90 days                  │
│  ▸ Approve pending POs                        │
│                                                 │
│  Commands                                       │
│  ▸ Create Journal Entry      /journal         │
│  ▸ Run Trial Balance         /trial           │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 2. 6W1H Manifest Display

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/quorum/six-w1h-manifest.tsx`

**Purpose:** Display full contextual information for any action or decision.

**Features:**
- WHO: Actor + delegation chain + approval chain
- WHAT: Action type + affected entities
- WHEN: Timestamp + effective date + fiscal period
- WHERE: Tenant + location + system context
- WHY: Reason code + justification + business context
- WHICH: Options presented + selected option + policy overrides
- HOW: Execution path + method + evidence

**A01 Link:** Implements 6W1H Context (§5) for Quorum analysis

**Component API:**
```tsx
<SixW1HManifest
  eventId="evt_123456"
  variant="card" | "panel" | "popover"
  showDangerZone={true}
  onDrilldown={(entity) => navigate(entity)}
/>
```

**Wireframe:**
```
┌─────────────────────────────────────────────────┐
│  6W1H Context — Invoice INV-2024-001            │
├─────────────────────────────────────────────────┤
│  WHO                                            │
│  • Posted by: Jane Doe (Accountant)            │
│  • Approved by: John Manager → CFO             │
│                                                 │
│  WHAT                                           │
│  • Action: Invoice Posted                      │
│  • Amount: $10,000 USD                          │
│  • Customer: Acme Corp                          │
│                                                 │
│  WHEN                                           │
│  • Posted: 2024-01-15 14:23:00 UTC              │
│  • Effective: 2024-01-15                        │
│  • Period: January 2024 (Open)                  │
│                                                 │
│  WHERE                                          │
│  • Tenant: Nexus Corp                           │
│  • Branch: HQ Warehouse                         │
│  • System: Web UI                               │
│                                                 │
│  WHY                                            │
│  • Reason: Delivery Complete                    │
│  • Justification: "Goods delivered per DO-5678" │
│                                                 │
│  WHICH                                          │
│  • Options: [Manual Entry, Import CSV, Auto]   │
│  • Selected: Manual Entry                       │
│                                                 │
│  HOW                                            │
│  • Method: Web UI Form                          │
│  • Evidence: [Delivery Order, Email]           │
│  • Execution Path: /invoices/create            │
│                                                 │
│  ⚠️ Danger Zone                                 │
│  • Exceeded credit limit by $2,000              │
│  • Override approved by: CFO                    │
│  • Risk score at time: 35/100                   │
└─────────────────────────────────────────────────┘
```

---

### 3. Drilldown Dashboard

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/quorum/drilldown-dashboard.tsx`

**Purpose:** Navigate from high-level metrics to granular source documents.

**Features:**
- Click any metric to see breakdown
- Navigate hierarchy (Total → By Month → By Customer → By Invoice)
- Breadcrumb trail of drilldown path
- Back/forward navigation
- Export drilldown data

**A01 Link:** "Drill-down to source document" (§4)

**Component API:**
```tsx
<DrilldownDashboard
  metric="revenue"
  initialLevel="total"
  onDrilldown={(level, filters) => fetchData(level, filters)}
/>
```

**Wireframe:**
```
┌─────────────────────────────────────────────────┐
│  Revenue Dashboard                              │
│  Home > By Quarter > Q1 2024 > By Customer     │
├─────────────────────────────────────────────────┤
│  Total Revenue (Q1 2024): $1,250,000            │
│                                                 │
│  By Customer:                                   │
│  ┌─────────────────────────────────────┐        │
│  │ Acme Corp           $500,000  [▼]  │        │
│  │   ▸ January: $150,000              │        │
│  │   ▸ February: $175,000             │        │
│  │   ▸ March: $175,000                │        │
│  ├─────────────────────────────────────┤        │
│  │ Beta Inc            $350,000  [▼]  │        │
│  │ Gamma LLC           $250,000  [▼]  │        │
│  │ Delta Co            $150,000  [▼]  │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  [← Back]  [Export]  [Filter]                  │
└─────────────────────────────────────────────────┘
```

---

### 4. Exception Hunter

> **Priority:** 🟡 MEDIUM | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/quorum/exception-hunter.tsx`

**Features Implemented:**
- Automatic anomaly detection display
- Severity classification (critical/high/medium/low/info)
- Category grouping (financial/operational/compliance/security/data_quality)
- AI recommendations with auto-fix
- Drill-down investigation
- Trend indicators

**Purpose:** Surface anomalies, policy violations, and unusual patterns.

**Features:**
- Filter to show only exceptions
- Risk score highlighting
- Policy violation badges
- Sorting by severity
- Bulk review/approve

**A01 Link:** "Exception hunting" (§4), "DETECT" layer (§6)

**Component API:**
```tsx
<ExceptionHunter
  domain="invoices"
  filters={{ riskScore: { min: 50 } }}
  onReview={(exception) => openReviewModal(exception)}
/>
```

**Wireframe:**
```
┌─────────────────────────────────────────────────┐
│  Exception Hunter — Invoices                    │
├─────────────────────────────────────────────────┤
│  Filters: [Risk Score > 50] [Policy Violations] │
│                                                 │
│  ⚠️ HIGH RISK (3)                                │
│  ┌─────────────────────────────────────┐        │
│  │ INV-2024-123                        │        │
│  │ Risk: 85/100  Policy: Credit Limit  │        │
│  │ Acme Corp - $15,000 (Limit: $10,000)│        │
│  │ [Review] [Approve] [Reject]         │        │
│  ├─────────────────────────────────────┤        │
│  │ INV-2024-145                        │        │
│  │ Risk: 72/100  Policy: Unusual Amount│        │
│  │ Beta Inc - $50,000 (Avg: $10,000)  │        │
│  │ [Review] [Approve] [Reject]         │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  ⚠️ MEDIUM RISK (8)                              │
│  ⚠️ LOW RISK (15)                                │
└─────────────────────────────────────────────────┘
```

---

### 5. Trend Analysis Widget

> **Priority:** 🟡 MEDIUM | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/quorum/trend-analysis-widget.tsx`

**Features Implemented:**
- Multi-period comparison
- Trend direction indicators with sparklines
- Anomaly detection badges
- AI insight integration
- Period selector
- Drill-down to details

**Purpose:** Visualize trends over time with comparative analysis.

**Features:**
- Time series charts
- Period comparisons (MoM, YoY)
- Trend lines and forecasts
- Anomaly detection on chart
- Export to Excel/CSV

**A01 Link:** "Trend analysis" (§4)

**Component API:**
```tsx
<TrendAnalysis
  metric="revenue"
  period="monthly"
  comparison="yoy"
  showForecast={true}
/>
```

**Wireframe:**
```
┌─────────────────────────────────────────────────┐
│  Revenue Trend — Last 12 Months                 │
├─────────────────────────────────────────────────┤
│  [Monthly ▼] [YoY Comparison ▼] [Export]       │
│                                                 │
│     $500K ┤                         ●          │
│     $400K ┤               ●     ●   │          │
│     $300K ┤     ●     ●   │ ●   │   │          │
│     $200K ┤ ●   │ ●   │   │ │   │   │          │
│     $100K ┤─●───●─●───●───●─●───●───●─────     │
│           └─J─F─M─A─M─J─J─A─S─O─N─D          │
│                                                 │
│  Key Insights:                                  │
│  • 15% growth vs last year                      │
│  • Peak in December (+$50K)                     │
│  • ⚠️ Unusual dip in March (-20%)                │
│                                                 │
│  Forecast (Next 3 Months):                      │
│  • Jan: $450K  Feb: $475K  Mar: $500K          │
└─────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: CommandK (Weeks 1-2)

1. Install `cmdk` component from shadcn
2. Implement search indexing (MeiliSearch integration)
3. Add recent actions tracking
4. Implement keyboard shortcuts
5. Add suggested actions logic

### Phase 2: 6W1H Manifest (Weeks 3-4)

1. Define 6W1H data schema (TypeScript interfaces)
2. Create manifest display component
3. Integrate with event log queries
4. Add danger zone visualization
5. Implement evidence attachment viewer

### Phase 3: Drilldown Dashboard (Weeks 5-6)

1. Create drilldown navigation component
2. Implement breadcrumb trail
3. Add data fetching logic for each level
4. Create chart/table toggle views
5. Add export functionality

### Phase 4: Exception Hunter (Weeks 7-8)

1. Define exception detection rules
2. Create exception card component
3. Implement filtering/sorting
4. Add review workflow
5. Integrate with risk scoring engine

### Phase 5: Trend Analysis (Weeks 9-10)

1. Integrate charting library (Recharts/shadcn charts)
2. Implement time series queries
3. Add period comparison logic
4. Create forecast algorithm
5. Add anomaly detection highlights

---

## Dependencies

| Dependency | Purpose | Installation |
|------------|---------|-------------|
| `cmdk` | Command palette | `npx shadcn@latest add command` |
| `@tanstack/react-query` | Data fetching | Already installed |
| `recharts` | Charts | Already installed (shadcn charts) |
| MeiliSearch/Typesense | Search indexing | Server deployment |
| Event log API | 6W1H data | Backend implementation |

---

## Design System Integration

All Quorum blocks will:
- ✅ Import from `@workspace/design-system`
- ✅ Use `cn()` utility for className
- ✅ Use semantic tokens (no hardcoded colors)
- ✅ Follow accessibility standards (ARIA labels)
- ✅ Support dark mode
- ✅ Use Tailwind v4 utilities

---

## References

- [A01-CANONICAL.md §4 — Dual-Kernel](./A01-CANONICAL.md)
- [A01-CANONICAL.md §5 — Nexus Doctrine (6W1H)](./A01-CANONICAL.md)
- [E01-DESIGN-SYSTEM.md](./E01-DESIGN-SYSTEM.md)
- [E03-IMPLEMENTATION.md](./E03-IMPLEMENTATION.md)

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | Planned |
| **Version** | 0.1.0 (Draft) |
| **Author** | AXIS Architecture Team |
| **Last Updated** | 2026-01-23 |
| **Target Completion** | Q1 2026 |
