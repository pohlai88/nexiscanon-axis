// scripts/cleanup-orphans.ts
// Clean up any orphaned test data

import { getDb } from "@workspace/db";
import { tenants, users, requests } from "@workspace/db/schema";

const db = getDb();

async function main() {
  console.log("🧹 Cleaning orphaned test data...\n");

  const deletedRequests = await db.delete(requests);
  console.log(`  Deleted ${deletedRequests.rowCount || 0} requests`);

  const deletedUsers = await db.delete(users);
  console.log(`  Deleted ${deletedUsers.rowCount || 0} users`);

  const deletedTenants = await db.delete(tenants);
  console.log(`  Deleted ${deletedTenants.rowCount || 0} tenants`);

  console.log("\n✅ Cleanup complete");
}

main().catch((err) => {
  console.error("\n❌ Error:");
  console.error(err);
  process.exit(1);
});
