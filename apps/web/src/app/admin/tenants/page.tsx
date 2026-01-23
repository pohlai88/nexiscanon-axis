import Link from "next/link";
import { listTenants } from "@/lib/db/tenants";

// Force dynamic rendering - requires database access
export const dynamic = "force-dynamic";

/**
 * Admin tenants list page.
 *
 * Pattern: Tenant management for super-admin.
 * @see https://github.com/vercel/platforms (admin pattern)
 */

export default async function AdminTenantsPage() {
  const { tenants, total } = await listTenants({ limit: 100 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tenants</h1>
          <p className="text-muted-foreground">
            {total} total tenants
          </p>
        </div>
      </div>

      <div className="bg-muted rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium">Tenant</th>
              <th className="text-left p-4 font-medium">Slug</th>
              <th className="text-left p-4 font-medium">Plan</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Created</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b border-border last:border-0"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {(() => {
                        const settings = tenant.settings as Record<string, unknown> | null;
                        const branding = settings?.branding as Record<string, unknown> | undefined;
                        return String(branding?.emoji ?? "🏢");
                      })()}
                    </span>
                    <span className="font-medium">{tenant.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {tenant.slug}
                  </code>
                </td>
                <td className="p-4">
                  <span className="capitalize">{tenant.plan}</span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.status === "active"
                        ? "bg-green-100 text-green-700"
                        : tenant.status === "suspended"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tenant.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {tenant.createdAt.toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/${tenant.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tenants.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No tenants yet.
          </div>
        )}
      </div>
    </div>
  );
}
