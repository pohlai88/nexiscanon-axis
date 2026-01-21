/**
 * Auth actions.
 * 
 * Pattern: Client-callable auth operations.
 * These redirect to Neon Auth endpoints.
 */

import { authConfig } from "./config";

/**
 * Get sign-in URL.
 * Redirects user to Neon Auth sign-in page.
 */
export function signIn(redirectTo?: string): string {
  const url = new URL("/signin/email", authConfig.publicUrl);
  
  if (redirectTo) {
    url.searchParams.set("callbackURL", redirectTo);
  }

  return url.toString();
}

/**
 * Get sign-up URL.
 * Redirects user to Neon Auth sign-up page.
 */
export function signUp(redirectTo?: string): string {
  const url = new URL("/signup/email", authConfig.publicUrl);
  
  if (redirectTo) {
    url.searchParams.set("callbackURL", redirectTo);
  }

  return url.toString();
}

/**
 * Get sign-out URL.
 * Redirects user to Neon Auth sign-out endpoint.
 */
export function signOut(redirectTo?: string): string {
  const url = new URL("/signout", authConfig.publicUrl);
  
  if (redirectTo) {
    url.searchParams.set("callbackURL", redirectTo);
  }

  return url.toString();
}

/**
 * Sign in with email and password.
 * For use with custom forms.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${authConfig.baseUrl}/signin/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message ?? "Sign in failed",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

/**
 * Sign up with email and password.
 * For use with custom forms.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${authConfig.baseUrl}/signup/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message ?? "Sign up failed",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}
