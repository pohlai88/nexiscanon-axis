# Phase 3: Purchase Module Implementation Plan

**Date:** 2026-01-23  
**Phase:** 3 - Purchase Module  
**Foundation:** F01/B01 Clean Posting Spine (13 tables deployed)  
**Pattern:** Mirror Sales Module design

---

## 🎯 Objective

Build Purchase module following the proven Sales module pattern:
- Schema-first with F01 compliance
- Service layer with B01 posting spine integration
- E2E test to verify chain integrity and balanced books

---

## 📊 Scope

### Tables to Create (3)

#### 1. `purchase_requests`
**Purpose:** Internal purchase requests (PR) awaiting approval

**Key Columns:**
- `id` (UUID PK)
- `tenant_id` (UUID FK → tenants)
- `request_number` (text, unique per tenant)
- `request_date` (timestamptz)
- `status` (text: draft | submitted | approved | rejected | converted)
- `requester_id` (UUID FK → users)
- `requester_name` (text)
- `vendor_id` (UUID FK → vendors, nullable)
- `vendor_name` (text)
- `currency` (text, default 'USD')
- `subtotal`, `tax_total`, `total_amount` (decimal 15,4)
- `line_items` (jsonb array)
- `justification` (text, nullable)
- `approval_notes` (text, nullable)
- `converted_to_po_id` (UUID FK → purchase_orders, nullable)
- `converted_at` (timestamptz, nullable)
- `metadata` (jsonb)
- `created_by`, `modified_by` (UUID FK → users)
- `created_at`, `updated_at` (timestamptz)

**Indexes:**
- `idx_purchase_requests_tenant_id`
- `idx_purchase_requests_status`
- `idx_purchase_requests_requester_id`
- `idx_purchase_requests_request_date`

**Unique Constraints:**
- `uq_purchase_requests_tenant_number` (tenant_id, request_number)

#### 2. `purchase_orders`
**Purpose:** Confirmed purchase orders sent to vendors

**Key Columns:**
- `id` (UUID PK)
- `tenant_id` (UUID FK → tenants)
- `po_number` (text, unique per tenant)
- `po_date` (timestamptz)
- `expected_delivery_date` (timestamptz, nullable)
- `status` (text: pending | sent | acknowledged | received | invoiced | cancelled)
- `vendor_id` (UUID FK → vendors, nullable)
- `vendor_name` (text)
- `vendor_email` (text, nullable)
- `request_id` (UUID FK → purchase_requests, nullable)
- `currency` (text, default 'USD')
- `subtotal`, `tax_total`, `total_amount` (decimal 15,4)
- `line_items` (jsonb array)
- `delivery_address` (jsonb, nullable)
- `payment_terms` (text, nullable)
- `notes` (text, nullable)
- `bill_id` (UUID FK → purchase_bills, nullable)
- `received_at` (timestamptz, nullable)
- `invoiced_at` (timestamptz, nullable)
- `metadata` (jsonb)
- `created_by`, `modified_by` (UUID FK → users)
- `created_at`, `updated_at` (timestamptz)

**Indexes:**
- `idx_purchase_orders_tenant_id`
- `idx_purchase_orders_status`
- `idx_purchase_orders_vendor_id`
- `idx_purchase_orders_request_id`
- `idx_purchase_orders_po_date`

**Unique Constraints:**
- `uq_purchase_orders_tenant_number` (tenant_id, po_number)

#### 3. `purchase_bills` (B01 Integration)
**Purpose:** Vendor bills with AP posting integration

**Key Columns:**
- `id` (UUID PK)
- `tenant_id` (UUID FK → tenants)
- `bill_number` (text, unique per tenant)
- `bill_date` (timestamptz)
- `due_date` (timestamptz)
- `status` (text: draft | received | approved | posted | paid | cancelled)
- `vendor_id` (UUID FK → vendors, nullable)
- `vendor_name` (text)
- `vendor_email` (text, nullable)
- `po_id` (UUID FK → purchase_orders, nullable)
- `currency` (text, default 'USD')
- `subtotal`, `tax_total`, `total_amount` (decimal 15,4)
- `amount_paid`, `amount_due` (decimal 15,4)
- `line_items` (jsonb array with account_code for posting)
- `payment_terms` (text, nullable)
- `notes` (text, nullable)
- **`document_id` (UUID FK → documents, nullable)** ← B01 link
- **`posted_at` (timestamptz, nullable)**
- `last_payment_date` (timestamptz, nullable)
- `metadata` (jsonb)
- `created_by`, `modified_by` (UUID FK → users)
- `created_at`, `updated_at` (timestamptz)

