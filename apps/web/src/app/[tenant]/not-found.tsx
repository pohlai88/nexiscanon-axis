import Link from "next/link";

/**
 * Tenant 404 page.
 *
 * Pattern: Friendly message with helpful navigation options.
 */
export default function TenantNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <span className="text-4xl">🏢</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Workspace Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The workspace you&apos;re looking for doesn&apos;t exist, has been
          deleted, or you don&apos;t have access.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/onboarding"
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors duration-200"
          >
            Create Workspace
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/account" className="text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
