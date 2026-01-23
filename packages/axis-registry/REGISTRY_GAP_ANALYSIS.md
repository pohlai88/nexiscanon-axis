# AXIS Registry Gap Analysis

**Generated:** 2026-01-23  
**Purpose:** Identify missing components and blocks not registered in `@axis/registry`

---

## Executive Summary

The `@axis/registry` package contains Zod schemas for components and blocks in `@workspace/design-system`, but there are significant gaps:

- **Components:** 62 actual files vs 25 registered (37 missing = 60% gap)
- **Blocks:** 132 actual files vs 11 registered (121 missing = 92% gap)

---

## 1. Missing Components (37 total)

### 1.1 Form Components (Missing 9)
- `textarea.tsx` - Multi-line text input
- `radio-group.tsx` - Radio button group
- `slider.tsx` - Range slider
- `combobox.tsx` - Searchable select
- `command.tsx` - Command menu primitive
- `input-otp.tsx` - OTP input field
- `native-select.tsx` - Native HTML select
- `natural-date-input.tsx` - Natural language date input
- `input-group.tsx` - Input with prefix/suffix

### 1.2 Layout Components (Missing 10)
- `breadcrumb.tsx` - Breadcrumb navigation
- `collapsible.tsx` - Collapsible section
- `resizable.tsx` - Resizable panels
- `sheet.tsx` - Slide-over panel
- `drawer.tsx` - Bottom drawer
- `sidebar.tsx` - Sidebar navigation
- `navigation-menu.tsx` - Navigation menu
- `pagination.tsx` - Pagination controls
- `carousel.tsx` - Carousel/slider
- `aspect-ratio.tsx` - Aspect ratio container

### 1.3 Feedback Components (Missing 3)
- `sonner.tsx` - Toast notifications
- `empty.tsx` - Empty state component

### 1.4 Overlay Components (Missing 6)
- `alert-dialog.tsx` - Alert/confirm dialog
- `popover.tsx` - Popover overlay
- `hover-card.tsx` - Hover card
- `context-menu.tsx` - Context menu
- `menubar.tsx` - Menu bar
- `responsive-modal.tsx` - Responsive modal

### 1.5 Display Components (Missing 2)
- `chart.tsx` - Chart components wrapper
- `calendar.tsx` - Calendar component

### 1.6 Utility Components (Missing 7)
- `toggle.tsx` - Toggle button
- `toggle-group.tsx` - Toggle button group
- `button-group.tsx` - Button group
- `field.tsx` - Form field wrapper
- `item.tsx` - List item
- `kbd.tsx` - Keyboard shortcut display
- `sortable-list.tsx` - Sortable list
- `data-table.tsx` - Data table
- `data-table-column-header.tsx` - Data table column header
- `data-table-pagination.tsx` - Data table pagination
- `theme-provider.tsx` - Theme provider

---

## 2. Missing Blocks (121 total)

### 2.1 Shell Blocks (Missing 0)
✅ `ApplicationShell01` - Already registered

### 2.2 Navigation Blocks (Missing 15)
- `app-sidebar-01.tsx` - App sidebar
- `collapsible-sidebar-01.tsx` - Collapsible sidebar
- `floating-sidebar-01.tsx` - Floating sidebar
- `docs-sidebar-01.tsx` - Documentation sidebar
- `submenu-sidebar-01.tsx` - Submenu sidebar
- `sidebar-calendars.tsx` - Sidebar with calendars
- `sidebar-opt-in-form.tsx` - Sidebar opt-in form
- `date-picker-sidebar.tsx` - Date picker sidebar
- `nav-dropdown.tsx` - Navigation dropdown
- `nav-favorites.tsx` - Navigation favorites
- `nav-main.tsx` - Main navigation
- `nav-projects.tsx` - Projects navigation
- `nav-secondary.tsx` - Secondary navigation
- `nav-user.tsx` - User navigation
- `nav-workspaces.tsx` - Workspaces navigation
- `team-switcher.tsx` - Team switcher
- `version-switcher.tsx` - Version switcher
- `site-header-01.tsx` - Site header
- `notification-center-01.tsx` - Notification center

### 2.3 Form Blocks (Missing 8)
- `forgot-password-form-01.tsx` - Forgot password form
- `reset-password-form-01.tsx` - Reset password form
- `magic-link-form-01.tsx` - Magic link form
- `otp-form-01.tsx` - OTP verification form
- `signup-form-01.tsx` - Signup form
- `login-form-01.tsx` - Login form
- `login-form-02.tsx` - Login form variant 2

