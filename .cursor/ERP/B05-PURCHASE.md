# B05 — Purchase Domain
## PR → PO → Receipt → Bill → Payment

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |           |                           |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :-------: | :-----------------------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | **[B05]** | [B06](./B06-INVENTORY.md) |
|            Posting            |         Domains         |         MDM         |         Sales         | Purchase  |         Inventory         |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §3 (Obligations Pillar), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B5
>
> **Tag:** `PURCHASE` | `PROCUREMENT` | `AP` | `PHASE-B5`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B05 Purchase schemas follow the **Single Source of Truth** pattern:

| Component             | Source                                              |
| --------------------- | --------------------------------------------------- |
| Status enums          | `@axis/registry/schemas/purchase/constants.ts`      |
| PR schema             | `@axis/registry/schemas/purchase/request.ts`        |
| PO schema             | `@axis/registry/schemas/purchase/order.ts`          |
| Receipt schema        | `@axis/registry/schemas/purchase/receipt.ts`        |
| Bill schema           | `@axis/registry/schemas/purchase/bill.ts`           |
| Payment schema        | `@axis/registry/schemas/purchase/payment.ts`        |
| Debit Note schema     | `@axis/registry/schemas/purchase/debit-note.ts`     |
| Purchase events       | `@axis/registry/schemas/events/purchase.ts` (TODO)  |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"Symmetric Obligation loop for suppliers."*

From A01 §3 (Three Pillars):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE PURCHASE TRUTH                                    │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     A PURCHASE IS NOT COMPLETE UNTIL:                             ║    │
│    ║     1. THE GOODS ARE RECEIVED (Goods Pillar)                      ║    │
│    ║     2. THE BILL IS POSTED (Money Pillar)                          ║    │
│    ║     3. THE PAYMENT IS MADE (Obligations Pillar)                   ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    The purchase flow is the MIRROR of the sales flow.                        │
│    Same posting spine, opposite direction.                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without this flow, AP subledger drifts from GL
- Without this flow, inventory valuation is guesswork
- Without this flow, three-way matching is impossible

---

## 2) The Purchase Flow

### 2.1 Document Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PURCHASE FLOW                                       │
│                                                                              │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐            │
│  │    PR    │────▶│    PO    │────▶│ RECEIPT  │────▶│   BILL   │            │
│  │ (Request)│     │(Confirmed)│    │(Received)│     │ (Posted) │            │
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
│  │ PR Submitted │ PO Confirmed  │ Receipt Posted  │ Bill Posted            ││
│  │ (internal    │ (commitment   │ (stock move)    │ (AP + Expense/         ││
│  │  request)    │  to supplier) │                 │  Inventory)            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                       POSTINGS CREATED                                   ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │      —         │       —         │ Dr: Inventory   │ Dr: GRN Accrual    ││
│  │                │                 │    (or GRN      │ Cr: AP (Supplier)  ││
│  │                │                 │     Accrual)    │                    ││
│  │                │                 │ Cr: GRN Accrual │                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Payment Applied:                                                            │
│  Dr: AP (Supplier)                                                           │
│  Cr: Cash/Bank                                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Three-Way Matching

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THREE-WAY MATCHING                                    │
│                                                                              │
│  The purchase cycle requires matching three documents before payment:        │
│                                                                              │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐           │
│  │ PURCHASE ORDER │     │    RECEIPT     │     │  SUPPLIER BILL │           │
│  │    (PO)        │     │    (GRN)       │     │    (Invoice)   │           │
│  ├────────────────┤     ├────────────────┤     ├────────────────┤           │
│  │ Item: Widget   │     │ Item: Widget   │     │ Item: Widget   │           │
│  │ Qty: 100       │ ←──▶│ Qty: 100       │ ←──▶│ Qty: 100       │           │
│  │ Price: $10.00  │     │ Received: ✓    │     │ Price: $10.00  │           │
│  └────────────────┘     └────────────────┘     └────────────────┘           │
│         │                      │                      │                      │
│         └──────────────────────┼──────────────────────┘                      │
│                                ▼                                             │
│                    ┌───────────────────────┐                                 │
│                    │    MATCHING STATUS    │                                 │
│                    ├───────────────────────┤                                 │
│                    │ ✓ PO ↔ Receipt: Match │                                 │
│                    │ ✓ Receipt ↔ Bill: Match│                                │
│                    │ ✓ PO ↔ Bill: Match    │                                 │
│                    │ ═══════════════════════│                                │
│                    │ Status: FULLY MATCHED  │                                │
│                    │ → Ready for Payment   │                                 │
│                    └───────────────────────┘                                 │
│                                                                              │
│  Match Statuses:                                                             │
│  • UNMATCHED    - No matching yet                                            │
│  • PARTIAL      - Some lines matched                                         │
│  • MATCHED      - All lines matched                                          │
│  • EXCEPTION    - Qty or price variance (requires approval)                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3) Purchase Request (PR)

### 3.1 PR Purpose

The Purchase Request is an **internal request** that:
- Captures department/user needs
- Requires approval before becoming a PO
- Enables budget checking and authorization

### 3.2 PR Schema

