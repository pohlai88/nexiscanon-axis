import type { Metadata, Viewport } from "next";
import "@workspace/design-system/styles/globals.css";
import "./globals.css";
import { ThemeProvider } from "@workspace/design-system";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "NexusCanon AXIS - Documentation",
    template: "%s | NexusCanon AXIS Docs",
  },
  description: "Design system documentation and component showcase",
  keywords: ["design system", "components", "react", "next.js", "tailwind"],
  authors: [{ name: "NexusCanon" }],
  creator: "NexusCanon",
  metadataBase: new URL("https://docs.nexuscanon.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docs.nexuscanon.com",
    title: "NexusCanon AXIS - Documentation",
    description: "Design system documentation and component showcase",
    siteName: "NexusCanon AXIS",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusCanon AXIS - Documentation",
    description: "Design system documentation and component showcase",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="neutral" data-style="vega">
      <body data-app="docs">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          defaultColorTheme="neutral"
          defaultStyle="vega"
          defaultAccent="neutral"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
