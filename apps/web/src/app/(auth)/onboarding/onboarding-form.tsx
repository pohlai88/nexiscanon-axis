"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createTenantAction,
  generateSlugAction,
  type TenantActionResult,
} from "@/lib/actions/tenant";

type WorkspaceType = "organization" | "personal";

const initialState: TenantActionResult = {
  success: false,
};

export function OnboardingForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createTenantAction,
    initialState
  );
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>("organization");
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
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {/* Workspace Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Workspace Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWorkspaceType("organization")}
            className={`p-4 border rounded-lg text-left transition-all duration-200 ${
              workspaceType === "organization"
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Organization</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For teams and companies. Invite members and create sub-teams.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceType("personal")}
            className={`p-4 border rounded-lg text-left transition-all duration-200 ${
              workspaceType === "personal"
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Personal</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For individual use. Your own private workspace.
            </p>
          </button>
        </div>
        {/* Hidden input to pass type to form action */}
        <input type="hidden" name="type" value={workspaceType} />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          {workspaceType === "organization" ? "Organization Name" : "Workspace Name"}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={workspaceType === "organization" ? "Acme Inc." : "My Workspace"}
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Workspace URL
        </label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
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
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={workspaceType === "organization" ? "acme" : "my-workspace"}
          />
        </div>
        {isCheckingSlug && (
          <p className="mt-1 text-xs text-muted-foreground">
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
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? "Creating..."
          : workspaceType === "organization"
          ? "Create Organization"
          : "Create Personal Workspace"}
      </button>
    </form>
  );
}