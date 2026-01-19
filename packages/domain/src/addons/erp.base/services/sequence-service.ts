// packages/domain/src/addons/erp.base/services/sequence-service.ts
// Sequence Service - atomic document numbering
//
// CRITICAL: Uses atomic UPDATE...RETURNING (no SELECT FOR UPDATE)
// Compatible with Neon HTTP driver (no long-lived transaction locks)

import { eq, and, sql } from "drizzle-orm";
import type { Database } from "@workspace/db";
import { erpSequences } from "@workspace/db";
import type {
  CreateSequenceInput,
  UpdateSequenceInput,
  SequenceOutput,
  NextNumberOutput,
  PeekNumberOutput,
} from "@workspace/validation/erp/base/sequence";
import { token } from "../../../container";
import type { ServiceContext, ErpDomainError } from "../types";
import { ERP_ERROR_CODES, ErpDomainError as DomainError } from "../types";
import { atomicInsertWithAudit, atomicUpdateWithAudit } from "../helpers/atomic-audit";

// ---- Service Interface ----

export interface SequenceService {
  /**
   * Create a new sequence
   */
  create(ctx: ServiceContext, input: CreateSequenceInput, db: Database): Promise<SequenceOutput>;

  /**
   * Update sequence configuration
   */
  update(
    ctx: ServiceContext,
    id: string,
    input: UpdateSequenceInput,
    db: Database
  ): Promise<SequenceOutput>;

  /**
   * Get sequence by ID
   */
  get(ctx: ServiceContext, id: string, db: Database): Promise<SequenceOutput>;

  /**
   * Preview next number without incrementing
   */
  peek(ctx: ServiceContext, sequenceKey: string, db: Database): Promise<PeekNumberOutput>;

  /**
   * Get next number (atomic, increments)
   * CRITICAL: Must be called within a transaction
   */
  next(ctx: ServiceContext, sequenceKey: string, db: Database): Promise<NextNumberOutput>;
}

// ---- Implementation ----

export class SequenceServiceImpl implements SequenceService {
  async create(
    ctx: ServiceContext,
    input: CreateSequenceInput,
    db: Database
  ): Promise<SequenceOutput> {
    try {
      // Use atomic CTE write for sequence creation (admin operation, but still atomic)
      const row = await atomicInsertWithAudit(db, {
        table: "erp_sequences",
        values: {
          tenant_id: ctx.tenantId,
          sequence_key: input.sequenceKey,
          prefix: input.prefix,
          next_value: input.nextValue ?? 1,
          padding: input.padding ?? 6,
          year_reset: input.yearReset ?? true,
          current_year: input.currentYear ?? null,
        },
        entityType: "erp.base.sequence",
        eventType: "erp.base.sequence.created",
        ctx,
      });

      return this.toOutput(row);
    } catch (error: any) {
      if (error.code === "23505") {
        throw new DomainError(
          ERP_ERROR_CODES.SEQUENCE_KEY_TAKEN,
          `Sequence key "${input.sequenceKey}" already exists`,
          { sequenceKey: input.sequenceKey }
        );
      }
      throw error;
    }
  }

  async update(
    ctx: ServiceContext,
    id: string,
    input: UpdateSequenceInput,
    db: Database
  ): Promise<SequenceOutput> {
    const set: Record<string, any> = {};
    if (input.prefix !== undefined) set.prefix = input.prefix;
    if (input.nextValue !== undefined) set.next_value = input.nextValue;
    if (input.padding !== undefined) set.padding = input.padding;
    if (input.yearReset !== undefined) set.year_reset = input.yearReset;
    if (input.currentYear !== undefined) set.current_year = input.currentYear;

    if (Object.keys(set).length === 0) {
      return this.get(ctx, id, db);
    }

    // Use atomic CTE write for sequence update (admin operation, but still atomic)
    const row = await atomicUpdateWithAudit(db, {
      table: "erp_sequences",
      set,
      where: {
        id,
        tenant_id: ctx.tenantId,
      },
      entityType: "erp.base.sequence",
      eventType: "erp.base.sequence.updated",
      ctx,
      payload: { changes: input },
    });

    if (!row) {
      throw new DomainError(
        ERP_ERROR_CODES.SEQUENCE_NOT_FOUND,
        `Sequence not found: ${id}`,
        { id }
      );
    }

    return this.toOutput(row);
  }

