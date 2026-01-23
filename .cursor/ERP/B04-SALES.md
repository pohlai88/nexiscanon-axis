# B04 — Sales Domain
## Quote → Order → Delivery → Invoice → Payment

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |           |                          |                           |
| :---------------------------: | :---------------------: | :-----------------: | :-------: | :----------------------: | :-----------------------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | **[B04]** | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) |
|            Posting            |         Domains         |         MDM         |   Sales   |         Purchase         |         Inventory         |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §3 (Money + Obligations), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B4
>
> **Tag:** `SALES` | `REVENUE` | `AR` | `PHASE-B4`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B04 Sales schemas follow the **Single Source of Truth** pattern:

| Component            | Source                                           |
| -------------------- | ------------------------------------------------ |
| Status enums         | `@axis/registry/schemas/sales/constants.ts`      |
| Address snapshot     | `@axis/registry/schemas/sales/common.ts`         |
| Quote schema         | `@axis/registry/schemas/sales/quote.ts`          |
| Order schema         | `@axis/registry/schemas/sales/order.ts`          |
| Delivery schema      | `@axis/registry/schemas/sales/delivery.ts`       |
| Invoice schema       | `@axis/registry/schemas/sales/invoice.ts`        |
| Payment schema       | `@axis/registry/schemas/sales/payment.ts`        |
| Credit Note schema   | `@axis/registry/schemas/sales/credit-note.ts`    |
| Sales events         | `@axis/registry/schemas/events/sales.ts`         |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"One complete Money + Obligation loop."*

From A01 §3 (Three Pillars):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE SALES TRUTH                                      │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     A SALE IS NOT COMPLETE UNTIL:                                 ║    │
│    ║     1. THE GOODS ARE DELIVERED (Goods Pillar)                     ║    │
│    ║     2. THE INVOICE IS POSTED (Money Pillar)                       ║    │
│    ║     3. THE PAYMENT IS RECEIVED (Obligations Pillar)               ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    Each step creates immutable events and postings.                          │
│    The posting spine (B01) governs all state transitions.                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without this flow, you have point solutions, not an ERP
- Without this flow, AR subledger drifts from GL
- Without this flow, revenue recognition is guesswork

---

## 2) The Sales Flow

### 2.1 Document Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SALES FLOW                                         │
│                                                                              │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐            │
│  │  QUOTE   │────▶│  ORDER   │────▶│ DELIVERY │────▶│ INVOICE  │            │
│  │  (Draft) │     │(Confirmed)│    │ (Shipped)│     │ (Posted) │            │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘            │
│       │                │                │                │                   │
│       │                │                │                ▼                   │
│       │                │                │          ┌──────────┐              │
│       │                │                │          │ PAYMENT  │              │
│       │                │                │          │(Applied) │              │
│       │                │                │          └──────────┘              │
│       │                │                │                                    │
│       ▼                ▼                ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        EVENTS CREATED                                    ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ Quote Created  │ Order Confirmed │ Delivery Posted │ Invoice Posted     ││
│  │ (commitment    │ (commitment     │ (stock move)    │ (AR + Revenue)     ││
│  │  draft)        │  firmed)        │                 │                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                       POSTINGS CREATED                                   ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │      —         │       —         │ Dr: COGS        │ Dr: AR (Customer)  ││
│  │                │                 │ Cr: Inventory   │ Cr: Revenue        ││
│  │                │                 │                 │ Cr: Tax Payable    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Payment Applied:                                                            │
│  Dr: Cash/Bank                                                               │
│  Cr: AR (Customer)                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Document Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DOCUMENT RELATIONSHIPS                                  │
│                                                                              │
│  Quote (1) ──────────────────▶ Order (0..N)                                  │
│       │                            │                                         │
│       │  "Quote can become         │  "Order can have multiple               │
│       │   multiple orders"         │   partial deliveries"                   │
│       │                            │                                         │
│       ▼                            ▼                                         │
│  Order (1) ──────────────────▶ Delivery (0..N)                               │
│       │                            │                                         │
│       │  "Order can have           │  "Each delivery can be                  │
│       │   multiple deliveries"     │   invoiced separately"                  │
│       │                            │                                         │
│       ▼                            ▼                                         │
│  Delivery (1) ────────────────▶ Invoice (0..1)                               │
│       │                            │                                         │
│       │  "Delivery creates         │  "Invoice creates                       │
│       │   stock move"              │   AR entry"                             │
│       │                            │                                         │
│       │                            ▼                                         │
│       │                      Invoice (1) ──────▶ Payment (0..N)              │
│       │                            │                                         │
│       │                            │  "Invoice can have                      │
│       │                            │   multiple partial payments"            │
│       │                            │                                         │
│       ▼                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    RECONCILIATION STATUS                                 ││
│  │  Invoice.amountDue - SUM(Payments.amount) = Outstanding Balance          ││
│  │  When Outstanding Balance = 0 → Invoice is FULLY PAID                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3) Sales Quote

