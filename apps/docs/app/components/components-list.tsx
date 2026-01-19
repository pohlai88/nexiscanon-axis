"use client";

import React from "react";

type ComponentItem = {
  name: string;
  status?: "stable" | "wip" | "beta";
};

const ITEMS: ComponentItem[] = [
  { name: "Alert Dialog", status: "stable" },
  { name: "Badge", status: "stable" },
  { name: "Button", status: "stable" },
  { name: "Card", status: "stable" },
  { name: "Combobox", status: "beta" },
  { name: "Dropdown Menu", status: "stable" },
  { name: "Field", status: "stable" },
  { name: "Input", status: "stable" },
  { name: "Input Group", status: "stable" },
  { name: "Label", status: "stable" },
  { name: "Select", status: "stable" },
  { name: "Separator", status: "stable" },
  { name: "Textarea", status: "stable" },
  { name: "Form", status: "stable" },
  { name: "Validated Input", status: "stable" },
  { name: "Validated Select", status: "stable" },
  { name: "Validated Textarea", status: "stable" },
  { name: "Validated Checkbox", status: "stable" },
  { name: "Toaster", status: "stable" },
  { name: "Leather Button", status: "wip" },
  { name: "Vellum Card", status: "wip" },
  { name: "Wood Panel", status: "wip" },
];

function Status({ status }: { status?: ComponentItem["status"] }) {
  if (!status) return null;
  const label = status.toUpperCase();
  const color =
    status === "stable" ? "#16a34a" : status === "beta" ? "#ca8a04" : "#64748b";
  return (
    <span
      aria-label={`status: ${label}`}
      style={{
        display: "inline-block",
        padding: "2px 6px",
        borderRadius: 999,
        fontSize: 12,
        lineHeight: 1,
        color: "white",
        backgroundColor: color,
      }}
    >
      {label}
    </span>
  );
}

export function ComponentsList() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
        marginTop: 24,
      }}
    >
      {ITEMS.map((item) => (
        <div
          key={item.name}
          style={{
            border: "1px solid var(--color-border, #e5e7eb)",
            borderRadius: 12,
            padding: 16,
            background: "var(--color-card, #fff)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong style={{ fontSize: 14 }}>{item.name}</strong>
            <Status status={item.status} />
          </div>
          <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
            Coming soon: examples and API details.
          </div>
        </div>
      ))}
    </div>
  );
}

export default ComponentsList;
