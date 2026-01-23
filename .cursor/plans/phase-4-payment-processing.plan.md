# Phase 4: Payment Processing Implementation Plan

**Date:** 2026-01-23  
**Phase:** 4 - Payment Processing  
**Foundation:** F01/B01 + Sales + Purchase (16 tables)  
**Objective:** Complete cash flow cycle (AR collection + AP disbursement)

---

## 🎯 Mission

Implement payment processing to complete the business cycle:
- Customer payments (AR collection)
- Vendor payments (AP disbursement)
- Cash posting via B01 posting spine
- Bank account integration

---

## 📊 Scope

### Tables to Create (2)

#### 1. `customer_payments`
**Purpose:** Payments received from customers (AR collection)

**Key Columns:**
- `id` (UUID PK)
- `tenant_id` (UUID FK → tenants)
- `payment_number` (text, unique per tenant)
- `payment_date` (timestamptz)
- `customer_id` (UUID FK → customers, nullable)
- `customer_name` (text)
- `payment_method` (text: cash | check | wire | card | ach)
- `reference_number` (text, nullable) - check #, transaction ID
- `amount` (decimal 15,4)
- `currency` (text, default 'USD')
- `bank_account_id` (UUID FK → bank_accounts, nullable)
- `invoice_id` (UUID FK → sales_invoices, nullable) - if specific invoice
- `unapplied_amount` (decimal 15,4) - amount not yet applied to invoices
- `status` (text: pending | cleared | reconciled | void)
- `notes` (text, nullable)
- **`document_id` (UUID FK → documents, nullable)** ← B01 link
- **`posted_at` (timestamptz, nullable)**
- `metadata` (jsonb)
- Audit fields (created_by, modified_by, created_at, updated_at)

**Indexes:**
- `idx_customer_payments_tenant_id`
- `idx_customer_payments_customer_id`
- `idx_customer_payments_invoice_id`
- `idx_customer_payments_bank_account_id`
- `idx_customer_payments_document_id` ← B01
- `idx_customer_payments_payment_date`
- `idx_customer_payments_status`

**Unique Constraint:**
- `uq_customer_payments_tenant_number` (tenant_id, payment_number)

#### 2. `vendor_payments`
**Purpose:** Payments made to vendors (AP disbursement)

**Key Columns:**
- `id` (UUID PK)
- `tenant_id` (UUID FK → tenants)
- `payment_number` (text, unique per tenant)
- `payment_date` (timestamptz)
- `vendor_id` (UUID FK → vendors, nullable)
- `vendor_name` (text)
- `payment_method` (text: cash | check | wire | card | ach)
- `reference_number` (text, nullable)
- `amount` (decimal 15,4)
- `currency` (text, default 'USD')
- `bank_account_id` (UUID FK → bank_accounts, nullable)
- `bill_id` (UUID FK → purchase_bills, nullable)
- `unapplied_amount` (decimal 15,4)
- `status` (text: pending | cleared | reconciled | void)
- `notes` (text, nullable)
- **`document_id` (UUID FK → documents, nullable)** ← B01 link
- **`posted_at` (timestamptz, nullable)**
- `metadata` (jsonb)
- Audit fields (created_by, modified_by, created_at, updated_at)

**Indexes:**
- `idx_vendor_payments_tenant_id`
- `idx_vendor_payments_vendor_id`
- `idx_vendor_payments_bill_id`
- `idx_vendor_payments_bank_account_id`
- `idx_vendor_payments_document_id` ← B01
- `idx_vendor_payments_payment_date`
- `idx_vendor_payments_status`

**Unique Constraint:**
- `uq_vendor_payments_tenant_number` (tenant_id, payment_number)

---

## 🧩 Service Layer Design

### 1. Customer Payment Service (`packages/db/src/services/payment/customer-payment-service.ts`)

**Functions:**
- `createCustomerPayment(db, input)` → Create payment (pending)
- **`postCustomerPaymentToGL(db, input)` → Post to GL via posting spine** ← KEY
- `applyPaymentToInvoice(db, paymentId, invoiceId, amount)` → Apply to specific invoice
- `voidPayment(db, paymentId, userId, reason)` → Void payment
- `getPaymentById(db, paymentId)` → Fetch payment
- `getPaymentsByTenant(db, tenantId, options?)` → List payments
- `getPaymentsByCustomer(db, customerId)` → List customer payments

**B01 Integration Pattern:**
```typescript
postCustomerPaymentToGL() creates:
  1. documents entry (state: 'posted', type: 'customer_payment')
  2. economic_events entry (event_type: 'payment.received')
  3. ledger_postings entries:
     - DR Cash/Bank (payment amount)
     - CR Accounts Receivable (payment amount)
  4. Updates customer_payments.document_id, posted_at
  5. Updates sales_invoices.amount_paid if linked
```

### 2. Vendor Payment Service (`packages/db/src/services/payment/vendor-payment-service.ts`)