### 3.1 Quote Purpose

The Quote is a **non-binding commitment** that:
- Captures customer requirements
- Locks pricing for a validity period
- Can convert to one or more Sales Orders

### 3.2 Quote Schema

```typescript
// packages/axis-registry/src/schemas/sales/quote.ts

import { z } from "zod";
import { postingSpineEnvelopeSchema } from "../posting-spine";

export const QUOTE_STATUS = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "converted",
] as const;

export const salesQuoteSchema = postingSpineEnvelopeSchema.extend({
  // Document type identifier
  documentType: z.literal("sales.quote"),
  
  // Quote identity
  quoteNumber: z.string().min(1).max(50),
  
  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255), // Denormalized for display
  
  // Addresses (snapshot at quote time)
  billingAddress: addressSnapshotSchema,
  shippingAddress: addressSnapshotSchema.optional(),
  
  // Quote specifics
  quoteStatus: z.enum(QUOTE_STATUS).default("draft"),
  validUntil: z.string().datetime(),
  
  // Pricing
  priceListId: z.string().uuid().optional(),
  currency: z.string().length(3), // ISO 4217
  
  // Lines
  lines: z.array(salesQuoteLineSchema).min(1),
  
  // Totals (calculated)
  subtotal: z.string(), // Decimal as string
  taxTotal: z.string(),
  discountTotal: z.string(),
  grandTotal: z.string(),
  
  // Terms
  paymentTermId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
  termsAndConditions: z.string().max(5000).optional(),
  
  // Conversion tracking
  convertedToOrderIds: z.array(z.string().uuid()).optional(),
});

export const salesQuoteLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Item
  itemId: z.string().uuid(),
  itemSku: z.string(), // Snapshot
  itemName: z.string(), // Snapshot
  
  // Quantity
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  uomSymbol: z.string(), // Snapshot
  
  // Pricing
  unitPrice: z.string(), // Decimal as string
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),
  
  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),
  
  // Line total
  lineTotal: z.string(), // (qty * unitPrice) - discount + tax
  
  // Notes
  notes: z.string().max(500).optional(),
});

export type SalesQuote = z.infer<typeof salesQuoteSchema>;
export type SalesQuoteLine = z.infer<typeof salesQuoteLineSchema>;
```

### 3.3 Quote State Machine

```
┌─────────┐     ┌──────┐     ┌──────────┐
│  DRAFT  │────▶│ SENT │────▶│ ACCEPTED │────▶ [Convert to Order]
└────┬────┘     └──┬───┘     └──────────┘
     │             │
     │             ├────────▶ REJECTED
     │             │
     ▼             ▼
┌─────────────────────┐
│       EXPIRED       │ (auto-transition when validUntil passes)
└─────────────────────┘
```

| Transition | Trigger | Validation |
| ---------- | ------- | ---------- |
| `draft → sent` | User sends to customer | Lines valid, customer exists |
| `sent → accepted` | Customer accepts | Within validity period |
| `sent → rejected` | Customer rejects | — |
| `* → expired` | System (cron) | `validUntil < NOW()` |
| `accepted → converted` | Create order from quote | Order created successfully |

---

## 4) Sales Order

### 4.1 Order Purpose

The Sales Order is a **binding commitment** that:
- Represents confirmed customer demand
- Can reserve inventory (optional)
- Drives delivery and invoicing

### 4.2 Order Schema

