/**
 * User query functions using Drizzle ORM.
 *
 * All queries return typed data from Drizzle schema.
 * Input validation uses Zod schemas from @axis/db/validation.
 */

import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../client/neon";
import {
  users,
  tenantUsers,
  type User,
  type TenantUser,
  type UserRole,
} from "../schema/user";
import { tenants } from "../schema/tenant";

// ============================================================================
// User Queries
// ============================================================================

/**
 * Find user by email.
 */
export async function findUserByEmail(
  db: Database,
  email: string
): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return result ?? null;
}

/**
 * Find user by ID.
 */
export async function findUserById(
  db: Database,
  id: string
): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result ?? null;
}

/**
 * Find user by Neon Auth subject ID.
 */
export async function findUserByAuthSubject(
  db: Database,
  authSubjectId: string
): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.authSubjectId, authSubjectId),
  });
  return result ?? null;
}

/**
 * Create or update user from Neon Auth (upsert).
 */
export async function upsertUserFromAuth(
  db: Database,
  data: {
    authSubjectId: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
    emailVerified?: boolean;
  }
): Promise<User> {
  const result = await db
    .insert(users)
    .values({
      authSubjectId: data.authSubjectId,
      email: data.email,
      name: data.name ?? null,
      avatarUrl: data.avatarUrl ?? null,
      emailVerified: data.emailVerified ?? false,
    })
    .onConflictDoUpdate({
      target: users.authSubjectId,
      set: {
        email: data.email,
        name: sql`COALESCE(${data.name ?? null}, ${users.name})`,
        avatarUrl: sql`COALESCE(${data.avatarUrl ?? null}, ${users.avatarUrl})`,
        emailVerified: data.emailVerified ?? false,
        updatedAt: new Date(),
      },
    })
    .returning();

  const user = result[0];
  if (!user) {
    throw new Error("Failed to upsert user");
  }

  return user;
}

/**
 * List all users with pagination (admin only).
 */
export async function listUsers(
  db: Database,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ users: User[]; total: number }> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const [usersResult, countResult] = await Promise.all([
    db.query.users.findMany({
      limit,
      offset,
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    }),
    db.select({ count: sql<number>`count(*)::int` }).from(users),
  ]);

  return {
    users: usersResult,
    total: countResult[0]?.count ?? 0,
  };
}

// ============================================================================
// Tenant Membership Queries
// ============================================================================

/**
 * Tenant membership with tenant info.
 */
export interface TenantMembership {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tenantType: "organization" | "team" | "personal";
  tenantParentId: string | null;
  role: UserRole;
}

/**
 * Get user's membership in a tenant.
 */
export async function getUserTenantMembership(
  db: Database,
  userId: string,
  tenantId: string
): Promise<TenantUser | null> {
  const result = await db.query.tenantUsers.findFirst({
    where: and(
      eq(tenantUsers.userId, userId),
      eq(tenantUsers.tenantId, tenantId)
    ),
  });
  return result ?? null;
}

/**
 * Get user's tenants with role.
 */
export async function getUserTenants(
  db: Database,
  userId: string
): Promise<TenantMembership[]> {
  const result = await db
    .select({
      tenantId: tenants.id,
      tenantSlug: tenants.slug,
      tenantName: tenants.name,
      tenantType: tenants.type,
      tenantParentId: tenants.parentId,
      role: tenantUsers.role,
    })
    .from(tenantUsers)
    .innerJoin(tenants, eq(tenants.id, tenantUsers.tenantId))
    .where(and(eq(tenantUsers.userId, userId), eq(tenants.status, "active")))
    .orderBy(tenants.type, tenantUsers.createdAt);

  return result as TenantMembership[];
}

/**
 * Get all members of a tenant.
 */
export async function getTenantMembers(
  db: Database,
  tenantId: string
): Promise<Array<{ user: User; membership: TenantUser }>> {
  const result = await db
    .select({
      user: users,
      membership: tenantUsers,
    })
    .from(tenantUsers)
    .innerJoin(users, eq(users.id, tenantUsers.userId))
    .where(eq(tenantUsers.tenantId, tenantId))
    .orderBy(tenantUsers.createdAt);

  return result;
}

/**
 * Add user to tenant.
 */
export async function addUserToTenant(
  db: Database,
  data: {
    userId: string;
    tenantId: string;
    role: UserRole;
  }
): Promise<TenantUser> {
  const result = await db
    .insert(tenantUsers)
    .values({
      userId: data.userId,
      tenantId: data.tenantId,
      role: data.role,
      acceptedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [tenantUsers.tenantId, tenantUsers.userId],
      set: {
        role: data.role,
        updatedAt: new Date(),
      },
    })
    .returning();

  const membership = result[0];
  if (!membership) {
    throw new Error("Failed to add user to tenant");
  }

  return membership;
}

/**
 * Remove user from tenant.
 */
export async function removeUserFromTenant(
  db: Database,
  userId: string,
  tenantId: string
): Promise<boolean> {
  const result = await db
    .delete(tenantUsers)
    .where(
      and(eq(tenantUsers.userId, userId), eq(tenantUsers.tenantId, tenantId))
    )
    .returning({ id: tenantUsers.userId });

  return result.length > 0;
}

/**
 * Get user's tenant count.
 */
export async function getUserTenantCount(
  db: Database,
  userId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tenantUsers)
    .where(eq(tenantUsers.userId, userId));

  return result[0]?.count ?? 0;
}

/**
 * Verify user has access to tenant.
 */
export async function verifyTenantAccess(
  db: Database,
  tenantId: string,
  userId: string
): Promise<{ hasAccess: boolean; role: UserRole | null }> {
  const membership = await getUserTenantMembership(db, userId, tenantId);

  if (!membership) {
    return { hasAccess: false, role: null };
  }

  return { hasAccess: true, role: membership.role as UserRole };
}
