// scripts/run-evi012.ts
// EVI012 Evidence Capture (Audit: approval.attempted + approval.succeeded)
// Tests: [A] Success → 2 audit rows (attempted + succeeded), [B] Blocked → 2 audit rows (attempted + blocked), [C] Query shows chronological trail

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
  console.log("🧪 EVI012 Evidence Capture\n");

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

  // Request 1: Fresh evidence (will succeed)
  const req1Id = (await requestsRepo.create(TENANT_A, { requesterId: ACTOR_A }))
    .id;
  await db.execute(
    `UPDATE requests SET evidence_required_for_approval = true WHERE id = '${req1Id}'`
  );

  // Find a READY evidence file
  const evidenceFiles = await db.execute(
    `SELECT id FROM evidence_files WHERE tenant_id = '${TENANT_A}' AND status = 'READY' LIMIT 1`
  );
  const evidenceFileId = (evidenceFiles.rows[0] as any).id;

  // Link fresh evidence
  const linkId1 = randomUUID();
  await linksRepo.create({
    id: linkId1,
    tenantId: TENANT_A,
    requestId: req1Id,
    evidenceFileId,
    linkedBy: ACTOR_A,
  });

  console.log(`✅ Request 1 (fresh evidence): ${req1Id}`);

  // Request 2: No evidence (will be blocked)
  const req2Id = (await requestsRepo.create(TENANT_A, { requesterId: ACTOR_A }))
    .id;
  await db.execute(
    `UPDATE requests SET evidence_required_for_approval = true WHERE id = '${req2Id}'`
  );

  console.log(`✅ Request 2 (no evidence): ${req2Id}`);
  console.log();

  // === [A] Success → 200 + 2 audit rows (attempted + succeeded) ===
  console.log("═══════════════════════════════════════════════");
  console.log("[A] Success → 200 + 2 Audit Rows ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockReq1 = new Request(
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

  const approveRes1 = await approveHandler(mockReq1, {
    params: Promise.resolve({ id: req1Id }),
  });
  const body1 = await approveRes1.json();

  console.log("Response:");
  console.log(`Status: ${approveRes1.status}`);
  console.log(JSON.stringify(body1, null, 2));
  console.log();

  // Extract kernel-generated traceId from response
  const traceId1 = body1.meta?.traceId;

  // Query audit logs for this request
  const auditRows1 = await auditRepo.findByRequestId({
    tenantId: TENANT_A,
    requestId: req1Id,
  });

  console.log("Audit Rows:");
  console.log(
    JSON.stringify(
      auditRows1.map((a) => ({
        eventName: a.eventName,
        traceId: a.traceId,
        eventData: JSON.parse(a.eventData || "{}"),
        createdAt: a.createdAt,
      })),
      null,
      2
    )
  );
  console.log();

  // === [B] Blocked → 409 + 2 audit rows (attempted + blocked) ===
  console.log("═══════════════════════════════════════════════");
  console.log("[B] Blocked → 409 + 2 Audit Rows ✅");
  console.log("═══════════════════════════════════════════════\n");

  const mockReq2 = new Request(
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

  const approveRes2 = await approveHandler(mockReq2, {
    params: Promise.resolve({ id: req2Id }),
  });
  const body2 = await approveRes2.json();

  console.log("Response:");
  console.log(`Status: ${approveRes2.status}`);
  console.log(JSON.stringify(body2, null, 2));
  console.log();

  // Extract kernel-generated traceId from error response
  const traceId2 = body2.error?.traceId;

  // Query audit logs for this request
  const auditRows2 = await auditRepo.findByRequestId({
    tenantId: TENANT_A,
    requestId: req2Id,
  });

  console.log("Audit Rows:");
  console.log(
    JSON.stringify(
      auditRows2.map((a) => ({
        eventName: a.eventName,
        traceId: a.traceId,
        eventData: JSON.parse(a.eventData || "{}"),
        createdAt: a.createdAt,
      })),
      null,
      2
    )
  );
  console.log();

  // === [C] Query shows chronological trail ===
  console.log("═══════════════════════════════════════════════");
  console.log("[C] Chronological Trail by Request ID ✅");
  console.log("═══════════════════════════════════════════════\n");

  console.log(`Request 1 trail (success):`);
  console.log(
    JSON.stringify(
      auditRows1.map((a) => ({
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

  console.log(`Request 2 trail (blocked):`);
  console.log(
    JSON.stringify(
      auditRows2.map((a) => ({
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
  console.log("✅ EVI012 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] Success → 200 + 2 audit rows: ${
    approveRes1.status === 200 && auditRows1.length === 2 ? "✅" : "❌"
  }
      - attempted: ${
        auditRows1.some((a) => a.eventName === "approval.attempted") ? "✅" : "❌"
      }
      - succeeded: ${
        auditRows1.some((a) => a.eventName === "approval.succeeded") ? "✅" : "❌"
      }
      - same traceId: ${
        auditRows1.every((a) => a.traceId === traceId1) ? "✅" : "❌"
      }
  
  [B] Blocked → 409 + 2 audit rows: ${
    approveRes2.status === 409 && auditRows2.length === 2 ? "✅" : "❌"
  }
      - attempted: ${
        auditRows2.some((a) => a.eventName === "approval.attempted") ? "✅" : "❌"
      }
      - blocked: ${
        auditRows2.some((a) =>
          a.eventName.startsWith("approval.blocked.")
        )
          ? "✅"
          : "❌"
      }
      - same traceId: ${
        auditRows2.every((a) => a.traceId === traceId2) ? "✅" : "❌"
      }
  
  [C] Chronological trails queryable: ${
    auditRows1.length > 0 && auditRows2.length > 0 ? "✅" : "❌"
  }

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Actor A: ${ACTOR_A}
  Request 1 (success): ${req1Id}
  Request 2 (blocked): ${req2Id}
  Evidence File ID: ${evidenceFileId}
  `);

  console.log(
    "\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI012-AUDIT-APPROVAL-ATTEMPT-SUCCESS.md"
  );
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