```typescript
// packages/axis-registry/src/schemas/sales/order.ts

export const ORDER_STATUS = [
  "draft",
  "confirmed",
  "partially_delivered",
  "fully_delivered",
  "invoiced",
  "cancelled",
] as const;

export const salesOrderSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("sales.order"),
  
  // Order identity
  orderNumber: z.string().min(1).max(50),
  
  // Source
  sourceQuoteId: z.string().uuid().optional(),
  
  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),
  customerPO: z.string().max(100).optional(), // Customer's PO number
  
  // Addresses
  billingAddress: addressSnapshotSchema,
  shippingAddress: addressSnapshotSchema,
  
  // Order specifics
  orderStatus: z.enum(ORDER_STATUS).default("draft"),
  orderDate: z.string().datetime(),
  requestedDeliveryDate: z.string().datetime().optional(),
  promisedDeliveryDate: z.string().datetime().optional(),
  
  // Pricing
  priceListId: z.string().uuid().optional(),
  currency: z.string().length(3),
  
  // Lines
  lines: z.array(salesOrderLineSchema).min(1),
  
  // Totals
  subtotal: z.string(),
  taxTotal: z.string(),
  discountTotal: z.string(),
  grandTotal: z.string(),
  
  // Terms
  paymentTermId: z.string().uuid().optional(),
  shippingMethod: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  
  // Fulfillment tracking
  deliveryIds: z.array(z.string().uuid()).optional(),
  invoiceIds: z.array(z.string().uuid()).optional(),
});

export const salesOrderLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Item
  itemId: z.string().uuid(),
  itemSku: z.string(),
  itemName: z.string(),
  
  // Quantity
  quantityOrdered: z.number().positive(),
  quantityDelivered: z.number().min(0).default(0),
  quantityInvoiced: z.number().min(0).default(0),
  quantityCancelled: z.number().min(0).default(0),
  uomId: z.string().uuid(),
  uomSymbol: z.string(),
  
  // Reservation (optional)
  reservationId: z.string().uuid().optional(),
  reservedLocationId: z.string().uuid().optional(),
  
  // Pricing
  unitPrice: z.string(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),
  
  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),
  
  // Line total
  lineTotal: z.string(),
  
  // Notes
  notes: z.string().max(500).optional(),
});

export type SalesOrder = z.infer<typeof salesOrderSchema>;
export type SalesOrderLine = z.infer<typeof salesOrderLineSchema>;
```

### 4.3 Order State Machine

```
┌─────────┐     ┌───────────┐     ┌───────────────────┐     ┌─────────────────┐
│  DRAFT  │────▶│ CONFIRMED │────▶│ PARTIALLY_DELIVERED│────▶│ FULLY_DELIVERED │
└────┬────┘     └─────┬─────┘     └───────────────────┘     └────────┬────────┘
     │                │                                               │
     │                │                                               ▼
     ▼                ▼                                         ┌──────────┐
┌──────────┐   ┌──────────┐                                     │ INVOICED │
│CANCELLED │   │CANCELLED │                                     └──────────┘
│(full)    │   │(partial) │
└──────────┘   └──────────┘
```

| Transition | Trigger | Creates |
| ---------- | ------- | ------- |
| `draft → confirmed` | User confirms | `order.confirmed` event |
| `confirmed → partially_delivered` | First delivery posted | — |
| `partially_delivered → fully_delivered` | All lines delivered | — |
| `fully_delivered → invoiced` | All lines invoiced | — |
| `* → cancelled` | User cancels (before full delivery) | `order.cancelled` event |

### 4.4 Order Events

```typescript
// packages/axis-registry/src/schemas/events/sales.ts

export const orderConfirmedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("order.confirmed"),
  
  payload: z.object({
    orderId: z.string().uuid(),
    orderNumber: z.string(),
    customerId: z.string().uuid(),
    customerName: z.string(),
    
    totalAmount: z.string(),
    currency: z.string().length(3),
    
    lineCount: z.number().int().positive(),
    requestedDeliveryDate: z.string().datetime().optional(),
    
    // For inventory reservation
    reservationRequests: z.array(z.object({
      itemId: z.string().uuid(),
      quantity: z.number().positive(),
      uomId: z.string().uuid(),
      locationId: z.string().uuid().optional(),
    })).optional(),
  }),
});

export type OrderConfirmedEvent = z.infer<typeof orderConfirmedEventSchema>;
```

---

## 5) Sales Delivery

### 5.1 Delivery Purpose

The Delivery (or Delivery Note / Shipment) records:
- What was actually shipped to the customer
- Creates stock movements (reduces inventory)
- Enables invoicing

### 5.2 Delivery Schema

