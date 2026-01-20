// scripts/run-evi013.ts
// EVI013 Evidence Capture (Template-driven evidence policy inheritance)
// Tests: [A] Template inheritance, [B] Request override, [C] Approval respects policy

import { randomUUID } from "crypto";

// Set required env vars
process.env.R2_ACCOUNT_ID = "c4a3b29bfa877132a1f16c5c628dc8a2";
process.env.R2_ACCESS_KEY_ID = "74a9e7f9cd979d926a45c90732537b09";
process.env.R2_SECRET_ACCESS_KEY = "7b80de74545c81c2b93c40e1ddbe00867b0992562147fc6b61ff4cf3eb073418";
process.env.R2_BUCKET_NAME = "axis-attachments";
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Test data
const TENANT_A = "7509c48a-31c5-47b6-8c06-b1394683a7d6";
const ACTOR_A = "f3d87b9b-cb30-4fa4-9792-85468e905fe5";

async function runEvidence() {
  console.log("🧪 EVI013 Evidence Capture\n");

  const { getDb } = await import("@workspace/db");
  const { requestTemplates, requests } = await import("@workspace/db/schema");
  const { eq } = await import("drizzle-orm");
  const { POST: createRequestHandler } = await import(
    "../apps/web/app/api/requests/route"
  );

  const db = getDb();

  console.log("🔧 Setup: Creating template...\n");

  // Create a template with evidence policy
  const [template] = await db
    .insert(requestTemplates)
    .values({
      tenantId: TENANT_A,
      name: "Financial Request Template",
      description: "Requires evidence with 24h TTL",
      evidenceRequiredForApproval: true,
      evidenceTtlSeconds: 86400, // 24 hours
    })
    .returning();

  console.log(`✅ Template created: ${template.id}`);
  console.log(`   Policy: required=${template.evidenceRequiredForApproval}, ttl=${template.evidenceTtlSeconds}s\n`);

  // === [A] Template inheritance (no override) ===
  console.log("═══════════════════════════════════════════════");
  console.log("[A] Template Inheritance (No Override) ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockReq1 = new Request(
    `http://localhost/api/requests`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId: template.id,
      }),
    }
  );

  const createRes1 = await createRequestHandler(mockReq1, {
    params: Promise.resolve({}),
  });
  const body1 = await createRes1.json();

  console.log("Request created from template:");
  console.log(`Status: ${createRes1.status}`);
  console.log(JSON.stringify(body1, null, 2));
  console.log();

  // Query DB to verify policy inheritance
  const req1Id = body1.data?.id;
  const [req1Row] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, req1Id))
    .limit(1);

  console.log("DB row policy fields:");
  console.log(JSON.stringify({
    evidenceRequiredForApproval: req1Row.evidenceRequiredForApproval,
    evidenceTtlSeconds: req1Row.evidenceTtlSeconds,
  }, null, 2));
  console.log();

  // === [B] Request override ===
  console.log("═══════════════════════════════════════════════");
  console.log("[B] Request Override ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockReq2 = new Request(
    `http://localhost/api/requests`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId: template.id,
        evidenceRequiredForApproval: false, // Override template
      }),
    }
  );

  const createRes2 = await createRequestHandler(mockReq2, {
    params: Promise.resolve({}),
  });
  const body2 = await createRes2.json();

  console.log("Request created with override:");
  console.log(`Status: ${createRes2.status}`);
  console.log(JSON.stringify(body2, null, 2));
  console.log();

  // Query DB to verify override
  const req2Id = body2.data?.id;
  const [req2Row] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, req2Id))
    .limit(1);

  console.log("DB row policy fields (should reflect override):");
  console.log(JSON.stringify({
    evidenceRequiredForApproval: req2Row.evidenceRequiredForApproval,
    evidenceTtlSeconds: req2Row.evidenceTtlSeconds,
  }, null, 2));
  console.log();

  // === [C] Approval respects inherited/overridden policy ===
  console.log("═══════════════════════════════════════════════");
  console.log("[C] Approval Respects Policy ✅");
  console.log("═══════════════════════════════════════════════\n");

  const { POST: approveHandler } = await import(
    "../apps/web/app/api/requests/[id]/approve/route"
  );

  // Try to approve req1 (inherited policy: required=true, no evidence attached)
  console.log("Attempting to approve req1 (inherited policy requires evidence):");
  const mockApproveReq1 = new Request(
    `http://localhost/api/requests/${req1Id}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
      },
    }
  );

  const approveRes1 = await approveHandler(mockApproveReq1, {
    params: Promise.resolve({ id: req1Id }),
  });
  const approveBody1 = await approveRes1.json();

  console.log(`Status: ${approveRes1.status}`);
  console.log(JSON.stringify(approveBody1, null, 2));
  console.log();

  // Try to approve req2 (overridden policy: required=false)
  console.log("Attempting to approve req2 (overridden policy does not require evidence):");
  const mockApproveReq2 = new Request(
    `http://localhost/api/requests/${req2Id}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
      },
    }
  );

  const approveRes2 = await approveHandler(mockApproveReq2, {
    params: Promise.resolve({ id: req2Id }),
  });
  const approveBody2 = await approveRes2.json();

  console.log(`Status: ${approveRes2.status}`);
  console.log(JSON.stringify(approveBody2, null, 2));
  console.log();

  // Summary
  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI013 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] Template inheritance → req1 inherits policy: ${
    req1Row.evidenceRequiredForApproval === true &&
    req1Row.evidenceTtlSeconds === 86400
      ? "✅"
      : "❌"
  }
      - evidenceRequiredForApproval: ${req1Row.evidenceRequiredForApproval}
      - evidenceTtlSeconds: ${req1Row.evidenceTtlSeconds}
  
  [B] Request override → req2 reflects override: ${
    req2Row.evidenceRequiredForApproval === false &&
    req2Row.evidenceTtlSeconds === 86400
      ? "✅"
      : "❌"
  }
      - evidenceRequiredForApproval: ${req2Row.evidenceRequiredForApproval}
      - evidenceTtlSeconds: ${req2Row.evidenceTtlSeconds}
  
  [C] Approval respects policy:
      - req1 (inherited required=true) → ${
        approveRes1.status === 409 ? "✅ Blocked" : "❌ Not blocked"
      }
      - req2 (overridden required=false) → ${
        approveRes2.status === 200 ? "✅ Approved" : "❌ Not approved"
      }

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Actor A: ${ACTOR_A}
  Template ID: ${template.id}
  Request 1 (inherited): ${req1Id}
  Request 2 (overridden): ${req2Id}
  `);

  console.log(
    "\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI013-TEMPLATE-POLICY-INHERITANCE.md"
  );
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
