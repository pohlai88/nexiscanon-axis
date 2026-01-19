"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Action: form mutations, revalidate, redirect.
 * Form action must return void | Promise<void>. Use useActionState in a
 * Client Component to handle pending and returned data (e.g. validation errors).
 */
export async function submitMessage(formData: FormData): Promise<void> {
  const message = formData.get("message");

  if (typeof message !== "string" || !message.trim()) {
    return; // In real apps: use useActionState or redirect to show error
  }

  // Persist (e.g. DB, API). Here we only revalidate.
  revalidatePath("/");
}

/**
 * Server Action with redirect.
 * redirect() throws; code after it won't run.
 */
export async function goToBlog(slug: string) {
  redirect(`/blog/${slug}`);
}
