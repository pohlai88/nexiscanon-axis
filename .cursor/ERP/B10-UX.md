# B10 — UX Productization
## Quorum & Cobalt: Two Personas, One System

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |                          |                           |                             |                           |                                 |                               |           |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: | :-------------------------: | :-----------------------: | :-----------------------------: | :---------------------------: | :-------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) | [B07](./B07-ACCOUNTING.md)  | [B08](./B08-CONTROLS.md)  | [B08-01](./B08-01-WORKFLOW.md)  | [B09](./B09-RECONCILIATION.md)| **[B10]** |
|            Posting            |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         |         Accounting          |         Controls          |            Workflow             |         Reconciliation        |    UX     |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §4 (Dual-Kernel Architecture), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B10
>
> **Tag:** `UX` | `QUORUM` | `COBALT` | `PRODUCTIZATION` | `PHASE-B10`

---

## 🛑 DEV NOTE: Respect @workspace/design-system

> **See [Template Enforcement Rule](../.cursor/rules/template-enforcement.always.mdc) for full details.**

All B10 UX components follow the **Single Source of Truth** pattern:

| Component              | Source                                              |
| ---------------------- | --------------------------------------------------- |
| UI Components          | `@workspace/design-system`                          |
| Block Templates        | `@workspace/shared-ui/blocks`                       |
| Layout Shells          | `@workspace/shared-ui/shells`                       |
| Theme Configuration    | `@workspace/design-system/themes`                   |
| UX Constants           | `@axis/registry/schemas/ux/constants.ts`            |
| Persona Configuration  | `@axis/registry/schemas/ux/persona.ts`              |

**Rule**: Use workspace imports only. Never create local UI components when shared ones exist.

---

## 1) The Core Law

> *"One engine, two faces. Same truth, different experiences."*

From A01 §4 (Dual-Kernel Architecture):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE DUAL-PERSONA PRINCIPLE                               │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     QUORUM: The SME experience                                    ║    │
│    ║     - Simple, guided, opinionated                                 ║    │
│    ║     - "Just tell me what to do"                                   ║    │
│    ║     - Hides complexity, surfaces essentials                       ║    │
│    ║                                                                   ║    │
│    ║     COBALT: The enterprise experience                             ║    │
│    ║     - Powerful, flexible, configurable                            ║    │
│    ║     - "Give me full control"                                      ║    │
│    ║     - Exposes all options, enables customization                  ║    │
│    ║                                                                   ║    │
│    ║     SAME ENGINE. SAME DATA. DIFFERENT UX.                         ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    A tenant can start with Quorum and grow into Cobalt.                      │
│    The transition is seamless — no data migration, no retraining.            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- SMEs need simplicity, not enterprise complexity
- Enterprises need power, not artificial limits
- One codebase, two experiences = sustainable development

---

## 2) The Persona Model

### 2.1 Persona Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PERSONA ARCHITECTURE                                  │
│                                                                              │
│                          ┌────────────────────┐                              │
│                          │    AXIS ENGINE     │                              │
│                          │  (B01-B09 Core)    │                              │
│                          └─────────┬──────────┘                              │
│                                    │                                         │
│                    ┌───────────────┴───────────────┐                         │
│                    │      PERSONA ADAPTER          │                         │
│                    │  (Feature flags, UI config)   │                         │
│                    └───────────────┬───────────────┘                         │
│                                    │                                         │
│          ┌─────────────────────────┼─────────────────────────┐               │
│          ▼                                                   ▼               │
│  ┌───────────────────────┐                       ┌───────────────────────┐  │
│  │        QUORUM         │                       │        COBALT         │  │
│  │    "SME Edition"      │                       │  "Enterprise Edition" │  │
│  ├───────────────────────┤                       ├───────────────────────┤  │
│  │ • Guided workflows    │                       │ • Full feature access │  │
│  │ • Simplified forms    │                       │ • Advanced config     │  │
│  │ • Smart defaults      │                       │ • Custom workflows    │  │
│  │ • Limited options     │                       │ • API access          │  │
│  │ • Help-focused        │                       │ • Multi-entity        │  │
│  └───────────────────────┘                       └───────────────────────┘  │
│                                                                              │
│  SWITCHING:                                                                  │
│  • Tenant-level setting (not user-level)                                     │
│  • Upgrade: Quorum → Cobalt (instant, no data change)                        │
│  • Downgrade: Cobalt → Quorum (if features allow)                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Persona Constants