### 2.4 Table Blocks (Missing 1)
✅ `DataFortress01` - Already registered
✅ `BulkActionBar01` - Already registered

### 2.5 Feedback Blocks (Missing 3)
✅ `EmptyState01` - Already registered
✅ `ErrorState01` - Already registered
- `skeleton-card-01.tsx` - Skeleton card
- `skeleton-form-01.tsx` - Skeleton form
- `skeleton-table-01.tsx` - Skeleton table

### 2.6 Dashboard Blocks (Missing 7)
✅ `StatCard01` - Already registered
- `dashboard-layout-01.tsx` - Dashboard layout
- `dashboard-dialog-01.tsx` - Dashboard dialog
- `dashboard-shell-01.tsx` - Dashboard shell
- `dashboard-header-01.tsx` - Dashboard header
- `widgets-01.tsx` - Dashboard widgets
- `stats-grid-01.tsx` - Stats grid
- `profile-card-01.tsx` - Profile card
- `section-cards-01.tsx` - Section cards

### 2.7 Auth Blocks (Missing 7)
- `login-with-image-01.tsx` - Login with image
- `login-email-only-01.tsx` - Email-only login

### 2.8 Chart Blocks (Missing 29)
- `activity-chart-01.tsx` - Activity chart
- `area-chart-01.tsx` - Area chart
- `area-chart-gradient-01.tsx` - Gradient area chart
- `area-chart-legend-01.tsx` - Area chart with legend
- `area-chart-step-01.tsx` - Step area chart
- `bar-chart-01.tsx` - Bar chart
- `bar-chart-active-01.tsx` - Active bar chart
- `bar-chart-interactive-01.tsx` - Interactive bar chart
- `bar-chart-multiple-01.tsx` - Multiple bar chart
- `donut-chart-01.tsx` - Donut chart
- `horizontal-bar-chart-01.tsx` - Horizontal bar chart
- `labeled-bar-chart-01.tsx` - Labeled bar chart
- `labeled-line-chart-01.tsx` - Labeled line chart
- `line-chart-01.tsx` - Line chart
- `line-chart-dots-01.tsx` - Line chart with dots
- `line-chart-multiple-01.tsx` - Multiple line chart
- `line-chart-step-01.tsx` - Step line chart
- `mixed-bar-chart-01.tsx` - Mixed bar chart
- `negative-bar-chart-01.tsx` - Negative bar chart
- `pie-chart-01.tsx` - Pie chart
- `pie-chart-legend-01.tsx` - Pie chart with legend
- `pie-chart-simple-01.tsx` - Simple pie chart
- `radar-chart-01.tsx` - Radar chart
- `radar-chart-dots-01.tsx` - Radar chart with dots
- `radar-chart-multiple-01.tsx` - Multiple radar chart
- `radial-chart-01.tsx` - Radial chart
- `radial-chart-stacked-01.tsx` - Stacked radial chart
- `stacked-area-chart-01.tsx` - Stacked area chart
- `stacked-bar-chart-01.tsx` - Stacked bar chart

### 2.9 Calendar Blocks (Missing 16)
- `calendar-bounded-01.tsx` - Bounded calendar
- `calendar-disabled-dates-01.tsx` - Calendar with disabled dates
- `calendar-disabled-weekends-01.tsx` - Calendar with disabled weekends
- `calendar-dropdown-01.tsx` - Calendar dropdown
- `calendar-localized-01.tsx` - Localized calendar
- `calendar-min-days-01.tsx` - Calendar with min days
- `calendar-multi-month-01.tsx` - Multi-month calendar
- `calendar-presets-01.tsx` - Calendar with presets
- `calendar-simple-01.tsx` - Simple calendar
- `calendar-time-range-01.tsx` - Time range calendar
- `calendar-week-numbers-01.tsx` - Calendar with week numbers
- `calendar-with-time-01.tsx` - Calendar with time
- `calendar-with-today-01.tsx` - Calendar with today
- `date-range-picker-01.tsx` - Date range picker
- `datetime-picker-01.tsx` - Datetime picker
- `natural-date-picker-01.tsx` - Natural date picker

### 2.10 Marketing Blocks (Missing 0)
✅ All marketing blocks appear to be documented but not in registry

### 2.11 Ecommerce Blocks (Missing 0)
✅ All ecommerce blocks appear to be documented but not in registry

### 2.12 ERP Blocks (Missing 0)
✅ All ERP blocks appear to be documented but not in registry