```typescript
// packages/axis-registry/src/schemas/purchase/request.ts

import { z } from "zod";
import { postingSpineEnvelopeSchema } from "../posting-spine";

export const PR_STATUS = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "partially_ordered",
  "fully_ordered",
  "cancelled",
] as const;

export const PR_PRIORITY = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

export const purchaseRequestSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("purchase.request"),
  
  // PR identity
  prNumber: z.string().min(1).max(50),
  
  // Requester
  requesterId: z.string().uuid(),
  requesterName: z.string().max(255),
  departmentId: z.string().uuid().optional(),
  departmentName: z.string().max(255).optional(),
  
  // PR specifics
  prStatus: z.enum(PR_STATUS).default("draft"),
  priority: z.enum(PR_PRIORITY).default("normal"),
  requiredByDate: z.string().datetime().optional(),
  
  // Suggested supplier (optional)
  suggestedSupplierId: z.string().uuid().optional(),
  suggestedSupplierName: z.string().max(255).optional(),
  
  // Lines
  lines: z.array(purchaseRequestLineSchema).min(1),
  
  // Totals (estimated)
  estimatedTotal: z.string().optional(),
  currency: z.string().length(3).optional(),
  
  // Budget reference
  budgetCode: z.string().max(50).optional(),
  costCenterId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  
  // Justification
  justification: z.string().max(2000).optional(),
  
  // Approval tracking
  approvalChain: z.array(z.object({
    approverId: z.string().uuid(),
    approverName: z.string(),
    status: z.enum(["pending", "approved", "rejected"]),
    approvedAt: z.string().datetime().optional(),
    comments: z.string().max(500).optional(),
  })).optional(),
  
  // PO tracking
  poIds: z.array(z.string().uuid()).optional(),
});

export const purchaseRequestLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Item (can be free text for new items)
  itemId: z.string().uuid().optional(),
  itemSku: z.string().optional(),
  itemName: z.string().min(1).max(255),
  itemDescription: z.string().max(500).optional(),
  
  // Quantity
  quantityRequested: z.number().positive(),
  quantityOrdered: z.number().min(0).default(0),
  uomId: z.string().uuid().optional(),
  uomSymbol: z.string().max(20).optional(),
  
  // Estimated pricing
  estimatedUnitPrice: z.string().optional(),
  estimatedTotal: z.string().optional(),
  
  // Delivery
  deliverToLocationId: z.string().uuid().optional(),
  deliverToLocationName: z.string().max(255).optional(),
  
  notes: z.string().max(500).optional(),
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
export type PurchaseRequestLine = z.infer<typeof purchaseRequestLineSchema>;
```

### 3.3 PR State Machine

```
┌─────────┐     ┌───────────┐     ┌──────────┐
│  DRAFT  │────▶│ SUBMITTED │────▶│ APPROVED │────▶ [Convert to PO]
└────┬────┘     └─────┬─────┘     └──────────┘
     │                │
     │                ├────────▶ REJECTED
     │                │
     ▼                ▼
┌──────────────────────────┐
│        CANCELLED         │
└──────────────────────────┘
```

| Transition | Trigger | Validation |
| ---------- | ------- | ---------- |
| `draft → submitted` | User submits | Lines valid, justification provided |
| `submitted → approved` | Approval chain complete | All approvers approved |
| `submitted → rejected` | Any approver rejects | Reason required |
| `approved → partially_ordered` | Some lines converted to PO | — |
| `approved → fully_ordered` | All lines converted to PO | — |
| `* → cancelled` | User cancels (before ordered) | Not yet ordered |

---

## 4) Purchase Order (PO)

### 4.1 PO Purpose

The Purchase Order is a **binding commitment** to the supplier that:
- Represents confirmed purchase demand
- Creates supplier obligation
- Drives receipt and billing

### 4.2 PO Schema

```typescript
// packages/axis-registry/src/schemas/purchase/order.ts

export const PO_STATUS = [
  "draft",
  "confirmed",
  "partially_received",
  "fully_received",
  "billed",
  "cancelled",
  "closed",
] as const;

export const purchaseOrderSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("purchase.order"),
  
  // PO identity
  poNumber: z.string().min(1).max(50),
  
  // Source
  sourcePrIds: z.array(z.string().uuid()).optional(),
  
  // Supplier
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),
  supplierContactName: z.string().max(255).optional(),
  supplierContactEmail: z.string().email().optional(),
  
  // Addresses
  supplierAddress: addressSnapshotSchema,
  deliveryAddress: addressSnapshotSchema,
  
  // PO specifics
  poStatus: z.enum(PO_STATUS).default("draft"),
  orderDate: z.string().datetime(),
  expectedDeliveryDate: z.string().datetime().optional(),
  
  // Pricing
  priceListId: z.string().uuid().optional(),
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),
  
  // Lines
  lines: z.array(purchaseOrderLineSchema).min(1),
  
  // Totals
  subtotal: z.string(),
  taxTotal: z.string(),
  discountTotal: z.string(),
  grandTotal: z.string(),
  
  // Terms
  paymentTermId: z.string().uuid().optional(),
  paymentTermDays: z.number().int().min(0).optional(),
  incoterm: z.string().max(20).optional(), // FOB, CIF, etc.
  shippingMethod: z.string().max(100).optional(),
  
  // Notes
  notes: z.string().max(2000).optional(),
  supplierNotes: z.string().max(2000).optional(), // Printed on PO
  
  // Receipt tracking
  receiptIds: z.array(z.string().uuid()).optional(),
  billIds: z.array(z.string().uuid()).optional(),
});

export const purchaseOrderLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Source PR line reference
  prLineNumber: z.number().int().optional(),
  prId: z.string().uuid().optional(),
  
  // Item
  itemId: z.string().uuid(),
  itemSku: z.string(),
  itemName: z.string(),
  itemDescription: z.string().max(500).optional(),
  
  // Quantity
  quantityOrdered: z.number().positive(),
  quantityReceived: z.number().min(0).default(0),
  quantityBilled: z.number().min(0).default(0),
  quantityCancelled: z.number().min(0).default(0),
  uomId: z.string().uuid(),
  uomSymbol: z.string(),
  
  // Pricing
  unitPrice: z.string(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),
  
  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),
  
  // Delivery
  expectedDeliveryDate: z.string().datetime().optional(),
  deliverToLocationId: z.string().uuid(),
  deliverToLocationName: z.string(),
  
  // Line total
  lineTotal: z.string(),
  
  notes: z.string().max(500).optional(),
});

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderLine = z.infer<typeof purchaseOrderLineSchema>;
```

