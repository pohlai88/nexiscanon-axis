/**
 * Delegation Table (B08-01)
 *
 * Approval delegation rules.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  numeric,
  boolean,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type DelegationType } from "@axis/registry/schemas";

export const wfDelegations = pgTable(
  "wf_delegations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Delegator (who is delegating)
    delegatorId: uuid("delegator_id").notNull(),
    delegatorName: varchar("delegator_name", { length: 255 }).notNull(),

    // Delegate (who receives the authority)
    delegateId: uuid("delegate_id").notNull(),
    delegateName: varchar("delegate_name", { length: 255 }).notNull(),

    // Type
    delegationType: varchar("delegation_type", { length: 30 })
      .notNull()
      .$type<DelegationType>(),

    // Scope (for document_type)
    documentTypes: jsonb("document_types").$type<string[]>(),

    // Threshold (for amount_threshold)
    maxAmount: numeric("max_amount", { precision: 18, scale: 4 }),
    currency: varchar("currency", { length: 3 }),

    // Validity period
    effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
    effectiveTo: timestamp("effective_to", { withTimezone: true }).notNull(),

    // Reason
    reason: text("reason"),

    // Status
    isActive: boolean("is_active").notNull().default(true),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedBy: uuid("revoked_by"),
  },
  (table) => [
    index("idx_wf_delegations_tenant").on(table.tenantId),
    index("idx_wf_delegations_delegator").on(table.tenantId, table.delegatorId),
    index("idx_wf_delegations_delegate").on(table.tenantId, table.delegateId),
    index("idx_wf_delegations_active").on(
      table.tenantId,
      table.delegatorId,
      table.isActive
    ),
    index("idx_wf_delegations_effective").on(
      table.tenantId,
      table.effectiveFrom,
      table.effectiveTo
    ),
  ]
);

export const wfDelegationsRelations = relations(wfDelegations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [wfDelegations.tenantId],
    references: [tenants.id],
  }),
}));

export type WfDelegationRow = typeof wfDelegations.$inferSelect;
export type NewWfDelegationRow = typeof wfDelegations.$inferInsert;
