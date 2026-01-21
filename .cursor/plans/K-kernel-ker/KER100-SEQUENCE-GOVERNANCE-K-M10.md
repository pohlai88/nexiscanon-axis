# KER100 — Sequence Governance (K-M10 / K-C4)

**Status:** Ratification-Ready  
**Layer:** Kernel (Data Integrity Plane)  
**Why this exists:** Prevent numbering drift + compliance failure + concurrency corruption  
**Primary consumers:** Domain ERP modules (Invoice, Journal, Credit Memo, Payment, Tax Docs)  
**Canon anchor:** CAN003 Kernel anti-drift + Zod SSOT + audit discipline :contentReference[oaicite:1]{index=1}

---

## 0) Canonical Purpose (Non-Negotiable)

Enterprise ERPs require **document numbering that is:**

- **Unique**
- **Sequential**
- **Format governed**
- **Auditable**
- **Concurrency safe**
- **Resettable by policy**
- **Gap policy explicit** (strict gapless vs monotonic-with-gaps)

This must be a **Kernel primitive** because domain implementations like:

- `MAX(x) + 1`
- `SELECT COUNT(*)`
- “just use SERIAL”
  …cause **race conditions**, **gaps**, and **corruption**.

---

## 1) Strict Boundary (Kernel vs Domain)

### Kernel MUST own

- Sequence issuance protocol (reserve → commit/cancel)
- Distributed locking / concurrency safety
- Formatting + reset policy enforcement
- Audit of every reserve/commit/cancel
- TTL reclamation for abandoned reservations (scheduler integration)

### Kernel MUST NOT own

- “Invoice rules”
- “Journal rules”
- “Posting rules”
- Any business meaning of the number

Kernel only knows: `sequenceKey`, `format`, `policy`.

---

## 2) Definitions

### 2.1 Sequence Key

A stable namespace string such as:

- `invoice.sales`
- `journal.gl`
- `creditmemo.sales`
- `einvoice.lhdn`

Sequence keys are owned by domain modules but enforced by kernel.

### 2.2 Gap Modes (Truthful Definition)

#### Mode A — `monotonic_gaps_allowed`

- Kernel issues numbers in increasing order.
- If a transaction fails after issuance, the number may be skipped.
- This is the default in most systems.

#### Mode B — `strict_gapless`

- Kernel MUST NOT permanently skip numbers.
- Requires reservation semantics:
  - reserved numbers are not final until committed
  - canceled/expired reservations can be reused
- This is required for strict compliance regimes.

**Important truth:** Strict gapless requires:

- reserve/commit discipline
- TTL reclaim
- conflict-safe reuse rules

---

## 3) Canonical Protocol (Reserve → Commit → Cancel)

### 3.1 ReserveSequence (always first)

Reserves the next number for a given key.

**Guarantees:**

- reservation value is unique among active reservations
- reservation is auditable
- reservation has TTL

### 3.2 CommitSequence (binds to objectRef)

Commits the reserved number and binds it immutably to a domain object.

**Guarantees:**

- committed value is final
- binding is auditable
- cannot be committed twice

### 3.3 CancelSequence (explicit rollback)

Cancels a reservation with a reason.

**Guarantees:**

- in strict gapless mode, canceled values become reusable
- in gaps-allowed mode, cancellation is tracked but value is not reused

### 3.4 ReclaimSequenceReservations (scheduler)

Reclaims expired reservations deterministically.

---

## 4) Canonical Interfaces (Zod SSOT)

> All kernel APIs MUST be Zod-validated inputs/outputs per CAN003 :contentReference[oaicite:2]{index=2}

### 4.1 Sequence Policy Schema

