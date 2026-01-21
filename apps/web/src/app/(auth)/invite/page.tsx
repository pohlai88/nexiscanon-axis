import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { addUserToTenant } from "@/lib/db/users";

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  // Get invitation
  const invitations = await query(async (sql) => {
    return sql`
      SELECT i.*, t.name as tenant_name, t.slug as tenant_slug
      FROM invitations i
      JOIN tenants t ON t.id = i.tenant_id
      WHERE i.token = ${token}
        AND i.accepted_at IS NULL
        AND i.expires_at > now()
      LIMIT 1
    `;
  });

  const invitation = invitations[0];

  if (!invitation) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
        <p className="text-[var(--muted-foreground)]">
          This invitation link is invalid or has expired.
        </p>
      </div>
    );
  }

  const user = await getCurrentUser();

  // If not logged in, redirect to register with token
  if (!user) {
    redirect(`/register?invite=${token}&email=${encodeURIComponent(invitation.email as string)}`);
  }

  // If logged in user email doesn't match, show error
  if (user.email !== invitation.email) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Email Mismatch</h1>
        <p className="text-[var(--muted-foreground)] mb-4">
          This invitation was sent to {invitation.email as string}.
          You're signed in as {user.email}.
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Please sign out and sign in with the correct account.
        </p>
      </div>
    );
  }

  // Accept invitation
  await addUserToTenant({
    userId: user.id,
    tenantId: invitation.tenant_id as string,
    role: invitation.role as "owner" | "admin" | "member" | "viewer",
  });

  // Mark invitation as accepted
  await query(async (sql) => {
    return sql`
      UPDATE invitations
      SET accepted_at = now()
      WHERE id = ${invitation.id as string}::uuid
    `;
  });

  // Redirect to tenant
  redirect(`/${invitation.tenant_slug as string}`);
}
