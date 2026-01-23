import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  // Disable typed routes - incompatible with dynamic tenant [slug] routes
  // typedRoutes: true,

  // Transpile workspace packages
  transpilePackages: ["@axis/kernel", "@axis/db", "@workspace/design-system"],
};

export default nextConfig;
