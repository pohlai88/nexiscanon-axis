import Link from "next/link";

/**
 * Global 404 page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-[var(--muted-foreground)] mb-4">
          404
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-[var(--muted-foreground)] mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
