# B11 — AFANDA Platform
## The Unified Board: Dashboard, Analytics & Decision Support

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |                          |                           |                             |                           |                                 |                               |                       |           |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: | :-------------------------: | :-----------------------: | :-----------------------------: | :---------------------------: | :-------------------: | :-------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) | [B07](./B07-ACCOUNTING.md)  | [B08](./B08-CONTROLS.md)  | [B08-01](./B08-01-WORKFLOW.md)  | [B09](./B09-RECONCILIATION.md)| [B10](./B10-UX.md)    | **[B11]** |
|            Posting            |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         |         Accounting          |         Controls          |            Workflow             |         Reconciliation        |          UX           |  AFANDA   |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §8 (AFANDA - Unified Board), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B11
>
> **Tag:** `AFANDA` | `DASHBOARD` | `ANALYTICS` | `KPI` | `PHASE-B11`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B11 AFANDA schemas follow the **Single Source of Truth** pattern:

| Component              | Source                                              |
| ---------------------- | --------------------------------------------------- |
| Dashboard types        | `@axis/registry/schemas/afanda/constants.ts`        |
| Dashboard Definition   | `@axis/registry/schemas/afanda/dashboard.ts`        |
| Widget Schema          | `@axis/registry/schemas/afanda/widget.ts`           |
| KPI Schema             | `@axis/registry/schemas/afanda/kpi.ts`              |
| Alert Schema           | `@axis/registry/schemas/afanda/alert.ts`            |
| Report Schema          | `@axis/registry/schemas/afanda/report.ts`           |
| AFANDA events          | `@axis/registry/schemas/events/afanda.ts`           |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"One board to see everything. One place for decisions."*

From A01 §8 (AFANDA):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE AFANDA PRINCIPLE                                  │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     AFANDA = Analytics, Finance, Actions, Notifications,         ║    │
│    ║              Data, Alerts                                         ║    │
│    ║                                                                   ║    │
│    ║     The unified board that answers:                               ║    │
│    ║     • What is happening? (Real-time metrics)                      ║    │
│    ║     • What needs attention? (Alerts & exceptions)                 ║    │
│    ║     • What should I do? (Action recommendations)                  ║    │
│    ║     • How are we performing? (KPIs & trends)                      ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    AFANDA is not just a dashboard. It's the decision cockpit.               │
│    Every role sees what they need. Nothing more, nothing less.               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without unified dashboards, users check multiple screens
- Without KPIs, performance is unmeasured
- Without alerts, problems go unnoticed
- Without actions, insights don't lead to outcomes

---

## 2) AFANDA Architecture

### 2.1 Platform Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AFANDA ARCHITECTURE                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        DATA SOURCES                                      ││
│  │  B04 Sales │ B05 Purchase │ B06 Inventory │ B07 Accounting │ B09 Recon  ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                     ANALYTICS ENGINE                                     ││
│  │  • Metric calculation     • Trend analysis    • Anomaly detection       ││
│  │  • Aggregation pipeline   • Time series       • Forecasting             ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────────────────┐│
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │   DASHBOARDS  │         │     KPIs      │         │    ALERTS     │     ││
│  │  Role-based   │         │  Scorecards   │         │  Thresholds   │     ││
│  │  Customizable │         │  Targets      │         │  Notifications │    ││
│  └───────┬───────┘         └───────┬───────┘         └───────┬───────┘     ││
│          │                          │                          │            ││
│          └──────────────────────────┼──────────────────────────┘            ││
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      UNIFIED BOARD (UI)                                  ││
│  │  • Widget grid          • Drill-down       • Export                     ││
│  │  • Filters              • Comparison       • Scheduling                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 AFANDA Constants

```typescript
// packages/axis-registry/src/schemas/afanda/constants.ts

export const DASHBOARD_TYPE = [
  "executive",      // High-level KPIs for leadership
  "operational",    // Day-to-day operational metrics
  "financial",      // Financial statements and analysis
  "departmental",   // Department-specific (sales, purchasing, etc.)
  "custom",         // User-created dashboards
] as const;

export const WIDGET_TYPE = [
  // Metrics
  "metric_card",      // Single KPI with trend
  "metric_group",     // Group of related KPIs
  "scorecard",        // Performance scorecard
  
  // Charts
  "line_chart",       // Time series
  "bar_chart",        // Comparison
  "pie_chart",        // Distribution
  "area_chart",       // Cumulative
  "combo_chart",      // Mixed types
  "gauge",            // Progress toward target
  "funnel",           // Conversion funnel
  "heatmap",          // Intensity matrix
  
  // Tables
  "data_table",       // Tabular data
  "pivot_table",      // Cross-tabulation
  "comparison_table", // Period comparison
  
  // Lists
  "task_list",        // Pending tasks/approvals
  "alert_list",       // Active alerts
  "activity_feed",    // Recent activity
  "top_n_list",       // Top/bottom performers
  
  // Special
  "map",              // Geographic visualization
  "calendar",         // Calendar heatmap
  "timeline",         // Event timeline
  "ai_insight",       // AI-generated insights
] as const;

export const REFRESH_FREQUENCY = [
  "real_time",    // WebSocket/SSE
  "1_minute",
  "5_minutes",
  "15_minutes",
  "hourly",
  "daily",
  "manual",       // On-demand only
] as const;

export const AGGREGATION_TYPE = [
  "sum",
  "count",
  "average",
  "min",
  "max",
  "median",
  "percentile",
  "distinct_count",
  "first",
  "last",
] as const;

export const TIME_PERIOD = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_quarter",
  "last_quarter",
  "this_year",
  "last_year",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_365_days",
  "custom",
] as const;
```

