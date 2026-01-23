import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import Link from "next/link";
import { adminMenuItems } from "./menu-items";
import { SidebarNav } from "@/components/sidebar-nav";

// Force dynamic rendering - admin layout requires auth + database access
export const dynamic = "force-dynamic";

/**
 * Admin layout.
 *
 * Pattern: Super-admin interface for managing all tenants.
 * Access restricted to users with is_admin flag in settings.
 * Menu items driven by data config (menu-items.ts).
 *
 * @see https://github.com/vercel/platforms (admin pattern)
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Check if user is super-admin.
 */
async function isSuperAdmin(userId: string): Promise<boolean> {
  const result = await query(async (sql) => {
    return sql`
      SELECT settings->>'isAdmin' as is_admin
      FROM users
      WHERE id = ${userId}::uuid
      LIMIT 1
    `;
  });

  return result[0]?.is_admin === "true";
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const isAdmin = await isSuperAdmin(user.id);

  if (!isAdmin) {
    redirect("/");
  }

  // Convert menu items to nav sections format
  const navSections = adminMenuItems.map((section) => ({
    label: section.label,
    items: section.items.map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href,
    })),
  }));

  return (
    <div className="min-h-screen flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col">
        <div className="p-4 border-b border-zinc-700">
          <h1 className="text-lg font-bold">AXIS Admin</h1>
          <p className="text-xs text-zinc-400">Super Admin Panel</p>
        </div>

        <SidebarNav sections={navSections} variant="dark" />

        <div className="p-4 border-t border-zinc-700">
          <p className="text-sm text-zinc-400">{user.email}</p>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
          >
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  );
}