**Indexes:**
- `idx_purchase_bills_tenant_id`
- `idx_purchase_bills_status`
- `idx_purchase_bills_vendor_id`
- `idx_purchase_bills_po_id`
- `idx_purchase_bills_document_id` ← B01 integration
- `idx_purchase_bills_bill_date`
- `idx_purchase_bills_due_date`

**Unique Constraints:**
- `uq_purchase_bills_tenant_number` (tenant_id, bill_number)

---

## 🧩 Service Layer Design

### 1. Request Service (`packages/db/src/services/purchase/request-service.ts`)

**Functions:**
- `createRequest(db, input)` → Create PR (draft state)
- `submitRequest(db, requestId, userId)` → Submit for approval
- `approveRequest(db, requestId, userId, notes?)` → Approve PR
- `rejectRequest(db, requestId, userId, reason)` → Reject PR
- `convertRequestToPO(db, requestId, userId, poNumber)` → Convert to PO
- `getRequestById(db, requestId)` → Fetch PR
- `getRequestsByTenant(db, tenantId, options?)` → List PRs
- `updateRequestStatus(db, requestId, status, userId)` → Update status

### 2. Order Service (`packages/db/src/services/purchase/order-service.ts`)

**Functions:**
- `createPO(db, input)` → Create PO (pending state)
- `sendPOToVendor(db, poId, userId)` → Mark as sent
- `markPOReceived(db, poId, receivedDate, userId)` → Mark goods received
- `convertPOToBill(db, poId, userId, billNumber, dueDate)` → Convert to bill
- `getPOById(db, poId)` → Fetch PO
- `getPOsByTenant(db, tenantId, options?)` → List POs
- `updatePOStatus(db, poId, status, userId)` → Update status

### 3. Bill Service (`packages/db/src/services/purchase/bill-service.ts`) ← **B01 INTEGRATION**

**Functions:**
- `createBill(db, input)` → Create bill (draft state)
- **`postBillToGL(db, input)` → Post to GL via posting spine** ← KEY FUNCTION
- `getBillById(db, billId)` → Fetch bill
- `getBillsByTenant(db, tenantId, options?)` → List bills
- `updateBillStatus(db, billId, status, userId)` → Update status
- `recordPayment(db, billId, amount, paymentDate, userId)` → Record payment made

**B01 Integration Pattern:**
```typescript
postBillToGL(db, {
  billId,
  postingDate,
  userId,
  context: SixW1HContext,
  apAccountId,        // Accounts Payable account
  expenseAccountIds   // Array of expense/asset accounts from line items
}) creates:
  1. documents entry (state: 'posted', type: 'purchase_bill')
  2. economic_events entry (event_type: 'bill.posted')
  3. ledger_postings entries:
     - CR Accounts Payable (total amount)
     - DR Expense/Asset accounts (per line item)
  4. Updates purchase_bills.document_id, posted_at, status
```

---

## 🧪 Testing Strategy

### E2E Test Scenario: PR → PO → Bill → Posted

**Test Data:**
- Vendor: XYZ Supplies
- Amount: $2,500 ($2,300 + $200 tax)
- PR: PR-2026-001
- PO: PO-2026-001
- Bill: BILL-2026-001

**Test Flow:**
1. Create PR-2026-001 (draft) → Approve → Convert to PO
2. Create PO-2026-001 (pending) → Send to vendor → Mark received
3. Create BILL-2026-001 from PO → Post to GL
4. Verify posting spine:
   - Document created (posted)
   - Economic event created (bill.posted, $2,500)
   - GL postings created:
     - CR 2110 Accounts Payable: $2,500
     - DR 5100 Expense: $2,300
     - DR 1XXX Tax Paid: $200
