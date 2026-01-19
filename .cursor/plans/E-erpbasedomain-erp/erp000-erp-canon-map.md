# ERP Documentation Canon Map (ERP Domain Lane)

**Status:** CANONICAL (ERP Lane)  
**Purpose:** Single source of truth for ERP-domain governance docs ONLY.  
**Non-negotiable:** This ERP canon MUST NOT modify, override, or contaminate Platform/Foundation canon.

---

## 0) Conflict Rule (Critical)

If two docs conflict:

1) **Platform/Foundation Canon wins** (CAN001–CAN004).  
2) Then **ERP Canon** (ERP001–ERP004).  
3) Then SUPPORTING ERP docs.

**Fix order:** Fix Platform canon first (if needed) → then fix ERP canon → then update supporting docs.

---

## 1) UPSTREAM CANON (Read-Only Dependencies)

These are authoritative and must be obeyed by ERP work:

- `CAN001-CURSOR-INSTRUCTION.md` — kernel(spec) anti-drift constitution
- `CAN002-FOUNDATION-DONE.md` — platform freeze checklist / strictness budget
- `CAN003-ARCHITECTURE-SPEC-v3.md` — locked stack + envelope + validation doctrine
- `CAN004-WORKSPACE-BOUNDARIES.md` — enforced import boundaries + drift gates

ERP docs may **reference** these, but may not contradict them.

---

## 2) ERP CANONICAL (Always Follow)

1. `erp001-erp-cursor-instruction.md`
   Hard ERP rules + deliverables for Cursor. Enforcement-grade.

2. `erp002-erp-foundation-done.md`
   ERP freeze checklist. When ERP-base is frozen, only add modules, not patterns.

3. `epr003-erp-architectuctre-spec.md`
   ERP domain architecture (module model, workflows, tenant discipline, audit).

4. `erp004-erp-workspace-boundaries.md`
   ERP-only boundaries: allowed imports, dependency directions, forbidden coupling.

---

## 3) ERP SUPPORTING (Context Only)

Located in: `F-erpSupporting-help/`

See `help000-erpSupporting-map.md` for full index.

### Core Standards
- `help001-erp-module-standard.md` — module anatomy + naming
- `help002-erp-doctype-contract.md` — document pattern
- `help003-erp-workflow-law.md` — transitions + idempotency

### Security & Audit
- `help004-erp-security-model.md` — permissions + scopes
- `help005-erp-audit-chronos.md` — audit envelopes
- `help013-erp-audit-table-spec.md` — concrete audit table schema

### Data Layer (PostgreSQL-Sourced)
- `help007-erp-migrations-and-seeds.md` — DB discipline
- `help010-erp-postgres-discipline.md` — PostgreSQL best practices
- `help011-erp-base-schema-draft.md` — concrete erp.base schema
- `help012-erp-money-currency.md` — money/currency handling

### Quality & Testing
- `help006-erp-testing-invariants.md` — test strategy
- `help008-erp-quality-gate-check-erp.md` — check:erp spec

### Roadmap & Reference
- `help014-erp-module-roadmap.md` — **complete module catalog + implementation sequence**
- `help009-odoo-patterns-to-axis.md` — Odoo translation table

**Rule:** Supporting docs must not introduce new laws. They provide implementation guidance only.

---

## 4) ERP EVIDENCE (Proof Only)

- `EVI-ERP-*.md` — command outputs, migration proofs, test logs, screenshots

**Rule:** Evidence must not claim "complete" without proof outputs.

---

## 5) ERP ARCHIVED (Do Not Use)

- `ARC-ERP-*.md` — superseded docs

---

## 6) Rules for New ERP Docs

1. Every ERP doc declares one status: **CANONICAL / SUPPORTING / EVIDENCE / ARCHIVED**
2. ERP canon must never expand platform scope (no new infra/tools)
3. “Complete” claims require proof outputs or must be marked **NOT PROVEN**
4. Anything affecting route handler style, kernel pipeline, or core tooling is **Platform**, not ERP

