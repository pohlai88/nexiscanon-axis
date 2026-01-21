# K-kernel-ker Planning Pack (KER Prefix)

**Version:** 1.3 (Ratification-Ready)  
**Status:** Sealed Architecture, Implementation In Progress  
**Purpose:** Complete specification for NexusCanon-AXIS Kernel subsystem

---

## 🎯 Quick Start Navigation

### New to Kernel Architecture?

1. **Start Here:** [KER000 Kernel Constitution](KER000-KERNEL-CONSTITUTION.md)
   - What is the kernel? What is it NOT?
   - The 10 Laws (non-negotiable invariants)
   - Glossary of kernel terms

2. **Then Review:** [KER001 Capability Map v1.3](KER001-KERNEL-CAPABILITY-MAP-v1.3.md)
   - Complete taxonomy of all kernel capabilities
   - Dependencies and relationships
   - EVI certification matrix
   - Ratification checklist (14 EVIs required)

3. **Implementation Guide:** [KER Implementation Crosswalk](KER-IMPLEMENTATION-CROSSWALK.md)
   - Maps KER specs to actual codebase
   - Implementation status tracker
   - Actual code examples
   - Package locations

### Implementing Kernel Features?

Jump directly to the relevant KERxxx document:

**🏗️ Core Infrastructure (Priority 1 — Must Complete First)**

- [KER230 Keymaster / Signing (K-M4)](KER230-KEYMASTER-SIGNING-K-M4.md) → EVI041
- [KER220 Scheduler / Heartbeat (K-M5)](KER220-SCHEDULER-HEARTBEAT-K-M5.md) → EVI042
- [KER210 Traffic Governor / Idempotency (K-M6)](KER210-IDEMPOTENCY-TRAFFIC-GOVERNOR-K-M6.md) → EVI043
- [KER260 Telemetry Propagation (K-M7)](KER260-TELEMETRY-PROPAGATION-K-M7.md) → EVI044

**💰 Finance-Compliance (Priority 2 — Top 3 Immediate)**

- [KER280 Schema Migration (K-S1)](KER280-SCHEMA-MIGRATION-GOVERNANCE-K-S1.md) → EVI045
- [KER240 Secrets Lifecycle (K-V1)](KER240-SECRETS-CERT-LIFECYCLE-K-V1.md) → EVI047
- [KER250 Audit Immutability (K-W1)](KER250-AUDIT-IMMUTABILITY-WORM-K-W1.md) → EVI048

**📊 ERP-Ready (Priority 3 — Remaining Painful Gaps)**

- [KER100 Sequence Governance (K-M10)](KER100-SEQUENCE-GOVERNANCE-K-M10.md) → EVI055
- [KER110 Approval Matrix (K-M11)](KER110-APPROVAL-MATRIX-K-M11.md) → EVI058
- [KER120 Batch Framework (K-M13)](KER120-BATCH-FRAMEWORK-K-M13.md) → EVI059

**🔒 Privacy & Trust (Priority 4)**

- [KER290 Privacy Engine (K-B1)](KER290-PRIVACY-ENGINE-K-B1.md) → EVI023
- [KER300 External Auditor Links (K-B2)](KER300-EXTERNAL-AUDITOR-LINKS-K-B2.md) → EVI028

**🔗 Integration & Modern (Priority 5)**

- [KER310 EventBus / Outbox / Webhooks (K-E1)](KER310-EVENTBUS-OUTBOX-WEBHOOKS-K-E1.md) → EVI027
- [KER270 Contract Governance (K-R1)](KER270-CONTRACT-GOVERNANCE-K-R1.md) → EVI046
- [KER340 Intelligence Gateway / AI Proxy (K-I1)](KER340-INTELLIGENCE-GATEWAY-K-I1.md) → EVI057

---

## 📋 Document Structure

### Foundation Documents (Read First)

| Document                         | Purpose                                   | Audience                |
| -------------------------------- | ----------------------------------------- | ----------------------- |
| **KER000**                       | Constitutional principles, laws, glossary | All developers          |
| **KER001**                       | Complete capability map + dependencies    | Architects, tech leads  |
| **KER-IMPLEMENTATION-CROSSWALK** | Spec-to-code mapping + status tracker     | Implementers, reviewers |

### Implementation Specifications (By Priority)

#### Priority 1: Core Infrastructure

| Doc    | Capability          | EVI    | Status         |
| ------ | ------------------- | ------ | -------------- |
| KER230 | Keymaster (Signing) | EVI041 | 🔴 Not Started |
| KER220 | Scheduler (Jobs)    | EVI042 | 🔴 Not Started |
| KER210 | Traffic Governor    | EVI043 | 🔴 Not Started |
| KER260 | Telemetry           | EVI044 | 🔴 Not Started |

#### Priority 2: Finance-Compliance (Top 3)

| Doc    | Capability         | EVI    | Status         |
| ------ | ------------------ | ------ | -------------- |
| KER280 | Schema Migration   | EVI045 | 🔴 Not Started |
| KER240 | Secrets Lifecycle  | EVI047 | 🔴 Not Started |
| KER250 | Audit Immutability | EVI048 | 🔴 Not Started |

