# help014-erp-module-roadmap.md

**Status:** SUPPORTING (Help)  
**Goal:** Define the complete ERP module catalog and implementation sequence.  
**Validated Against:** Odoo 19.0 (`.repo-odoo/`)

---

## 0) Implementation Philosophy

1. **Start with foundation, not features** — `erp.base` must be complete before any transaction module
2. **No accounting first** — Sales/Inventory/Purchase before Invoice, Invoice before Accounting
3. **Each module is shippable** — A module is "done" when it can be used standalone
4. **Dependencies are explicit** — No implicit coupling between modules

---

## 1) Complete Module Catalog

### Phase 1: Foundation (Must Complete First)

| Module | Purpose | Depends On |
|--------|---------|------------|
| `erp.base` | Core master data (Partners, Products, UoM, Sequences) | `core` (platform) |

### Phase 2: Transaction Modules

| Module | Purpose | Depends On |
|--------|---------|------------|
| `erp.sales` | Sales orders, quotations | `erp.base` |
| `erp.inventory` | Locations, stock moves, on-hand | `erp.base` |
| `erp.purchase` | Purchase orders, receiving | `erp.base`, `erp.inventory` |

### Phase 3: Financial Documents

| Module | Purpose | Depends On |
|--------|---------|------------|
| `erp.invoice` | Customer/vendor invoices | `erp.base`, `erp.sales`, `erp.purchase` |
| `erp.payment` | Payment recording, allocation | `erp.base`, `erp.invoice` |

### Phase 4: Accounting (Last)

| Module | Purpose | Depends On |
|--------|---------|------------|
| `erp.accounting` | Chart of accounts, journals, ledger | `erp.base`, `erp.invoice` |

### Future Phases (Not v0)

| Module | Purpose | Depends On |
|--------|---------|------------|
| `erp.manufacturing` | BOM, work orders, production | `erp.base`, `erp.inventory` |
| `erp.crm` | Leads, opportunities, pipeline | `erp.base` |
| `erp.hr` | Employees, contracts, leave | `erp.base` |
| `erp.assets` | Fixed assets, depreciation | `erp.base`, `erp.accounting` |
| `erp.reports` | Financial reports, dashboards | All modules |

---

## 1.1) Odoo Reference Mapping (Evidence)

Each AXIS module maps to specific Odoo modules. Use these as reference for domain patterns.

### erp.base → Odoo Sources

| Entity | Odoo Module | Path in `.repo-odoo/` |
|--------|-------------|----------------------|
| **Partner** | `base` | `odoo/addons/base/models/res_partner.py` |
| **Product** | `product` | `addons/product/models/product_product.py`, `product_template.py` |
| **UoM** | `uom` | `addons/uom/models/uom_uom.py` |
| **Sequence** | `base` | `odoo/addons/base/models/ir_sequence.py` |
| **Currency** | `base` | `odoo/addons/base/models/res_currency.py` |

**Odoo Dependency Chain:**
```
base (core)
  └── uom (depends: base)
        └── product (depends: base, mail, uom)
```

**Key Files to Study:**
- Partner fields: `odoo/addons/base/models/res_partner.py` (lines 1-80 for imports/mixins)
- Sequence logic: `odoo/addons/base/models/ir_sequence.py` (PostgreSQL sequence integration)
- UoM categories: `addons/uom/data/uom_data.xml` (default units seed data)

---

### erp.sales → Odoo Sources

| Entity | Odoo Module | Path in `.repo-odoo/` |
|--------|-------------|----------------------|
| **Sales Order** | `sale` | `addons/sale/models/sale_order.py` |
| **Sales Order Line** | `sale` | `addons/sale/models/sale_order_line.py` |

**Odoo Dependency Chain:**
```
sale (depends: sales_team, account_payment, utm)
  └── account_payment (depends: account, payment, portal)
```

**Manifest:** `addons/sale/__manifest__.py`
```python
'depends': ['sales_team', 'account_payment', 'utm']
```