```typescript
// packages/axis-registry/src/schemas/sales/delivery.ts

export const DELIVERY_STATUS = [
  "draft",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const salesDeliverySchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("sales.delivery"),
  
  // Delivery identity
  deliveryNumber: z.string().min(1).max(50),
  
  // Source
  sourceOrderId: z.string().uuid(),
  sourceOrderNumber: z.string(),
  
  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),
  
  // Shipping
  shippingAddress: addressSnapshotSchema,
  shippingMethod: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
  
  // Dates
  deliveryStatus: z.enum(DELIVERY_STATUS).default("draft"),
  scheduledDate: z.string().datetime().optional(),
  shippedDate: z.string().datetime().optional(),
  deliveredDate: z.string().datetime().optional(),
  
  // Warehouse
  warehouseId: z.string().uuid(),
  warehouseName: z.string(),
  
  // Lines
  lines: z.array(salesDeliveryLineSchema).min(1),
  
  // Weights/Dimensions (for shipping)
  totalWeight: z.number().min(0).optional(),
  weightUom: z.string().max(10).optional(),
  packageCount: z.number().int().min(1).optional(),
  
  // Notes
  notes: z.string().max(2000).optional(),
  
  // Invoice tracking
  invoiceId: z.string().uuid().optional(),
});

export const salesDeliveryLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Source order line reference
  orderLineNumber: z.number().int().positive(),
  
  // Item
  itemId: z.string().uuid(),
  itemSku: z.string(),
  itemName: z.string(),
  
  // Quantity
  quantityShipped: z.number().positive(),
  uomId: z.string().uuid(),
  uomSymbol: z.string(),
  
  // Location
  fromLocationId: z.string().uuid(),
  fromLocationName: z.string(),
  
  // Lot/Serial (if tracked)
  lotNumber: z.string().max(100).optional(),
  serialNumbers: z.array(z.string().max(100)).optional(),
  
  // Costing (captured at ship time)
  unitCost: z.string(), // Decimal as string (for COGS)
  totalCost: z.string(),
  
  notes: z.string().max(500).optional(),
});

export type SalesDelivery = z.infer<typeof salesDeliverySchema>;
export type SalesDeliveryLine = z.infer<typeof salesDeliveryLineSchema>;
```

### 5.3 Delivery Posting (Stock Movement)

When delivery is **POSTED**, the posting pipeline creates:

```typescript
// Inventory Postings (via B06 Inventory Spine)
{
  moveType: "OUT",
  direction: "outbound",
  itemId: line.itemId,
  quantity: line.quantityShipped,
  uomId: line.uomId,
  fromLocationId: line.fromLocationId,
  toLocationId: null, // Shipped to customer
  
  // Valuation
  unitCost: line.unitCost,
  totalCost: line.totalCost,
  
  // Reference
  sourceDocumentType: "sales.delivery",
  sourceDocumentId: delivery.documentId,
}

// Ledger Postings (COGS recognition)
[
  {
    accountId: cogsAccountId,
    debit: line.totalCost,
    credit: "0",
  },
  {
    accountId: inventoryAccountId,
    debit: "0",
    credit: line.totalCost,
  }
]
```

### 5.4 Delivery Events

```typescript
export const deliveryPostedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("delivery.posted"),
  
  payload: z.object({
    deliveryId: z.string().uuid(),
    deliveryNumber: z.string(),
    orderId: z.string().uuid(),
    orderNumber: z.string(),
    customerId: z.string().uuid(),
    
    warehouseId: z.string().uuid(),
    shippedDate: z.string().datetime(),
    
    lines: z.array(z.object({
      itemId: z.string().uuid(),
      quantityShipped: z.number().positive(),
      unitCost: z.string(),
      totalCost: z.string(),
    })),
    
    // For inventory domain
    stockMoveIds: z.array(z.string().uuid()),
    
    // For accounting domain
    postingBatchId: z.string().uuid(),
  }),
});

export type DeliveryPostedEvent = z.infer<typeof deliveryPostedEventSchema>;
```

---

## 6) Sales Invoice

### 6.1 Invoice Purpose

The Sales Invoice:
- Records revenue recognition
- Creates AR (Accounts Receivable) entry
- Is the basis for payment collection

### 6.2 Invoice Schema

```typescript
// packages/axis-registry/src/schemas/sales/invoice.ts

export const INVOICE_STATUS = [
  "draft",
  "approved",
  "posted",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "reversed",
] as const;

export const salesInvoiceSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("sales.invoice"),
  
  // Invoice identity
  invoiceNumber: z.string().min(1).max(50),
  
  // Source
  sourceOrderId: z.string().uuid().optional(),
  sourceOrderNumber: z.string().optional(),
  sourceDeliveryIds: z.array(z.string().uuid()).optional(),
  
  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),
  customerTaxId: z.string().max(50).optional(),
  
  // Addresses
  billingAddress: addressSnapshotSchema,
  
  // Dates
  invoiceStatus: z.enum(INVOICE_STATUS).default("draft"),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  
  // Pricing
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1), // To base currency
  
  // Lines
  lines: z.array(salesInvoiceLineSchema).min(1),
  
  // Totals
  subtotal: z.string(),
  discountTotal: z.string(),
  taxableAmount: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),
  
  // Payment tracking
  amountPaid: z.string().default("0"),
  amountDue: z.string(), // grandTotal - amountPaid
  
  // Terms
  paymentTermId: z.string().uuid().optional(),
  paymentTermDays: z.number().int().min(0).optional(),
  
  // Notes
  notes: z.string().max(2000).optional(),
  
  // Accounting references
  arAccountId: z.string().uuid(),
  revenueAccountId: z.string().uuid(),
  
  // Payment records
  paymentIds: z.array(z.string().uuid()).optional(),
});

export const salesInvoiceLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Source references
  orderLineNumber: z.number().int().optional(),
  deliveryLineNumber: z.number().int().optional(),
  
  // Item
  itemId: z.string().uuid(),
  itemSku: z.string(),
  itemName: z.string(),
  itemDescription: z.string().max(500).optional(),
  
  // Quantity
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  uomSymbol: z.string(),
  
  // Pricing
  unitPrice: z.string(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),
  
  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxCode: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),
  
  // Revenue account (can vary by item/category)
  revenueAccountId: z.string().uuid(),
  
  // Line total
  lineTotal: z.string(),
  
  notes: z.string().max(500).optional(),
});

export type SalesInvoice = z.infer<typeof salesInvoiceSchema>;
export type SalesInvoiceLine = z.infer<typeof salesInvoiceLineSchema>;
```

