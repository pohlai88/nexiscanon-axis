"use client";

import { useState } from "react";
import { revokeApiKeyAction } from "@/lib/actions/api-keys";

interface ApiKeyRowProps {
  apiKey: {
    id: string;
    name: string;
    keyPrefix: string;
    lastUsedAt: Date | null;
    createdAt: Date;
  };
  tenantSlug: string;
}

export function ApiKeyRow({ apiKey, tenantSlug }: ApiKeyRowProps) {
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke this API key?")) {
      return;
    }

    setIsRevoking(true);
    await revokeApiKeyAction(tenantSlug, apiKey.id);
    setIsRevoking(false);
  };

  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      <td className="px-6 py-4 font-medium">{apiKey.name}</td>
      <td className="px-6 py-4">
        <code className="text-sm text-[var(--muted-foreground)]">
          {apiKey.keyPrefix}...
        </code>
      </td>
      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
        {apiKey.lastUsedAt
          ? apiKey.lastUsedAt.toLocaleDateString()
          : "Never"}
      </td>
      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
        {apiKey.createdAt.toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={handleRevoke}
          disabled={isRevoking}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {isRevoking ? "Revoking..." : "Revoke"}
        </button>
      </td>
    </tr>
  );
}