---

## 3) Dashboard Definition

### 3.1 Dashboard Schema

```typescript
// packages/axis-registry/src/schemas/afanda/dashboard.ts

import { z } from "zod";

export const dashboardSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  slug: z.string().max(100), // URL-friendly identifier
  
  // Type
  dashboardType: z.enum(DASHBOARD_TYPE),
  
  // Access control
  visibility: z.enum(["private", "role", "tenant"]).default("private"),
  allowedRoles: z.array(z.string()).optional(), // For role visibility
  ownerId: z.string().uuid(),
  
  // Layout
  layout: z.enum(["grid", "freeform"]).default("grid"),
  columns: z.number().int().min(1).max(24).default(12),
  rowHeight: z.number().int().min(50).default(100),
  
  // Default filters
  defaultPeriod: z.enum(TIME_PERIOD).default("this_month"),
  defaultFilters: z.record(z.unknown()).optional(),
  
  // Refresh
  refreshFrequency: z.enum(REFRESH_FREQUENCY).default("5_minutes"),
  lastRefreshedAt: z.string().datetime().optional(),
  
  // Status
  isDefault: z.boolean().default(false), // Default for role/user
  isPublished: z.boolean().default(false),
  
  // Versioning
  version: z.number().int().default(1),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export const dashboardLayoutSchema = z.object({
  dashboardId: z.string().uuid(),
  widgets: z.array(z.object({
    widgetId: z.string().uuid(),
    // Grid position
    x: z.number().int().min(0),
    y: z.number().int().min(0),
    width: z.number().int().min(1),
    height: z.number().int().min(1),
  })),
});

export type Dashboard = z.infer<typeof dashboardSchema>;
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;
```

### 3.2 Standard Dashboards

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STANDARD DASHBOARDS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. EXECUTIVE DASHBOARD                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        ││
│  │  │ Revenue │ │  Profit │ │ Cash    │ │  AR/AP  │                        ││
│  │  │  MTD    │ │  Margin │ │ Position│ │  Ratio  │                        ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        ││
│  │  ┌───────────────────────────┐ ┌───────────────────────────┐            ││
│  │  │    Revenue Trend (12mo)   │ │   Expense Breakdown       │            ││
│  │  │    [Line Chart]           │ │   [Pie Chart]             │            ││
│  │  └───────────────────────────┘ └───────────────────────────┘            ││
│  │  ┌───────────────────────────────────────────────────────────┐          ││
│  │  │              Key Alerts & Exceptions                       │          ││
│  │  └───────────────────────────────────────────────────────────┘          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  2. SALES DASHBOARD                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        ││
│  │  │ Orders  │ │Invoices │ │ Pipeline│ │ DSO     │                        ││
│  │  │  Today  │ │ Pending │ │  Value  │ │ (Days)  │                        ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        ││
│  │  ┌───────────────────────────┐ ┌───────────────────────────┐            ││
│  │  │   Sales by Product        │ │   Top 10 Customers        │            ││
│  │  │   [Bar Chart]             │ │   [Table]                 │            ││
│  │  └───────────────────────────┘ └───────────────────────────┘            ││
│  │  ┌───────────────────────────────────────────────────────────┐          ││
│  │  │              AR Aging Summary                              │          ││
│  │  └───────────────────────────────────────────────────────────┘          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  3. INVENTORY DASHBOARD                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        ││
│  │  │ Stock   │ │ Low     │ │ Turns   │ │ Value   │                        ││
│  │  │ Items   │ │ Stock   │ │ Ratio   │ │ Total   │                        ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        ││
│  │  ┌───────────────────────────┐ ┌───────────────────────────┐            ││
│  │  │   Stock by Category       │ │   Slow Moving Items       │            ││
│  │  │   [Treemap]               │ │   [Table]                 │            ││
│  │  └───────────────────────────┘ └───────────────────────────┘            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  4. FINANCE DASHBOARD                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │              P&L Summary (Actual vs Budget)                          │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │  ┌───────────────────────────┐ ┌───────────────────────────┐            ││
│  │  │   Balance Sheet Snapshot  │ │   Cash Flow Trend         │            ││
│  │  │   [Stacked Bar]           │ │   [Area Chart]            │            ││
│  │  └───────────────────────────┘ └───────────────────────────┘            ││
│  │  ┌───────────────────────────────────────────────────────────┐          ││
│  │  │              Period Close Status & Tasks                   │          ││
│  │  └───────────────────────────────────────────────────────────┘          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4) Widget System

