/**
 * Session management.
 *
 * Pattern: Server-side session handling with Neon Auth.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig } from "./config";
import { upsertUserFromAuth, type User } from "../db/users";

export interface Session {
  userId: string;
  email: string;
  expiresAt: Date;
}

export interface AuthUser extends User {
  // Extended user with session info
}

/**
 * Get current session from cookies.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authConfig.sessionCookieName)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    // Validate session with Neon Auth
    const response = await fetch(`${authConfig.baseUrl}/get-session`, {
      headers: {
        Cookie: `${authConfig.sessionCookieName}=${sessionToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.session || !data.user) {
      return null;
    }

    return {
      userId: data.user.id,
      email: data.user.email,
      expiresAt: new Date(data.session.expiresAt),
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

/**
 * Get current authenticated user.
 * Returns null if not authenticated.
 * Syncs user data from Neon Auth to our users table.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authConfig.sessionCookieName)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    // Get session and user from Neon Auth
    const response = await fetch(`${authConfig.baseUrl}/get-session`, {
      headers: {
        Cookie: `${authConfig.sessionCookieName}=${sessionToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.session || !data.user) {
      return null;
    }

    // Sync user to our database
    const user = await upsertUserFromAuth({
      authSubjectId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      avatarUrl: data.user.image,
      emailVerified: data.user.emailVerified,
    });

    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

/**
 * Require authentication.
 * Redirects to login if not authenticated.
 * Use in Server Components.
 */
export async function requireAuth(redirectTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_APP_URL);
    if (redirectTo) {
      loginUrl.searchParams.set("redirect", redirectTo);
    }
    redirect(loginUrl.pathname + loginUrl.search);
  }

  return user;
}

/**
 * Check if user has access to tenant.
 */
export async function requireTenantAccess(
  user: AuthUser,
  tenantId: string
): Promise<void> {
  const { getUserTenantMembership } = await import("../db/users");
  const membership = await getUserTenantMembership(user.id, tenantId);

  if (!membership) {
    redirect("/");
  }
}
