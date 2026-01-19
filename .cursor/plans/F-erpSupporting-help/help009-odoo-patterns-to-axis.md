# help009-odoo-patterns-to-axis.md

**Status:** SUPPORTING (Help)
**Goal:** Use Odoo as a reference without importing its legacy complexity.

## 0) How to read Odoo (best practice)
Treat Odoo as:
- a catalog of domain models
- a catalog of workflows
- a catalog of security patterns

Do NOT treat Odoo as a frontend stack to copy.

## 1) Translation table: Odoo → AXIS
| Odoo concept | Why it matters | AXIS implementation |
|---|---|---|
| Module / addon | Extension without touching core | `packages/domain/src/addons/erp.<module>/manifest.ts` |
| `__manifest__` | Explicit dependencies & metadata | `manifest.ts` (id, version, dependsOn, register) |
| `ir.model.access.csv` (ACL) | Model-level permissions | `permissions.ts` + policy bundles |
| Record rules | Row-level security | tenant baseline; later team/owner ABAC/RLS |
| Documents with sequences | Human-readable doc numbers | Sequence service → `doc_no` |
| `state` field + workflows | Consistent lifecycle | `workflow.ts` transition table + commands |
| Stock moves | Inventory truth comes from moves | `erp.inventory` with `stock_move` + on-hand derived |
| Posting accounting entries | Side effects happen on posting | POST transition creates derived ledgers (later) |

## 2) Odoo “good to copy”
- strict module boundary: core vs addons
- consistent document patterns across modules
- inventory based on moves, not manual “onhand edits”

## 3) Odoo “do not copy”
- implicit magic inheritance patterns that hide data flow
- UI inheritance complexity (XML view inheritance)
- the sheer breadth of edge cases before your v1

## 4) Practical extraction strategy
Pick 3 reference modules in Odoo and only extract:
- tables/entities
- statuses + transition verbs
- permissions grouping
Then translate into AXIS module skeleton (help001 + help002 + help003 + help004).
