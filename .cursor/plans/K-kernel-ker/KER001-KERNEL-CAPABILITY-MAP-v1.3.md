# KER001 — Kernel Capability Map v1.3

**Status:** Sealed (Ratification-Ready)  
**Layer:** Kernel Architecture Foundation  
**Purpose:** Comprehensive taxonomy of all kernel capabilities, dependencies, and evidence requirements  
**Canon anchor:** KER000 Kernel Constitution + CAN003 Architecture Spec

---

## 0) Document Purpose & Scope

This document defines the **complete capability map** for the NexusCanon-AXIS Kernel v1.3. It serves as:

- The authoritative capability taxonomy (what the kernel owns vs. what domains own)
- The dependency graph (which capabilities depend on others)
- The evidence matrix (mapping capabilities to EVIs)
- The ratification checklist (completion criteria for "Kernel v1.3 sealed")

**Kernel v1.3 Philosophy:**
The kernel is a **substrate**, not a framework. It provides:

- Correctness primitives (sequences, approvals, batch safety)
- Trust primitives (keys, secrets, privacy, audit immutability)
- SaaS primitives (tenant fairness, scheduler, telemetry, contracts, migrations)
- Modern primitives (AI gateway with privacy, search indexing)

**What the kernel is NOT:**

- Business logic container
- ERP domain rules engine
- UI framework
- Report generator

---

## A) Capability Taxonomy (Complete v1.3)

### K-A) Governance & Configuration Plane

**K-A1 Config Resolver**

- Org/Admin + Personal overrides → Effective Manifest
- Multi-layer configuration resolution
- Jurisdiction-aware config loading

**K-A2 Localization Pack Loader**

- locale + jurisdiction packs
- Language resource loading
- Date/time/currency formatting rules

**K-A3 Glossary Registry**

- Canonical terms + synonyms + references
- Cross-module terminology consistency
- Documentation linkage

---

### K-B) Trust, Privacy, Security Plane

**K-B1 Privacy Engine** → [KER290](KER290-PRIVACY-ENGINE-K-B1.md)

- Data classification (PII / Sensitive / Financial)
- Retention + masking/export/delete hooks
- Consent and purpose metadata (PDPA/GDPR ready)
- **EVI023 Privacy Hooks Certified**

**K-B2 External Auditor Access** → [KER300](KER300-EXTERNAL-AUDITOR-LINKS-K-B2.md)

- Public Guest Links (scoped/TTL)
- Watermark metadata enforcement
- Access logs + revocation
- **EVI028 Guest Links Certified**

**K-B3 Zero-Trust Web Security**

- CORS/CSRF/CSP enforcement
- Token scoping
- Deny-by-default policies
- Security header injection

---

### K-C) Data Integrity Plane

**K-C1 Content Integrity**

- SHA-256 hash at ingestion
- Deduplication with `supersedes`/`sameAs` graph
- Integrity verification
- **EVI025 Hash Dedupe Certified**

**K-C2 OCR + Content Indexing**

- Tenant-scoped global search
- Cmd+K search endpoints
- Document OCR pipeline
- **EVI024 OCR/Search Certified**

**K-C3 Data Lineage & Provenance**

- Derived outputs → inputs graph
- Queryable provenance chains
- Audit trail integration

**K-C4 / K-M10 Document Numbering & Sequence Governance** → [KER100](KER100-SEQUENCE-GOVERNANCE-K-M10.md)

- Distributed lock-safe sequence issuance
- Format validation (INV-{YYYY}-{000} style)
- Reset policies (yearly/monthly/fiscal)
- Gap policy enforcement (strict gapless vs monotonic)
- **EVI055 Sequence Governance Certified**

---

### K-D) Workflow & Automation Plane

**K-D1 Hierarchical Workflow Runtime (BPM)**

- Rigid state transitions
- Tasks + SLA + escalation
- Workflow audit integration

**K-D2 Adapter/Plugin Host**

- Sandbox + capability contracts
- Permission gating
- Module lifecycle management

---

### K-E) Ecosystem & Integration Plane

**K-E1 EventBus + Webhooks** → [KER310](KER310-EVENTBUS-OUTBOX-WEBHOOKS-K-E1.md)

- Transactional outbox pattern
- Delivery retries + DLQ + replay
- Webhook signing + tenant scoping
- **EVI027 Outbox/Webhooks Certified**

