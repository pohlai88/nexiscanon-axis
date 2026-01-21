import { notFound } from "next/navigation";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getTenantMembers, getUserTenantMembership } from "@/lib/db/users";
import { getCurrentUser } from "@/lib/auth/session";
import { InviteForm } from "./invite-form";
import { MemberRow } from "./member-row";

interface TeamPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { tenant: slug } = await params;

  const [tenant, user] = await Promise.all([
    findTenantBySlug(slug),
    getCurrentUser(),
  ]);

  if (!tenant) {
    notFound();
  }

  const [members, currentMembership] = await Promise.all([
    getTenantMembers(tenant.id),
    user ? getUserTenantMembership(user.id, tenant.id) : null,
  ]);

  const canManage =
    currentMembership?.role === "owner" || currentMembership?.role === "admin";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage {tenant.name}&apos;s team members
          </p>
        </div>
        {canManage && <InviteForm tenantSlug={slug} />}
      </div>

      <div className="bg-[var(--muted)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-6 py-4 text-left text-sm font-medium">Member</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Role</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Joined</th>
              {canManage && (
                <th className="px-6 py-4 text-right text-sm font-medium">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={canManage ? 4 : 3}
                  className="px-6 py-8 text-center text-[var(--muted-foreground)]"
                >
                  No team members yet
                </td>
              </tr>
            ) : (
              members.map(({ user: member, membership }) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  membership={membership}
                  tenantSlug={slug}
                  canManage={canManage}
                  isCurrentUser={member.id === user?.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