### 2.13 AFANDA Blocks (Missing 0)
✅ All AFANDA blocks appear to be documented but not in registry

### 2.14 Cobalt Blocks (Missing 0)
✅ All Cobalt blocks appear to be documented but not in registry

### 2.15 Quorum Blocks (Missing 0)
✅ All Quorum blocks appear to be documented but not in registry

### 2.16 Audit Blocks (Missing 0)
✅ All Audit blocks appear to be documented but not in registry

### 2.17 Grids Blocks (Missing 0)
✅ Bento grid appears to be documented but not in registry

### 2.18 Inputs Blocks (Missing 0)
✅ Combobox appears to be documented but not in registry

---

## 3. Recommended Actions

### Phase 1: Core Components (High Priority)
Add missing form and layout components that are fundamental:
1. `textarea`, `radio-group`, `slider`, `combobox`
2. `breadcrumb`, `collapsible`, `sheet`, `drawer`
3. `alert-dialog`, `popover`, `hover-card`
4. `calendar`, `chart`

### Phase 2: Utility Components (Medium Priority)
Add utility components for enhanced UX:
1. `toggle`, `toggle-group`, `button-group`
2. `data-table` and related components
3. `sonner`, `empty`
4. `theme-provider`

### Phase 3: Navigation Blocks (High Priority)
Add all navigation blocks for consistent navigation patterns:
1. All sidebar variants
2. Navigation components (`nav-*`)
3. Switchers and headers

### Phase 4: Chart Blocks (Medium Priority)
Add all chart blocks for data visualization:
1. All chart variants (29 total)
2. Categorize by chart type (area, bar, line, pie, radar, radial)

### Phase 5: Calendar Blocks (Medium Priority)
Add all calendar blocks for date/time selection:
1. All calendar variants (16 total)
2. Date pickers and range pickers

### Phase 6: Form & Auth Blocks (High Priority)
Add all form and auth blocks:
1. All auth forms (login, signup, password reset, OTP, magic link)
2. Multi-step forms and wizards

### Phase 7: Dashboard & Feedback Blocks (Low Priority)
Add remaining dashboard and feedback blocks:
1. Dashboard layouts and widgets
2. Skeleton loaders
3. Profile and section cards

---

## 4. Implementation Plan

### Step 1: Update Component Registry
File: `packages/axis-registry/src/schemas/ux/components.ts`

Add all 37 missing components to `COMPONENT_REGISTRY` array following the existing pattern.

### Step 2: Update Block Registry
File: `packages/axis-registry/src/schemas/ux/blocks.ts`

Add all 121 missing blocks to `BLOCK_REGISTRY_INPUT` array following the existing pattern.

### Step 3: Validation
Run validation to ensure all components and blocks are properly registered:
```bash
pnpm --filter @axis/registry validate
```

### Step 4: Codegen
Generate TypeScript types and Drizzle schemas:
```bash
pnpm --filter @axis/registry codegen
```

---

## 5. Notes

### Component Categories
Current categories are appropriate:
- `form` - Input controls
- `layout` - Layout containers
- `feedback` - User feedback
- `overlay` - Overlays and modals
- `display` - Display components
- `navigation` - Navigation components

### Block Categories
Current categories are appropriate:
- `shell` - Application shells
- `navigation` - Navigation patterns
- `form` - Form patterns
- `table` - Data table patterns
- `feedback` - Feedback patterns
- `dashboard` - Dashboard patterns
- `auth` - Authentication patterns

Consider adding:
- `chart` - Chart patterns
- `calendar` - Calendar/date patterns
- `marketing` - Marketing patterns
- `ecommerce` - Ecommerce patterns
- `erp` - ERP-specific patterns

### Persona Mapping
Ensure each component/block has correct persona mapping:
- `quorum: true/false` - Available in Quorum (SME)
- `cobalt: true/false` - Available in Cobalt (Enterprise)
- `recommended: "quorum" | "cobalt" | "both"` - Recommended persona

---

## 6. Verification Checklist

Before marking complete:
- [ ] All 37 missing components added to registry
- [ ] All 121 missing blocks added to registry
- [ ] All components have correct category
- [ ] All blocks have correct category
- [ ] All items have correct persona mapping
- [ ] All items have correct dependencies
- [ ] All items have correct source paths
- [ ] Validation passes (`pnpm validate`)
- [ ] Codegen passes (`pnpm codegen`)
- [ ] No TypeScript errors (`pnpm typecheck`)
