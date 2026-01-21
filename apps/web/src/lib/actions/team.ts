"use server";

/**
 * Team management server actions.
 *
 * Pattern: Server actions for team operations.
 * Uses Zod schemas from @axis/db for validation.
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

export interface TeamActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Check if user can manage team.
 */
async function canManageTeam(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const membership = await getUserTenantMembership(userId, tenantId);
  return membership?.role === "owner" || membership?.role === "admin";
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

  const canManage = await canManageTeam(user.id, tenant.id);
  if (!canManage) {
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
        console.warn(`Failed to send invitation email to ${email}:`, emailResult.error);
      }
    }

    revalidatePath(`/${tenantSlug}/settings/team`);
    return { success: true };
  } catch (error) {
    console.error("Invite error:", error);
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

  const canManage = await canManageTeam(user.id, tenant.id);
  if (!canManage) {
    return { success: false, error: "You don't have permission to remove members" };
  }

  // Can't remove yourself
  if (memberId === user.id) {
    return { success: false, error: "You cannot remove yourself" };
  }

  // Check target user's role
  const targetMembership = await getUserTenantMembership(memberId, tenant.id);
  if (!targetMembership) {
    return { success: false, error: "User is not a member" };
  }

  // Can't remove owner
  if (targetMembership.role === "owner") {
    return { success: false, error: "Cannot remove the owner" };
  }

  try {
    await removeUserFromTenant(memberId, tenant.id);
    revalidatePath(`/${tenantSlug}/settings/team`);
    return { success: true };
  } catch (error) {
    console.error("Remove member error:", error);
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

  // Only owner can change roles
  const userMembership = await getUserTenantMembership(user.id, tenant.id);
  if (userMembership?.role !== "owner") {
    return { success: false, error: "Only the owner can change roles" };
  }

  // Can't change own role
  if (memberId === user.id) {
    return { success: false, error: "You cannot change your own role" };
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
    console.error("Update role error:", error);
    return { success: false, error: "Failed to update role" };
  }
}
