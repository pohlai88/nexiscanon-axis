import Link from "next/link";
import { notFound } from "next/navigation";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenants, getUserTenantMembership } from "@/lib/db/users";
import { signOutAction } from "@/lib/actions/auth";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { CommandPalette, CommandPaletteTrigger } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-provider";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { tenant: slug } = await params;

  // Fetch tenant and user in parallel
  const [tenant, user] = await Promise.all([
    findTenantBySlug(slug),
    getCurrentUser(),
  ]);

  // 404 if tenant not found
  if (!tenant) {
    notFound();
  }

  // Get user's workspaces for switcher
  const userTenants = user ? await getUserTenants(user.id) : [];
  const currentMembership = user ? await getUserTenantMembership(user.id, tenant.id) : null;

  const workspaces = userTenants.map((t) => ({
    id: t.tenantId,
    slug: t.tenantSlug,
    name: t.tenantName,
    role: t.role,
  }));

  const currentWorkspace = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    role: currentMembership?.role ?? "member",
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col">
        {/* Workspace Switcher */}
        <div className="border-b border-[var(--border)]">
          <WorkspaceSwitcher
            currentWorkspace={currentWorkspace}
            workspaces={workspaces}
          />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href={`/${slug}`}
            className="block px-4 py-2 rounded-lg hover:bg-[var(--background)] transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            href={`/${slug}/settings`}
            className="block px-4 py-2 rounded-lg hover:bg-[var(--background)] transition-colors duration-200"
          >
            Settings
          </Link>
          <Link
            href={`/${slug}/settings/team`}
            className="block px-4 py-2 rounded-lg hover:bg-[var(--background)] transition-colors duration-200"
          >
            Team
          </Link>
          <Link
            href={`/${slug}/settings/billing`}
            className="block px-4 py-2 rounded-lg hover:bg-[var(--background)] transition-colors duration-200"
          >
            Billing
          </Link>
          <Link
            href={`/${slug}/settings/api-keys`}
            className="block px-4 py-2 rounded-lg hover:bg-[var(--background)] transition-colors duration-200"
          >
            API Keys
          </Link>
          <Link
            href={`/${slug}/settings/audit-log`}
            className="block px-4 py-2 rounded-lg hover:bg-[var(--background)] transition-colors duration-200"
          >
            Audit Log
          </Link>
        </nav>

        {/* User section */}
        {user && (
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-medium">
                {user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name ?? user.email.split("@")[0]}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full text-left px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with search */}
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-8">
          <CommandPaletteTrigger />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/account"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 px-2"
            >
              Account
            </Link>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* Command palette */}
      <CommandPalette tenantSlug={slug} />
    </div>
  );
}
