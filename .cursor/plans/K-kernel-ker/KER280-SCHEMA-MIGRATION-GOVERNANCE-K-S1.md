
---

# ✅ 3) `KER280-SCHEMA-MIGRATION-GOVERNANCE-K-S1.md`

```md
# KER-280 — Schema Migration & Versioning Governance (K-S1)
**Status:** Ratification-Ready  
**Layer:** Kernel (Schema & Evolution Plane)  
**Why this exists:** Prevent silent data drift across modules; guarantee deterministic upgrades  
**Primary consumers:** Kernel + Domain addons; Marketplace module upgrades  
**Canon anchor:** CAN003 contract discipline + auditability :contentReference[oaicite:4]{index=4}

---

## 0) Canonical Purpose (Non-Negotiable)

In ERP systems, the most catastrophic failures are “silent schema drift”:
- partial migrations applied
- incompatible schema deployed without contracts
- rollback impossible and not declared
- module upgrades corrupt financial data

Kernel must provide a deterministic migration governance substrate:
- ordered migrations
- transactional apply
- audit trail of what ran
- rollback discipline (or explicit irreversible marker)

---

## 1) Boundary Rules

### Kernel MUST own
- migration manifest format and ordering rules
- dependency graph resolution (per module)
- transactional apply/abort semantics
- migration audit records (traceId linked)
- gating: no module enable unless migrations are applied

### Kernel MUST NOT own
- business meaning of tables/fields
- domain data fix logic beyond migration scripts

Kernel governs execution, not semantics.

---

## 2) Canonical Guarantees

### 2.1 Deterministic ordering
For a given set of installed modules:
- the migration plan order must be deterministic
- based on: `module depends graph + migration ids`

### 2.2 Transactional apply
- migrations within a unit must be applied atomically
- failure MUST rollback the unit
- no partial state allowed

### 2.3 Idempotent apply
- re-running migration plan does not reapply already-applied steps

### 2.4 Rollback discipline
Each migration must declare:
- `reversible: true/false`
If false, must include:
- `irreversible_reason`
and requires explicit operator flag to run.

### 2.5 Audit required
Migration execution must record:
- tenant scope (or global)
- module name/version
- migration id
- checksum/hash of migration
- applied by actor (if present)
- traceId
- result status

---

## 3) Canonical Manifest (Zod SSOT)

```ts
import { z } from "zod";

export const MigrationScope = z.union([
  z.literal("global"),
  z.literal("tenant"),
]);

export const MigrationEntry = z.object({
  moduleId: z.string().min(3).max(120),
  migrationId: z.string().min(1).max(200), // "001_init", "2026-01-20_add_index"
  checksum: z.string().min(16),
  scope: MigrationScope,
  reversible: z.boolean(),
  irreversibleReason: z.string().min(3).max(500).optional(),
});

export const MigrationManifest = z.object({
  moduleId: z.string().min(3).max(120),
  moduleVersion: z.string().min(1).max(80),
  dependsOn: z.array(z.string()).default([]),
  migrations: z.array(MigrationEntry),
});

4) Supporting: Storage Model (Postgres)
4.1 kernel_migration_applied

applied_id uuid pk

module_id text not null

module_version text not null

migration_id text not null

checksum text not null

scope text not null

tenant_id uuid null (null for global)

applied_at timestamptz not null

applied_by uuid null

trace_id text not null

status text not null (SUCCESS|FAIL)

error_ref text null

Unique:

(module_id, migration_id, scope, tenant_id)

4.2 kernel_migration_lock

lock_key text pk (e.g. "migrations:global" or "migrations:tenant:<id>")

locked_by text not null

locked_until timestamptz not null

5) Supporting: Migration Plan Algorithm

Steps:

Load manifests for all enabled modules

Build dependency DAG from dependsOn

Topologically sort modules

Within module, order migrations by migrationId (or explicit ordering list)

Remove migrations already applied (by checksum match)

Present plan (dry-run output)

Apply plan with locks:

global lock for global migrations

tenant-specific lock for tenant migrations

6) Supporting: Drift Traps & Forbidden Patterns

Forbidden:

running migrations manually outside kernel governance

“best effort” migrations without audit

allowing module enable if migrations not applied

changing migration file without changing checksum/version

Required:

checksum mismatch triggers refusal until resolved

migration is immutable artifact once released

7) Evidence (EVI045 — Schema Migration Certified)
Acceptance Criteria

plan is deterministic

apply is transactional (no partial state)

failure rolls back

audit shows what happened

irreversible migrations require explicit flag + reason

Paste Blocks

[A] Plan output shows ordered migrations with checksums

[B] Apply success records applied rows

[C] Induce failure mid-unit → no partial application

[D] Audit trail includes traceId and checksum

[E] Irreversible migration blocked without explicit operator flag; allowed with flag and audited

End of KER-280