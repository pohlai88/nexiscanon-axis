// scripts/run-evi014.ts
// EVI014 Evidence Capture (Template CRUD routes)
// Tests: [A] Create template, [B] List templates, [C] Get template by ID

import { randomUUID } from "crypto";

// Set required env vars
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Test data
const TENANT_A = "7509c48a-31c5-47b6-8c06-b1394683a7d6";
const TENANT_B = "8bb0336b-e6f9-4c74-b225-6e478c2b5330";
const ACTOR_A = "f3d87b9b-cb30-4fa4-9792-85468e905fe5";

async function runEvidence() {
  console.log("🧪 EVI014 Evidence Capture\n");

  const { POST: createTemplateHandler, GET: listTemplatesHandler } = await import(
    "../apps/web/app/api/templates/route"
  );
  const { GET: getTemplateHandler } = await import(
    "../apps/web/app/api/templates/[id]/route"
  );

  // === [A] Create template → 200 ===
  console.log("═══════════════════════════════════════════════");
  console.log("[A] Create Template → 200 ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockCreateReq = new Request(`http://localhost/api/templates`, {
    method: "POST",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Financial Request Template",
      description: "Requires evidence with 24h TTL",
      evidenceRequiredForApproval: true,
      evidenceTtlSeconds: 86400,
    }),
  });

  const createRes = await createTemplateHandler(mockCreateReq, {
    params: Promise.resolve({}),
  });
  const createBody = await createRes.json();

  console.log("Response:");
  console.log(`Status: ${createRes.status}`);
  console.log(JSON.stringify(createBody, null, 2));
  console.log();

  const templateId = createBody.data?.id;

  if (createRes.status !== 200 || !templateId) {
    console.error("❌ Expected 200 with template ID for successful creation.");
    process.exit(1);
  }

  // === [B] List templates → contains created template ===
  console.log("═══════════════════════════════════════════════");
  console.log("[B] List Templates → Contains Created Template ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockListReq = new Request(`http://localhost/api/templates`, {
    method: "GET",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
    },
  });

  const listRes = await listTemplatesHandler(mockListReq, {
    params: Promise.resolve({}),
  });
  const listBody = await listRes.json();

  console.log("Response:");
  console.log(`Status: ${listRes.status}`);
  console.log(JSON.stringify(listBody, null, 2));
  console.log();

  const foundTemplate = listBody.data?.templates?.find(
    (t: any) => t.id === templateId
  );

  if (listRes.status !== 200 || !foundTemplate) {
    console.error("❌ Expected 200 with created template in list.");
    process.exit(1);
  }

  // === [C] Get template by ID → matches created template ===
  console.log("═══════════════════════════════════════════════");
  console.log("[C] Get Template by ID → Matches Created Template ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockGetReq = new Request(
    `http://localhost/api/templates/${templateId}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
      },
    }
  );

  const getRes = await getTemplateHandler(mockGetReq, {
    params: Promise.resolve({ id: templateId }),
  });
  const getBody = await getRes.json();

  console.log("Response:");
  console.log(`Status: ${getRes.status}`);
  console.log(JSON.stringify(getBody, null, 2));
  console.log();

  if (
    getRes.status !== 200 ||
    getBody.data?.id !== templateId ||
    getBody.data?.name !== "Financial Request Template"
  ) {
    console.error("❌ Expected 200 with matching template details.");
    process.exit(1);
  }

  // === [Optional] Cross-tenant GET → 404 ===
  console.log("═══════════════════════════════════════════════");
  console.log("[Optional] Cross-Tenant GET → 404 ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockCrossTenantReq = new Request(
    `http://localhost/api/templates/${templateId}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_B, // Wrong tenant
        "X-Actor-ID": ACTOR_A,
      },
    }
  );

  const crossTenantRes = await getTemplateHandler(mockCrossTenantReq, {
    params: Promise.resolve({ id: templateId }),
  });
  const crossTenantBody = await crossTenantRes.json();

  console.log("Response:");
  console.log(`Status: ${crossTenantRes.status}`);
  console.log(JSON.stringify(crossTenantBody, null, 2));
  console.log();

  if (crossTenantRes.status !== 404 || crossTenantBody.error?.code !== "NOT_FOUND") {
    console.error("❌ Expected 404 NOT_FOUND for cross-tenant access.");
    process.exit(1);
  }

  // Summary
  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI014 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] Create template → 200: ${createRes.status === 200 ? "✅" : "❌"}
      - Template ID: ${templateId}
      - Policy: required=${createBody.data?.evidenceRequiredForApproval}, ttl=${createBody.data?.evidenceTtlSeconds}s
      - Canonical envelope with meta.traceId: ${createBody.meta?.traceId ? "✅" : "❌"}
  
  [B] List templates → contains created template: ${foundTemplate ? "✅" : "❌"}
      - Templates count: ${listBody.data?.templates?.length}
      - Canonical envelope with meta.traceId: ${listBody.meta?.traceId ? "✅" : "❌"}
  
  [C] Get template by ID → matches [A]: ${
    getBody.data?.id === templateId &&
    getBody.data?.name === "Financial Request Template"
      ? "✅"
      : "❌"
  }
      - Canonical envelope with meta.traceId: ${getBody.meta?.traceId ? "✅" : "❌"}
  
  [Optional] Cross-tenant GET → 404: ${
    crossTenantRes.status === 404 ? "✅" : "❌"
  }

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Tenant B: ${TENANT_B}
  Actor A: ${ACTOR_A}
  Template ID: ${templateId}
  `);

  console.log(
    "\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI014-TEMPLATE-CRUD.md"
  );
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
