import { notFound, redirect } from "next/navigation";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenantMembership } from "@/lib/db/users";
import { query } from "@/lib/db";

interface AuditLogPageProps {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ page?: string }>;
}

const ITEMS_PER_PAGE = 50;

export default async function AuditLogPage({
  params,
  searchParams,
}: AuditLogPageProps) {
  const { tenant: slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));

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

  // Only owners and admins can view audit log
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    redirect(`/${slug}/settings`);
  }

  // Get audit logs with pagination
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const auditLogs = await query(async (sql) => {
    return sql`
      SELECT 
        al.id, al.action, al.resource_type, al.resource_id, 
        al.metadata, al.ip_address, al.created_at,
        u.email as user_email, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.tenant_id = ${tenant.id}::uuid
      ORDER BY al.created_at DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `;
  });

  // Get total count for pagination
  const countResult = await query(async (sql) => {
    return sql`
      SELECT COUNT(*) as total
      FROM audit_logs
      WHERE tenant_id = ${tenant.id}::uuid
    `;
  });
  const totalCount = parseInt((countResult[0]?.total as string) ?? "0", 10);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const actionColors: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
    login: "bg-purple-100 text-purple-800",
    logout: "bg-gray-100 text-gray-800",
  };

  const getActionColor = (action: string) => {
    const type = action.split(".")[0];
    return actionColors[type ?? ""] ?? "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Audit Log</h1>
        <p className="text-[var(--muted-foreground)]">
          View security and activity logs for your organization
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium">Time</th>
              <th className="text-left px-6 py-3 text-sm font-medium">User</th>
              <th className="text-left px-6 py-3 text-sm font-medium">
                Action
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium">
                Resource
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-[var(--muted-foreground)]"
                >
                  No audit logs yet.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr
                  key={log.id as string}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-6 py-4 text-sm">
                    {new Date(log.created_at as string).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">
                        {(log.user_name as string) ?? "System"}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {log.user_email as string}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action as string)}`}
                    >
                      {log.action as string}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {log.resource_type && (
                      <span>
                        {log.resource_type as string}
                        {log.resource_id && (
                          <code className="ml-1 text-xs">
                            ({(log.resource_id as string).slice(0, 8)}...)
                          </code>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] font-mono">
                    {log.ip_address as string}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, totalCount)}{" "}
            of {totalCount} entries
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <a
                href={`/${slug}/settings/audit-log?page=${currentPage - 1}`}
                className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors duration-200"
              >
                Previous
              </a>
            )}
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <a
                href={`/${slug}/settings/audit-log?page=${currentPage + 1}`}
                className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors duration-200"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
