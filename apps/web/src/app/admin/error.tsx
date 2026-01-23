"use client";

/**
 * Admin error boundary.
 *
 * Pattern: Catches errors in admin routes with context.
 */

import { useEffect } from "react";
import { reportError } from "@/lib/error-reporting";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Admin error:", error);
    reportError(error, { location: "admin" });
  }, [error]);

  return (
    <div className="flex items-center justify-center p-8 min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">Admin Error</h1>
        <p className="text-muted-foreground mb-6">
          Something went wrong in the admin panel.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors duration-200"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