**K-E2 Marketplace Substrate**

- Module distribution governance
- Compatibility checks
- Module signing and verification

---

### K-F) Resilience & Operations Plane

**K-F1 Resilience Controls**

- Circuit breaker integration
- Rate limit integration
- Error envelopes
- Correlation and recovery

**K-F2 Disaster Recovery & Continuity**

- Verified restore drills
- Retention enforcement posture
- RPO/RTO measurement
- **EVI052 DR and Chaos Certified**

---

### K-G) Performance & Traffic Governance Plane

**K-M6 Traffic Governor & Idempotency (Bouncer)** → [KER210](KER210-IDEMPOTENCY-TRAFFIC-GOVERNOR-K-M6.md)

- Per-tenant rate limiting + quotas
- Idempotency-Key replay cache
- RequestHash validation
- **EVI043 Traffic Governor Certified**

---

### K-I) Intelligence Plane

**K-I1 / K-M8 Intelligence Gateway (LLM Proxy)** → [KER340](KER340-INTELLIGENCE-GATEWAY-K-I1.md)

- PII redaction via Privacy Engine
- Token budgets per tenant
- Model allow-list + residency controls
- Prompt audit without sensitive storage
- **EVI057 AI Gateway Certified**

---

### K-L) Tenant Lifecycle & Residency Plane

**K-L1 Onboard/Offboard + Data Residency**

- Provisioning deterministic resources
- Export packages + deletion queue
- Legal hold support
- Region pinning enforcement
- **EVI049 Tenant Lifecycle Certified**

---

### K-O) Observability Plane

**K-M7 Telemetry Propagation (Tracer)** → [KER260](KER260-TELEMETRY-PROPAGATION-K-M7.md)

- TraceID generation/propagation
- DB/event/webhook trace continuity
- Performance budget violations
- Structured logging requirements
- **EVI044 Telemetry Propagation Certified**

---

### K-R) Contract & Compatibility Plane

**K-R1 API/Event Contract Governance** → [KER270](KER270-CONTRACT-GOVERNANCE-K-R1.md)

- Contract registry (APIs + events)
- Compatibility gates in CI
- Deprecation windows + versioning
- Zod is SSOT
- **EVI046 Contract Governance Certified**

---

### K-S) Schema & Evolution Plane

**K-S1 Schema Migration & Versioning** → [KER280](KER280-SCHEMA-MIGRATION-GOVERNANCE-K-S1.md)

- Deterministic migrations
- Transactional apply
- Rollback or irreversible marker
- Migration audit with traceId
- **EVI045 Schema Migration Certified**

---

### K-T) Certification & Test Plane

**K-T1 Kernel Self-Test & Certification Harness**

- One command → EVI proofs
- CI integration for all EVIs
- Evidence bundle generation
- Kernel health checks

---

### K-V) Secrets & Certificates Plane

**K-V1 Secrets Lifecycle** → [KER240](KER240-SECRETS-CERT-LIFECYCLE-K-V1.md)

- Tenant vault integration
- Secret rotation + versioning
- Certificate issuance/rotation
- TLS automation hooks
- HSM-ready interface
- **EVI047 Secrets Lifecycle Certified**

**Note:** K-M4 Keymaster (signing primitive) is separate from K-V1 (broader secret/cert ops)

---

### K-W) Audit Immutability Plane

**K-W1 Tamper-evident Audit + WORM Logs** → [KER250](KER250-AUDIT-IMMUTABILITY-WORM-K-W1.md)

- Append-only semantics
- Hash chain / Merkle sealing
- Retention proofs
- Exportable regulator bundles
- **EVI048 Audit Immutability Certified**

---

### K-X) Transaction Integrity Plane

**K-X1 Transaction Patterns (Sagas)**

- Outbox + orchestration primitives
- Compensation logic support
- Bulk idempotent APIs
- **EVI051 Transactional Patterns Certified**

---

### K-BI) Metering & Chargeback Plane

**K-BI1 Billing/Metering Primitives**

- Usage hooks + attribution
- Quota billing events (no pricing logic)
- Consumption tracking
- **EVI050 Metering Certified**

---

### K-DRO) Disaster/Chaos Plane

**K-DRO1 DR Drills + Chaos Testing**

