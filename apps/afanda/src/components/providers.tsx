"use client";

import type { ReactNode } from "react";
import { TooltipProvider, Toaster } from "@workspace/design-system";
import { ThemeProvider } from "@/components/providers/theme-provider";

/**
 * AFANDA Providers
 *
 * Wraps the application with necessary context providers:
 * - ThemeProvider: Multi-dimensional theming with next-themes
 * - TooltipProvider: Global tooltip configuration
 * - Toaster: Toast notifications
 *
 * @see .cursor/ERP/B11-AFANDA.md for architecture
 */
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      defaultBaseTheme="midnight"
      defaultStyle="mia"
      defaultAccent="neutral"
      defaultTextureEnabled={true}
    >
      <TooltipProvider>
        {children}
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
