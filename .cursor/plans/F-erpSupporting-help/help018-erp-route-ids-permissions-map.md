# ERP Base Route IDs and Permissions Mapping

## Route ID Namespace Convention

**Pattern:** `erp.{module}.{entity}.{action}`

- Module: `base` (foundation), `sales`, `inventory`, etc.
- Entity: `uoms`, `partners`, `products`, `sequences`
- Action: `list`, `get`, `create`, `update`, `archive`

---

## UoM (Unit of Measure) Routes

| HTTP Method | Path | Route ID | Permission Required | Service Method |
|-------------|------|----------|---------------------|----------------|
| GET | `/api/erp/base/uoms` | `erp.base.uoms.list` | `erp.base.uom.read` | `uomService.list(ctx, query, db)` |
| POST | `/api/erp/base/uoms` | `erp.base.uoms.create` | `erp.base.uom.create` | `uomService.create(ctx, input, db)` |
| GET | `/api/erp/base/uoms/:id` | `erp.base.uoms.get` | `erp.base.uom.read` | `uomService.get(ctx, id, db)` |
| PATCH | `/api/erp/base/uoms/:id` | `erp.base.uoms.update` | `erp.base.uom.update` | `uomService.update(ctx, id, input, db)` |
| DELETE | `/api/erp/base/uoms/:id` | `erp.base.uoms.archive` | `erp.base.uom.archive` | `uomService.archive(ctx, id, db)` |

---

## Partner Routes

| HTTP Method | Path | Route ID | Permission Required | Service Method |
|-------------|------|----------|---------------------|----------------|
| GET | `/api/erp/base/partners` | `erp.base.partners.list` | `erp.base.partner.read` | `partnerService.list(ctx, query, db)` |
| POST | `/api/erp/base/partners` | `erp.base.partners.create` | `erp.base.partner.create` | `partnerService.create(ctx, input, db)` |
| GET | `/api/erp/base/partners/:id` | `erp.base.partners.get` | `erp.base.partner.read` | `partnerService.get(ctx, id, db)` |
| PATCH | `/api/erp/base/partners/:id` | `erp.base.partners.update` | `erp.base.partner.update` | `partnerService.update(ctx, id, input, db)` |
| DELETE | `/api/erp/base/partners/:id` | `erp.base.partners.archive` | `erp.base.partner.archive` | `partnerService.archive(ctx, id, db)` |

---

## Product Routes

| HTTP Method | Path | Route ID | Permission Required | Service Method |
|-------------|------|----------|---------------------|----------------|
| GET | `/api/erp/base/products` | `erp.base.products.list` | `erp.base.product.read` | `productService.list(ctx, query, db)` |
| POST | `/api/erp/base/products` | `erp.base.products.create` | `erp.base.product.create` | `productService.create(ctx, input, db)` |
| GET | `/api/erp/base/products/:id` | `erp.base.products.get` | `erp.base.product.read` | `productService.get(ctx, id, db)` |
| PATCH | `/api/erp/base/products/:id` | `erp.base.products.update` | `erp.base.product.update` | `productService.update(ctx, id, input, db)` |
| DELETE | `/api/erp/base/products/:id` | `erp.base.products.archive` | `erp.base.product.archive` | `productService.archive(ctx, id, db)` |

---

## Sequence Routes (Admin Only - Future)

| HTTP Method | Path | Route ID | Permission Required | Service Method |
|-------------|------|----------|---------------------|----------------|
| GET | `/api/erp/base/sequences` | `erp.base.sequences.list` | `erp.base.sequence.admin` | `sequenceService.list(ctx, query, db)` |
| POST | `/api/erp/base/sequences` | `erp.base.sequences.create` | `erp.base.sequence.admin` | `sequenceService.create(ctx, input, db)` |
| GET | `/api/erp/base/sequences/:id` | `erp.base.sequences.get` | `erp.base.sequence.admin` | `sequenceService.get(ctx, id, db)` |
| PATCH | `/api/erp/base/sequences/:id` | `erp.base.sequences.update` | `erp.base.sequence.admin` | `sequenceService.update(ctx, id, input, db)` |