- Verified restore automation
- Cross-region failover drills
- Automated chaos scenarios
- Tenant-safe chaos injection
- **EVI052 DR and Chaos Certified**

---

### K-SC) Supply Chain Security Plane

**K-SC1 SBOM + Signed Modules + Vetting**

- Dependency scanning in CI
- Module package signing
- Marketplace verification chain
- Revocation list support
- **EVI053 Supply Chain Certified**

---

### K-FL) Feature Rollout Plane

**K-FL1 Flags + Safe Rollouts**

- Per-tenant feature gating
- Canary/blue-green hooks
- Rollback safety
- Flag change audit
- **EVI054 Feature Rollout Certified**

---

### Security & Trust Primitives (M-Series)

**K-M4 Cryptographic Keymaster (KMS / Signing Primitive)** → [KER230](KER230-KEYMASTER-SIGNING-K-M4.md)

- Tenant-scoped key aliases
- Sign/verify primitives (no key exposure)
- Rotation with verify-only old keys
- Non-repudiation audit
- **EVI041 Keymaster Certified**

**K-M5 Async Job Scheduler (Heartbeat)** → [KER220](KER220-SCHEDULER-HEARTBEAT-K-M5.md)

- Distributed scheduling + locking
- At-least-once semantics
- Fairness per tenant
- Circuit breakers for failing jobs
- **EVI042 Scheduler Certified**

**K-M11 Approval Matrix & Delegation Primitives** → [KER110](KER110-APPROVAL-MATRIX-K-M11.md)

- Rule evaluation engine (facts → approvers)
- Delegation chaining
- Escalation paths + SLA timers
- Override/break-glass logging
- Deterministic evaluation
- **EVI058 Approval Matrix Certified**

**K-M13 Batch & Bulk Operation Framework** → [KER120](KER120-BATCH-FRAMEWORK-K-M13.md)

- Chunking + checkpointing + resume
- Item-level idempotency
- Progress tracking + result bundles
- Quota-aware execution
- **EVI059 Batch Framework Certified**

---

## B) Kernel Core Primitives (Type System)

These types are **kernel substrate**, not business rules. They ensure consistency across all kernel capabilities.

### Security & Trust

```typescript
// K-M4 Keymaster
KeyScope: {
  (tenantId, keyAlias, purpose, algorithm, rotationPolicy, status);
}

SignRequest: {
  (keyAlias, payloadDigest, context, traceId);
}

SignResult: {
  (signature, keyVersion, createdAt);
}

KeyUsageAudit: {
  (keyAlias, actor, purpose, objectRef, traceId, result);
}
```

### Scheduling

```typescript
// K-M5 Scheduler
JobEnvelope: {
  jobId, tenantId, schedule, lockKey,
  fairnessClass, runAs, retries, circuitPolicy
}

JobRunAudit: {
  jobId, runId, startedAt, endedAt,
  status, traceId, errorRef?
}
```

### Traffic & Idempotency

```typescript
// K-M6 Traffic Governor
QuotaEnvelope: {
  (tenantId, limits, consumption, enforcementMode);
}

IdempotencyRecord: {
  (tenantId, key, requestHash, responseRef, ttl, createdAt);
}
```

### Telemetry

```typescript
// K-M7 Telemetry
TraceContext: {
  traceId, spanId?, tenantId, actorId?,
  requestId
}

PerfViolation: {
  traceId, tenantId, budget, observed,
  component, queryRef?
}
```

### Sequence & Numbering

```typescript
// K-M10 Sequence Governance
SequencePolicy: {
  tenantId, sequenceKey, format, resetPolicy,
  gapPolicy, timezone, fiscalYearStart?
}

SequenceReservation: {
  reservationId, tenantId, sequenceKey, value,
  status, expiresAt
}
```

### Approval & Delegation

```typescript
// K-M11 Approval Matrix
ApprovalRule: {
  ruleId, scopeKey, version, conditions,
  approvers, escalationPath, delegationRules,
  effectiveFrom, effectiveTo?
}

Delegation: {
  delegatorUserId, delegateUserId,
  startsAt, endsAt, scopeKey, reason
}
```

### Batch Operations

```typescript
// K-M13 Batch Framework
BatchOperation: {
  batchId, tenantId, operationType,
  itemCount, status, progress, cursor,
  createdAt, createdBy, resultsRef
}

BatchItem: {
  batchId, itemKey, status, attempts,
  lastErrorRef?, resultRef?
}
```

