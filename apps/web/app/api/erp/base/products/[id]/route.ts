// apps/web/app/api/erp/base/products/[id]/route.ts
// Product item endpoints

import { kernel } from "@workspace/api-kernel";
import { getDomainContainer, getDb } from "@workspace/app-runtime";
import { ERP_BASE_TOKENS } from "@workspace/domain";
import {
  updateProductInput,
  productOutput,
} from "@workspace/validation/erp/base/product";

/**
 * GET /api/erp/base/products/:id
 * Get a product by ID
 */
export const GET = kernel({
  method: "GET",
  routeId: "erp.base.products.get",
  tenant: { required: true },
  auth: { mode: "required" },
  output: productOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Product ID parameter required");
    }

    const container = await getDomainContainer();
    const productService = container.get(ERP_BASE_TOKENS.ProductService);
    const db = getDb();

    const product = await productService.get(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return product;
  },
});

/**
 * PATCH /api/erp/base/products/:id
 * Update a product
 */
export const PATCH = kernel({
  method: "PATCH",
  routeId: "erp.base.products.update",
  tenant: { required: true },
  auth: { mode: "required" },
  body: updateProductInput,
  output: productOutput,

  async handler({ params, body, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Product ID parameter required");
    }

    const container = await getDomainContainer();
    const productService = container.get(ERP_BASE_TOKENS.ProductService);
    const db = getDb();

    const product = await productService.update(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      body,
      db
    );

    return product;
  },
});

/**
 * DELETE /api/erp/base/products/:id
 * Archive a product (soft delete)
 */
export const DELETE = kernel({
  method: "DELETE",
  routeId: "erp.base.products.archive",
  tenant: { required: true },
  auth: { mode: "required" },
  output: productOutput,

  async handler({ params, tenantId, actorId, ctx }) {
    if (!actorId) {
      throw new Error("Actor ID required");
    }

    const id = params?.id as string;
    if (!id) {
      throw new Error("Product ID parameter required");
    }

    const container = await getDomainContainer();
    const productService = container.get(ERP_BASE_TOKENS.ProductService);
    const db = getDb();

    const product = await productService.archive(
      {
        tenantId,
        actorUserId: actorId,
        traceId: ctx.traceId,
      },
      id,
      db
    );

    return product;
  },
});
