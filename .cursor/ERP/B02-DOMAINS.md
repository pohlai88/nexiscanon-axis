# B02 — Domain Map & Bounded Contexts
## Stop Cross-Bleeding

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |           |                     |                       |                          |                           |
| :---------------------------: | :-------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: |
| [B01](./B01-DOCUMENTATION.md) | **[B02]** | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) |
|            Posting            |  Domains  |         MDM         |         Sales         |         Purchase         |         Inventory         |

---

> **Derived From:** [A01-CANONICAL.md](./A01-CANONICAL.md) §P4 (Strong Boundaries), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B2
>
> **Tag:** `ARCHITECTURE` | `BOUNDARIES` | `PHASE-B2`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

All B02 event contracts follow the **Single Source of Truth** pattern:

| Component               | Source                                        |
| ----------------------- | --------------------------------------------- |
| `eventEnvelopeSchema`   | `@axis/registry/schemas/events/base.ts`       |
| `coreEventSchema`       | `@axis/registry/schemas/events/core.ts`       |
| `mdmEventSchema`        | `@axis/registry/schemas/events/mdm.ts`        |
| `salesEventSchema`      | `@axis/registry/schemas/events/sales.ts`      |
| `accountingEventSchema` | `@axis/registry/schemas/events/accounting.ts` |
| `DOMAIN_NAMES`          | `@axis/registry/schemas/events/base.ts`       |

**Rule**: Event contracts are cross-domain APIs. They MUST live in `@axis/registry` so all domains share the same contract version.

---

## 1) The Core Law

> *"Sales ≠ Accounting ≠ Inventory ≠ Procurement"*

From A01 §P4:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DOMAIN SOVEREIGNTY                                      │
│                                                                              │
│    Each domain OWNS its data, PUBLISHES events, CONSUMES contracts.         │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     NO DIRECT FOREIGN KEYS ACROSS DOMAIN BOUNDARIES.              ║    │
│    ║     COMMUNICATION IS VIA EVENTS + CONTRACTS.                      ║    │
│    ║     EACH DOMAIN IS DEPLOYABLE INDEPENDENTLY.                      ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│    This prevents the "big ball of mud" that kills ERP maintainability.      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- Without boundaries, changes in Sales break Accounting
- Without boundaries, testing requires the entire system
- Without boundaries, teams step on each other constantly

---

## 2) The Domain Registry

### 2.1 Core Domains

| Domain         | Owns                                        | Tables (Prefix) |
| -------------- | ------------------------------------------- | --------------- |
| **Core**       | Tenants, Users, Auth, Audit                 | `core_*`        |
| **MDM**        | Parties, Items, UoM, Locations, Tax         | `mdm_*`         |
| **Sales**      | Quotes, Orders, Deliveries, Invoices        | `sales_*`       |
| **Purchase**   | PRs, POs, Receipts, Bills                   | `purchase_*`    |
| **Inventory**  | Stock Moves, Reservations, Valuation        | `inv_*`         |
| **Accounting** | COA, Journals, GL, Subledgers, Periods      | `gl_*`          |
| **Controls**   | RBAC, Approvals, Policies, Audit Extensions | `ctrl_*`        |
| **Reporting**  | Manifests, Dashboards, Report Definitions   | `rpt_*`         |

### 2.2 Event Publishing

| Domain         | Publishes Events                                                         |
| -------------- | ------------------------------------------------------------------------ |
| **Core**       | `tenant.created`, `user.created`, `user.role_assigned`                   |
| **MDM**        | `party.created`, `party.updated`, `item.created`, `item.updated`         |
| **Sales**      | `quote.created`, `order.confirmed`, `delivery.shipped`, `invoice.posted` |
| **Purchase**   | `pr.submitted`, `po.confirmed`, `receipt.posted`, `bill.posted`          |
| **Inventory**  | `stock.moved`, `stock.reserved`, `valuation.calculated`                  |
| **Accounting** | `journal.posted`, `period.soft_closed`, `period.hard_closed`             |
| **Controls**   | `approval.requested`, `approval.granted`, `policy.violated`              |

### 2.3 Event Consumption

