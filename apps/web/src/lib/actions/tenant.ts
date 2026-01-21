"use server";

/**
 * Tenant server actions.
 *
 * Pattern: Server actions for tenant operations.
 * Uses Zod schemas from @axis/db for validation.
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth/session";
import { createTenant, isSlugAvailable, findTenantBySlug } from "../db/tenants";
import { addUserToTenant, getUserTenantMembership } from "../db/users";
import { query } from "../db";
import { logAuditEvent } from "../db/audit";
import { createTenantFormSchema } from "@axis/db/validation";

export interface TenantActionResult {
  success: boolean;
  error?: string;
  tenantSlug?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Create a new tenant/organization.
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
  let slug = formData.get("slug") as string;

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
    // Create tenant with validated data
    const tenant = await createTenant({ slug: validatedSlug, name });

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
    console.error("Create tenant error:", error);
    return {
      success: false,
      error: "Failed to create organization",
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
    console.error("Update tenant name error:", error);
    return { success: false, error: "Failed to update workspace name" };
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
    console.error("Delete tenant error:", error);
    return { success: false, error: "Failed to delete workspace" };
  }
}
