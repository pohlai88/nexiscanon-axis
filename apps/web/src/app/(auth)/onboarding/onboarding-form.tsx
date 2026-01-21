"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createTenantAction,
  generateSlugAction,
  type TenantActionResult,
} from "@/lib/actions/tenant";

const initialState: TenantActionResult = {
  success: false,
};

export function OnboardingForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createTenantAction,
    initialState
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Generate slug when name changes
  useEffect(() => {
    if (!name) {
      setSlug("");
      setSlugAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingSlug(true);
      const result = await generateSlugAction(name);
      setSlug(result.slug);
      setSlugAvailable(result.available);
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [name]);

  // Redirect on success
  useEffect(() => {
    if (state.success && state.tenantSlug) {
      router.push(`/${state.tenantSlug}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Organization Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          placeholder="Acme Inc."
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Workspace URL
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted-foreground)] text-sm">
            {typeof window !== "undefined" ? window.location.host : "erp.com"}/
          </span>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              setSlugAvailable(null);
            }}
            className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="acme"
          />
        </div>
        {isCheckingSlug && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Checking availability...
          </p>
        )}
        {!isCheckingSlug && slugAvailable === true && (
          <p className="mt-1 text-xs text-green-600">URL is available</p>
        )}
        {!isCheckingSlug && slugAvailable === false && (
          <p className="mt-1 text-xs text-red-600">URL is already taken</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || slugAvailable === false || !slug}
        className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating..." : "Create Organization"}
      </button>
    </form>
  );
}
