"use client";

/**
 * Global error boundary.
 * 
 * Pattern: Catches errors in the app and shows a friendly message.
 */

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
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
        
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-[var(--muted-foreground)] mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>

        {error.digest && (
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors duration-200"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
