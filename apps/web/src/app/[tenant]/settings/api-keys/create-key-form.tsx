"use client";

import { useState } from "react";
import { createApiKeyAction } from "@/lib/actions/api-keys";

interface CreateKeyFormProps {
  tenantSlug: string;
}

export function CreateKeyForm({ tenantSlug }: CreateKeyFormProps) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    setError(null);

    const result = await createApiKeyAction(tenantSlug, name.trim());

    if (result.success && result.key) {
      setNewKey(result.key);
      setName("");
    } else {
      setError(result.error ?? "Failed to create API key");
    }

    setIsCreating(false);
  };

  const handleCopy = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    setNewKey(null);
  };

  if (newKey) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">
          API Key Created Successfully
        </h3>
        <p className="text-xs text-green-700 mb-3">
          Copy this key now. You won't be able to see it again.
        </p>
        <div className="flex items-center gap-2 mb-4">
          <code className="flex-1 bg-white p-3 rounded border border-green-300 text-sm font-mono break-all">
            {newKey}
          </code>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="text-sm text-green-700 hover:text-green-800"
        >
          I've copied the key
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">Key Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Production API"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          disabled={isCreating}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={!name.trim() || isCreating}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
      >
        {isCreating ? "Creating..." : "Create Key"}
      </button>
    </form>
  );
}