#### Priority 3: ERP-Ready

| Doc    | Capability          | EVI    | Status         |
| ------ | ------------------- | ------ | -------------- |
| KER100 | Sequence Governance | EVI055 | 🔴 Not Started |
| KER110 | Approval Matrix     | EVI058 | 🔴 Not Started |
| KER120 | Batch Framework     | EVI059 | 🔴 Not Started |

#### Priority 4: Privacy & Trust

| Doc    | Capability     | EVI    | Status         |
| ------ | -------------- | ------ | -------------- |
| KER290 | Privacy Engine | EVI023 | 🔴 Not Started |
| KER300 | Guest Links    | EVI028 | 🔴 Not Started |

#### Priority 5: Integration & Modern

| Doc    | Capability          | EVI    | Status         |
| ------ | ------------------- | ------ | -------------- |
| KER310 | EventBus/Webhooks   | EVI027 | 🔴 Not Started |
| KER270 | Contract Governance | EVI046 | 🔴 Not Started |
| KER340 | AI Gateway          | EVI057 | 🔴 Not Started |

**Legend:**

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Implemented
- ✅ Certified (EVI Passed)

---

## 🔍 What Makes a Good Kernel Capability?

Use the **Decision Matrix** from KER000:

| Question                                     | If YES → Kernel | If NO → Domain |
| -------------------------------------------- | --------------- | -------------- |
| Required by 2+ domains?                      | ✅              | ❌             |
| Getting it wrong causes corruption/security? | ✅              | ❌             |
| Requires tenant-wide enforcement?            | ✅              | ❌             |
| Compliance/audit requirement?                | ✅              | ❌             |
| Domain-agnostic logic?                       | ✅              | ❌             |
| Changes business rules frequently?           | ❌              | ✅             |
| Specific to one vertical?                    | ❌              | ✅             |

**Examples:**

- ✅ Kernel: Sequence issuance, approval engine, privacy redaction
- ❌ Domain: Invoice rules, tax calculations, posting validations

---

## 🎓 Kernel Philosophy (The 10 Laws)

