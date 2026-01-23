# D00 — Gap Analysis & Extension Roadmap
## Tightening AXIS Against Industry ERP Standards

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

| D-Series (Extensions) |                          |                                     |                            |
| :-------------------: | :----------------------: | :---------------------------------: | :------------------------: |
|       **[D00]**       | [D01](./D01-CURRENCY.md) | [D02](./D02-BANK-RECONCILIATION.md) | [D03](./D03-TAX-ENGINE.md) |
|     Gap Analysis      |      Multi-Currency      |         Bank Reconciliation         |         Tax Engine         |

---

> **Purpose:** Track critical gaps identified by comparing AXIS ERP architecture against industry-standard ERP implementations (Odoo, ERPNext, SAP, NetSuite).
>
> **Reference:**
> - [Odoo GitHub Repository](https://github.com/odoo/odoo) — 48.6k stars, Python/JS
> - [ERPNext GitHub Repository](https://github.com/frappe/erpnext) — 31.2k stars, Python/JS (Frappe Framework)
> - [Odoo Documentation](https://github.com/odoo/documentation)

---

## 🏛️ AXIS Domain Mantras & Institutional Anchors

> **AXIS Rule:** Every domain must be anchored to an *external truth authority* (law / institution / standard), not internal preference.

### The AXIS Super Mantra

> *"AXIS is not an ERP. AXIS is a truth engine: it balances money, goods, and obligations — then proves it during migration."*

### Domain Mantra Reference

| Domain            | Mantra                                             | Institutional Anchor                    |
| ----------------- | -------------------------------------------------- | --------------------------------------- |
| **Accounting**    | *"If it doesn't balance, it doesn't exist."*       | IFRS (IASB) + KPMG Audit Methodology    |
| **Inventory**     | *"Physical truth must equal financial truth."*     | Deloitte Supply Chain Controls          |
| **Sales**         | *"Revenue is earned, not hoped."*                  | IFRS 15 + PwC Revenue Assurance         |
| **Purchase**      | *"No receipt, no bill. No PO, no payment."*        | COSO Internal Controls + EY Procurement |
| **MDM**           | *"One thing must have one identity."*              | IBM MDM Model                           |
| **Tax**           | *"Tax is computation, not decoration."*            | Big 4 Tax Practice (Deloitte/KPMG)      |
| **Currency**      | *"Currency is risk; revaluation is truth."*        | IFRS IAS 21 Foreign Exchange            |
| **Bank Recon**    | *"Cash is only real when the bank agrees."*        | ACCA/CPA Audit Standards                |
| **Fixed Assets**  | *"Assets decay; depreciation is mandatory truth."* | IFRS IAS 16 PPE                         |
| **Budgeting**     | *"Budget is intent. Variance is governance."*      | McKinsey/Bain CFO Playbooks             |
| **Consolidation** | *"Group truth requires elimination truth."*        | IFRS 10 Consolidated FS                 |
| **Manufacturing** | *"Work-in-progress is money in motion."*           | Toyota Production System + APICS        |
| **Projects**      | *"Time is inventory. Delivery is revenue."*        | PMI Standards                           |
| **HR Core**       | *"People are cost centers with contracts."*        | SHRM Best Practices                     |
| **Cash Flow**     | *"Profit is opinion. Cash is survival."*           | Deloitte CFO Insights                   |

---

## 🛑 DEV NOTE: Respect @axis/registry & The Machine

> **ALL DEVELOPERS MUST READ THIS BEFORE WRITING ANY CODE**

All D-series extensions follow the same **Single Source of Truth** pattern established in [A02-AXIS-MAP.md](./A02-AXIS-MAP.md):

| Rule   | Description                                                   |
| ------ | ------------------------------------------------------------- |
| **R1** | All Zod schemas live in `@axis/registry/schemas/{domain}/`    |
| **R2** | Drizzle tables import types from `@axis/registry`             |
| **R3** | Events defined in `@axis/registry/schemas/events/{domain}.ts` |
| **R4** | D-series extends B-series; never duplicates                   |

---

## 1) Gap Analysis Methodology

### 1.1 Analysis Date

| Field             | Value                      |
| ----------------- | -------------------------- |
| **Analysis Date** | 2026-01-22                 |
| **Benchmarks**    | Odoo 19.0, ERPNext v16.1.0 |
| **Scope**         | Core ERP Modules           |

### 1.2 Benchmarking Sources

| Source                                              | Stars | Purpose                        |
| --------------------------------------------------- | ----- | ------------------------------ |
| [Odoo GitHub](https://github.com/odoo/odoo)         | 48.6k | Module structure, data models  |
| [ERPNext GitHub](https://github.com/frappe/erpnext) | 31.2k | SMB-focused ERP, manufacturing |
| [Odoo Docs](https://github.com/odoo/documentation)  | 1.1k  | Functional specifications      |
| Industry Best Practices                             | —     | SAP, NetSuite patterns         |

### 1.3 ERPNext Module Structure

ERPNext organizes functionality into these core modules (from [frappe/erpnext](https://github.com/frappe/erpnext)):

| Module              | ERPNext Coverage                          | AXIS Coverage   |
| ------------------- | ----------------------------------------- | --------------- |
| **Accounts**        | GL, AR/AP, Bank Recon, Budget, Multi-Curr | ⚠️ Partial       |
| **Stock**           | Warehouse, Valuation, Serial/Batch        | ✅ B06           |
| **Selling**         | Quotation → Invoice → Payment             | ✅ B04           |
| **Buying**          | PR → PO → Receipt → Bill                  | ✅ B05           |
| **Manufacturing**   | BOM, Work Order, Subcontracting           | ❌ Missing       |
| **Assets**          | Depreciation, Movement, Disposal          | ❌ Missing       |
| **Projects**        | Tasks, Timesheets, Costing                | ❌ Missing       |
| **HR**              | Employee, Payroll, Leave, Expense         | ❌ Missing       |
| **CRM**             | Lead, Opportunity, Campaign               | ❌ Missing       |
| **Support**         | Issue, Warranty, SLA                      | ⚠️ Partial (B11) |
| **Quality**         | Inspection, Quality Procedure             | ❌ Missing       |
| **Subcontracting**  | Service Outsourcing                       | ❌ Missing       |
| **Loan Management** | Loan, Disbursement, Repayment             | ❌ Missing       |

---

## 2) Domain Best Practices (Institutional Grade)

Each gap is anchored to an institutional reference — the "gold standard" that defines what good looks like.

---

### 2.0 Existing B-Series (Covered — Best Practice Reference)

#### 2.0.1 Accounting (B07)

**Mantra:** *"If it doesn't balance, it doesn't exist."*

| Best Practice            | Description                                  |
| ------------------------ | -------------------------------------------- |
| Double-entry always      | Dr = Cr, no exceptions                       |
| Immutable postings       | Corrections via reversal, never modification |
| Period close controls    | OPEN → SOFT_CLOSE → HARD_CLOSE               |
| Trial Balance checkpoint | Single source of accounting truth            |

**Institutional Reference:** **IFRS (IASB)** + **KPMG Audit Methodology**

---

#### 2.0.2 Inventory (B06)

**Mantra:** *"Physical truth must equal financial truth."*

| Best Practice                 | Description                             |
| ----------------------------- | --------------------------------------- |
| Stock move = valuation impact | Every move creates financial entry      |
| Deterministic costing         | FIFO / Weighted Avg must be predictable |
| Lot/serial traceability       | Audit + recall readiness                |
| Qty × Cost = GL               | Inventory value must tie to GL balance  |

**Institutional Reference:** **Deloitte Supply Chain / Inventory Controls**

---

#### 2.0.3 Sales (B04)

**Mantra:** *"Revenue is earned, not hoped."*

| Best Practice             | Description                             |
| ------------------------- | --------------------------------------- |
| Quote ≠ revenue           | Only posted invoice creates AR          |
| Revenue recognition       | Tied to delivery/performance obligation |
| AR aging                  | Operational heartbeat of collections    |
| Credit limits + approvals | Prevent bad debt drift                  |

**Institutional Reference:** **IFRS 15 Revenue Recognition** + **PwC Revenue Assurance**

---

#### 2.0.4 Purchase (B05)

**Mantra:** *"No receipt, no bill. No PO, no payment."*

| Best Practice          | Description                                 |
| ---------------------- | ------------------------------------------- |
| 3-way match            | PO ↔ Receipt ↔ Bill                         |
| Vendor master controls | Approval gates for new suppliers            |
| GRN accrual            | Goods received not invoiced must be tracked |
| Duplicate prevention   | Prevent duplicate invoices & fraud          |

**Institutional Reference:** **COSO Internal Controls** + **EY Procurement Controls**

---

#### 2.0.5 MDM (B03)

**Mantra:** *"One thing must have one identity."*

| Best Practice            | Description                            |
| ------------------------ | -------------------------------------- |
| Alias resolution         | Apple/APPLE/apples → same entity       |
| Canonical registry       | Strict naming + codes + categories     |
| Lifecycle control        | draft → approved → active → deprecated |
| No free-text identifiers | Core master data must be controlled    |

**Institutional Reference:** **IBM Master Data Management (MDM) Model**

---

## 3) Critical Gaps (🔴 P0 — Must Have)

These gaps represent **core ERP functionality** that is missing or severely underspecified. Without these, AXIS cannot claim to be a complete Business Truth Engine.

### 3.1 Multi-Currency (D01)

**Mantra:** *"Currency is risk; revaluation is truth."*

| Best Practice                  | Description                          |
| ------------------------------ | ------------------------------------ |
| Document + functional currency | Always store both on transactions    |
| FX rates dated + sourced       | Auditable rate history               |
| Unrealized gain/loss           | Period-end revaluation on open AR/AP |
| Realized gain/loss             | Auto-post on payment settlement      |

**Institutional Reference:** **IFRS IAS 21 (Foreign Exchange)**

| Aspect           | Current State                   | Required State                             |
| ---------------- | ------------------------------- | ------------------------------------------ |
| **Currency MDM** | ❌ No `mdm_currencies` table     | ✅ Currency registry with decimal precision |
| **FX Rates**     | ❌ No exchange rate table        | ✅ Daily rates with source tracking         |
| **Transactions** | ❌ No currency on invoices/bills | ✅ Document currency + functional currency  |
| **Revaluation**  | ❌ No period-end FX revaluation  | ✅ Open AR/AP revaluation with gain/loss    |
| **Payment FX**   | ❌ No forex gain/loss on payment | ✅ Auto-post realized gain/loss             |

**ERP Reference:** Odoo `res.currency`, ERPNext `Currency Exchange`

**Impact if Missing:**
- Cannot handle international transactions
- AR/AP aging incorrect in multi-currency
- Trial balance misstated

**Proposed Document:** [D01-CURRENCY.md](./D01-CURRENCY.md)

---

### 3.2 Bank Reconciliation (D02)

**Mantra:** *"Cash is only real when the bank agrees."*

| Best Practice                   | Description                      |
| ------------------------------- | -------------------------------- |
| Bank statement = external truth | Statement is the source of truth |
| Auto-match + exception queue    | Rules first, manual fallback     |
| Clear workflow                  | Import → Match → Post            |
| No recon = no cash position     | Unreconciled = unverified        |

**Institutional Reference:** **ACCA/CPA Audit Standards**

| Aspect               | Current State           | Required State                       |
| -------------------- | ----------------------- | ------------------------------------ |
| **Bank Statement**   | ❌ No statement model    | ✅ Statement header + lines schema    |
| **Statement Import** | ❌ No import capability  | ✅ OFX, CSV, CAMT.053 parsers         |
| **Matching Rules**   | ❌ No matching algorithm | ✅ Rule-based auto-matching           |
| **Manual Matching**  | ❌ No UI/workflow        | ✅ Drag-and-drop matching UI (Cobalt) |
| **Bank Feeds**       | ❌ No integration points | ✅ Plaid/Yodlee integration pattern   |

**ERP Reference:** Odoo `account.bank.statement`, ERPNext `Bank Reconciliation Tool`

**Impact if Missing:**
- Cash position unknown
- Bank ↔ Book reconciliation impossible
- Audit findings on cash controls

**Proposed Document:** [D02-BANK-RECONCILIATION.md](./D02-BANK-RECONCILIATION.md)

**Note:** B09-RECONCILIATION mentions "Bank ↔ Cash Book" but lacks implementation schemas.

---

### 3.3 Tax Engine (D03)

**Mantra:** *"Tax is computation, not decoration."*

| Best Practice          | Description                           |
| ---------------------- | ------------------------------------- |
| Line-level tax         | Compute at line, not header guesswork |
| Included vs excluded   | Must be explicit per transaction      |
| Withholding at payment | Post at payment application time      |
| Period-based reporting | Reconcilable to GL                    |

**Institutional Reference:** **Big 4 Tax Practice (Deloitte/KPMG Tax)**

| Aspect              | Current State                         | Required State                             |
| ------------------- | ------------------------------------- | ------------------------------------------ |
| **Tax Registry**    | ⚠️ B03 mentions `mdm_tax_codes` (weak) | ✅ Full tax registry with computation rules |
| **Tax Computation** | ❌ No computation logic                | ✅ Percentage, fixed, compound methods      |
| **Tax on Lines**    | ❌ No line-level tax handling          | ✅ Tax included/excluded per line           |
| **Withholding Tax** | ❌ Not addressed                       | ✅ Withholding on payment application       |
| **VAT/GST**         | ❌ No VAT model                        | ✅ VAT reporting, tax periods, filing       |
| **Jurisdiction**    | ❌ No multi-jurisdiction support       | ✅ Jurisdiction-based tax rates             |

**ERP Reference:** Odoo `account.tax`, ERPNext `Tax Rule`, `Tax Withholding Category`

**Impact if Missing:**
- Tax compliance failure
- Incorrect invoice totals
- Regulatory penalties

**Proposed Document:** [D03-TAX-ENGINE.md](./D03-TAX-ENGINE.md)

---

## 4) High Priority Gaps (🟡 P1 — Should Have)

These gaps are important for enterprise-grade ERP but can be deferred after P0 completion.

### 4.1 Fixed Assets (D04)

**Mantra:** *"Assets decay; depreciation is mandatory truth."*

| Best Practice      | Description                        |
| ------------------ | ---------------------------------- |
| Asset register     | Acquisition, capitalization rules  |
| Auto depreciation  | Schedules auto-generated           |
| Disposal workflow  | Gain/loss posts automatically      |
| Period close check | Depreciation completeness required |

**Institutional Reference:** **IFRS IAS 16 (Property, Plant & Equipment)**

| Aspect             | Current State            | Required State                             |
| ------------------ | ------------------------ | ------------------------------------------ |
| **Asset Register** | ❌ No asset model         | ✅ Asset categories, acquisition, disposal  |
| **Depreciation**   | ❌ No depreciation logic  | ✅ Straight-line, declining balance, custom |
| **Schedules**      | ❌ No schedule generation | ✅ Monthly/annual depreciation schedules    |
| **Disposal**       | ❌ No disposal workflow   | ✅ Disposal with gain/loss posting          |

**ERP Reference:** Odoo `account.asset`, ERPNext `Asset`, `Asset Depreciation Schedule`

**Impact if Missing:**
- Balance sheet misstates fixed assets
- Depreciation expense manual/incorrect

**Proposed Document:** [D04-FIXED-ASSETS.md](./D04-FIXED-ASSETS.md)

---

### 4.2 Budgeting (D05)

**Mantra:** *"Budget is intent. Variance is governance."*

| Best Practice    | Description                       |
| ---------------- | --------------------------------- |
| Budget vs Actual | By account + department + project |
| Threshold alerts | Danger zone for overspend         |
| Rolling budgets  | Forecast revisions tracked        |
| Approval gates   | Budget changes require approval   |

**Institutional Reference:** **McKinsey/Bain CFO Playbooks (FP&A)**

| Aspect               | Current State             | Required State                         |
| -------------------- | ------------------------- | -------------------------------------- |
| **Budget Master**    | ❌ No budget model         | ✅ Budget positions by account/analytic |
| **Budget vs Actual** | ❌ No variance reporting   | ✅ Real-time variance dashboards        |
| **Budget Alerts**    | ❌ No threshold warnings   | ✅ Danger Zone on budget exceed         |
| **Multi-Year**       | ❌ No multi-period budgets | ✅ Rolling budgets, multi-year          |

**ERP Reference:** Odoo `account.budget`, ERPNext `Budget`

**Impact if Missing:**
- No financial planning capability
- Cannot compare plan vs. actual

**Proposed Document:** [D05-BUDGETING.md](./D05-BUDGETING.md)

---

### 4.3 Multi-Company Consolidation (D06)

**Mantra:** *"Group truth requires elimination truth."*

| Best Practice               | Description                      |
| --------------------------- | -------------------------------- |
| Intercompany auto-eliminate | Auto-eliminate on consolidation  |
| Consolidated TB             | With translation rules           |
| Ownership %                 | Control + minority interest      |
| Auditable artifacts         | Consolidation journals traceable |

**Institutional Reference:** **IFRS 10 (Consolidated Financial Statements)**

| Aspect              | Current State                  | Required State                                 |
| ------------------- | ------------------------------ | ---------------------------------------------- |
| **Intercompany**    | ❌ No intercompany transactions | ✅ Intercompany journal automation              |
| **Elimination**     | ❌ No elimination entries       | ✅ Elimination rules for consolidation          |
| **Consolidated TB** | ❌ No consolidated reporting    | ✅ Consolidated trial balance                   |
| **Currency Trans**  | ❌ No translation rules         | ✅ Functional to reporting currency translation |

**ERP Reference:** Odoo `account_consolidation`, ERPNext (multi-company support)

**Impact if Missing:**
- Multi-entity groups cannot consolidate
- Regulatory filing for group entities impossible

**Proposed Document:** [D06-CONSOLIDATION.md](./D06-CONSOLIDATION.md)

---

## 5) Medium Priority Gaps (🟢 P2 — Industry Specific)

These are industry-specific or optional modules that can be added based on target market.

### 5.1 Manufacturing / BOM (D07)

**Mantra:** *"Work-in-progress is money in motion."*

| Best Practice        | Description                      |
| -------------------- | -------------------------------- |
| BOM versioning       | Versioned with routings          |
| WIP valuation        | Rules for work-in-progress       |
| Material consumption | Reconcile to stock + cost layers |
| Variance reporting   | Expected vs actual               |

**Institutional Reference:** **Toyota Production System (Lean)** + **APICS/ASCM**

| Aspect            | Current State          | Required State                            |
| ----------------- | ---------------------- | ----------------------------------------- |
| **BOM**           | ❌ No bill of materials | ✅ Multi-level BOM with variants           |
| **Work Orders**   | ❌ No work order model  | ✅ Work order lifecycle                    |
| **Routing**       | ❌ No operation routing | ✅ Work centers, operations, time tracking |
| **WIP Valuation** | ❌ No WIP accounting    | ✅ Work-in-progress valuation              |

**ERP Reference:** Odoo `mrp.bom`, ERPNext `BOM`, `Work Order`

**Applicability:** Manufacturing businesses only.

**Proposed Document:** [D07-MANUFACTURING.md](./D07-MANUFACTURING.md)

---

### 5.2 Project & Service (D08)

**Mantra:** *"Time is inventory. Delivery is revenue."*

| Best Practice       | Description                 |
| ------------------- | --------------------------- |
| Timesheets tied     | To project + cost centers   |
| Billing rules       | T&M, milestone, fixed price |
| Revenue recognition | % completion when needed    |
| Project P&L         | Traceable to source         |

**Institutional Reference:** **PMI (Project Management Institute)**

| Aspect             | Current State                    | Required State                             |
| ------------------ | -------------------------------- | ------------------------------------------ |
| **Project Master** | ❌ No project model               | ✅ Projects with tasks, milestones          |
| **Timesheets**     | ❌ No time tracking               | ✅ Timesheet entries by employee/project    |
| **Billing Rules**  | ❌ No project billing             | ✅ Time & materials, fixed price, milestone |
| **Revenue Recog**  | ❌ No service revenue recognition | ✅ Percentage of completion                 |

**ERP Reference:** Odoo `project.project`, ERPNext `Project`, `Timesheet`

**Applicability:** Service businesses, consulting, agencies.

**Proposed Document:** [D08-PROJECT-SERVICE.md](./D08-PROJECT-SERVICE.md)

---

### 5.3 HR Core (D09)

**Mantra:** *"People are cost centers with contracts."*

| Best Practice    | Description                           |
| ---------------- | ------------------------------------- |
| Employee master  | Controlled registry, not user profile |
| Payroll events   | Auditable + reversible                |
| Leave balances   | Deterministic                         |
| Expense workflow | Approval + reimbursement ledger       |

**Institutional Reference:** **SHRM (Society for Human Resource Management)**

| Aspect              | Current State                     | Required State                                |
| ------------------- | --------------------------------- | --------------------------------------------- |
| **Employee Master** | ❌ No employee model (only `user`) | ✅ Employee registry with department, position |
| **Contracts**       | ❌ No employment contracts         | ✅ Contract terms, salary, benefits            |
| **Leave**           | ❌ No leave management             | ✅ Leave types, balances, requests             |
| **Expense**         | ❌ No expense claims               | ✅ Expense submission, approval, reimbursement |

**ERP Reference:** Odoo `hr.employee`, ERPNext `Employee`, `Payroll Entry`

**Applicability:** All businesses with employees.

**Proposed Document:** [D09-HR-CORE.md](./D09-HR-CORE.md)

---

### 5.4 Cash Flow Forecasting (D10)

**Mantra:** *"Profit is opinion. Cash is survival."*

| Best Practice       | Description             |
| ------------------- | ----------------------- |
| Forecast from AR/AP | + recurring commitments |
| Scenario planning   | Best/base/worst         |
| Tie to actuals      | Continuous comparison   |
| CFO dashboard       | Runway + liquidity risk |

**Institutional Reference:** **Deloitte CFO Insights**

| Aspect             | Current State          | Required State                        |
| ------------------ | ---------------------- | ------------------------------------- |
| **Forecast Model** | ❌ No cash forecast     | ✅ Cash inflows/outflows projection    |
| **AR/AP Aging**    | ⚠️ B09 mentions aging   | ✅ Aging-based cash projection         |
| **Recurring**      | ❌ No recurring entries | ✅ Recurring income/expense projection |
| **What-If**        | ❌ No scenario modeling | ✅ Multiple forecast scenarios         |

**ERP Reference:** Odoo `account.cash.forecast`, ERPNext (via reports)

**Proposed Document:** [D10-CASH-FLOW.md](./D10-CASH-FLOW.md)

---

## 6) ERPNext-Specific Gaps (Additional from [frappe/erpnext](https://github.com/frappe/erpnext))

ERPNext has unique modules not covered by Odoo analysis:

### 6.1 Quality Management (D11)

**Mantra:** *"Quality is measured, not assumed."*

| Aspect                 | Current State   | Required State                      |
| ---------------------- | --------------- | ----------------------------------- |
| **Quality Inspection** | ❌ Not addressed | ✅ Inspection templates, results     |
| **Quality Procedure**  | ❌ Not addressed | ✅ SOP documents, training records   |
| **Non-Conformance**    | ❌ Not addressed | ✅ Issue tracking, corrective action |

**ERPNext Reference:** `Quality Inspection`, `Quality Procedure`, `Quality Goal`

**Institutional Reference:** **ISO 9001 (Quality Management Systems)**

---

### 6.2 Subcontracting (D12)

**Mantra:** *"Outsourced work is still your responsibility."*

| Aspect                  | Current State   | Required State                       |
| ----------------------- | --------------- | ------------------------------------ |
| **Subcontract Order**   | ❌ Not addressed | ✅ PO with BOM for subcontractor      |
| **Material Transfer**   | ❌ Not addressed | ✅ Raw material sent to subcontractor |
| **Receipt of Finished** | ❌ Not addressed | ✅ Finished goods receipt + valuation |

**ERPNext Reference:** `Subcontracting Order`, `Stock Entry (Material Transfer)`

---

### 6.3 Loan Management (D13)

**Mantra:** *"Borrowed money must be tracked to the penny."*

| Aspect               | Current State   | Required State                        |
| -------------------- | --------------- | ------------------------------------- |
| **Loan Master**      | ❌ Not addressed | ✅ Loan types, terms, interest rates   |
| **Disbursement**     | ❌ Not addressed | ✅ Disbursement schedule + posting     |
| **Repayment**        | ❌ Not addressed | ✅ Repayment schedule + reconciliation |
| **Interest Accrual** | ❌ Not addressed | ✅ Interest calculation + posting      |

**ERPNext Reference:** `Loan`, `Loan Disbursement`, `Loan Repayment`

**Institutional Reference:** **IFRS 9 (Financial Instruments)**

---

### 6.4 CRM / Lead Management (D14)

**Mantra:** *"Leads are potential; opportunities are commitment."*

| Aspect           | Current State   | Required State                         |
| ---------------- | --------------- | -------------------------------------- |
| **Lead Capture** | ❌ Not addressed | ✅ Lead sources, qualification          |
| **Opportunity**  | ❌ Not addressed | ✅ Pipeline stages, probability         |
| **Campaign**     | ❌ Not addressed | ✅ Campaign tracking, ROI               |
| **Quotation**    | ⚠️ B04 has quote | ✅ Link to opportunity, conversion rate |

**ERPNext Reference:** `Lead`, `Opportunity`, `Campaign`

**Note:** AXIS B04 has Quote but no pre-quote CRM pipeline.

---

### 6.5 Support / Issue Tracking (D15)

**Mantra:** *"Every issue is a promise to resolve."*

| Aspect             | Current State         | Required State                     |
| ------------------ | --------------------- | ---------------------------------- |
| **Issue Master**   | ⚠️ B11 AFANDA partial  | ✅ Issue types, priorities, SLA     |
| **Warranty**       | ❌ Not addressed       | ✅ Warranty claims, serial tracking |
| **SLA Timer**      | ⚠️ B11 has SLA concept | ✅ SLA enforcement, escalation      |
| **Knowledge Base** | ❌ Not addressed       | ✅ KB articles, self-service        |

**ERPNext Reference:** `Issue`, `Warranty Claim`, `Service Level Agreement`

**Note:** B11-AFANDA covers collaboration but not structured support ticketing.

---

## 7) Gap Summary by Source

| Source              | Gaps Identified | P0 (Critical) | P1 (High) | P2 (Medium) |
| ------------------- | --------------- | ------------- | --------- | ----------- |
| **Odoo 19.0**       | D01-D10         | 3             | 3         | 4           |
| **ERPNext v16.1.0** | D11-D15         | 0             | 0         | 5           |
| **Total**           | 15 domains      | 3             | 3         | 9           |

### Coverage Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AXIS COVERAGE vs INDUSTRY BENCHMARK                       │
│                                                                              │
│  FULLY COVERED (B-Series)         GAPS IDENTIFIED (D-Series)                │
│  ┌─────────────────────────┐      ┌─────────────────────────┐               │
│  │ ✅ Accounting (B07)      │      │ 🔴 D01 Currency          │               │
│  │ ✅ Inventory (B06)       │      │ 🔴 D02 Bank Recon        │               │
│  │ ✅ Sales (B04)           │      │ 🔴 D03 Tax Engine        │               │
│  │ ✅ Purchase (B05)        │      │ 🟡 D04 Fixed Assets      │               │
│  │ ✅ MDM (B03)             │      │ 🟡 D05 Budgeting         │               │
│  │ ✅ Controls (B08)        │      │ 🟡 D06 Consolidation     │               │
│  │ ✅ Reconciliation (B09)  │      │ 🟢 D07-D15 (Industry)    │               │
│  │ ✅ UX (B10)              │      │                          │               │
│  │ ✅ AFANDA (B11)          │      │                          │               │
│  │ ✅ Intelligence (B12)    │      │                          │               │
│  └─────────────────────────┘      └─────────────────────────┘               │
│                                                                              │
│  Coverage: B-Series = 12 domains | D-Series = 15 planned extensions         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8) Quick Wins (Extend Existing Docs)

These enhancements can be added to existing B-series documents with minimal effort:

| Enhancement               | Target Document | Effort | Notes                                       |
| ------------------------- | --------------- | ------ | ------------------------------------------- |
| Currency field on Party   | B03-MDM         | Low    | Add `default_currency_id` to party          |
| Currency field on Item    | B03-MDM         | Low    | Add `base_currency` to item pricing         |
| Currency on Invoice/Bill  | B04, B05        | Low    | Add `currency_id`, `exchange_rate`          |
| Exchange rate table       | B03-MDM         | Medium | New `mdm_exchange_rates` table              |
| Tax on invoice/bill lines | B04, B05        | Medium | Add `tax_ids`, `tax_amount` to lines        |
| Withholding on payment    | B04, B05        | Medium | Add `withholding_tax_id`, `withheld_amount` |
| Bank statement schema     | B09             | Medium | Add statement header + lines schema         |
| Bank matching rules       | B09             | Medium | Add matching rule configuration             |

---

## 9) Implementation Priority Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION PRIORITY MATRIX                            │
│                                                                              │
│  CRITICAL (P0)                    HIGH (P1)                                 │
│  ┌─────────────────────────┐      ┌─────────────────────────┐               │
│  │ D01 Multi-Currency      │      │ D04 Fixed Assets        │               │
│  │ D02 Bank Reconciliation │      │ D05 Budgeting           │               │
│  │ D03 Tax Engine          │      │ D06 Consolidation       │               │
│  └─────────────────────────┘      └─────────────────────────┘               │
│                                                                              │
│  MEDIUM (P2 - Industry Specific)                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ D07 Manufacturing │ D08 Project/Service │ D09 HR Core │ D10 Cash Flow  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  RECOMMENDED BUILD ORDER:                                                    │
│  D01 → D03 → D02 → D04 → D05 → D06 → (D07-D10 based on market)             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10) D-Series Index

### Core Extensions (Odoo + ERPNext Common)

| Document                                                   | Phase | Status    | Priority | Purpose                     |
| ---------------------------------------------------------- | ----- | --------- | -------- | --------------------------- |
| **D00-GAP-ANALYSIS.md**                                    | D00   | ✅ v1.1.0  | —        | Gap tracking (this doc)     |
| [D01-CURRENCY.md](./D01-CURRENCY.md)                       | D01   | 📋 Planned | 🔴 P0     | Multi-Currency Engine       |
| [D02-BANK-RECONCILIATION.md](./D02-BANK-RECONCILIATION.md) | D02   | 📋 Planned | 🔴 P0     | Bank Statement Recon        |
| [D03-TAX-ENGINE.md](./D03-TAX-ENGINE.md)                   | D03   | 📋 Planned | 🔴 P0     | Tax Computation & Reporting |
| [D04-FIXED-ASSETS.md](./D04-FIXED-ASSETS.md)               | D04   | 📋 Planned | 🟡 P1     | Asset Depreciation          |
| [D05-BUDGETING.md](./D05-BUDGETING.md)                     | D05   | 📋 Planned | 🟡 P1     | Budget Management           |
| [D06-CONSOLIDATION.md](./D06-CONSOLIDATION.md)             | D06   | 📋 Planned | 🟡 P1     | Multi-Company Consolidation |
| [D07-MANUFACTURING.md](./D07-MANUFACTURING.md)             | D07   | 📋 Planned | 🟢 P2     | BOM & Production            |
| [D08-PROJECT-SERVICE.md](./D08-PROJECT-SERVICE.md)         | D08   | 📋 Planned | 🟢 P2     | Project & Timesheet         |
| [D09-HR-CORE.md](./D09-HR-CORE.md)                         | D09   | 📋 Planned | 🟢 P2     | Employee & HR               |
| [D10-CASH-FLOW.md](./D10-CASH-FLOW.md)                     | D10   | 📋 Planned | 🟢 P2     | Cash Flow Forecasting       |

### ERPNext-Specific Extensions

| Document                                           | Phase | Status    | Priority | Purpose                       |
| -------------------------------------------------- | ----- | --------- | -------- | ----------------------------- |
| [D11-QUALITY.md](./D11-QUALITY.md)                 | D11   | 📋 Planned | 🟢 P2     | Quality Management (ISO 9001) |
| [D12-SUBCONTRACTING.md](./D12-SUBCONTRACTING.md)   | D12   | 📋 Planned | 🟢 P2     | Outsourced Manufacturing      |
| [D13-LOAN-MANAGEMENT.md](./D13-LOAN-MANAGEMENT.md) | D13   | 📋 Planned | 🟢 P2     | Loan & Repayment Tracking     |
| [D14-CRM.md](./D14-CRM.md)                         | D14   | 📋 Planned | 🟢 P2     | Lead → Opportunity Pipeline   |
| [D15-SUPPORT.md](./D15-SUPPORT.md)                 | D15   | 📋 Planned | 🟢 P2     | Issue Tracking & SLA          |

---

## 11) Integration with Existing Series

### 8.1 How D-Series Extends B-Series

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    D-SERIES ↔ B-SERIES INTEGRATION                           │
│                                                                              │
│  B03-MDM ◄────────────────────── D01-CURRENCY (extends Party, Item)         │
│                                                                              │
│  B04-SALES ◄─────────────────┬── D01-CURRENCY (invoice currency)            │
│                              └── D03-TAX (line-level tax)                   │
│                                                                              │
│  B05-PURCHASE ◄──────────────┬── D01-CURRENCY (bill currency)               │
│                              └── D03-TAX (withholding)                      │
│                                                                              │
│  B07-ACCOUNTING ◄────────────┬── D01-CURRENCY (forex journals)              │
│                              ├── D03-TAX (tax liability accounts)           │
│                              ├── D04-ASSETS (depreciation journals)         │
│                              ├── D05-BUDGETING (budget vs actual)           │
│                              └── D06-CONSOLIDATION (elimination entries)    │
│                                                                              │
│  B09-RECONCILIATION ◄────────┬── D02-BANK (bank statement matching)         │
│                              └── D01-CURRENCY (multi-currency matching)     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Schema Registry Impact

When implementing D-series, schemas will be added to `@axis/registry`:

```
packages/axis-registry/src/schemas/
├── currency/           # D01
│   ├── constants.ts
│   ├── currency.ts
│   ├── rate.ts
│   └── index.ts
├── bank/               # D02
│   ├── constants.ts
│   ├── statement.ts
│   ├── matching.ts
│   └── index.ts
├── tax/                # D03
│   ├── constants.ts
│   ├── tax-code.ts
│   ├── computation.ts
│   ├── withholding.ts
│   └── index.ts
├── assets/             # D04
├── budget/             # D05
├── consolidation/      # D06
└── events/
    ├── currency.ts     # D01 events
    ├── bank.ts         # D02 events
    └── tax.ts          # D03 events
```

---

## Document Governance

| Field            | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| **Status**       | **Implemented**                                             |
| **Version**      | 1.1.0                                                       |
| **Derived From** | Odoo 19.0 + ERPNext v16.1.0 Analysis, Institutional Anchors |
| **Phase**        | D00 (Gap Analysis)                                          |
| **Author**       | AXIS Architecture Team                                      |
| **Last Updated** | 2026-01-22                                                  |

---

> *"AXIS is not an ERP. AXIS is a truth engine: it balances money, goods, and obligations — then proves it during migration."*