```typescript
// packages/axis-registry/src/schemas/ux/constants.ts

export const PERSONA_TYPE = [
  "quorum",   // SME-focused, simplified
  "cobalt",   // Enterprise-focused, full power
] as const;

export const UX_COMPLEXITY = [
  "simple",     // Hide advanced options
  "standard",   // Show common options
  "advanced",   // Show all options
  "expert",     // Show everything + dev tools
] as const;

export const NAVIGATION_STYLE = [
  "guided",     // Step-by-step, wizard-like
  "standard",   // Traditional menu navigation
  "power",      // Command palette + keyboard shortcuts
] as const;

export const FORM_DENSITY = [
  "comfortable", // More spacing, fewer fields per screen
  "compact",     // Less spacing, more fields visible
  "dense",       // Maximum information density
] as const;

export const THEME_MODE = [
  "light",
  "dark",
  "system",
] as const;
```

### 2.3 Persona Configuration Schema

```typescript
// packages/axis-registry/src/schemas/ux/persona.ts

import { z } from "zod";

export const personaConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Persona selection
  persona: z.enum(PERSONA_TYPE).default("quorum"),
  
  // Feature exposure
  complexity: z.enum(UX_COMPLEXITY).default("simple"),
  
  // Navigation
  navigationStyle: z.enum(NAVIGATION_STYLE).default("guided"),
  showBreadcrumbs: z.boolean().default(true),
  showQuickActions: z.boolean().default(true),
  
  // Forms
  formDensity: z.enum(FORM_DENSITY).default("comfortable"),
  showOptionalFields: z.boolean().default(false),
  inlineValidation: z.boolean().default(true),
  autosaveEnabled: z.boolean().default(true),
  
  // Help
  showContextualHelp: z.boolean().default(true),
  showTooltips: z.boolean().default(true),
  showGuidedTours: z.boolean().default(true),
  
  // Theming
  themeMode: z.enum(THEME_MODE).default("system"),
  accentColor: z.string().optional(),
  
  // Branding
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  brandName: z.string().max(100).optional(),
  
  // Locale
  defaultLocale: z.string().default("en-US"),
  defaultTimezone: z.string().default("UTC"),
  defaultCurrency: z.string().length(3).default("USD"),
  dateFormat: z.string().default("YYYY-MM-DD"),
  numberFormat: z.string().default("1,234.56"),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type PersonaConfig = z.infer<typeof personaConfigSchema>;
```

---

## 3) Quorum Experience

### 3.1 Quorum Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       QUORUM DESIGN PRINCIPLES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. SIMPLICITY OVER FLEXIBILITY                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "If a feature has 10 options, pick the best one and hide the rest."    ││
│  │                                                                          ││
│  │  Example: Chart of Accounts                                              ││
│  │  • Quorum: Pre-built template, 50 accounts                               ││
│  │  • Cobalt: Build from scratch, unlimited accounts                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  2. GUIDANCE OVER FREEDOM                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "Tell users what to do next, don't make them figure it out."           ││
│  │                                                                          ││
│  │  Example: First Sale                                                     ││
│  │  • Quorum: Wizard: Customer → Items → Send Invoice                       ││
│  │  • Cobalt: Create Quote/Order/Delivery/Invoice separately                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  3. SMART DEFAULTS OVER CONFIGURATION                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "Make it work out of the box. Let power users customize later."        ││
│  │                                                                          ││
│  │  Example: Tax Configuration                                              ││
│  │  • Quorum: Auto-detect location, apply standard rates                    ││
│  │  • Cobalt: Configure tax jurisdictions, rates, rules                     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  4. CELEBRATION OVER ACKNOWLEDGMENT                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "Make users feel good about completing tasks."                         ││
│  │                                                                          ││
│  │  Example: First Invoice Paid                                             ││
│  │  • Quorum: Confetti, celebration message, next steps                     ││
│  │  • Cobalt: Toast notification, move on                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Quorum Feature Set

