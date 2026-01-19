# help003-erp-workflow-law.md

**Status:** SUPPORTING (Help)
**Goal:** Eliminate workflow drift across ERP modules.

## 0) Principle
All lifecycle entities must behave as a **finite state machine**.

- No “status = ...” scattered in code.
- No implicit transitions.
- Every transition produces an audit event.

## 1) Required artifacts per lifecycle entity
For each lifecycle entity (e.g. SalesOrder, StockMove):
- `Status` enum (Zod)
- `Transition` table (allowed from→to + command name)
- `Command` schemas (Zod): input + output
- `Event` schemas (Zod): emitted per transition

## 2) Canonical transition vocabulary
Use a fixed verb set so modules feel consistent:
- `CREATE` (system)
- `UPDATE` (system)
- `SUBMIT`
- `APPROVE`
- `REJECT`
- `POST`
- `VOID`
- `REVERSE` (if accounting/stock reversal exists)

If you need a new verb, define it once and reuse.

## 3) Posting discipline
“POST” means irreversible side effects become durable.

Examples:
- Sales Order POST may reserve stock and create stock moves.
- Stock Move POST updates inventory balances.
- Invoice POST creates ledger entries (later module).

Rules:
- If an action produces side effects, it must be a POST-like transition.
- POST must be idempotent.

## 4) Idempotency requirements
For every command that changes status or produces side effects:
- repeated identical calls must not duplicate effects
- concurrency must not corrupt state

Best practice patterns:
- Store `last_command_id` (UUID) on the document and reject duplicates.
- Or store command execution rows in an append-only `erp_action_log` table.

## 5) Concurrency rules
Use optimistic concurrency where possible:
- update with `where id = ? and status = expected`
- fail fast if the state moved

Avoid “read → decide → write” without guards.

## 6) Transition API shape (recommended)
Expose domain services with explicit commands:
- `salesOrder.submit(ctx, { orderId, commandId })`
- `salesOrder.approve(ctx, { orderId, commandId, note? })`

Never expose a generic `updateStatus(orderId, status)`.

## 7) Validation + errors
- Reject invalid transitions with a typed error: `ERR_INVALID_TRANSITION`
- Include: `from`, `to`, `command`, `entityId`

## 8) Audit requirements
On every transition, emit an event containing:
- entity type + id
- command name
- from/to status
- actor + tenant
- timestamp
- command id

See `help005-erp-audit-chronos.md`.
