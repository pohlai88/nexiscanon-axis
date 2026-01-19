// scripts/smoke-db.ts
// Minimal DB roundtrip smoke test (run once DATABASE_URL is wired)
// Usage: tsx scripts/smoke-db.ts

import { getDb } from "@workspace/db";
import { tenants, users, requests } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const db = getDb();

async function main() {
  console.log("🧪 DB Smoke Test (roundtrip proof)\n");

  const timestamp = Date.now();
  const testIds = {
    tenantId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    requestId: crypto.randomUUID(),
  };

  try {
    // 1) Insert tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        id: testIds.tenantId,
        name: "Smoke Test Tenant",
        slug: `smoke-test-${timestamp}`,
      })
      .returning();
    console.log(`✅ Tenant created: ${tenant.id}`);

    // 2) Insert user
    const [user] = await db
      .insert(users)
      .values({
        id: testIds.userId,
        tenantId: tenant.id,
        email: "smoke@test.local",
        name: "Smoke Test User",
      })
      .returning();
    console.log(`✅ User created: ${user.id}`);

    // 3) Insert request
    const [request] = await db
      .insert(requests)
      .values({
        id: testIds.requestId,
        tenantId: tenant.id,
        requesterId: user.id,
        status: "SUBMITTED",
      })
      .returning();
    console.log(
      `✅ Request created: ${request.id} (status: ${request.status})`
    );

    // 4) Approve request
    const [approved] = await db
      .update(requests)
      .set({
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: user.id,
      })
      .where(eq(requests.id, request.id))
      .returning();
    console.log(
      `✅ Request approved: ${approved.id} (status: ${approved.status})`
    );

    // 5) Read back to verify
    const read = await db
      .select()
      .from(requests)
      .where(eq(requests.id, request.id))
      .limit(1);

    if (read[0]?.status !== "APPROVED") {
      throw new Error("Roundtrip failed: status not APPROVED");
    }

    console.log(`✅ Roundtrip verified: ${read[0].id}`);

    // Cleanup: Delete test data
    await db.delete(requests).where(eq(requests.id, testIds.requestId));
    await db.delete(users).where(eq(users.id, testIds.userId));
    await db.delete(tenants).where(eq(tenants.id, testIds.tenantId));

    console.log("\n✅ DB Smoke Test: PASS (test data cleaned up)");
    process.exit(0);
  } catch (e) {
    throw e;
  }
}

main().catch((err) => {
  console.error("\n❌ DB Smoke Test: FAIL");
  console.error(err);
  process.exit(1);
});
