"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signUpAction, type AuthActionResult } from "@/lib/actions/auth";

interface RegisterFormProps {
  inviteToken?: string;
  prefillEmail?: string;
}

const initialState: AuthActionResult = {
  success: false,
};

export function RegisterForm({ inviteToken, prefillEmail }: RegisterFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.success && state.redirect) {
      // If there's an invite token, redirect to accept it
      if (inviteToken) {
        router.push(`/invite?token=${inviteToken}`);
      } else {
        router.push(state.redirect);
      }
    }
  }, [state, router, inviteToken]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {!inviteToken && (
        <div>
          <label htmlFor="org" className="block text-sm font-medium mb-2">
            Organization Name
          </label>
          <input
            type="text"
            id="org"
            name="org"
            required={!inviteToken}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Acme Inc."
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={prefillEmail}
          readOnly={Boolean(prefillEmail)}
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] read-only:opacity-50 read-only:cursor-not-allowed"
          placeholder="you@example.com"
        />
        {prefillEmail && (
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Email is locked to the invitation
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Must be at least 8 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