**State Field (line 70-75 of sale_order.py):**
```python
SALE_ORDER_STATE = [
    ('draft', "Quotation"),
    ('sent', "Quotation Sent"),
    ('sale', "Sales Order"),
    ('cancel', "Cancelled"),
]
```

**Key Files:**
- Order model: `addons/sale/models/sale_order.py`
- Order line: `addons/sale/models/sale_order_line.py`
- Sequence data: `addons/sale/data/ir_sequence_data.xml`
- Security: `addons/sale/security/ir.model.access.csv`

---

### erp.inventory → Odoo Sources

| Entity | Odoo Module | Path in `.repo-odoo/` |
|--------|-------------|----------------------|
| **Location** | `stock` | `addons/stock/models/stock_location.py` |
| **Stock Move** | `stock` | `addons/stock/models/stock_move.py` |
| **Stock Quant** | `stock` | `addons/stock/models/stock_quant.py` |
| **Warehouse** | `stock` | `addons/stock/models/stock_warehouse.py` |

**Odoo Dependency Chain:**
```
stock (depends: product, barcodes_gs1_nomenclature, digest)
```

**Manifest:** `addons/stock/__manifest__.py`
```python
'depends': ['product', 'barcodes_gs1_nomenclature', 'digest']
```

**Key Files:**
- Move model: `addons/stock/models/stock_move.py` (2600+ lines - core inventory logic)
- Location model: `addons/stock/models/stock_location.py`
- Quant (on-hand): `addons/stock/models/stock_quant.py`
- Picking (transfer): `addons/stock/models/stock_picking.py`

**Important Pattern:** Odoo derives on-hand from `stock.quant` which is updated by `stock.move` posting.

---

### erp.purchase → Odoo Sources

| Entity | Odoo Module | Path in `.repo-odoo/` |
|--------|-------------|----------------------|
| **Purchase Order** | `purchase` | `addons/purchase/models/purchase_order.py` |
| **Purchase Order Line** | `purchase` | `addons/purchase/models/purchase_order_line.py` |

**Odoo Dependency Chain:**
```
purchase (depends: account)
```

**Manifest:** `addons/purchase/__manifest__.py`
```python
'depends': ['account']
```

**Key Files:**
- Order model: `addons/purchase/models/purchase_order.py`
- Order line: `addons/purchase/models/purchase_order_line.py`
- Product extensions: `addons/purchase/models/product.py`

**Note:** Odoo `purchase` depends on `account` (invoicing). AXIS separates these for flexibility.

---

### erp.invoice → Odoo Sources

| Entity | Odoo Module | Path in `.repo-odoo/` |
|--------|-------------|----------------------|
| **Invoice (Account Move)** | `account` | `addons/account/models/account_move.py` |
| **Invoice Line** | `account` | `addons/account/models/account_move_line.py` |

**Odoo Dependency Chain:**
```
account (depends: base_setup, onboarding, product, analytic, portal, digest)
```

**Manifest:** `addons/account/__manifest__.py`
```python
'depends': ['base_setup', 'onboarding', 'product', 'analytic', 'portal', 'digest']
```

**Key Files:**
- Invoice model: `addons/account/models/account_move.py` (unified invoice/journal entry)
- Invoice line: `addons/account/models/account_move_line.py`
- Payment: `addons/account/models/account_payment.py`

**Important Pattern:** Odoo unified invoices and journal entries into `account.move`. AXIS separates invoice (erp.invoice) from journal entries (erp.accounting).

---

### erp.payment → Odoo Sources

| Entity | Odoo Module | Path in `.repo-odoo/` |
|--------|-------------|----------------------|
| **Payment** | `account_payment` | `addons/account_payment/models/account_payment.py` |
| **Payment Transaction** | `account_payment` | `addons/account_payment/models/payment_transaction.py` |

**Key Files:**
- Payment model: `addons/account_payment/models/account_payment.py`
- Payment register wizard: `addons/account_payment/wizards/account_payment_register.py`

---

### erp.accounting → Odoo Sources

