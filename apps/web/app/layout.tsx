import type { Metadata, Viewport } from "next";
import "@workspace/design-system/styles/globals.css";
import "./axis.inject.css";
import "./globals.css";
import { ThemeProvider } from "@workspace/design-system";
import { AuthProvider } from "@workspace/auth";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "NexusCanon AXIS",
  description: "Enterprise platform built with Turbo monorepo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
