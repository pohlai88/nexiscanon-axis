# KER000 — Kernel Constitution v1.3
**Status:** Sealed (Living Document)  
**Layer:** Kernel Foundation & Governance  
**Purpose:** Define what the Kernel is, what it is not, and the invariants it must uphold  
**Related:** [KER001 Capability Map](KER001-KERNEL-CAPABILITY-MAP-v1.3.md)

---

## 0) Preamble: Why This Document Exists

The Kernel Constitution is the **unchanging foundation** of the NexusCanon-AXIS platform. It defines:
- What problems the kernel solves (and doesn't solve)
- Non-negotiable invariants every kernel primitive must uphold
- The boundary between kernel and domain
- The "laws" that prevent architectural drift

**This document is sealed** in that its core principles are immutable. Specific capabilities may evolve (see [KER001](KER001-KERNEL-CAPABILITY-MAP-v1.3.md)), but these constitutional principles remain fixed.

---

## I) Kernel Charter: What Is The Kernel?

### Definition

The **Kernel** is a **substrate layer** that provides:
- Correctness primitives (that domains cannot safely implement themselves)
- Trust primitives (for security, privacy, audit immutability)
- SaaS primitives (for multi-tenancy, fairness, observability)
- Modern primitives (for AI, search, integration safety)

**The kernel is NOT:**
- A framework (it doesn't dictate app structure)
- A business rules engine (it doesn't know "invoice semantics")
- A UI library (it provides APIs only)
- A report generator (it provides export primitives)

### Philosophy: The "Quiet Substrate"

The best kernel is invisible to end-users but provides **non-negotiable safety** to developers.

Like SAP/Oracle/NetSuite kernels (which exist but are rarely called out), this kernel ensures:
- Tenants cannot corrupt each other's data
- Financial document numbers are deterministic
- Approvals cannot be bypassed
- Audit trails are tamper-evident
- Integrations don't lose events
- AI requests don't leak PII

**If a capability meets these criteria, it belongs in the kernel:**
1. Required by 2+ domain modules
2. Getting it wrong causes corruption, security drift, or compliance failure
3. Domains cannot safely implement it themselves

---

## II) Non-Negotiable Invariants (The Laws)

These invariants MUST hold for every kernel primitive, every API, every interaction.

### Law 1: No Business Logic Contamination

**Statement:**  
The kernel MUST NOT contain domain-specific business rules.

**Examples of FORBIDDEN kernel logic:**
- "Invoice approval requires 2 signatures if amount > $10,000"
- "Tax rate for Malaysia SST is 6%"
- "Posting to GL requires debit = credit"
- "Suppliers must provide tin number"

**Examples of ALLOWED kernel logic:**
- "Approval routing evaluates facts → approvers (facts provided by domain)"
- "Sequences issue in strict order with locking"
- "Audit events are hash-chained"
- "Privacy redaction masks fields tagged as PII"

**Enforcement:**
- Code review gate: any PR adding domain semantics to kernel packages is rejected
- Architectural test: kernel packages must not depend on domain packages

---

### Law 2: Tenant Isolation (Absolute)

**Statement:**  
Every kernel primitive MUST enforce tenant boundaries. Cross-tenant data access is forbidden unless explicitly scoped (e.g., platform admin with audit trail).

**Requirements:**
- Every query MUST include `tenantId` in WHERE clause
- Every API MUST validate caller's tenant scope
- Row-level security (RLS) policies enforce isolation at DB layer
- Audit events MUST record tenantId

**Threat Model:**
- Malicious actor cannot enumerate other tenants
- Bug in domain code cannot leak cross-tenant data
- Admin operations that cross tenants require explicit audit

**Enforcement:**
- DB schema: all tenant-scoped tables have `tenant_id` column with NOT NULL
- API middleware: `withTenant` middleware extracts and validates tenantId
- Test harness: EVI tests must prove cross-tenant isolation

---

### Law 3: Audit Linkage (Mandatory)

**Statement:**  
Every kernel operation that changes state or discloses data MUST create an audit event.

**Requirements:**
- Audit event MUST include:
  - `tenantId`
  - `traceId`
  - `actorId` (if present)
  - `action` (what happened)
  - `objectRef` (what was affected)
  - `result` (ALLOW/DENY/SUCCESS/FAIL)
  - `time` (ISO 8601 UTC)
- Audit writes MUST be transactional with state changes
- Audit events MUST be immutable (append-only)

**Examples:**
- Sequence reserved → audit event
- Approval evaluated → audit event
- Secret used → audit event
- Guest link accessed → audit event
- Batch executed → audit event
- AI request submitted → audit event

**Enforcement:**
- Every kernel API must call `auditWrite(...)`
- EVI tests must verify audit events exist
- Audit immutability enforced by K-W1

---

### Law 4: Trace Propagation (Universal)

**Statement:**  
Every request, job, event, webhook must carry a `traceId` from edge to completion.

**Requirements:**
- TraceID generated once at edge (K-M7)
- TraceID stored in ALS (AsyncLocalStorage) for request lifecycle
- TraceID propagated to:
  - All logs (structured)
  - All audit events
  - All error envelopes
  - DB query comments
  - Outbox events
  - Webhook deliveries
  - Batch item records
  - Job run records
- TraceID returned in response headers (`x-trace-id`)

**Implementation:**

```typescript
// packages/observability/src/context.ts
export type RequestContext = {
  traceId: string;
  requestId: string;
  routeId?: string;
  method?: string;
  tenantId?: string;
  actorId?: string;
  roles?: string[];
};

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(ctx, fn);
}

export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

// packages/observability/src/tracing.ts
export function getActiveTraceId(): string | undefined {
  const span = trace.getActiveSpan();
  return span?.spanContext().traceId;
}

export function setSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  span?.setAttributes(attributes);
}

// packages/api-kernel/src/kernel.ts (simplified)
export function kernel<TQuery, TBody, TOutput>(spec: RouteSpec<TQuery, TBody, TOutput>) {
  return async (request: NextRequest) => {
    const traceId = getActiveTraceId() ?? generateId();
    const requestId = generateId();
    
    const ctx: RequestContext = {
      traceId,
      requestId,
      routeId: spec.routeId,
      method: spec.method,
    };
    
    return runWithContext(ctx, async () => {
      setSpanAttributes({
        "route.id": spec.routeId,
        "http.method": spec.method,
      });
      
      // ... handler execution ...
      
      return ok(result, traceId); // traceId in response
    });
  };
}
```

**Enforcement:**
- Middleware: `withTracing` injects TraceContext into ALS
- DB wrapper: queries auto-inject trace comment
- EVI044 certifies propagation end-to-end

---

### Law 5: Idempotency for State Changes

**Statement:**  
All state-changing operations MUST be safe under retries.

**Requirements:**
- HTTP POST/PUT/PATCH routes support `Idempotency-Key` header
- Idempotency implementation uses K-M6 (Traffic Governor)
- Request hash validated (same key + different body → 409 Conflict)
- Cached response returned for replay within TTL
- Job handlers MUST be idempotent
- Batch items MUST have stable `itemKey` for replay safety

**Enforcement:**
- Route spec declares `idempotent: true`
- Kernel middleware enforces idempotency semantics
- EVI043 certifies idempotency safety

---

### Law 6: Standard Envelopes Only

**Statement:**  
All kernel APIs MUST return standard envelopes. No arbitrary response shapes.

**Success Envelope:**

```typescript
// packages/api-kernel/src/types.ts
type SuccessEnvelope<T> = {
  data: T;           // typed payload
  meta: {
    traceId: string;
  };
};
```

**Error Envelope:**

```typescript
// packages/api-kernel/src/types.ts
type ErrorEnvelope = {
  error: {
    code: string;    // machine-readable (ErrorCode enum)
    message: string; // human-readable
    traceId: string;
    details?: Record<string, unknown>;
    fieldErrors?: Record<string, string[]>;
  };
};
```

**Implementation:**

```typescript
// packages/api-kernel/src/http.ts
export function ok<T>(data: T, traceId: string): NextResponse<SuccessEnvelope<T>> {
  return NextResponse.json({ data, meta: { traceId } }, { status: 200 });
}

export function fail(
  code: ErrorCodeType,
  message: string,
  traceId: string,
  options?: { details?: Record<string, unknown>; fieldErrors?: Record<string, string[]>; }
): NextResponse<ErrorEnvelope> {
  const status = getHttpStatus(code);
  return NextResponse.json({
    error: { code, message, traceId, ...options }
  }, { status });
}
```

**Status Codes (Strict):**
- 200 OK (success with body)
- 201 Created (resource created)
- 204 No Content (success without body)
- 400 Bad Request (validation failure)
- 401 Unauthorized (auth missing/invalid)
- 403 Forbidden (auth valid but insufficient)
- 404 Not Found (resource doesn't exist)
- 409 Conflict (idempotency violation, concurrent modification)
- 429 Too Many Requests (rate limit)
- 500 Internal Server Error (unexpected failure)

**Enforcement:**
- Route handler wrapper enforces envelope shape
- EVI tests verify envelope compliance
- TypeScript types enforce compile-time safety

---

### Law 7: Zod is Single Source of Truth (SSOT)

**Statement:**  
All kernel contracts (inputs, outputs, events, primitives) MUST be defined as Zod schemas.

**Requirements:**
- API route inputs validated via Zod parse
- API outputs validated via Zod encode (in dev/test)
- Event payloads validated via Zod
- Database record types derived from Zod (via Drizzle integration)
- OpenAPI specs (if generated) are derived from Zod, never hand-written

**Implementation Example:**

```typescript
// packages/validation/src/api.ts
export const echoBodySchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const echoOutputSchema = z.object({
  echoed: z.string(),
});

export type EchoBody = z.infer<typeof echoBodySchema>;
export type EchoOutput = z.infer<typeof echoOutputSchema>;

// packages/api-kernel/src/kernel.ts (simplified)
export function kernel<TQuery, TBody, TOutput>(spec: RouteSpec<TQuery, TBody, TOutput>) {
  return async (request: NextRequest) => {
    // ... context setup ...
    
    // Validate inputs
    const query = spec.query?.safeParse(rawQuery);
    const body = spec.body?.safeParse(rawBody);
    
    // Execute handler
    const result = await spec.handler(ctx);
    
    // Validate output
    const output = spec.output.safeParse(result);
    if (!output.success) {
      throw new KernelError(ErrorCode.INTERNAL_ERROR, "Response validation failed");
    }
    
    return ok(output.data, traceId);
  };
}
```

**Benefits:**
- Runtime validation + TypeScript types from single definition
- Contract compatibility checks via schema diffing
- Golden tests for serialization roundtrips
- Self-documenting APIs

**Enforcement:**
- No raw `any` types in kernel APIs
- Route spec requires `inputSchema` and `outputSchema` (Zod)
- EVI046 (Contract Governance) enforces schema registry

---

### Law 8: Performance Budgets (Mandatory)

**Statement:**  
Every route, query, job must declare a performance budget. Violations trigger observability warnings.

**Budgets:**
- Route execution: default 500ms
- DB query: default 200ms
- External call: default 800ms
- Job execution: default 5 minutes

**Enforcement:**
- K-M7 (Telemetry) tracks actual vs. budget
- Performance violation emits structured log + metric
- Violations audited with traceId
- EVI044 certifies budget enforcement

---

### Law 9: Fail-Safe Defaults (Deny-By-Default)

**Statement:**  
Security, privacy, and access control MUST default to most restrictive.

**Examples:**
- Privacy: PII masked by default
- Auth: deny by default, allow explicitly
- Rate limits: enforced by default
- Guest links: scoped + TTL always
- AI gateway: redaction enforced unless explicitly disabled (with audit)

**Enforcement:**
- Code review: any "allow by default" requires explicit justification
- Tests: negative cases (unauthorized, over-quota, expired) must be tested

---

### Law 10: No Silent Failures

**Statement:**  
Critical operations MUST NOT fail silently.

**Requirements:**
- Database constraint violations surface as 409/400, not swallowed
- Audit write failures abort transaction (no "best effort" audit)
- Job failures trigger circuit breaker + DLQ
- Webhook delivery failures retry with exponential backoff + DLQ

**Enforcement:**
- Error handling policy: kernel primitives escalate, don't swallow
- Observability: failures emit structured errors with traceId

---

## III) Kernel Glossary

### Core Terms

**Kernel Primitive**  
A substrate capability (type, API, enforcement rule) that domains consume but don't implement.

**Domain Module**  
Business logic layer (e.g., Invoicing, GL, Inventory) that uses kernel primitives.

**Addon**  
Marketplace-distributed module with manifest declaring kernel capabilities needed.

**Manifest**  
Declarative config (JSON/YAML) specifying module dependencies, migrations, contracts, etc.

**EVI (Evidence)**  
A certification proof block that demonstrates a kernel capability works correctly.

**TraceContext**  
ALS-stored context containing `traceId`, `tenantId`, `actorId`, `requestId`.

**Envelope**  
Standard response shape (success or error) with `data`/`error` + `meta`.

**Idempotency-Key**  
HTTP header for request deduplication; enforced by K-M6.

**Outbox**  
Transactional event storage pattern (K-E1) ensuring at-least-once delivery.

**Sequence Key**  
Namespace for document numbering (e.g., `invoice.sales`, `journal.gl`).

**Gap Policy**  
Numbering discipline: `monotonic_gaps_allowed` vs. `strict_gapless`.

**Approval Rule**  
Evaluation logic (facts → approvers) for K-M11.

**Delegation**  
Temporary approval authority transfer (absence coverage).

**Batch Operation**  
K-M13 controlled bulk execution with chunking + checkpointing.

**Guest Link**  
Scoped, time-bound, signed URL for external access (K-B2).

**Redaction**  
Privacy Engine (K-B1) masking of PII/sensitive fields before disclosure.

**DLQ (Dead Letter Queue)**  
Storage for failed webhook/event deliveries after max retries.

**Circuit Breaker**  
Resilience pattern: suspend operations after repeated failures.

**Fairness Class**  
Tenant job priority grouping (prevents noisy neighbor).

---

## IV) Capability Boundaries (Kernel vs. Domain)

### Decision Matrix: Where Does This Belong?

| Criterion                                          | If YES → Kernel | If NO → Domain |
| -------------------------------------------------- | --------------- | -------------- |
| Required by 2+ domains?                            | ✅               | ❌              |
| Getting it wrong causes corruption/security drift? | ✅               | ❌              |
| Requires tenant-wide enforcement?                  | ✅               | ❌              |
| Compliance/audit requirement?                      | ✅               | ❌              |
| Domain-agnostic logic?                             | ✅               | ❌              |
| Changes business rules frequently?                 | ❌               | ✅              |
| Specific to one industry vertical?                 | ❌               | ✅              |

### Examples (Clear Boundaries)

**Kernel Owns:**
- Sequence issuance protocol
- Approval rule evaluation engine
- Privacy redaction enforcement
- Audit immutability
- Webhook delivery retry logic
- AI request budget enforcement

**Domain Owns:**
- Invoice validation rules
- Tax calculation logic
- Posting entry balance rules
- Approval thresholds (as facts submitted to kernel)
- Report layouts
- Email templates

**Gray Area (Domain Uses Kernel):**
- "Invoice must have sequential number" → Domain requests sequence from kernel
- "Purchase order requires approval" → Domain submits facts to approval engine
- "Export invoice for auditor" → Domain uses guest link primitive

---

## V) Compatibility Rules for Primitives

### Breaking vs. Non-Breaking Changes

**Non-Breaking (Patch/Minor):**
- Add optional field to schema
- Add new capability/API
- Relax validation rules
- Add new enum values (with fallback)
- Improve performance
- Add deprecation warnings

**Breaking (Major):**
- Remove/rename field
- Change field type
- Remove capability/API
- Make optional field required (without default)
- Change semantics
- Remove enum values

### Deprecation Windows

**Minimum deprecation window:**
- Patch: immediate (must be backward compatible)
- Minor: 1 release cycle
- Major: 2 release cycles (6+ months)

**Deprecation Requirements:**
- Add deprecation metadata to contract registry
- Runtime warnings (optional but recommended)
- Migration guide in docs
- Audit of deprecation notice emissions

---

## VI) Evidence Requirements (EVI Certification)

### What is an EVI?

An **EVI (Evidence) block** is a certification proof that demonstrates a kernel capability works correctly under adversarial conditions.

**Structure:**
```
EVI### — [Capability Name] Certified

Acceptance Criteria:
- [Requirement 1]
- [Requirement 2]
- ...

Paste Blocks:
[A] [First proof scenario]
[B] [Second proof scenario]
...
```

**Paste Blocks** are executable test scenarios that produce evidence output. They must be:
- Deterministic (same input → same output)
- Isolated (no external dependencies beyond test fixtures)
- Auditable (output includes traceId, timestamps, object refs)

### Required EVIs for Kernel v1.3 Seal

**Total Required:** 14 EVIs (see [KER001](KER001-KERNEL-CAPABILITY-MAP-v1.3.md) Section D)

**Critical Path EVIs (Must Complete First):**
- EVI041 Keymaster
- EVI042 Scheduler
- EVI043 Traffic Governor
- EVI044 Telemetry Propagation

**Top 3 Immediate (Finance-Compliance):**
- EVI045 Schema Migration
- EVI047 Secrets Lifecycle
- EVI048 Audit Immutability

**Remaining (ERP-Ready):**
- EVI055 Sequence Governance
- EVI058 Approval Matrix
- EVI059 Batch Framework

**Privacy & Integration:**
- EVI023 Privacy Engine
- EVI028 Guest Links
- EVI027 Outbox/Webhooks
- EVI046 Contract Governance
- EVI057 AI Gateway

---

## VII) Kernel Planning Pack Structure

### Document Hierarchy

```
.cursor/plans/K-kernel-ker/
├── KER000-KERNEL-CONSTITUTION.md          ← THIS DOCUMENT
├── KER001-KERNEL-CAPABILITY-MAP-v1.3.md   ← Complete capability taxonomy
├── KER-DRAFT.md                            ← Working notes (DEPRECATED after restructure)
│
├── KER100-SEQUENCE-GOVERNANCE-K-M10.md     ← Sequence numbering primitive
├── KER110-APPROVAL-MATRIX-K-M11.md         ← Approval routing engine
├── KER120-BATCH-FRAMEWORK-K-M13.md         ← Bulk operations safety
├── KER210-IDEMPOTENCY-TRAFFIC-GOVERNOR-K-M6.md  ← Rate limiting + idempotency
├── KER220-SCHEDULER-HEARTBEAT-K-M5.md      ← Job scheduling substrate
├── KER230-KEYMASTER-SIGNING-K-M4.md        ← Signing primitive (non-repudiation)
├── KER240-SECRETS-CERT-LIFECYCLE-K-V1.md   ← Secret management
├── KER250-AUDIT-IMMUTABILITY-WORM-K-W1.md  ← Tamper-evident audit
├── KER260-TELEMETRY-PROPAGATION-K-M7.md    ← Trace continuity
├── KER270-CONTRACT-GOVERNANCE-K-R1.md      ← API/Event compatibility
├── KER280-SCHEMA-MIGRATION-GOVERNANCE-K-S1.md  ← DB migration safety
├── KER290-PRIVACY-ENGINE-K-B1.md           ← PII redaction enforcement
├── KER300-EXTERNAL-AUDITOR-LINKS-K-B2.md   ← Guest link access control
├── KER310-EVENTBUS-OUTBOX-WEBHOOKS-K-E1.md ← Event delivery reliability
└── KER340-INTELLIGENCE-GATEWAY-K-I1.md     ← AI proxy with privacy
```

### Navigation Pattern

1. Start with **KER000** (this document) for constitutional principles
2. Review **KER001** for complete capability map and dependencies
3. Dive into individual **KERxxx** documents for implementation specs
4. Reference **CAN003** for route handler patterns and anti-drift rules

---

## VIII) Relationship to Other Canon Documents

### CAN003 Architecture Spec
**Dependency:** KER000 defines principles; CAN003 defines enforcement mechanisms  
**Key Links:**
- Route handler pattern: `export const GET = kernel(spec)`
- Middleware pipeline order
- Error envelope shape
- Status code discipline

### Domain Planning Packs (Future)
**Examples:**
- `DOM-ERP-GL` (General Ledger)
- `DOM-ERP-AR` (Accounts Receivable)
- `DOM-ERP-INV` (Inventory)

**Relationship:**
- Domain packs MUST reference KER capabilities they consume
- Domain packs MUST NOT duplicate kernel logic
- Domain manifests declare kernel dependencies

---

## IX) Amendment Process

### Constitution Amendments (Rare)

The **core invariants** (Laws 1-10) should rarely change. If an amendment is needed:

1. Propose amendment with rationale
2. Impact analysis on all existing EVIs
3. Migration plan for affected primitives
4. Approval from kernel maintainers
5. Communicate to all addon developers

### Capability Map Evolution (Common)

The **capability map** (KER001) evolves as new primitives are added:

1. Propose new capability with:
   - Boundary justification (why kernel, not domain?)
   - Dependencies on existing primitives
   - EVI certification plan
2. Draft KERxxx specification document
3. Implement with tests
4. Certify via EVI paste blocks
5. Update KER001 status matrix

---

## X) Kernel v1.3 Seal Statement

When all required EVIs are certified (14/14), the kernel is **sealed** and guarantees:

✅ **Correctness:** Sequences, approvals, and batches are corruption-proof  
✅ **Trust:** Keys, secrets, and audit logs are tamper-evident  
✅ **SaaS:** Tenant fairness and observability are platform-wide  
✅ **Modern:** AI and integration safety with privacy enforcement

**Seal Verification:**
```bash
pnpm -w kernel:certify
```

Expected output:
```
✅ Kernel v1.3 — SEALED (14/14 EVIs certified)
```

---

**End of KER000 — Kernel Constitution v1.3**

**Next Steps:**
1. Review [KER001 Capability Map](KER001-KERNEL-CAPABILITY-MAP-v1.3.md)
2. Implement/certify priority EVIs (041-044)
3. Complete Top 3 EVIs (045, 047, 048)
4. Certify remaining EVIs (055, 058, 059, etc.)
5. Run `pnpm -w kernel:certify` for seal verification

## A) K-M10 / K-C4 — Sequence Governance (Document Numbering)

### `KER-100-SEQUENCE-GOVERNANCE-K-M10.md`

**Canonical**

* What “gapless” means (strict vs monotonic)
* Reservation/commit protocol (truthful gapless)
* Reset policy (year/month/fiscal)
* Formatting tokens (`INV-{YYYY}-{0000}`)

**Supporting**

* Data model tables:

  * `kernel_sequence_policy`
  * `kernel_sequence_reservation`
  * `kernel_sequence_commit`
* Concurrency strategy:

  * advisory locks OR row locks OR single-row counter per key
* Failure modes:

  * crashed reservation reclaim (Scheduler dependency)

**Evidence**

* **EVI055 Sequence Governance Certified**

  * concurrency proof
  * rollback/cancel proof
  * reset proof
  * audit proof

---

## B) K-M11 — Approval Matrix + Delegation Primitives

### `KER-110-APPROVAL-MATRIX-K-M11.md`

**Canonical**

* Rule evaluation engine: `facts -> approver set`
* Delegation chaining rules
* Escalation and SLA hooks
* Override/break-glass approval rules (audited)

**Supporting**

* DSL for `conditions` (facts are domain-provided)
* Data model:

  * `kernel_approval_rule`
  * `kernel_delegation`
  * `kernel_approval_resolution_audit`
* Determinism requirements (same facts/time -> same result hash)

**Evidence**

* **EVI058 Approval Matrix Certified**

  * delegation proof
  * escalation proof
  * override proof

---

## C) K-M13 — Batch & Bulk Operation Framework

### `KER-120-BATCH-FRAMEWORK-K-M13.md`

**Canonical**

* Batch lifecycle: created → running → paused → failed → completed
* Chunking + checkpoint + resume discipline
* Item-level idempotency
* Result bundle export contract

**Supporting**

* Data model:

  * `kernel_batch_operation`
  * `kernel_batch_item`
  * `kernel_batch_result_bundle`
* Quota integration:

  * Traffic Governor (K-M6)
* Worker integration:

  * Scheduler (K-M5) / Graphile Worker

**Evidence**

* **EVI059 Batch Framework Certified**

  * resume proof
  * no double-apply proof
  * progress proof

---

# 2) Kernel “substrate pillars” (must exist before domains scale)

## `KER-200-ROUTE-KERNEL-ANTI-DRIFT-CAN003.md`

This is the **direct seal** of CAN003 into the Kernel pack.

**Canonical**

* Mandatory route handler pattern:

  * `export const GET = kernel(spec)`
* Mandatory pipeline order:

  * withContext → withTenant → withAuth → withValidation → withErrorEnvelope → withLogging → withTracing 
* Allowed response envelopes only 

**Supporting**

* ESLint/CI drift gates checklist
* RouteSpec template

**Evidence**

* Drift-check script output template

---

## `KER-210-IDEMPOTENCY-TRAFFIC-GOVERNOR-K-M6.md`

**Canonical**

* Token bucket rate limiting (tenant/user/ip)
* Idempotency-Key replay cache (24h TTL)
* Response caching rules
* Conflict detection (`requestHash mismatch`)

**Supporting**

* Storage model:

  * `kernel_rate_limit_bucket`
  * `kernel_idempotency_record`
* Threat model: double-charge, retries, DDOS, noisy neighbor

**Evidence**

* **EVI043 Traffic Governor Certified**

---

## `KER-220-SCHEDULER-HEARTBEAT-K-M5.md`

**Canonical**

* Distributed scheduler
* At-least-once semantics
* Locking so only one node executes
* Circuit-break failing jobs

**Supporting**

* Graphile Worker integration
* JobEnvelope schema
* Fairness classes per tenant

**Evidence**

* **EVI042 Scheduler Certified**

---

## `KER-230-KEYMASTER-SIGNING-K-M4.md`

**Canonical**

* Tenant-scoped key aliases
* `Sign(payloadDigest, keyAlias)`
* Rotation policy
* Key usage audit (non-repudiation)

**Supporting**

* Key storage model (encrypted)
* Verify-only old keys policy
* LHDN signing readiness hooks

**Evidence**

* **EVI041 Keymaster Certified**

---

## `KER-240-SECRETS-CERT-LIFECYCLE-K-V1.md`

**Canonical**

* Secret aliasing + rotation
* Certificate issuance + renewal hooks
* HSM-ready interface (future)
* TLS automation metadata (not infra-specific)

**Supporting**

* Vault adapter interface
* Audit requirements for secret usage

**Evidence**

* **EVI047 Secrets Lifecycle Certified**

---

## `KER-250-AUDIT-IMMUTABILITY-WORM-K-W1.md`

**Canonical**

* Append-only audit log semantics
* Hash chain / Merkle sealing
* Verifiable retention + export bundles

**Supporting**

* Audit storage tables
* Tamper detection tooling
* Legal hold integration

**Evidence**

* **EVI048 Audit Immutability Certified**

---

## `KER-260-TELEMETRY-PROPAGATION-K-M7.md`

**Canonical**

* TraceID generated at edge
* Propagate into:

  * logs
  * audit events
  * outbox events
  * webhook deliveries
  * DB query annotations
* Performance budgets (violation warnings)

**Supporting**

* ALS keys contract (traceId/requestId/tenantId/actorId)
* OTel span conventions

**Evidence**

* **EVI044 Telemetry Propagation Certified**

---

## `KER-270-CONTRACT-GOVERNANCE-K-R1.md`

**Canonical**

* Contract registry for API + events
* Compatibility gates in CI
* Deprecation windows + versioning policy
* Zod is SSOT (inputs/outputs/events)

**Supporting**

* OpenAPI derived artifact policy (optional) 
* Contract test harness layout

**Evidence**

* **EVI046 Contract Governance Certified**

---

## `KER-280-SCHEMA-MIGRATION-GOVERNANCE-K-S1.md`

**Canonical**

* Deterministic migrations
* Transactional apply
* Rollback or irreversible marker discipline
* Migration audit

**Supporting**

* Migration manifest format
* Drizzle migration integration

**Evidence**

* **EVI045 Schema Migration Certified**

---

## `KER-290-PRIVACY-ENGINE-K-B1.md`

**Canonical**

* Data classification tags (PII, Sensitive, Financial)
* Mask/export/delete hooks
* Consent/purpose metadata (PDPA/GDPR ready)

**Supporting**

* Retention policies binding
* Redaction strategies

**Evidence**

* **EVI023 Privacy Hooks Certified**

---

## `KER-300-EXTERNAL-AUDITOR-LINKS-K-B2.md`

**Canonical**

* Public guest links (scoped, TTL)
* Watermark metadata
* Access logs + revocation

**Supporting**

* Link signing + replay protection
* Tenant policy controls

**Evidence**

* **EVI028 Guest Links Certified**

---

## `KER-310-EVENTBUS-OUTBOX-WEBHOOKS-K-E1.md`

**Canonical**

* Transactional outbox
* Delivery retries + DLQ + replay
* Webhook signing + tenant scoping

**Supporting**

* EventEnvelope schema
* Endpoint governance

**Evidence**

* **EVI027 Outbox/Webhooks Certified**

---

## `KER-320-OCR-INDEX-SEARCH-CMDK-K-C2.md`

**Canonical**

* OCR pipeline
* Content indexing
* Global search endpoint
* Cmd+K search substrate (API only)

**Supporting**

* Index schema registration by addons
* Cost controls + quotas

**Evidence**

* **EVI024 OCR/Search Certified**

---

## `KER-330-DUPLICATE-DETECTION-SHA256-K-C1.md`

**Canonical**

* SHA-256 hash at ingestion
* Dedup link model (`supersedes`, `sameAs`)
* Integrity verification

**Supporting**

* Storage rules (R2 refs)
* Collision handling policy (paranoid but simple)

**Evidence**

* **EVI025 Hash Dedupe Certified**

---

## `KER-340-INTELLIGENCE-GATEWAY-K-I1.md`

**Canonical**

* LLM proxy
* PII redaction enforced via Privacy Engine
* Token budgets per tenant
* Model allow-list + residency controls

**Supporting**

* Prompt audit without storing sensitive content
* Caching policy (default off)

**Evidence**

* **EVI057 AI Gateway Certified**

---

# 3) “Follow after Kernel v1.3” (so you don’t forget)

These are the features we identified that **must follow** after v1.3 seal, but are **not kernel blockers**.

### `KER-900-POST-KERNEL-V1.3-FOLLOWUP-BACKLOG.md`

**Canonical**

* Domain foundation packs:

  * DOMAIN-ERP-GL
  * DOMAIN-ERP-AR/AP
  * DOMAIN-ERP-INVENTORY
  * DOMAIN-ERP-TAX
  * DOMAIN-ERP-PERIOD-CLOSE
* Marketplace rollout plan
* Compliance packs rollout (Malaysia-first)

**Supporting**

* Suggested order:

  1. GL + posting invariants
  2. Invoice + numbering + approvals (now safe)
  3. Batch GST/e-invoice submissions
* UX follow-ups:

  * Cmd+K UI
  * Approval Inbox UI
  * External Auditor UI

**Evidence**

* Domain-level EVIs (separate track, not kernel)

---

# ✅ The Line (drawn once, no drift)

### Kernel v1.3 guarantees:

* **Correctness substrate** (sequence, approvals, batch, idempotency)
* **Trust substrate** (keys, secrets, privacy, audit immutability)
* **SaaS substrate** (tenant fairness, scheduler, telemetry, contracts, migrations)
* **Modern substrate** (AI gateway, search indexing)

### Domain ERP guarantees:

* accounting correctness and policies **implemented using kernel primitives**
* never bypass kernel enforcement

---
