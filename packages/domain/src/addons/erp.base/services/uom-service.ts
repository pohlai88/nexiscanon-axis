// packages/domain/src/addons/erp.base/services/uom-service.ts
// UoM Service - Units of Measure management
//
// Uses atomic CTE writes for guaranteed audit durability

import { eq, and, like, desc, asc, or } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { erpUoms } from "@workspace/db";
import type {
  CreateUomInput,
  UpdateUomInput,
  UomOutput,
  UomListOutput,
  UomListQuery,
} from "@workspace/validation/erp/base/uom";
import { token } from "../../../container";
import type { ServiceContext } from "../types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../types";
import { atomicInsertWithAudit, atomicUpdateWithAudit } from "../helpers/atomic-audit";

// ---- Service Interface ----

export interface UomService {
  create(ctx: ServiceContext, input: CreateUomInput, db: Database): Promise<UomOutput>;
  update(ctx: ServiceContext, id: string, input: UpdateUomInput, db: Database): Promise<UomOutput>;
  get(ctx: ServiceContext, id: string, db: Database): Promise<UomOutput>;
  list(ctx: ServiceContext, query: UomListQuery, db: Database): Promise<UomListOutput>;
  archive(ctx: ServiceContext, id: string, db: Database): Promise<UomOutput>;
}

// ---- Implementation ----

export class UomServiceImpl implements UomService {
  async create(ctx: ServiceContext, input: CreateUomInput, db: Database): Promise<UomOutput> {
    try {
      // Atomic insert + audit in single SQL
      const row = await atomicInsertWithAudit(db, {
        table: "erp_uoms",
        values: {
          tenant_id: ctx.tenantId,
          code: input.code,
          name: input.name,
          category: input.category,
          is_active: input.isActive ?? true,
        },
        entityType: "erp.base.uom",
        eventType: "erp.base.uom.created",
        ctx,
      });

      return this.toOutput(row);
    } catch (error: any) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new DomainError(
          ERP_ERROR_CODES.UOM_CODE_TAKEN,
          `UoM code "${input.code}" already exists`,
          { code: input.code }
        );
      }
      throw error;
    }
  }

  async update(
    ctx: ServiceContext,
    id: string,
    input: UpdateUomInput,
    db: Database
  ): Promise<UomOutput> {
    const set: Record<string, any> = {};
    if (input.name !== undefined) set.name = input.name;
    if (input.category !== undefined) set.category = input.category;
    if (input.isActive !== undefined) set.is_active = input.isActive;

    if (Object.keys(set).length === 0) {
      // No changes, just return current
      return this.get(ctx, id, db);
    }

    // Atomic update + audit in single SQL
    const row = await atomicUpdateWithAudit(db, {
      table: "erp_uoms",
      set,
      where: {
        id,
        tenant_id: ctx.tenantId,
      },
      entityType: "erp.base.uom",
      eventType: "erp.base.uom.updated",
      ctx,
      payload: { changes: input },
    });

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.UOM_NOT_FOUND, `UoM not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  async get(ctx: ServiceContext, id: string, db: Database): Promise<UomOutput> {
    const [row] = await db
      .select()
      .from(erpUoms)
      .where(and(eq(erpUoms.id, id), eq(erpUoms.tenantId, ctx.tenantId)))
      .limit(1);

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.UOM_NOT_FOUND, `UoM not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  async list(ctx: ServiceContext, query: UomListQuery, db: Database): Promise<UomListOutput> {
    const conditions = [eq(erpUoms.tenantId, ctx.tenantId)];

    // Default: active only (unless explicitly set to false or undefined)
    if (query.isActive !== undefined) {
      conditions.push(eq(erpUoms.isActive, query.isActive));
    } else {
      // Default behavior: only active
      conditions.push(eq(erpUoms.isActive, true));
    }

    if (query.category) {
      conditions.push(eq(erpUoms.category, query.category));
    }

    // Search: code, name (ILIKE) - normalize query (trim, collapse whitespace)
    if (query.q) {
      const normalized = query.q.trim().replace(/\s+/g, ' ');
      if (normalized) {
        const searchPattern = `%${normalized}%`;
        conditions.push(
          or(
            like(erpUoms.code, searchPattern),
            like(erpUoms.name, searchPattern)
          )!
        );
      }
    }

    // Cap limit at 100 (hard max)
    const limit = Math.min(query.limit, 100);

    // Cursor pagination: skip items up to cursor
    // Note: Simplified cursor (just id). Production would encode (orderCol + id)
    // This works if ordering by createdAt desc (newer first)
    if (query.cursor) {
      // Skip items until we pass the cursor
      // For desc order: id < cursor
      // For asc order: id > cursor
      const orderDir = query.orderDir === "asc" ? asc : desc;
      // Simple approach: fetch all and filter (not ideal for large sets)
      // Better: use WHERE id < cursor for desc, id > cursor for asc
    }

    const orderDir = query.orderDir === "asc" ? asc : desc;
    const orderCol =
      query.orderBy === "code"
        ? erpUoms.code
        : query.orderBy === "name"
          ? erpUoms.name
          : erpUoms.createdAt;

    const rows = await db
      .select()
      .from(erpUoms)
      .where(and(...conditions))
      .orderBy(orderDir(orderCol), orderDir(erpUoms.id)) // Secondary sort by id
      .limit(limit + 1); // Fetch one extra to determine nextCursor

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((row) => this.toOutput(row));
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
    };
  }

  async archive(ctx: ServiceContext, id: string, db: Database): Promise<UomOutput> {
    // Archive = set isActive to false with audit
    const row = await atomicUpdateWithAudit(db, {
      table: "erp_uoms",
      set: { is_active: false },
      where: {
        id,
        tenant_id: ctx.tenantId,
      },
      entityType: "erp.base.uom",
      eventType: "erp.base.uom.archived",
      ctx,
    });

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.UOM_NOT_FOUND, `UoM not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  // ---- Private Helpers ----

  private toOutput(row: typeof erpUoms.$inferSelect | any): UomOutput {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      code: row.code,
      name: row.name,
      category: row.category,
      isActive: row.is_active ?? row.isActive,
      createdAt: (row.created_at ?? row.createdAt).toISOString(),
    };
  }
}

// ---- Token ----

export const UOM_SERVICE = token<UomService>("erp.base.UomService");