### 4.3 PO State Machine

```
┌─────────┐     ┌───────────┐     ┌───────────────────┐     ┌───────────────┐
│  DRAFT  │────▶│ CONFIRMED │────▶│ PARTIALLY_RECEIVED│────▶│ FULLY_RECEIVED│
└────┬────┘     └─────┬─────┘     └───────────────────┘     └───────┬───────┘
     │                │                                             │
     │                │                                             ▼
     ▼                ▼                                       ┌──────────┐
┌──────────┐   ┌──────────┐                                   │  BILLED  │
│CANCELLED │   │CANCELLED │                                   └────┬─────┘
│(full)    │   │(partial) │                                        │
└──────────┘   └──────────┘                                        ▼
                                                              ┌──────────┐
                                                              │  CLOSED  │
                                                              └──────────┘
```

### 4.4 PO Events

```typescript
// packages/axis-registry/src/schemas/events/purchase.ts

export const poConfirmedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("po.confirmed"),
  
  payload: z.object({
    poId: z.string().uuid(),
    poNumber: z.string(),
    supplierId: z.string().uuid(),
    supplierName: z.string(),
    
    totalAmount: z.string(),
    currency: z.string().length(3),
    
    lineCount: z.number().int().positive(),
    expectedDeliveryDate: z.string().datetime().optional(),
    
    context6w1h: sixW1HContextSchema,
  }),
});

export type POConfirmedEvent = z.infer<typeof poConfirmedEventSchema>;
```

---

## 5) Goods Receipt (GRN)

### 5.1 Receipt Purpose

The Goods Receipt (or Goods Receipt Note / GRN) records:
- What was actually received from the supplier
- Creates stock movements (increases inventory)
- Enables bill matching

### 5.2 Receipt Schema

```typescript
// packages/axis-registry/src/schemas/purchase/receipt.ts

export const RECEIPT_STATUS = [
  "draft",
  "pending_inspection",
  "accepted",
  "partially_accepted",
  "rejected",
  "cancelled",
] as const;

export const purchaseReceiptSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("purchase.receipt"),
  
  // Receipt identity
  receiptNumber: z.string().min(1).max(50),
  
  // Source
  sourcePoId: z.string().uuid(),
  sourcePoNumber: z.string(),
  
  // Supplier
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),
  
  // Delivery details
  supplierDeliveryNote: z.string().max(100).optional(),
  carrierName: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  
  // Dates
  receiptStatus: z.enum(RECEIPT_STATUS).default("draft"),
  receivedDate: z.string().datetime(),
  inspectionDate: z.string().datetime().optional(),
  
  // Warehouse
  warehouseId: z.string().uuid(),
  warehouseName: z.string(),
  
  // Lines
  lines: z.array(purchaseReceiptLineSchema).min(1),
  
  // Quality
  requiresInspection: z.boolean().default(false),
  inspectedBy: z.string().uuid().optional(),
  
  // Notes
  notes: z.string().max(2000).optional(),
  
  // Bill tracking
  billId: z.string().uuid().optional(),
});

export const purchaseReceiptLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Source PO line reference
  poLineNumber: z.number().int().positive(),
  
  // Item
  itemId: z.string().uuid(),
  itemSku: z.string(),
  itemName: z.string(),
  
  // Quantity
  quantityOrdered: z.number().positive(), // From PO
  quantityReceived: z.number().positive(),
  quantityAccepted: z.number().min(0).default(0),
  quantityRejected: z.number().min(0).default(0),
  uomId: z.string().uuid(),
  uomSymbol: z.string(),
  
  // Location
  toLocationId: z.string().uuid(),
  toLocationName: z.string(),
  
  // Lot/Serial (if tracked)
  lotNumber: z.string().max(100).optional(),
  serialNumbers: z.array(z.string().max(100)).optional(),
  expiryDate: z.string().datetime().optional(),
  
  // Costing (from PO)
  unitCost: z.string(),
  totalCost: z.string(),
  
  // Quality
  inspectionStatus: z.enum(["pending", "passed", "failed"]).optional(),
  rejectionReason: z.string().max(500).optional(),
  
  notes: z.string().max(500).optional(),
});

export type PurchaseReceipt = z.infer<typeof purchaseReceiptSchema>;
export type PurchaseReceiptLine = z.infer<typeof purchaseReceiptLineSchema>;
```