---

## C) Manifest Contract v1.3

Addons declare capabilities they need via manifest. Kernel validates, enforces, and audits.

### Manifest Schema (Metadata Only)

```typescript
// Conceptual manifest structure (actual implementation in packages/domain)
{
  moduleId: string;
  version: string;

  // K-M4 Keymaster
  keys?: Array<{
    purpose: "einvoice_signing" | "webhook_signing" | "audit_sealing" | "regulator_bundle_signing";
    alias: string;
  }>;

  // K-M5 Scheduler
  jobs?: Array<{
    jobId: string;
    schedule: { type: "cron"; cron: string } | { type: "interval"; seconds: number };
    handlerId: string;
    lockKey: string;
    fairnessClass: string;
    maxAttempts?: number;
    timeoutSeconds?: number;
  }>;

  // K-M6 Traffic Governor
  rateLimits?: Array<{
    routeId: string;
    scope: "tenant" | "tenant_user" | "tenant_ip";
    windowSeconds: number;
    maxRequests: number;
  }>;

  // K-M6 Idempotency
  idempotency?: {
    endpoints: string[];  // routes requiring idempotency
  };

  // K-M7 Telemetry
  telemetryBudgets?: Array<{
    commandClass: string;
    budgetMs: number;
  }>;

  // K-S1 Migrations
  migrations?: Array<{
    migrationId: string;
    checksum: string;
    scope: "global" | "tenant";
    reversible: boolean;
    irreversibleReason?: string;
  }>;

  // K-R1 Contracts
  contracts?: Array<{
    contractId: string;
    version: string;
    kind: "http_route" | "event" | "webhook";
    checksum: string;
    ownerModule: string;
    deprecation?: {
      isDeprecated: boolean;
      since?: string;
      sunsetAt?: string;
      note?: string;
    };
  }>;

  // K-B1 Privacy
  fieldClassifications?: Array<{
    objectType: string;
    fieldPath: string;
    dataClass: "public" | "internal" | "pii" | "sensitive" | "financial";
  }>;
}
```

### Actual Implementation Pattern

```typescript
// packages/api-kernel/src/kernel.ts
export function kernel<TQuery, TBody, TOutput>(
  spec: RouteSpec<TQuery, TBody, TOutput>,
): (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> },
) => Promise<Response> {
  return async (request, routeContext) => {
    const traceId = getActiveTraceId() ?? generateId();
    const requestId = generateId();

    const ctx: RequestContext = {
      traceId,
      requestId,
      routeId: spec.routeId,
      method: spec.method,
    };

    return runWithContext(ctx, async () => {
      try {
        // 1. Set span attributes
        setSpanAttributes({
          'route.id': spec.routeId,
          'http.method': spec.method,
        });

        // 2. Resolve tenant
        const { tenantId } = resolveTenant(request);
        ctx.tenantId = tenantId;
        enforceTenant(tenantId, spec.tenant?.required ?? false);

        // 3. Extract and enforce auth
        const auth = await extractAuth(request);
        ctx.actorId = auth.actorId;
        ctx.roles = auth.roles;
        enforceAuth(auth, spec.auth);

        // 4. Parse and validate inputs
        const rawQuery = parseQuery(request);
        const rawBody = await parseBody(request);
        const query = validateSchema(spec.query, rawQuery, 'query');
        const body = validateSchema(spec.body, rawBody, 'body');

        // 5. Build handler context
        const handlerCtx: HandlerContext = {
          query,
          body,
          params: await routeContext.params,
          ctx,
          tenantId,
          actorId: auth.actorId,
          roles: auth.roles,
          rawRequest: request,
        };

        // 6. Execute handler
        const result = await spec.handler(handlerCtx);

        // 7. Validate output
        const output = spec.output.safeParse(result);
        if (!output.success) {
          throw new KernelError(
            ErrorCode.INTERNAL_ERROR,
            'Response validation failed',
          );
        }

        // 8. Return success envelope
        return ok(output.data, traceId);
      } catch (error) {
        markSpanError(error);
        const kernelError = normalizeError(error);

        captureException(error, {
          traceId: ctx.traceId,
          requestId: ctx.requestId,
          tenantId: ctx.tenantId,
          actorId: ctx.actorId,
          routeId: ctx.routeId,
        });

        return fail(kernelError.code, kernelError.message, traceId, {
          details: kernelError.details,
          fieldErrors: kernelError.fieldErrors,
        });
      }
    });
  };
}
```

