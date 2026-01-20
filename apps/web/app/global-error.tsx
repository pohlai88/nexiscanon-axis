"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
            Application Error
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "28rem", textAlign: "center" }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.5rem",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