| Entity | Odoo Module | Path in `.repo-odoo/` |
|--------|-------------|----------------------|
| **Account** | `account` | `addons/account/models/account_account.py` |
| **Journal** | `account` | `addons/account/models/account_journal.py` |
| **Journal Entry** | `account` | `addons/account/models/account_move.py` |
| **Tax** | `account` | `addons/account/models/account_tax.py` |

**Key Files:**
- Account (COA): `addons/account/models/account_account.py`
- Journal: `addons/account/models/account_journal.py`
- Move (entry): `addons/account/models/account_move.py`
- Reconciliation: `addons/account/models/account_partial_reconcile.py`

---

### Security Patterns → Odoo Sources

Every Odoo module has security files:

| Pattern | Path Example |
|---------|--------------|
| **Model Access (ACL)** | `addons/sale/security/ir.model.access.csv` |
| **Record Rules (RLS)** | `addons/sale/security/ir_rules.xml` |
| **Groups** | `addons/sale/security/res_groups.xml` |

**Example ACL (sale):**
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_sale_order_user,sale.order.user,model_sale_order,sales_team.group_sale_salesman,1,1,1,0
access_sale_order_manager,sale.order.manager,model_sale_order,sales_team.group_sale_manager,1,1,1,1
```

---

## 2) Implementation Sequence (v0)

### Sequence Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PHASE 1                                  │
│  ┌──────────────┐                                               │
│  │  erp.base    │  Partners, Products, UoM, Sequences           │
│  └──────┬───────┘                                               │
│         │                                                        │
└─────────┼───────────────────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────────────────┐
│         │              PHASE 2                                   │
│         ▼                                                        │
│  ┌──────────────┐     ┌──────────────┐                          │
│  │  erp.sales   │     │erp.inventory │                          │
│  └──────┬───────┘     └──────┬───────┘                          │
│         │                    │                                   │
│         │             ┌──────▼───────┐                          │
│         │             │ erp.purchase │                          │
│         │             └──────┬───────┘                          │
│         │                    │                                   │
└─────────┼────────────────────┼──────────────────────────────────┘
          │                    │
┌─────────┼────────────────────┼──────────────────────────────────┐
│         │    PHASE 3         │                                   │
│         ▼                    ▼                                   │
│  ┌─────────────────────────────────┐                            │
│  │         erp.invoice             │                            │
│  └──────────────┬──────────────────┘                            │
│                 │                                                │
│                 ▼                                                │
│  ┌─────────────────────────────────┐                            │
│  │         erp.payment             │                            │
│  └──────────────┬──────────────────┘                            │
│                 │                                                │
└─────────────────┼───────────────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│                 │    PHASE 4                                     │
│                 ▼                                                │
│  ┌─────────────────────────────────┐                            │
│  │       erp.accounting            │                            │
│  └─────────────────────────────────┘                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3) Module Details

### 3.1 erp.base (Phase 1)

**Priority:** P0 — Must complete first  
**Estimated Scope:** Foundation for all ERP  
**Odoo Reference:** `odoo/addons/base/`, `addons/product/`, `addons/uom/`

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Partner | `erp_partners` | Customers, vendors, contacts |
| Product | `erp_products` | Goods and services |
| UoM | `erp_uoms` | Units of measure |
| Sequence | `erp_sequences` | Document numbering |
| Currency | `erp_currencies` | Currency reference (optional global) |

#### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/erp/base/partners` | GET, POST | List/create partners |
| `/api/erp/base/partners/[id]` | GET, PATCH, DELETE | Get/update/deactivate partner |
| `/api/erp/base/products` | GET, POST | List/create products |
| `/api/erp/base/products/[id]` | GET, PATCH, DELETE | Get/update/deactivate product |
| `/api/erp/base/uoms` | GET, POST | List/create UoMs |

#### Completion Criteria

- [ ] All tables created with tenant isolation
- [ ] Zod contracts for all entities
- [ ] CRUD API routes working
- [ ] Sequence service generating doc numbers
- [ ] Tenant seed function for defaults (UoMs, sequences)
- [ ] 2+ invariant tests passing
- [ ] `pnpm check:erp` passing

