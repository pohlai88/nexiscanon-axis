# ERP Base Route Templates

## Template 1: Collection Routes (POST + GET list)

**Pattern**: `apps/web/app/api/erp/base/{entity}/route.ts`

```typescript
// POST /api/erp/base/uoms - Create UoM
// GET /api/erp/base/uoms - List UoMs

import { kernel } from "@workspace/api-kernel";
import {
  createUomInput,
  uomOutput,
  uomListQuery,
  uomListOutput,
} from "@workspace/validation/erp/base/uom";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import { getDomainContainer } from "@workspace/app-runtime";
import { getDb } from "@workspace/app-runtime/db";

/**
 * POST /api/erp/base/uoms
 * Create a new unit of measure
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.base.uoms.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: createUomInput,
  output: uomOutput,

  async handler({ tenantId, actorId, ctx, body }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.create(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      body,
      db
    );

    return uom;
  },
});

/**
 * GET /api/erp/base/uoms
 * List units of measure
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.uoms.list",
  tenant: { required: true },
  auth: { mode: "required" },
  query: uomListQuery,
  output: uomListOutput,

  async handler({ tenantId, actorId, ctx, query }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const result = await uomService.list(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      query,
      db
    );

    return result;
  },
});
```

---

## Template 2: Item Routes (GET by id + PATCH + archive)

**Pattern**: `apps/web/app/api/erp/base/{entity}/[id]/route.ts`

```typescript
// GET /api/erp/base/uoms/:id - Get UoM by ID
// PATCH /api/erp/base/uoms/:id - Update UoM
// POST /api/erp/base/uoms/:id/archive - Archive UoM (or use DELETE)

import { kernel } from "@workspace/api-kernel";
import { z } from "zod";
import {
  updateUomInput,
  uomOutput,
} from "@workspace/validation/erp/base/uom";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import { getDomainContainer } from "@workspace/app-runtime";
import { getDb } from "@workspace/app-runtime/db";

/**
 * GET /api/erp/base/uoms/:id
 * Get a unit of measure by ID
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.uoms.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: uomOutput,

  async handler({ tenantId, actorId, ctx, params }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = String(params.id);

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.get(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return uom;
  },
});

/**
 * PATCH /api/erp/base/uoms/:id
 * Update a unit of measure
 */
export const PATCH = kernel({
  method: "PATCH",
  routeId: "erp.base.uoms.update",
  tenant: { required: true },
  auth: { mode: "required" },
  body: updateUomInput,
  output: uomOutput,

  async handler({ tenantId, actorId, ctx, params, body }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = String(params.id);

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.update(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      body,
      db
    );

    return uom;
  },
});

/**
 * DELETE /api/erp/base/uoms/:id
 * Archive a unit of measure (soft delete)
 */
export const DELETE = kernel({
  method: "DELETE",
  routeId: "erp.base.uoms.archive",
  tenant: { required: true },
  auth: { mode: "required" },
  output: uomOutput,

  async handler({ tenantId, actorId, ctx, params }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = String(params.id);

    const container = await getDomainContainer();
    const uomService = container.get(ERP_BASE_TOKENS.UomService);
    const db = getDb();

    const uom = await uomService.archive(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return uom;
  },
});
```

---

## How to Use These Templates

### For UoMs (already shown above)
1. Create `apps/web/app/api/erp/base/uoms/route.ts` (Template 1)
2. Create `apps/web/app/api/erp/base/uoms/[id]/route.ts` (Template 2)

### For Partners
1. Create `apps/web/app/api/erp/base/partners/route.ts`
2. Create `apps/web/app/api/erp/base/partners/[id]/route.ts`
3. Replace:
   - `uom` → `partner`
   - `UomService` → `PartnerService`
   - Import from `@workspace/validation/erp/base/partner`

### For Products
1. Create `apps/web/app/api/erp/base/products/route.ts`
2. Create `apps/web/app/api/erp/base/products/[id]/route.ts`
3. Replace:
   - `uom` → `product`
   - `UomService` → `ProductService`
   - Import from `@workspace/validation/erp/base/product`

---

## Route Gate (Optional but Recommended)

Add to `scripts/check-erp.ts`:

```typescript
// ---- Check F: ERP Routes Must Use Services, Not DB ----
function checkErpRoutes(): Finding[] {
  const findings: Finding[] = [];
  const apiPath = path.join(ROOT, "apps/web/app/api/erp");

  if (!exists(apiPath)) return findings;

  const routeFiles = walkFiles(apiPath, "route.ts");

  for (const file of routeFiles) {
    const content = read(file);
    const relativePath = path.relative(ROOT, file);

    // Route must import from @workspace/domain
    if (!content.includes("@workspace/domain")) {
      findings.push({
        module: "route-check",
        problem: `ERP route missing domain import: ${relativePath}`,
        hint: "ERP routes MUST import services from @workspace/domain",
      });
    }

    // Route must NOT import from @workspace/db
    if (content.includes("@workspace/db") && !content.includes("getDb()")) {
      findings.push({
        module: "route-check",
        problem: `ERP route imports DB directly: ${relativePath}`,
        hint: "ERP routes MUST NOT import db schemas, only call services",
      });
    }

    // Route must use kernel()
    if (!content.includes("kernel(")) {
      findings.push({
        module: "route-check",
        problem: `ERP route not using kernel(): ${relativePath}`,
        hint: "ALL ERP routes must use kernel() wrapper",
      });
    }
  }

  return findings;
}
```

---

## Error Handling (Built-in)

The kernel automatically:
- ✅ Validates input via Zod (returns 400 with field errors)
- ✅ Validates output via Zod (returns 500 if service returns wrong shape)
- ✅ Catches `ErpDomainError` and returns appropriate HTTP status
- ✅ Logs all errors once (no duplicate logs)
- ✅ Captures exceptions to GlitchTip

**Service errors are already domain-coded** (e.g., `ERP_UOM_NOT_FOUND`), and kernel's `normalizeError()` maps them to HTTP status codes automatically.

---

## What You Need to Add to `@workspace/app-runtime`

Based on the template, you need:

```typescript
// packages/app-runtime/src/db.ts
import { getDb as getDbFromEnv } from "@workspace/db";

export function getDb() {
  return getDbFromEnv();
}
```

If you don't have this yet, let me know and I'll help wire it.
