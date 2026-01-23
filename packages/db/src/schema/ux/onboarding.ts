/**
 * Onboarding Progress Table (B10)
 *
 * User and tenant onboarding tracking.
 */

import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "../tenant";
import { type OnboardingStatus } from "@axis/registry/schemas";

// Type for onboarding steps stored in JSONB
interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  status: OnboardingStatus;
  completedAt?: string;
  skippedAt?: string;
  required: boolean;
  order: number;
}

export const onboardingProgress = pgTable(
  "ux_onboarding_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id"), // null for tenant-level

    // Progress tracking
    steps: jsonb("steps").$type<OnboardingStep[]>().notNull().default([]),
    currentStepId: varchar("current_step_id", { length: 50 }),

    // Overall status
    overallStatus: varchar("overall_status", { length: 20 })
      .notNull()
      .default("not_started")
      .$type<OnboardingStatus>(),
    percentComplete: integer("percent_complete").notNull().default(0),

    // Timestamps
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_ux_onboarding_tenant_user").on(table.tenantId, table.userId),
    index("idx_ux_onboarding_tenant").on(table.tenantId),
    index("idx_ux_onboarding_status").on(table.tenantId, table.overallStatus),
  ]
);

export const onboardingProgressRelations = relations(
  onboardingProgress,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [onboardingProgress.tenantId],
      references: [tenants.id],
    }),
  })
);

export type OnboardingProgressRow = typeof onboardingProgress.$inferSelect;
export type NewOnboardingProgressRow = typeof onboardingProgress.$inferInsert;