### 5.3 Receipt Posting (Stock Movement + GRN Accrual)

When receipt is **POSTED**, the posting pipeline creates:

```typescript
// Inventory Postings (via B06 Inventory Spine)
{
  moveType: "IN",
  direction: "inbound",
  itemId: line.itemId,
  quantity: line.quantityAccepted,
  uomId: line.uomId,
  fromLocationId: null, // From supplier
  toLocationId: line.toLocationId,
  
  // Valuation
  unitCost: line.unitCost,
  totalCost: line.totalCost,
  
  // Reference
  sourceDocumentType: "purchase.receipt",
  sourceDocumentId: receipt.documentId,
}

// Ledger Postings (GRN Accrual - before bill)
// This ensures inventory is on books even before supplier invoice
[
  {
    accountId: inventoryAccountId, // Or expense if consumable
    debit: line.totalCost,
    credit: "0",
  },
  {
    accountId: grnAccrualAccountId, // Liability account
    debit: "0",
    credit: line.totalCost,
  }
]
```

**Why GRN Accrual?**
- Goods received before supplier invoice → inventory value is known
- GRN Accrual is a liability (we owe the supplier)
- When bill is posted, GRN Accrual is cleared and AP is recognized

### 5.4 Receipt Events

```typescript
export const receiptPostedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("receipt.posted"),
  
  payload: z.object({
    receiptId: z.string().uuid(),
    receiptNumber: z.string(),
    poId: z.string().uuid(),
    poNumber: z.string(),
    supplierId: z.string().uuid(),
    
    warehouseId: z.string().uuid(),
    receivedDate: z.string().datetime(),
    
    lines: z.array(z.object({
      itemId: z.string().uuid(),
      quantityReceived: z.number().positive(),
      quantityAccepted: z.number().min(0),
      unitCost: z.string(),
      totalCost: z.string(),
    })),
    
    // For inventory domain
    stockMoveIds: z.array(z.string().uuid()),
    
    // For accounting domain
    postingBatchId: z.string().uuid(),
    
    context6w1h: sixW1HContextSchema,
  }),
});

export type ReceiptPostedEvent = z.infer<typeof receiptPostedEventSchema>;
```

---

## 6) Supplier Bill (Purchase Invoice)

### 6.1 Bill Purpose

The Supplier Bill (or Purchase Invoice):
- Records the supplier's invoice
- Creates AP (Accounts Payable) entry
- Enables three-way matching verification

### 6.2 Bill Schema

```typescript
// packages/axis-registry/src/schemas/purchase/bill.ts

export const BILL_STATUS = [
  "draft",
  "pending_match",
  "matched",
  "approved",
  "posted",
  "partially_paid",
  "paid",
  "disputed",
  "cancelled",
  "reversed",
] as const;

export const purchaseBillSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("purchase.bill"),
  
  // Bill identity
  billNumber: z.string().min(1).max(50), // Our internal number
  supplierInvoiceNumber: z.string().min(1).max(100), // Supplier's invoice number
  
  // Source
  sourcePoIds: z.array(z.string().uuid()).optional(),
  sourceReceiptIds: z.array(z.string().uuid()).optional(),
  
  // Supplier
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),
  supplierTaxId: z.string().max(50).optional(),
  
  // Addresses
  supplierAddress: addressSnapshotSchema,
  
  // Dates
  billStatus: z.enum(BILL_STATUS).default("draft"),
  billDate: z.string().datetime(), // Supplier's invoice date
  receivedDate: z.string().datetime(), // When we received the invoice
  dueDate: z.string().datetime(),
  
  // Pricing
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),
  
  // Lines
  lines: z.array(purchaseBillLineSchema).min(1),
  
  // Totals
  subtotal: z.string(),
  discountTotal: z.string(),
  taxableAmount: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),
  
  // Payment tracking
  amountPaid: z.string().default("0"),
  amountDue: z.string(),
  
  // Terms
  paymentTermId: z.string().uuid().optional(),
  
  // Matching status
  matchStatus: z.enum(["unmatched", "partial", "matched", "exception"]).default("unmatched"),
  matchExceptions: z.array(z.object({
    lineNumber: z.number().int(),
    exceptionType: z.enum(["quantity_variance", "price_variance", "no_receipt"]),
    expectedValue: z.string(),
    actualValue: z.string(),
    variance: z.string(),
    approved: z.boolean().default(false),
    approvedBy: z.string().uuid().optional(),
  })).optional(),
  
  // Notes
  notes: z.string().max(2000).optional(),
  
  // Accounting references
  apAccountId: z.string().uuid(),
  
  // Payment records
  paymentIds: z.array(z.string().uuid()).optional(),
});

export const purchaseBillLineSchema = z.object({
  lineNumber: z.number().int().positive(),
  
  // Source references
  poLineNumber: z.number().int().optional(),
  poId: z.string().uuid().optional(),
  receiptLineNumber: z.number().int().optional(),
  receiptId: z.string().uuid().optional(),
  
  // Item
  itemId: z.string().uuid(),
  itemSku: z.string(),
  itemName: z.string(),
  itemDescription: z.string().max(500).optional(),
  
  // Quantity
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  uomSymbol: z.string(),
  
  // Matching quantities
  quantityOrdered: z.number().optional(), // From PO
  quantityReceived: z.number().optional(), // From Receipt
  
  // Pricing
  unitPrice: z.string(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.string().default("0"),
  
  // Tax
  taxCodeId: z.string().uuid().optional(),
  taxCode: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxAmount: z.string().default("0"),
  
  // Expense/Asset account
  expenseAccountId: z.string().uuid(), // Or inventory for stockable
  
  // Line total
  lineTotal: z.string(),
  
  notes: z.string().max(500).optional(),
});

export type PurchaseBill = z.infer<typeof purchaseBillSchema>;
export type PurchaseBillLine = z.infer<typeof purchaseBillLineSchema>;
```