| Domain         | Consumes From              | Purpose                       |
| -------------- | -------------------------- | ----------------------------- |
| **MDM**        | Core                       | Tenant context                |
| **Sales**      | MDM                        | Party/Item references         |
| **Purchase**   | MDM                        | Party/Item references         |
| **Inventory**  | Sales, Purchase            | Stock moves from documents    |
| **Accounting** | Sales, Purchase, Inventory | Journal entries from postings |
| **Controls**   | All domains                | Policy evaluation             |
| **Reporting**  | All domains                | Materialized views            |

---

## 3) Domain Boundary Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN BOUNDARIES                                 │
│                                                                              │
│                              ┌──────────┐                                    │
│                              │   CORE   │                                    │
│                              │ (Tenant) │                                    │
│                              └────┬─────┘                                    │
│                                   │                                          │
│                     ┌─────────────┼─────────────┐                            │
│                     │             │             │                            │
│                     ▼             ▼             ▼                            │
│              ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│              │   MDM    │  │ CONTROLS │  │REPORTING │                        │
│              │ (Master) │  │  (PDR)   │  │ (Views)  │                        │
│              └────┬─────┘  └──────────┘  └──────────┘                        │
│                   │              ▲             ▲                             │
│      ┌────────────┼────────────┐ │             │                             │
│      │            │            │ │             │                             │
│      ▼            ▼            ▼ │             │                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │                             │
│ │  SALES   │ │ PURCHASE │ │INVENTORY │        │                             │
│ │(Revenue) │ │(Expense) │ │ (Stock)  │        │                             │
│ └────┬─────┘ └────┬─────┘ └────┬─────┘        │                             │
│      │            │            │              │                             │
│      └────────────┼────────────┘              │                             │
│                   │                           │                             │
│                   ▼                           │                             │
│              ┌──────────┐                     │                             │
│              │ACCOUNTING│─────────────────────┘                             │
│              │  (GL)    │                                                   │
│              └──────────┘                                                   │
│                                                                              │
│  Legend: ───▶ = Event flow (via Outbox)                                     │
│          ┌───┐ = Domain boundary (isolated schema)                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4) Cross-Domain Rules (Enforcement)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DOMAIN BOUNDARY ENFORCEMENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✅ ALLOWED                          │  ❌ FORBIDDEN                         │
│  ──────────────────────────────────  │  ──────────────────────────────────  │
│  Events via outbox                   │  Direct foreign keys across domains  │
│  Published contracts (Zod schemas)   │  Shared internal tables              │
│  Correlation IDs for tracing         │  Calling internal services directly  │
│  Read replicas for reporting         │  Modifying another domain's data     │
│  Reference by UUID (not FK)          │  Joins across domain tables          │
│  Event-carried state transfer        │  Synchronous cross-domain calls      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Reference Pattern (Not FK)

```typescript
// ✅ CORRECT: Reference by UUID
interface SalesInvoice {
  id: UUID;
  tenantId: UUID;

  // Reference to MDM, NOT a foreign key
  customerId: UUID;  // Validated at application layer

  // Items are embedded, not FK'd
  lines: InvoiceLine[];
}

// ❌ WRONG: Foreign key to another domain
// REFERENCES mdm_parties(id)  -- NO! This creates coupling
```

### 4.2 Event Contract Pattern

```typescript
// In @axis/registry/schemas/events/sales.ts

import { z } from "zod";

/**
 * Event: invoice.posted
 * Published by: Sales domain
 * Consumed by: Accounting, Reporting
 */
export const invoicePostedEventSchema = z.object({
  // Event metadata
  eventType: z.literal("invoice.posted"),
  eventId: z.string().uuid(),
  timestamp: z.string().datetime(),
  correlationId: z.string().uuid(),

  // Payload (event-carried state)
  payload: z.object({
    invoiceId: z.string().uuid(),
    invoiceNumber: z.string(),
    customerId: z.string().uuid(),
    customerName: z.string(),  // Denormalized for consumer

    totalAmount: z.string(),   // Decimal as string
    currency: z.string().length(3),

    postingDate: z.string().datetime(),
    fiscalPeriod: z.string(),

    // Context for audit
    postedBy: z.string().uuid(),
    context6w1h: sixW1HContextSchema,
  }),
});

export type InvoicePostedEvent = z.infer<typeof invoicePostedEventSchema>;
```

---

## 5) Outbox Pattern Implementation

### 5.1 Outbox Table