### 6.3 Invoice Posting (AR + Revenue)

When invoice is **POSTED**, the posting pipeline creates:

```typescript
// Ledger Postings
const postings: LedgerPosting[] = [];

// 1. Debit AR (customer subledger)
postings.push({
  accountId: invoice.arAccountId,
  partyId: invoice.customerId, // Subledger dimension
  debit: invoice.grandTotal,
  credit: "0",
  currency: invoice.currency,
});

// 2. Credit Revenue (per line, if different accounts)
for (const line of invoice.lines) {
  postings.push({
    accountId: line.revenueAccountId,
    debit: "0",
    credit: line.lineTotal, // Before tax
    currency: invoice.currency,
  });
}

// 3. Credit Tax Payable
if (parseDecimal(invoice.taxTotal) > 0) {
  postings.push({
    accountId: taxPayableAccountId,
    debit: "0",
    credit: invoice.taxTotal,
    currency: invoice.currency,
  });
}

// INVARIANT: SUM(debit) = SUM(credit) = grandTotal
```

### 6.4 Invoice Events

```typescript
export const invoicePostedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("invoice.posted"),
  
  payload: z.object({
    invoiceId: z.string().uuid(),
    invoiceNumber: z.string(),
    customerId: z.string().uuid(),
    customerName: z.string(),
    
    invoiceDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    
    subtotal: z.string(),
    taxTotal: z.string(),
    grandTotal: z.string(),
    currency: z.string().length(3),
    
    // For AR subledger
    arAccountId: z.string().uuid(),
    
    // For accounting domain
    postingBatchId: z.string().uuid(),
    journalId: z.string().uuid(),
    
    // Context
    context6w1h: sixW1HContextSchema,
  }),
});

export type InvoicePostedEvent = z.infer<typeof invoicePostedEventSchema>;
```

---

## 7) Payment Receipt

### 7.1 Payment Purpose

The Payment Receipt:
- Records cash/bank receipt from customer
- Clears AR balance
- Updates invoice payment status

### 7.2 Payment Schema

```typescript
// packages/axis-registry/src/schemas/sales/payment.ts

export const PAYMENT_METHOD = [
  "cash",
  "bank_transfer",
  "check",
  "credit_card",
  "debit_card",
  "e_wallet",
  "other",
] as const;

export const PAYMENT_STATUS = [
  "draft",
  "pending",
  "posted",
  "failed",
  "reversed",
] as const;

export const salesPaymentSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("sales.payment"),
  
  // Payment identity
  paymentNumber: z.string().min(1).max(50),
  
  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),
  
  // Payment details
  paymentStatus: z.enum(PAYMENT_STATUS).default("draft"),
  paymentDate: z.string().datetime(),
  paymentMethod: z.enum(PAYMENT_METHOD),
  
  // Amounts
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),
  amount: z.string(), // Total payment amount
  
  // Bank/Cash account
  bankAccountId: z.string().uuid(),
  bankAccountName: z.string(),
  
  // Reference
  referenceNumber: z.string().max(100).optional(), // Check number, transfer ref
  
  // Allocation to invoices
  allocations: z.array(paymentAllocationSchema).min(1),
  
  // Notes
  notes: z.string().max(2000).optional(),
});

export const paymentAllocationSchema = z.object({
  invoiceId: z.string().uuid(),
  invoiceNumber: z.string(),
  
  invoiceAmount: z.string(), // Original invoice total
  invoiceOutstanding: z.string(), // Outstanding before this payment
  amountAllocated: z.string(), // Amount applied to this invoice
  
  // Discount/Write-off (if applicable)
  discountTaken: z.string().default("0"),
  writeOffAmount: z.string().default("0"),
});

export type SalesPayment = z.infer<typeof salesPaymentSchema>;
export type PaymentAllocation = z.infer<typeof paymentAllocationSchema>;
```

