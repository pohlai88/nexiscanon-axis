"use client";

/**
 * Workspace name update form.
 *
 * Pattern: Client component for settings update.
 */

import { useState, useTransition } from "react";
import { updateTenantNameAction } from "@/lib/actions/tenant";

interface WorkspaceNameFormProps {
  tenantSlug: string;
  currentName: string;
  isOwner: boolean;
}

export function WorkspaceNameForm({
  tenantSlug,
  currentName,
  isOwner,
}: WorkspaceNameFormProps) {
  const [name, setName] = useState(currentName);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasChanges = name.trim() !== currentName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !isOwner) return;

    setMessage(null);
    startTransition(async () => {
      const result = await updateTenantNameAction(tenantSlug, name);
      if (result.success) {
        setMessage({ type: "success", text: "Workspace name updated" });
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to update" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="workspace-name" className="block text-sm font-medium mb-2">
          Workspace Name
        </label>
        <input
          type="text"
          id="workspace-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isOwner || isPending}
          className="w-full max-w-md px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {!isOwner && (
          <p className="mt-1 text-xs text-muted-foreground">
            Only the owner can change the workspace name
          </p>
        )}
      </div>

      {isOwner && (
        <button
          type="submit"
          disabled={!hasChanges || isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      )}
    </form>
  );
}
