// scripts/smoke-db.ts
// Minimal DB roundtrip smoke test (run once DATABASE_URL is wired)
// Usage: DATABASE_URL=... tsx scripts/smoke-db.ts

import { db } from "@workspace/db";
import { tenants, users, requests } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🧪 DB Smoke Test (roundtrip proof)\n");

  try {
    // Use transaction with rollback for clean smoke test
    await db.transaction(async (tx) => {
      // 1) Insert tenant
      const [tenant] = await tx
        .insert(tenants)
        .values({
          id: "test-tenant-smoke",
          name: "Smoke Test Tenant",
          slug: "smoke-test",
        })
        .returning();
      console.log(`✅ Tenant created: ${tenant.id}`);

      // 2) Insert user
      const [user] = await tx
        .insert(users)
        .values({
          id: "test-user-smoke",
          tenant_id: tenant.id,
          email: "smoke@test.local",
          name: "Smoke Test User",
        })
        .returning();
      console.log(`✅ User created: ${user.id}`);

      // 3) Insert request
      const [request] = await tx
        .insert(requests)
        .values({
          id: "test-request-smoke",
          tenant_id: tenant.id,
          requester_id: user.id,
          status: "SUBMITTED",
        })
        .returning();
      console.log(
        `✅ Request created: ${request.id} (status: ${request.status})`
      );

      // 4) Approve request
      const [approved] = await tx
        .update(requests)
        .set({
          status: "APPROVED",
          approved_at: new Date(),
          approved_by: user.id,
        })
        .where(eq(requests.id, request.id))
        .returning();
      console.log(
        `✅ Request approved: ${approved.id} (status: ${approved.status})`
      );

      // 5) Read back to verify
      const read = await tx
        .select()
        .from(requests)
        .where(eq(requests.id, request.id))
        .limit(1);

      if (read[0]?.status !== "APPROVED") {
        throw new Error("Roundtrip failed: status not APPROVED");
      }

      console.log(`✅ Roundtrip verified: ${read[0].id}`);

      // Rollback transaction (clean smoke test)
      throw new Error("ROLLBACK (intentional)");
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ROLLBACK (intentional)") {
      console.log("\n✅ DB Smoke Test: PASS (transaction rolled back)");
      process.exit(0);
    }
    throw e;
  }
}

main().catch((err) => {
  console.error("\n❌ DB Smoke Test: FAIL");
  console.error(err);
  process.exit(1);
});
