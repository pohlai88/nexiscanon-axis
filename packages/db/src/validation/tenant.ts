import {
  createCoercedInsertSchema,
  createSelectSchema,
  z,
} from "./factory";
import {
  tenants,
  TENANT_TYPE,
  TENANT_STATUS,
  SUBSCRIPTION_PLAN,
} from "../schema/tenant";

/**
 * Tenant type schema.
 */
export const tenantTypeSchema = z.enum(TENANT_TYPE);

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
 * Uses coerced schema for date fields (Zod v4 best practice).
 */
export const insertTenantSchema = createCoercedInsertSchema(tenants, {
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
  type: tenantTypeSchema.optional(),
  parentId: z.string().uuid().nullable().optional(),
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

/**
 * Create organization form schema.
 */
export const createOrganizationFormSchema = insertTenantSchema.pick({
  slug: true,
  name: true,
}).extend({
  type: z.literal("organization").default("organization"),
});

/**
 * Create team form schema (requires parent org).
 */
export const createTeamFormSchema = insertTenantSchema.pick({
  slug: true,
  name: true,
}).extend({
  type: z.literal("team").default("team"),
  parentId: z.string().uuid("Parent organization ID is required"),
});

/**
 * Create personal workspace form schema.
 */
export const createPersonalFormSchema = insertTenantSchema.pick({
  slug: true,
  name: true,
}).extend({
  type: z.literal("personal").default("personal"),
});

// Type exports for convenience
// Note: TenantType is exported from schema/tenant.ts, not here to avoid duplicate exports
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type SelectTenant = z.infer<typeof selectTenantSchema>;
export type UpdateTenant = z.infer<typeof updateTenantSchema>;
export type CreateTenantForm = z.infer<typeof createTenantFormSchema>;
export type CreateOrganizationForm = z.infer<typeof createOrganizationFormSchema>;
export type CreateTeamForm = z.infer<typeof createTeamFormSchema>;
export type CreatePersonalForm = z.infer<typeof createPersonalFormSchema>;