---

### 3.2 erp.sales (Phase 2)

**Priority:** P1  
**Depends On:** `erp.base`  
**Odoo Reference:** `addons/sale/models/sale_order.py`, `sale_order_line.py`

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Sales Order | `erp_sales_orders` | Order header |
| Sales Order Line | `erp_sales_order_lines` | Order line items |

#### Workflow

```
DRAFT → SUBMITTED → APPROVED → POSTED → (VOID)
                 ↘ REJECTED
```

#### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/erp/sales/orders` | GET, POST | List/create orders |
| `/api/erp/sales/orders/[id]` | GET, PATCH | Get/update order |
| `/api/erp/sales/orders/[id]/submit` | POST | Submit for approval |
| `/api/erp/sales/orders/[id]/approve` | POST | Approve order |
| `/api/erp/sales/orders/[id]/reject` | POST | Reject order |
| `/api/erp/sales/orders/[id]/post` | POST | Post order |
| `/api/erp/sales/orders/[id]/void` | POST | Void order |

#### Side Effects (on POST)

- Create stock moves (if `erp.inventory` installed)
- Create invoice draft (if `erp.invoice` installed)

#### Completion Criteria

- [ ] Order + Lines tables with tenant isolation
- [ ] Workflow transitions with explicit state machine
- [ ] All API routes working
- [ ] Audit events emitted on transitions
- [ ] Permission checks in services
- [ ] 2+ invariant tests (workflow, tenant isolation)

---

### 3.3 erp.inventory (Phase 2)

**Priority:** P1  
**Depends On:** `erp.base`  
**Odoo Reference:** `addons/stock/models/stock_move.py`, `stock_location.py`, `stock_quant.py`

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Location | `erp_locations` | Warehouse locations |
| Stock Move | `erp_stock_moves` | Inventory movements |
| Stock On-Hand | `erp_stock_onhand` | Current quantities (derived/materialized) |

#### Workflow (Stock Move)

```
DRAFT → POSTED → (REVERSED)
```

#### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/erp/inventory/locations` | GET, POST | List/create locations |
| `/api/erp/inventory/moves` | GET, POST | List/create moves |
| `/api/erp/inventory/moves/[id]` | GET | Get move |
| `/api/erp/inventory/moves/[id]/post` | POST | Post move (update on-hand) |
| `/api/erp/inventory/moves/[id]/reverse` | POST | Reverse move |
| `/api/erp/inventory/onhand` | GET | Get on-hand quantities |

#### Key Principle

**Inventory truth comes from moves, not manual edits.**  
On-hand is always derivable from posted moves.

#### Completion Criteria

- [ ] Location + Move tables with tenant isolation
- [ ] On-hand calculation (derived or materialized view)
- [ ] Move posting updates quantities correctly
- [ ] Reversals work correctly
- [ ] 2+ invariant tests (balance, reversal)

---

### 3.4 erp.purchase (Phase 2)

**Priority:** P2  
**Depends On:** `erp.base`, `erp.inventory`  
**Odoo Reference:** `addons/purchase/models/purchase_order.py`, `purchase_order_line.py`

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Purchase Order | `erp_purchase_orders` | PO header |
| Purchase Order Line | `erp_purchase_order_lines` | PO line items |
| Receipt | `erp_purchase_receipts` | Goods receipt records |

#### Workflow

```
DRAFT → SUBMITTED → APPROVED → POSTED → RECEIVED → (VOID)
                 ↘ REJECTED
```

#### Side Effects (on RECEIVE)

- Create stock moves (inbound to location)

#### Completion Criteria

- [ ] PO + Lines tables with tenant isolation
- [ ] Workflow transitions
- [ ] Receiving creates stock moves
- [ ] Audit events on transitions
- [ ] 2+ invariant tests

---

### 3.5 erp.invoice (Phase 3)