From [KER000 Section II](KER000-KERNEL-CONSTITUTION.md#ii-non-negotiable-invariants-the-laws):

1. **No Business Logic Contamination** — Kernel has no domain semantics
2. **Tenant Isolation (Absolute)** — Every primitive enforces boundaries
3. **Audit Linkage (Mandatory)** — Every state change creates audit event
4. **Trace Propagation (Universal)** — TraceID flows edge-to-completion
5. **Idempotency for State Changes** — Safe under retries
6. **Standard Envelopes Only** — Success/error shapes are uniform
7. **Zod is SSOT** — All contracts defined as Zod schemas
8. **Performance Budgets (Mandatory)** — Violations trigger warnings
9. **Fail-Safe Defaults** — Deny-by-default for security/privacy
10. **No Silent Failures** — Critical operations escalate errors

---

## 📦 Package Mapping (Kernel → Codebase)

| Kernel Capability | Package(s)               | Primary Files             |
| ----------------- | ------------------------ | ------------------------- |
| K-M4 Keymaster    | `packages/api-kernel`    | `src/keymaster.ts`        |
| K-M5 Scheduler    | `packages/jobs`          | `src/scheduler.ts`        |
| K-M6 Traffic      | `packages/api-kernel`    | `src/traffic.ts`          |
| K-M7 Telemetry    | `packages/observability` | `src/tracing.ts`          |
| K-S1 Migrations   | `packages/db`            | `drizzle.config.ts`       |
| K-V1 Secrets      | `packages/api-kernel`    | `src/secrets.ts`          |
| K-W1 Audit        | `packages/observability` | `src/audit.ts`            |
| K-M10 Sequences   | `packages/api-kernel`    | `src/sequences.ts`        |
| K-M11 Approvals   | `packages/domain`        | `src/addons/approvals.ts` |
| K-M13 Batch       | `packages/jobs`          | `src/batch.ts`            |
| K-B1 Privacy      | `packages/api-kernel`    | `src/privacy.ts`          |
| K-B2 Guest Links  | `packages/api-kernel`    | `src/guest-links.ts`      |
| K-E1 EventBus     | `packages/jobs`          | `src/outbox.ts`           |
| K-R1 Contracts    | `packages/validation`    | `src/registry.ts`         |
| K-I1 AI Gateway   | `packages/api-kernel`    | `src/ai-gateway.ts`       |

---

## 🧪 Testing & Certification

### EVI Certification Process

Each kernel capability must pass an **EVI (Evidence) certification**:

1. **Write EVI spec** (already in KERxxx docs)
2. **Implement capability** in target package
3. **Write EVI test suite** (`packages/*/tests/eviXXX-*.spec.ts`)
4. **Generate evidence output** (paste blocks)
5. **Verify certification** passes

### Running EVIs

```bash
# Run single EVI
pnpm -w evi041  # Keymaster

# Run all EVIs
pnpm -w kernel:certify

# Expected output when sealed:
# ✅ EVI041 Keymaster — PASS (5/5 proofs)
# ✅ EVI042 Scheduler — PASS (5/5 proofs)
# ...
# ✅ Kernel v1.3 — SEALED (14/14 EVIs certified)
```

### EVI Test Structure

```typescript
// packages/api-kernel/tests/evi041-keymaster.spec.ts
describe('EVI041 — Keymaster Certified', () => {
  test('[A] Create key alias → metadata only', async () => {
    // Proof block A implementation
  });

  test('[B] Sign digest → signature + version returned', async () => {
    // Proof block B implementation
  });

  // ... [C], [D], [E] proof blocks
});
```

---

## 🚀 Kernel v1.3 Seal Criteria

The kernel is **sealed** when all 14 required EVIs pass:

**Core Infrastructure (4 EVIs):**

- [x] EVI041 Keymaster
- [x] EVI042 Scheduler
- [x] EVI043 Traffic Governor
- [x] EVI044 Telemetry

**Top 3 Immediate (3 EVIs):**

- [x] EVI045 Schema Migration
- [x] EVI047 Secrets Lifecycle
- [x] EVI048 Audit Immutability

**ERP-Ready (3 EVIs):**

- [x] EVI055 Sequence Governance
- [x] EVI058 Approval Matrix
- [x] EVI059 Batch Framework

**Privacy & Integration (4 EVIs):**

- [x] EVI023 Privacy Engine
- [x] EVI028 Guest Links
- [x] EVI027 Outbox/Webhooks
- [x] EVI046 Contract Governance

**Modern Platform (1 EVI):**

- [x] EVI057 AI Gateway

**Verification Command:**

```bash
pnpm -w kernel:certify
```

---

## 🔗 Related Documents

### Canon Architecture Documents

- **CAN003** — Architecture Spec v3 (route patterns, anti-drift gates)
- **CAN001** — Domain Driven Design principles
- **CAN002** — Multi-tenant architecture patterns

### Domain Planning Packs (Future)

- `DOM-ERP-GL` — General Ledger (uses K-M10, K-M11)
- `DOM-ERP-AR` — Accounts Receivable (uses K-M10, K-E1)
- `DOM-ERP-INV` — Inventory (uses K-M13, K-C3)

---

## 📝 Amendment & Evolution Process

### Constitution Amendments (Rare)

See [KER000 Section IX](KER000-KERNEL-CONSTITUTION.md#ix-amendment-process)

**When:** Core invariants (Laws 1-10) need changes  
**Process:** Proposal → Impact Analysis → Migration Plan → Approval

### Capability Map Evolution (Common)

See [KER001 Section F](KER001-KERNEL-CAPABILITY-MAP-v1.3.md#f-kernel-v13-ratification-checklist)

**When:** New kernel primitive needed  
**Process:** Boundary Justification → KERxxx Spec → Implementation → EVI Certification

---

## 🎯 Current Focus (2026 Q1)

### Week 1-2: Core Infrastructure

Implement and certify EVI041-044 (Keymaster, Scheduler, Traffic, Telemetry)

### Week 3-4: Top 3 Immediate

Implement and certify EVI045, EVI047, EVI048 (Migration, Secrets, Audit)

### Week 5-6: ERP-Ready

Implement and certify EVI055, EVI058, EVI059 (Sequences, Approvals, Batch)

### Week 7-8: Remaining + Seal

Certify remaining EVIs (Privacy, Integration, AI Gateway) → Kernel v1.3 SEALED

---

## 💡 Key Insights & Decisions

### Why "Kernel" Not "Framework"?

A framework dictates structure. A kernel provides primitives.  
Domains compose primitives; kernel doesn't dictate how.

### Why These 14 EVIs?

These are the minimum to claim:

- Finance-compliance capable (sequences, audit, migrations)
- SaaS-ops safe (tenant fairness, scheduler, telemetry)
- Enterprise governance (approvals, contracts, privacy)
- Modern platform (AI gateway, webhooks, batch safety)

### What Comes After v1.3?

Domain foundation packs (GL, AR/AP, Inventory) safely built on sealed kernel.  
Marketplace ecosystem (addon distribution, compatibility checks).  
Operational hardening (DR drills, chaos testing, supply chain security).

---

## 📞 Questions & Support

### Architecture Questions

Review [KER000 Glossary](KER000-KERNEL-CONSTITUTION.md#iii-kernel-glossary) and [KER001 Capability Map](KER001-KERNEL-CAPABILITY-MAP-v1.3.md)

### Implementation Questions

Check relevant KERxxx document for detailed specifications

### Boundary Questions

Use [Decision Matrix](KER000-KERNEL-CONSTITUTION.md#iv-capability-boundaries-kernel-vs-domain) in KER000

---

**Document Version:** 1.3  
**Last Updated:** 2026-01-20  
**Status:** Sealed Architecture, Ready for Implementation  
**Next Review:** After Kernel v1.3 seal (14/14 EVIs certified)