```typescript
// packages/axis-registry/src/schemas/ux/quorum.ts

export const quorumFeatureSetSchema = z.object({
  // Core features always enabled
  core: z.object({
    invoicing: z.boolean().default(true),
    payments: z.boolean().default(true),
    expenses: z.boolean().default(true),
    contacts: z.boolean().default(true),
    products: z.boolean().default(true),
    reports: z.boolean().default(true),
  }),
  
  // Optional features (can be enabled)
  optional: z.object({
    quotes: z.boolean().default(false),
    purchaseOrders: z.boolean().default(false),
    inventory: z.boolean().default(false),
    projects: z.boolean().default(false),
    multiCurrency: z.boolean().default(false),
  }),
  
  // Hidden features (Cobalt only)
  hidden: z.array(z.string()).default([
    "advancedGL",
    "costCenters",
    "multiEntity",
    "consolidation",
    "budgeting",
    "customReports",
    "apiAccess",
    "webhooks",
    "customWorkflows",
    "advancedRBAC",
    "auditTrail",
  ]),
  
  // Limits
  limits: z.object({
    maxUsers: z.number().int().default(10),
    maxInvoicesPerMonth: z.number().int().default(500),
    maxProducts: z.number().int().default(1000),
    maxContacts: z.number().int().default(5000),
    storageGB: z.number().default(5),
  }),
});

export type QuorumFeatureSet = z.infer<typeof quorumFeatureSetSchema>;
```

### 3.3 Quorum Navigation

```typescript
// apps/web/src/config/quorum-navigation.ts

export const QUORUM_NAVIGATION = [
  {
    id: "dashboard",
    label: "Home",
    icon: "Home",
    href: "/",
    badge: null,
  },
  {
    id: "sales",
    label: "Get Paid",
    icon: "DollarSign",
    children: [
      { id: "invoices", label: "Invoices", href: "/invoices" },
      { id: "payments", label: "Payments Received", href: "/payments" },
      { id: "customers", label: "Customers", href: "/customers" },
    ],
  },
  {
    id: "expenses",
    label: "Track Money",
    icon: "Receipt",
    children: [
      { id: "bills", label: "Bills to Pay", href: "/bills" },
      { id: "expenses", label: "Expenses", href: "/expenses" },
      { id: "vendors", label: "Vendors", href: "/vendors" },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: "Package",
    href: "/products",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "BarChart",
    children: [
      { id: "profitLoss", label: "Profit & Loss", href: "/reports/pnl" },
      { id: "balanceSheet", label: "Balance Sheet", href: "/reports/balance" },
      { id: "cashFlow", label: "Cash Flow", href: "/reports/cashflow" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    href: "/settings",
    position: "bottom",
  },
];
```

---

## 4) Cobalt Experience

### 4.1 Cobalt Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COBALT DESIGN PRINCIPLES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. POWER OVER SIMPLICITY                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "Expose every option. Let users master the system."                    ││
│  │                                                                          ││
│  │  Example: Document Creation                                              ││
│  │  • Full form with all fields visible                                     ││
│  │  • Keyboard shortcuts for common actions                                 ││
│  │  • Bulk operations, templates, favorites                                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  2. EFFICIENCY OVER GUIDANCE                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "Minimize clicks. Maximize throughput."                                ││
│  │                                                                          ││
│  │  Example: Data Entry                                                     ││
│  │  • Tab-through forms, no mouse required                                  ││
│  │  • Smart search everywhere (Cmd+K)                                       ││
│  │  • Recent items, favorites, bookmarks                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  3. CONFIGURABILITY OVER CONVENTION                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "Let users build their own workflows."                                 ││
│  │                                                                          ││
│  │  Example: Approval Workflows                                             ││
│  │  • Custom approval chains                                                ││
│  │  • Conditional routing                                                   ││
│  │  • Delegation rules                                                      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  4. DENSITY OVER WHITESPACE                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  "Show more information. Reduce scrolling."                             ││
│  │                                                                          ││
│  │  Example: List Views                                                     ││
│  │  • Compact rows, more columns                                            ││
│  │  • Inline editing                                                        ││
│  │  • Column customization                                                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Cobalt Feature Set