Kernel uses manifests to:

- Provision required resources
- Enforce compatibility
- Audit module capabilities
- Gate module enable/disable

---

## D) Evidence (EVI) Certification Matrix

### Top Priority EVIs (Kernel v1.3 Blockers)

**Core Infrastructure (Must Complete First):**

- **EVI041** — Keymaster certified (K-M4) → [KER230](KER230-KEYMASTER-SIGNING-K-M4.md)
- **EVI042** — Scheduler certified (K-M5) → [KER220](KER220-SCHEDULER-HEARTBEAT-K-M5.md)
- **EVI043** — Traffic Governor certified (K-M6) → [KER210](KER210-IDEMPOTENCY-TRAFFIC-GOVERNOR-K-M6.md)
- **EVI044** — Telemetry Propagation certified (K-M7) → [KER260](KER260-TELEMETRY-PROPAGATION-K-M7.md)

**Top 3 Immediate EVIs (Finance-Compliance):**

- **EVI045** — Schema migration certified (K-S1) → [KER280](KER280-SCHEMA-MIGRATION-GOVERNANCE-K-S1.md)
- **EVI047** — Secrets lifecycle certified (K-V1) → [KER240](KER240-SECRETS-CERT-LIFECYCLE-K-V1.md)
- **EVI048** — Audit immutability certified (K-W1) → [KER250](KER250-AUDIT-IMMUTABILITY-WORM-K-W1.md)

**Remaining Painful Gaps (ERP-Ready):**

- **EVI055** — Sequence governance certified (K-M10) → [KER100](KER100-SEQUENCE-GOVERNANCE-K-M10.md)
- **EVI058** — Approval matrix + delegation certified (K-M11) → [KER110](KER110-APPROVAL-MATRIX-K-M11.md)
- **EVI059** — Batch framework certified (K-M13) → [KER120](KER120-BATCH-FRAMEWORK-K-M13.md)

**Privacy & Trust:**

- **EVI023** — Privacy hooks certified (K-B1) → [KER290](KER290-PRIVACY-ENGINE-K-B1.md)
- **EVI028** — Guest links certified (K-B2) → [KER300](KER300-EXTERNAL-AUDITOR-LINKS-K-B2.md)

**Integration & Ecosystem:**

- **EVI027** — Outbox/webhooks certified (K-E1) → [KER310](KER310-EVENTBUS-OUTBOX-WEBHOOKS-K-E1.md)
- **EVI046** — Contract governance certified (K-R1) → [KER270](KER270-CONTRACT-GOVERNANCE-K-R1.md)

**Modern Platform:**

- **EVI024** — OCR/Search certified (K-C2)
- **EVI025** — Hash dedupe certified (K-C1)
- **EVI057** — AI Gateway certified (K-I1) → [KER340](KER340-INTELLIGENCE-GATEWAY-K-I1.md)

**Post-v1.3 (Follow-After):**

- **EVI049** — Tenant lifecycle certified (K-L1)
- **EVI050** — Metering certified (K-BI1)
- **EVI051** — Transactional patterns certified (K-X1)
- **EVI052** — DR and chaos certified (K-DRO1)
- **EVI053** — Supply chain certified (K-SC1)
- **EVI054** — Feature rollout certified (K-FL1)

---

## E) Capability Dependencies (Directed Graph)

```
K-M7 (Telemetry)
  ↓
K-W1 (Audit Immutability) ← depends on K-M4 (Keymaster for sealing)
  ↓
K-M5 (Scheduler) ← depends on K-M7, K-W1
  ↓
K-M10 (Sequences) ← depends on K-M5 (for TTL reclaim)
  ↓
K-M11 (Approval Matrix) ← depends on K-D1 (Workflow state), K-M5 (escalation)
  ↓
K-M13 (Batch Framework) ← depends on K-M5, K-M6 (quotas), K-E1 (outbox)

K-M4 (Keymaster)
  ↓
K-V1 (Secrets) — broader than K-M4
K-E1 (EventBus) ← depends on K-V1 (webhook signing)
K-B2 (Guest Links) ← depends on K-M4 (token signing)

K-B1 (Privacy Engine)
  ↓
K-I1 (AI Gateway) ← depends on K-B1 (redaction)
K-E1 (EventBus) ← optional privacy filtering

K-S1 (Migrations) ← depends on K-W1 (audit trail)
K-R1 (Contracts) ← depends on K-S1 (schema compatibility)
```

