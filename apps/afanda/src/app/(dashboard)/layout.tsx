import type { ReactNode } from "react";
import { AfandaShell } from "@/components/layout/shell";

/**
 * Dashboard Layout
 *
 * Wraps all dashboard pages with the AFANDA shell (sidebar + header).
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AfandaShell>{children}</AfandaShell>;
}
