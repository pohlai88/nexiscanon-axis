"use server";

/**
 * Tenant server actions.
 *
 * Pattern: Server actions for tenant operations.
 * Uses Zod schemas from @axis/db for validation.
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth/session";
import { createTenant, createTeam, isSlugAvailable, findTenantBySlug, findTenantById } from "../db/tenants";
import { addUserToTenant, getUserTenantMembership } from "../db/users";
import { query } from "../db";
import { logAuditEvent } from "../db/audit";
import { createTenantFormSchema, createTeamFormSchema } from "@axis/db/validation";
import { logger } from "../logger";

export interface TenantActionResult {
  success: boolean;
  error?: string;
  tenantSlug?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Create a new tenant/organization or personal workspace.
 */
export async function createTenantAction(
  _prevState: TenantActionResult,
  formData: FormData
): Promise<TenantActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  // Extract and prepare form data
  const rawName = formData.get("name") as string;
  const rawType = formData.get("type") as string;
  let slug = formData.get("slug") as string;

  // Validate type
  const type = rawType === "personal" ? "personal" : "organization";

  // Generate slug from name if not provided
  if (!slug && rawName) {
    slug = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 63);
  }

  // Validate with Zod schema
  const parseResult = createTenantFormSchema.safeParse({
    name: rawName,
    slug,
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

  const { name, slug: validatedSlug } = parseResult.data;

  // Check availability
  const available = await isSlugAvailable(validatedSlug);
  if (!available) {
    return { success: false, error: "This URL is already taken" };
  }

  try {
    // Create tenant with validated data and type
    const tenant = await createTenant({
      slug: validatedSlug,
      name,
      type,
    });

    // Add user as owner
    await addUserToTenant({
      userId: user.id,
      tenantId: tenant.id,
      role: "owner",
    });

    return {
      success: true,
      tenantSlug: tenant.slug,
    };
  } catch (error) {
    logger.error("Create tenant error", error);
    return {
      success: false,
      error: type === "personal" ? "Failed to create personal workspace" : "Failed to create organization",
    };
  }
}

/**
 * Update tenant name.
 * Only owners can update.
 */
export async function updateTenantNameAction(
  tenantSlug: string,
  newName: string
): Promise<TenantActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  if (!newName.trim()) {
    return { success: false, error: "Name is required" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  // Only owner can update name
  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (membership?.role !== "owner") {
    return { success: false, error: "Only the owner can update workspace settings" };
  }

  try {
    await query(async (sql) => {
      return sql`
        UPDATE tenants
        SET name = ${newName.trim()}, updated_at = now()
        WHERE id = ${tenant.id}::uuid
      `;
    });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "tenant.update",
      resourceType: "tenant",
      resourceId: tenant.id,
      metadata: { field: "name", oldValue: tenant.name, newValue: newName.trim() },
    });

    return { success: true };
  } catch (error) {
    logger.error("Update tenant name error", error);
    return { success: false, error: "Failed to update workspace name" };
  }
}

/**
 * Update tenant branding.
 * Only owners can update.
 */
export async function updateTenantBrandingAction(
  tenantSlug: string,
  branding: {
    emoji?: string;
    description?: string;
    brandColor?: string;
    logo?: string;
  }
): Promise<TenantActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  // Only owner can update branding
  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (membership?.role !== "owner") {
    return { success: false, error: "Only the owner can update branding" };
  }

  try {
    // Merge with existing branding
    const existingSettings = tenant.settings as Record<string, unknown> | null;
    const existingBranding = existingSettings?.branding as Record<string, unknown> | undefined;
    const updatedBranding = {
      ...existingBranding,
      ...branding,
    };

    await query(async (sql) => {
      return sql`
        UPDATE tenants
        SET settings = jsonb_set(
          COALESCE(settings, '{}'::jsonb),
          '{branding}',
          ${JSON.stringify(updatedBranding)}::jsonb
        ),
        updated_at = now()
        WHERE id = ${tenant.id}::uuid
      `;
    });

    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "tenant.branding_update",
      resourceType: "tenant",
      resourceId: tenant.id,
      metadata: { branding: updatedBranding },
    });

    return { success: true };
  } catch (error) {
    logger.error("Update tenant branding error", error);
    return { success: false, error: "Failed to update branding" };
  }
}

/**
 * Generate slug from organization name.
 */
export async function generateSlugAction(name: string): Promise<{
  slug: string;
  available: boolean;
}> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);

  if (!slug) {
    return { slug: "", available: false };
  }

  const available = await isSlugAvailable(slug);
  return { slug, available };
}

/**
 * Delete a tenant/organization.
 * Only owners can delete. Uses soft delete (status = 'deleted').
 */
