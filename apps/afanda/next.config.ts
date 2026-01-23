import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../.env") });

/**
 * AFANDA - The Unified Decision Board
 * 
 * Analytics, Finance, Actions, Notifications, Data, Alerts
 * 
 * @see .cursor/ERP/B11-AFANDA.md for architecture
 * @see .cursor/ERP/A01-CANONICAL.md §8 for philosophy
 */
const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@axis/kernel", "@axis/db", "@workspace/design-system"],

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: "AFANDA",
    NEXT_PUBLIC_APP_DESCRIPTION: "The Unified Decision Board",
  },
};

export default nextConfig;