### 7.3 Payment Posting (Cash + AR Clear)

When payment is **POSTED**, the posting pipeline creates:

```typescript
// Ledger Postings
const postings: LedgerPosting[] = [];

// 1. Debit Cash/Bank
postings.push({
  accountId: payment.bankAccountId,
  debit: payment.amount,
  credit: "0",
  currency: payment.currency,
});

// 2. Credit AR (for each allocation)
for (const allocation of payment.allocations) {
  postings.push({
    accountId: arAccountId,
    partyId: payment.customerId,
    debit: "0",
    credit: allocation.amountAllocated,
    currency: payment.currency,
  });
  
  // 3. If discount taken, debit discount account
  if (parseDecimal(allocation.discountTaken) > 0) {
    postings.push({
      accountId: salesDiscountAccountId,
      debit: allocation.discountTaken,
      credit: "0",
    });
  }
  
  // 4. If write-off, debit bad debt account
  if (parseDecimal(allocation.writeOffAmount) > 0) {
    postings.push({
      accountId: badDebtAccountId,
      debit: allocation.writeOffAmount,
      credit: "0",
    });
  }
}

// INVARIANT: SUM(debit) = SUM(credit)
```

### 7.4 Payment Events

```typescript
export const paymentAppliedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("payment.applied"),
  
  payload: z.object({
    paymentId: z.string().uuid(),
    paymentNumber: z.string(),
    customerId: z.string().uuid(),
    
    paymentDate: z.string().datetime(),
    paymentMethod: z.string(),
    amount: z.string(),
    currency: z.string().length(3),
    
    allocations: z.array(z.object({
      invoiceId: z.string().uuid(),
      amountAllocated: z.string(),
      invoiceFullyPaid: z.boolean(),
    })),
    
    // For accounting domain
    postingBatchId: z.string().uuid(),
    
    context6w1h: sixW1HContextSchema,
  }),
});

export type PaymentAppliedEvent = z.infer<typeof paymentAppliedEventSchema>;
```

---

## 8) Credit Note (Returns & Adjustments)

### 8.1 Credit Note Purpose

The Credit Note handles:
- Sales returns
- Pricing adjustments after invoicing
- Discount adjustments

### 8.2 Credit Note Schema

```typescript
// packages/axis-registry/src/schemas/sales/credit-note.ts

export const CREDIT_NOTE_REASON = [
  "return",
  "price_adjustment",
  "quantity_adjustment",
  "quality_issue",
  "billing_error",
  "goodwill",
  "other",
] as const;

export const salesCreditNoteSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("sales.credit_note"),
  
  // Credit Note identity
  creditNoteNumber: z.string().min(1).max(50),
  
  // Source invoice
  sourceInvoiceId: z.string().uuid(),
  sourceInvoiceNumber: z.string(),
  
  // Customer
  customerId: z.string().uuid(),
  customerName: z.string().max(255),
  
  // Credit Note details
  creditNoteDate: z.string().datetime(),
  reason: z.enum(CREDIT_NOTE_REASON),
  reasonDescription: z.string().max(500).optional(),
  
  // Currency (must match invoice)
  currency: z.string().length(3),
  
  // Lines
  lines: z.array(creditNoteLineSchema).min(1),
  
  // Totals
  subtotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),
  
  // Application
  applyToInvoice: z.boolean().default(true), // Reduce invoice balance
  refundRequested: z.boolean().default(false), // Trigger refund process
  
  notes: z.string().max(2000).optional(),
});

export type SalesCreditNote = z.infer<typeof salesCreditNoteSchema>;
```

### 8.3 Credit Note Posting

Credit Note creates **reverse** of invoice posting:

```typescript
// Ledger Postings (opposite of invoice)
[
  {
    accountId: arAccountId,
    partyId: customerId,
    debit: "0",
    credit: creditNote.grandTotal, // Credit AR (reduce receivable)
  },
  {
    accountId: revenueAccountId,
    debit: creditNote.subtotal, // Debit Revenue (reduce revenue)
    credit: "0",
  },
  {
    accountId: taxPayableAccountId,
    debit: creditNote.taxTotal, // Debit Tax (reduce tax liability)
    credit: "0",
  }
]
```

If return involves physical goods, also triggers:
- Stock move IN (return to inventory)
- Inventory valuation entry

---

## 9) AR Subledger Integration

### 9.1 AR Subledger Entries

Every sales posting creates subledger entries for drill-down:

