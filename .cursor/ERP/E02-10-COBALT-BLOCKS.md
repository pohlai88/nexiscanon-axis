# E02-10: Cobalt Kernel UI Blocks
## Execution & Speed Components for Blue-Collar Users

> **Version:** 1.0.0 | **Last Updated:** 2026-01-23
> **Status:** ✅ Fully Implemented | **Priority:** 🔴 HIGH
> **Canonical Reference:** [A01-CANONICAL.md §4 — Dual-Kernel (Cobalt)](./A01-CANONICAL.md)

### Implementation Summary
| Component | Status | Location |
|-----------|--------|----------|
| SUMMIT Button | ✅ | `blocks/cobalt/summit-button.tsx` |
| Predictive Form | ✅ | `blocks/cobalt/predictive-form.tsx` |
| CRUD-SAP Interface | ✅ | `blocks/cobalt/crud-sap-interface.tsx` |
| Autofill Engine | ✅ | `blocks/cobalt/autofill-engine.tsx` |

---

## Overview

> *"I need to GET IT DONE" — Execution, Speed, Accuracy*

The **Cobalt Kernel** serves blue-collar users (Warehouse staff, Cashiers, Clerks, Data Entry Operators, Field Sales) who need:
- **Speed** — Don't make me type/click twice
- **Simplicity** — One button solves it
- **Prediction** — Know what I need next
- **Search** — Find before I ask
- **Audit** — Track without interrupting flow

**Design Mantra:** "One tap, done"

---

## Planned Components (From A01 §4)

### 1. SUMMIT Button Pattern

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/cobalt/summit-button.tsx`

**Preset Components:**
- `SUMMITPostInvoice` — Post invoice with full workflow
- `SUMMITApproveAll` — Batch approval
- `SUMMITReceiveStock` — Inventory receipt
- `SUMMITClosePeriod` — Fiscal period closing

**Purpose:** Single-action workflows (entire transaction in one click).

**Examples:**
- `<SUMMITButton.PostInvoice />` — Validate → Post → Email → Update AR
- `<SUMMITButton.ReceiveStock />` — Scan barcode → Create movement → Update inventory
- `<SUMMITButton.ApproveAll />` — Batch approve all pending items

**Features:**
- Pre-validation
- Progress indicators
- Rollback on error
- Success confetti
- Audit trail automatic

---

### 2. CRUD-SAP Interface

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/cobalt/crud-sap-interface.tsx`

**Features Implemented:**
- Unified CRUD operations with data table
- Global search-first navigation
- Inline cell editing
- Bulk selection and delete
- AI-powered predicted actions bar
- Pagination with server-side support
- Audit log access per row

**CRUD-SAP = Create, Read, Update, Delete, Search, Audit, Predict**

**Components:**
- `<CRUDSAPTable />` — Data table with inline actions
- `<SearchFirst />` — Global search before navigation
- `<AuditLog />` — Invisible automatic tracking
- `<PredictNext />` — Suggested next action

---

### 3. Predictive Form

> **Priority:** 🔴 HIGH | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/cobalt/predictive-form.tsx`

**Features Implemented:**
- Smart field suggestions based on AI/history
- Confidence indicators for predictions
- One-click accept/reject suggestions
- "Accept All Suggestions" bulk action
- Auto-accept for high-confidence predictions
- Preset form configurations (Invoice, PO, Expense)

**Purpose:** Forms that predict and autofill based on patterns.

**Features:**
- Smart defaults from last entry
- Template-based prefill
- Recent items suggestions
- Keyboard shortcuts (Tab through)
- Minimal required fields

---

### 4. Autofill Engine

> **Priority:** 🟡 MEDIUM | **Status:** ✅ Implemented

**Location:** `packages/design-system/src/blocks/cobalt/autofill-engine.tsx`

**Purpose:** Context-aware field population.

**Features Implemented:**
- Context-aware field suggestions
- Confidence indicators (0-100%)
- Source badges (history/related/ai/default/pattern)
- Alternative value suggestions
- Apply single or all suggestions
- Dismiss functionality
- useAutofill hook for integration
- Low confidence warnings

**Logic:**
- Last customer → autofill ship-to address
- Item selected → autofill price, tax, UOM
- Pattern detection → suggest next line items

---

## Implementation Timeline

- **Weeks 1-2:** SUMMIT Button patterns
- **Weeks 3-4:** CRUD-SAP interface
- **Weeks 5-6:** Predictive Form
- **Weeks 7-8:** Autofill Engine

---

## References

- [A01-CANONICAL.md §4 — Cobalt Kernel](./A01-CANONICAL.md)
- [E01-DESIGN-SYSTEM.md](./E01-DESIGN-SYSTEM.md)