```typescript
// packages/axis-registry/src/schemas/ux/cobalt.ts

export const cobaltFeatureSetSchema = z.object({
  // All Quorum features plus...
  includesQuorum: z.boolean().default(true),
  
  // Advanced features
  advanced: z.object({
    // Financial
    advancedGL: z.boolean().default(true),
    costCenters: z.boolean().default(true),
    projects: z.boolean().default(true),
    budgeting: z.boolean().default(true),
    multiCurrency: z.boolean().default(true),
    bankReconciliation: z.boolean().default(true),
    
    // Multi-entity
    multiEntity: z.boolean().default(true),
    consolidation: z.boolean().default(true),
    intercompany: z.boolean().default(true),
    
    // Inventory
    advancedInventory: z.boolean().default(true),
    warehouseManagement: z.boolean().default(true),
    lotSerialTracking: z.boolean().default(true),
    
    // Controls
    advancedRBAC: z.boolean().default(true),
    customWorkflows: z.boolean().default(true),
    auditTrail: z.boolean().default(true),
    segregationOfDuties: z.boolean().default(true),
    
    // Integration
    apiAccess: z.boolean().default(true),
    webhooks: z.boolean().default(true),
    customIntegrations: z.boolean().default(true),
    
    // Reporting
    customReports: z.boolean().default(true),
    reportScheduling: z.boolean().default(true),
    dataExport: z.boolean().default(true),
  }),
  
  // No limits
  limits: z.object({
    maxUsers: z.literal(-1), // Unlimited
    maxInvoicesPerMonth: z.literal(-1),
    maxProducts: z.literal(-1),
    maxContacts: z.literal(-1),
    storageGB: z.literal(-1),
  }).default({
    maxUsers: -1,
    maxInvoicesPerMonth: -1,
    maxProducts: -1,
    maxContacts: -1,
    storageGB: -1,
  }),
});

export type CobaltFeatureSet = z.infer<typeof cobaltFeatureSetSchema>;
```

### 4.3 Cobalt Navigation

```typescript
// apps/web/src/config/cobalt-navigation.ts

export const COBALT_NAVIGATION = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    href: "/",
  },
  {
    id: "sales",
    label: "Sales",
    icon: "TrendingUp",
    children: [
      { id: "quotes", label: "Quotes", href: "/sales/quotes" },
      { id: "orders", label: "Sales Orders", href: "/sales/orders" },
      { id: "deliveries", label: "Deliveries", href: "/sales/deliveries" },
      { id: "invoices", label: "Invoices", href: "/sales/invoices" },
      { id: "creditNotes", label: "Credit Notes", href: "/sales/credit-notes" },
      { id: "payments", label: "Receipts", href: "/sales/receipts" },
      { divider: true },
      { id: "customers", label: "Customers", href: "/sales/customers" },
      { id: "priceList", label: "Price Lists", href: "/sales/price-lists" },
    ],
  },
  {
    id: "purchase",
    label: "Purchasing",
    icon: "ShoppingCart",
    children: [
      { id: "requests", label: "Purchase Requests", href: "/purchase/requests" },
      { id: "orders", label: "Purchase Orders", href: "/purchase/orders" },
      { id: "receipts", label: "Goods Receipts", href: "/purchase/receipts" },
      { id: "bills", label: "Supplier Bills", href: "/purchase/bills" },
      { id: "debitNotes", label: "Debit Notes", href: "/purchase/debit-notes" },
      { id: "payments", label: "Payments", href: "/purchase/payments" },
      { divider: true },
      { id: "suppliers", label: "Suppliers", href: "/purchase/suppliers" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: "Warehouse",
    children: [
      { id: "items", label: "Items", href: "/inventory/items" },
      { id: "stockLevels", label: "Stock Levels", href: "/inventory/levels" },
      { id: "adjustments", label: "Adjustments", href: "/inventory/adjustments" },
      { id: "transfers", label: "Transfers", href: "/inventory/transfers" },
      { id: "counts", label: "Physical Counts", href: "/inventory/counts" },
      { divider: true },
      { id: "locations", label: "Locations", href: "/inventory/locations" },
      { id: "categories", label: "Categories", href: "/inventory/categories" },
    ],
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: "Calculator",
    children: [
      { id: "journals", label: "Journal Entries", href: "/accounting/journals" },
      { id: "coa", label: "Chart of Accounts", href: "/accounting/coa" },
      { id: "bankRecon", label: "Bank Reconciliation", href: "/accounting/bank-recon" },
      { id: "periods", label: "Fiscal Periods", href: "/accounting/periods" },
      { divider: true },
      { id: "arAging", label: "AR Aging", href: "/accounting/ar-aging" },
      { id: "apAging", label: "AP Aging", href: "/accounting/ap-aging" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: "FileText",
    children: [
      { id: "financial", label: "Financial Statements", href: "/reports/financial" },
      { id: "sales", label: "Sales Reports", href: "/reports/sales" },
      { id: "purchase", label: "Purchase Reports", href: "/reports/purchase" },
      { id: "inventory", label: "Inventory Reports", href: "/reports/inventory" },
      { id: "custom", label: "Custom Reports", href: "/reports/custom" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "Settings",
    children: [
      { id: "company", label: "Company", href: "/settings/company" },
      { id: "users", label: "Users & Roles", href: "/settings/users" },
      { id: "workflows", label: "Workflows", href: "/settings/workflows" },
      { id: "integrations", label: "Integrations", href: "/settings/integrations" },
      { id: "api", label: "API Keys", href: "/settings/api" },
    ],
    position: "bottom",
  },
];
```

