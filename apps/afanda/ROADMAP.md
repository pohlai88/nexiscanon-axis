# AFANDA Development Roadmap
## Sprint-by-Sprint Implementation Plan

> **Version:** 1.0.0 | **Last Updated:** 2026-01-24
> **Status:** 🚧 Active Development

---

## Overview

This document provides the actionable development roadmap for AFANDA. Each sprint has clear deliverables, acceptance criteria, and technical specifications.

---

## Sprint 1: Foundation & Shell (Current)

### 1.1 Objectives

- [x] Project scaffolding with Next.js
- [x] Design system integration
- [x] Theme configuration (midnight)
- [x] Base CSS utilities (afanda-* classes)
- [ ] Application shell (header, sidebar, main)
- [ ] Navigation structure
- [ ] Authentication integration

### 1.2 Deliverables

#### Application Shell

```tsx
// src/components/layout/shell.tsx
export function AfandaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AfandaSidebar />
      <div className="flex flex-1 flex-col">
        <AfandaHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

#### Navigation Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing/overview |
| `/dashboard` | Dashboard | Main dashboard view |
| `/dashboard/executive` | Executive | Executive dashboard |
| `/dashboard/sales` | Sales | Sales metrics |
| `/dashboard/inventory` | Inventory | Stock metrics |
| `/dashboard/finance` | Finance | Financial KPIs |
| `/approvals` | Approvals | Approval queue |
| `/alerts` | Alerts | Alert management |
| `/reports` | Reports | Report builder |
| `/settings` | Settings | Configuration |

### 1.3 Acceptance Criteria

- [ ] Shell renders with header, sidebar, main area
- [ ] Navigation links work
- [ ] Theme persists across page loads
- [ ] Responsive on mobile/tablet/desktop
- [ ] Glass effects visible on sidebar/header

---

## Sprint 2: Widget System

### 2.1 Objectives

- [ ] Widget grid layout system
- [ ] Metric card component
- [ ] Chart widgets (line, bar, pie)
- [ ] Table widget
- [ ] Widget configuration schema

### 2.2 Deliverables

#### Metric Card

```tsx
// src/components/widgets/metric-card.tsx
interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  change?: string;
  icon?: React.ReactNode;
  sparkline?: number[];
}

export function MetricCard({ label, value, trend, change, icon, sparkline }: MetricCardProps) {
  return (
    <div className="afanda-widget border border-border bg-card/60 backdrop-blur-sm">
      <div className="afanda-metric">
        <span className="afanda-metric-label">{label}</span>
        <span className="afanda-metric-value">{value}</span>
        {change && (
          <span className="afanda-metric-trend" data-trend={trend}>
            {change}
          </span>
        )}
      </div>
      {sparkline && <div className="afanda-metric-sparkline">{/* Sparkline chart */}</div>}
    </div>
  );
}
```

#### Widget Grid

```tsx
// src/components/widgets/widget-grid.tsx
interface WidgetGridProps {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function WidgetGrid({ columns = 4, children }: WidgetGridProps) {
  const gridClass = {
    2: "afanda-grid-2",
    3: "afanda-grid-3",
    4: "afanda-grid-4",
  }[columns];