5. Verify balanced books: Debits = Credits = $2,500
6. Verify chain: PR → PO → Bill → Document → Event → Postings

---

## 📋 Implementation Tasks

### Phase 3A: Schema (Tasks 1-2)

**Task 1:** Create Drizzle schemas ⏳
- [ ] `packages/db/src/schema/purchase/request.ts`
- [ ] `packages/db/src/schema/purchase/order.ts`
- [ ] `packages/db/src/schema/purchase/bill.ts`
- [ ] `packages/db/src/schema/purchase/index.ts`
- [ ] Update `packages/db/src/schema/index.ts` to export purchase module

**Task 2:** Generate & apply migration ⏳
- [ ] Use Neon MCP `prepare_database_migration` with DDL
- [ ] Review migration plan
- [ ] Apply to test branch first
- [ ] Verify schema in test
- [ ] Apply to production branch
- [ ] Confirm 16 tables (13 existing + 3 purchase)

### Phase 3B: Services (Tasks 3-5)

**Task 3:** Implement request-service.ts ⏳
- [ ] Create `packages/db/src/services/purchase/request-service.ts`
- [ ] Implement 8 functions (create, submit, approve, reject, convert, get, list, update)
- [ ] Add TypeScript types for inputs

**Task 4:** Implement order-service.ts ⏳
- [ ] Create `packages/db/src/services/purchase/order-service.ts`
- [ ] Implement 7 functions (create, send, received, convert, get, list, update)
- [ ] Add TypeScript types for inputs

**Task 5:** Implement bill-service.ts with B01 integration ⏳
- [ ] Create `packages/db/src/services/purchase/bill-service.ts`
- [ ] Implement `postBillToGL()` using posting spine pattern
- [ ] Implement other 5 functions (create, get, list, update, recordPayment)
- [ ] Add TypeScript types for inputs

**Task 6:** Export services ⏳
- [ ] Create `packages/db/src/services/purchase/index.ts` barrel file
- [ ] Verify imports work

### Phase 3C: Testing (Task 7)

**Task 7:** E2E test ⏳
- [ ] Seed test data (vendor accounts: AP, Expenses)
- [ ] Create PR → Approve → Convert to PO
- [ ] Create PO → Send → Receive → Convert to Bill
- [ ] Create Bill → Post to GL
- [ ] Query posting spine to verify chain
- [ ] Verify balanced books (Debits = Credits)
- [ ] Document results in `PHASE-3-PURCHASE-COMPLETE.md`

### Phase 3D: Documentation (Task 8)

**Task 8:** Update documentation ⏳
- [ ] Update `E00-01-SERVICE-IMPLEMENTATION-SYNC.md` (B5 status)
- [ ] Update `B01-DOCUMENTATION.md` (add purchase integration)
- [ ] Update `DEVELOPMENT-STATUS.md` (reflect Phase 3)
- [ ] Create `PHASE-3-PURCHASE-COMPLETE.md` with test results

---

## ✅ Success Criteria

- [ ] 3 purchase tables deployed to production
- [ ] 3 purchase services implemented (request, order, bill)
- [ ] E2E test passed (PR → PO → Bill → Posted)
- [ ] Balanced books verified (Debits = Credits)
- [ ] B01 integration working (document_id linkage)
- [ ] Chain integrity maintained
- [ ] Documentation updated

---

## 🔗 References

- **Sales Module Pattern:** `PHASE-2-SALES-COMPLETE.md`
- **B01 Posting Spine:** `B01-DOCUMENTATION.md`
- **F01 Governance:** `F01-DB-GOVERNED.md`
- **Sales Services:** `packages/db/src/services/sales/`
- **Neon MCP Workflow:** `F01-PRODUCTION-CUTOVER-COMPLETE.md`

---

**PATTERN:** Mirror Sales → Proven, repeatable, clean  
**TIMELINE:** ~2 hours (based on Sales velocity)  
**NEXT:** Begin Task 1 (Create Drizzle schemas)
