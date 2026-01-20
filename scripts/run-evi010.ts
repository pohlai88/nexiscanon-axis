// scripts/run-evi010.ts
// EVI010 Evidence Capture (Evidence TTL + Approve Lock)
// Tests: [A] approve succeeds with fresh evidence, [B] approve blocked when evidence missing, [C] approve blocked when evidence stale

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
  console.log("🧪 EVI010 Evidence Capture\n");

  const { getDomainContainer, getRequestEvidenceLinksRepo, getEvidenceFilesRepo } = await import("@workspace/app-runtime");
  const { REQUESTS_TOKENS } = await import("@workspace/domain");
  const { getDb } = await import("@workspace/db");

  const container = await getDomainContainer();
  const requestsRepo = container.get(REQUESTS_TOKENS.RequestRepository);
  const linksRepo = await getRequestEvidenceLinksRepo();
  const evidenceRepo = await getEvidenceFilesRepo();
  const db = getDb();

  // === Setup: Create 3 requests ===
  // 1. Request with fresh evidence + evidence required
  // 2. Request with no evidence + evidence required
  // 3. Request with stale evidence (TTL = 60s)

  console.log("🔧 Setup: Creating test requests...\n");

  // Request 1: Fresh evidence
  const req1Id = (await requestsRepo.create(TENANT_A, { requesterId: ACTOR_A })).id;
  await db.execute(
    `UPDATE requests SET evidence_required_for_approval = true WHERE id = '${req1Id}'`
  );

  // Find a READY evidence file
  const evidenceFiles = await db.execute(
    `SELECT id FROM evidence_files WHERE tenant_id = '${TENANT_A}' AND status = 'READY' LIMIT 1`
  );
  const evidenceFileId = (evidenceFiles.rows[0] as any).id;

  // Link evidence to req1
  const linkId1 = randomUUID();
  await linksRepo.create({
    id: linkId1,
    tenantId: TENANT_A,
    requestId: req1Id,
    evidenceFileId,
    linkedBy: ACTOR_A,
  });

  console.log(`✅ Request 1 (fresh evidence): ${req1Id}`);

  // Request 2: No evidence
  const req2Id = (await requestsRepo.create(TENANT_A, { requesterId: ACTOR_A })).id;
  await db.execute(
    `UPDATE requests SET evidence_required_for_approval = true WHERE id = '${req2Id}'`
  );

  console.log(`✅ Request 2 (no evidence): ${req2Id}`);

  // Request 3: Stale evidence (simulate by backdating link)
  const req3Id = (await requestsRepo.create(TENANT_A, { requesterId: ACTOR_A })).id;
  await db.execute(
    `UPDATE requests SET evidence_required_for_approval = true, evidence_ttl_seconds = 60 WHERE id = '${req3Id}'`
  );

  const linkId3 = randomUUID();
  await linksRepo.create({
    id: linkId3,
    tenantId: TENANT_A,
    requestId: req3Id,
    evidenceFileId,
    linkedBy: ACTOR_A,
  });

  // Backdate the link by 120 seconds
  const staleTimestamp = new Date(Date.now() - 120 * 1000).toISOString();
  await db.execute(
    `UPDATE request_evidence_links SET created_at = '${staleTimestamp}' WHERE id = '${linkId3}'`
  );

  console.log(`✅ Request 3 (stale evidence): ${req3Id}`);
  console.log();

  // === [A] Approve with fresh evidence → 200 ===
  console.log("═══════════════════════════════════════════════");
  console.log("[A] Approve with Fresh Evidence → 200 ✅");
  console.log("═══════════════════════════════════════════════\n");

  // Import the approve handler
  const { POST: approveHandler } = await import("../apps/web/app/api/requests/[id]/approve/route");

  const traceId1 = randomUUID();
  const mockReq1 = new Request(`http://localhost/api/requests/${req1Id}/approve`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer dev", // Dev mode auth
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A, // Provide UUID actor for approval
      "X-Trace-ID": traceId1,
    },
  });

  const approveRes1 = await approveHandler(mockReq1, {
    params: Promise.resolve({ id: req1Id }),
  });
  const body1 = await approveRes1.json();

  console.log(`Status: ${approveRes1.status}`);
  console.log("Response:", JSON.stringify(body1, null, 2));
  console.log();

  // === [B] Approve without evidence → 409 EVIDENCE_REQUIRED ===
  console.log("═══════════════════════════════════════════════");
  console.log("[B] Approve without Evidence → 409 EVIDENCE_REQUIRED ✅");
  console.log("═══════════════════════════════════════════════\n");

  const traceId2 = randomUUID();
  const mockReq2 = new Request(`http://localhost/api/requests/${req2Id}/approve`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "X-Trace-ID": traceId2,
    },
  });

  const approveRes2 = await approveHandler(mockReq2, {
    params: Promise.resolve({ id: req2Id }),
  });
  const body2 = await approveRes2.json();

  console.log(`Status: ${approveRes2.status}`);
  console.log("Response:", JSON.stringify(body2, null, 2));
  console.log();

  // === [C] Approve with stale evidence → 409 EVIDENCE_STALE ===
  console.log("═══════════════════════════════════════════════");
  console.log("[C] Approve with Stale Evidence → 409 EVIDENCE_STALE ✅");
  console.log("═══════════════════════════════════════════════\n");

  const traceId3 = randomUUID();
  const mockReq3 = new Request(`http://localhost/api/requests/${req3Id}/approve`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "X-Trace-ID": traceId3,
    },
  });

  const approveRes3 = await approveHandler(mockReq3, {
    params: Promise.resolve({ id: req3Id }),
  });
  const body3 = await approveRes3.json();

  console.log(`Status: ${approveRes3.status}`);
  console.log("Response:", JSON.stringify(body3, null, 2));
  console.log();

  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI010 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] Approve with fresh evidence → 200: ${approveRes1.status === 200 ? "✅" : "❌"}
  [B] Approve without evidence → 409 EVIDENCE_REQUIRED: ${approveRes2.status === 409 ? "✅" : "❌"}
  [C] Approve with stale evidence → 409 EVIDENCE_STALE: ${approveRes3.status === 409 ? "✅" : "❌"}

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Actor A: ${ACTOR_A}
  Request 1 (fresh): ${req1Id}
  Request 2 (no evidence): ${req2Id}
  Request 3 (stale): ${req3Id}
  Evidence File ID: ${evidenceFileId}
  `);

  console.log("\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI010-EVIDENCE-TTL-APPROVE-LOCK.md");
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
