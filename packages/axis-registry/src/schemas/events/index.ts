/**
 * Domain Events Index
 *
 * Re-exports all domain event schemas for cross-domain contracts.
 */

// Base event schemas
export * from "./base";

// Domain-specific events
export * from "./core";
export * from "./mdm";
export * from "./sales";
export * from "./accounting";
export * from "./controls";
export * from "./workflow";
export * from "./reconciliation";
export * from "./ux";
export * from "./afanda";
export * from "./lynx";
export * from "./intelligence";
export * from "./migration";
export * from "./adapter";
export * from "./mapping";
export * from "./dual-ledger";
export * from "./cutover";

// ============================================================================
// All Domain Events Union
// ============================================================================

import { z } from "zod";
import { coreEventSchema } from "./core";
import { mdmEventSchema } from "./mdm";
import { salesEventSchema } from "./sales";
import { accountingEventSchema } from "./accounting";
import { controlsEventSchema } from "./controls";
import { workflowEventSchema } from "./workflow";
import { reconciliationEventSchema } from "./reconciliation";
import { uxEventSchema } from "./ux";
import { afandaEventSchema } from "./afanda";
import { lynxEventSchema } from "./lynx";
import { intelligenceEventSchema } from "./intelligence";
import { migrationEventSchema } from "./migration";
import { adapterEventSchema } from "./adapter";
import { studioEventSchema } from "./mapping";
import { dualLedgerEventSchema } from "./dual-ledger";
import { cutoverEventSchema } from "./cutover";

/**
 * Union of all domain events
 */
export const domainEventSchema = z.union([
  coreEventSchema,
  mdmEventSchema,
  salesEventSchema,
  accountingEventSchema,
  controlsEventSchema,
  workflowEventSchema,
  reconciliationEventSchema,
  uxEventSchema,
  afandaEventSchema,
  lynxEventSchema,
  intelligenceEventSchema,
  migrationEventSchema,
  adapterEventSchema,
  studioEventSchema,
  dualLedgerEventSchema,
  cutoverEventSchema,
]);

export type DomainEvent = z.infer<typeof domainEventSchema>;
