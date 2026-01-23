import {
  createCoercedInsertSchema,
  createSelectSchema,
  z,
} from "./factory";
import {
  users,
  tenantUsers,
  invitations,
  USER_ROLE,
} from "../schema/user";

// ============================================================================
// User Schemas
// ============================================================================

/**
 * User role schema (matches SQL CHECK constraint).
 */
export const userRoleSchema = z.enum(USER_ROLE);

/**
 * User settings schema for JSONB validation.
 */
export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  notifications: z.boolean().optional(),
}).passthrough();

/**
 * User insert validation schema.
 * Uses coerced schema for date fields (Zod v4 best practice).
 */
export const insertUserSchema = createCoercedInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  name: z.string().max(255).nullable().optional(),
  settings: userSettingsSchema.optional(),
});

/**
 * User select schema.
 */
export const selectUserSchema = createSelectSchema(users);

/**
 * Profile update schema.
 */
export const updateProfileSchema = z.object({
  name: z.string().max(255).nullable(),
  settings: userSettingsSchema.optional(),
});

// ============================================================================
// Tenant Membership Schemas
// ============================================================================

/**
 * Tenant user insert schema.
 * Uses coerced schema for date fields (Zod v4 best practice).
 */
export const insertTenantUserSchema = createCoercedInsertSchema(tenantUsers, {
  role: userRoleSchema.optional(),
});

/**
 * Tenant user select schema.
 */
export const selectTenantUserSchema = createSelectSchema(tenantUsers);

// ============================================================================
// Invitation Schemas
// ============================================================================

/**
 * Invitation insert schema.
 * Uses coerced schema for date fields (Zod v4 best practice).
 */
export const insertInvitationSchema = createCoercedInsertSchema(invitations, {
  email: z.string().email("Invalid email address"),
});

/**
 * Invitation select schema.
 */
export const selectInvitationSchema = createSelectSchema(invitations);

/**
 * Invite member form schema.
 */
export const inviteMemberFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: userRoleSchema.default("member"),
});

// Type exports (UserRole is exported from schema/user.ts)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;
export type SelectTenantUser = z.infer<typeof selectTenantUserSchema>;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type SelectInvitation = z.infer<typeof selectInvitationSchema>;
export type InviteMemberForm = z.infer<typeof inviteMemberFormSchema>;
