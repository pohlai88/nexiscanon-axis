// scripts/run-evi002b.ts
// EVI002-B HTTP proof execution (bypasses Windows Turbopack issues)

import { getDomainContainer } from "@workspace/app-runtime";

async function main() {
  console.log("\n═══ EVI002-B: HTTP Proof Execution ═══\n");

  // Step 1: Capture wiring log
  console.log("STEP 1: Wiring Log (will appear below)\n");
  
  // This will emit the wiring log
  await getDomainContainer();

  console.log("\n---\n");

  // Step 2: Test data
  console.log("STEP 2: Test Data Available\n");
  console.log("Run in browser console:");
  console.log(`
const base = "http://localhost:3000";
const tenantA = "65881898-4890-46ea-8280-e992782c990a";
const tenantB = "c04940bb-6147-4e9d-9d29-e163bba2d840";
const userA = "cc187cb5-60b2-47aa-8fa6-7213cde32d71";

const headers = {
  "Content-Type": "application/json",
  "X-Tenant-ID": tenantA,
  "Authorization": "Bearer dev",
  "X-Actor-ID": userA,
};

// Create
const created = await fetch(\`\${base}/api/requests\`, {
  method: "POST",
  headers,
  body: JSON.stringify({})
}).then(r => r.json());

console.log("✅ Create:", created);

// Approve (same tenant)
const id = created?.data?.id;
const approved = await fetch(\`\${base}/api/requests/\${id}/approve\`, {
  method: "POST",
  headers,
  body: JSON.stringify({})
}).then(r => r.json());

console.log("✅ Approve:", approved);

// Cross-tenant isolation test
const headersB = { ...headers, "X-Tenant-ID": tenantB };
const cross = await fetch(\`\${base}/api/requests/\${id}/approve\`, {
  method: "POST",
  headers: headersB,
  body: JSON.stringify({})
});

console.log("❌ Cross-tenant:", {
  status: cross.status,
  body: await cross.json()
});
  `);

  console.log("\n---\n");
  console.log("✅ EVI002-B script ready");
  console.log("\nNext steps:");
  console.log("1. Verify wiring log shows wired:\"drizzle\"");
  console.log("2. Start dev server: pnpm -w dev");
  console.log("3. Open http://localhost:3000 and run browser script");
  console.log("4. Capture the 3 evidence items\n");
}

main().catch(console.error);
