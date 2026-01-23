"use client";

/**
 * Delete workspace button with confirmation modal.
 *
 * Pattern: Client component for dangerous actions with confirmation.
 */

import { useState, useTransition } from "react";
import { deleteTenantAction } from "@/lib/actions/tenant";

interface DeleteWorkspaceButtonProps {
  tenantSlug: string;
  tenantName: string;
}

export function DeleteWorkspaceButton({
  tenantSlug,
  tenantName,
}: DeleteWorkspaceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteTenantAction(tenantSlug, confirmation);
      if (!result.success) {
        setError(result.error ?? "Failed to delete workspace");
      }
      // On success, the action redirects to /
    });
  };

  const isConfirmed = confirmation === tenantSlug;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Delete Workspace
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Delete Workspace
            </h2>

            <p className="text-muted-foreground mb-4">
              This action cannot be undone. This will permanently delete the{" "}
              <strong className="text-foreground">{tenantName}</strong>{" "}
              workspace and remove all associated data including:
            </p>

            <ul className="list-disc list-inside text-sm text-muted-foreground mb-4 space-y-1">
              <li>All team members and their access</li>
              <li>All API keys</li>
              <li>All pending invitations</li>
              <li>Audit logs and settings</li>
            </ul>

            <p className="text-sm mb-2">
              Please type{" "}
              <code className="px-2 py-1 bg-muted rounded font-mono">
                {tenantSlug}
              </code>{" "}
              to confirm.
            </p>

            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={tenantSlug}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background mb-4"
              autoFocus
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setConfirmation("");
                  setError(null);
                }}
                disabled={isPending}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Deleting..." : "Delete Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