**Critical Path for Kernel v1.3 Seal:**

1. K-M7 (Telemetry) + K-M4 (Keymaster)
2. K-W1 (Audit) + K-M5 (Scheduler)
3. K-V1 (Secrets) + K-S1 (Migrations)
4. K-M6 (Traffic) + K-M10 (Sequences)
5. K-M11 (Approvals) + K-M13 (Batch)
6. K-B1 (Privacy) + K-I1 (AI Gateway)
7. K-E1 (EventBus) + K-B2 (Guest Links)
8. K-R1 (Contracts)

---

## F) Kernel v1.3 Ratification Checklist

### Mandatory for "Sealed" Status

**Infrastructure Substrate:**

- [ ] EVI041 Keymaster certified
- [ ] EVI042 Scheduler certified
- [ ] EVI043 Traffic Governor certified
- [ ] EVI044 Telemetry Propagation certified

**Finance-Compliance Substrate:**

- [ ] EVI045 Schema Migration certified
- [ ] EVI047 Secrets Lifecycle certified
- [ ] EVI048 Audit Immutability certified

**ERP-Ready Substrate:**

- [ ] EVI055 Sequence Governance certified
- [ ] EVI058 Approval Matrix certified
- [ ] EVI059 Batch Framework certified

**Trust & Privacy:**

- [ ] EVI023 Privacy Engine certified
- [ ] EVI028 Guest Links certified

**Integration & Modern:**

- [ ] EVI027 Outbox/Webhooks certified
- [ ] EVI046 Contract Governance certified
- [ ] EVI057 AI Gateway certified

**Total Required: 14 EVIs**

### Verification Command

```bash
pnpm -w kernel:certify
```

Expected output:

```
✅ EVI041 Keymaster — PASS (5/5 proofs)
✅ EVI042 Scheduler — PASS (5/5 proofs)
...
✅ Kernel v1.3 — SEALED (14/14 EVIs certified)
```

---

## G) Kernel Guarantee Statement

When Kernel v1.3 is sealed, the platform guarantees:

### Correctness Substrate

- Sequence numbering is concurrency-safe and audit-defensible
- Approval routing is deterministic and bypass-proof
- Bulk operations are resumable and idempotent

### Trust Substrate

- Keys and secrets never leak to domains
- Audit logs are tamper-evident and regulator-exportable
- Privacy redaction is consistent across all disclosure surfaces

### SaaS Substrate

- Tenant fairness: no noisy-neighbor starvation
- Telemetry continuity: every action traceable end-to-end
- Contract stability: breaking changes blocked without versioning

### Modern Substrate

- AI requests are privacy-filtered and budget-controlled
- Search/OCR respects tenant boundaries and data classification

---

## H) Post-Kernel v1.3 Follow-After (Not Blockers)

These features **must follow** after v1.3 seal, as they depend on sealed kernel primitives:

### Domain Foundation Packs

- Chart of Accounts + Posting Engine (GL v0)
- AR/AP document lifecycle
- Inventory movement ledger
- Tax engine + jurisdiction mapping
- Period close + lock dates

**Why After Kernel:**
These become safe only after: Sequence + Approval Matrix + Batch + Migration + Audit immutability exist.

### Ecosystem & Extensibility

- Marketplace v1 (curated)
- Addon manifests + module registry (install/enable/upgrade)
- Connector governance (health checks + credential rotation)
- Webhook catalog + event explorer UI

### Ops & Compliance Hardening

- Tenant onboarding/offboarding + export packages (EVI049)
- Compliance pack loader (Malaysia SST/e-invoice, retention bindings)
- DR + chaos drills (EVI052)
- Supply chain security (SBOM + signed modules) (EVI053)
- Feature flags + safe rollout (EVI054)

### UX/Executive Experience

- Global Search + Cmd+K (powered by OCR/indexing)
- Audit overlay + Chronos Trace UI
- Approval Inbox + Delegation UI
- External Auditor link experience