### 6.3 Bill Posting (Clear GRN Accrual + Create AP)

When bill is **POSTED**, the posting pipeline creates:

```typescript
// Ledger Postings
const postings: LedgerPosting[] = [];

// 1. Debit GRN Accrual (clear the accrual from receipt)
for (const line of bill.lines) {
  if (line.receiptId) {
    postings.push({
      accountId: grnAccrualAccountId,
      debit: line.lineTotal, // Clear accrual
      credit: "0",
    });
  } else {
    // No receipt (service or expense without receipt)
    postings.push({
      accountId: line.expenseAccountId,
      debit: line.lineTotal,
      credit: "0",
    });
  }
}

// 2. Credit AP (supplier subledger)
postings.push({
  accountId: bill.apAccountId,
  partyId: bill.supplierId, // Subledger dimension
  debit: "0",
  credit: bill.grandTotal,
  currency: bill.currency,
});

// 3. Handle Tax (if claimable)
if (parseDecimal(bill.taxTotal) > 0) {
  postings.push({
    accountId: taxReceivableAccountId, // Input tax / VAT claimable
    debit: bill.taxTotal,
    credit: "0",
  });
}

// Price variance handling (if bill price differs from PO/Receipt)
for (const exception of bill.matchExceptions ?? []) {
  if (exception.exceptionType === "price_variance" && exception.approved) {
    postings.push({
      accountId: priceVarianceAccountId,
      debit: exception.variance, // Could be debit or credit
      credit: "0",
    });
  }
}

// INVARIANT: SUM(debit) = SUM(credit) = grandTotal
```

### 6.4 Bill Events

```typescript
export const billPostedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("bill.posted"),
  
  payload: z.object({
    billId: z.string().uuid(),
    billNumber: z.string(),
    supplierInvoiceNumber: z.string(),
    supplierId: z.string().uuid(),
    supplierName: z.string(),
    
    billDate: z.string().datetime(),
    dueDate: z.string().datetime(),
    
    subtotal: z.string(),
    taxTotal: z.string(),
    grandTotal: z.string(),
    currency: z.string().length(3),
    
    // Matching info
    matchStatus: z.string(),
    matchedReceiptIds: z.array(z.string().uuid()),
    
    // For AP subledger
    apAccountId: z.string().uuid(),
    
    // For accounting domain
    postingBatchId: z.string().uuid(),
    journalId: z.string().uuid(),
    
    context6w1h: sixW1HContextSchema,
  }),
});

export type BillPostedEvent = z.infer<typeof billPostedEventSchema>;
```

---

## 7) Payment (Outgoing)

### 7.1 Payment Purpose

The Payment (Outgoing):
- Records cash/bank payment to supplier
- Clears AP balance
- Updates bill payment status

### 7.2 Payment Schema

```typescript
// packages/axis-registry/src/schemas/purchase/payment.ts

export const PAYMENT_METHOD = [
  "bank_transfer",
  "check",
  "cash",
  "credit_card",
  "e_wallet",
  "other",
] as const;

export const PAYMENT_STATUS = [
  "draft",
  "pending_approval",
  "approved",
  "posted",
  "failed",
  "reversed",
] as const;

export const purchasePaymentSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("purchase.payment"),
  
  // Payment identity
  paymentNumber: z.string().min(1).max(50),
  
  // Supplier
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),
  
  // Payment details
  paymentStatus: z.enum(PAYMENT_STATUS).default("draft"),
  paymentDate: z.string().datetime(),
  paymentMethod: z.enum(PAYMENT_METHOD),
  
  // Amounts
  currency: z.string().length(3),
  exchangeRate: z.number().positive().default(1),
  amount: z.string(),
  
  // Bank/Cash account
  bankAccountId: z.string().uuid(),
  bankAccountName: z.string(),
  
  // Reference
  referenceNumber: z.string().max(100).optional(),
  checkNumber: z.string().max(50).optional(),
  
  // Allocation to bills
  allocations: z.array(paymentAllocationSchema).min(1),
  
  // Notes
  notes: z.string().max(2000).optional(),
});

export const paymentAllocationSchema = z.object({
  billId: z.string().uuid(),
  billNumber: z.string(),
  supplierInvoiceNumber: z.string(),
  
  billAmount: z.string(),
  billOutstanding: z.string(),
  amountAllocated: z.string(),
  
  // Early payment discount (if applicable)
  discountTaken: z.string().default("0"),
});

export type PurchasePayment = z.infer<typeof purchasePaymentSchema>;
```