**Note:** Sequences are admin-only. No public archive endpoint (delete config dangerous).

---

## Permission String Conventions

### Format: `erp.{module}.{entity}.{action}`

**Actions:**
- `read` - View/list/get
- `create` - Create new entities
- `update` - Modify existing entities
- `archive` - Soft delete (set `isActive=false`)
- `admin` - Full administrative access (sequences, settings)

### Permission Hierarchy (Future RBAC)

```
erp.base.uom.admin
├─ erp.base.uom.create
├─ erp.base.uom.update
├─ erp.base.uom.archive
└─ erp.base.uom.read

erp.base.partner.admin
├─ erp.base.partner.create
├─ erp.base.partner.update
├─ erp.base.partner.archive
└─ erp.base.partner.read

erp.base.product.admin
├─ erp.base.product.create
├─ erp.base.product.update
├─ erp.base.product.archive
└─ erp.base.product.read
```

---

## Route ID Invariants (Prevent Drift)

1. **Namespace prefix:** Always `erp.{module}`
2. **Entity plural in routeId:** `uoms`, `partners`, `products` (matches URL)
3. **Permission singular:** `uom`, `partner`, `product` (logical entity name)
4. **Action matches HTTP semantic:**
   - `list` for collection GET
   - `get` for item GET
   - `create` for POST
   - `update` for PATCH
   - `archive` for DELETE (soft delete only)

---

## Future Module Extensions (Example)

When adding `erp.sales.orders`:

| HTTP Method | Path | Route ID | Permission | Service Method |
|-------------|------|----------|------------|----------------|
| GET | `/api/erp/sales/orders` | `erp.sales.orders.list` | `erp.sales.order.read` | `orderService.list(...)` |
| POST | `/api/erp/sales/orders` | `erp.sales.orders.create` | `erp.sales.order.create` | `orderService.create(...)` |
| POST | `/api/erp/sales/orders/:id/confirm` | `erp.sales.orders.confirm` | `erp.sales.order.confirm` | `orderService.confirm(...)` |

**Workflow actions** (like `confirm`, `approve`, `ship`) get their own routeId and permission.

---

## Guardrail: Route ID Validation

Add to `check:erp` gate (future):

```typescript
function checkRouteIds(file: string, content: string): Finding[] {
  const routeIdMatch = content.match(/routeId:\s*["']([^"']+)["']/);
  if (!routeIdMatch) return [];

  const routeId = routeIdMatch[1];
  const parts = routeId.split(".");

  // Must be erp.{module}.{entity}.{action}
  if (parts[0] !== "erp" || parts.length !== 4) {
    return [{
      module: "route-id-check",
      problem: `Invalid routeId format: ${routeId}`,
      hint: "Must follow pattern: erp.{module}.{entity}.{action}",
    }];
  }

  return [];
}
```

---

## Kernel Auth Config (Current vs Future)

**Phase 1.4 (Current):**
```typescript
auth: { mode: "required" }
```

**Phase 1.5+ (With Permissions):**
```typescript
auth: { 
  mode: "required",
  roles: ["erp.base.uom.create"] // Map from permission table above
}
```

Kernel will enforce this when you wire permission checking.

---

## Summary

**6 Route Files, 15 HTTP Methods** (Phase 1.4):
- UoM: 2 files (collection + item) = 5 methods
- Partner: 2 files (collection + item) = 5 methods
- Product: 2 files (collection + item) = 5 methods

**Route IDs are deterministic:**
- Namespace prevents collision with other modules
- Action names match HTTP semantics
- Permission strings are stable for RBAC

**This mapping document prevents:**
- Route ID drift across modules
- Permission string inconsistency
- Action naming confusion
- Future refactoring pain
