import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenants } from "@/lib/db/users";
import { Card } from "@workspace/design-system";

// Force dynamic rendering - requires auth + database access
export const dynamic = "force-dynamic";

/**
 * User personal dashboard.
 *
 * Pattern: Landing page after login, before selecting a workspace.
 * Shows quick access to workspaces and personal overview.
 */

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tenants = await getUserTenants(user.id);

  // Group workspaces by type
  const organizations = tenants.filter((t) => t.tenantType === "organization");
  const teams = tenants.filter((t) => t.tenantType === "team");
  const personal = tenants.filter((t) => t.tenantType === "personal");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-muted">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user.name ?? user.email.split("@")[0]}
            </h1>
            <p className="text-muted-foreground">
              Your personal dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Account Settings
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-8 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <p className="text-sm text-muted-foreground">
              Organizations
            </p>
            <p className="text-3xl font-bold mt-2">{organizations.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">Teams</p>
            <p className="text-3xl font-bold mt-2">{teams.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted-foreground">
              Personal Workspaces
            </p>
            <p className="text-3xl font-bold mt-2">{personal.length}</p>
          </Card>
        </div>

        {/* Workspaces */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Workspaces</h2>
            <Link
              href="/onboarding"
              className="text-sm text-primary hover:underline"
            >
              + Create New
            </Link>
          </div>

          {tenants.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You don't have any workspaces yet.
                </p>
                <Link
                  href="/onboarding"
                  className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200"
                >
                  Create Your First Workspace
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map((tenant) => (
                <Link
                  key={tenant.tenantId}
                  href={`/${tenant.tenantSlug}`}
                  className="block"
                >
                  <Card>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {getWorkspaceIcon(tenant.tenantType)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {tenant.tenantName}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {tenant.tenantType} · {tenant.role}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="px-4 py-2 bg-muted rounded-lg hover:bg-border transition-colors duration-200 text-sm"
            >
              Create Organization
            </Link>
            <Link
              href="/account"
              className="px-4 py-2 bg-muted rounded-lg hover:bg-border transition-colors duration-200 text-sm"
            >
              Edit Profile
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function getWorkspaceIcon(type: string | null): string {
  switch (type) {
    case "organization":
      return "🏢";
    case "team":
      return "👥";
    case "personal":
      return "👤";
    default:
      return "📁";
  }
}
