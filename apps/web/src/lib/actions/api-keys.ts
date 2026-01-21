"use server";

/**
 * API Key management server actions.
 *
 * Pattern: Server actions for API key operations.
 * Uses Zod schemas from @axis/db for validation.
 */

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/session";
import { findTenantBySlug } from "../db/tenants";
import { getUserTenantMembership } from "../db/users";
import { query } from "../db";
import { createApiKeyFormSchema } from "@axis/db/validation";

export interface ApiKeyActionResult {
  success: boolean;
  error?: string;
  key?: string;
}

/**
 * Hash an API key using SHA-256.
 * SHA-256 is appropriate for API keys because they are high-entropy random secrets.
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a random API key.
 */
async function generateApiKey(): Promise<{ key: string; prefix: string; hash: string }> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const key = `nxc_${Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("")}`;
  const prefix = key.slice(0, 10);
  const hash = await hashApiKey(key);
  return { key, prefix, hash };
}

/**
 * Validate an API key against stored hash.
 */
export async function validateApiKey(
  key: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashApiKey(key);
  return hash === storedHash;
}

/**
 * Check if user can manage API keys.
 */
async function canManageApiKeys(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const membership = await getUserTenantMembership(userId, tenantId);
  return membership?.role === "owner" || membership?.role === "admin";
}

/**
 * Create a new API key.
 */
export async function createApiKeyAction(
  tenantSlug: string,
  name: string
): Promise<ApiKeyActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  // Validate with Zod schema
  const parseResult = createApiKeyFormSchema.safeParse({ name });
  if (!parseResult.success) {
    const firstError = parseResult.error.flatten().fieldErrors.name?.[0];
    return { success: false, error: firstError ?? "Name is required" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  const canManage = await canManageApiKeys(user.id, tenant.id);
  if (!canManage) {
    return { success: false, error: "You don't have permission to create API keys" };
  }

  try {
    const { key, prefix, hash } = await generateApiKey();
    const validatedName = parseResult.data.name;

    await query(async (sql) => {
      return sql`
        INSERT INTO api_keys (tenant_id, user_id, name, key_hash, key_prefix)
        VALUES (${tenant.id}::uuid, ${user.id}::uuid, ${validatedName}, ${hash}, ${prefix})
      `;
    });

    revalidatePath(`/${tenantSlug}/settings/api-keys`);
    return { success: true, key };
  } catch (error) {
    console.error("Create API key error:", error);
    return { success: false, error: "Failed to create API key" };
  }
}

/**
 * Revoke an API key.
 */
export async function revokeApiKeyAction(
  tenantSlug: string,
  keyId: string
): Promise<ApiKeyActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant) {
    return { success: false, error: "Organization not found" };
  }

  const canManage = await canManageApiKeys(user.id, tenant.id);
  if (!canManage) {
    return { success: false, error: "You don't have permission to revoke API keys" };
  }

  try {
    await query(async (sql) => {
      return sql`
        DELETE FROM api_keys
        WHERE id = ${keyId}::uuid AND tenant_id = ${tenant.id}::uuid
      `;
    });

    revalidatePath(`/${tenantSlug}/settings/api-keys`);
    return { success: true };
  } catch (error) {
    console.error("Revoke API key error:", error);
    return { success: false, error: "Failed to revoke API key" };
  }
}
