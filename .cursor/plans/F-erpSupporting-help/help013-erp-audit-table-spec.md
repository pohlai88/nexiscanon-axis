# help013-erp-audit-table-spec.md

**Status:** SUPPORTING (Help)  
**Goal:** Concrete specification for ERP audit/event storage.

---

## 0) Audit vs Observability

| Concern | Purpose | Owner | Storage |
|---------|---------|-------|---------|
| **Audit** | Business compliance, legal record | ERP domain | PostgreSQL (durable) |
| **Observability** | Debugging, performance | Platform | Logs/Tempo/GlitchTip |

This document covers **ERP Audit** — the business-critical record of who did what, when.

Observability (tracing, logging) is handled by Platform and is NOT a substitute for audit.

---

## 1) Audit Requirements

### 1.1 What Must Be Audited

For every ERP lifecycle entity:

| Event Type | Trigger | Required |
|------------|---------|----------|
| Created | Entity inserted | Yes |
| Updated | Entity modified | Yes |
| Status Changed | Workflow transition | Yes |
| Deleted/Voided | Soft delete or void | Yes |

### 1.2 What Must Be Captured

Every audit event MUST include:

- **Identity**: event_id, entity_type, entity_id
- **Actor**: tenant_id, actor_user_id (or system account)
- **Time**: occurred_at (UTC)
- **Action**: event_type
- **Context**: command_id (idempotency), trace_id (observability link)
- **Payload**: what changed (before/after or structured data)

---

## 2) Audit Table Schema

### 2.1 SQL Schema (Partitioned by Time)

```sql
-- Main audit table (partitioned)
CREATE TABLE erp_audit_events (
    -- Identity
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Tenant + Actor
    tenant_id UUID NOT NULL,
    actor_user_id UUID,                    -- NULL if system-initiated
    actor_type TEXT NOT NULL DEFAULT 'USER' CHECK (actor_type IN ('USER', 'SYSTEM', 'SERVICE')),
    
    -- Entity reference
    entity_type TEXT NOT NULL,             -- e.g., 'erp.sales.order'
    entity_id UUID NOT NULL,
    
    -- Event details
    event_type TEXT NOT NULL,              -- e.g., 'erp.sales.order.created'
    command_id UUID,                       -- idempotency key
    
    -- Observability link
    trace_id TEXT,                         -- correlate with OTel traces
    
    -- Payload
    payload JSONB NOT NULL DEFAULT '{}',
    
    -- Primary key includes partition key
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- Create monthly partitions
CREATE TABLE erp_audit_events_2026_01 PARTITION OF erp_audit_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE erp_audit_events_2026_02 PARTITION OF erp_audit_events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... create 12 months ahead

-- Indexes (on parent, inherited by partitions)
CREATE INDEX idx_erp_audit_tenant_entity 
    ON erp_audit_events(tenant_id, entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_erp_audit_tenant_time 
    ON erp_audit_events(tenant_id, occurred_at DESC);
CREATE INDEX idx_erp_audit_entity_id 
    ON erp_audit_events(entity_id, occurred_at DESC);
```

### 2.2 Drizzle Schema

```typescript
// packages/db/src/erp/audit/events.ts

import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// Note: Drizzle doesn't natively support partitioning.
// Create partitions via manual migration.

export const erpAuditEvents = pgTable('erp_audit_events', {
  id: uuid('id').notNull().defaultRandom(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  
  tenantId: uuid('tenant_id').notNull(),
  actorUserId: uuid('actor_user_id'),
  actorType: text('actor_type').notNull().default('USER'),
  
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  
  eventType: text('event_type').notNull(),
  commandId: uuid('command_id'),
  
  traceId: text('trace_id'),
  
  payload: jsonb('payload').notNull().default({}),
}, (table) => ({
  // Note: composite PK with partition key handled in migration
  tenantEntityIdx: index('idx_erp_audit_tenant_entity')
    .on(table.tenantId, table.entityType, table.entityId),
  tenantTimeIdx: index('idx_erp_audit_tenant_time')
    .on(table.tenantId, table.occurredAt),
}));
```

---

## 3) Event Type Naming Convention

### 3.1 Format

```
erp.<module>.<entity>.<verb>
```

### 3.2 Standard Verbs

| Verb | When Used |
|------|-----------|
| `created` | Entity inserted |
| `updated` | Entity modified (general) |
| `submitted` | Draft → Submitted transition |
| `approved` | Submitted → Approved transition |
| `rejected` | Submitted → Rejected transition |
| `posted` | Approved → Posted transition |
| `voided` | Any → Voided transition |
| `reversed` | Posted → Reversed (creates reversal) |
| `deleted` | Soft delete |

### 3.3 Examples

