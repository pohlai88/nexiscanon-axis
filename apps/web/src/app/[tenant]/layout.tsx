import Link from "next/link";
import { notFound } from "next/navigation";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenants, getUserTenantMembership } from "@/lib/db/users";
import { signOutAction } from "@/lib/actions/auth";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { CommandPalette, CommandPaletteTrigger } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-provider";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { tenantMenuItems } from "./menu-items";

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
    type: t.tenantType,
    parentId: t.tenantParentId,
  }));

  const currentWorkspace = {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    role: currentMembership?.role ?? "member",
    type: tenant.type,
    parentId: tenant.parentId,
  };

  // Convert menu items to nav sections format with resolved hrefs
  const navSections = tenantMenuItems.map((section) => ({
    label: section.label,
    items: section.items.map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href(slug),
    })),
  }));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Mobile responsive */}
      <MobileSidebar>
        {/* Workspace Switcher */}
        <div className="border-b border-border">
          <WorkspaceSwitcher
            currentWorkspace={currentWorkspace}
            workspaces={workspaces}
          />
        </div>

        <SidebarNav sections={navSections} variant="light" />

        {/* User section */}
        {user && (
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name ?? user.email.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        )}
      </MobileSidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with search */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-8">
          {/* Spacer for mobile hamburger */}
          <div className="w-10 lg:hidden" />
          <CommandPaletteTrigger />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/account"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 px-2 hidden sm:block"
            >
              Account
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>

      {/* Command palette */}
      <CommandPalette tenantSlug={slug} />
    </div>
  );
}
