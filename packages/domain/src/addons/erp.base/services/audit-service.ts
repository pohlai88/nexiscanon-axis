// packages/domain/src/addons/erp.base/services/audit-service.ts
// ERP Audit Service Interface - durable business compliance audit
//
// CRITICAL: Audit events MUST be emitted in the same transaction as data changes.
// This ensures audit records are never lost due to transaction rollback.
//
// @see help013-erp-audit-table-spec.md for full specification

import { token } from "../../../container";

// ---- Context Types ----

/**
 * Audit context - provides identity and correlation for audit events
 */
export interface AuditContext {
  /** Tenant ID (required for all ERP operations) */
  tenantId: string;
  /** User who initiated the action (null for system operations) */
  actorUserId?: string;
  /** Type of actor */
  actorType: "USER" | "SYSTEM" | "SERVICE";
  /** OpenTelemetry trace ID for correlation */
  traceId?: string;
  /** Idempotency key to prevent duplicate events */
  commandId?: string;
}

/**
 * Audit event - represents a business event to be recorded
 */
export interface AuditEvent {
  /** Entity type (e.g., 'erp.sales.order') */
  entityType: string;
  /** Entity ID (UUID) */
  entityId: string;
  /** Event type (e.g., 'erp.sales.order.created') */
  eventType: string;
  /** Event payload (entity snapshot or change diff) */
  payload: Record<string, unknown>;
}

// ---- Payload Types ----

/**
 * Payload for entity creation events
 */
export interface CreatedPayload {
  entity: Record<string, unknown>;
}

/**
 * Payload for entity update events
 */
export interface UpdatedPayload {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

/**
 * Payload for workflow transition events
 */
export interface TransitionPayload {
  fromStatus: string;
  toStatus: string;
  reason?: string;
  note?: string;
}

// ---- Service Interface ----

/**
 * AuditService - emits durable audit events for ERP entities
 *
 * Usage in domain services:
 * ```ts
 * await db.transaction(async (tx) => {
 *   // 1. Update entity
 *   const order = await tx.update(...).returning();
 *
 *   // 2. Emit audit (same transaction)
 *   await auditService.emit(ctx, {
 *     entityType: 'erp.sales.order',
 *     entityId: order.id,
 *     eventType: 'erp.sales.order.approved',
 *     payload: { fromStatus: 'SUBMITTED', toStatus: 'APPROVED' }
 *   });
 *
 *   return order;
 * });
 * ```
 */
export interface ErpAuditService {
  /**
   * Emit a single audit event
   * @param ctx - Audit context (tenant, actor, trace)
   * @param event - The audit event to record
   */
  emit(ctx: AuditContext, event: AuditEvent): Promise<void>;

  /**
   * Emit multiple audit events in a batch
   * @param ctx - Audit context (shared across all events)
   * @param events - Array of audit events to record
   */
  emitBatch(ctx: AuditContext, events: AuditEvent[]): Promise<void>;
}

// ---- Token ----

/**
 * Token for ERP Audit Service
 *
 * Usage:
 * ```ts
 * const auditService = container.get(ERP_AUDIT_SERVICE);
 * ```
 */
export const ERP_AUDIT_SERVICE = token<ErpAuditService>("erp.base.AuditService");