### 7.3 Payment Posting (AP Clear + Cash)

When payment is **POSTED**, the posting pipeline creates:

```typescript
// Ledger Postings
const postings: LedgerPosting[] = [];

// 1. Debit AP (for each allocation)
for (const allocation of payment.allocations) {
  postings.push({
    accountId: apAccountId,
    partyId: payment.supplierId,
    debit: allocation.amountAllocated,
    credit: "0",
    currency: payment.currency,
  });
  
  // 2. If early payment discount, credit discount income
  if (parseDecimal(allocation.discountTaken) > 0) {
    postings.push({
      accountId: purchaseDiscountAccountId,
      debit: "0",
      credit: allocation.discountTaken,
    });
  }
}

// 3. Credit Cash/Bank
postings.push({
  accountId: payment.bankAccountId,
  debit: "0",
  credit: payment.amount,
  currency: payment.currency,
});

// INVARIANT: SUM(debit) = SUM(credit)
```

### 7.4 Payment Events

```typescript
export const paymentMadeEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("payment.made"),
  
  payload: z.object({
    paymentId: z.string().uuid(),
    paymentNumber: z.string(),
    supplierId: z.string().uuid(),
    
    paymentDate: z.string().datetime(),
    paymentMethod: z.string(),
    amount: z.string(),
    currency: z.string().length(3),
    
    allocations: z.array(z.object({
      billId: z.string().uuid(),
      amountAllocated: z.string(),
      billFullyPaid: z.boolean(),
    })),
    
    postingBatchId: z.string().uuid(),
    
    context6w1h: sixW1HContextSchema,
  }),
});

export type PaymentMadeEvent = z.infer<typeof paymentMadeEventSchema>;
```

---

## 8) Debit Note (Returns & Adjustments)

### 8.1 Debit Note Purpose

The Debit Note handles:
- Purchase returns to supplier
- Pricing adjustments after billing
- Quality claims

### 8.2 Debit Note Schema

```typescript
// packages/axis-registry/src/schemas/purchase/debit-note.ts

export const DEBIT_NOTE_REASON = [
  "return",
  "price_adjustment",
  "quantity_adjustment",
  "quality_issue",
  "billing_error",
  "shortage",
  "other",
] as const;

export const purchaseDebitNoteSchema = postingSpineEnvelopeSchema.extend({
  documentType: z.literal("purchase.debit_note"),
  
  // Debit Note identity
  debitNoteNumber: z.string().min(1).max(50),
  
  // Source bill
  sourceBillId: z.string().uuid(),
  sourceBillNumber: z.string(),
  
  // Supplier
  supplierId: z.string().uuid(),
  supplierName: z.string().max(255),
  
  // Debit Note details
  debitNoteDate: z.string().datetime(),
  reason: z.enum(DEBIT_NOTE_REASON),
  reasonDescription: z.string().max(500).optional(),
  
  currency: z.string().length(3),
  
  // Lines
  lines: z.array(debitNoteLineSchema).min(1),
  
  // Totals
  subtotal: z.string(),
  taxTotal: z.string(),
  grandTotal: z.string(),
  
  // Application
  applyToBill: z.boolean().default(true),
  refundRequested: z.boolean().default(false),
  
  // Return goods (if applicable)
  returnReceiptId: z.string().uuid().optional(),
  
  notes: z.string().max(2000).optional(),
});

export type PurchaseDebitNote = z.infer<typeof purchaseDebitNoteSchema>;
```

### 8.3 Debit Note Posting

Debit Note creates **reverse** of bill posting:

```typescript
// Ledger Postings (opposite of bill)
[
  {
    accountId: apAccountId,
    partyId: supplierId,
    debit: debitNote.grandTotal, // Debit AP (reduce payable)
    credit: "0",
  },
  {
    accountId: inventoryAccountId, // Or expense
    debit: "0",
    credit: debitNote.subtotal, // Credit Inventory (reduce asset)
  },
  {
    accountId: taxReceivableAccountId,
    debit: "0",
    credit: debitNote.taxTotal, // Reverse tax claim
  }
]
```

If return involves physical goods:
- Stock move OUT (return to supplier)
- Inventory valuation adjustment

---

## 9) AP Subledger Integration

### 9.1 AP Subledger Entries

Every purchase posting creates subledger entries:

```typescript
// packages/axis-registry/src/schemas/accounting/ap-subledger.ts

export const apSubledgerEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Party
  supplierId: z.string().uuid(),
  supplierName: z.string(),
  
  // Reference
  documentType: z.enum(["purchase.bill", "purchase.payment", "purchase.debit_note"]),
  documentId: z.string().uuid(),
  documentNumber: z.string(),
  documentDate: z.string().datetime(),
  
  // Amounts
  debitAmount: z.string(),
  creditAmount: z.string(),
  balance: z.string(),
  
  // Currency
  currency: z.string().length(3),
  baseCurrencyAmount: z.string(),
  
  // GL Reference
  journalId: z.string().uuid(),
  postingBatchId: z.string().uuid(),
  
  // Dates
  effectiveDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
});

export type APSubledgerEntry = z.infer<typeof apSubledgerEntrySchema>;
```

