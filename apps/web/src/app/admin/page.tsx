import { query } from "@/lib/db";
import { Card } from "@workspace/design-system";

// Force dynamic rendering - admin pages require database access
export const dynamic = "force-dynamic";

/**
 * Admin dashboard page.
 *
 * Pattern: Overview stats for super-admin.
 */

interface Stats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalApiKeys: number;
}

async function getStats(): Promise<Stats> {
  const [tenantsResult, usersResult, apiKeysResult] = await Promise.all([
    query(async (sql) => {
      return sql`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'active')::int as active
        FROM tenants
      `;
    }),
    query(async (sql) => {
      return sql`SELECT COUNT(*)::int as count FROM users`;
    }),
    query(async (sql) => {
      return sql`SELECT COUNT(*)::int as count FROM api_keys`;
    }),
  ]);

  return {
    totalTenants: (tenantsResult[0]?.total as number) ?? 0,
    activeTenants: (tenantsResult[0]?.active as number) ?? 0,
    totalUsers: (usersResult[0]?.count as number) ?? 0,
    totalApiKeys: (apiKeysResult[0]?.count as number) ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Platform overview and management
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-muted-foreground">Total Tenants</p>
          <p className="text-3xl font-bold mt-2">{stats.totalTenants}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Active Tenants</p>
          <p className="text-3xl font-bold mt-2">{stats.activeTenants}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">API Keys</p>
          <p className="text-3xl font-bold mt-2">{stats.totalApiKeys}</p>
        </Card>
      </div>
    </div>
  );
}
