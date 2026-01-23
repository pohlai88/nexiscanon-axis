"use client";

import { useState, useActionState } from "react";
import {
  inviteTeamMemberAction,
  type TeamActionResult,
} from "@/lib/actions/team";

interface InviteFormProps {
  tenantSlug: string;
}

const initialState: TeamActionResult = {
  success: false,
};

export function InviteForm({ tenantSlug }: InviteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const boundAction = inviteTeamMemberAction.bind(null, tenantSlug);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200"
      >
        Invite Member
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {state.success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              Invitation sent successfully!
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="colleague@example.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