---

## I) Upgrade Policy & Backward Compatibility

### Kernel Primitive Stability Guarantee

Once a kernel primitive is certified (EVI passed), it MUST remain backward compatible:

**Allowed changes:**

- Add optional fields to schemas
- Add new capabilities
- Relax validation rules safely
- Add deprecation warnings

**Forbidden changes (without major version):**

- Remove/rename fields
- Change types
- Change semantics
- Break existing manifests

### Version Bump Rules

- **Patch (1.3.x):** bug fixes, internal improvements, no API changes
- **Minor (1.x.0):** additive changes, new optional capabilities
- **Major (x.0.0):** breaking changes (requires migration guide + deprecation window)

---

## J) Module Boundaries (Kernel vs Domain)

### Kernel MUST Own

- All primitives listed in this map
- Enforcement of invariants (tenant isolation, audit, idempotency, trace)
- Standard envelopes and contracts
- Platform-wide security boundaries

### Kernel MUST NOT Own

- Business logic (invoice rules, posting rules, tax calculations)
- Domain semantics (what "approve" means in purchasing context)
- UI rendering (beyond API contracts)
- Report content (beyond export bundle primitives)

### Domain MUST Own

- All ERP business rules
- Workflow definitions using kernel workflow runtime
- Field validations beyond kernel contracts
- Domain-specific integrations using kernel connectors

### Domain MUST NOT Own

- Tenant isolation enforcement
- Audit implementation
- Rate limiting logic
- Telemetry propagation

**The Line:** If a capability is needed by 2+ domains **and** getting it wrong causes corruption/security drift/compliance failure → it belongs in Kernel.

---

## K) Kernel Test Matrix (CI Integration)

| Capability       | EVI    | CI Command            | Package Location         | Test File                          |
| ---------------- | ------ | --------------------- | ------------------------ | ---------------------------------- |
| K-M4 Keymaster   | EVI041 | `pnpm -w test:evi041` | `packages/api-kernel`    | `tests/evi041-keymaster.spec.ts`   |
| K-M5 Scheduler   | EVI042 | `pnpm -w test:evi042` | `packages/jobs`          | `tests/evi042-scheduler.spec.ts`   |
| K-M6 Traffic     | EVI043 | `pnpm -w test:evi043` | `packages/api-kernel`    | `tests/evi043-traffic.spec.ts`     |
| K-M7 Telemetry   | EVI044 | `pnpm -w test:evi044` | `packages/observability` | `tests/evi044-telemetry.spec.ts`   |
| K-S1 Migrations  | EVI045 | `pnpm -w test:evi045` | `packages/db`            | `tests/evi045-migrations.spec.ts`  |
| K-R1 Contracts   | EVI046 | `pnpm -w test:evi046` | `packages/validation`    | `tests/evi046-contracts.spec.ts`   |
| K-V1 Secrets     | EVI047 | `pnpm -w test:evi047` | `packages/api-kernel`    | `tests/evi047-secrets.spec.ts`     |
| K-W1 Audit       | EVI048 | `pnpm -w test:evi048` | `packages/observability` | `tests/evi048-audit.spec.ts`       |
| K-M10 Sequences  | EVI055 | `pnpm -w test:evi055` | `packages/api-kernel`    | `tests/evi055-sequences.spec.ts`   |
| K-I1 AI Gateway  | EVI057 | `pnpm -w test:evi057` | `packages/api-kernel`    | `tests/evi057-ai-gateway.spec.ts`  |
| K-M11 Approval   | EVI058 | `pnpm -w test:evi058` | `packages/domain`        | `tests/evi058-approval.spec.ts`    |
| K-M13 Batch      | EVI059 | `pnpm -w test:evi059` | `packages/jobs`          | `tests/evi059-batch.spec.ts`       |
| K-B1 Privacy     | EVI023 | `pnpm -w test:evi023` | `packages/api-kernel`    | `tests/evi023-privacy.spec.ts`     |
| K-B2 Guest Links | EVI028 | `pnpm -w test:evi028` | `packages/api-kernel`    | `tests/evi028-guest-links.spec.ts` |
| K-E1 EventBus    | EVI027 | `pnpm -w test:evi027` | `packages/jobs`          | `tests/evi027-outbox.spec.ts`      |