**Priority:** P2  
**Depends On:** `erp.base`, `erp.sales`, `erp.purchase`  
**Odoo Reference:** `addons/account/models/account_move.py` (invoices are `account.move` with `move_type`)

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Invoice | `erp_invoices` | Invoice header (customer or vendor) |
| Invoice Line | `erp_invoice_lines` | Invoice line items |

#### Workflow

```
DRAFT → POSTED → PAID → (VOID)
```

#### Invoice Types

| Type | Direction | Created From |
|------|-----------|--------------|
| `CUSTOMER` | Receivable | Sales Order |
| `VENDOR` | Payable | Purchase Order |
| `CREDIT_NOTE` | Adjustment | Manual or return |

#### Completion Criteria

- [ ] Invoice + Lines tables
- [ ] Link to source documents (SO, PO)
- [ ] Workflow with posting
- [ ] Totals calculation (subtotal, tax, total)
- [ ] Audit events

---

### 3.6 erp.payment (Phase 3)

**Priority:** P3  
**Depends On:** `erp.base`, `erp.invoice`  
**Odoo Reference:** `addons/account_payment/models/account_payment.py`

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Payment | `erp_payments` | Payment record |
| Payment Allocation | `erp_payment_allocations` | Allocation to invoices |

#### Workflow

```
DRAFT → POSTED → (VOID)
```

#### Completion Criteria

- [ ] Payment + Allocation tables
- [ ] Allocate payment to invoice(s)
- [ ] Update invoice paid status
- [ ] Overpayment handling (credit)

---

### 3.7 erp.accounting (Phase 4)

**Priority:** P4 — Last  
**Depends On:** `erp.base`, `erp.invoice`  
**Odoo Reference:** `addons/account/models/account_account.py`, `account_journal.py`, `account_move.py`

#### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| Account | `erp_accounts` | Chart of accounts |
| Journal | `erp_journals` | Journal types |
| Journal Entry | `erp_journal_entries` | Entry header |
| Journal Entry Line | `erp_journal_entry_lines` | Debit/credit lines |

#### Key Principle

**Accounting entries are created by posting other documents.**  
- Invoice POST → Journal entry (AR/AP + Revenue/Expense)
- Payment POST → Journal entry (Cash + AR/AP)
- Stock Move POST → Journal entry (Inventory + COGS) — if perpetual

#### Completion Criteria

- [ ] Chart of accounts with account types
- [ ] Journal entry creation from source documents
- [ ] Debit = Credit validation
- [ ] Trial balance query
- [ ] Period close capability

---

## 4) Dependency Graph (Simplified)

```
                    ┌────────┐
                    │  core  │ (platform)
                    └───┬────┘
                        │
                    ┌───▼────┐
                    │erp.base│
                    └───┬────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼────┐     ┌────▼─────┐         │
    │erp.sales│    │erp.inventory│       │
    └───┬────┘     └────┬─────┘         │
        │               │               │
        │          ┌────▼─────┐         │
        │          │erp.purchase│        │
        │          └────┬─────┘         │
        │               │               │
        └───────┬───────┘               │
                │                       │
          ┌─────▼─────┐                 │
          │erp.invoice│                 │
          └─────┬─────┘                 │
                │                       │
          ┌─────▼─────┐                 │
          │erp.payment│                 │
          └─────┬─────┘                 │
                │                       │
          ┌─────▼──────┐                │
          │erp.accounting│◄─────────────┘
          └────────────┘
```

---

## 5) Implementation Checklist by Phase

### Phase 1: Foundation

| Step | Task | Status |
|------|------|--------|
| 1.1 | Implement `pnpm check:erp` quality gate | ⛔ |
| 1.2 | Create audit table (`erp_audit_events`) | ⛔ |
| 1.3 | Implement AuditService | ⛔ |
| 1.4 | Create `erp.base` manifest | ⛔ |
| 1.5 | Create Partners table + service + routes | ⛔ |
| 1.6 | Create Products table + service + routes | ⛔ |
| 1.7 | Create UoMs table + seed data | ⛔ |
| 1.8 | Create Sequences table + service | ⛔ |
| 1.9 | Create tenant seeding function | ⛔ |
| 1.10 | Add invariant tests for erp.base | ⛔ |
| 1.11 | Verify `pnpm check:erp` passes | ⛔ |

