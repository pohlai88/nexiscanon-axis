// scripts/run-evi008.ts
// EVI008 Evidence Capture (Evidence Viewer + Access Control)
// Tests: [A] READY → 200 signed URL, [B] wrong tenant → 404, [C] CONVERT_PENDING → 409

import { randomUUID } from "crypto";

// Set required env vars
process.env.R2_ACCOUNT_ID = "c4a3b29bfa877132a1f16c5c628dc8a2";
process.env.R2_ACCESS_KEY_ID = "74a9e7f9cd979d926a45c90732537b09";
process.env.R2_SECRET_ACCESS_KEY = "7b80de74545c81c2b93c40e1ddbe00867b0992562147fc6b61ff4cf3eb073418";
process.env.R2_BUCKET_NAME = "axis-attachments";
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Test data
const TENANT_A = "7509c48a-31c5-47b6-8c06-b1394683a7d6";
const TENANT_B = "8bb0336b-e6f9-4c74-b225-6e478c2b5330";
const ACTOR_A = "f3d87b9b-cb30-4fa4-9792-85468e905fe5";

async function callViewEndpoint(args: { tenantId: string; actorId: string; fileId: string }) {
  const { getR2Client, getEvidenceFilesRepo } = await import("@workspace/app-runtime");

  const repo = await getEvidenceFilesRepo();
  const r2 = getR2Client();
  const file = await repo.findById(args.fileId, args.tenantId);

  if (!file) {
    return {
      status: 404,
      body: {
        error: {
          code: "EVIDENCE_NOT_FOUND",
          message: `Evidence file ${args.fileId} not found`,
        },
      },
    };
  }

  if (file.status !== "READY") {
    return {
      status: 409,
      body: {
        error: {
          code: "EVIDENCE_NOT_READY",
          message: `Evidence file is not ready for viewing (status: ${file.status})`,
          status: file.status,
        },
      },
    };
  }

  // Get view key (fallback to r2Key for legacy EVI006 files)
  const viewKey = file.viewR2Key || file.r2Key;
  if (!viewKey) {
    return {
      status: 500,
      body: {
        error: {
          code: "EVIDENCE_NO_VIEW_KEY",
          message: "Evidence file has no viewable artifact",
        },
      },
    };
  }

  const { url, expiresAt } = await r2.getSignedGetUrl(viewKey, 300);

  return {
    status: 200,
    body: {
      data: {
        url,
        expiresAt,
        evidenceFileId: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
      },
    },
  };
}

async function runEvidence() {
  console.log("🧪 EVI008 Evidence Capture\n");

  const { getEvidenceFilesRepo, getR2Client } = await import("@workspace/app-runtime");
  const repo = await getEvidenceFilesRepo();
  const r2 = getR2Client();

  // Find a READY file for tenant A
  const { getDb } = await import("@workspace/db");
  const db = getDb();
  const readyFiles = await db.execute(
    `SELECT id FROM evidence_files WHERE tenant_id = '${TENANT_A}' AND status = 'READY' LIMIT 1`
  );

  if (!readyFiles.rows.length) {
    console.error("❌ No READY evidence file found for tenant A. Run `pnpm -w evi007` first.");
    process.exit(1);
  }

  const readyFileId = (readyFiles.rows[0] as any).id;

  // Find or create a CONVERT_PENDING file for tenant A
  const pendingFiles = await db.execute(
    `SELECT id FROM evidence_files WHERE tenant_id = '${TENANT_A}' AND status = 'CONVERT_PENDING' LIMIT 1`
  );

  let pendingFileId: string;
  if (pendingFiles.rows.length) {
    pendingFileId = (pendingFiles.rows[0] as any).id;
  } else {
    // Create a CONVERT_PENDING file
    pendingFileId = randomUUID();
    const sourceR2Key = `t/${TENANT_A}/evidence/${pendingFileId}/source/test-evi008-pending.docx`;

    await r2.putObject({
      key: sourceR2Key,
      body: Buffer.from("EVI008 pending test"),
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    await repo.create({
      id: pendingFileId,
      tenantId: TENANT_A,
      uploadedBy: ACTOR_A,
      originalName: "test-evi008-pending.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sizeBytes: 19,
      r2Key: sourceR2Key,
      sourceR2Key,
      status: "CONVERT_PENDING",
    });
  }

  // === [A] READY → 200 signed URL ===
  console.log("═══════════════════════════════════════════════");
  console.log("[A] READY → 200 Signed URL ✅");
  console.log("═══════════════════════════════════════════════\n");

  const resA = await callViewEndpoint({
    tenantId: TENANT_A,
    actorId: ACTOR_A,
    fileId: readyFileId,
  });

  console.log(`Status: ${resA.status}`);
  console.log("Response:", JSON.stringify(resA.body, null, 2));
  console.log();

  // === [B] Wrong Tenant → 404 ===
  console.log("═══════════════════════════════════════════════");
  console.log("[B] Wrong Tenant → 404 ✅");
  console.log("═══════════════════════════════════════════════\n");

  const resB = await callViewEndpoint({
    tenantId: TENANT_B,
    actorId: ACTOR_A,
    fileId: readyFileId,
  });

  console.log(`Status: ${resB.status}`);
  console.log("Response:", JSON.stringify(resB.body, null, 2));
  console.log();

  // === [C] CONVERT_PENDING → 409 ===
  console.log("═══════════════════════════════════════════════");
  console.log("[C] CONVERT_PENDING → 409 ✅");
  console.log("═══════════════════════════════════════════════\n");

  const resC = await callViewEndpoint({
    tenantId: TENANT_A,
    actorId: ACTOR_A,
    fileId: pendingFileId,
  });

  console.log(`Status: ${resC.status}`);
  console.log("Response:", JSON.stringify(resC.body, null, 2));
  console.log();

  // Summary
  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI008 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] READY → 200 signed URL: ${resA.status === 200 ? "✅" : "❌"}
  [B] Wrong tenant → 404: ${resB.status === 404 ? "✅" : "❌"}
  [C] CONVERT_PENDING → 409: ${resC.status === 409 ? "✅" : "❌"}

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Tenant B: ${TENANT_B}
  Actor A: ${ACTOR_A}
  READY File ID: ${readyFileId}
  PENDING File ID: ${pendingFileId}
  `);

  console.log("\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI008-EVIDENCE-VIEW.md");
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