```typescript
// packages/axis-registry/src/schemas/accounting/ar-subledger.ts

export const arSubledgerEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Party
  customerId: z.string().uuid(),
  customerName: z.string(),
  
  // Reference
  documentType: z.enum(["sales.invoice", "sales.payment", "sales.credit_note"]),
  documentId: z.string().uuid(),
  documentNumber: z.string(),
  documentDate: z.string().datetime(),
  
  // Amounts
  debitAmount: z.string(),
  creditAmount: z.string(),
  balance: z.string(), // Running balance after this entry
  
  // Currency
  currency: z.string().length(3),
  baseCurrencyAmount: z.string(), // Converted to base currency
  
  // GL Reference
  journalId: z.string().uuid(),
  postingBatchId: z.string().uuid(),
  
  // Dates
  effectiveDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
});

export type ARSubledgerEntry = z.infer<typeof arSubledgerEntrySchema>;
```

### 9.2 AR Aging

```typescript
// packages/db/src/queries/sales/ar-aging.ts

export interface ARAgingBucket {
  customerId: string;
  customerName: string;
  currency: string;
  current: string;      // Not yet due
  days1to30: string;    // 1-30 days overdue
  days31to60: string;   // 31-60 days overdue
  days61to90: string;   // 61-90 days overdue
  over90: string;       // 90+ days overdue
  total: string;
}

export async function getARAgingReport(
  db: Database,
  tenantId: string,
  asOfDate: Date = new Date()
): Promise<ARAgingBucket[]> {
  // Query open invoices and bucket by days overdue
  // ...
}
```

---

## 10) Reconciliation Status

### 10.1 Invoice-Payment Reconciliation

```typescript
// packages/axis-registry/src/schemas/sales/reconciliation.ts

export const INVOICE_RECONCILIATION_STATUS = [
  "open",           // No payments yet
  "partial",        // Some payments applied
  "paid",           // Fully paid
  "overpaid",       // More than invoiced amount
  "credited",       // Offset by credit note
  "written_off",    // Bad debt written off
] as const;

export const invoiceReconciliationSchema = z.object({
  invoiceId: z.string().uuid(),
  invoiceNumber: z.string(),
  
  status: z.enum(INVOICE_RECONCILIATION_STATUS),
  
  originalAmount: z.string(),
  paidAmount: z.string(),
  creditedAmount: z.string(),
  writtenOffAmount: z.string(),
  outstandingAmount: z.string(),
  
  payments: z.array(z.object({
    paymentId: z.string().uuid(),
    paymentNumber: z.string(),
    paymentDate: z.string().datetime(),
    amount: z.string(),
  })),
  
  creditNotes: z.array(z.object({
    creditNoteId: z.string().uuid(),
    creditNoteNumber: z.string(),
    amount: z.string(),
  })),
  
  lastUpdated: z.string().datetime(),
});

export type InvoiceReconciliation = z.infer<typeof invoiceReconciliationSchema>;
```

### 10.2 Order Fulfillment Status

```typescript
export const ORDER_FULFILLMENT_STATUS = [
  "unfulfilled",       // Nothing delivered yet
  "partially_fulfilled", // Some lines delivered
  "fulfilled",         // All lines delivered
  "over_fulfilled",    // More than ordered (rare, with approval)
] as const;

export const orderFulfillmentSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string(),
  
  status: z.enum(ORDER_FULFILLMENT_STATUS),
  
  lines: z.array(z.object({
    lineNumber: z.number(),
    itemSku: z.string(),
    quantityOrdered: z.number(),
    quantityDelivered: z.number(),
    quantityInvoiced: z.number(),
    quantityCancelled: z.number(),
    quantityOutstanding: z.number(),
  })),
  
  lastUpdated: z.string().datetime(),
});

export type OrderFulfillment = z.infer<typeof orderFulfillmentSchema>;
```

---

## 11) Sales Configuration

### 11.1 Tenant Sales Settings