**Functions:**
- `createVendorPayment(db, input)` → Create payment (pending)
- **`postVendorPaymentToGL(db, input)` → Post to GL via posting spine** ← KEY
- `applyPaymentToBill(db, paymentId, billId, amount)` → Apply to specific bill
- `voidPayment(db, paymentId, userId, reason)` → Void payment
- `getPaymentById(db, paymentId)` → Fetch payment
- `getPaymentsByTenant(db, tenantId, options?)` → List payments
- `getPaymentsByVendor(db, vendorId)` → List vendor payments

**B01 Integration Pattern:**
```typescript
postVendorPaymentToGL() creates:
  1. documents entry (state: 'posted', type: 'vendor_payment')
  2. economic_events entry (event_type: 'payment.made')
  3. ledger_postings entries:
     - DR Accounts Payable (payment amount)
     - CR Cash/Bank (payment amount)
  4. Updates vendor_payments.document_id, posted_at
  5. Updates purchase_bills.amount_paid if linked
```

---

## 🧪 Testing Strategy

### E2E Test 1: Customer Payment (AR Collection)

**Test Data:**
- Customer: ABC Corp
- Invoice: INV-2026-002 ($1,650 from Phase 2)
- Payment: PAY-CUST-001 ($1,650)

**Test Flow:**
1. Create customer payment PAY-CUST-001 ($1,650)
2. Apply payment to invoice INV-2026-002
3. Post payment to GL
4. Verify posting spine:
   - Document created (posted)
   - Economic event created (payment.received, $1,650)
   - GL postings:
     - DR 1110 Cash: $1,650
     - CR 1120 AR: $1,650
5. Verify balanced books: Debits = Credits = $1,650
6. Verify invoice updated: amount_paid = $1,650, status = paid

### E2E Test 2: Vendor Payment (AP Disbursement)

**Test Data:**
- Vendor: XYZ Supplies
- Bill: BILL-2026-001 ($2,500 from Phase 3)
- Payment: PAY-VEND-001 ($2,500)

**Test Flow:**
1. Create vendor payment PAY-VEND-001 ($2,500)
2. Apply payment to bill BILL-2026-001
3. Post payment to GL
4. Verify posting spine:
   - Document created (posted)
   - Economic event created (payment.made, $2,500)
   - GL postings:
     - DR 2110 AP: $2,500
     - CR 1110 Cash: $2,500
5. Verify balanced books: Debits = Credits = $2,500
6. Verify bill updated: amount_paid = $2,500, status = paid

---

## 📋 Implementation Tasks

### Phase 4A: Schema (Tasks 1-2)

**Task 1:** Create Drizzle schemas
- [ ] `packages/db/src/schema/payment/customer-payment.ts`
- [ ] `packages/db/src/schema/payment/vendor-payment.ts`
- [ ] `packages/db/src/schema/payment/index.ts`
- [ ] Update `packages/db/src/schema/index.ts`

**Task 2:** Generate & apply migration
- [ ] Use Neon MCP for migration
- [ ] Verify in test branch
- [ ] Apply to production
- [ ] Confirm 18 tables (16 + 2 payment)

### Phase 4B: Services (Tasks 3-4)

**Task 3:** Implement customer-payment-service.ts
- [ ] Create service with 7 functions
- [ ] Implement `postCustomerPaymentToGL()` with B01 integration
- [ ] Add TypeScript types

**Task 4:** Implement vendor-payment-service.ts
- [ ] Create service with 7 functions
- [ ] Implement `postVendorPaymentToGL()` with B01 integration
- [ ] Add TypeScript types

### Phase 4C: Testing (Task 5)

**Task 5:** E2E tests
- [ ] Test customer payment (AR collection)
- [ ] Test vendor payment (AP disbursement)
- [ ] Verify balanced books for both
- [ ] Document results

### Phase 4D: Documentation (Task 6)

**Task 6:** Update documentation
- [ ] Create `PHASE-4-PAYMENT-COMPLETE.md`
- [ ] Update `B01-DOCUMENTATION.md`
- [ ] Update `E00-01-SERVICE-IMPLEMENTATION-SYNC.md`
- [ ] Update `DEVELOPMENT-STATUS.md`

---

## ✅ Success Criteria

- [ ] 2 payment tables deployed to production
- [ ] 2 payment services implemented
- [ ] E2E tests passed (both AR and AP)
- [ ] Balanced books verified for both payment types
- [ ] B01 integration working (document_id linkage)
- [ ] Invoice/bill payment tracking updated
- [ ] Full business cycle complete (Quote → Cash, PR → Cash)

---

## 🔗 References

- **Sales Module:** `PHASE-2-SALES-COMPLETE.md`
- **Purchase Module:** `PHASE-3-PURCHASE-COMPLETE.md`
- **B01 Posting Spine:** `B01-DOCUMENTATION.md`
- **F01 Governance:** `F01-DB-GOVERNED.md`

---

**PATTERN:** Continue proven schema + service + B01 integration  
**TIMELINE:** ~30 minutes (based on Phases 2-3 velocity)  
**IMPACT:** Completes full business cycle from order to cash