---

## 5) Shared UI Components

### 5.1 Application Shell

```typescript
// apps/_shared-ui/shells/ApplicationShell01.tsx

import { cn } from "@workspace/design-system/lib/utils";

export interface ApplicationShellProps {
  persona: "quorum" | "cobalt";
  navigation: NavigationItem[];
  user: UserInfo;
  children: React.ReactNode;
}

export function ApplicationShell01({
  persona,
  navigation,
  user,
  children,
}: ApplicationShellProps) {
  const config = usePersonaConfig();
  
  return (
    <div className={cn(
      "flex h-screen",
      persona === "quorum" && "bg-background",
      persona === "cobalt" && "bg-muted/30"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r",
        persona === "quorum" && "w-64",
        persona === "cobalt" && "w-56"
      )}>
        <Logo brandName={config.brandName} logoUrl={config.logoUrl} />
        <Navigation items={navigation} style={config.navigationStyle} />
        <UserMenu user={user} />
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {config.showBreadcrumbs && <Breadcrumbs />}
        {children}
      </main>
      
      {/* Help panel (Quorum) */}
      {persona === "quorum" && config.showContextualHelp && (
        <HelpPanel />
      )}
      
      {/* Command palette (Cobalt) */}
      {persona === "cobalt" && (
        <CommandPalette />
      )}
    </div>
  );
}
```

### 5.2 Form Components

```typescript
// apps/_shared-ui/blocks/FormSection.tsx

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
}: FormSectionProps) {
  const { formDensity } = usePersonaConfig();
  
  return (
    <Card className={cn(
      formDensity === "comfortable" && "p-6",
      formDensity === "compact" && "p-4",
      formDensity === "dense" && "p-3"
    )}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn(
        "grid gap-4",
        formDensity === "dense" && "gap-2"
      )}>
        {children}
      </CardContent>
    </Card>
  );
}
```

### 5.3 Data Tables

```typescript
// apps/_shared-ui/blocks/DataFortress.tsx

export interface DataFortressProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  bulkActions?: BulkAction[];
  filters?: FilterDef[];
  searchable?: boolean;
  exportable?: boolean;
  persona?: "quorum" | "cobalt";
}

export function DataFortress<T>({
  data,
  columns,
  onRowClick,
  bulkActions,
  filters,
  searchable = true,
  exportable = false,
  persona = "quorum",
}: DataFortressProps<T>) {
  const { formDensity } = usePersonaConfig();
  
  // Cobalt shows more columns by default
  const visibleColumns = persona === "quorum" 
    ? columns.filter(c => !c.meta?.cobaltOnly)
    : columns;
  
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {searchable && <SearchInput />}
        <div className="flex items-center gap-2">
          {filters && <FilterDropdown filters={filters} />}
          {persona === "cobalt" && <ColumnVisibilityToggle columns={columns} />}
          {exportable && persona === "cobalt" && <ExportButton />}
        </div>
      </div>
      
      {/* Table */}
      <Table>
        <TableHeader>
          {/* ... */}
        </TableHeader>
        <TableBody className={cn(
          formDensity === "dense" && "[&_td]:py-1"
        )}>
          {/* ... */}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      <Pagination />
    </div>
  );
}
```

---

## 6) Guided Workflows (Quorum)

### 6.1 Wizard Component

```typescript
// apps/_shared-ui/blocks/Wizard.tsx

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<WizardStepProps>;
  validation?: z.ZodSchema;
  optional?: boolean;
}

export interface WizardProps {
  steps: WizardStep[];
  onComplete: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  title: string;
}

export function Wizard({ steps, onComplete, onCancel, title }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleNext = async (stepData: Record<string, unknown>) => {
    const newData = { ...data, ...stepData };
    setData(newData);
    
    if (currentStep === steps.length - 1) {
      setIsSubmitting(true);
      try {
        await onComplete(newData);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <StepProgress steps={steps} currentStep={currentStep} />
      </div>
      
      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          {steps[currentStep].description && (
            <CardDescription>{steps[currentStep].description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <CurrentStepComponent
            data={data}
            onNext={handleNext}
            onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
      
      {/* Cancel option */}
      {onCancel && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onCancel}>
            Cancel and go back
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 6.2 First Invoice Wizard (Quorum)

```typescript
// apps/web/src/features/sales/components/FirstInvoiceWizard.tsx

