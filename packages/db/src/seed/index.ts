/**
 * Main Seed Runner
 *
 * Implements F01 B10 — Seeding
 *
 * Usage:
 *   pnpm --filter @axis/db db:seed
 */

import { config } from "dotenv";
import { resolve } from "path";
import { seedTenants } from "./tenants.seed";
import { seedUsers } from "./users.seed";
import { seedAccounts } from "./accounts.seed";

// Load .env from monorepo root
config({ path: resolve(__dirname, "../../../.env") });

async function main() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Seed in order (respect FK dependencies)
    const tenants = await seedTenants();
    await seedUsers();

    // Seed COA for each tenant
    if (tenants.length > 0) {
      console.log("\n📊 Seeding chart of accounts for tenants...");
      for (const tenant of tenants) {
        await seedAccounts(tenant.id);
      }
    }

    console.log("\n✅ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
