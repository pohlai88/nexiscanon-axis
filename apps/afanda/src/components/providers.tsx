"use client";

import type { ReactNode } from "react";
import { TooltipProvider, Toaster } from "@workspace/design-system";

/**
 * AFANDA Providers
 *
 * Wraps the application with necessary context providers.
 *
 * @see .cursor/ERP/B11-AFANDA.md for architecture
 */
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider>
      {children}
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
