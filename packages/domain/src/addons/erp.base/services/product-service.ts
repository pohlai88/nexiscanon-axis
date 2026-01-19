// packages/domain/src/addons/erp.base/services/product-service.ts
// Product Service - Goods/Services management
//
// Uses atomic CTE writes for guaranteed audit durability

import { eq, and, like, desc, asc, sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { erpProducts, erpUoms } from "@workspace/db";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductOutput,
  ProductListOutput,
  ProductListQuery,
} from "@workspace/validation/erp/base/product";
import { token } from "../../../container";
import type { ServiceContext } from "../types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../types";
import { atomicInsertWithAudit, atomicUpdateWithAudit } from "../helpers/atomic-audit";
import type { SequenceService } from "./sequence-service";

// ---- Service Interface ----

export interface ProductService {
  create(ctx: ServiceContext, input: CreateProductInput, db: Database): Promise<ProductOutput>;
  update(ctx: ServiceContext, id: string, input: UpdateProductInput, db: Database): Promise<ProductOutput>;
  get(ctx: ServiceContext, id: string, db: Database): Promise<ProductOutput>;
  list(ctx: ServiceContext, query: ProductListQuery, db: Database): Promise<ProductListOutput>;
  archive(ctx: ServiceContext, id: string, db: Database): Promise<ProductOutput>;
}

// ---- Implementation ----

export class ProductServiceImpl implements ProductService {
  constructor(private sequenceService: SequenceService) {}

  async create(ctx: ServiceContext, input: CreateProductInput, db: Database): Promise<ProductOutput> {
    // Validate UoM exists in same tenant
    if (input.defaultUomId) {
      await this.validateUom(ctx, input.defaultUomId, db);
    }

    // Generate SKU if not provided (v1: require explicit SKU to avoid collision complexity)
    const sku = input.sku;
    if (!sku) {
      throw new DomainError(
        ERP_ERROR_CODES.PRODUCT_SKU_GENERATION_FAILED,
        "SKU is required. Auto-generation not yet implemented.",
        {}
      );
    }

    try {
      const row = await atomicInsertWithAudit(db, {
        table: "erp_products",
        values: {
          tenant_id: ctx.tenantId,
          sku,
          name: input.name,
          description: input.description,
          product_type: input.productType,
          category: input.category,
          default_sale_price_cents: input.defaultSalePriceCents,
          default_purchase_price_cents: input.defaultPurchasePriceCents,
          currency_code: input.currencyCode,
          default_uom_id: input.defaultUomId,
          is_stockable: input.isStockable,
          track_inventory: input.trackInventory,
          is_active: input.isActive ?? true,
          is_sellable: input.isSellable,
          is_purchasable: input.isPurchasable,
          internal_notes: input.internalNotes,
        },
        entityType: "erp.base.product",
        eventType: "erp.base.product.created",
        ctx,
      });

      return this.toOutput(row);
    } catch (error: any) {
      if (error.code === "23505") {
        throw new DomainError(
          ERP_ERROR_CODES.PRODUCT_SKU_TAKEN,
          `Product SKU "${sku}" already exists`,
          { sku }
        );
      }
      if (error.code === "23503") {
        // Foreign key violation
        throw new DomainError(
          ERP_ERROR_CODES.INVALID_UOM_REFERENCE,
          `Invalid UoM reference: ${input.defaultUomId}`,
          { uomId: input.defaultUomId }
        );
      }
      throw error;
    }
  }

