import { redirect } from "next/navigation";

/**
 * AFANDA Home Page
 *
 * Redirects to the main dashboard.
 *
 * @see .cursor/ERP/B11-AFANDA.md for architecture
 */
export default function HomePage() {
  redirect("/dashboard");
}
