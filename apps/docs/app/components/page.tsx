import React from "react";
import ComponentsList from "./components-list";

export default function Page() {
  return (
    <main style={{ padding: "24px", maxWidth: 1024, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600 }}>Components</h1>
        <p style={{ color: "#6b7280", marginTop: 8 }}>
          Here you can find all the components available in the library. We are
          working on adding more components.
        </p>
      </header>

      <ComponentsList />

      <hr style={{ margin: "24px 0" }} />
      <p>
        Can&apos;t find what you need? Try the{" "}
        <a href="/docs/directory">registry directory</a> for
        community-maintained components.
      </p>
    </main>
  );
}
