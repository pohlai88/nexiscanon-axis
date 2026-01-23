import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenants } from "@/lib/db/users";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { DeleteAccountForm } from "./delete-account-form";
import Link from "next/link";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tenants = await getUserTenants(user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
      <p className="text-muted-foreground mb-8">
        Manage your personal account settings
      </p>

      {/* Profile Section */}
      <section className="bg-muted rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <ProfileForm user={user} />
      </section>

      {/* Organizations Section */}
      <section className="bg-muted rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Organizations</h2>
        {tenants.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              You're not a member of any organizations yet.
            </p>
            <Link
              href="/onboarding"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200"
            >
              Create Organization
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">{tenant.tenantName}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {tenant.role}
                  </p>
                </div>
                <Link
                  href={`/${tenant.tenantSlug}`}
                  className="text-sm text-primary hover:underline"
                >
                  Open →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Password Section */}
      <section className="bg-muted rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <PasswordForm />
      </section>

      {/* Danger Zone */}
      <section className="bg-muted rounded-xl p-6 border-2 border-red-200">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. This will remove
          you from all organizations.
        </p>
        <DeleteAccountForm />
      </section>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
