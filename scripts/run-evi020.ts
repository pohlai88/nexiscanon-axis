// scripts/run-evi020.ts
// EVI020 Evidence Capture (Reporting Contracts)
// Tests: [A] JSON format, [B] PDF placeholder format

import { randomUUID } from "crypto";

// Set required env vars
process.env.DATABASE_URL =
  "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Test data
const TENANT_A = "7509c48a-31c5-47b6-8c06-b1394683a7d6";
const ACTOR_A = "f3d87b9b-cb30-4fa4-9792-85468e905fe5";

async function runEvidence() {
  console.log("🧪 EVI020 Evidence Capture\n");

  const { POST: generateReportHandler } = await import(
    "../apps/web/app/api/reports/generate/route"
  );
  const { GET: getReportHandler } = await import(
    "../apps/web/app/api/reports/[reportId]/route"
  );
  const { getAuditLogsRepo } = await import("@workspace/app-runtime");

  const auditRepo = await getAuditLogsRepo();

  // === [A] Generate report with format=json ===
  console.log("═══════════════════════════════════════════════");
  console.log('[A] Generate Report (format="json") ✅');
  console.log("═══════════════════════════════════════════════\n");

  const entityIdA = randomUUID();

  const mockReqA = new Request(`http://localhost/api/reports/generate`, {
    method: "POST",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reportType: "purchase_order",
      entityId: entityIdA,
      format: "json",
      locale: "vi",
    }),
  });

  const resA = await generateReportHandler(mockReqA, {
    params: Promise.resolve({}),
  });
  const bodyA = await resA.json();

  console.log("Response:");
  console.log(`Status: ${resA.status}`);
  console.log(JSON.stringify(bodyA, null, 2));
  console.log();

  const traceIdA = bodyA.meta?.traceId;
  const reportIdA = bodyA.data?.reportId;

  if (resA.status !== 200 || !reportIdA || !traceIdA) {
    console.error("❌ Expected 200 with reportId and traceId.");
    process.exit(1);
  }

  // Verify receipt structure
  if (
    !bodyA.data?.jobId ||
    bodyA.data?.status !== "ACCEPTED" ||
    bodyA.data?.format !== "json" ||
    !bodyA.data?.artifact ||
    bodyA.data?.artifact.kind !== "inline_json"
  ) {
    console.error("❌ Receipt structure invalid for JSON format.");
    process.exit(1);
  }

  // Wait for async audit write
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Query audit logs for this traceId
  const auditRowsA = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: traceIdA,
  });

  const auditRowA = auditRowsA.find(
    (r) => r.eventName === "report.generate.requested"
  );

  console.log("Audit Row:");
  if (auditRowA) {
    const eventData = JSON.parse(auditRowA.eventData || "{}");
    console.log(
      JSON.stringify(
        {
          eventName: auditRowA.eventName,
          traceId: auditRowA.traceId,
          eventData,
          createdAt: auditRowA.createdAt,
        },
        null,
        2
      )
    );

    if (
      eventData.reportId !== reportIdA ||
      eventData.reportType !== "purchase_order" ||
      eventData.format !== "json" ||
      eventData.locale !== "vi" ||
      eventData.source !== "api"
    ) {
      console.error("❌ Audit row does not match expected payload.");
      process.exit(1);
    }
  } else {
    console.error("❌ Audit row not found for report.generate.requested");
    process.exit(1);
  }
  console.log();

  // Test GET /api/reports/:reportId
  console.log("Testing GET /api/reports/:reportId...\n");

  const mockGetReqA = new Request(
    `http://localhost/api/reports/${reportIdA}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer dev",
        "X-Tenant-ID": TENANT_A,
        "X-Actor-ID": ACTOR_A,
      },
    }
  );

  const getResA = await getReportHandler(mockGetReqA, {
    params: Promise.resolve({ reportId: reportIdA }),
  });
  const getBodyA = await getResA.json();

  console.log("GET Response:");
  console.log(`Status: ${getResA.status}`);
  console.log(JSON.stringify(getBodyA, null, 2));
  console.log();

  if (getResA.status !== 200 || getBodyA.data?.reportId !== reportIdA) {
    console.error("❌ GET report status failed.");
    process.exit(1);
  }

  // === [B] Generate report with format=pdf_placeholder ===
  console.log("═══════════════════════════════════════════════");
  console.log('[B] Generate Report (format="pdf_placeholder") ✅');
  console.log("═══════════════════════════════════════════════\n");

  const entityIdB = randomUUID();

  const mockReqB = new Request(`http://localhost/api/reports/generate`, {
    method: "POST",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reportType: "goods_receipt_note",
      entityId: entityIdB,
      format: "pdf_placeholder",
    }),
  });

  const resB = await generateReportHandler(mockReqB, {
    params: Promise.resolve({}),
  });
  const bodyB = await resB.json();

  console.log("Response:");
  console.log(`Status: ${resB.status}`);
  console.log(JSON.stringify(bodyB, null, 2));
  console.log();

  const traceIdB = bodyB.meta?.traceId;
  const reportIdB = bodyB.data?.reportId;

  if (resB.status !== 200 || !reportIdB || !traceIdB) {
    console.error("❌ Expected 200 with reportId and traceId.");
    process.exit(1);
  }

  // Verify receipt structure
  if (
    !bodyB.data?.jobId ||
    bodyB.data?.status !== "ACCEPTED" ||
    bodyB.data?.format !== "pdf_placeholder" ||
    !bodyB.data?.artifact ||
    bodyB.data?.artifact.kind !== "placeholder"
  ) {
    console.error("❌ Receipt structure invalid for PDF placeholder format.");
    process.exit(1);
  }

  // Wait for async audit write
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Query audit logs for this traceId
  const auditRowsB = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: traceIdB,
  });

  const auditRowB = auditRowsB.find(
    (r) => r.eventName === "report.generate.requested"
  );

  console.log("Audit Row:");
  if (auditRowB) {
    const eventData = JSON.parse(auditRowB.eventData || "{}");
    console.log(
      JSON.stringify(
        {
          eventName: auditRowB.eventName,
          traceId: auditRowB.traceId,
          eventData,
          createdAt: auditRowB.createdAt,
        },
        null,
        2
      )
    );

    if (
      eventData.reportId !== reportIdB ||
      eventData.reportType !== "goods_receipt_note" ||
      eventData.format !== "pdf_placeholder" ||
      eventData.source !== "api"
    ) {
      console.error("❌ Audit row does not match expected payload.");
      process.exit(1);
    }
  } else {
    console.error("❌ Audit row not found for report.generate.requested");
    process.exit(1);
  }
  console.log();

  // Summary
  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI020 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] JSON format → report.generate.requested audit: ✅
      - reportType: "purchase_order"
      - format: "json"
      - artifact.kind: "inline_json"
      - locale: "vi"
      - traceId matches response: ✅
      - GET /api/reports/:reportId works: ✅
  
  [B] PDF placeholder format → report.generate.requested audit: ✅
      - reportType: "goods_receipt_note"
      - format: "pdf_placeholder"
      - artifact.kind: "placeholder"
      - traceId matches response: ✅

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Actor A: ${ACTOR_A}
  Entity A (PO): ${entityIdA}
  Entity B (GRN): ${entityIdB}
  Report A (JSON): ${reportIdA}
  Report B (PDF): ${reportIdB}
  TraceId A: ${traceIdA}
  TraceId B: ${traceIdB}
  `);

  console.log(
    "\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI020-REPORTING-CONTRACTS.md"
  );
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
