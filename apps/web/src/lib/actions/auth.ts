"use server";

/**
 * Auth server actions.
 *
 * Pattern: Server actions for auth forms.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig } from "../auth/config";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirect?: string;
}

/**
 * Sign in with email and password.
 */
export async function signInAction(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string | null;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    console.log("[signInAction] Calling Neon Auth:", `${authConfig.baseUrl}/sign-in/email`);

    const response = await fetch(`${authConfig.baseUrl}/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("[signInAction] Response status:", response.status);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log("[signInAction] Error response:", data);
      return {
        success: false,
        error: data.message ?? "Invalid email or password",
      };
    }

    // Get session cookie from response
    const setCookie = response.headers.get("set-cookie");
    console.log("[signInAction] Set-Cookie header:", setCookie ? "present" : "missing");
    if (setCookie) {
      // Parse and set the cookie
      const cookieStore = await cookies();
      const cookieParts = setCookie.split(";")[0]?.split("=");
      const cookieName = cookieParts?.[0];
      const cookieValue = cookieParts?.slice(1).join("=");

      if (cookieName && cookieValue) {
        cookieStore.set(cookieName, cookieValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: authConfig.sessionDuration,
          path: "/",
        });
      }
    }

    return {
      success: true,
      redirect: redirectTo ?? "/",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
}

/**
 * Sign up with email, password, and organization.
 */
export async function signUpAction(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const orgName = formData.get("org") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  if (!orgName) {
    return { success: false, error: "Organization name is required" };
  }

  try {
    // 1. Sign up with Neon Auth (Better Auth uses /sign-up/email)
    const signupUrl = `${authConfig.baseUrl}/sign-up/email`;
    console.log("[signUpAction] Calling Neon Auth:", signupUrl);

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(signupUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify({ email, password, name: orgName }),
    });

    console.log("[signUpAction] Response status:", response.status);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log("[signUpAction] Error response:", data);
      return {
        success: false,
        error: data.message ?? "Sign up failed",
      };
    }

    // Get session cookie from response
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      const cookieStore = await cookies();
      const cookieParts = setCookie.split(";")[0]?.split("=");
      const cookieName = cookieParts?.[0];
      const cookieValue = cookieParts?.slice(1).join("=");

      if (cookieName && cookieValue) {
        cookieStore.set(cookieName, cookieValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: authConfig.sessionDuration,
          path: "/",
        });
      }
    }

    // 2. Create tenant and add user
    // This will be done after redirect when we have the user context
    // For now, redirect to onboarding

    return {
      success: true,
      redirect: "/onboarding",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
}

/**
 * Sign out.
 */
export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Clear session cookie
  cookieStore.delete(authConfig.sessionCookieName);

  redirect("/");
}