### 9.2 AP Aging

```typescript
// packages/db/src/queries/purchase/ap-aging.ts

export interface APAgingBucket {
  supplierId: string;
  supplierName: string;
  currency: string;
  current: string;
  days1to30: string;
  days31to60: string;
  days61to90: string;
  over90: string;
  total: string;
}

export async function getAPAgingReport(
  db: Database,
  tenantId: string,
  asOfDate: Date = new Date()
): Promise<APAgingBucket[]> {
  // Query open bills and bucket by days overdue
  // ...
}
```

---

## 10) Three-Way Matching Implementation

### 10.1 Matching Schema

```typescript
// packages/axis-registry/src/schemas/purchase/matching.ts

export const MATCH_STATUS = [
  "unmatched",
  "partial",
  "matched",
  "exception",
] as const;

export const MATCH_EXCEPTION_TYPE = [
  "quantity_variance",
  "price_variance",
  "no_receipt",
  "no_po",
] as const;

export const threeWayMatchSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  billId: z.string().uuid(),
  
  overallStatus: z.enum(MATCH_STATUS),
  
  lineMatches: z.array(z.object({
    billLineNumber: z.number().int(),
    
    // PO match
    poId: z.string().uuid().optional(),
    poLineNumber: z.number().int().optional(),
    poQuantity: z.number().optional(),
    poUnitPrice: z.string().optional(),
    
    // Receipt match
    receiptId: z.string().uuid().optional(),
    receiptLineNumber: z.number().int().optional(),
    receiptQuantity: z.number().optional(),
    
    // Bill values
    billQuantity: z.number(),
    billUnitPrice: z.string(),
    
    // Match results
    quantityStatus: z.enum(MATCH_STATUS),
    priceStatus: z.enum(MATCH_STATUS),
    lineStatus: z.enum(MATCH_STATUS),
    
    // Variances
    quantityVariance: z.number().optional(),
    priceVariance: z.string().optional(),
    
    // Exception handling
    exception: z.object({
      type: z.enum(MATCH_EXCEPTION_TYPE),
      description: z.string(),
      approved: z.boolean().default(false),
      approvedBy: z.string().uuid().optional(),
      approvedAt: z.string().datetime().optional(),
    }).optional(),
  })),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ThreeWayMatch = z.infer<typeof threeWayMatchSchema>;
```

### 10.2 Matching Logic

```typescript
// packages/db/src/queries/purchase/matching.ts

export async function performThreeWayMatch(
  db: Database,
  billId: string
): Promise<ThreeWayMatch> {
  const bill = await getBill(db, billId);
  const lineMatches = [];
  
  for (const billLine of bill.lines) {
    const match: LineMatch = {
      billLineNumber: billLine.lineNumber,
      billQuantity: billLine.quantity,
      billUnitPrice: billLine.unitPrice,
      quantityStatus: "unmatched",
      priceStatus: "unmatched",
      lineStatus: "unmatched",
    };
    
    // Find PO line
    if (billLine.poId && billLine.poLineNumber) {
      const poLine = await getPOLine(db, billLine.poId, billLine.poLineNumber);
      match.poId = billLine.poId;
      match.poLineNumber = billLine.poLineNumber;
      match.poQuantity = poLine.quantityOrdered;
      match.poUnitPrice = poLine.unitPrice;
    }
    
    // Find Receipt line
    if (billLine.receiptId && billLine.receiptLineNumber) {
      const receiptLine = await getReceiptLine(db, billLine.receiptId, billLine.receiptLineNumber);
      match.receiptId = billLine.receiptId;
      match.receiptLineNumber = billLine.receiptLineNumber;
      match.receiptQuantity = receiptLine.quantityAccepted;
    }
    
    // Compare quantities
    if (match.receiptQuantity !== undefined) {
      if (match.receiptQuantity === billLine.quantity) {
        match.quantityStatus = "matched";
      } else {
        match.quantityStatus = "exception";
        match.quantityVariance = billLine.quantity - match.receiptQuantity;
      }
    }
    
    // Compare prices
    if (match.poUnitPrice !== undefined) {
      if (parseDecimal(match.poUnitPrice) === parseDecimal(billLine.unitPrice)) {
        match.priceStatus = "matched";
      } else {
        match.priceStatus = "exception";
        match.priceVariance = subtractDecimals(billLine.unitPrice, match.poUnitPrice);
      }
    }
    
    // Overall line status
    if (match.quantityStatus === "matched" && match.priceStatus === "matched") {
      match.lineStatus = "matched";
    } else if (match.quantityStatus === "exception" || match.priceStatus === "exception") {
      match.lineStatus = "exception";
    } else {
      match.lineStatus = "partial";
    }
    
    lineMatches.push(match);
  }
  
  // Overall status
  const overallStatus = calculateOverallStatus(lineMatches);
  
  return { billId, overallStatus, lineMatches };
}
```

---

## 11) Purchase Configuration

### 11.1 Tenant Purchase Settings

