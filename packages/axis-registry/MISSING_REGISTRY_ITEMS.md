# Missing Registry Items - Quick Reference

**Purpose:** Quick lookup of components and blocks that exist in `@workspace/design-system` but are NOT registered in `@axis/registry`

---

## Missing Components (37)

### Form (9)
```
textarea, radio-group, slider, combobox, command, input-otp, 
native-select, natural-date-input, input-group
```

### Layout (10)
```
breadcrumb, collapsible, resizable, sheet, drawer, sidebar, 
navigation-menu, pagination, carousel, aspect-ratio
```

### Feedback (2)
```
sonner, empty
```

### Overlay (6)
```
alert-dialog, popover, hover-card, context-menu, menubar, 
responsive-modal
```

### Display (2)
```
chart, calendar
```

### Utility (8)
```
toggle, toggle-group, button-group, field, item, kbd, 
sortable-list, data-table, data-table-column-header, 
data-table-pagination, theme-provider
```

---

## Missing Blocks (121)

### Navigation (19)
```
app-sidebar-01, collapsible-sidebar-01, floating-sidebar-01, 
docs-sidebar-01, submenu-sidebar-01, sidebar-calendars, 
sidebar-opt-in-form, date-picker-sidebar, nav-dropdown, 
nav-favorites, nav-main, nav-projects, nav-secondary, 
nav-user, nav-workspaces, team-switcher, version-switcher, 
site-header-01, notification-center-01
```

### Form (8)
```
forgot-password-form-01, reset-password-form-01, 
magic-link-form-01, otp-form-01, signup-form-01, 
login-form-01, login-form-02
```

### Auth (2)
```
login-with-image-01, login-social-01 (already in registry?)
```

### Feedback (3)
```
skeleton-card-01, skeleton-form-01, skeleton-table-01
```

### Dashboard (8)
```
dashboard-layout-01, dashboard-dialog-01, dashboard-shell-01, 
dashboard-header-01, widgets-01, stats-grid-01, 
profile-card-01, section-cards-01
```

### Charts (29)
```
activity-chart-01, area-chart-01, area-chart-gradient-01, 
area-chart-legend-01, area-chart-step-01, bar-chart-01, 
bar-chart-active-01, bar-chart-interactive-01, 
bar-chart-multiple-01, donut-chart-01, 
horizontal-bar-chart-01, labeled-bar-chart-01, 
labeled-line-chart-01, line-chart-01, line-chart-dots-01, 
line-chart-multiple-01, line-chart-step-01, 
mixed-bar-chart-01, negative-bar-chart-01, pie-chart-01, 
pie-chart-legend-01, pie-chart-simple-01, radar-chart-01, 
radar-chart-dots-01, radar-chart-multiple-01, 
radial-chart-01, radial-chart-stacked-01, 
stacked-area-chart-01, stacked-bar-chart-01
```

### Calendars (16)
```
calendar-bounded-01, calendar-disabled-dates-01, 
calendar-disabled-weekends-01, calendar-dropdown-01, 
calendar-localized-01, calendar-min-days-01, 
calendar-multi-month-01, calendar-presets-01, 
calendar-simple-01, calendar-time-range-01, 
calendar-week-numbers-01, calendar-with-time-01, 
calendar-with-today-01, date-range-picker-01, 
datetime-picker-01, natural-date-picker-01
```

### Marketing (10)
```
hero-section-01, hero-section-02, features-section-01, 
pricing-01, testimonials-01, faq-01, footer-01, 
cta-section-01, navbar-01, social-proof-01
```

### Ecommerce (5)
```
product-list-01, product-overview-01, shopping-cart-01, 
checkout-page-01, order-summary-01
```

### ERP (5)
```
trial-balance-table, reconciliation-widget, 
inventory-valuation-card, ar-aging-table, ap-aging-table
```

### AFANDA (5)
```
approval-queue, consultation-thread, escalation-ladder, 
read-receipt-system, sharing-board
```

### Cobalt (4)
```
autofill-engine, crud-sap-interface, predictive-form, 
summit-button
```

### Quorum (5)
```
command-k, drilldown-dashboard, exception-hunter, 
six-w1h-manifest, trend-analysis-widget
```

### Audit (4)
```
audit-trail-viewer, danger-zone-indicator, 
policy-override-record, risk-score-display
```

### Grids (1)
```
bento-grid-01
```

### Inputs (1)
```
combobox-01
```

---

## Summary Statistics

| Category | Actual Files | Registered | Missing | Gap % |
|----------|--------------|------------|---------|-------|
| **Components** | 62 | 25 | 37 | 60% |
| **Blocks** | 132 | 11 | 121 | 92% |
| **TOTAL** | 194 | 36 | 158 | 81% |

---

## Priority Recommendations

### 🔴 Critical (Do First)
1. **Core Form Components** - textarea, radio-group, slider, combobox
2. **Core Layout Components** - breadcrumb, sheet, drawer, sidebar
3. **Core Overlay Components** - alert-dialog, popover
4. **Navigation Blocks** - All sidebar and nav variants
5. **Auth Blocks** - All login/signup forms

### 🟡 Important (Do Second)
1. **Chart Blocks** - All 29 chart variants
2. **Calendar Blocks** - All 16 calendar variants
3. **Data Table Components** - data-table and related
4. **Dashboard Blocks** - All dashboard layouts and widgets

### 🟢 Nice to Have (Do Third)
1. **Marketing Blocks** - All 10 marketing blocks
2. **Ecommerce Blocks** - All 5 ecommerce blocks
3. **ERP Blocks** - All 5 ERP blocks
4. **Utility Components** - toggle, kbd, sortable-list, etc.

---

## Next Steps

1. **Read** `packages/axis-registry/src/schemas/ux/components.ts`
2. **Read** `packages/axis-registry/src/schemas/ux/blocks.ts`
3. **Add** missing items following existing patterns
4. **Validate** with `pnpm --filter @axis/registry validate`
5. **Generate** with `pnpm --filter @axis/registry codegen`