```sql
-- Shared outbox table (in posting spine)
CREATE TABLE domain_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,

  -- Event metadata
  event_type VARCHAR(100) NOT NULL,
  event_id UUID NOT NULL UNIQUE,
  correlation_id UUID NOT NULL,

  -- Source
  source_domain VARCHAR(50) NOT NULL,
  source_aggregate_id UUID NOT NULL,
  source_aggregate_type VARCHAR(50) NOT NULL,

  -- Payload
  payload JSONB NOT NULL,

  -- Processing state
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMPTZ,

  -- Ordering
  sequence_number BIGSERIAL NOT NULL
);

-- Indexes for efficient polling
CREATE INDEX idx_outbox_pending ON domain_outbox (tenant_id, status, sequence_number)
  WHERE status = 'PENDING';
CREATE INDEX idx_outbox_correlation ON domain_outbox (correlation_id);
```

### 5.2 Outbox Writer

```typescript
// packages/db/src/outbox/writer.ts

import type { Database } from "../client/neon";

export interface OutboxEvent {
  eventType: string;
  eventId: string;
  correlationId: string;
  sourceDomain: string;
  sourceAggregateId: string;
  sourceAggregateType: string;
  payload: Record<string, unknown>;
}

/**
 * Write event to outbox (within same transaction as domain write).
 */
export async function writeToOutbox(
  tx: Database,
  tenantId: string,
  event: OutboxEvent
): Promise<void> {
  await tx.insert(domainOutbox).values({
    tenantId,
    eventType: event.eventType,
    eventId: event.eventId,
    correlationId: event.correlationId,
    sourceDomain: event.sourceDomain,
    sourceAggregateId: event.sourceAggregateId,
    sourceAggregateType: event.sourceAggregateType,
    payload: event.payload,
  });
}
```

### 5.3 Outbox Processor

```typescript
// packages/db/src/outbox/processor.ts

/**
 * Poll and process outbox events.
 * Run as background job (e.g., via pg_cron or external scheduler).
 */
export async function processOutbox(
  db: Database,
  handlers: Map<string, (event: OutboxEvent) => Promise<void>>
): Promise<number> {
  const events = await db.query.domainOutbox.findMany({
    where: eq(domainOutbox.status, "PENDING"),
    orderBy: [domainOutbox.sequenceNumber],
    limit: 100,
  });

  let processed = 0;

  for (const event of events) {
    const handler = handlers.get(event.eventType);

    if (!handler) {
      console.warn(`No handler for event type: ${event.eventType}`);
      continue;
    }

    try {
      await handler(event);

      await db.update(domainOutbox)
        .set({ status: "DELIVERED", processedAt: new Date() })
        .where(eq(domainOutbox.id, event.id));

      processed++;
    } catch (error) {
      await db.update(domainOutbox)
        .set({
          status: event.attempts >= 3 ? "FAILED" : "PENDING",
          attempts: event.attempts + 1,
          lastError: String(error),
        })
        .where(eq(domainOutbox.id, event.id));
    }
  }

  return processed;
}
```

---

## 6) Domain Package Structure

```
packages/
├── db/                      # Shared database layer
│   ├── src/
│   │   ├── schema/          # All Drizzle schemas
│   │   ├── outbox/          # Outbox pattern
│   │   └── queries/         # Shared queries
│   └── package.json
│
├── domain-mdm/              # Master Data Management
│   ├── src/
│   │   ├── schemas/         # Zod validation
│   │   ├── commands/        # Write operations
│   │   ├── queries/         # Read operations
│   │   ├── events/          # Event definitions
│   │   └── index.ts
│   └── package.json
│
├── domain-sales/            # Sales & Revenue
│   ├── src/
│   │   ├── schemas/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── events/
│   │   └── handlers/        # Event handlers (consumes)
│   └── package.json
│
├── domain-purchase/         # Purchasing & Expenses
├── domain-inventory/        # Stock & Valuation
├── domain-accounting/       # GL & Periods
└── domain-controls/         # RBAC & Policies
```

---

## 7) Event Contracts (Zod Schemas)

### 7.1 Registry Structure