```typescript
const EVENT_TYPES = {
  // Partners
  'erp.base.partner.created': 'Partner created',
  'erp.base.partner.updated': 'Partner updated',
  
  // Products
  'erp.base.product.created': 'Product created',
  'erp.base.product.updated': 'Product updated',
  
  // Sales Orders
  'erp.sales.order.created': 'Sales order created',
  'erp.sales.order.updated': 'Sales order updated',
  'erp.sales.order.submitted': 'Sales order submitted for approval',
  'erp.sales.order.approved': 'Sales order approved',
  'erp.sales.order.rejected': 'Sales order rejected',
  'erp.sales.order.posted': 'Sales order posted',
  'erp.sales.order.voided': 'Sales order voided',
  
  // Stock Moves
  'erp.inventory.move.created': 'Stock move created',
  'erp.inventory.move.posted': 'Stock move posted',
  'erp.inventory.move.reversed': 'Stock move reversed',
} as const;
```

---

## 4) Payload Structure

### 4.1 Creation Event

```typescript
interface CreatedPayload {
  entity: Record<string, unknown>;  // full entity snapshot
}

// Example
{
  "entity": {
    "id": "uuid",
    "code": "SO-2026-000001",
    "partnerId": "uuid",
    "status": "DRAFT",
    "totalAmountCents": 15000
  }
}
```

### 4.2 Update Event

```typescript
interface UpdatedPayload {
  before: Record<string, unknown>;  // changed fields only
  after: Record<string, unknown>;   // changed fields only
}

// Example
{
  "before": { "name": "Old Name" },
  "after": { "name": "New Name" }
}
```

### 4.3 Transition Event

```typescript
interface TransitionPayload {
  fromStatus: string;
  toStatus: string;
  reason?: string;
  note?: string;
}

// Example
{
  "fromStatus": "SUBMITTED",
  "toStatus": "APPROVED",
  "note": "Approved by manager"
}
```

### 4.4 Payload Size Limit

Keep payloads small:
- Max ~10KB per event
- For large diffs, store summary only
- Full snapshots only for creation

---

## 5) Audit Service Interface

### 5.1 Service Definition

```typescript
// packages/domain/src/addons/erp.base/services/audit-service.ts

export interface AuditContext {
  tenantId: string;
  actorUserId?: string;
  actorType: 'USER' | 'SYSTEM' | 'SERVICE';
  traceId?: string;
  commandId?: string;
}

export interface AuditEvent {
  entityType: string;
  entityId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface AuditService {
  emit(ctx: AuditContext, event: AuditEvent): Promise<void>;
  emitBatch(ctx: AuditContext, events: AuditEvent[]): Promise<void>;
}
```

### 5.2 Implementation

```typescript
// packages/domain/src/addons/erp.base/services/audit-service.impl.ts

import { db } from '@workspace/db';
import { erpAuditEvents } from '@workspace/db/erp/audit/events';

export class AuditServiceImpl implements AuditService {
  async emit(ctx: AuditContext, event: AuditEvent): Promise<void> {
    await db.insert(erpAuditEvents).values({
      tenantId: ctx.tenantId,
      actorUserId: ctx.actorUserId,
      actorType: ctx.actorType,
      entityType: event.entityType,
      entityId: event.entityId,
      eventType: event.eventType,
      commandId: ctx.commandId,
      traceId: ctx.traceId,
      payload: event.payload,
    });
  }
  
  async emitBatch(ctx: AuditContext, events: AuditEvent[]): Promise<void> {
    if (events.length === 0) return;
    
    await db.insert(erpAuditEvents).values(
      events.map(event => ({
        tenantId: ctx.tenantId,
        actorUserId: ctx.actorUserId,
        actorType: ctx.actorType,
        entityType: event.entityType,
        entityId: event.entityId,
        eventType: event.eventType,
        commandId: ctx.commandId,
        traceId: ctx.traceId,
        payload: event.payload,
      }))
    );
  }
}
```

### 5.3 Transactional Emission

**Critical:** Audit events MUST be emitted in the same transaction as the data change.

```typescript
// In domain service
async approveOrder(ctx: ServiceContext, orderId: string): Promise<Order> {
  return await db.transaction(async (tx) => {
    // 1. Update order
    const [order] = await tx
      .update(erpSalesOrders)
      .set({ status: 'APPROVED', updatedAt: new Date() })
      .where(eq(erpSalesOrders.id, orderId))
      .returning();
    
    // 2. Emit audit (same transaction)
    await tx.insert(erpAuditEvents).values({
      tenantId: ctx.tenantId,
      actorUserId: ctx.actorId,
      actorType: 'USER',
      entityType: 'erp.sales.order',
      entityId: orderId,
      eventType: 'erp.sales.order.approved',
      commandId: ctx.commandId,
      traceId: ctx.traceId,
      payload: { fromStatus: 'SUBMITTED', toStatus: 'APPROVED' },
    });
    
    return order;
  });
}
```

---

## 6) Querying Audit Events

### 6.1 Get Entity History

```sql
SELECT * FROM erp_audit_events
WHERE tenant_id = $tenant_id
  AND entity_type = 'erp.sales.order'
  AND entity_id = $order_id
ORDER BY occurred_at DESC
LIMIT 50;
```

### 6.2 Get Recent Activity

```sql
SELECT * FROM erp_audit_events
WHERE tenant_id = $tenant_id
  AND occurred_at >= now() - interval '7 days'
ORDER BY occurred_at DESC
LIMIT 100;
```

