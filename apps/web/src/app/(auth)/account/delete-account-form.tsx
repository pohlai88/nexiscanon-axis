"use client";

import { useState } from "react";
import { deleteAccountAction } from "@/lib/actions/account";

export function DeleteAccountForm() {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === "DELETE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;

    setIsDeleting(true);
    setError(null);

    const result = await deleteAccountAction();

    if (!result.success) {
      setError(result.error ?? "Failed to delete account");
      setIsDeleting(false);
    }
    // On success, the action will redirect
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium mb-2">
          Type DELETE to confirm
        </label>
        <input
          type="text"
          id="confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={isDeleting}
        />
      </div>

      <button
        type="submit"
        disabled={!canDelete || isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? "Deleting..." : "Delete My Account"}
      </button>
    </form>
  );
}