export async function deleteTenantAction(
  tenantSlug: string,
  confirmationSlug: string
): Promise<TenantActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  // Verify confirmation matches
  if (confirmationSlug !== tenantSlug) {
    return { success: false, error: "Confirmation does not match workspace URL" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  // Only owner can delete
  const membership = await getUserTenantMembership(user.id, tenant.id);
  if (membership?.role !== "owner") {
    return { success: false, error: "Only the owner can delete this workspace" };
  }

  try {
    // Soft delete - set status to 'deleted'
    await query(async (sql) => {
      return sql`
        UPDATE tenants
        SET status = 'deleted', updated_at = now()
        WHERE id = ${tenant.id}::uuid
      `;
    });

    // Log the deletion
    await logAuditEvent({
      tenantId: tenant.id,
      userId: user.id,
      action: "tenant.deleted",
      resourceType: "tenant",
      resourceId: tenant.id,
      metadata: { tenantName: tenant.name, tenantSlug: tenant.slug },
    });

    // Redirect to home after deletion
    redirect("/");
  } catch (error) {
    // redirect() throws, so check if it's that
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    logger.error("Delete tenant error", error);
    return { success: false, error: "Failed to delete workspace" };
  }
}

/**
 * Create a team within an organization.
 * Only owners/admins of the parent org can create teams.
 */
export async function createTeamAction(
  _prevState: TenantActionResult,
  formData: FormData
): Promise<TenantActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const rawName = formData.get("name") as string;
  const parentId = formData.get("parentId") as string;
  let slug = formData.get("slug") as string;

  // Generate slug from name if not provided
  if (!slug && rawName) {
    slug = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 63);
  }

  // Validate parent org exists and user has permission
  const parentOrg = await findTenantById(parentId);
  if (!parentOrg || parentOrg.type !== "organization") {
    return { success: false, error: "Parent organization not found" };
  }

  const membership = await getUserTenantMembership(user.id, parentId);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "Only owners and admins can create teams" };
  }

  // Validate with Zod schema
  const parseResult = createTeamFormSchema.safeParse({
    name: rawName,
    slug,
    parentId,
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

  const { name, slug: validatedSlug } = parseResult.data;

  // Check availability
  const available = await isSlugAvailable(validatedSlug);
  if (!available) {
    return { success: false, error: "This URL is already taken" };
  }

  try {
    const team = await createTeam({
      slug: validatedSlug,
      name,
      parentId,
    });

    // Add user as owner of the team
    await addUserToTenant({
      userId: user.id,
      tenantId: team.id,
      role: "owner",
    });

    // Log audit event
    await logAuditEvent({
      tenantId: parentId,
      userId: user.id,
      action: "team.created",
      resourceType: "tenant",
      resourceId: team.id,
      metadata: { teamName: team.name, teamSlug: team.slug },
    });

    return {
      success: true,
      tenantSlug: team.slug,
    };
  } catch (error) {
    logger.error("Create team error", error);
    return {
      success: false,
      error: "Failed to create team",
    };
  }
}

/**
 * Delete a team.
 * Only owners of the team or parent org can delete.
 */
export async function deleteTeamAction(
  teamSlug: string,
  confirmationSlug: string
): Promise<TenantActionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  if (confirmationSlug !== teamSlug) {
    return { success: false, error: "Confirmation does not match team URL" };
  }

  const team = await findTenantBySlug(teamSlug);
  if (!team || team.type !== "team") {
    return { success: false, error: "Team not found" };
  }

  // Check if user is owner of team or parent org
  const teamMembership = await getUserTenantMembership(user.id, team.id);
  const parentMembership = team.parentId
    ? await getUserTenantMembership(user.id, team.parentId)
    : null;

  const canDelete =
    teamMembership?.role === "owner" || parentMembership?.role === "owner";

  if (!canDelete) {
    return { success: false, error: "Only the owner can delete this team" };
  }

  try {
    // Soft delete
    await query(async (sql) => {
      return sql`
        UPDATE tenants
        SET status = 'deleted', updated_at = now()
        WHERE id = ${team.id}::uuid
      `;
    });

    // Log deletion
    await logAuditEvent({
      tenantId: team.parentId ?? team.id,
      userId: user.id,
      action: "team.deleted",
      resourceType: "tenant",
      resourceId: team.id,
      metadata: { teamName: team.name, teamSlug: team.slug },
    });

    // Redirect to parent org or home
    if (team.parentId) {
      const parentOrg = await findTenantById(team.parentId);
      if (parentOrg) {
        redirect(`/${parentOrg.slug}`);
      }
    }
    redirect("/");
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    logger.error("Delete team error", error);
    return { success: false, error: "Failed to delete team" };
  }
}