### Phase 2: Transactions

| Step | Task | Status |
|------|------|--------|
| 2.1 | Create `erp.sales` manifest | ⛔ |
| 2.2 | Create Sales Order + Lines tables | ⛔ |
| 2.3 | Implement workflow transitions | ⛔ |
| 2.4 | Create Sales Order routes | ⛔ |
| 2.5 | Add audit emission | ⛔ |
| 2.6 | Add invariant tests | ⛔ |
| 2.7 | Create `erp.inventory` manifest | ⛔ |
| 2.8 | Create Location + Move tables | ⛔ |
| 2.9 | Implement on-hand calculation | ⛔ |
| 2.10 | Create Inventory routes | ⛔ |
| 2.11 | Add invariant tests | ⛔ |
| 2.12 | Create `erp.purchase` manifest | ⛔ |
| 2.13 | Create PO + Lines + Receipt tables | ⛔ |
| 2.14 | Link receiving to stock moves | ⛔ |
| 2.15 | Add invariant tests | ⛔ |

### Phase 3: Financial Documents

| Step | Task | Status |
|------|------|--------|
| 3.1 | Create `erp.invoice` manifest | ⛔ |
| 3.2 | Create Invoice + Lines tables | ⛔ |
| 3.3 | Link to source documents | ⛔ |
| 3.4 | Implement invoice workflow | ⛔ |
| 3.5 | Add invariant tests | ⛔ |
| 3.6 | Create `erp.payment` manifest | ⛔ |
| 3.7 | Create Payment + Allocation tables | ⛔ |
| 3.8 | Implement payment allocation | ⛔ |
| 3.9 | Add invariant tests | ⛔ |

### Phase 4: Accounting

| Step | Task | Status |
|------|------|--------|
| 4.1 | Create `erp.accounting` manifest | ⛔ |
| 4.2 | Create Account + Journal tables | ⛔ |
| 4.3 | Create Journal Entry tables | ⛔ |
| 4.4 | Auto-create entries from invoice posting | ⛔ |
| 4.5 | Implement trial balance | ⛔ |
| 4.6 | Add invariant tests (debit = credit) | ⛔ |

---

## 6) Module "Done" Definition

A module is **DONE** when:

1. **Manifest exists** with id, version, dependsOn, register
2. **Tables exist** with tenant_id, audit columns, proper constraints
3. **Zod contracts exist** for all inputs/outputs
4. **API routes exist** and are spec-only
5. **Services exist** with permission checks
6. **Audit events emit** on all state changes
7. **Invariant tests pass** (minimum 2)
8. **`pnpm check:erp` passes** for this module
9. **Documentation updated** (if new patterns introduced)

---

## 7) What's Out of Scope (v0)

These are explicitly deferred:

| Feature | Why Deferred |
|---------|--------------|
| Manufacturing/BOM | Complex, not needed for basic ERP |
| CRM/Leads | Different domain, lower priority |
| HR/Payroll | Different domain, regulatory complexity |
| Multi-warehouse optimization | Optimization before foundation |
| Complex costing (FIFO/AVCO) | Accounting complexity |
| Multi-company/consolidation | Adds tenant complexity |
| Subscription billing | Different model |
| eCommerce integration | External integration |

---

## 8) Summary

| Phase | Modules | Priority |
|-------|---------|----------|
| 1 | `erp.base` | P0 — Start here |
| 2 | `erp.sales`, `erp.inventory`, `erp.purchase` | P1/P2 |
| 3 | `erp.invoice`, `erp.payment` | P2/P3 |
| 4 | `erp.accounting` | P4 — Last |

**Total v0 modules:** 7  
**Implementation order is strict:** Complete each phase before starting the next.

---

**End of Doc**
