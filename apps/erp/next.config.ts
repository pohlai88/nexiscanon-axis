import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@axis/kernel", "@axis/db", "@workspace/design-system"],
};

export default nextConfig;