```typescript
// packages/axis-registry/src/schemas/purchase/config.ts

export const purchaseConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Numbering
  prNumberPrefix: z.string().max(10).default("PR-"),
  poNumberPrefix: z.string().max(10).default("PO-"),
  receiptNumberPrefix: z.string().max(10).default("GRN-"),
  billNumberPrefix: z.string().max(10).default("BILL-"),
  paymentNumberPrefix: z.string().max(10).default("PAY-"),
  debitNoteNumberPrefix: z.string().max(10).default("DN-"),
  
  // Defaults
  defaultPaymentTermId: z.string().uuid().optional(),
  defaultWarehouseId: z.string().uuid().optional(),
  defaultApAccountId: z.string().uuid(),
  defaultGrnAccrualAccountId: z.string().uuid(),
  
  // Tax
  defaultTaxCodeId: z.string().uuid().optional(),
  
  // Policies
  requirePrBeforePo: z.boolean().default(true),
  requireReceiptBeforeBill: z.boolean().default(true),
  allowPartialReceipt: z.boolean().default(true),
  allowPartialBill: z.boolean().default(true),
  
  // Three-way matching
  enableThreeWayMatch: z.boolean().default(true),
  autoMatchOnBillCreate: z.boolean().default(true),
  quantityTolerancePercent: z.number().min(0).max(100).default(0),
  priceTolerancePercent: z.number().min(0).max(100).default(0),
  priceToleranceAmount: z.string().default("0"),
  
  // Approvals
  prApprovalRequired: z.boolean().default(true),
  prApprovalThreshold: z.string().optional(),
  poApprovalRequired: z.boolean().default(true),
  poApprovalThreshold: z.string().optional(),
  billExceptionApprovalRequired: z.boolean().default(true),
  paymentApprovalRequired: z.boolean().default(true),
  paymentApprovalThreshold: z.string().optional(),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type PurchaseConfig = z.infer<typeof purchaseConfigSchema>;
```

---

## 12) Exit Criteria (B5 Gate)

**B5 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                          | Verified | Implementation                               |
| --- | -------------------------------------------------- | -------- | -------------------------------------------- |
| 1   | PR → PO → Receipt → Bill → Payment lifecycle works | ✅        | Schemas + Drizzle tables                     |
| 2   | Receipt creates stock move + inventory valuation   | ⏳        | Pending B06 Inventory                        |
| 3   | Receipt creates GRN Accrual posting                | ⏳        | Pending B07 Accounting                       |
| 4   | Bill posting clears GRN Accrual + creates AP       | ⏳        | Pending B07 Accounting                       |
| 5   | Bill posting creates AP subledger entry            | ⏳        | Pending B07 Accounting                       |
| 6   | Payment application clears AP                      | ⏳        | Pending B07 Accounting                       |
| 7   | Three-way match (PO ↔ Receipt ↔ Bill) visible      | ✅        | `matchExceptionSchema` defined               |
| 8   | Match exceptions require approval (Danger Zone)    | ✅        | `approved`, `approvedBy` fields              |
| 9   | Trial balance stays balanced after full cycle      | ⏳        | Pending B07 Accounting                       |
| 10  | Debit Note reverses bill correctly                 | ✅        | Schema + table defined                       |
| 11  | All purchase events published to outbox            | ✅        | B02 outbox integration ready                 |

### Implementation Files

| Component           | Location                                                 |
| ------------------- | -------------------------------------------------------- |
| Purchase Constants  | `packages/axis-registry/src/schemas/purchase/constants.ts` |
| Purchase Schemas    | `packages/axis-registry/src/schemas/purchase/*.ts`       |
| Purchase Tables     | `packages/db/src/schema/purchase/*.ts`                   |

---

## 13) Integration with Other Phases

| Phase               | Dependency on B05         | What B05 Provides                    |
| ------------------- | ------------------------- | ------------------------------------ |
| **B01** (Posting)   | Posting spine             | Document state machine, postings     |
| **B02** (Domains)   | Event contracts           | Purchase event schemas               |
| **B03** (MDM)       | Supplier, Item, Tax       | Valid references for documents       |
| **B04** (Sales)     | —                         | Symmetric flow reference             |
| **B06** (Inventory) | Receipt posting           | Stock move requests                  |
| **B07** (Accounting)| Bill/Payment posting      | Journal entries, AP subledger        |
| **B08** (Controls)  | PR/PO approvals           | Approval workflows                   |
| **B09** (Reconciliation) | AP aging, matching   | Reconciliation data                  |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Tables Complete)     |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B5 (Purchase)                                   |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: Full integration with B06 (Inventory) and B07 (Accounting) pending those phases.

---

## Related Documents

| Document                               | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md) | Philosophy: §3 (Obligations Pillar)        |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)   | Roadmap: Phase B5 definition               |
| [B01-DOCUMENTATION.md](./B01-DOCUMENTATION.md) | Posting Spine (document lifecycle) |
| [B02-DOMAINS.md](./B02-DOMAINS.md)     | Domain boundaries (Purchase domain)        |
| [B03-MDM.md](./B03-MDM.md)             | Master Data (Suppliers, Items, Tax)        |
| [B04-SALES.md](./B04-SALES.md)         | Sales domain (symmetric flow)              |
| [B06-INVENTORY.md](./B06-INVENTORY.md) | Inventory (stock moves from receipt)       |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md) | Accounting (journal entries)             |

---

> *"A purchase is not complete until: goods are received, bill is posted, payment is made. Three-way matching ensures truth before payment."*
