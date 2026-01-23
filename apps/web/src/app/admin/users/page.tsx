import { listUsers } from "@/lib/db/users";
import { query } from "@/lib/db";

// Force dynamic rendering - requires database access
export const dynamic = "force-dynamic";

/**
 * Admin users list page.
 *
 * Pattern: User management for super-admin.
 * Consistent with /admin/tenants page structure.
 */

export default async function AdminUsersPage() {
  const { users, total } = await listUsers({ limit: 100 });

  // Get tenant counts for each user
  const userTenantCounts = await Promise.all(
    users.map(async (user) => {
      const result = await query(async (sql) => {
        return sql`
          SELECT COUNT(*)::int as count
          FROM tenant_users
          WHERE user_id = ${user.id}::uuid
        `;
      });
      return { userId: user.id, count: (result[0]?.count as number) ?? 0 };
    })
  );

  const tenantCountMap = new Map(
    userTenantCounts.map((item) => [item.userId, item.count])
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">{total} total users</p>
        </div>
      </div>

      <div className="bg-muted rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Verified</th>
              <th className="text-left p-4 font-medium">Tenants</th>
              <th className="text-left p-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {user.name?.[0]?.toUpperCase() ??
                        user.email[0]?.toUpperCase() ??
                        "U"}
                    </div>
                    <span className="font-medium">
                      {user.name ?? user.email.split("@")[0]}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {user.email}
                  </code>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.emailVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  {tenantCountMap.get(user.id) ?? 0}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No users yet.
          </div>
        )}
      </div>
    </div>
  );
}