```typescript
// packages/axis-registry/src/schemas/sales/config.ts

export const salesConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Numbering
  quoteNumberPrefix: z.string().max(10).default("QUO-"),
  orderNumberPrefix: z.string().max(10).default("SO-"),
  deliveryNumberPrefix: z.string().max(10).default("DN-"),
  invoiceNumberPrefix: z.string().max(10).default("INV-"),
  paymentNumberPrefix: z.string().max(10).default("REC-"),
  creditNoteNumberPrefix: z.string().max(10).default("CN-"),
  
  // Defaults
  defaultPriceListId: z.string().uuid().optional(),
  defaultPaymentTermId: z.string().uuid().optional(),
  defaultWarehouseId: z.string().uuid().optional(),
  defaultArAccountId: z.string().uuid(),
  defaultRevenueAccountId: z.string().uuid(),
  
  // Tax
  defaultTaxCodeId: z.string().uuid().optional(),
  pricesIncludeTax: z.boolean().default(false),
  
  // Policies
  requireQuoteBeforeOrder: z.boolean().default(false),
  requireDeliveryBeforeInvoice: z.boolean().default(true),
  allowPartialDelivery: z.boolean().default(true),
  allowPartialInvoice: z.boolean().default(true),
  allowNegativeStock: z.boolean().default(false),
  
  // Credit Control
  enableCreditLimit: z.boolean().default(true),
  creditCheckOnOrderConfirm: z.boolean().default(true),
  blockOrdersOnCreditExceed: z.boolean().default(false), // Danger Zone if false
  
  // Approvals
  quoteApprovalRequired: z.boolean().default(false),
  quoteApprovalThreshold: z.string().optional(),
  orderApprovalRequired: z.boolean().default(false),
  orderApprovalThreshold: z.string().optional(),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type SalesConfig = z.infer<typeof salesConfigSchema>;
```

---

## 12) Exit Criteria (B4 Gate)

**B4 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                                      | Verified | Implementation                               |
| --- | -------------------------------------------------------------- | -------- | -------------------------------------------- |
| 1   | Quote → Order → Delivery → Invoice lifecycle works             | ✅        | Schemas + Drizzle tables                     |
| 2   | Delivery posting creates stock move + COGS entry               | ⏳        | Pending B06 Inventory                        |
| 3   | Invoice posting creates AR subledger entry                     | ⏳        | Pending B07 Accounting                       |
| 4   | Invoice posting creates GL journal (Dr AR, Cr Revenue, Cr Tax) | ⏳        | Pending B07 Accounting                       |
| 5   | Payment application clears AR                                  | ⏳        | Pending B07 Accounting                       |
| 6   | Trial balance stays balanced after full cycle                  | ⏳        | Pending B07 Accounting                       |
| 7   | Invoice ↔ Payment reconciliation status visible                | ✅        | `invoiceReconciliationSchema` defined        |
| 8   | Order ↔ Delivery fulfillment status visible                    | ✅        | `orderFulfillmentSchema` defined             |
| 9   | Credit Note reverses invoice correctly                         | ✅        | Schema + table defined                       |
| 10  | All sales events published to outbox                           | ✅        | B02 outbox integration ready                 |

### Implementation Files

| Component          | Location                                              |
| ------------------ | ----------------------------------------------------- |
| Sales Constants    | `packages/axis-registry/src/schemas/sales/constants.ts` |
| Sales Schemas      | `packages/axis-registry/src/schemas/sales/*.ts`       |
| Sales Tables       | `packages/db/src/schema/sales/*.ts`                   |
| Sales Events       | `packages/axis-registry/src/schemas/events/sales.ts`  |

---

## 13) Integration with Other Phases

| Phase               | Dependency on B04        | What B04 Provides                    |
| ------------------- | ------------------------ | ------------------------------------ |
| **B01** (Posting)   | Posting spine            | Document state machine, postings     |
| **B02** (Domains)   | Event contracts          | Sales event schemas                  |
| **B03** (MDM)       | Customer, Item, Tax      | Valid references for documents       |
| **B05** (Purchase)  | —                        | —                                    |
| **B06** (Inventory) | Delivery posting         | Stock move requests                  |
| **B07** (Accounting)| Invoice/Payment posting  | Journal entries, AR subledger        |
| **B08** (Controls)  | Credit limit check       | Danger Zone detection                |
| **B09** (Reconciliation) | AR aging, fulfillment | Reconciliation data                  |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B4 (Sales)                                      |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: Full integration with B06 (Inventory) and B07 (Accounting) pending those phases.

---

## Related Documents

| Document                               | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md) | Philosophy: §3 (Money + Obligations)       |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)   | Roadmap: Phase B4 definition               |
| [B01-DOCUMENTATION.md](./B01-DOCUMENTATION.md) | Posting Spine (document lifecycle) |
| [B02-DOMAINS.md](./B02-DOMAINS.md)     | Domain boundaries (Sales domain)           |
| [B03-MDM.md](./B03-MDM.md)             | Master Data (Customers, Items, Tax)        |
| [B05-PURCHASE.md](./B05-PURCHASE.md)   | Purchase domain (symmetric flow)           |
| [B06-INVENTORY.md](./B06-INVENTORY.md) | Inventory (stock moves from delivery)      |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md) | Accounting (journal entries)             |

---

> *"A sale is not complete until: goods are delivered, invoice is posted, payment is received. Each step creates immutable truth."*
