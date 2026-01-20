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
  title: {
    default: "NexusCanon AXIS",
    template: "%s | NexusCanon AXIS",
  },
  description: "Enterprise platform built with Turbo monorepo",
  keywords: ["enterprise", "platform", "monorepo", "turbo", "next.js"],
  authors: [{ name: "NexusCanon" }],
  creator: "NexusCanon",
  metadataBase: new URL("https://nexuscanon.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexuscanon.com",
    title: "NexusCanon AXIS",
    description: "Enterprise platform built with Turbo monorepo",
    siteName: "NexusCanon AXIS",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusCanon AXIS",
    description: "Enterprise platform built with Turbo monorepo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body data-app="web">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