  async update(
    ctx: ServiceContext,
    id: string,
    input: UpdateProductInput,
    db: Database
  ): Promise<ProductOutput> {
    // Validate UoM if changed
    if (input.defaultUomId) {
      await this.validateUom(ctx, input.defaultUomId, db);
    }

    const set: Record<string, any> = {};
    if (input.name !== undefined) set.name = input.name;
    if (input.description !== undefined) set.description = input.description;
    if (input.productType !== undefined) set.product_type = input.productType;
    if (input.category !== undefined) set.category = input.category;
    if (input.defaultUomId !== undefined) set.default_uom_id = input.defaultUomId;
    if (input.isStockable !== undefined) set.is_stockable = input.isStockable;
    if (input.trackInventory !== undefined) set.track_inventory = input.trackInventory;
    if (input.defaultSalePriceCents !== undefined)
      set.default_sale_price_cents = input.defaultSalePriceCents;
    if (input.defaultPurchasePriceCents !== undefined)
      set.default_purchase_price_cents = input.defaultPurchasePriceCents;
    if (input.currencyCode !== undefined) set.currency_code = input.currencyCode;
    if (input.isSellable !== undefined) set.is_sellable = input.isSellable;
    if (input.isPurchasable !== undefined) set.is_purchasable = input.isPurchasable;
    if (input.internalNotes !== undefined) set.internal_notes = input.internalNotes;
    if (input.isActive !== undefined) set.is_active = input.isActive;

    if (Object.keys(set).length === 0) {
      return this.get(ctx, id, db);
    }

    const row = await atomicUpdateWithAudit(db, {
      table: "erp_products",
      set,
      where: {
        id,
        tenant_id: ctx.tenantId,
      },
      entityType: "erp.base.product",
      eventType: "erp.base.product.updated",
      ctx,
      payload: { changes: input },
    });

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.PRODUCT_NOT_FOUND, `Product not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  async get(ctx: ServiceContext, id: string, db: Database): Promise<ProductOutput> {
    const [row] = await db
      .select()
      .from(erpProducts)
      .where(and(eq(erpProducts.id, id), eq(erpProducts.tenantId, ctx.tenantId)))
      .limit(1);

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.PRODUCT_NOT_FOUND, `Product not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  async list(ctx: ServiceContext, query: ProductListQuery, db: Database): Promise<ProductListOutput> {
    const conditions = [eq(erpProducts.tenantId, ctx.tenantId)];

    if (query.productType) {
      conditions.push(eq(erpProducts.productType, query.productType));
    }

    if (query.isActive !== undefined) {
      conditions.push(eq(erpProducts.isActive, query.isActive));
    }

    if (query.q) {
      // Search in name, SKU
      conditions.push(
        sql`(${erpProducts.name} ILIKE ${"%" + query.q + "%"} OR ${erpProducts.sku} ILIKE ${"%" + query.q + "%"})`
      );
    }

    if (query.cursor) {
      conditions.push(eq(erpProducts.id, query.cursor));
    }

    const orderDir = query.orderDir === "asc" ? asc : desc;
    const orderCol =
      query.orderBy === "sku"
        ? erpProducts.sku
        : query.orderBy === "name"
          ? erpProducts.name
          : erpProducts.createdAt;

    const rows = await db
      .select()
      .from(erpProducts)
      .where(and(...conditions))
      .orderBy(orderDir(orderCol))
      .limit(query.limit + 1);

    const hasMore = rows.length > query.limit;
    const items = rows.slice(0, query.limit).map((row) => this.toOutput(row));
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
    };
  }

  async archive(ctx: ServiceContext, id: string, db: Database): Promise<ProductOutput> {
    const row = await atomicUpdateWithAudit(db, {
      table: "erp_products",
      set: { is_active: false },
      where: {
        id,
        tenant_id: ctx.tenantId,
      },
      entityType: "erp.base.product",
      eventType: "erp.base.product.archived",
      ctx,
    });

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.PRODUCT_NOT_FOUND, `Product not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  // ---- Private Helpers ----

  private async validateUom(ctx: ServiceContext, uomId: string, db: Database): Promise<void> {
    const [uom] = await db
      .select({ id: erpUoms.id })
      .from(erpUoms)
      .where(and(eq(erpUoms.id, uomId), eq(erpUoms.tenantId, ctx.tenantId)))
      .limit(1);

    if (!uom) {
      throw new DomainError(
        ERP_ERROR_CODES.INVALID_UOM_REFERENCE,
        `UoM not found or not in same tenant: ${uomId}`,
        { uomId }
      );
    }
  }

  private toOutput(row: typeof erpProducts.$inferSelect | any): ProductOutput {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      sku: row.sku,
      name: row.name,
      description: row.description,
      productType: row.product_type ?? row.productType,
      category: row.category,
      defaultUomId: row.default_uom_id ?? row.defaultUomId,
      isStockable: row.is_stockable ?? row.isStockable,
      trackInventory: row.track_inventory ?? row.trackInventory,
      defaultSalePriceCents: String(row.default_sale_price_cents ?? row.defaultSalePriceCents ?? 0),
      defaultPurchasePriceCents: String(
        row.default_purchase_price_cents ?? row.defaultPurchasePriceCents ?? 0
      ),
      currencyCode: row.currency_code ?? row.currencyCode,
      isSellable: row.is_sellable ?? row.isSellable,
      isPurchasable: row.is_purchasable ?? row.isPurchasable,
      internalNotes: row.internal_notes ?? row.internalNotes,
      isActive: row.is_active ?? row.isActive,
      createdAt: (row.created_at ?? row.createdAt).toISOString(),
      updatedAt: (row.updated_at ?? row.updatedAt).toISOString(),
      createdBy: row.created_by ?? row.createdBy,
      updatedBy: row.updated_by ?? row.updatedBy,
      version: row.version,
    };
  }
}

// ---- Token ----

export const PRODUCT_SERVICE = token<ProductService>("erp.base.ProductService");
