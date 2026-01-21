import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  tenants,
  TENANT_STATUS,
  SUBSCRIPTION_PLAN,
} from "../schema/tenant";

/**
 * Tenant status schema.
 */
export const tenantStatusSchema = z.enum(TENANT_STATUS);

/**
 * Subscription plan schema.
 */
export const subscriptionPlanSchema = z.enum(SUBSCRIPTION_PLAN);

/**
 * Tenant settings schema for JSONB validation.
 */
export const tenantSettingsSchema = z.object({
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
}).passthrough();

/**
 * Tenant insert validation schema.
 * Use for validating create/update payloads.
 */
export const insertTenantSchema = createInsertSchema(tenants, {
  slug: z.string()
    .min(1, "Slug is required")
    .max(63, "Slug must be 63 characters or less")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      "Slug must be lowercase alphanumeric with hyphens, cannot start or end with hyphen"
    ),
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  status: tenantStatusSchema.optional(),
  plan: subscriptionPlanSchema.optional(),
  settings: tenantSettingsSchema.optional(),
});

/**
 * Tenant select schema.
 * Use for validating data coming from database.
 */
export const selectTenantSchema = createSelectSchema(tenants);

/**
 * Partial tenant update schema.
 * All fields optional for PATCH operations.
 */
export const updateTenantSchema = insertTenantSchema.partial().omit({
  id: true,
  createdAt: true,
});

/**
 * Create tenant form schema (minimal required fields).
 */
export const createTenantFormSchema = insertTenantSchema.pick({
  slug: true,
  name: true,
});

// Type exports for convenience
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type SelectTenant = z.infer<typeof selectTenantSchema>;
export type UpdateTenant = z.infer<typeof updateTenantSchema>;
export type CreateTenantForm = z.infer<typeof createTenantFormSchema>;
