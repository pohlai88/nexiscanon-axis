// apps/web/app/api/erp/base/products/route.ts
// Product collection endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  createProductInput,
  productOutput,
  productListQuery,
  productListOutput,
} from "@workspace/validation/erp/base/product";

/**
 * POST /api/erp/base/products
 * Create a new product
 */
export const POST = kernel({
  method: "POST",
  routeId: "erp.base.products.create",
  tenant: { required: true },
  auth: { mode: "required" },
  body: createProductInput,
  output: productOutput,

  async handler({ tenantId, actorId, body, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const productService = container.get(ERP_BASE_TOKENS.ProductService);
    const db = getDb();

    const product = await productService.create(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      body,
      db
    );

    return product;
  },
});

/**
 * GET /api/erp/base/products
 * List products
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.products.list",
  tenant: { required: true },
  auth: { mode: "required" },
  query: productListQuery,
  output: productListOutput,

  async handler({ tenantId, actorId, query, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const container = await getDomainContainer();
    const productService = container.get(ERP_BASE_TOKENS.ProductService);
    const db = getDb();

    const result = await productService.list(
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