```ts
import { z } from "zod";

export const SequenceResetPolicy = z.union([
  z.literal("never"),
  z.literal("yearly"),
  z.literal("monthly"),
  z.literal("fiscal_yearly"),
]);

export const SequenceGapPolicy = z.union([
  z.literal("monotonic_gaps_allowed"),
  z.literal("strict_gapless"),
]);

export const SequencePolicy = z.object({
  tenantId: z.string().uuid(),
  sequenceKey: z.string().min(3).max(120),
  format: z.string().min(3).max(120), // e.g. "INV-{YYYY}-{0000}"
  timezone: z.string().default("Asia/Kuala_Lumpur"),
  resetPolicy: SequenceResetPolicy,
  gapPolicy: SequenceGapPolicy,
  // optional: fiscal year start month/day
  fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
});


4.2 ReserveSequence Input/Output

export const ReserveSequenceInput = z.object({
  tenantId: z.string().uuid(),
  sequenceKey: z.string().min(3).max(120),
  // Optional: used for reset boundaries (backdated docs)
  atTime: z.string().datetime().optional(),
});

export const ReserveSequenceOutput = z.object({
  reservationId: z.string().uuid(),
  value: z.string().min(1).max(200),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});


4.3 CommitSequence Input/Output

export const CommitSequenceInput = z.object({
  tenantId: z.string().uuid(),
  reservationId: z.string().uuid(),
  objectRef: z.object({
    type: z.string().min(1).max(80), // "invoice", "journal", etc (domain chooses)
    id: z.string().uuid(),
  }),
});

export const CommitSequenceOutput = z.object({
  value: z.string().min(1).max(200),
  committedAt: z.string().datetime(),
});

4.4 CancelSequence Input/Output

export const CancelSequenceInput = z.object({
  tenantId: z.string().uuid(),
  reservationId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export const CancelSequenceOutput = z.object({
  cancelledAt: z.string().datetime(),
});

5) Supporting: Formatting Rules
5.1 Allowed Tokens

Minimum required tokens:

{YYYY} (4-digit year)

{MM} (2-digit month)

{DD} (2-digit day)

{000} / {0000} / {00000} numeric padding token

Example formats:

INV-{YYYY}-{0000}

JV-{YYYY}{MM}-{00000}

LHDN-{YYYY}-{MM}-{0000}

5.2 Validation

Kernel MUST reject formats that:

have no numeric padding token

exceed max length

contain unsafe characters (enforce whitelist)

6) Supporting: Storage Model (Postgres)
6.1 kernel_sequence_policy

Stores policy and current state.

Columns:

tenant_id uuid not null

sequence_key text not null

format text not null

reset_policy text not null

gap_policy text not null

timezone text not null

current_counter bigint not null

reset_anchor date null (tracks last reset boundary)

created_at timestamptz not null

updated_at timestamptz not null

Unique:

(tenant_id, sequence_key)

6.2 kernel_sequence_reservation

Columns:

reservation_id uuid pk

tenant_id uuid not null

sequence_key text not null

counter_value bigint not null

rendered_value text not null

status text not null (reserved|committed|cancelled|expired)

expires_at timestamptz not null

created_at timestamptz not null

Indexes:

(tenant_id, sequence_key, status)

(expires_at)

6.3 kernel_sequence_commit

Columns:

tenant_id uuid not null

reservation_id uuid not null

object_type text not null

object_id uuid not null

committed_at timestamptz not null

Unique:

(tenant_id, object_type, object_id) (one number per object)

(tenant_id, reservation_id) (commit once)

7) Supporting: Concurrency Strategy
Required property

Under high concurrency, issuing numbers must never produce duplicates.

Recommended:

Use SELECT ... FOR UPDATE on kernel_sequence_policy row

Increment current_counter

Insert reservation row

Commit transaction

Strict gapless adds:

reservation reuse pool for cancelled/expired (lowest-first)

reclaim job to move expired → reusable

8) Supporting: Drift Traps & Forbidden Patterns

Forbidden in domain modules:

MAX(number)+1

SERIAL/IDENTITY for legal document numbering

caching “next number” in UI

Forbidden in kernel:

embedding invoice semantics

conditional business rules (“if amount > X then …”)

9) Evidence (EVI055 — Sequence Governance Certified)
Acceptance Criteria

Unique under concurrency

Correct reset behavior

Gap policy enforced truthfully

Full audit of reserve/commit/cancel/reclaim

Paste Blocks
[A] Concurrency uniqueness

Show 100 parallel reservations → all unique and ordered.

[B] Cancel + reuse (strict gapless)

Reserve N, cancel N, reserve again → N re-issued.

[C] Commit binding

Commit reservation to objectRef → immutable binding visible.

[D] TTL reclaim

Abandon reservation → scheduler expires and reclaims.

[E] Audit trail

Every action has:

tenantId

actorId (if present)

traceId

sequenceKey

reservationId

[F] Reset policy

Cross boundary (year/month/fiscal) → counter resets deterministically.

[G] Format enforcement

Invalid format rejected + logged.

End of KER100
```
