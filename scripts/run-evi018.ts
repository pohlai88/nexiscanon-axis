// scripts/run-evi018.ts
// EVI018 Evidence Capture (Request Creation Audit Trail)
// Tests: [A] Template source, [B] Override source, [C] Default source

import { randomUUID } from "crypto";

// Set required env vars
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ljY4G2SeHrBO@ep-fancy-wildflower-a1o82bpk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Test data
const TENANT_A = "7509c48a-31c5-47b6-8c06-b1394683a7d6";
const ACTOR_A = "f3d87b9b-cb30-4fa4-9792-85468e905fe5";

async function runEvidence() {
  console.log("🧪 EVI018 Evidence Capture\n");

  const { POST: createRequestHandler } = await import(
    "../apps/web/app/api/requests/route"
  );
  const { POST: createTemplateHandler } = await import(
    "../apps/web/app/api/templates/route"
  );
  const { getAuditLogsRepo } = await import("@workspace/app-runtime");

  const auditRepo = await getAuditLogsRepo();

  // === Setup: Create template ===
  console.log("🔧 Setup: Creating template...\n");

  const mockCreateTemplateReq = new Request(`http://localhost/api/templates`, {
    method: "POST",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "EVI018 Test Template",
      description: "For audit trail evidence",
      evidenceRequiredForApproval: true,
      evidenceTtlSeconds: 7200,
    }),
  });

  const createTemplateRes = await createTemplateHandler(mockCreateTemplateReq, {
    params: Promise.resolve({}),
  });
  const createTemplateBody = await createTemplateRes.json();
  const templateId = createTemplateBody.data?.id;

  console.log(`✅ Template created: ${templateId}\n`);

  // === [A] Create request with template → audit with source:"template" ===
  console.log("═══════════════════════════════════════════════");
  console.log('[A] Template Source → audit "source":"template" ✅');
  console.log("═══════════════════════════════════════════════\n");

  const mockReqA = new Request(`http://localhost/api/requests`, {
    method: "POST",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requesterId: ACTOR_A,
      templateId: templateId,
    }),
  });

  const resA = await createRequestHandler(mockReqA, {
    params: Promise.resolve({}),
  });
  const bodyA = await resA.json();

  console.log("Response:");
  console.log(`Status: ${resA.status}`);
  console.log(JSON.stringify(bodyA, null, 2));
  console.log();

  const traceIdA = bodyA.meta?.traceId;
  const requestIdA = bodyA.data?.id;

  if (resA.status !== 200 || !requestIdA || !traceIdA) {
    console.error("❌ Expected 200 with request ID and traceId.");
    process.exit(1);
  }

  // Query audit logs for this traceId
  const auditRowsA = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: traceIdA,
  });

  const auditRowA = auditRowsA.find((r) => r.eventName === "request.created");

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
      eventData.source !== "template" ||
      eventData.templateId !== templateId ||
      !eventData.effectivePolicy?.evidenceRequiredForApproval ||
      eventData.effectivePolicy?.evidenceTtlSeconds !== 7200
    ) {
      console.error(
        "❌ Audit row does not match expected template source payload."
      );
      process.exit(1);
    }
  } else {
    console.error("❌ Audit row not found for request.created");
    process.exit(1);
  }
  console.log();

  // === [B] Create request with override → audit with source:"override" ===
  console.log("═══════════════════════════════════════════════");
  console.log('[B] Override Source → audit "source":"override" ✅');
  console.log("═══════════════════════════════════════════════\n");

  const mockReqB = new Request(`http://localhost/api/requests`, {
    method: "POST",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requesterId: ACTOR_A,
      templateId: templateId,
      evidenceRequiredForApproval: false, // Override
      evidenceTtlSeconds: 1800, // Override
    }),
  });

  const resB = await createRequestHandler(mockReqB, {
    params: Promise.resolve({}),
  });
  const bodyB = await resB.json();

  console.log("Response:");
  console.log(`Status: ${resB.status}`);
  console.log(JSON.stringify(bodyB, null, 2));
  console.log();

  const traceIdB = bodyB.meta?.traceId;
  const requestIdB = bodyB.data?.id;

  if (resB.status !== 200 || !requestIdB || !traceIdB) {
    console.error("❌ Expected 200 with request ID and traceId.");
    process.exit(1);
  }

  // Wait for async audit write to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Query audit logs for this traceId
  const auditRowsB = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: traceIdB,
  });

  const auditRowB = auditRowsB.find((r) => r.eventName === "request.created");

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
      eventData.source !== "override" ||
      eventData.templateId !== templateId ||
      eventData.effectivePolicy?.evidenceRequiredForApproval !== false ||
      eventData.effectivePolicy?.evidenceTtlSeconds !== 1800
    ) {
      console.error(
        "❌ Audit row does not match expected override source payload."
      );
      process.exit(1);
    }
  } else {
    console.error("❌ Audit row not found for request.created");
    process.exit(1);
  }
  console.log();

  // === [C] Create request without template → audit with source:"default" ===
  console.log("═══════════════════════════════════════════════");
  console.log('[C] Default Source → audit "source":"default" ✅');
  console.log("═══════════════════════════════════════════════\n");

  const mockReqC = new Request(`http://localhost/api/requests`, {
    method: "POST",
    headers: {
      Authorization: "Bearer dev",
      "X-Tenant-ID": TENANT_A,
      "X-Actor-ID": ACTOR_A,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requesterId: ACTOR_A,
      // No templateId, no overrides
    }),
  });

  const resC = await createRequestHandler(mockReqC, {
    params: Promise.resolve({}),
  });
  const bodyC = await resC.json();

  console.log("Response:");
  console.log(`Status: ${resC.status}`);
  console.log(JSON.stringify(bodyC, null, 2));
  console.log();

  const traceIdC = bodyC.meta?.traceId;
  const requestIdC = bodyC.data?.id;

  if (resC.status !== 200 || !requestIdC || !traceIdC) {
    console.error("❌ Expected 200 with request ID and traceId.");
    process.exit(1);
  }

  // Wait for async audit write to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Query audit logs for this traceId
  const auditRowsC = await auditRepo.findByTraceId({
    tenantId: TENANT_A,
    traceId: traceIdC,
  });

  const auditRowC = auditRowsC.find((r) => r.eventName === "request.created");

  console.log("Audit Row:");
  if (auditRowC) {
    const eventData = JSON.parse(auditRowC.eventData || "{}");
    console.log(
      JSON.stringify(
        {
          eventName: auditRowC.eventName,
          traceId: auditRowC.traceId,
          eventData,
          createdAt: auditRowC.createdAt,
        },
        null,
        2
      )
    );

    if (
      eventData.source !== "default" ||
      eventData.templateId !== null ||
      eventData.effectivePolicy?.evidenceRequiredForApproval !== false ||
      eventData.effectivePolicy?.evidenceTtlSeconds !== null
    ) {
      console.error(
        "❌ Audit row does not match expected default source payload."
      );
      process.exit(1);
    }
  } else {
    console.error("❌ Audit row not found for request.created");
    process.exit(1);
  }
  console.log();

  // Summary
  console.log("═══════════════════════════════════════════════");
  console.log("✅ EVI018 Evidence Capture COMPLETE");
  console.log("═══════════════════════════════════════════════");
  console.log(`
Captured Evidence:
  [A] Template source → request.created audit: ✅
      - source: "template"
      - templateId: ${templateId}
      - effectivePolicy: evidenceRequired=true, ttl=7200s
      - traceId matches response: ✅
  
  [B] Override source → request.created audit: ✅
      - source: "override"
      - templateId: ${templateId}
      - effectivePolicy: evidenceRequired=false, ttl=1800s (overridden)
      - traceId matches response: ✅
  
  [C] Default source → request.created audit: ✅
      - source: "default"
      - templateId: null
      - effectivePolicy: evidenceRequired=false, ttl=null
      - traceId matches response: ✅

Test Context (Self-Contained):
  Tenant A: ${TENANT_A}
  Actor A: ${ACTOR_A}
  Template ID: ${templateId}
  Request A (template): ${requestIdA}
  Request B (override): ${requestIdB}
  Request C (default): ${requestIdC}
  TraceId A: ${traceIdA}
  TraceId B: ${traceIdB}
  TraceId C: ${traceIdC}
  `);

  console.log(
    "\n📋 Next: Copy outputs above into .cursor/plans/C-evidence-evi/EVI018-REQUEST-AUDIT.md"
  );
  process.exit(0);
}

runEvidence().catch((err) => {
  console.error("\n❌ Evidence capture failed:");
  console.error(err);
  process.exit(1);
});
