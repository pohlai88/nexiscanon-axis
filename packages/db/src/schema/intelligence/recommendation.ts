/**
 * Recommendation Table (B12)
 *
 * The Machine offers improvements.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  jsonb,
  text,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import {
  type RecommendationType,
  type RecommendationStatus,
  type ExpectedImpact,
  type RecommendationConfidence,
  type SupportingData,
  type RecommendationAction,
  type RecommendationFeedback,
} from "@axis/registry/schemas";

export const intelRecommendations = pgTable(
  "intel_recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

    // Type
    recommendationType: varchar("recommendation_type", { length: 30 })
      .notNull()
      .$type<RecommendationType>(),

    // Target
    targetDomain: varchar("target_domain", { length: 50 }).notNull(),
    targetEntity: varchar("target_entity", { length: 100 }),
    targetEntityId: uuid("target_entity_id"),

    // Recommendation
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),

    // Impact
    expectedImpact: jsonb("expected_impact").$type<ExpectedImpact>().notNull(),

    // Confidence
    confidence: jsonb("confidence").$type<RecommendationConfidence>().notNull(),

    // Machine Reasoning
    reasoning: text("reasoning").notNull(),
    supportingData: jsonb("supporting_data").$type<SupportingData[]>(),

    // Action
    suggestedAction: jsonb("suggested_action")
      .$type<RecommendationAction>()
      .notNull(),

    // Status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<RecommendationStatus>(),

    // Feedback
    feedback: jsonb("feedback").$type<RecommendationFeedback>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_intel_recom_tenant").on(table.tenantId),
    index("idx_intel_recom_type").on(table.tenantId, table.recommendationType),
    index("idx_intel_recom_domain").on(table.tenantId, table.targetDomain),
    index("idx_intel_recom_status").on(table.tenantId, table.status),
    index("idx_intel_recom_target").on(
      table.tenantId,
      table.targetEntity,
      table.targetEntityId
    ),
    index("idx_intel_recom_created").on(table.tenantId, table.createdAt),
  ]
);

export const intelRecommendationsRelations = relations(
  intelRecommendations,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [intelRecommendations.tenantId],
      references: [tenants.id],
    }),
  })
);

export type IntelRecommendationRow = typeof intelRecommendations.$inferSelect;
export type NewIntelRecommendationRow = typeof intelRecommendations.$inferInsert;