### 4.1 Widget Schema

```typescript
// packages/axis-registry/src/schemas/afanda/widget.ts

export const widgetSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  
  // Type
  widgetType: z.enum(WIDGET_TYPE),
  
  // Data source
  dataSource: z.object({
    type: z.enum(["kpi", "query", "api", "static"]),
    // For KPI
    kpiId: z.string().uuid().optional(),
    // For query
    query: z.string().optional(),
    // For API
    endpoint: z.string().optional(),
    // For static
    staticData: z.unknown().optional(),
  }),
  
  // Filters (widget-level)
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "in", "between"]),
    value: z.unknown(),
  })).optional(),
  
  // Aggregation
  aggregation: z.object({
    type: z.enum(AGGREGATION_TYPE).optional(),
    field: z.string().optional(),
    groupBy: z.array(z.string()).optional(),
  }).optional(),
  
  // Visualization config
  config: z.record(z.unknown()), // Widget-type-specific config
  
  // Theming
  colorScheme: z.string().optional(),
  
  // Interactivity
  drillDownEnabled: z.boolean().default(false),
  drillDownConfig: z.object({
    targetDashboard: z.string().uuid().optional(),
    targetUrl: z.string().optional(),
    passFilters: z.boolean().default(true),
  }).optional(),
  
  // Refresh
  refreshFrequency: z.enum(REFRESH_FREQUENCY).optional(), // Override dashboard
  
  // Reusable
  isTemplate: z.boolean().default(false),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type Widget = z.infer<typeof widgetSchema>;
```

### 4.2 Widget Type Configurations

```typescript
// packages/axis-registry/src/schemas/afanda/widget-configs.ts

// Metric Card Configuration
export const metricCardConfigSchema = z.object({
  // Value
  valueFormat: z.enum(["number", "currency", "percent", "duration"]).default("number"),
  decimals: z.number().int().min(0).max(6).default(0),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  
  // Trend
  showTrend: z.boolean().default(true),
  trendPeriod: z.enum(TIME_PERIOD).default("last_month"),
  invertTrendColors: z.boolean().default(false), // For metrics where down is good
  
  // Target
  showTarget: z.boolean().default(false),
  targetValue: z.number().optional(),
  targetLabel: z.string().optional(),
  
  // Sparkline
  showSparkline: z.boolean().default(false),
  sparklinePeriod: z.enum(TIME_PERIOD).default("last_30_days"),
  
  // Icon
  icon: z.string().optional(),
  iconColor: z.string().optional(),
});

// Line Chart Configuration
export const lineChartConfigSchema = z.object({
  // Axes
  xAxis: z.object({
    field: z.string(),
    label: z.string().optional(),
    format: z.string().optional(),
  }),
  yAxis: z.object({
    field: z.string(),
    label: z.string().optional(),
    format: z.enum(["number", "currency", "percent"]).default("number"),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  
  // Series
  series: z.array(z.object({
    name: z.string(),
    field: z.string(),
    color: z.string().optional(),
    type: z.enum(["line", "area", "bar"]).default("line"),
  })),
  
  // Options
  showLegend: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  showTooltip: z.boolean().default(true),
  enableZoom: z.boolean().default(false),
  smooth: z.boolean().default(true),
  
  // Annotations
  annotations: z.array(z.object({
    type: z.enum(["line", "range", "point"]),
    value: z.unknown(),
    label: z.string().optional(),
    color: z.string().optional(),
  })).optional(),
});

// Data Table Configuration
export const dataTableConfigSchema = z.object({
  // Columns
  columns: z.array(z.object({
    field: z.string(),
    header: z.string(),
    width: z.number().optional(),
    sortable: z.boolean().default(true),
    filterable: z.boolean().default(false),
    format: z.string().optional(),
    align: z.enum(["left", "center", "right"]).default("left"),
  })),
  
  // Options
  pageSize: z.number().int().min(5).max(100).default(10),
  showPagination: z.boolean().default(true),
  showSearch: z.boolean().default(false),
  rowClickAction: z.enum(["none", "expand", "navigate", "select"]).default("none"),
  
  // Totals
  showTotals: z.boolean().default(false),
  totalColumns: z.array(z.string()).optional(),
  
  // Conditional formatting
  conditionalFormatting: z.array(z.object({
    field: z.string(),
    condition: z.object({
      operator: z.enum(["gt", "gte", "lt", "lte", "eq", "between"]),
      value: z.unknown(),
    }),
    style: z.object({
      backgroundColor: z.string().optional(),
      color: z.string().optional(),
      fontWeight: z.string().optional(),
    }),
  })).optional(),
});
```

---

## 5) KPI Engine

### 5.1 KPI Schema

