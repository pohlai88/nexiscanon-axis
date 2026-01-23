import { notFound, redirect } from "next/navigation";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenantMembership } from "@/lib/db/users";
import { query } from "@/lib/db";
import { CreateKeyForm } from "./create-key-form";
import { ApiKeyRow } from "./api-key-row";

interface ApiKeysPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ApiKeysPage({ params }: ApiKeysPageProps) {
  const { tenant: slug } = await params;

  const [tenant, user] = await Promise.all([
    findTenantBySlug(slug),
    getCurrentUser(),
  ]);

  if (!tenant) {
    notFound();
  }

  if (!user) {
    redirect("/login");
  }

  const membership = await getUserTenantMembership(user.id, tenant.id);

  // Only owners and admins can access API keys
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    redirect(`/${slug}/settings`);
  }

  // Get API keys
  const apiKeys = await query(async (sql) => {
    return sql`
      SELECT id, name, key_prefix, scopes, last_used_at, expires_at, created_at
      FROM api_keys
      WHERE tenant_id = ${tenant.id}::uuid
      ORDER BY created_at DESC
    `;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys for programmatic access
        </p>
      </div>

      {/* Create new key */}
      <div className="bg-muted rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New API Key</h2>
        <CreateKeyForm tenantSlug={slug} />
      </div>

      {/* API Keys list */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Key</th>
              <th className="text-left px-6 py-3 text-sm font-medium">
                Last Used
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium">
                Created
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <ApiKeyRow
                  key={key.id as string}
                  apiKey={{
                    id: key.id as string,
                    name: key.name as string,
                    keyPrefix: key.key_prefix as string,
                    lastUsedAt: key.last_used_at
                      ? new Date(key.last_used_at as string)
                      : null,
                    createdAt: new Date(key.created_at as string),
                  }}
                  tenantSlug={slug}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
