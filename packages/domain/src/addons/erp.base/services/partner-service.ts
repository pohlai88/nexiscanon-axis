// packages/domain/src/addons/erp.base/services/partner-service.ts
// Partner Service - Customer/Vendor management
//
// Uses atomic CTE writes for guaranteed audit durability

import { eq, and, like, desc, asc, sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { erpPartners } from "@workspace/db";
import type {
  CreatePartnerInput,
  UpdatePartnerInput,
  PartnerOutput,
  PartnerListOutput,
  PartnerListQuery,
} from "@workspace/validation/erp/base/partner";
import { token } from "../../../container";
import type { ServiceContext } from "../types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../types";
import { atomicInsertWithAudit, atomicUpdateWithAudit } from "../helpers/atomic-audit";
import type { SequenceService } from "./sequence-service";

// ---- Service Interface ----

export interface PartnerService {
  create(ctx: ServiceContext, input: CreatePartnerInput, db: Database): Promise<PartnerOutput>;
  update(ctx: ServiceContext, id: string, input: UpdatePartnerInput, db: Database): Promise<PartnerOutput>;
  get(ctx: ServiceContext, id: string, db: Database): Promise<PartnerOutput>;
  list(ctx: ServiceContext, query: PartnerListQuery, db: Database): Promise<PartnerListOutput>;
  archive(ctx: ServiceContext, id: string, db: Database): Promise<PartnerOutput>;
}

// ---- Implementation ----

export class PartnerServiceImpl implements PartnerService {
  constructor(private sequenceService: SequenceService) {}

  async create(ctx: ServiceContext, input: CreatePartnerInput, db: Database): Promise<PartnerOutput> {
    // Generate code if not provided
    let code = input.code;
    let retries = 0;
    const MAX_RETRIES = 3;

    while (!code && retries < MAX_RETRIES) {
      try {
        // Generate code from sequence
        const nextCode = await this.sequenceService.next(ctx, "partner.code", db);
        code = `P${nextCode.value}`;

        // Try atomic insert with generated code
        const row = await atomicInsertWithAudit(db, {
          table: "erp_partners",
          values: {
            tenant_id: ctx.tenantId,
            code,
            name: input.name,
            display_name: input.displayName,
            party_type: input.partyType,
            tax_id: input.taxId,
            company_registry: input.companyRegistry,
            email: input.email,
            phone: input.phone,
            website: input.website,
            address_line1: input.addressLine1,
            address_line2: input.addressLine2,
            city: input.city,
            state_province: input.stateProvince,
            postal_code: input.postalCode,
            country_code: input.countryCode,
            default_currency_code: input.defaultCurrencyCode,
            default_payment_terms_days: input.defaultPaymentTermsDays,
            internal_notes: input.internalNotes,
            is_active: input.isActive ?? true,
          },
          entityType: "erp.base.partner",
          eventType: "erp.base.partner.created",
          ctx,
        });

        return this.toOutput(row);
      } catch (error: any) {
        if (error.code === "23505" && !input.code) {
          // Collision on generated code, retry
          retries++;
          code = undefined;
          continue;
        }
        throw this.handleError(error, input.code);
      }
    }

    if (!code) {
      throw new DomainError(
        ERP_ERROR_CODES.PARTNER_CODE_GENERATION_FAILED,
        "Failed to generate unique partner code after retries",
        { retries: MAX_RETRIES }
      );
    }

    // Should not reach here
    throw new DomainError(
      ERP_ERROR_CODES.PARTNER_CODE_GENERATION_FAILED,
      "Unexpected partner creation failure",
      {}
    );
  }

  async update(
    ctx: ServiceContext,
    id: string,
    input: UpdatePartnerInput,
    db: Database
  ): Promise<PartnerOutput> {
    const set: Record<string, any> = {};
    if (input.name !== undefined) set.name = input.name;
    if (input.displayName !== undefined) set.display_name = input.displayName;
    if (input.partyType !== undefined) set.party_type = input.partyType;
    if (input.taxId !== undefined) set.tax_id = input.taxId;
    if (input.companyRegistry !== undefined) set.company_registry = input.companyRegistry;
    if (input.email !== undefined) set.email = input.email;
    if (input.phone !== undefined) set.phone = input.phone;
    if (input.website !== undefined) set.website = input.website;
    if (input.addressLine1 !== undefined) set.address_line1 = input.addressLine1;
    if (input.addressLine2 !== undefined) set.address_line2 = input.addressLine2;
    if (input.city !== undefined) set.city = input.city;
    if (input.stateProvince !== undefined) set.state_province = input.stateProvince;
    if (input.postalCode !== undefined) set.postal_code = input.postalCode;
    if (input.countryCode !== undefined) set.country_code = input.countryCode;
    if (input.defaultCurrencyCode !== undefined) set.default_currency_code = input.defaultCurrencyCode;
    if (input.defaultPaymentTermsDays !== undefined) set.default_payment_terms_days = input.defaultPaymentTermsDays;
    if (input.internalNotes !== undefined) set.internal_notes = input.internalNotes;
    if (input.isActive !== undefined) set.is_active = input.isActive;

    if (Object.keys(set).length === 0) {
      return this.get(ctx, id, db);
    }

    const row = await atomicUpdateWithAudit(db, {
      table: "erp_partners",
      set,
      where: {
        id,
        tenant_id: ctx.tenantId,
      },
      entityType: "erp.base.partner",
      eventType: "erp.base.partner.updated",
      ctx,
      payload: { changes: input },
    });

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.PARTNER_NOT_FOUND, `Partner not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  async get(ctx: ServiceContext, id: string, db: Database): Promise<PartnerOutput> {
    const [row] = await db
      .select()
      .from(erpPartners)
      .where(and(eq(erpPartners.id, id), eq(erpPartners.tenantId, ctx.tenantId)))
      .limit(1);

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.PARTNER_NOT_FOUND, `Partner not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  async list(ctx: ServiceContext, query: PartnerListQuery, db: Database): Promise<PartnerListOutput> {
    const conditions = [eq(erpPartners.tenantId, ctx.tenantId)];

    if (query.partyType) {
      conditions.push(eq(erpPartners.partyType, query.partyType));
    }

    if (query.isActive !== undefined) {
      conditions.push(eq(erpPartners.isActive, query.isActive));
    }

    if (query.q) {
      // Search in name, code, email
      conditions.push(
        sql`(${erpPartners.name} ILIKE ${"%" + query.q + "%"} OR ${erpPartners.code} ILIKE ${"%" + query.q + "%"} OR ${erpPartners.email} ILIKE ${"%" + query.q + "%"})`
      );
    }

    if (query.cursor) {
      conditions.push(eq(erpPartners.id, query.cursor));
    }

    const orderDir = query.orderDir === "asc" ? asc : desc;
    const orderCol =
      query.orderBy === "code"
        ? erpPartners.code
        : query.orderBy === "name"
          ? erpPartners.name
          : erpPartners.createdAt;

    const rows = await db
      .select()
      .from(erpPartners)
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

  async archive(ctx: ServiceContext, id: string, db: Database): Promise<PartnerOutput> {
    const row = await atomicUpdateWithAudit(db, {
      table: "erp_partners",
      set: { is_active: false },
      where: {
        id,
        tenant_id: ctx.tenantId,
      },
      entityType: "erp.base.partner",
      eventType: "erp.base.partner.archived",
      ctx,
    });

    if (!row) {
      throw new DomainError(ERP_ERROR_CODES.PARTNER_NOT_FOUND, `Partner not found: ${id}`, { id });
    }

    return this.toOutput(row);
  }

  // ---- Private Helpers ----

  private toOutput(row: typeof erpPartners.$inferSelect | any): PartnerOutput {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      code: row.code,
      name: row.name,
      displayName: row.display_name ?? row.displayName,
      partyType: row.party_type ?? row.partyType,
      taxId: row.tax_id ?? row.taxId,
      companyRegistry: row.company_registry ?? row.companyRegistry,
      email: row.email,
      phone: row.phone,
      website: row.website,
      addressLine1: row.address_line1 ?? row.addressLine1,
      addressLine2: row.address_line2 ?? row.addressLine2,
      city: row.city,
      stateProvince: row.state_province ?? row.stateProvince,
      postalCode: row.postal_code ?? row.postalCode,
      countryCode: row.country_code ?? row.countryCode,
      defaultCurrencyCode: row.default_currency_code ?? row.defaultCurrencyCode,
      defaultPaymentTermsDays: row.default_payment_terms_days ?? row.defaultPaymentTermsDays,
      internalNotes: row.internal_notes ?? row.internalNotes,
      isActive: row.is_active ?? row.isActive,
      createdAt: (row.created_at ?? row.createdAt).toISOString(),
      updatedAt: (row.updated_at ?? row.updatedAt).toISOString(),
      createdBy: row.created_by ?? row.createdBy,
      updatedBy: row.updated_by ?? row.updatedBy,
      version: row.version,
    };
  }

  private handleError(error: any, explicitCode?: string): never {
    if (error.code === "23505") {
      if (explicitCode) {
        throw new DomainError(
          ERP_ERROR_CODES.PARTNER_CODE_TAKEN,
          `Partner code "${explicitCode}" already exists`,
          { code: explicitCode }
        );
      }
    }
    throw error;
  }
}

// ---- Token ----

export const PARTNER_SERVICE = token<PartnerService>("erp.base.PartnerService");
