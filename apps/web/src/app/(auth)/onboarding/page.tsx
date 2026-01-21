import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserTenants } from "@/lib/db/users";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Check if user already has tenants
  const tenants = await getUserTenants(user.id);

  // If user has tenants, redirect to first one
  const firstTenant = tenants[0];
  if (firstTenant) {
    redirect(`/${firstTenant.tenantSlug}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-center">
        Create Your Organization
      </h1>
      <p className="text-[var(--muted-foreground)] text-center mb-6">
        Set up your workspace to get started
      </p>
      <OnboardingForm />
    </div>
  );
}
