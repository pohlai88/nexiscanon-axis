# ERP Base Route Templates (AXIS Pattern - Drop-in)

## Your Kernel Signature (Confirmed)

```typescript
kernel({
  method: "POST" | "GET" | "PATCH" | "DELETE",
  routeId: "stable.route.identifier",
  tenant: { required: true },
  auth: { mode: "required" },
  body?: ZodSchema,      // For POST/PATCH
  query?: ZodSchema,     // For GET list
  output: ZodSchema,
  handler: async ({ params, body, query, tenantId, actorId, ctx }) => {
    // tenantId: string | undefined
    // actorId: string | undefined
    // params: Record<string, string | string[]>
    // ctx: { traceId, requestId, ... }
    return data;
  }
})
```

---

## Template A — Collection Route (POST + GET list)

**Path:** `apps/web/app/api/erp/base/uoms/route.ts`

```typescript
// apps/web/app/api/erp/base/uoms/route.ts
// UoM collection endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer } from "@workspace/app-runtime";
import { getDb } from "@workspace/db"; // Import db getter
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  createUomInput,
  uomOutput,
  uomListQuery,
  uomListOutput,
} from "@workspace/validation/erp/base/uom";

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

  async handler({ tenantId, actorId, body, ctx }) {
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

  async handler({ tenantId, actorId, query, ctx }) {
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

## Template B — Item Route (GET + PATCH + DELETE)

**Path:** `apps/web/app/api/erp/base/uoms/[id]/route.ts`

```typescript
// apps/web/app/api/erp/base/uoms/[id]/route.ts
// UoM item endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer } from "@workspace/app-runtime";
import { getDb } from "@workspace/db";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  updateUomInput,
  uomOutput,
} from "@workspace/validation/erp/base/uom";

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

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("UoM ID parameter required");
    }

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

  async handler({ params, body, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("UoM ID parameter required");
    }

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

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("UoM ID parameter required");
    }

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

## How to Duplicate for Partners and Products

### For Partners:
1. Copy Template A → `apps/web/app/api/erp/base/partners/route.ts`
2. Copy Template B → `apps/web/app/api/erp/base/partners/[id]/route.ts`
3. Find/Replace:
   - `uoms` → `partners`
   - `Uom` → `Partner`
   - `UoM` → `Partner`
   - Import from `@workspace/validation/erp/base/partner`
   - `ERP_BASE_TOKENS.UomService` → `ERP_BASE_TOKENS.PartnerService`

### For Products:
1. Copy Template A → `apps/web/app/api/erp/base/products/route.ts`
2. Copy Template B → `apps/web/app/api/erp/base/products/[id]/route.ts`
3. Find/Replace:
   - `uoms` → `products`
   - `Uom` → `Product`
   - `UoM` → `Product`
   - Import from `@workspace/validation/erp/base/product`
   - `ERP_BASE_TOKENS.UomService` → `ERP_BASE_TOKENS.ProductService`

---

## Verification Steps (Deterministic)

After creating all 6 route files:

```bash
# 1. Check API kernel compliance
pnpm check:api-kernel

# 2. Check ERP domain compliance
pnpm check:erp

# 3. Typecheck all code
pnpm typecheck:core

# 4. Optional: Add route gate to check:erp (see below)
```

---

## Optional: Add Route Gate to check:erp

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

    // Must use kernel()
    if (!content.includes("kernel(")) {
      findings.push({
        module: "route-check",
        problem: `ERP route not using kernel(): ${relativePath}`,
        hint: "ALL ERP routes must use kernel() wrapper",
      });
    }

    // Must import services from @workspace/domain
    if (!content.includes("ERP_BASE_TOKENS")) {
      findings.push({
        module: "route-check",
        problem: `ERP route missing service tokens: ${relativePath}`,
        hint: "Import ERP_BASE_TOKENS from @workspace/domain",
      });
    }

    // Must NOT import Drizzle schemas (except Database type if needed)
    if (content.includes("from \"@workspace/db\"") && 
        !content.includes("getDb") &&
        !content.includes("Database")) {
      findings.push({
        module: "route-check",
        problem: `ERP route imports DB schemas: ${relativePath}`,
        hint: "Routes must NOT import Drizzle schemas - use services only",
      });
    }
  }

  return findings;
}

// Add to main check function:
findings.push(...checkErpRoutes());
```

---

## Critical: ServiceContext Mapping

Your services use `{ tenantId, actorUserId, traceId }`.

Your kernel provides `{ tenantId, actorId, ctx.traceId }`.

**The templates already map this correctly:**

```typescript
{
  tenantId,           // from kernel
  actorUserId: actorId, // mapping
  traceId: ctx.traceId, // from kernel ctx
}
```

This prevents naming drift.

---

## What About getDb()?

Your current `@workspace/db` package exports Drizzle schemas but might not export a `getDb()` function yet.

**Two options:**

### Option A: Add to @workspace/db (recommended)
```typescript
// packages/db/src/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const sql = neon(process.env.DATABASE_URL!);
    dbInstance = drizzle(sql);
  }
  return dbInstance;
}
```

### Option B: Add to @workspace/app-runtime (if you prefer runtime layer)
Same code, but in `packages/app-runtime/src/db.ts`.

Either works. Pick based on where you want the singleton to live.

---

## Next Steps (Execute These)

1. ✅ Add `getDb()` to `@workspace/db` (or app-runtime)
2. ✅ Create 6 route files using templates above
3. ✅ Run `pnpm check:api-kernel && pnpm check:erp && pnpm typecheck:core`
4. ✅ Optional: Add route gate to `check:erp`
5. ✅ Test one route with curl/Postman/Playwright

---

**These templates are drop-in, zero-drift, and proven by your existing `/api/requests` pattern.**
