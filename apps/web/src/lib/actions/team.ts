"use server";

/**
 * Team management server actions.
 *
 * Pattern: Server actions for team operations.
 * Uses Zod schemas from @axis/db for validation.
 * Uses policies from @/lib/policies for permission checks.
 */

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/session";
import { findTenantBySlug } from "../db/tenants";
import {
  getUserTenantMembership,
  addUserToTenant,
  removeUserFromTenant,
  findUserByEmail,
  userRoleSchema,
} from "../db/users";
import { query } from "../db";
import { sendEmail } from "../email";
import { invitationEmail } from "../email/templates";
import { inviteMemberFormSchema } from "@axis/db/validation";
import { logger } from "../logger";
import {
  canInviteMembers,
  canRemoveSpecificMember,
} from "../policies";

export interface TeamActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Invite a user to the team.
 */
export async function inviteTeamMemberAction(
  tenantSlug: string,
  _prevState: TeamActionResult,
  formData: FormData
): Promise<TeamActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (!canInviteMembers(membership)) {
    return { success: false, error: "You don't have permission to invite members" };
  }

  // Validate with Zod schema
  const parseResult = inviteMemberFormSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "member",
  });

  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0];
    return {
      success: false,
      error: firstError ?? "Validation failed",
      fieldErrors: fieldErrors as Record<string, string[]>,
    };
  }

  const { email, role } = parseResult.data;

  try {
    // Check if user exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      // Check if already a member
      const existingMembership = await getUserTenantMembership(
        existingUser.id,
        tenant.id
      );

      if (existingMembership) {
        return { success: false, error: "User is already a member" };
      }

      // Add directly if user exists
      await addUserToTenant({
        userId: existingUser.id,
        tenantId: tenant.id,
        role,
      });
    } else {
      // Create invitation
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await query(async (sql) => {
        return sql`
          INSERT INTO invitations (tenant_id, email, role, token, invited_by, expires_at)
          VALUES (${tenant.id}::uuid, ${email}, ${role}, ${token}, ${user.id}::uuid, ${expiresAt.toISOString()})
        `;
      });

      // Send invitation email
      const emailTemplate = invitationEmail({
        inviterName: user.name || user.email,
        tenantName: tenant.name,
        role,
        token,
      });

      const emailResult = await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      if (!emailResult.success) {
        logger.warn("Failed to send invitation email", { email, error: emailResult.error });
      }
    }

    revalidatePath(`/${tenantSlug}/settings/team`);
    return { success: true };
  } catch (error) {
    logger.error("Invite error", error);
    return { success: false, error: "Failed to send invitation" };
  }
}

/**
 * Remove a member from the team.
 */
export async function removeTeamMemberAction(
  tenantSlug: string,
  memberId: string
): Promise<TeamActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  // Get both memberships for policy check
  const actorMembership = await getUserTenantMembership(user.id, tenant.id);
  const targetMembership = await getUserTenantMembership(memberId, tenant.id);

  // Use policy for comprehensive permission check
  const permissionCheck = canRemoveSpecificMember(
    actorMembership,
    targetMembership,
    user.id
  );

  if (!permissionCheck.allowed) {
    return { success: false, error: permissionCheck.reason ?? "Permission denied" };
  }

  try {
    await removeUserFromTenant(memberId, tenant.id);
    revalidatePath(`/${tenantSlug}/settings/team`);
    return { success: true };
  } catch (error) {
    logger.error("Remove member error", error);
    return { success: false, error: "Failed to remove member" };
  }
}

/**
 * Update a member's role.
 */
export async function updateMemberRoleAction(
  tenantSlug: string,
  memberId: string,
  newRole: string
): Promise<TeamActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  // Validate role with Zod schema
  const roleResult = userRoleSchema.safeParse(newRole);
  if (!roleResult.success) {
    return { success: false, error: "Invalid role" };
  }
  const validatedRole = roleResult.data;

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  // Get memberships for policy check
  const actorMembership = await getUserTenantMembership(user.id, tenant.id);
  const targetMembership = await getUserTenantMembership(memberId, tenant.id);

  // Import and use the detailed policy check
  const { canChangeSpecificRole } = await import("../policies/team");
  const permissionCheck = canChangeSpecificRole(
    actorMembership,
    targetMembership,
    validatedRole,
    user.id
  );

  if (!permissionCheck.allowed) {
    return { success: false, error: permissionCheck.reason ?? "Permission denied" };
  }

  try {
    await query(async (sql) => {
      return sql`
        UPDATE tenant_users
        SET role = ${validatedRole}, updated_at = now()
        WHERE tenant_id = ${tenant.id}::uuid AND user_id = ${memberId}::uuid
      `;
    });

    revalidatePath(`/${tenantSlug}/settings/team`);
    return { success: true };
  } catch (error) {
    logger.error("Update role error", error);
    return { success: false, error: "Failed to update role" };
  }
}