```typescript
// packages/axis-registry/src/schemas/afanda/kpi.ts

export const KPI_CATEGORY = [
  "financial",
  "operational",
  "sales",
  "purchasing",
  "inventory",
  "hr",
  "custom",
] as const;

export const kpiSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  
  // Category
  category: z.enum(KPI_CATEGORY),
  
  // Calculation
  formula: z.string(), // Expression language or SQL
  formulaType: z.enum(["expression", "sql", "script"]).default("expression"),
  
  // Dependencies
  dependsOn: z.array(z.string()).optional(), // Other KPI codes
  
  // Display
  unit: z.enum(["number", "currency", "percent", "days", "ratio", "custom"]).default("number"),
  customUnit: z.string().optional(),
  decimals: z.number().int().min(0).max(6).default(2),
  invertColors: z.boolean().default(false), // Lower is better
  
  // Targets
  targetValue: z.number().optional(),
  targetType: z.enum(["fixed", "dynamic", "calculated"]).optional(),
  thresholds: z.object({
    critical: z.number().optional(),
    warning: z.number().optional(),
    good: z.number().optional(),
    excellent: z.number().optional(),
  }).optional(),
  
  // Time
  periodType: z.enum(["point_in_time", "period_to_date", "rolling"]).default("period_to_date"),
  rollingPeriodDays: z.number().int().optional(),
  
  // Caching
  cacheMinutes: z.number().int().default(5),
  lastCalculatedAt: z.string().datetime().optional(),
  lastValue: z.number().optional(),
  
  // Status
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false), // Built-in KPIs
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type KPI = z.infer<typeof kpiSchema>;
```

### 5.2 Standard KPIs

```typescript
// packages/axis-registry/src/schemas/afanda/standard-kpis.ts

export const STANDARD_KPIS = {
  // Financial KPIs
  financial: [
    {
      code: "REVENUE_MTD",
      name: "Revenue (Month to Date)",
      formula: "SUM(invoice.total WHERE invoice.status = 'posted' AND invoice.date >= monthStart())",
      category: "financial",
      unit: "currency",
    },
    {
      code: "GROSS_PROFIT_MARGIN",
      name: "Gross Profit Margin",
      formula: "(REVENUE_MTD - COGS_MTD) / REVENUE_MTD * 100",
      category: "financial",
      unit: "percent",
      dependsOn: ["REVENUE_MTD", "COGS_MTD"],
    },
    {
      code: "NET_PROFIT_MARGIN",
      name: "Net Profit Margin",
      formula: "NET_INCOME_MTD / REVENUE_MTD * 100",
      category: "financial",
      unit: "percent",
    },
    {
      code: "CURRENT_RATIO",
      name: "Current Ratio",
      formula: "CURRENT_ASSETS / CURRENT_LIABILITIES",
      category: "financial",
      unit: "ratio",
    },
    {
      code: "CASH_POSITION",
      name: "Cash Position",
      formula: "SUM(account.balance WHERE account.type = 'bank' OR account.type = 'cash')",
      category: "financial",
      unit: "currency",
      periodType: "point_in_time",
    },
  ],
  
  // Sales KPIs
  sales: [
    {
      code: "DSO",
      name: "Days Sales Outstanding",
      formula: "(AR_BALANCE / REVENUE_LAST_30_DAYS) * 30",
      category: "sales",
      unit: "days",
      invertColors: true, // Lower is better
    },
    {
      code: "ORDERS_TODAY",
      name: "Orders Today",
      formula: "COUNT(order WHERE order.date = today() AND order.status IN ('confirmed', 'posted'))",
      category: "sales",
      unit: "number",
    },
    {
      code: "PIPELINE_VALUE",
      name: "Sales Pipeline Value",
      formula: "SUM(quote.total WHERE quote.status = 'sent' AND quote.expiryDate >= today())",
      category: "sales",
      unit: "currency",
    },
    {
      code: "QUOTE_CONVERSION_RATE",
      name: "Quote Conversion Rate",
      formula: "COUNT(order WHERE order.sourceQuoteId IS NOT NULL) / COUNT(quote WHERE quote.status = 'sent') * 100",
      category: "sales",
      unit: "percent",
      periodType: "rolling",
      rollingPeriodDays: 90,
    },
  ],
  
  // Inventory KPIs
  inventory: [
    {
      code: "INVENTORY_TURNOVER",
      name: "Inventory Turnover",
      formula: "COGS_YTD / AVG(INVENTORY_VALUE)",
      category: "inventory",
      unit: "ratio",
    },
    {
      code: "STOCKOUT_RATE",
      name: "Stockout Rate",
      formula: "COUNT(item WHERE item.onHand = 0 AND item.isActive = true) / COUNT(item WHERE item.isActive = true) * 100",
      category: "inventory",
      unit: "percent",
      invertColors: true,
    },
    {
      code: "INVENTORY_VALUE",
      name: "Inventory Value",
      formula: "SUM(item.onHand * item.unitCost)",
      category: "inventory",
      unit: "currency",
      periodType: "point_in_time",
    },
  ],
  
  // Purchasing KPIs
  purchasing: [
    {
      code: "DPO",
      name: "Days Payable Outstanding",
      formula: "(AP_BALANCE / PURCHASES_LAST_30_DAYS) * 30",
      category: "purchasing",
      unit: "days",
    },
    {
      code: "PO_PENDING_APPROVAL",
      name: "POs Pending Approval",
      formula: "COUNT(po WHERE po.status = 'pending_approval')",
      category: "purchasing",
      unit: "number",
    },
    {
      code: "SUPPLIER_ON_TIME_RATE",
      name: "Supplier On-Time Delivery Rate",
      formula: "COUNT(receipt WHERE receipt.date <= receipt.expectedDate) / COUNT(receipt) * 100",
      category: "purchasing",
      unit: "percent",
      periodType: "rolling",
      rollingPeriodDays: 90,
    },
  ],
};
```

