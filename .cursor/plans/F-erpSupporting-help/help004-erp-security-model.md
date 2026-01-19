# help004-erp-security-model.md

**Status:** SUPPORTING (Help)
**Goal:** ERP security that is consistent, enforceable, and compatible with multi-tenancy.

## 0) Baseline rule
Tenant scope is mandatory. Every ERP query must be tenant-scoped.

## 1) Two-layer model (best practice)
ERP security is enforced in two layers:

1) **Action permissions** (RBAC-like) — can the actor perform this action at all?
2) **Row scope** (ABAC/RLS-like) — which rows can they see/modify?

## 2) Action permission naming (fixed)
All permissions follow:

`erp.<module>.<entity>.<action>`

Examples:
- `erp.sales.order.read`
- `erp.sales.order.create`
- `erp.sales.order.submit`
- `erp.sales.order.approve`
- `erp.inventory.move.post`
- `erp.purchase.order.receive`

## 3) Where permissions are checked
Checks happen in **domain services**, not routes and not UI.

Recommended pattern:
- `policy.assert(ctx, 'erp.sales.order.approve', { entityId })`

Rules:
- Routes may call `kernel` auth, but must not implement authorization logic.
- UI may hide buttons, but UI is not a security boundary.

## 4) Row scope (minimal → expandable)
### Minimum required now
- `tenant_id` enforced for all reads/writes.

### Expandable later (recommended roadmap)
- Team scope: `team_id` on documents where teams own work.
- Individual scope: `owner_user_id` for drafts/personal items.
- Shared-with: explicit join tables.

## 5) ERP “roles” (recommended, not mandatory)
Keep roles small and map them to permission bundles:
- `erp.viewer`
- `erp.operator`
- `erp.manager`
- `erp.approver`
- `erp.admin`

## 6) Common policy rules (copyable)
- **DRAFT ownership rule:** only owner can edit draft unless manager.
- **Approval rule:** only approver group can approve; creator cannot approve own request (optional).
- **Posting rule:** only manager/operator can post; posting requires entity is approved.

## 7) Audit linkage
All permission denials should be observable:
- log `permission_denied` with permission name and entity type
- do not leak sensitive row existence

## 8) What NOT to do
- Do not embed permission logic in UI.
- Do not “check role strings” all over; always use `policy`.
- Do not rely on client-submitted `tenant_id`.
