"use client";

/**
 * Global error boundary for root layout errors.
 * 
 * Pattern: Catches errors in the root layout itself.
 * Note: Must include its own html/body tags.
 */

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                margin: "0 auto 1.5rem",
                borderRadius: "50%",
                backgroundColor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              Critical Error
            </h1>
            <p style={{ color: "#6B7280", marginBottom: "1.5rem" }}>
              Something went wrong loading the application.
            </p>

            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "1rem" }}>
                Error ID: {error.digest}
              </p>
            )}

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#3B82F6",
                  color: "white",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