```
packages/axis-registry/
└── src/
    └── schemas/
        ├── events/
        │   ├── core.ts        # tenant.*, user.*
        │   ├── mdm.ts         # party.*, item.*
        │   ├── sales.ts       # quote.*, order.*, invoice.*
        │   ├── purchase.ts    # pr.*, po.*, bill.*
        │   ├── inventory.ts   # stock.*, valuation.*
        │   ├── accounting.ts  # journal.*, period.*
        │   └── index.ts       # Re-export all
        └── index.ts
```

### 7.2 Event Base Schema

```typescript
// packages/axis-registry/src/schemas/events/base.ts

import { z } from "zod";

/**
 * Base event envelope (all events extend this)
 */
export const eventEnvelopeSchema = z.object({
  // Event identity
  eventId: z.string().uuid(),
  eventType: z.string().min(1),

  // Correlation
  correlationId: z.string().uuid(),
  causationId: z.string().uuid().optional(),

  // Source
  sourceDomain: z.string().min(1),
  sourceAggregateType: z.string().min(1),
  sourceAggregateId: z.string().uuid(),

  // Temporal
  timestamp: z.string().datetime(),

  // Tenant
  tenantId: z.string().uuid(),
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
```

---

## 8) Exit Criteria (B2 Gate)

**B2 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                          | Verified | Implementation                               |
| --- | -------------------------------------------------- | -------- | -------------------------------------------- |
| 1   | Domain ownership table documented                  | ✅        | This document §2                             |
| 2   | Cross-domain event contracts defined (Zod)         | ✅        | `@axis/registry/src/schemas/events/`         |
| 3   | No direct foreign keys across domain boundaries    | ✅        | Reference by UUID, not FK                    |
| 4   | Outbox pattern implemented for inter-domain events | ✅        | `domain_outbox` table + writer + processor   |
| 5   | At least one event flow working end-to-end         | ✅        | `postDocument()` → outbox → `*.posted` event |
| 6   | Event envelope schema standardized                 | ✅        | `eventEnvelopeSchema` in base.ts             |

### Implementation Files

| Component           | Location                                                  |
| ------------------- | --------------------------------------------------------- |
| Event Base Schema   | `packages/axis-registry/src/schemas/events/base.ts`       |
| Core Events         | `packages/axis-registry/src/schemas/events/core.ts`       |
| MDM Events          | `packages/axis-registry/src/schemas/events/mdm.ts`        |
| Sales Events        | `packages/axis-registry/src/schemas/events/sales.ts`      |
| Accounting Events   | `packages/axis-registry/src/schemas/events/accounting.ts` |
| Outbox Schema       | `packages/db/src/schema/outbox.ts`                        |
| Outbox Writer       | `packages/db/src/outbox/writer.ts`                        |
| Outbox Processor    | `packages/db/src/outbox/processor.ts`                     |
| Posting Integration | `packages/db/src/queries/posting.ts` (§7)                 |

---

## 9) Integration with Other Phases

| Phase                | Dependency on B02   | What B02 Provides              |
| -------------------- | ------------------- | ------------------------------ |
| **B01** (Posting)    | Outbox integration  | Event publishing from posting  |
| **B03** (MDM)        | Domain ownership    | MDM domain definition + events |
| **B04** (Sales)      | Event contracts     | Sales event schemas            |
| **B05** (Purchase)   | Event contracts     | Purchase event schemas         |
| **B06** (Inventory)  | Event consumption   | Stock move handlers            |
| **B07** (Accounting) | Event consumption   | Journal entry handlers         |
| **B08** (Controls)   | Cross-domain policy | Policy evaluation on events    |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Exit Criteria Met)             |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-CANONICAL.md v0.3.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B2 (Domain Map)                                 |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

---

## Related Documents

| Document                                       | Purpose                             |
| ---------------------------------------------- | ----------------------------------- |
| [A01-CANONICAL.md](./A01-CANONICAL.md)         | Philosophy: §P4 (Strong Boundaries) |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)           | Roadmap: Phase B2 definition        |
| [B01-DOCUMENTATION.md](./B01-DOCUMENTATION.md) | Posting Spine (publishes events)    |
| [B03-MDM.md](./B03-MDM.md)                     | MDM domain implementation           |
| [B04-SALES.md](./B04-SALES.md)                 | Sales domain implementation         |

---

> *"Sales ≠ Accounting ≠ Inventory ≠ Procurement. Each domain owns its truth, publishes events, and respects boundaries."*
