/**
 * User database queries.
 *
 * Pattern: All user-related DB operations go here.
 *
 * Note: Local types match SQL schema. Will be replaced with @axis/db
 * imports once Drizzle schema is synced with `drizzle-kit introspect`.
 */

import { query } from "./index";
import { userRoleSchema } from "@axis/db/validation";
import { type UserRole } from "@axis/db/schema";

// Re-export role schema for validation
export { userRoleSchema, type UserRole };

/**
 * User type matching the SQL schema.
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  authSubjectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tenant membership type.
 */
export interface TenantMembership {
  tenantId: string;
  userId: string;
  role: UserRole;
  acceptedAt: Date | null;
  createdAt: Date;
}

/**
 * Find user by email.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query(async (sql) => {
    return sql`
      SELECT id, email, name, avatar_url, email_verified, auth_subject_id, created_at, updated_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
  });

  const row = result[0];
  if (!row) {
    return null;
  }

  return mapRowToUser(row);
}

/**
 * Find user by Neon Auth subject ID.
 */
export async function findUserByAuthSubject(authSubjectId: string): Promise<User | null> {
  const result = await query(async (sql) => {
    return sql`
      SELECT id, email, name, avatar_url, email_verified, auth_subject_id, created_at, updated_at
      FROM users
      WHERE auth_subject_id = ${authSubjectId}
      LIMIT 1
    `;
  });

  const row = result[0];
  if (!row) {
    return null;
  }

  return mapRowToUser(row);
}

/**
 * Find user by ID.
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await query(async (sql) => {
    return sql`
      SELECT id, email, name, avatar_url, email_verified, auth_subject_id, created_at, updated_at
      FROM users
      WHERE id = ${id}::uuid
      LIMIT 1
    `;
  });

  const row = result[0];
  if (!row) {
    return null;
  }

  return mapRowToUser(row);
}

/**
 * Create or update user from Neon Auth.
 * Upserts based on auth_subject_id.
 */
export async function upsertUserFromAuth(data: {
  authSubjectId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}): Promise<User> {
  const result = await query(async (sql) => {
    return sql`
      INSERT INTO users (auth_subject_id, email, name, avatar_url, email_verified)
      VALUES (${data.authSubjectId}, ${data.email}, ${data.name ?? null}, ${data.avatarUrl ?? null}, ${data.emailVerified ?? false})
      ON CONFLICT (auth_subject_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        email_verified = EXCLUDED.email_verified,
        updated_at = now()
      RETURNING id, email, name, avatar_url, email_verified, auth_subject_id, created_at, updated_at
    `;
  });

  const row = result[0];
  if (!row) {
    throw new Error("Failed to upsert user");
  }
  return mapRowToUser(row);
}

/**
 * Get user's membership in a tenant.
 */
export async function getUserTenantMembership(
  userId: string,
  tenantId: string
): Promise<TenantMembership | null> {
  const result = await query(async (sql) => {
    return sql`
      SELECT tenant_id, user_id, role, accepted_at, created_at
      FROM tenant_users
      WHERE user_id = ${userId}::uuid AND tenant_id = ${tenantId}::uuid
      LIMIT 1
    `;
  });

  const row = result[0];
  if (!row) {
    return null;
  }

  return {
    tenantId: row.tenant_id as string,
    userId: row.user_id as string,
    role: row.role as TenantMembership["role"],
    acceptedAt: row.accepted_at ? new Date(row.accepted_at as string) : null,
    createdAt: new Date(row.created_at as string),
  };
}

/**
 * Add user to tenant.
 */
export async function addUserToTenant(data: {
  userId: string;
  tenantId: string;
  role: TenantMembership["role"];
}): Promise<TenantMembership> {
  const result = await query(async (sql) => {
    return sql`
      INSERT INTO tenant_users (user_id, tenant_id, role, accepted_at)
      VALUES (${data.userId}::uuid, ${data.tenantId}::uuid, ${data.role}, now())
      ON CONFLICT (tenant_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = now()
      RETURNING tenant_id, user_id, role, accepted_at, created_at
    `;
  });

  const row = result[0];
  if (!row) {
    throw new Error("Failed to add user to tenant");
  }
  return {
    tenantId: row.tenant_id as string,
    userId: row.user_id as string,
    role: row.role as TenantMembership["role"],
    acceptedAt: row.accepted_at ? new Date(row.accepted_at as string) : null,
    createdAt: new Date(row.created_at as string),
  };
}

/**
 * Get all members of a tenant.
 */
export async function getTenantMembers(tenantId: string): Promise<
  Array<{
    user: User;
    membership: TenantMembership;
  }>
> {
  const result = await query(async (sql) => {
    return sql`
      SELECT
        u.id, u.email, u.name, u.avatar_url, u.email_verified, u.auth_subject_id, u.created_at, u.updated_at,
        tu.tenant_id, tu.user_id, tu.role, tu.accepted_at, tu.created_at as membership_created_at
      FROM tenant_users tu
      JOIN users u ON u.id = tu.user_id
      WHERE tu.tenant_id = ${tenantId}::uuid
      ORDER BY tu.created_at ASC
    `;
  });

  return result.map((row) => ({
    user: mapRowToUser(row),
    membership: {
      tenantId: row.tenant_id as string,
      userId: row.user_id as string,
      role: row.role as TenantMembership["role"],
      acceptedAt: row.accepted_at ? new Date(row.accepted_at as string) : null,
      createdAt: new Date(row.membership_created_at as string),
    },
  }));
}

/**
 * Get user's tenants.
 */
export async function getUserTenants(userId: string): Promise<
  Array<{
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    role: TenantMembership["role"];
  }>
> {
  const result = await query(async (sql) => {
    return sql`
      SELECT t.id, t.slug, t.name, tu.role
      FROM tenant_users tu
      JOIN tenants t ON t.id = tu.tenant_id
      WHERE tu.user_id = ${userId}::uuid AND t.status = 'active'
      ORDER BY tu.created_at ASC
    `;
  });

  return result.map((row) => ({
    tenantId: row.id as string,
    tenantSlug: row.slug as string,
    tenantName: row.name as string,
    role: row.role as TenantMembership["role"],
  }));
}

/**
 * Remove user from tenant.
 */
export async function removeUserFromTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  const result = await query(async (sql) => {
    return sql`
      DELETE FROM tenant_users
      WHERE user_id = ${userId}::uuid AND tenant_id = ${tenantId}::uuid
      RETURNING 1
    `;
  });

  return result.length > 0;
}

// Helper to map DB row to User type
function mapRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string | null,
    avatarUrl: row.avatar_url as string | null,
    emailVerified: row.email_verified as boolean,
    authSubjectId: row.auth_subject_id as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}