### 5.3 KPI Calculation Engine

```typescript
// packages/db/src/queries/afanda/kpi-engine.ts

/**
 * Calculate a KPI value
 */
export async function calculateKPI(
  db: Database,
  tenantId: string,
  kpiCode: string,
  options?: {
    asOfDate?: Date;
    periodStart?: Date;
    periodEnd?: Date;
    forceRefresh?: boolean;
  }
): Promise<{
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  status: "critical" | "warning" | "good" | "excellent" | "neutral";
  calculatedAt: Date;
}> {
  const kpi = await db.query.kpis.findFirst({
    where: and(
      eq(kpis.tenantId, tenantId),
      eq(kpis.code, kpiCode)
    ),
  });
  
  if (!kpi) {
    throw new Error(`KPI not found: ${kpiCode}`);
  }
  
  // Check cache
  if (!options?.forceRefresh && kpi.lastCalculatedAt) {
    const cacheAge = Date.now() - new Date(kpi.lastCalculatedAt).getTime();
    if (cacheAge < kpi.cacheMinutes * 60 * 1000) {
      return {
        value: kpi.lastValue!,
        status: determineStatus(kpi.lastValue!, kpi.thresholds),
        calculatedAt: new Date(kpi.lastCalculatedAt),
      };
    }
  }
  
  // Resolve dependencies first
  const dependencyValues: Record<string, number> = {};
  if (kpi.dependsOn) {
    for (const depCode of kpi.dependsOn) {
      const depResult = await calculateKPI(db, tenantId, depCode, options);
      dependencyValues[depCode] = depResult.value;
    }
  }
  
  // Calculate current value
  const value = await executeFormula(db, kpi, dependencyValues, options);
  
  // Calculate previous period value for comparison
  let previousValue: number | undefined;
  let change: number | undefined;
  let changePercent: number | undefined;
  
  if (kpi.periodType !== "point_in_time") {
    const previousPeriod = getPreviousPeriod(options?.periodStart, options?.periodEnd);
    previousValue = await executeFormula(db, kpi, dependencyValues, {
      ...options,
      periodStart: previousPeriod.start,
      periodEnd: previousPeriod.end,
    });
    
    if (previousValue !== 0) {
      change = value - previousValue;
      changePercent = (change / previousValue) * 100;
    }
  }
  
  // Update cache
  await db.update(kpis)
    .set({
      lastValue: value,
      lastCalculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(kpis.id, kpi.id));
  
  return {
    value,
    previousValue,
    change,
    changePercent,
    status: determineStatus(value, kpi.thresholds, kpi.invertColors),
    calculatedAt: new Date(),
  };
}

/**
 * Execute a KPI formula
 */
async function executeFormula(
  db: Database,
  kpi: KPI,
  dependencies: Record<string, number>,
  options?: { periodStart?: Date; periodEnd?: Date; asOfDate?: Date }
): Promise<number> {
  switch (kpi.formulaType) {
    case "expression":
      return evaluateExpression(kpi.formula, {
        ...dependencies,
        ...buildExpressionContext(options),
      });
      
    case "sql":
      const result = await db.execute(sql.raw(kpi.formula));
      return result.rows[0]?.value || 0;
      
    case "script":
      return await runSandboxedScript(kpi.formula, { db, dependencies, options });
      
    default:
      throw new Error(`Unknown formula type: ${kpi.formulaType}`);
  }
}
```

---

## 6) Alert System

### 6.1 Alert Schema

