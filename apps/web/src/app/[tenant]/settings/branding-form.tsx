"use client";

/**
 * Workspace branding form.
 *
 * Pattern: Client component for branding settings.
 * Inspired by Vercel Platforms emoji/branding feature.
 *
 * @see https://github.com/vercel/platforms
 */

import { useState, useTransition } from "react";
import { updateTenantBrandingAction } from "@/lib/actions/tenant";
import type { TenantBranding } from "@/lib/db/tenants";

interface BrandingFormProps {
  tenantSlug: string;
  currentBranding: TenantBranding;
  isOwner: boolean;
}

const EMOJI_OPTIONS = [
  "🏢", "🚀", "⚡", "🎯", "💼", "🌟", "🔥", "💎",
  "🎨", "📊", "🛠️", "🌍", "🎪", "🏆", "🎭", "🧩",
];

export function BrandingForm({
  tenantSlug,
  currentBranding,
  isOwner,
}: BrandingFormProps) {
  const [emoji, setEmoji] = useState(currentBranding.emoji ?? "🏢");
  const [description, setDescription] = useState(currentBranding.description ?? "");
  const [brandColor, setBrandColor] = useState(currentBranding.brandColor ?? "#18181b");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    setMessage(null);
    startTransition(async () => {
      const result = await updateTenantBrandingAction(tenantSlug, {
        emoji,
        description: description.trim() || undefined,
        brandColor,
      });
      if (result.success) {
        setMessage({ type: "success", text: "Branding updated" });
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to update" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Emoji Picker */}
      <div>
        <label className="block text-sm font-medium mb-2">Workspace Emoji</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              disabled={!isOwner}
              className={`w-10 h-10 text-xl rounded-lg border transition-all duration-200 ${
                emoji === e
                  ? "border-primary bg-primary/10 scale-110"
                  : "border-border hover:border-primary/50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short description of your workspace"
          rows={2}
          disabled={!isOwner || isPending}
          className="w-full max-w-md px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {/* Brand Color */}
      <div>
        <label htmlFor="brandColor" className="block text-sm font-medium mb-2">
          Brand Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="brandColor"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            disabled={!isOwner || isPending}
            className="w-10 h-10 rounded border border-border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <input
            type="text"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            disabled={!isOwner || isPending}
            className="w-28 px-3 py-2 border border-border rounded-lg bg-background text-sm font-mono disabled:opacity-50"
          />
        </div>
      </div>

      {isOwner && (
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Branding"}
        </button>
      )}

      {!isOwner && (
        <p className="text-xs text-muted-foreground">
          Only the owner can change branding settings
        </p>
      )}
    </form>
  );
}
