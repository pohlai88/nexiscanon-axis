import { cookies, headers } from "next/headers";

/**
 * User session data.
 */
export interface Session {
  /** Session ID */
  id: string;

  /** User ID */
  userId: string;

  /** Tenant ID (if in tenant context) */
  tenantId: string | null;

  /** Session expiration */
  expiresAt: Date;
}

/**
 * Current user data.
 */
export interface User {
  /** User ID */
  id: string;

  /** User email */
  email: string;

  /** Display name */
  name: string | null;

  /** Avatar URL */
  avatarUrl: string | null;

  /** Email verified */
  emailVerified: boolean;
}

/**
 * Get current session from request.
 * Must be called from a Server Component or Route Handler.
 *
 * @returns Session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  // TODO: Validate session token with Neon Auth
  // TODO: Look up session in database

  // Stub: return null (not authenticated)
  return null;
}

/**
 * Get current user from session.
 * Must be called from a Server Component or Route Handler.
 *
 * @returns User or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // TODO: Look up user in database by session.userId

  // Stub: return null
  return null;
}

/**
 * Get tenant slug from request headers.
 * Set by middleware via x-tenant-slug header.
 */
export async function getTenantSlug(): Promise<string | null> {
  const headerStore = await headers();
  return headerStore.get("x-tenant-slug");
}