### Run All EVIs

```bash
# Run all EVI tests
pnpm -w test:evi

# Expected output when sealed:
# ✅ EVI041 Keymaster — PASS (5/5 proofs)
# ✅ EVI042 Scheduler — PASS (5/5 proofs)
# ✅ EVI043 Traffic Governor — PASS (5/5 proofs)
# ...
# ✅ Kernel v1.3 — SEALED (14/14 EVIs certified)
```

### EVI Test Structure Example

```typescript
// packages/api-kernel/tests/evi041-keymaster.spec.ts
import { describe, test, expect } from 'vitest';
import { createKeymaster } from '../src/keymaster';

describe('EVI041 — Keymaster Certified', () => {
  test('[A] Create key alias → metadata only', async () => {
    const keymaster = createKeymaster();

    const result = await keymaster.createKey({
      tenantId: 'test-tenant',
      keyAlias: 'test.signing',
      purpose: 'einvoice_signing',
      algorithm: 'RSA_SHA256',
    });

    // Proof: returns metadata, NOT private key
    expect(result).toHaveProperty('keyAlias');
    expect(result).toHaveProperty('version');
    expect(result).not.toHaveProperty('privateKey');
  });

  test('[B] Sign digest → signature + version returned', async () => {
    // Proof block B implementation
    const signature = await keymaster.sign({
      tenantId: 'test-tenant',
      keyAlias: 'test.signing',
      payloadDigest: 'sha256:abc123...',
      purpose: 'einvoice_signing',
    });

    expect(signature).toHaveProperty('signature');
    expect(signature).toHaveProperty('keyVersion');
    expect(signature).toHaveProperty('signedAt');
  });

  // ... [C], [D], [E] proof blocks
});
```

### Actual Codebase Integration

Current implementation pattern (existing):

```typescript
// packages/api-kernel/src/kernel.ts (ACTUAL IMPLEMENTATION)
export function kernel<TQuery, TBody, TOutput>(
  spec: RouteSpec<TQuery, TBody, TOutput>,
) {
  // This is the ONLY allowed route handler pattern
  // All routes MUST use: export const GET = kernel(spec);
}

// packages/jobs/src/client.ts (ACTUAL IMPLEMENTATION)
export async function runWorker(
  connectionString: string,
  handlers: JobHandlers,
  options?: { concurrency?: number; pollInterval?: number },
): Promise<void> {
  // Graphile Worker integration for K-M5 Scheduler
}

// packages/observability/src/context.ts (ACTUAL IMPLEMENTATION)
export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(ctx, fn);
}

export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

// packages/db/src/client.ts (ACTUAL IMPLEMENTATION)
export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}
```

---

## L) Operational Additions (Implicit Requirements)

These aren't separate EVIs but are folded into existing capabilities:

### Time Sync / Monotonic Clocks

**Required for:** Signed logs, ordering, SLA timers  
**Enforcement:** Kernel detects clock skew and emits violations  
**Covered by:** EVI044 (Telemetry), EVI042 (Scheduler), EVI048 (Audit)

### SLO/SLA Enforcement + Reporting

**Required for:** Tenant-scoped SLOs, breach alerts, audit trails  
**Covered by:** EVI044 (Performance budgets), EVI052 (DR/chaos), EVI042 (Scheduler SLA timers)

---

## M) Summary: What Kernel v1.3 Means

With v1.3 sealed, your platform becomes:

✅ **Finance-compliance capable**  
Gapless numbering + audit immutability + schema governance

✅ **SaaS-ops safe**  
Tenant fairness + quotas + idempotency + scheduler + secrets lifecycle

✅ **Enterprise-grade governance**  
Approval matrix + delegation + contract compatibility + migration safety

✅ **Modern 2025-ready**  
AI gateway with privacy + cost control + telemetry propagation

✅ **Bulk-safe**  
Batch framework prevents corruption from GST/e-invoice submissions

✅ **Integration-ready**  
Transactional outbox + webhook signing + trace continuity

---

**End of KER001 — Kernel Capability Map v1.3**

**Next Documents:**

- [KER000 Kernel Constitution](KER000-KERNEL-CONSTITUTION.md) — Charter, non-goals, invariants
- Individual KER docs for each capability (KER100–KER340)
- Kernel Test Matrix (maps EVIs to CI commands)
