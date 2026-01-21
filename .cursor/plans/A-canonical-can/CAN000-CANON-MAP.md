# Documentation Canon Map

**Purpose:** Single source of truth for which docs are authoritative.  
**Rule:** If two docs conflict, the higher-tier doc wins. Fix canon first, then update others.

---

## CANONICAL (Always Follow)

1. `CAN001-CURSOR-INSTRUCTION.md`  
   Hard rules + deliverables. This is the enforcement constitution.

2. `CAN002-FOUNDATION-DONE.md`  
   Stop line / freeze checklist. "Done" only means these boxes are checked.

3. `CAN003-ARCHITECTURE-SPEC-v3.md`  
   Locked stack + standard patterns (must be consistent with `@workspace/*` aliasing).

4. `CAN004-WORKSPACE-BOUNDARIES.md`  
   Enforcement direction (ESLint + drift script) — must match CAN001.

---

## SUPPORTING (Context Only)

- `SUP001-ENFORCEMENT-ARTIFACT.md`  
  Example enforcement patterns (must not introduce conflicting rules).

- `SUP002-ODOO-WORKSPACE.md`  
  Domain addon guidance.

- `SUP003-SCAFFOLD.md`  
  Scaffold reference (implementation starter).

---

## COMPLETED WORK (Evidence Only)

- `EVI001-MIGRATION.md`  
  Evidence log; must not claim "complete" unless command outputs are included and foundation checklist items are truly satisfied.

---

## ARCHIVED (Do Not Use)

- `ARC003-IMPORT-ENFORCEMENT.md`  
  Superseded by `CAN004-WORKSPACE-BOUNDARIES.md`.

---

## Rules for New Docs

1. Every doc must declare one status: **CANONICAL / SUPPORTING / EVIDENCE / ARCHIVED**
2. If contradicts canon → fix canon first, then update downstream docs
3. “Complete” claims require proof (paste real outputs or explicitly mark NOT RUNNABLE)
4. No scope creep beyond canon unless a new canon revision is ratified