const FIRST_INVOICE_STEPS: WizardStep[] = [
  {
    id: "customer",
    title: "Who is this for?",
    description: "Select an existing customer or create a new one",
    component: CustomerStep,
  },
  {
    id: "items",
    title: "What are you selling?",
    description: "Add products or services to the invoice",
    component: ItemsStep,
  },
  {
    id: "review",
    title: "Review and send",
    description: "Check the details and send to your customer",
    component: ReviewStep,
  },
];

export function FirstInvoiceWizard() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  
  const handleComplete = async (data: Record<string, unknown>) => {
    const invoice = await createInvoice.mutateAsync({
      customerId: data.customerId as string,
      lines: data.lines as InvoiceLine[],
      sendImmediately: data.sendImmediately as boolean,
    });
    
    // Celebration!
    confetti();
    toast.success("Your first invoice is on its way! 🎉");
    
    router.push(`/invoices/${invoice.id}`);
  };
  
  return (
    <Wizard
      title="Create Your First Invoice"
      steps={FIRST_INVOICE_STEPS}
      onComplete={handleComplete}
      onCancel={() => router.push("/invoices")}
    />
  );
}
```

---

## 7) Power Features (Cobalt)

### 7.1 Command Palette

```typescript
// apps/_shared-ui/blocks/CommandPalette.tsx

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  const commands = useCommands(); // Hook that returns available commands
  const recentItems = useRecentItems();
  const favorites = useFavorites();
  
  const filteredCommands = search
    ? commands.filter(c => 
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.keywords?.some(k => k.toLowerCase().includes(search.toLowerCase()))
      )
    : [];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0">
        <Command>
          <CommandInput 
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
          />
          <CommandList>
            {!search && (
              <>
                <CommandGroup heading="Recent">
                  {recentItems.map(item => (
                    <CommandItem key={item.id} onSelect={() => navigate(item.href)}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Favorites">
                  {favorites.map(item => (
                    <CommandItem key={item.id} onSelect={() => navigate(item.href)}>
                      <Star className="mr-2 h-4 w-4" />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            <CommandGroup heading="Actions">
              {filteredCommands.map(cmd => (
                <CommandItem key={cmd.id} onSelect={cmd.action}>
                  {cmd.icon && <cmd.icon className="mr-2 h-4 w-4" />}
                  {cmd.label}
                  {cmd.shortcut && (
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

### 7.2 Keyboard Shortcuts

```typescript
// apps/web/src/config/keyboard-shortcuts.ts

export const COBALT_SHORTCUTS = {
  // Navigation
  "g h": { action: () => navigate("/"), label: "Go to Home" },
  "g s": { action: () => navigate("/sales/invoices"), label: "Go to Sales" },
  "g p": { action: () => navigate("/purchase/orders"), label: "Go to Purchasing" },
  "g i": { action: () => navigate("/inventory/items"), label: "Go to Inventory" },
  "g a": { action: () => navigate("/accounting/journals"), label: "Go to Accounting" },
  
  // Actions
  "c i": { action: () => openModal("new-invoice"), label: "Create Invoice" },
  "c o": { action: () => openModal("new-order"), label: "Create Order" },
  "c p": { action: () => openModal("new-po"), label: "Create PO" },
  "c j": { action: () => openModal("new-journal"), label: "Create Journal Entry" },
  
  // View
  "/": { action: () => focusSearch(), label: "Focus Search" },
  "?": { action: () => openHelpModal(), label: "Show Shortcuts" },
  "Escape": { action: () => closeModal(), label: "Close Modal" },
  
  // Document actions
  "s": { action: () => saveDocument(), label: "Save", context: "document" },
  "Cmd+Enter": { action: () => submitDocument(), label: "Submit", context: "document" },
  "Cmd+Shift+A": { action: () => approveDocument(), label: "Approve", context: "document" },
};
```

### 7.3 Bulk Operations

```typescript
// apps/_shared-ui/blocks/BulkActionBar.tsx

export interface BulkAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  action: (ids: string[]) => Promise<void>;
  confirmMessage?: string;
  variant?: "default" | "destructive";
}

export function BulkActionBar({
  selectedIds,
  actions,
  onClearSelection,
}: {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
}) {
  if (selectedIds.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>
      
      <div className="flex items-center gap-2">
        {actions.map(action => (
          <Button
            key={action.id}
            variant={action.variant || "outline"}
            size="sm"
            onClick={async () => {
              if (action.confirmMessage) {
                const confirmed = await confirm(action.confirmMessage);
                if (!confirmed) return;
              }
              await action.action(selectedIds);
              onClearSelection();
            }}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        ))}
      </div>
      
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}
```

---

## 8) Onboarding

### 8.1 Quorum Onboarding

```typescript
// apps/web/src/features/onboarding/QuorumOnboarding.tsx

const QUORUM_ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Quorum!",
    description: "Let's get your business set up in just a few minutes.",
    component: WelcomeStep,
  },
  {
    id: "company",
    title: "Tell us about your business",
    description: "Basic information to personalize your experience.",
    component: CompanyInfoStep,
    fields: ["companyName", "industry", "country"],
  },
  {
    id: "bank",
    title: "Connect your bank",
    description: "Automatically import transactions and reconcile.",
    component: BankConnectionStep,
    optional: true,
  },
  {
    id: "first-customer",
    title: "Add your first customer",
    description: "Who will you be sending invoices to?",
    component: FirstCustomerStep,
    optional: true,
  },
  {
    id: "first-product",
    title: "Add a product or service",
    description: "What do you sell?",
    component: FirstProductStep,
    optional: true,
  },
  {
    id: "done",
    title: "You're all set!",
    description: "Your account is ready. Let's create your first invoice.",
    component: CompletionStep,
  },
];

export function QuorumOnboarding() {
  return (
    <OnboardingFlow
      steps={QUORUM_ONBOARDING_STEPS}
      onComplete={async (data) => {
        await setupTenant(data);
        navigate("/");
      }}
    />
  );
}
```

### 8.2 Cobalt Setup

```typescript
// apps/web/src/features/onboarding/CobaltSetup.tsx

const COBALT_SETUP_CHECKLIST = [
  {
    id: "company",
    title: "Company Settings",
    description: "Configure company details, logo, and fiscal year.",
    href: "/settings/company",
    required: true,
  },
  {
    id: "coa",
    title: "Chart of Accounts",
    description: "Import or customize your chart of accounts.",
    href: "/accounting/coa/setup",
    required: true,
  },
  {
    id: "users",
    title: "Users & Roles",
    description: "Invite team members and assign roles.",
    href: "/settings/users",
    required: false,
  },
  {
    id: "workflows",
    title: "Approval Workflows",
    description: "Configure approval rules for documents.",
    href: "/settings/workflows",
    required: false,
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect to external systems.",
    href: "/settings/integrations",
    required: false,
  },
  {
    id: "opening-balances",
    title: "Opening Balances",
    description: "Enter opening balances for migration.",
    href: "/accounting/opening-balances",
    required: true,
  },
];

export function CobaltSetup() {
  const progress = useSetupProgress();
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Setup Checklist</h1>
      <p className="text-muted-foreground mb-8">
        Complete these steps to configure your AXIS system.
      </p>
      
      <Progress value={progress.percent} className="mb-8" />
      
      <div className="space-y-4">
        {COBALT_SETUP_CHECKLIST.map(item => (
          <SetupItem
            key={item.id}
            {...item}
            completed={progress.completed.includes(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 9) Responsive Design

### 9.1 Mobile Considerations

```typescript
// apps/_shared-ui/hooks/useResponsive.ts

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "desktop">("desktop");
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBreakpoint("mobile");
      } else if (window.innerWidth < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
}
```

### 9.2 Mobile Navigation

```typescript
// apps/_shared-ui/blocks/MobileNavigation.tsx

export function MobileNavigation({
  navigation,
  persona,
}: {
  navigation: NavigationItem[];
  persona: PersonaType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Quorum: Bottom tab bar for main sections
  if (persona === "quorum") {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-bottom">
        <div className="flex justify-around py-2">
          {navigation.slice(0, 5).map(item => (
            <MobileNavItem key={item.id} {...item} />
          ))}
        </div>
      </div>
    );
  }
  
  // Cobalt: Hamburger menu
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80">
          <Navigation items={navigation} onItemClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

---

## 10) Accessibility

### 10.1 Accessibility Standards

```typescript
// apps/web/src/config/accessibility.ts

export const ACCESSIBILITY_CONFIG = {
  // Focus management
  focusRing: true,
  focusVisible: true,
  
  // Keyboard navigation
  skipLinks: true,
  arrowKeyNavigation: true,
  
  // Screen readers
  ariaLabels: true,
  announcements: true,
  
  // Visual
  minContrastRatio: 4.5, // WCAG AA
  reduceMotion: "system", // Respect prefers-reduced-motion
  
  // Text
  minFontSize: 14,
  lineHeight: 1.5,
  
  // Time limits
  sessionWarningMinutes: 5,
  autoLogoutMinutes: 30,
};
```

### 10.2 Skip Links

```typescript
// apps/_shared-ui/blocks/SkipLinks.tsx

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded focus:outline-none"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="absolute top-4 left-48 z-50 bg-primary text-primary-foreground px-4 py-2 rounded focus:outline-none"
      >
        Skip to navigation
      </a>
    </div>
  );
}
```

---

## 11) Exit Criteria (B10 Gate)

**B10 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                              | Verified | Implementation                               |
| --- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| 1   | Quorum persona with simplified navigation              | ✅        | `QUORUM_NAVIGATION` defined                  |
| 2   | Cobalt persona with full navigation                    | ✅        | `COBALT_NAVIGATION` defined                  |
| 3   | Persona switching at tenant level                      | ✅        | `personaConfigSchema` defined                |
| 4   | Wizard-based workflows for Quorum                      | ✅        | `Wizard` component                           |
| 5   | Command palette for Cobalt                             | ✅        | `CommandPalette` component                   |
| 6   | Keyboard shortcuts for Cobalt                          | ✅        | `COBALT_SHORTCUTS` defined                   |
| 7   | Bulk operations for Cobalt                             | ✅        | `BulkActionBar` component                    |
| 8   | Responsive design (mobile/tablet/desktop)              | ✅        | `useResponsive` + mobile nav                 |
| 9   | Onboarding flows for both personas                     | ✅        | `QuorumOnboarding`, `CobaltSetup`            |
| 10  | Accessibility compliance (WCAG AA)                     | ✅        | `ACCESSIBILITY_CONFIG`, skip links           |
| 11  | Theming support (light/dark/system)                    | ✅        | `themeMode` in persona config                |
| 12  | Branding customization                                 | ✅        | `logoUrl`, `brandName` in config             |

### Implementation Files

| Component              | Location                                              |
| ---------------------- | ----------------------------------------------------- |
| UX Constants           | `packages/axis-registry/src/schemas/ux/constants.ts`  |
| Persona Config         | `packages/axis-registry/src/schemas/ux/persona.ts`    |
| Quorum Features        | `packages/axis-registry/src/schemas/ux/quorum.ts`     |
| Cobalt Features        | `packages/axis-registry/src/schemas/ux/cobalt.ts`     |
| **Component Registry** | `packages/axis-registry/src/schemas/ux/components.ts` |
| **Theme Registry**     | `packages/axis-registry/src/schemas/ux/theme.ts`      |
| **Block Registry**     | `packages/axis-registry/src/schemas/ux/blocks.ts`     |
| Application Shell      | `apps/_shared-ui/shells/ApplicationShell01.tsx`       |
| Navigation Config      | `apps/web/src/config/*-navigation.ts`                 |
| UI Blocks              | `apps/_shared-ui/blocks/*.tsx`                        |

---

## 12) Integration with Other Phases

| Phase               | Dependency on B10         | What B10 Provides                    |
| ------------------- | ------------------------- | ------------------------------------ |
| **All B-phases**    | UI layer                  | User interface for all features      |
| **B08** (Controls)  | Role-based UI             | UI adapts to user permissions        |
| **B08-01** (Workflow)| Approval UX              | Task inbox, approval screens         |
| **B11** (AFANDA)    | Dashboard framework       | Widget system, layout templates      |
| **B12** (Intelligence)| AI UI components        | Chat interface, suggestions          |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Components Defined)  |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B10 (UX)                                        |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: UI components use @workspace/design-system per template enforcement rules.

---

## Related Documents

| Document                                       | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md)         | Philosophy: §4 (Dual-Kernel Architecture)  |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)           | Roadmap: Phase B10 definition              |
| [B08-CONTROLS.md](./B08-CONTROLS.md)           | Controls (role-based UI)                   |
| [B08-01-WORKFLOW.md](./B08-01-WORKFLOW.md)     | Workflow (approval UX)                     |
| [B11-AFANDA.md](./B11-AFANDA.md)               | AFANDA (dashboard framework)               |

---

> *"One engine, two faces. Quorum for simplicity. Cobalt for power. Same truth, different experiences."*