```typescript
// packages/axis-registry/src/schemas/afanda/alert.ts

export const ALERT_SEVERITY = [
  "info",
  "warning",
  "critical",
] as const;

export const ALERT_STATUS = [
  "active",
  "acknowledged",
  "resolved",
  "snoozed",
] as const;

export const alertRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  
  // Condition
  conditionType: z.enum(["kpi_threshold", "event", "schedule", "anomaly"]),
  
  // For KPI threshold
  kpiId: z.string().uuid().optional(),
  thresholdOperator: z.enum(["gt", "gte", "lt", "lte", "eq", "between"]).optional(),
  thresholdValue: z.number().optional(),
  thresholdValue2: z.number().optional(), // For between
  
  // For event
  eventType: z.string().optional(),
  eventCondition: z.record(z.unknown()).optional(),
  
  // For schedule
  cronExpression: z.string().optional(),
  
  // Alert configuration
  severity: z.enum(ALERT_SEVERITY).default("warning"),
  
  // Notification
  notifyRoles: z.array(z.string()).optional(),
  notifyUsers: z.array(z.string().uuid()).optional(),
  notifyChannels: z.array(z.enum(["in_app", "email", "sms", "slack", "webhook"])).default(["in_app"]),
  
  // Escalation
  escalateAfterMinutes: z.number().int().optional(),
  escalateTo: z.array(z.string()).optional(),
  
  // Cooldown
  cooldownMinutes: z.number().int().default(60), // Don't re-fire within
  
  // Status
  isActive: z.boolean().default(true),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const alertInstanceSchema = z.object({
  id: z.string().uuid(),
  ruleId: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Alert details
  title: z.string().max(255),
  message: z.string().max(2000),
  severity: z.enum(ALERT_SEVERITY),
  
  // Context
  triggeredValue: z.number().optional(),
  thresholdValue: z.number().optional(),
  sourceType: z.string().optional(),
  sourceId: z.string().uuid().optional(),
  
  // Status
  status: z.enum(ALERT_STATUS).default("active"),
  
  // Acknowledgment
  acknowledgedBy: z.string().uuid().optional(),
  acknowledgedAt: z.string().datetime().optional(),
  acknowledgmentNote: z.string().max(500).optional(),
  
  // Resolution
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionNote: z.string().max(500).optional(),
  
  // Snooze
  snoozedUntil: z.string().datetime().optional(),
  
  firedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type AlertRule = z.infer<typeof alertRuleSchema>;
export type AlertInstance = z.infer<typeof alertInstanceSchema>;
```

### 6.2 Standard Alerts

```typescript
// packages/axis-registry/src/schemas/afanda/standard-alerts.ts

export const STANDARD_ALERT_RULES = [
  // Financial alerts
  {
    code: "CASH_LOW",
    name: "Low Cash Position",
    conditionType: "kpi_threshold",
    kpiCode: "CASH_POSITION",
    thresholdOperator: "lt",
    description: "Cash position is below the minimum threshold",
    severity: "critical",
  },
  {
    code: "DSO_HIGH",
    name: "High Days Sales Outstanding",
    conditionType: "kpi_threshold",
    kpiCode: "DSO",
    thresholdOperator: "gt",
    thresholdValue: 45,
    description: "DSO exceeds 45 days",
    severity: "warning",
  },
  
  // Inventory alerts
  {
    code: "STOCKOUT",
    name: "Stock Out Alert",
    conditionType: "event",
    eventType: "inventory.stockout",
    description: "An item has run out of stock",
    severity: "warning",
  },
  {
    code: "LOW_STOCK",
    name: "Low Stock Alert",
    conditionType: "event",
    eventType: "inventory.low_stock",
    description: "An item is below reorder point",
    severity: "info",
  },
  
  // Approval alerts
  {
    code: "APPROVAL_OVERDUE",
    name: "Overdue Approval",
    conditionType: "schedule",
    cronExpression: "0 9 * * *", // Daily at 9 AM
    description: "Approval tasks older than 3 days",
    severity: "warning",
  },
  
  // Reconciliation alerts
  {
    code: "RECON_EXCEPTION",
    name: "Reconciliation Exception",
    conditionType: "event",
    eventType: "reconciliation.exception",
    description: "New reconciliation exception detected",
    severity: "warning",
  },
];
```

---

## 7) Report Builder

### 7.1 Report Schema

```typescript
// packages/axis-registry/src/schemas/afanda/report.ts

export const REPORT_TYPE = [
  "tabular",      // Standard table report
  "summary",      // Grouped summary
  "matrix",       // Cross-tabulation
  "chart",        // Chart-based
  "financial",    // Financial statement format
  "custom",       // Custom template
] as const;

export const EXPORT_FORMAT = [
  "pdf",
  "excel",
  "csv",
  "html",
] as const;

export const reportDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Identity
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100),
  
  // Type
  reportType: z.enum(REPORT_TYPE),
  
  // Data source
  dataSource: z.object({
    type: z.enum(["entity", "query", "stored_procedure"]),
    entity: z.string().optional(),
    query: z.string().optional(),
    storedProcedure: z.string().optional(),
  }),
  
  // Parameters
  parameters: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(["string", "number", "date", "dateRange", "select", "multiSelect"]),
    required: z.boolean().default(false),
    defaultValue: z.unknown().optional(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
  })).optional(),
  
  // Columns (for tabular/summary)
  columns: z.array(z.object({
    field: z.string(),
    header: z.string(),
    width: z.number().optional(),
    format: z.string().optional(),
    aggregation: z.enum(AGGREGATION_TYPE).optional(),
    groupBy: z.boolean().default(false),
  })).optional(),
  
  // Grouping
  groupBy: z.array(z.string()).optional(),
  sortBy: z.array(z.object({
    field: z.string(),
    direction: z.enum(["asc", "desc"]),
  })).optional(),
  
  // Chart config (for chart type)
  chartConfig: z.record(z.unknown()).optional(),
  
  // Scheduling
  scheduleEnabled: z.boolean().default(false),
  scheduleConfig: z.object({
    cronExpression: z.string(),
    format: z.enum(EXPORT_FORMAT),
    recipients: z.array(z.string().email()),
    subject: z.string().optional(),
  }).optional(),
  
  // Access control
  visibility: z.enum(["private", "role", "tenant"]).default("private"),
  allowedRoles: z.array(z.string()).optional(),
  
  // Status
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type ReportDefinition = z.infer<typeof reportDefinitionSchema>;
```