  async get(ctx: ServiceContext, id: string, db: Database): Promise<SequenceOutput> {
    const [sequence] = await db
      .select()
      .from(erpSequences)
      .where(and(eq(erpSequences.id, id), eq(erpSequences.tenantId, ctx.tenantId)))
      .limit(1);

    if (!sequence) {
      throw new DomainError(
        ERP_ERROR_CODES.SEQUENCE_NOT_FOUND,
        `Sequence not found: ${id}`,
        { id }
      );
    }

    return this.toOutput(sequence);
  }

  async peek(ctx: ServiceContext, sequenceKey: string, db: Database): Promise<PeekNumberOutput> {
    const [sequence] = await db
      .select()
      .from(erpSequences)
      .where(
        and(eq(erpSequences.sequenceKey, sequenceKey), eq(erpSequences.tenantId, ctx.tenantId))
      )
      .limit(1);

    if (!sequence) {
      throw new DomainError(
        ERP_ERROR_CODES.SEQUENCE_NOT_FOUND,
        `Sequence not found: ${sequenceKey}`,
        { sequenceKey }
      );
    }

    const formattedValue = this.formatNumber(sequence);
    return {
      value: formattedValue,
      sequenceKey: sequence.sequenceKey,
    };
  }

  async next(ctx: ServiceContext, sequenceKey: string, db: Database): Promise<NextNumberOutput> {
    // CRITICAL: Single atomic UPDATE...RETURNING for concurrency safety
    // No SELECT FOR UPDATE (unreliable on Neon HTTP driver)
    
    const currentYear = new Date().getFullYear();

    // Atomic increment with year reset logic
    // Strategy: Return BOTH the allocated value AND the updated row
    const result = await db.execute(sql`
      UPDATE ${erpSequences}
      SET 
        next_value = CASE 
          WHEN ${erpSequences.yearReset} = true 
            AND (${erpSequences.currentYear} IS NULL OR ${erpSequences.currentYear} != ${currentYear})
          THEN 2
          ELSE ${erpSequences.nextValue} + 1
        END,
        current_year = CASE
          WHEN ${erpSequences.yearReset} = true
          THEN ${currentYear}
          ELSE ${erpSequences.currentYear}
        END
      WHERE ${erpSequences.sequenceKey} = ${sequenceKey}
        AND ${erpSequences.tenantId} = ${ctx.tenantId}
      RETURNING 
        *,
        CASE 
          WHEN ${erpSequences.yearReset} = true 
            AND (${erpSequences.currentYear} IS NULL OR ${erpSequences.currentYear} != ${currentYear})
          THEN 1
          ELSE ${erpSequences.nextValue}
        END as allocated_value
    `);

    const updated = result.rows[0];
    
    if (!updated) {
      throw new DomainError(
        ERP_ERROR_CODES.SEQUENCE_NOT_FOUND,
        `Sequence not found: ${sequenceKey}`,
        { sequenceKey }
      );
    }

    const allocatedValue = Number(updated.allocated_value);
    
    const formattedValue = this.formatNumber({
      id: String(updated.id),
      tenantId: String(updated.tenant_id),
      sequenceKey: String(updated.sequence_key),
      prefix: String(updated.prefix),
      nextValue: allocatedValue,
      padding: Number(updated.padding),
      yearReset: Boolean(updated.year_reset),
      currentYear: updated.current_year ? Number(updated.current_year) : null,
    });

    return {
      value: formattedValue,
      raw: allocatedValue,
      sequenceKey: String(updated.sequence_key),
    };
  }

  // ---- Private Helpers ----

  private formatNumber(sequence: typeof erpSequences.$inferSelect): string {
    const { prefix, nextValue, padding, yearReset, currentYear } = sequence;
    const paddedNumber = String(nextValue).padStart(padding, "0");

    if (yearReset && currentYear) {
      return `${prefix}${currentYear}-${paddedNumber}`;
    }

    return `${prefix}${paddedNumber}`;
  }

  private toOutput(row: typeof erpSequences.$inferSelect | any): SequenceOutput {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      sequenceKey: row.sequence_key ?? row.sequenceKey,
      prefix: row.prefix,
      nextValue: row.next_value ?? row.nextValue,
      padding: row.padding,
      yearReset: row.year_reset ?? row.yearReset,
      currentYear: row.current_year ?? row.currentYear,
    };
  }
}

// ---- Token ----

export const SEQUENCE_SERVICE = token<SequenceService>("erp.base.SequenceService");
