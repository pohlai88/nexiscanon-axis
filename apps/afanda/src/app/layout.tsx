import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/**
 * AFANDA - The Unified Decision Board
 *
 * Analytics, Finance, Actions, Notifications, Data, Alerts
 *
 * One board to see everything. One place for decisions.
 *
 * @see .cursor/ERP/B11-AFANDA.md
 * @see .cursor/ERP/A01-CANONICAL.md §8
 */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "AFANDA | The Unified Decision Board",
    template: "%s | AFANDA",
  },
  description:
    "Analytics, Finance, Actions, Notifications, Data, Alerts — The unified board that answers: What is happening? What needs attention? What should I do? How are we performing?",
  keywords: [
    "AFANDA",
    "AXIS",
    "Dashboard",
    "Analytics",
    "KPI",
    "Business Intelligence",
    "Decision Support",
    "ERP",
  ],
  authors: [{ name: "AXIS Architecture Team" }],
  creator: "AXIS",
  publisher: "AXIS",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="midnight"
      data-style="mia"
      suppressHydrationWarning
      className={inter.variable}
    >
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('afanda-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
