/**
 * Policy Tables (B08)
 *
 * Business rules and constraints.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  boolean,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type PolicyType,
  type PolicyStatus,
  type PolicyScope,
  type PermissionDomain,
  type PermissionAction,
  type ConditionType,
  type RuleActionType,
} from "@axis/registry/schemas";

// ============================================================================
// Policies Table
// ============================================================================

export const ctrlPolicies = pgTable(
  "ctrl_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),

    // Identity
    code: varchar("code", { length: 100 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),

    // Type
    policyType: varchar("policy_type", { length: 30 })
      .notNull()
      .$type<PolicyType>(),
    scope: varchar("scope", { length: 20 })
      .notNull()
      .default("tenant")
      .$type<PolicyScope>(),

    // Target
    targetDomain: varchar("target_domain", { length: 30 })
      .notNull()
      .$type<PermissionDomain>(),
    targetResource: varchar("target_resource", { length: 50 }),
    targetAction: varchar("target_action", { length: 30 }).$type<PermissionAction>(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("draft")
      .$type<PolicyStatus>(),

    // Priority
    priority: integer("priority").notNull().default(0),

    // Effective period
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: uuid("created_by").notNull(),
  },
  (table) => [
    uniqueIndex("uq_ctrl_policies_code").on(table.tenantId, table.code),
    index("idx_ctrl_policies_tenant").on(table.tenantId),
    index("idx_ctrl_policies_status").on(table.tenantId, table.status),
    index("idx_ctrl_policies_target").on(
      table.tenantId,
      table.targetDomain,
      table.targetResource,
      table.targetAction
    ),
    index("idx_ctrl_policies_priority").on(table.tenantId, table.priority),
  ]
);

export const ctrlPoliciesRelations = relations(ctrlPolicies, ({ one }) => ({
  tenant: one(tenants, {
    fields: [ctrlPolicies.tenantId],
    references: [tenants.id],
  }),
}));

export type CtrlPolicyRow = typeof ctrlPolicies.$inferSelect;
export type NewCtrlPolicyRow = typeof ctrlPolicies.$inferInsert;

// ============================================================================
// Policy Rules Table
// ============================================================================

export const ctrlPolicyRules = pgTable(
  "ctrl_policy_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    policyId: uuid("policy_id")
      .notNull()
      .references(() => ctrlPolicies.id, { onDelete: "cascade" }),

    // Rule definition
    ruleNumber: integer("rule_number").notNull(),
    name: varchar("name", { length: 255 }).notNull(),

    // Condition
    conditionType: varchar("condition_type", { length: 20 })
      .notNull()
      .$type<ConditionType>(),
    condition: jsonb("condition"),

    // Action
    actionType: varchar("action_type", { length: 30 })
      .notNull()
      .$type<RuleActionType>(),
    actionParams: jsonb("action_params").$type<Record<string, unknown>>(),

    // Enabled
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    uniqueIndex("uq_ctrl_policy_rules_number").on(
      table.policyId,
      table.ruleNumber
    ),
    index("idx_ctrl_policy_rules_policy").on(table.policyId),
    index("idx_ctrl_policy_rules_active").on(table.policyId, table.isActive),
  ]
);

export const ctrlPolicyRulesRelations = relations(
  ctrlPolicyRules,
  ({ one }) => ({
    policy: one(ctrlPolicies, {
      fields: [ctrlPolicyRules.policyId],
      references: [ctrlPolicies.id],
    }),
  })
);

export type CtrlPolicyRuleRow = typeof ctrlPolicyRules.$inferSelect;
export type NewCtrlPolicyRuleRow = typeof ctrlPolicyRules.$inferInsert;