  return <div className={gridClass}>{children}</div>;
}
```

### 2.3 Acceptance Criteria

- [ ] Metric cards display value, label, trend
- [ ] Grid adapts to screen size
- [ ] Charts render with sample data
- [ ] Tables support sorting/pagination
- [ ] Widgets have loading states

---

## Sprint 3: Dashboard Pages

### 3.1 Objectives

- [ ] Executive dashboard
- [ ] Sales dashboard
- [ ] Inventory dashboard
- [ ] Finance dashboard
- [ ] Dashboard switching

### 3.2 Deliverables

#### Executive Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Revenue │ │  Profit │ │ Cash    │ │  AR/AP  │                            │
│  │  MTD    │ │  Margin │ │ Position│ │  Ratio  │                            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                            │
│  ┌───────────────────────────┐ ┌───────────────────────────┐                │
│  │    Revenue Trend (12mo)   │ │   Expense Breakdown       │                │
│  │    [Line Chart]           │ │   [Pie Chart]             │                │
│  └───────────────────────────┘ └───────────────────────────┘                │
│  ┌───────────────────────────────────────────────────────────┐              │
│  │              Key Alerts & Exceptions                       │              │
│  └───────────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Sales Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Orders  │ │Invoices │ │ Pipeline│ │ DSO     │                            │
│  │  Today  │ │ Pending │ │  Value  │ │ (Days)  │                            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                            │
│  ┌───────────────────────────┐ ┌───────────────────────────┐                │
│  │   Sales by Product        │ │   Top 10 Customers        │                │
│  │   [Bar Chart]             │ │   [Table]                 │                │
│  └───────────────────────────┘ └───────────────────────────┘                │
│  ┌───────────────────────────────────────────────────────────┐              │
│  │              AR Aging Summary                              │              │
│  └───────────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Acceptance Criteria

- [ ] All 4 dashboards render with mock data
- [ ] Dashboard switching works
- [ ] Widgets are interactive (hover, click)
- [ ] Time period filter works
- [ ] Export to PDF/Excel available

---

## Sprint 4: KPI Engine

### 4.1 Objectives

- [ ] KPI definition schema
- [ ] KPI calculation service
- [ ] Standard KPIs implementation
- [ ] KPI caching
- [ ] Trend calculation

### 4.2 Deliverables

#### KPI Service

```typescript
// src/services/kpi.ts
interface KPIResult {
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  status: "critical" | "warning" | "good" | "excellent" | "neutral";
  calculatedAt: Date;
}

export async function calculateKPI(
  kpiCode: string,
  options?: {
    asOfDate?: Date;
    periodStart?: Date;
    periodEnd?: Date;
    forceRefresh?: boolean;
  }
): Promise<KPIResult>;
```

#### Standard KPIs

| Code | Name | Formula | Category |
|------|------|---------|----------|
| `REVENUE_MTD` | Revenue (Month to Date) | SUM(invoice.total) | Financial |
| `GROSS_PROFIT_MARGIN` | Gross Profit Margin | (Revenue - COGS) / Revenue | Financial |
| `DSO` | Days Sales Outstanding | (AR / Revenue_30d) * 30 | Sales |
| `ORDERS_TODAY` | Orders Today | COUNT(order) | Sales |
| `INVENTORY_TURNOVER` | Inventory Turnover | COGS / AVG(Inventory) | Inventory |
| `STOCKOUT_RATE` | Stockout Rate | Stockout Items / Total Items | Inventory |

### 4.3 Acceptance Criteria

- [ ] KPIs calculate correctly
- [ ] Caching reduces DB load
- [ ] Trends show period-over-period
- [ ] Status thresholds work
- [ ] Real-time refresh option

---

## Sprint 5: Alert System

### 5.1 Objectives

- [ ] Alert rule definition
- [ ] Alert triggering engine
- [ ] Alert notification delivery
- [ ] Alert management UI
- [ ] Escalation logic

### 5.2 Deliverables

#### Alert Component

```tsx
// src/components/features/alerts/alert-card.tsx
interface AlertCardProps {
  alert: {
    id: string;
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
    status: "active" | "acknowledged" | "resolved";
    firedAt: Date;
  };
  onAcknowledge?: () => void;
  onResolve?: () => void;
}

export function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  return (
    <div className={cn("afanda-alert", `afanda-alert-${alert.severity}`)}>
      <div className="afanda-alert-title">{alert.title}</div>
      <div className="afanda-alert-description">{alert.message}</div>
      <div className="afanda-alert-timestamp">{formatRelative(alert.firedAt)}</div>
      {/* Actions */}
    </div>
  );
}
```

#### Standard Alert Rules

| Code | Name | Condition | Severity |
|------|------|-----------|----------|
| `CASH_LOW` | Low Cash Position | CASH_POSITION < threshold | Critical |
| `DSO_HIGH` | High DSO | DSO > 45 days | Warning |
| `STOCKOUT` | Stock Out | inventory.stockout event | Warning |
| `LOW_STOCK` | Low Stock | inventory.low_stock event | Info |
| `APPROVAL_OVERDUE` | Overdue Approval | approval.age > 3 days | Warning |

### 5.3 Acceptance Criteria

- [ ] Alerts trigger on threshold breach
- [ ] Notifications delivered (in-app)
- [ ] Acknowledge/resolve workflow works
- [ ] Escalation triggers after SLA
- [ ] Alert history preserved

---

## Sprint 6: Approval Queue

### 6.1 Objectives

- [ ] Approval queue UI
- [ ] SLA timer display
- [ ] Bulk approve/reject
- [ ] Approval chain visualization
- [ ] Integration with workflow engine

### 6.2 Deliverables

#### Approval Queue Component

```tsx
// Use design system block
import { ApprovalQueue } from "@workspace/design-system/blocks";