### 7.2 Report Execution

```typescript
// packages/db/src/queries/afanda/report-engine.ts

/**
 * Execute a report
 */
export async function executeReport(
  db: Database,
  tenantId: string,
  reportId: string,
  parameters: Record<string, unknown>,
  options?: {
    format?: ExportFormat;
    limit?: number;
    offset?: number;
  }
): Promise<{
  data: Record<string, unknown>[];
  totalCount: number;
  columns: Array<{ field: string; header: string; type: string }>;
  generatedAt: Date;
  parameters: Record<string, unknown>;
}> {
  const report = await db.query.reportDefinitions.findFirst({
    where: and(
      eq(reportDefinitions.id, reportId),
      eq(reportDefinitions.tenantId, tenantId)
    ),
  });
  
  if (!report) {
    throw new Error("Report not found");
  }
  
  // Validate required parameters
  for (const param of report.parameters || []) {
    if (param.required && parameters[param.name] === undefined) {
      throw new Error(`Missing required parameter: ${param.name}`);
    }
  }
  
  // Execute query
  let data: Record<string, unknown>[];
  let totalCount: number;
  
  switch (report.dataSource.type) {
    case "entity":
      ({ data, totalCount } = await queryEntity(db, report, parameters, options));
      break;
      
    case "query":
      ({ data, totalCount } = await executeCustomQuery(db, report.dataSource.query!, parameters, options));
      break;
      
    case "stored_procedure":
      ({ data, totalCount } = await executeStoredProcedure(db, report.dataSource.storedProcedure!, parameters));
      break;
  }
  
  // Apply grouping and aggregation
  if (report.groupBy?.length) {
    data = applyGrouping(data, report.groupBy, report.columns);
  }
  
  // Apply sorting
  if (report.sortBy?.length) {
    data = applySorting(data, report.sortBy);
  }
  
  return {
    data,
    totalCount,
    columns: report.columns?.map(c => ({
      field: c.field,
      header: c.header,
      type: inferColumnType(c),
    })) || [],
    generatedAt: new Date(),
    parameters,
  };
}

/**
 * Schedule a report
 */
export async function scheduleReport(
  db: Database,
  tenantId: string,
  reportId: string,
  schedule: {
    cronExpression: string;
    format: ExportFormat;
    recipients: string[];
    subject?: string;
  }
): Promise<void> {
  await db.update(reportDefinitions)
    .set({
      scheduleEnabled: true,
      scheduleConfig: schedule,
      updatedAt: new Date().toISOString(),
    })
    .where(and(
      eq(reportDefinitions.id, reportId),
      eq(reportDefinitions.tenantId, tenantId)
    ));
  
  // Register with scheduler
  await registerScheduledJob(db, {
    type: "report",
    targetId: reportId,
    cronExpression: schedule.cronExpression,
    tenantId,
  });
}
```

---

## 8) AFANDA Events

```typescript
// packages/axis-registry/src/schemas/events/afanda.ts

export const alertFiredEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("alert.fired"),
  payload: z.object({
    alertId: z.string().uuid(),
    ruleId: z.string().uuid(),
    severity: z.enum(ALERT_SEVERITY),
    title: z.string(),
    triggeredValue: z.number().optional(),
  }),
});

export const alertAcknowledgedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("alert.acknowledged"),
  payload: z.object({
    alertId: z.string().uuid(),
    acknowledgedBy: z.string().uuid(),
    note: z.string().optional(),
  }),
});

export const kpiThresholdCrossedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("kpi.threshold_crossed"),
  payload: z.object({
    kpiCode: z.string(),
    previousValue: z.number(),
    currentValue: z.number(),
    threshold: z.number(),
    direction: z.enum(["above", "below"]),
  }),
});

export const reportGeneratedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("report.generated"),
  payload: z.object({
    reportId: z.string().uuid(),
    reportName: z.string(),
    format: z.enum(EXPORT_FORMAT),
    generatedBy: z.string().uuid(),
    recordCount: z.number().int(),
  }),
});

export const dashboardViewedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("dashboard.viewed"),
  payload: z.object({
    dashboardId: z.string().uuid(),
    viewedBy: z.string().uuid(),
    duration: z.number().int().optional(), // Seconds
  }),
});
```

