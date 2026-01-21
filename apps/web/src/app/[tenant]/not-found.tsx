import Link from "next/link";

export default function TenantNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Workspace Not Found</h2>
        <p className="text-[var(--muted-foreground)] mb-8">
          The workspace you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
