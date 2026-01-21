"use client";

import { useState } from "react";
import { updateProfileAction } from "@/lib/actions/account";
import type { User } from "@/lib/db/users";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name ?? "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    const result = await updateProfileAction({ name: name.trim() || null });

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully" });
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to update profile" });
    }

    setIsUpdating(false);
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
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={user.email}
          disabled
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] opacity-50 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Email cannot be changed
        </p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Display Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          disabled={isUpdating}
        />
      </div>

      <button
        type="submit"
        disabled={isUpdating}
        className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
      >
        {isUpdating ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