---

## 9) AFANDA Configuration

```typescript
// packages/axis-registry/src/schemas/afanda/config.ts

export const afandaConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Default dashboard
  defaultExecutiveDashboard: z.string().uuid().optional(),
  defaultOperationalDashboard: z.string().uuid().optional(),
  
  // Refresh settings
  defaultRefreshFrequency: z.enum(REFRESH_FREQUENCY).default("5_minutes"),
  enableRealTimeUpdates: z.boolean().default(false),
  
  // KPI settings
  kpiCacheMinutes: z.number().int().min(1).default(5),
  showKpiTrends: z.boolean().default(true),
  
  // Alert settings
  alertNotificationChannels: z.array(z.enum(["in_app", "email", "sms", "slack"])).default(["in_app"]),
  criticalAlertEscalationMinutes: z.number().int().default(30),
  
  // Report settings
  maxReportRows: z.number().int().default(10000),
  enableReportScheduling: z.boolean().default(true),
  reportRetentionDays: z.number().int().default(90),
  
  // Export settings
  defaultExportFormat: z.enum(EXPORT_FORMAT).default("excel"),
  includeLogoInExports: z.boolean().default(true),
  
  // Analytics
  trackDashboardUsage: z.boolean().default(true),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type AfandaConfig = z.infer<typeof afandaConfigSchema>;
```

---

## 10) Exit Criteria (B11 Gate)

**B11 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                              | Verified | Implementation                               |
| --- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| 1   | Dashboard definitions with grid layout                 | ✅        | `dashboardSchema` defined                    |
| 2   | Widget system with multiple types                      | ✅        | `widgetSchema` + type configs                |
| 3   | KPI engine with formula calculation                    | ✅        | `calculateKPI()` function                    |
| 4   | Standard KPIs defined                                  | ✅        | `STANDARD_KPIS` catalog                      |
| 5   | Alert rules with thresholds                            | ✅        | `alertRuleSchema` defined                    |
| 6   | Alert notifications and escalation                     | ✅        | `notifyChannels`, `escalateTo`               |
| 7   | Report builder with parameters                         | ✅        | `reportDefinitionSchema` defined             |
| 8   | Report scheduling and export                           | ✅        | `scheduleReport()` + `EXPORT_FORMAT`         |
| 9   | Role-based dashboard access                            | ✅        | `visibility`, `allowedRoles`                 |
| 10  | Drill-down navigation                                  | ✅        | `drillDownConfig` in widget                  |
| 11  | AFANDA events published to outbox                      | ✅        | B02 outbox integration ready                 |
| 12  | Configuration per tenant                               | ✅        | `afandaConfigSchema` defined                 |

### Implementation Files

| Component              | Location                                                |
| ---------------------- | ------------------------------------------------------- |
| AFANDA Constants       | `packages/axis-registry/src/schemas/afanda/constants.ts`|
| Dashboard Schema       | `packages/axis-registry/src/schemas/afanda/dashboard.ts`|
| Widget Schema          | `packages/axis-registry/src/schemas/afanda/widget.ts`   |
| KPI Schema             | `packages/axis-registry/src/schemas/afanda/kpi.ts`      |
| Alert Schema           | `packages/axis-registry/src/schemas/afanda/alert.ts`    |
| Report Schema          | `packages/axis-registry/src/schemas/afanda/report.ts`   |
| AFANDA Tables          | `packages/db/src/schema/afanda/*.ts`                    |
| AFANDA Events          | `packages/axis-registry/src/schemas/events/afanda.ts`   |

---

## 11) Integration with Other Phases

| Phase               | Dependency on B11         | What B11 Provides                    |
| ------------------- | ------------------------- | ------------------------------------ |
| **All B-phases**    | Data sources              | Metrics from all domains             |
| **B07** (Accounting)| Financial KPIs            | P&L, balance sheet metrics           |
| **B08** (Controls)  | Audit dashboards          | Compliance monitoring                |
| **B09** (Reconciliation)| Exception alerts      | Recon exception dashboards           |
| **B10** (UX)        | Dashboard framework       | Widget rendering, layouts            |
| **B12** (Intelligence)| AI insights             | AI-powered anomaly detection         |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B11 (AFANDA)                                    |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: AFANDA aggregates data from all transactional domains (B04-B09).

---

## Related Documents

| Document                                       | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md)         | Philosophy: §8 (AFANDA)                    |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)           | Roadmap: Phase B11 definition              |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)       | Accounting (financial metrics)             |
| [B09-RECONCILIATION.md](./B09-RECONCILIATION.md)| Reconciliation (exception alerts)         |
| [B10-UX.md](./B10-UX.md)                       | UX (dashboard rendering)                   |
| [B12-INTELLIGENCE.md](./B12-INTELLIGENCE.md)   | Intelligence (AI insights)                 |

---

> *"AFANDA: One board to see everything. One place for decisions. Analytics, Finance, Actions, Notifications, Data, Alerts — unified."*
