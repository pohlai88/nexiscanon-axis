"use client";

import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@workspace/design-system";
import { AfandaSidebar } from "./sidebar";
import { AfandaHeader } from "./header";

/**
 * AFANDA Application Shell
 *
 * Main layout wrapper that provides the sidebar, header, and content area.
 *
 * @see AFANDA.md §7.1 Layout Principles
 * @see AFANDA.md §8.1 File Structure
 */

interface AfandaShellProps {
  children: ReactNode;
}

export function AfandaShell({ children }: AfandaShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AfandaSidebar />
      <SidebarInset>
        <AfandaHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
