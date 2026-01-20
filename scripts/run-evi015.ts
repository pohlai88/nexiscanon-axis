// scripts/run-evi015.ts
// EVI015 Evidence Capture (Template Audit Trail)
// Tests: [A] Create → audit, [B] List → audit, [C] Get → audit

import { randomUUID } from "crypto";

// Set required env vars
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Test data
const TENANT_A = "7509c48a-31c5-47b6-8c06-b1394683a7d6";
const ACTOR_A = "f3d87b9b-cb30-4fa4-9792-85468e905fe5";

async function runEvidence() {
  console.log("🧪 EVI015 Evidence Capture\n");

  const { POST: createTemplateHandler, GET: listTemplatesHandler } = await import(
    "../apps/web/app/api/templates/route"
  );
  const { GET: getTemplateHandler } = await import(
    "../apps/web/app/api/templates/[id]/route"
  );
  const { getAuditLogsRepo } = await import("@workspace/app-runtime");

  const auditRepo = await getAuditLogsRepo();

  // === [A] Create template → 200 + audit row (template.created) ===
  console.log("═══════════════════════════════════════════════");
  console.log("[A] Create Template → 200 + Audit Row ✅");
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
      name: "Audit Test Template",
      description: "For EVI015 evidence",
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
  const createTraceId = createBody.meta?.traceId;

  if (createRes.status !== 200 || !templateId || !createTraceId) {
    console.error("❌ Expected 200 with template ID and traceId.");
    process.exit(1);
  }

  // Query audit logs for this traceId
  const createAuditRows = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: createTraceId,
  });

  const createAuditRow = createAuditRows.find(
    (r) => r.eventName === "template.created"
  );

  console.log("Audit Row:");
  if (createAuditRow) {
    console.log(JSON.stringify({
      eventName: createAuditRow.eventName,
      traceId: createAuditRow.traceId,
      eventData: JSON.parse(createAuditRow.eventData || "{}"),
      createdAt: createAuditRow.createdAt,
    }, null, 2));
  } else {
    console.error("❌ Audit row not found for template.created");
    process.exit(1);
  }
  console.log();

  // === [B] List templates → 200 + audit row (template.listed) ===
  console.log("═══════════════════════════════════════════════");
  console.log("[B] List Templates → 200 + Audit Row ✅");
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

  const listTraceId = listBody.meta?.traceId;

  if (listRes.status !== 200 || !listTraceId) {
    console.error("❌ Expected 200 with traceId.");
    process.exit(1);
  }

  // Query audit logs for this traceId
  const listAuditRows = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: listTraceId,
  });

  const listAuditRow = listAuditRows.find(
    (r) => r.eventName === "template.listed"
  );

  console.log("Audit Row:");
  if (listAuditRow) {
    console.log(JSON.stringify({
      eventName: listAuditRow.eventName,
      traceId: listAuditRow.traceId,
      eventData: JSON.parse(listAuditRow.eventData || "{}"),
      createdAt: listAuditRow.createdAt,
    }, null, 2));
  } else {
    console.error("❌ Audit row not found for template.listed");
    process.exit(1);
  }
  console.log();

  // === [C] Get template by id → 200 + audit row (template.read) ===
  console.log("═══════════════════════════════════════════════");
  console.log("[C] Get Template by ID → 200 + Audit Row ✅");
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

  const getTraceId = getBody.meta?.traceId;

  if (getRes.status !== 200 || !getTraceId) {
    console.error("❌ Expected 200 with traceId.");
    process.exit(1);
  }

  // Query audit logs for this traceId
  const getAuditRows = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: getTraceId,
  });

  const getAuditRow = getAuditRows.find(
    (r) => r.eventName === "template.read"
  );

  console.log("Audit Row:");
  if (getAuditRow) {
    console.log(JSON.stringify({
      eventName: getAuditRow.eventName,
      traceId: getAuditRow.traceId,
      eventData: JSON.parse(getAuditRow.eventData || "{}"),
      createdAt: getAuditRow.createdAt,
    }, null, 2));
  } else {
    console.error("❌ Audit row not found for template.read");
    process.exit(1);
  }
  console.log();

  // Summary
  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI015 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] Create template → 200 + audit row: ${
    createAuditRow && createAuditRow.traceId === createTraceId ? "✅" : "❌"
  }
      - eventName: ${createAuditRow?.eventName}
      - traceId matches response: ${createAuditRow?.traceId === createTraceId ? "✅" : "❌"}
      - eventData.templateId matches: ${JSON.parse(createAuditRow?.eventData || "{}").templateId === templateId ? "✅" : "❌"}
  
  [B] List templates → 200 + audit row: ${
    listAuditRow && listAuditRow.traceId === listTraceId ? "✅" : "❌"
  }
      - eventName: ${listAuditRow?.eventName}
      - traceId matches response: ${listAuditRow?.traceId === listTraceId ? "✅" : "❌"}
      - eventData.count matches: ${JSON.parse(listAuditRow?.eventData || "{}").count === listBody.data?.templates?.length ? "✅" : "❌"}
  
  [C] Get template → 200 + audit row: ${
    getAuditRow && getAuditRow.traceId === getTraceId ? "✅" : "❌"
  }
      - eventName: ${getAuditRow?.eventName}
      - traceId matches response: ${getAuditRow?.traceId === getTraceId ? "✅" : "❌"}
      - eventData.templateId matches: ${JSON.parse(getAuditRow?.eventData || "{}").templateId === templateId ? "✅" : "❌"}

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Actor A: ${ACTOR_A}
  Template ID: ${templateId}
  Create traceId: ${createTraceId}
  List traceId: ${listTraceId}
  Get traceId: ${getTraceId}
  `);

  console.log(
    "\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI015-TEMPLATE-AUDIT.md"
  );
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
