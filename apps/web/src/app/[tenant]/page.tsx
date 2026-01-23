import { findTenantBySlug } from "@/lib/db/tenants";
import { getTenantMembers } from "@/lib/db/users";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { ActivityFeed } from "@/components/activity-feed";
import { Card, CardHeader, CardContent } from "@workspace/design-system";

interface TenantDashboardProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantDashboard({ params }: TenantDashboardProps) {
  const { tenant: slug } = await params;

  const [tenant, user] = await Promise.all([
    findTenantBySlug(slug),
    getCurrentUser(),
  ]);

  if (!tenant) {
    return null; // Layout handles 404
  }

  // Fetch members and recent activity in parallel
  const [members, recentActivity] = await Promise.all([
    getTenantMembers(tenant.id),
    query(async (sql) => {
      return sql`
        SELECT
          al.id, al.action, al.resource_type, al.created_at,
          u.name as actor_name, u.email as actor_email
        FROM audit_logs al
        LEFT JOIN users u ON u.id = al.user_id
        WHERE al.tenant_id = ${tenant.id}::uuid
        ORDER BY al.created_at DESC
        LIMIT 10
      `;
    }),
  ]);

  const activities = recentActivity.map((row) => ({
    id: row.id as string,
    action: row.action as string,
    actorName: row.actor_name as string | null,
    actorEmail: row.actor_email as string,
    resourceType: row.resource_type as string | undefined,
    createdAt: new Date(row.created_at as string),
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back{user?.name ? `, ${user.name}` : ""}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-muted-foreground">Team Members</p>
          <p className="text-3xl font-bold mt-2">{members.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-3xl font-bold mt-2 capitalize">{tenant.status}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="text-3xl font-bold mt-2 capitalize">{tenant.plan}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent className="grid gap-4">
            <a
              href={`/${slug}/settings/team`}
              className="p-4 bg-background rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="font-medium">Manage Team</h3>
              <p className="text-sm text-muted-foreground">
                Invite members and manage roles
              </p>
            </a>
            <a
              href={`/${slug}/settings`}
              className="p-4 bg-background rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="font-medium">Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your workspace
              </p>
            </a>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader
            title="Recent Activity"
            action={
              <a
                href={`/${slug}/settings/audit-log`}
                className="text-sm text-primary hover:underline"
              >
                View all
              </a>
            }
          />
          <CardContent>
            <ActivityFeed
              activities={activities}
              emptyMessage="No recent activity in this workspace"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
