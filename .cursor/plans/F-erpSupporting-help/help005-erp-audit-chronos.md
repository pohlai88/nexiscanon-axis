# help005-erp-audit-chronos.md

**Status:** SUPPORTING (Help)
**Goal:** Make ERP changes traceable, debuggable, and compliant by default.

## 0) Non-negotiable
For ERP lifecycle entities, **every state transition emits an audit event**.

This is required even when observability systems (OTel/GlitchTip) are incomplete, because ERP audit is part of business integrity.

## 1) Event envelope (recommended)
Emit events in a stable envelope that can be stored in DB and shipped to external sinks later.

Minimum envelope:
- `event_id` (UUID)
- `occurred_at` (UTC ISO)
- `tenant_id`
- `actor_user_id` (or service account)
- `entity_type`
- `entity_id`
- `event_type` (namespaced)
- `command_id` (idempotency)
- `payload` (JSON)

## 2) Event types (fixed naming)
Use:
`erp.<module>.<entity>.<verb>`

Examples:
- `erp.sales.order.created`
- `erp.sales.order.submitted`
- `erp.sales.order.approved`
- `erp.inventory.move.posted`

## 3) What must be in payload
For lifecycle transitions:
- `from_status`
- `to_status`
- `reason` (optional)
- `note` (optional)
- `diff` (optional; keep small)

## 4) Storage best practice
Recommended: append-only audit table, partitionable by time.
- index on `(tenant_id, entity_type, entity_id, occurred_at)`
- index on `(tenant_id, occurred_at)`

## 5) When to emit
- After permission check passes
- After transition guard passes
- After DB state is durably updated

If side effects exist, emit after the whole operation is committed.

## 6) What NOT to do
- Do not rely on application logs as audit.
- Do not allow modules to “forget” to emit; the domain service should own emission.
- Do not emit unbounded payloads (no huge blobs).
