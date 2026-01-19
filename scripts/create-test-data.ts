// scripts/create-test-data.ts
// Create persistent test data for API testing

import { getDb } from "@workspace/db";
import { tenants, users } from "@workspace/db/schema";

const db = getDb();

async function main() {
  console.log("🔧 Creating test data for API testing\n");

  const testIds = {
    tenantA: crypto.randomUUID(),
    tenantB: crypto.randomUUID(),
    userA: crypto.randomUUID(),
  };

  // Create Tenant A
  const [tenantA] = await db
    .insert(tenants)
    .values({
      id: testIds.tenantA,
      name: "API Test Tenant A",
      slug: `api-test-a-${Date.now()}`,
    })
    .returning();
  console.log(`✅ Tenant A created: ${tenantA.id}`);

  // Create Tenant B
  const [tenantB] = await db
    .insert(tenants)
    .values({
      id: testIds.tenantB,
      name: "API Test Tenant B",
      slug: `api-test-b-${Date.now()}`,
    })
    .returning();
  console.log(`✅ Tenant B created: ${tenantB.id}`);

  // Create User A (in Tenant A)
  const [userA] = await db
    .insert(users)
    .values({
      id: testIds.userA,
      tenantId: tenantA.id,
      email: "test@api.local",
      name: "API Test User",
    })
    .returning();
  console.log(`✅ User A created: ${userA.id}`);

  console.log("\n📋 Test Data Summary:");
  console.log(`Tenant A: ${tenantA.id}`);
  console.log(`Tenant B: ${tenantB.id}`);
  console.log(`User A: ${userA.id}`);
  console.log("\n✅ Test data created successfully");
  
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Failed to create test data");
  console.error(err);
  process.exit(1);
});
