# Phase 2: Sales Module Implementation

**Date:** 2026-01-23  
**Status:** Planning  
**Foundation:** Clean F01/B01 Posting Spine ✅

---

## 🎯 Objective

Rebuild Sales module on clean posting spine foundation following B01 3-layer pattern.

---

## 📋 Scope

### In Scope
1. Sales Quotes (Quote → Order conversion)
2. Sales Orders (Order → Delivery + Invoice)
3. Sales Invoices (Integration with Posting Spine)
4. Revenue Recognition (Posting to GL)

### Out of Scope (Later Phases)
- Sales Returns & Credit Notes (Phase 3)
- Sales Payments & Collections (Phase 3)
- Multi-currency (Phase 4)
- Advanced pricing rules (Phase 4)

---

## 🗂️ Database Schema Design

### Table Structure (F01 Compliant)

#### 1. Sales Quotes
```sql
CREATE TABLE sales_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Quote details
  quote_number varchar(50) NOT NULL,
  quote_date timestamptz NOT NULL,
  valid_until timestamptz,
  
  -- Customer reference
  customer_id uuid,
  customer_name varchar(255) NOT NULL,
  customer_email varchar(255),
  
  -- Status & workflow
  status varchar(20) NOT NULL DEFAULT 'draft',
  -- draft | sent | accepted | rejected | expired | converted
  
  -- Financial
  currency varchar(3) NOT NULL DEFAULT 'USD',
  subtotal numeric(19, 4) NOT NULL,
  tax_total numeric(19, 4) NOT NULL DEFAULT 0,
  total_amount numeric(19, 4) NOT NULL,
  
  -- Line items (JSONB)
  line_items jsonb NOT NULL,
  
  -- Metadata
  notes text,
  terms_conditions text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Conversion tracking
  converted_to_order_id uuid,
  converted_at timestamptz,
  
  -- Audit
  created_by uuid NOT NULL REFERENCES users(id),
  modified_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_quotes_tenant ON sales_quotes(tenant_id);
CREATE INDEX idx_sales_quotes_customer ON sales_quotes(tenant_id, customer_id);
CREATE INDEX idx_sales_quotes_status ON sales_quotes(tenant_id, status);
CREATE UNIQUE INDEX sales_quotes_tenant_number_idx ON sales_quotes(tenant_id, quote_number);
```

#### 2. Sales Orders
```sql
CREATE TABLE sales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Order details
  order_number varchar(50) NOT NULL,
  order_date timestamptz NOT NULL,
  expected_delivery_date timestamptz,
  
  -- Customer reference
  customer_id uuid,
  customer_name varchar(255) NOT NULL,
  customer_email varchar(255),
  
  -- Source tracking
  quote_id uuid REFERENCES sales_quotes(id),
  
  -- Status & workflow
  status varchar(20) NOT NULL DEFAULT 'pending',
  -- pending | confirmed | in_progress | delivered | invoiced | cancelled
  
  -- Financial
  currency varchar(3) NOT NULL DEFAULT 'USD',
  subtotal numeric(19, 4) NOT NULL,
  tax_total numeric(19, 4) NOT NULL DEFAULT 0,
  total_amount numeric(19, 4) NOT NULL,
  
  -- Line items (JSONB)
  line_items jsonb NOT NULL,
  
  -- Delivery tracking
  delivery_address jsonb,
  delivered_at timestamptz,
  
  -- Invoice tracking
  invoiced_at timestamptz,
  invoice_id uuid,
  
  -- Metadata
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Audit
  created_by uuid NOT NULL REFERENCES users(id),
  modified_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_orders_tenant ON sales_orders(tenant_id);
CREATE INDEX idx_sales_orders_customer ON sales_orders(tenant_id, customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(tenant_id, status);
CREATE INDEX idx_sales_orders_quote ON sales_orders(quote_id);
CREATE UNIQUE INDEX sales_orders_tenant_number_idx ON sales_orders(tenant_id, order_number);
```

#### 3. Sales Invoices (Posting Spine Integration)
```sql
CREATE TABLE sales_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Invoice details
  invoice_number varchar(50) NOT NULL,
  invoice_date timestamptz NOT NULL,
  due_date timestamptz NOT NULL,
  
  -- Customer reference
  customer_id uuid,
  customer_name varchar(255) NOT NULL,
  customer_email varchar(255),
  
  -- Source tracking
  order_id uuid REFERENCES sales_orders(id),
  
  -- Status & workflow
  status varchar(20) NOT NULL DEFAULT 'draft',
  -- draft | sent | viewed | paid | partially_paid | overdue | cancelled
  
  -- Financial
  currency varchar(3) NOT NULL DEFAULT 'USD',
  subtotal numeric(19, 4) NOT NULL,
  tax_total numeric(19, 4) NOT NULL DEFAULT 0,
  total_amount numeric(19, 4) NOT NULL,
  amount_paid numeric(19, 4) NOT NULL DEFAULT 0,
  amount_due numeric(19, 4) NOT NULL,
  
  -- Line items (JSONB)
  line_items jsonb NOT NULL,
  
  -- B01 Integration: Link to posting spine document
  document_id uuid REFERENCES documents(id),
  posted_at timestamptz,
  
  -- Payment tracking
  payment_terms varchar(50),
  last_payment_date timestamptz,
  
  -- Metadata
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Audit
  created_by uuid NOT NULL REFERENCES users(id),
  modified_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_invoices_tenant ON sales_invoices(tenant_id);
CREATE INDEX idx_sales_invoices_customer ON sales_invoices(tenant_id, customer_id);
CREATE INDEX idx_sales_invoices_status ON sales_invoices(tenant_id, status);
CREATE INDEX idx_sales_invoices_order ON sales_invoices(order_id);
CREATE INDEX idx_sales_invoices_document ON sales_invoices(document_id);
CREATE INDEX idx_sales_invoices_due ON sales_invoices(tenant_id, due_date) WHERE status IN ('sent', 'viewed', 'partially_paid', 'overdue');
CREATE UNIQUE INDEX sales_invoices_tenant_number_idx ON sales_invoices(tenant_id, invoice_number);
```

