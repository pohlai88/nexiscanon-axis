# AFANDA — The Unified Decision Board
## Application Control Document

> **Version:** 1.0.0 | **Last Updated:** 2026-01-24
> **Status:** 🚧 Development | **Phase:** B11
> **Canonical Reference:** [A01-CANONICAL.md §8](../../.cursor/ERP/A01-CANONICAL.md) | [B11-AFANDA.md](../../.cursor/ERP/B11-AFANDA.md)

---

## 🎯 Mission Statement

> *"One board to see everything. One place for decisions."*
> *"Life is chaos, but work doesn't have to be."*

**AFANDA** (Analytics, Finance, Actions, Notifications, Data, Alerts) is the unified decision cockpit that answers:

| Question | Domain |
|----------|--------|
| What is happening? | Real-time metrics |
| What needs attention? | Alerts & exceptions |
| What should I do? | Action recommendations |
| How are we performing? | KPIs & trends |

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Principles](#2-core-principles)
3. [Feature Roadmap](#3-feature-roadmap)
4. [Technical Stack](#4-technical-stack)
5. [Component Registry](#5-component-registry)
6. [Data Sources](#6-data-sources)
7. [UI/UX Guidelines](#7-uiux-guidelines)
8. [Development Workflow](#8-development-workflow)
9. [Exit Criteria](#9-exit-criteria)
10. [References](#10-references)

---

## 1. Architecture Overview

### 1.1 AFANDA in the AXIS Ecosystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AFANDA ARCHITECTURE                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        DATA SOURCES                                      ││
│  │  B04 Sales │ B05 Purchase │ B06 Inventory │ B07 Accounting │ B09 Recon  ││
│  └──────────────────────────────┬──────────────────────────────────────────┘│
│                                 │                                            │
│                                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                     ANALYTICS ENGINE                                     ││
│  │  • Metric calculation     • Trend analysis    • Anomaly detection       ││
│  │  • Aggregation pipeline   • Time series       • Forecasting             ││
│  └──────────────────────────────┬──────────────────────────────────────────┘│
│                                 │                                            │
│          ┌──────────────────────┼──────────────────────────────────────────┐│
│          ▼                      ▼                          ▼                ││
│  ┌───────────────┐     ┌───────────────┐         ┌───────────────┐         ││
│  │   DASHBOARDS  │     │     KPIs      │         │    ALERTS     │         ││
│  │  Role-based   │     │  Scorecards   │         │  Thresholds   │         ││
│  │  Customizable │     │  Targets      │         │  Notifications │        ││
│  └───────┬───────┘     └───────┬───────┘         └───────┬───────┘         ││
│          │                      │                          │                ││
│          └──────────────────────┼──────────────────────────┘                ││
│                                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      UNIFIED BOARD (UI)                                  ││
│  │  • Widget grid          • Drill-down       • Export                     ││
│  │  • Filters              • Comparison       • Scheduling                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Board Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE AFANDA HIERARCHY                                 │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      ORGANIZATION BOARD                                │  │
│  │  • Strategic announcements    • Company-wide policies                 │  │
│  │  • Cross-team visibility      • Executive dashboards                  │  │
│  │  • Consolidated approvals     • Compliance summaries                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ▲                                       │
│                                      │ escalates / reports                   │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                         TEAM BOARD                                     │  │
│  │  • Team discussions           • Shared brainstorming (FigJam-style)   │  │
│  │  • Approval workflows         • Task assignments                      │  │
│  │  • Team dashboards            • Collaborative documents               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ▲                                       │
│                                      │ contributes / requests                │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                       INDIVIDUAL BOARD                                 │  │
│  │  • Personal tasks             • Self-service requests                 │  │
│  │  • My approvals pending       • My notifications                      │  │
│  │  • My performance metrics     • My learning path                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Principles

### 2.1 The AFANDA Acronym

| Letter | Domain | Purpose |
|--------|--------|---------|
| **A** | Analytics | Real-time metrics, trend analysis, forecasting |
| **F** | Finance | Financial KPIs, P&L, cash position, margins |
| **A** | Actions | Recommendations, next steps, workflow triggers |
| **N** | Notifications | Alerts, reminders, escalations |
| **D** | Data | Unified data sources, single source of truth |
| **A** | Alerts | Threshold triggers, anomaly detection, exceptions |

### 2.2 "No Excuse" Accountability Model

> *"You can never say you missed the message. People know when you haven't read it. This is not surveillance — this is fair equilibrium."*

| Traditional Excuse | AFANDA Reality |
|--------------------|----------------|
| "I didn't see the email" | Read receipts show you opened it at 2:47 PM |
| "I wasn't informed" | Notification log shows delivery + acknowledgment |
| "I didn't know it was urgent" | Priority flag was set; SLA timer was visible |
| "No one told me to approve" | Approval request in your queue for 3 days |
| "I forgot to follow up" | System reminded you twice; escalated on day 5 |

### 2.3 Design Philosophy

| Principle | Implementation |
|-----------|----------------|
| **Role-Based Views** | Every role sees what they need. Nothing more, nothing less. |
| **Decision Cockpit** | Not just a dashboard — a place for decisions |
| **Glass Morphism** | Modern, professional UI with depth and clarity |
| **Midnight Theme** | Default dark theme for professional dashboard feel |
| **Responsive Grid** | Adaptive layouts for all screen sizes |

---

## 3. Feature Roadmap

### 3.1 Phase 1: Foundation (Current)

| Feature | Status | Priority |
|---------|--------|----------|
| Project setup & configuration | ✅ Complete | 🔴 HIGH |
| Design system integration | ✅ Complete | 🔴 HIGH |
| Basic layout structure | 🚧 In Progress | 🔴 HIGH |
| Theme configuration (midnight) | ✅ Complete | 🔴 HIGH |
| Glass morphism styles | ✅ Complete | 🟡 MEDIUM |

### 3.2 Phase 2: Dashboard Core

| Feature | Status | Priority |
|---------|--------|----------|
| Executive Dashboard | 📋 Planned | 🔴 HIGH |
| Sales Dashboard | 📋 Planned | 🔴 HIGH |
| Inventory Dashboard | 📋 Planned | 🔴 HIGH |
| Finance Dashboard | 📋 Planned | 🔴 HIGH |
| Widget Grid System | 📋 Planned | 🔴 HIGH |
| KPI Metric Cards | 📋 Planned | 🔴 HIGH |

### 3.3 Phase 3: Collaboration

| Feature | Status | Priority |
|---------|--------|----------|
| Sharing Board (FigJam-style) | 📋 Planned | 🔴 HIGH |
| Approval Queue with SLA | 📋 Planned | 🔴 HIGH |
| Consultation Thread | 📋 Planned | 🟡 MEDIUM |
| Read Receipt System | 📋 Planned | 🟡 MEDIUM |
| Escalation Ladder | 📋 Planned | 🟡 MEDIUM |

### 3.4 Phase 4: Intelligence

| Feature | Status | Priority |
|---------|--------|----------|
| KPI Engine | 📋 Planned | 🔴 HIGH |
| Alert System | 📋 Planned | 🔴 HIGH |
| Report Builder | 📋 Planned | 🟡 MEDIUM |
| Anomaly Detection | 📋 Planned | 🟢 LOW |
| AI Insights | 📋 Planned | 🟢 LOW |

---

## 4. Technical Stack

### 4.1 Core Dependencies

| Package | Purpose | Source |
|---------|---------|--------|
| `next` | Framework | catalog: |
| `react` / `react-dom` | UI Library | catalog: |
| `@workspace/design-system` | UI Components | workspace:* |
| `@axis/db` | Database Layer | workspace:* |
| `@axis/kernel` | Business Logic | workspace:* |
| `zod` | Schema Validation | catalog: |
| `tailwindcss` | Styling | catalog: |

### 4.2 Design System Integration

```typescript
// Import pattern for AFANDA components
import { Button, Card, Badge } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

// AFANDA-specific blocks (when available)
import { ApprovalQueue } from "@workspace/design-system/blocks";
import { SharingBoard } from "@workspace/design-system/blocks";
```

### 4.3 Theme Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `data-theme` | `midnight` | Electric ink - professional dashboard feel |
| `data-style` | `mia` | Balanced density |
| Font | Inter | Clean, modern sans-serif |

---

## 5. Component Registry

### 5.1 AFANDA Blocks (from Design System)

| Component | Location | Status |
|-----------|----------|--------|
| Sharing Board | `blocks/afanda/sharing-board.tsx` | ✅ Implemented |
| Approval Queue | `blocks/afanda/approval-queue.tsx` | ✅ Implemented |
| Consultation Thread | `blocks/afanda/consultation-thread.tsx` | ✅ Implemented |
| Read Receipt System | `blocks/afanda/read-receipt-system.tsx` | ✅ Implemented |
| Escalation Ladder | `blocks/afanda/escalation-ladder.tsx` | ✅ Implemented |

### 5.2 Dashboard Widgets

| Widget Type | Purpose | Priority |
|-------------|---------|----------|
| `metric_card` | Single KPI with trend | 🔴 HIGH |
| `metric_group` | Group of related KPIs | 🔴 HIGH |
| `scorecard` | Performance scorecard | 🟡 MEDIUM |
| `line_chart` | Time series | 🔴 HIGH |
| `bar_chart` | Comparison | 🔴 HIGH |
| `pie_chart` | Distribution | 🟡 MEDIUM |
| `data_table` | Tabular data | 🔴 HIGH |
| `alert_list` | Active alerts | 🔴 HIGH |
| `task_list` | Pending tasks/approvals | 🔴 HIGH |
| `activity_feed` | Recent activity | 🟡 MEDIUM |

### 5.3 AFANDA-Specific CSS Classes

```css
/* Grid System */
.afanda-grid          /* Auto-fit responsive grid */
.afanda-grid-2        /* 2-column grid */
.afanda-grid-3        /* 3-column grid */
.afanda-grid-4        /* 4-column grid */

/* Widget System */
.afanda-widget        /* Base widget container */
.afanda-widget-header /* Widget header */
.afanda-widget-title  /* Widget title text */

/* KPI Metrics */
.afanda-metric        /* Metric container */
.afanda-metric-value  /* Large metric value */
.afanda-metric-label  /* Metric label */
.afanda-metric-trend  /* Trend indicator */

/* Alerts */
.afanda-alert         /* Alert container */
.afanda-alert-critical
.afanda-alert-warning
.afanda-alert-info
.afanda-alert-success

/* Status Indicators */
.afanda-status        /* Status badge */
.afanda-status-dot    /* Status dot indicator */

/* Layout */
.afanda-header        /* Sticky header */
.afanda-sidebar       /* Fixed sidebar */
```

---

## 6. Data Sources

### 6.1 Schema Registry

> **Source:** `@axis/registry/schemas/afanda/`

| Schema | Purpose |
|--------|---------|
| `constants.ts` | Dashboard types, widget types, refresh frequencies |
| `dashboard.ts` | Dashboard definition schema |
| `widget.ts` | Widget configuration schema |
| `kpi.ts` | KPI definition and calculation |
| `alert.ts` | Alert rules and instances |
| `report.ts` | Report builder definitions |

### 6.2 Standard Dashboards

| Dashboard | Type | Target Users |
|-----------|------|--------------|
| Executive | `executive` | CFO, CEO, Board |
| Sales | `departmental` | Sales team, managers |
| Inventory | `departmental` | Warehouse, operations |
| Finance | `financial` | Accounting, controllers |
| Operational | `operational` | Day-to-day operations |

### 6.3 Standard KPIs

| Category | KPIs |
|----------|------|
| **Financial** | Revenue MTD, Gross Profit Margin, Net Profit Margin, Current Ratio, Cash Position |
| **Sales** | DSO, Orders Today, Pipeline Value, Quote Conversion Rate |
| **Inventory** | Inventory Turnover, Stockout Rate, Inventory Value |
| **Purchasing** | DPO, POs Pending Approval, Supplier On-Time Rate |

---

## 7. UI/UX Guidelines

### 7.1 Layout Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AFANDA HEADER (glass-header)                                    [Actions] │
├─────────────────┬───────────────────────────────────────────────────────────┤
│                 │                                                           │
│   SIDEBAR       │   MAIN CONTENT AREA                                       │
│   (glass-       │                                                           │
│    sidebar)     │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│                 │   │ Metric  │ │ Metric  │ │ Metric  │ │ Metric  │        │
│   Navigation    │   │  Card   │ │  Card   │ │  Card   │ │  Card   │        │
│   - Dashboard   │   └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│   - Approvals   │                                                           │
│   - Alerts      │   ┌─────────────────────────┐ ┌─────────────────────────┐│
│   - Reports     │   │                         │ │                         ││
│   - Settings    │   │    Chart Widget         │ │    Table Widget         ││
│                 │   │                         │ │                         ││
│                 │   └─────────────────────────┘ └─────────────────────────┘│
│                 │                                                           │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

### 7.2 Color Semantics

| Color | Usage |
|-------|-------|
| `primary` | Actions, highlights, interactive elements |
| `muted-foreground` | Secondary text, labels |
| `foreground` | Primary text |
| `background` | Page background |
| `card` | Widget backgrounds |
| `border` | Subtle separators |
| `destructive` | Errors, critical alerts |

### 7.3 Trend Indicators

```css
/* Positive trend (up is good) */
[data-trend="up"] { color: oklch(0.65 0.2 145); }    /* Green */

/* Negative trend (down is bad) */
[data-trend="down"] { color: oklch(0.65 0.2 25); }   /* Red */

/* Neutral trend */
[data-trend="neutral"] { @apply text-muted-foreground; }
```

### 7.4 Glass Effects

Use glass classes from design system for depth:

```tsx
// Solid glass for primary widgets
<div className="afanda-widget glass glass-solid">

// Subtle glass for secondary elements
<div className="afanda-widget glass glass-subtle">

// Header with glass effect
<header className="afanda-header glass-header">

// Sidebar with glass effect
<aside className="afanda-sidebar glass-sidebar">
```

---

## 8. Development Workflow

### 8.1 File Structure

```
apps/afanda/
├── src/
│   ├── app/
│   │   ├── globals.css          # AFANDA-specific styles
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Landing/home page
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── executive/       # Executive dashboard
│   │   │   ├── sales/           # Sales dashboard
│   │   │   ├── inventory/       # Inventory dashboard
│   │   │   └── finance/         # Finance dashboard
│   │   ├── approvals/
│   │   │   └── page.tsx         # Approval queue
│   │   ├── alerts/
│   │   │   └── page.tsx         # Alert management
│   │   ├── reports/
│   │   │   └── page.tsx         # Report builder
│   │   └── settings/
│   │       └── page.tsx         # AFANDA settings
│   └── components/
│       ├── providers.tsx        # Context providers
│       ├── layout/
│       │   ├── header.tsx       # AFANDA header
│       │   ├── sidebar.tsx      # Navigation sidebar
│       │   └── shell.tsx        # Application shell
│       ├── widgets/
│       │   ├── metric-card.tsx
│       │   ├── chart-widget.tsx
│       │   └── table-widget.tsx
│       └── features/
│           ├── kpi/
│           ├── alerts/
│           └── approvals/
├── package.json
├── next.config.ts
├── tsconfig.json
├── AFANDA.md                    # This document
└── vercel.json
```

### 8.2 Development Commands

```bash
# Start development server (port 3001)
pnpm --filter @axis/afanda dev

# Build for production
pnpm --filter @axis/afanda build

# Type checking
pnpm --filter @axis/afanda typecheck

# Linting
pnpm --filter @axis/afanda lint
```

### 8.3 Import Conventions

```typescript
// ✅ CORRECT: Workspace imports
import { Button, Card } from "@workspace/design-system";
import { cn } from "@workspace/design-system/lib/utils";

// ✅ CORRECT: Internal imports
import { MetricCard } from "@/components/widgets/metric-card";
import { DashboardShell } from "@/components/layout/shell";

// ❌ WRONG: Local component creation for existing design system components
import { Button } from "./components/ui/button";
```

---

## 9. Exit Criteria

### 9.1 Phase B11 Gate (from A02-AXIS-MAP.md)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Individual → Team → Organization board hierarchy works | 📋 Pending |
| 2 | Sharing board with collaborative editing | 📋 Pending |
| 3 | Approval queue with SLA timers | 📋 Pending |
| 4 | Read receipts tracking | 📋 Pending |
| 5 | Auto-escalation on SLA breach | 📋 Pending |
| 6 | "You can't say you missed it" — full visibility | 📋 Pending |

### 9.2 Dashboard Exit Criteria (from B11-AFANDA.md)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Dashboard definitions with grid layout | 📋 Pending |
| 2 | Widget system with multiple types | 📋 Pending |
| 3 | KPI engine with formula calculation | 📋 Pending |
| 4 | Standard KPIs defined | 📋 Pending |
| 5 | Alert rules with thresholds | 📋 Pending |
| 6 | Alert notifications and escalation | 📋 Pending |
| 7 | Report builder with parameters | 📋 Pending |
| 8 | Report scheduling and export | 📋 Pending |
| 9 | Role-based dashboard access | 📋 Pending |
| 10 | Drill-down navigation | 📋 Pending |
| 11 | AFANDA events published to outbox | 📋 Pending |
| 12 | Configuration per tenant | 📋 Pending |

---

## 10. References

### 10.1 Canonical Documents

| Document | Purpose |
|----------|---------|
| [A01-CANONICAL.md §8](../../.cursor/ERP/A01-CANONICAL.md) | AFANDA Philosophy |
| [A02-AXIS-MAP.md](../../.cursor/ERP/A02-AXIS-MAP.md) | Phase B11 Definition |
| [B11-AFANDA.md](../../.cursor/ERP/B11-AFANDA.md) | AFANDA Platform Specification |
| [E02-11-AFANDA-BLOCKS.md](../../.cursor/ERP/E02-11-AFANDA-BLOCKS.md) | AFANDA UI Blocks |

### 10.2 Related Phases

| Phase | Dependency |
|-------|------------|
| B04 Sales | Sales metrics, pipeline data |
| B05 Purchase | Purchasing KPIs, supplier data |
| B06 Inventory | Stock metrics, valuation |
| B07 Accounting | Financial KPIs, P&L data |
| B08 Controls | Approval workflows, audit data |
| B09 Reconciliation | Exception alerts, discrepancies |
| B10 UX | Quorum + Cobalt patterns |
| B12 Intelligence | AI insights, anomaly detection |

### 10.3 Design System

| Resource | Location |
|----------|----------|
| Design System Package | `packages/design-system/` |
| AFANDA Blocks | `packages/design-system/src/blocks/afanda/` |
| Glass Theme | `packages/design-system/src/styles/glass.css` |
| Theme Tokens | `packages/design-system/src/tokens/` |

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | 🚧 Development |
| **Version** | 1.0.0 |
| **Phase** | B11 (AFANDA) |
| **Author** | AXIS Architecture Team |
| **Created** | 2026-01-24 |
| **Last Updated** | 2026-01-24 |

---

> *"AFANDA: One board to see everything. One place for decisions. Analytics, Finance, Actions, Notifications, Data, Alerts — unified."*
>
> *"Life is chaos, but work doesn't have to be. Let business come back to business."*
