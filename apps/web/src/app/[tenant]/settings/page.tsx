import Link from "next/link";
import { notFound } from "next/navigation";
import { findTenantBySlug } from "@/lib/db/tenants";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenantMembership } from "@/lib/db/users";
import { DeleteWorkspaceButton } from "./delete-workspace-button";
import { WorkspaceNameForm } from "./workspace-name-form";
import { BrandingForm } from "./branding-form";

interface SettingsPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { tenant: slug } = await params;

  const [tenant, user] = await Promise.all([
    findTenantBySlug(slug),
    getCurrentUser(),
  ]);

  if (!tenant) {
    notFound();
  }

  const membership = user
    ? await getUserTenantMembership(user.id, tenant.id)
    : null;

  const isOwner = membership?.role === "owner";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <p className="text-muted-foreground mb-8">
        Manage {tenant.name}&apos;s workspace settings
      </p>

      <div className="space-y-6">
        <section className="p-6 bg-muted rounded-xl">
          <h2 className="text-xl font-semibold mb-4">General</h2>
          <div className="space-y-6">
            <WorkspaceNameForm
              tenantSlug={slug}
              currentName={tenant.name}
              isOwner={isOwner}
            />
            <div>
              <label className="block text-sm font-medium mb-2">
                Workspace URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/
                </span>
                <input
                  type="text"
                  value={tenant.slug}
                  disabled
                  className="flex-1 max-w-xs px-4 py-2 border border-border rounded-lg bg-background opacity-50"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Workspace URL cannot be changed
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-muted rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Branding</h2>
          <BrandingForm
            tenantSlug={slug}
            currentBranding={(tenant.settings as Record<string, unknown> | null)?.branding as Record<string, unknown> ?? {}}
            isOwner={isOwner}
          />
        </section>

        <section className="p-6 bg-muted rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{tenant.plan} Plan</p>
              <p className="text-sm text-muted-foreground">
                Your current subscription plan
              </p>
            </div>
            {isOwner && (
              <Link
                href={`/${slug}/settings/billing`}
                className="px-4 py-2 border border-border rounded-lg hover:bg-background transition-colors duration-200"
              >
                Manage Billing
              </Link>
            )}
          </div>
        </section>

        {isOwner && (
          <section className="p-6 bg-muted rounded-xl border-2 border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete a workspace, there is no going back. Please be
              certain.
            </p>
            <DeleteWorkspaceButton
              tenantSlug={tenant.slug}
              tenantName={tenant.name}
            />
          </section>
        )}
      </div>
    </div>
  );
}
