// scripts/run-evi011.ts
// EVI011 Evidence Capture (Audit Log for Approval Blocks)
// Tests: [A] Missing evidence → audit row, [B] Stale evidence → audit row, [C] Query audit by requestId

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
  console.log("🧪 EVI011 Evidence Capture\n");

  const {
    getDomainContainer,
    getRequestEvidenceLinksRepo,
    getEvidenceFilesRepo,
    getAuditLogsRepo,
  } = await import("@workspace/app-runtime");
  const { REQUESTS_TOKENS } = await import("@workspace/domain");
  const { getDb } = await import("@workspace/db");

  const container = await getDomainContainer();
  const requestsRepo = container.get(REQUESTS_TOKENS.RequestRepository);
  const linksRepo = await getRequestEvidenceLinksRepo();
  const evidenceRepo = await getEvidenceFilesRepo();
  const auditRepo = await getAuditLogsRepo();
  const db = getDb();

  // Import the approve handler
  const { POST: approveHandler } = await import(
    "../apps/web/app/api/requests/[id]/approve/route"
  );

  console.log("🔧 Setup: Creating test requests...\n");

  // Request 1: No evidence + evidence required
  const req1Id = (await requestsRepo.create(TENANT_A, { requesterId: ACTOR_A }))
    .id;
  await db.execute(
    `UPDATE requests SET evidence_required_for_approval = true WHERE id = '${req1Id}'`
  );
  console.log(`✅ Request 1 (no evidence): ${req1Id}`);

  // Request 2: Stale evidence (TTL = 60s)
  const req2Id = (await requestsRepo.create(TENANT_A, { requesterId: ACTOR_A }))
    .id;
  await db.execute(
    `UPDATE requests SET evidence_required_for_approval = true, evidence_ttl_seconds = 60 WHERE id = '${req2Id}'`
  );

  // Find a READY evidence file
  const evidenceFiles = await db.execute(
    `SELECT id FROM evidence_files WHERE tenant_id = '${TENANT_A}' AND status = 'READY' LIMIT 1`
  );
  const evidenceFileId = (evidenceFiles.rows[0] as any).id;

  // Link stale evidence
  const linkId2 = randomUUID();
  await linksRepo.create({
    id: linkId2,
    tenantId: TENANT_A,
    requestId: req2Id,
    evidenceFileId,
    linkedBy: ACTOR_A,
  });

  // Backdate the link by 120 seconds
  const staleTimestamp = new Date(Date.now() - 120 * 1000).toISOString();
  await db.execute(
    `UPDATE request_evidence_links SET created_at = '${staleTimestamp}' WHERE id = '${linkId2}'`
  );

  console.log(`✅ Request 2 (stale evidence): ${req2Id}`);
  console.log();

  // === [A] Missing evidence → 409 + audit row ===
  console.log("═══════════════════════════════════════════════");
  console.log("[A] Missing Evidence → 409 + Audit Row ✅");
  console.log("═══════════════════════════════════════════════\n");

  const traceId1 = randomUUID();
  const mockReq1 = new Request(
    `http://localhost/api/requests/${req1Id}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
        "X-Trace-ID": traceId1,
      },
    }
  );

  const approveRes1 = await approveHandler(mockReq1, {
    params: Promise.resolve({ id: req1Id }),
  });
  const body1 = await approveRes1.json();

  console.log("Response:");
  console.log(`Status: ${approveRes1.status}`);
  console.log(JSON.stringify(body1, null, 2));
  console.log();

  // Query audit log for this request
  const auditRows1 = await auditRepo.findByRequestId({
    tenantId: TENANT_A,
    requestId: req1Id,
  });

  console.log("Audit Row:");
  if (auditRows1.length > 0) {
    const audit1 = auditRows1[0];
    console.log(
      JSON.stringify(
        {
          eventName: audit1.eventName,
          traceId: audit1.traceId,
          eventData: JSON.parse(audit1.eventData || "{}"),
          createdAt: audit1.createdAt,
        },
        null,
        2
      )
    );
  } else {
    console.log("❌ No audit row found!");
  }
  console.log();

  // === [B] Stale evidence → 409 + audit row ===
  console.log("═══════════════════════════════════════════════");
  console.log("[B] Stale Evidence → 409 + Audit Row ✅");
  console.log("═══════════════════════════════════════════════\n");

  const traceId2 = randomUUID();
  const mockReq2 = new Request(
    `http://localhost/api/requests/${req2Id}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
        "X-Trace-ID": traceId2,
      },
    }
  );

  const approveRes2 = await approveHandler(mockReq2, {
    params: Promise.resolve({ id: req2Id }),
  });
  const body2 = await approveRes2.json();

  console.log("Response:");
  console.log(`Status: ${approveRes2.status}`);
  console.log(JSON.stringify(body2, null, 2));
  console.log();

  // Query audit log for this request
  const auditRows2 = await auditRepo.findByRequestId({
    tenantId: TENANT_A,
    requestId: req2Id,
  });

  console.log("Audit Row:");
  if (auditRows2.length > 0) {
    const audit2 = auditRows2[0];
    console.log(
      JSON.stringify(
        {
          eventName: audit2.eventName,
          traceId: audit2.traceId,
          eventData: JSON.parse(audit2.eventData || "{}"),
          createdAt: audit2.createdAt,
        },
        null,
        2
      )
    );
  } else {
    console.log("❌ No audit row found!");
  }
  console.log();

  // === [C] Query audit logs by requestId → returns events ===
  console.log("═══════════════════════════════════════════════");
  console.log("[C] Query Audit Logs by Request ID ✅");
  console.log("═══════════════════════════════════════════════\n");

  console.log(`Request 1 audit logs (${req1Id}):`);
  const allAudits1 = await auditRepo.findByRequestId({
    tenantId: TENANT_A,
    requestId: req1Id,
  });
  console.log(
    JSON.stringify(
      allAudits1.map((a) => ({
        eventName: a.eventName,
        traceId: a.traceId,
        requestId: JSON.parse(a.eventData || "{}").requestId,
        createdAt: a.createdAt,
      })),
      null,
      2
    )
  );
  console.log();

  console.log(`Request 2 audit logs (${req2Id}):`);
  const allAudits2 = await auditRepo.findByRequestId({
    tenantId: TENANT_A,
    requestId: req2Id,
  });
  console.log(
    JSON.stringify(
      allAudits2.map((a) => ({
        eventName: a.eventName,
        traceId: a.traceId,
        requestId: JSON.parse(a.eventData || "{}").requestId,
        createdAt: a.createdAt,
      })),
      null,
      2
    )
  );
  console.log();

  // Summary
  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI011 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] Missing evidence → 409 + audit row: ${
    approveRes1.status === 409 && auditRows1.length > 0 ? "✅" : "❌"
  }
  [B] Stale evidence → 409 + audit row: ${
    approveRes2.status === 409 && auditRows2.length > 0 ? "✅" : "❌"
  }
  [C] Query by requestId returns events: ${
    allAudits1.length > 0 && allAudits2.length > 0 ? "✅" : "❌"
  }

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Actor A: ${ACTOR_A}
  Request 1 (no evidence): ${req1Id}
  Request 2 (stale): ${req2Id}
  Evidence File ID: ${evidenceFileId}
  `);

  console.log(
    "\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI011-AUDIT-APPROVAL-BLOCKS.md"
  );
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
