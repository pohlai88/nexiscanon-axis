# E02-13: ERP Domain Blocks
## AR/AP, Inventory, GL Components

> **Version:** 1.0.0 | **Last Updated:** 2026-01-23
> **Status:** ✅ Fully Implemented | **Priority:** 🔴 HIGH
> **Canonical Reference:** [A01-CANONICAL.md §3 — Three Pillars](./A01-CANONICAL.md)

### Implementation Summary
| Component | Status | Location |
|-----------|--------|----------|
| AR Aging Table | ✅ | `blocks/erp/ar-aging-table.tsx` |
| AP Aging Table | ✅ | `blocks/erp/ap-aging-table.tsx` |
| Inventory Valuation Card | ✅ | `blocks/erp/inventory-valuation-card.tsx` |
| Trial Balance Table | ✅ | `blocks/erp/trial-balance-table.tsx` |
| Reconciliation Widget | ✅ | `blocks/erp/reconciliation-widget.tsx` |

---

## Overview

> **The Three Pillars:** Money, Goods, Obligations

Implements domain-specific ERP components for:
- **Money** — Do the books balance? (GL, Trial Balance)
- **Goods** — Does stock match records? (Inventory Valuation)
- **Obligations** — Who owes whom? (AR/AP Aging)

---

## Planned Components (From A01 §3)

### 1. AR Aging Table

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/erp/ar-aging-table.tsx`

**Features Implemented:**
- Aging buckets (Current, 30, 60, 90, 90+)
- Summary cards with totals
- Customer drill-down (expandable rows)
- Sortable columns
- Risk indicators
- Trend indicators
- Export functionality (CSV, Excel, PDF)

**Purpose:** Accounts Receivable aging analysis.

**Features:**
- Aging buckets (Current, 30, 60, 90, 90+)
- Customer drill-down
- Total outstanding
- Payment status
- Overdue alerts

---

### 2. AP Aging Table

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/erp/ap-aging-table.tsx`

**Features Implemented:**
- Aging buckets (Current, 30, 60, 90, 90+)
- Summary cards with totals
- Payment scheduling with multi-select
- Discount opportunity badges with countdown
- Cash flow projection display
- Payment method indicators
- Priority badges

**Purpose:** Accounts Payable aging analysis.

**Features:**
- Aging buckets
- Supplier drill-down
- Payment due dates
- Priority indicators
- Batch payment

---

### 3. Inventory Valuation Card

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/erp/inventory-valuation-card.tsx`

**Features Implemented:**
- On-hand quantity with stock level indicators
- Unit cost and total valuation display
- Costing method badge (FIFO/LIFO/Weighted Avg/Standard)
- Stock progress bar with reorder point
- Turnover rate and days of stock
- Alert badges (reorder/overstock/slow-moving/expired)
- Grid component for multiple items

**Purpose:** Stock valuation and costing method display.

**Features:**
- On-hand quantity
- Valuation amount (FIFO/Weighted Avg)
- Cost per unit
- Valuation method indicator
- Movement history link

---

### 4. Trial Balance Table

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/erp/trial-balance-table.tsx`

**Features Implemented:**
- Debit/Credit columns with balance calculation
- Account type badges (Asset/Liability/Equity/Revenue/Expense)
- Hierarchical account display with collapsible rows
- Period comparison with variance
- Balance verification status (balanced/out of balance)
- Export functionality

**Purpose:** General Ledger trial balance.

**Features:**
- Account hierarchy
- Debit/Credit columns
- Balance verification (Debits = Credits)
- Period selection
- Export to Excel

---

### 5. Reconciliation Widget

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/erp/reconciliation-widget.tsx`

**Features Implemented:**
- Side-by-side subledger ↔ GL comparison
- Difference highlighting with status badges
- Reconciliation progress bar
- Auto-match suggestions with AI
- Bulk reconcile actions
- Drill-down to transactions

**Purpose:** Show subledger ↔ GL reconciliation gaps.

**Features:**
- Subledger total
- GL total
- Difference highlighting
- Drill-down to discrepancies
- Reconciliation status

---

## Implementation Timeline

- **Weeks 1-2:** AR Aging Table
- **Weeks 3-4:** AP Aging Table
- **Weeks 5-6:** Inventory Valuation Card
- **Weeks 7-8:** Trial Balance Table
- **Weeks 9-10:** Reconciliation Widget

---

## References

- [A01-CANONICAL.md §3 — Three Pillars](./A01-CANONICAL.md)
- [B07-ACCOUNTING.md](./B07-ACCOUNTING.md) (Future)
- [B06-INVENTORY.md](./B06-INVENTORY.md) (Future)