### 6.3 Get User Activity

```sql
SELECT * FROM erp_audit_events
WHERE tenant_id = $tenant_id
  AND actor_user_id = $user_id
  AND occurred_at >= now() - interval '30 days'
ORDER BY occurred_at DESC
LIMIT 100;
```

---

## 7) Partition Management

### 7.1 Create Future Partitions

Run monthly (e.g., on 1st of month):

```sql
-- Create partition for 3 months ahead
DO $$
DECLARE
  start_date DATE := date_trunc('month', now() + interval '3 months');
  end_date DATE := start_date + interval '1 month';
  partition_name TEXT := 'erp_audit_events_' || to_char(start_date, 'YYYY_MM');
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF erp_audit_events FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    start_date,
    end_date
  );
END $$;
```

### 7.2 Archive Old Partitions

For partitions older than retention period (e.g., 7 years):

```sql
-- Detach old partition
ALTER TABLE erp_audit_events DETACH PARTITION erp_audit_events_2019_01;

-- Export to cold storage (S3/R2)
COPY erp_audit_events_2019_01 TO '/tmp/audit_2019_01.csv' CSV HEADER;

-- Drop after confirmed backup
DROP TABLE erp_audit_events_2019_01;
```

---

## 8) Retention Policy

### 8.1 Recommended Retention

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Audit events | 7 years | Legal/tax compliance |
| Archived exports | 10+ years | Cold storage is cheap |

### 8.2 Tenant Settings (Future)

Allow tenants to configure retention (with minimum):

```sql
-- In tenant settings
audit_retention_months INTEGER NOT NULL DEFAULT 84  -- 7 years
```

---

## 9) API for Audit Access

### 9.1 Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/erp/audit/entities/[type]/[id]` | Get entity history |
| `GET` | `/api/erp/audit/recent` | Get recent activity |

### 9.2 Output Schema

```typescript
// packages/validation/src/erp/audit/events.ts

export const AuditEventOutput = z.object({
  id: z.string().uuid(),
  occurredAt: z.string().datetime(),
  tenantId: z.string().uuid(),
  actorUserId: z.string().uuid().nullable(),
  actorType: z.enum(['USER', 'SYSTEM', 'SERVICE']),
  entityType: z.string(),
  entityId: z.string().uuid(),
  eventType: z.string(),
  payload: z.record(z.unknown()),
});

export const AuditEventsListOutput = z.object({
  events: z.array(AuditEventOutput),
  hasMore: z.boolean(),
});
```

---

## 10) Zod Schemas for Audit

```typescript
// packages/validation/src/erp/audit/payloads.ts

import { z } from 'zod';

// Base payload
export const AuditPayload = z.record(z.unknown());

// Creation payload
export const CreatedPayload = z.object({
  entity: z.record(z.unknown()),
});

// Update payload
export const UpdatedPayload = z.object({
  before: z.record(z.unknown()),
  after: z.record(z.unknown()),
});

// Transition payload
export const TransitionPayload = z.object({
  fromStatus: z.string(),
  toStatus: z.string(),
  reason: z.string().optional(),
  note: z.string().optional(),
});
```

---

## 11) Integration with Platform Observability

### 11.1 Trace ID Correlation

Every audit event should include `trace_id` from the request context:

```typescript
// In route handler context
const traceId = getTraceId();  // from Platform observability

// Pass to audit
await auditService.emit({ ...ctx, traceId }, event);
```

### 11.2 Searching

With `trace_id`, you can:
- Find audit events for a specific request
- Correlate with Tempo traces
- Link to GlitchTip errors

---

## 12) Testing Audit

### 12.1 Required Tests

```typescript
describe('Audit', () => {
  it('should emit event when order created', async () => {
    const order = await orderService.create(ctx, input);
    
    const events = await getAuditEvents(ctx.tenantId, order.id);
    
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('erp.sales.order.created');
    expect(events[0].payload.entity.id).toBe(order.id);
  });
  
  it('should emit transition event with before/after status', async () => {
    const order = await createDraftOrder(ctx);
    await orderService.submit(ctx, order.id);
    
    const events = await getAuditEvents(ctx.tenantId, order.id);
    const submitEvent = events.find(e => e.eventType === 'erp.sales.order.submitted');
    
    expect(submitEvent.payload.fromStatus).toBe('DRAFT');
    expect(submitEvent.payload.toStatus).toBe('SUBMITTED');
  });
  
  it('should emit audit in same transaction as data change', async () => {
    // Simulate failure after data change but before commit
    // Verify both data and audit are rolled back
  });
});
```

---

## 13) Checklist

- [ ] Create `packages/db/src/erp/audit/` folder
- [ ] Add Drizzle schema for `erp_audit_events`
- [ ] Create manual migration for partitioning
- [ ] Implement `AuditService` interface
- [ ] Add audit emission to all domain services
- [ ] Create partition management script
- [ ] Add API routes for audit access
- [ ] Add tests for audit emission

---

**End of Doc**