// src/app/approvals/page.tsx
export default function ApprovalsPage() {
  const approvals = useApprovals();
  
  return (
    <AfandaShell>
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
      <ApprovalQueue
        items={approvals}
        onApprove={handleApprove}
        onReject={handleReject}
        onBulkApprove={handleBulkApprove}
      />
    </AfandaShell>
  );
}
```

### 6.3 Acceptance Criteria

- [ ] Queue shows all pending approvals
- [ ] SLA countdown visible
- [ ] Approve/reject with comments
- [ ] Bulk actions work
- [ ] Approval chain shows history

---

## Sprint 7: Collaboration Features

### 7.1 Objectives

- [ ] Sharing board (FigJam-style)
- [ ] Consultation thread
- [ ] Read receipt system
- [ ] Escalation ladder
- [ ] Board hierarchy (Individual → Team → Org)

### 7.2 Deliverables

Use existing design system blocks:

```tsx
import { SharingBoard } from "@workspace/design-system/blocks";
import { ConsultationThread } from "@workspace/design-system/blocks";
import { ReadReceiptSystem } from "@workspace/design-system/blocks";
import { EscalationLadder } from "@workspace/design-system/blocks";
```

### 7.3 Acceptance Criteria

- [ ] Share documents with team
- [ ] Threaded discussions work
- [ ] Read receipts tracked
- [ ] Escalation triggers on SLA
- [ ] Board hierarchy navigation

---

## Sprint 8: Report Builder

### 8.1 Objectives

- [ ] Report definition UI
- [ ] Parameter configuration
- [ ] Report execution
- [ ] Export (PDF, Excel, CSV)
- [ ] Report scheduling

### 8.2 Deliverables

#### Report Builder UI

```tsx
// src/app/reports/builder/page.tsx
export default function ReportBuilderPage() {
  return (
    <AfandaShell>
      <h1 className="text-2xl font-bold mb-6">Report Builder</h1>
      <div className="afanda-report-params">
        {/* Parameter inputs */}
      </div>
      <div className="afanda-report-output">
        {/* Report preview */}
      </div>
    </AfandaShell>
  );
}
```

### 8.3 Acceptance Criteria

- [ ] Create report definitions
- [ ] Configure parameters
- [ ] Execute and preview
- [ ] Export to PDF/Excel/CSV
- [ ] Schedule recurring reports

---

## Sprint 9: Polish & Integration

### 9.1 Objectives

- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Mobile responsiveness
- [ ] Accessibility audit

### 9.2 Deliverables

- Skeleton loaders for all widgets
- Error boundaries
- Empty state illustrations
- Mobile navigation drawer
- ARIA labels and keyboard navigation

### 9.3 Acceptance Criteria

- [ ] Lighthouse score > 90
- [ ] No accessibility violations
- [ ] Works on mobile devices
- [ ] Graceful error handling
- [ ] Fast initial load

---

## Technical Debt & Improvements

### Backlog Items

| Item | Priority | Effort |
|------|----------|--------|
| Real-time WebSocket updates | Medium | Large |
| Offline support | Low | Large |
| Custom dashboard builder | Medium | Large |
| AI-powered insights | Low | Large |
| Multi-language support | Low | Medium |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first meaningful paint | < 2s |
| Dashboard load time | < 3s |
| KPI calculation time | < 500ms |
| User satisfaction score | > 4.5/5 |
| Feature adoption rate | > 80% |

---

## Document Governance

| Field | Value |
|-------|-------|
| **Status** | 🚧 Active |
| **Version** | 1.0.0 |
| **Author** | AXIS Architecture Team |
| **Created** | 2026-01-24 |
| **Last Updated** | 2026-01-24 |
