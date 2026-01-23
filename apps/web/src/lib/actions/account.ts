"use server";

/**
 * Account management server actions.
 * 
 * Pattern: Server actions for user account operations.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth/session";
import { authConfig } from "../auth/config";
import { query } from "../db";
import { logger } from "../logger";

export interface AccountActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update user profile.
 */
export async function updateProfileAction(data: {
  name: string | null;
}): Promise<AccountActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  try {
    await query(async (sql) => {
      return sql`
        UPDATE users
        SET name = ${data.name}, updated_at = now()
        WHERE id = ${user.id}::uuid
      `;
    });

    return { success: true };
  } catch (error) {
    logger.error("Update profile error", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Change password.
 */
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<AccountActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  try {
    // Call Neon Auth to change password
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(authConfig.sessionCookieName)?.value;

    const response = await fetch(`${authConfig.baseUrl}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${authConfig.sessionCookieName}=${sessionToken}`,
      },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message ?? "Current password is incorrect",
      };
    }

    return { success: true };
  } catch (error) {
    logger.error("Change password error", error);
    return { success: false, error: "Failed to change password" };
  }
}

/**
 * Delete user account.
 */
/**
 * Request password reset.
 */
export async function requestPasswordResetAction(
  email: string
): Promise<AccountActionResult> {
  try {
    const response = await fetch(`${authConfig.baseUrl}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // Always return success to prevent email enumeration
    if (!response.ok) {
      // Log but don't expose error to user
      logger.error("Password reset request failed", { status: response.status });
    }

    return { success: true };
  } catch (error) {
    logger.error("Request password reset error", error);
    return { success: true }; // Still return success to prevent enumeration
  }
}

/**
 * Reset password with token.
 */
export async function resetPasswordAction(data: {
  token: string;
  newPassword: string;
}): Promise<AccountActionResult> {
  try {
    const response = await fetch(`${authConfig.baseUrl}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: data.token,
        newPassword: data.newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message ?? "Invalid or expired reset token",
      };
    }

    return { success: true };
  } catch (error) {
    logger.error("Reset password error", error);
    return { success: false, error: "Failed to reset password" };
  }
}

/**
 * Delete user account.
 */
export async function deleteAccountAction(): Promise<AccountActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in" };
  }

  try {
    // Check if user is owner of any tenants
    const ownedTenants = await query(async (sql) => {
      return sql`
        SELECT tenant_id FROM tenant_users
        WHERE user_id = ${user.id}::uuid AND role = 'owner'
      `;
    });

    if (ownedTenants.length > 0) {
      return {
        success: false,
        error: "You must transfer ownership of your organizations before deleting your account",
      };
    }

    // Remove from all tenants
    await query(async (sql) => {
      return sql`
        DELETE FROM tenant_users
        WHERE user_id = ${user.id}::uuid
      `;
    });

    // Delete user record
    await query(async (sql) => {
      return sql`
        DELETE FROM users
        WHERE id = ${user.id}::uuid
      `;
    });

    // Clear session
    const cookieStore = await cookies();
    cookieStore.delete(authConfig.sessionCookieName);

    redirect("/");
  } catch (error) {
    logger.error("Delete account error", error);
    return { success: false, error: "Failed to delete account" };
  }
}