---

## 🔧 Service Layer Design

### Service Structure
```
packages/db/src/services/sales/
├── quote-service.ts         # Quote CRUD + conversion
├── order-service.ts         # Order CRUD + fulfillment
├── invoice-service.ts       # Invoice CRUD + posting integration
└── index.ts                 # Barrel exports
```

### Key Functions

#### Quote Service
```typescript
export async function createQuote(db: Database, input: CreateQuoteInput): Promise<SalesQuote>
export async function convertQuoteToOrder(db: Database, quoteId: string, userId: string): Promise<SalesOrder>
export async function updateQuoteStatus(db: Database, quoteId: string, status: QuoteStatus): Promise<SalesQuote>
```

#### Order Service
```typescript
export async function createOrder(db: Database, input: CreateOrderInput): Promise<SalesOrder>
export async function markOrderDelivered(db: Database, orderId: string, deliveryDate: Date): Promise<SalesOrder>
export async function convertOrderToInvoice(db: Database, orderId: string, userId: string): Promise<SalesInvoice>
```

#### Invoice Service (B01 Integration)
```typescript
export async function createInvoice(db: Database, input: CreateInvoiceInput): Promise<SalesInvoice>

export async function postInvoiceToGL(
  db: Database, 
  invoiceId: string,
  postingDate: Date,
  userId: string,
  context: SixW1HContext
): Promise<PostDocumentResult> {
  // 1. Validate invoice is ready for posting
  // 2. Build GL postings (DR AR, CR Revenue, DR COGS, CR Inventory)
  // 3. Call postDocument from posting-spine/document-state
  // 4. Update sales_invoices.document_id and posted_at
  // 5. Return posting spine result
}

export async function reverseInvoice(
  db: Database,
  invoiceId: string,
  reason: string,
  userId: string
): Promise<ReversalResult>
```

---

## 📊 Posting Spine Integration Pattern

### Invoice Posting Flow

```typescript
// When invoice is approved for posting
const result = await postInvoiceToGL(db, invoiceId, postingDate, userId, {
  who: user.email,
  what: `Posted sales invoice ${invoiceNumber}`,
  when: new Date().toISOString(),
  where: "sales-module",
  why: "Revenue recognition",
  which: invoiceNumber,
  how: "B01 Posting Spine"
});

// This creates:
// 1. documents entry (state: 'posted')
// 2. economic_events entry (event_type: 'invoice.posted')
// 3. ledger_postings entries:
//    - DR 1120 Accounts Receivable
//    - CR 4100 Sales Revenue
//    - DR 5100 COGS (if applicable)
//    - CR 1300 Inventory (if applicable)
```

### Reversal Pattern
```typescript
// When invoice needs to be reversed
const reversal = await reverseInvoice(db, invoiceId, "Customer cancellation", userId);

// This creates:
// 1. New document (state: 'posted', reversed_from_id: original)
// 2. New economic_event (is_reversal: 'true')
// 3. Offsetting ledger_postings (opposite direction, same amounts)
```

---

## 🧪 Testing Strategy

### Unit Tests
1. Quote creation & conversion
2. Order lifecycle
3. Invoice creation
4. Posting spine integration
5. Reversal logic

### Integration Tests
1. Quote → Order → Invoice flow
2. GL posting verification
3. Balanced books check
4. Reversal chain integrity

### E2E Test Scenario
```typescript
// Full sales cycle test
1. Create quote for $1,500
2. Convert quote to order
3. Mark order delivered
4. Generate invoice from order
5. Post invoice to GL
6. Verify postings:
   - DR AR: $1,500
   - CR Revenue: $1,500
   - Difference: $0 ✅
7. Reverse invoice
8. Verify reversal postings:
   - CR AR: $1,500
   - DR Revenue: $1,500
   - Net effect: $0 ✅
```

---

## 📝 Implementation Tasks

### Phase 2.1: Schema & Migration (2-3 tasks)
- [ ] Create sales schema files (quotes, orders, invoices)
- [ ] Generate migration SQL
- [ ] Apply migration via Neon MCP

### Phase 2.2: Service Layer (3-4 tasks)
- [ ] Implement quote service
- [ ] Implement order service
- [ ] Implement invoice service with posting integration
- [ ] Add reversal support

### Phase 2.3: Testing (2-3 tasks)
- [ ] Create unit tests
- [ ] Create integration tests
- [ ] Run E2E sales cycle test

### Phase 2.4: Documentation (1 task)
- [ ] Update E00-01-SERVICE-IMPLEMENTATION-SYNC.md

---

## 🎯 Success Criteria

- [ ] All sales tables created in production
- [ ] Services integrated with posting spine
- [ ] E2E test passes (Quote → Order → Invoice → Posted)
- [ ] Balanced books verification passes
- [ ] Reversal pattern works correctly
- [ ] Documentation updated

---

## 📚 References

- `F01-DB-GOVERNED.md` - Database governance
- `B01-DOCUMENTATION.md` - Posting spine architecture
- `packages/db/src/services/posting-spine/` - Posting spine services
- `F01-PRODUCTION-CUTOVER-COMPLETE.md` - Current state
