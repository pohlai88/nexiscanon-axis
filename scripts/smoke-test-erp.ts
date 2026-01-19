// scripts/smoke-test-erp.ts
// ERP Phase 1 Smoke Test: Create → List → Update → Verify Audit
//
// Tests end-to-end flow with real database:
// 1. POST /api/erp/base/uoms (create)
// 2. GET /api/erp/base/uoms (list)
// 3. PATCH /api/erp/base/uoms/:id (update)
// 4. Verify audit events exist in erp_audit_events table
//
// Environment variables:
// - SMOKE_BASE_URL: API base URL (default: http://localhost:3000)
// - SMOKE_AUTH_TOKEN: Auth token (required if kernel.auth.mode = "required")
// - SMOKE_TENANT_ID: Tenant ID (default: test-smoke-tenant)
// - SMOKE_DB_URL: Database URL (optional, for automatic audit verification)

import * as http from "node:http";
import { Pool } from "pg";

// ---- Config ----

const SMOKE_BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const SMOKE_AUTH_TOKEN = process.env.SMOKE_AUTH_TOKEN;
const SMOKE_TENANT_ID = process.env.SMOKE_TENANT_ID || "test-smoke-tenant";
const SMOKE_DB_URL = process.env.SMOKE_DB_URL;

// Fail fast if auth required but not provided
function checkConfig(): void {
  console.log("🔍 Checking configuration...\n");
  console.log(`Base URL: ${SMOKE_BASE_URL}`);
  console.log(`Tenant ID: ${SMOKE_TENANT_ID}`);
  console.log(`Auth Token: ${SMOKE_AUTH_TOKEN ? "✅ Provided" : "⚠️  Not provided"}`);
  console.log(`DB URL: ${SMOKE_DB_URL ? "✅ Provided (auto audit verify)" : "ℹ️  Not provided (manual audit verify)"}\n`);

  if (!SMOKE_AUTH_TOKEN) {
    console.warn("⚠️  WARNING: SMOKE_AUTH_TOKEN not set.");
    console.warn("   If your kernel requires auth, requests will fail.");
    console.warn("   Set SMOKE_AUTH_TOKEN=<token> to authenticate.\n");
  }
}

interface ApiResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  rawBody?: string;
}

async function request<T = any>(
  method: string,
  path: string,
  body?: any
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SMOKE_BASE_URL);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-id": SMOKE_TENANT_ID,
    };

    // Add auth token if provided
    if (SMOKE_AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${SMOKE_AUTH_TOKEN}`;
    }

    const options = {
      method,
      headers,
    };

    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode || 500,
            data: parsed?.data ?? parsed,
            error: parsed?.error,
            rawBody: data,
          });
        } catch (parseError) {
          // JSON parse failed - likely HTML error page or non-JSON response
          resolve({
            status: res.statusCode || 500,
            error: `Failed to parse JSON response: ${data.slice(0, 200)}`,
            rawBody: data,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function verifyAuditTrail(entityId: string): Promise<void> {
  if (!SMOKE_DB_URL) {
    console.log("   ℹ️  No SMOKE_DB_URL provided - manual verification required");
    console.log(`   SQL:`);
    console.log(
      `   SELECT event_type, occurred_at, actor_user_id FROM erp_audit_events WHERE entity_id = '${entityId}' ORDER BY occurred_at;`
    );
    console.log(`   Expected: 2 rows (erp.base.uom.created, erp.base.uom.updated)\n`);
    return;
  }

  console.log("   🔍 Querying database for audit events...");

  const pool = new Pool({ connectionString: SMOKE_DB_URL });

  try {
    const result = await pool.query(
      `SELECT event_type, occurred_at, actor_user_id, tenant_id 
       FROM erp_audit_events 
       WHERE entity_id = $1 
       ORDER BY occurred_at`,
      [entityId]
    );

    if (result.rows.length !== 2) {
      throw new Error(
        `Expected 2 audit rows, found ${result.rows.length}: ${JSON.stringify(result.rows, null, 2)}`
      );
    }

    const [created, updated] = result.rows;

    if (created.event_type !== "erp.base.uom.created") {
      throw new Error(
        `Expected first event to be 'erp.base.uom.created', got '${created.event_type}'`
      );
    }

    if (updated.event_type !== "erp.base.uom.updated") {
      throw new Error(
        `Expected second event to be 'erp.base.uom.updated', got '${updated.event_type}'`
      );
    }

    if (created.tenant_id !== SMOKE_TENANT_ID || updated.tenant_id !== SMOKE_TENANT_ID) {
      throw new Error(
        `Audit rows have wrong tenant_id. Expected '${SMOKE_TENANT_ID}', got created='${created.tenant_id}', updated='${updated.tenant_id}'`
      );
    }

    console.log(`   ✅ Audit trail verified: 2 events with correct types and tenant_id\n`);
  } finally {
    await pool.end();
  }
}

async function runSmokeTest(): Promise<void> {
  console.log("🔥 ERP Phase 1 Smoke Test\n");
  
  checkConfig();

  let uomId: string | undefined;

  try {
    // Step 1: Create UoM
    console.log("1️⃣  Creating UoM...");
    const createRes = await request("POST", "/api/erp/base/uoms", {
      code: "SMOKE",
      name: "Smoke Test Unit",
      category: "quantity",
      isActive: true,
    });

    if (createRes.status !== 200 && createRes.status !== 201) {
      console.error(`Response body: ${createRes.rawBody?.slice(0, 500)}`);
      throw new Error(
        `Create failed: ${createRes.status} - ${createRes.error || "Unknown error"}`
      );
    }

    uomId = createRes.data?.id;
    console.log(`   ✅ Created UoM: ${uomId}\n`);

    // Step 2: List UoMs
    console.log("2️⃣  Listing UoMs...");
    const listRes = await request("GET", "/api/erp/base/uoms?limit=10");

    if (listRes.status !== 200) {
      console.error(`Response body: ${listRes.rawBody?.slice(0, 500)}`);
      throw new Error(
        `List failed: ${listRes.status} - ${listRes.error || "Unknown error"}`
      );
    }

    const items = listRes.data?.items || [];
    const found = items.find((item: any) => item.id === uomId);

    if (!found) {
      throw new Error("Created UoM not found in list");
    }

    console.log(`   ✅ Found UoM in list (${items.length} total items)\n`);

    // Step 3: Update UoM
    console.log("3️⃣  Updating UoM...");
    const updateRes = await request("PATCH", `/api/erp/base/uoms/${uomId}`, {
      name: "Smoke Test Unit (Updated)",
    });

    if (updateRes.status !== 200) {
      console.error(`Response body: ${updateRes.rawBody?.slice(0, 500)}`);
      throw new Error(
        `Update failed: ${updateRes.status} - ${updateRes.error || "Unknown error"}`
      );
    }

    console.log(`   ✅ Updated UoM\n`);

    // Step 4: Verify audit trail
    console.log("4️⃣  Verifying audit trail...");
    await verifyAuditTrail(uomId);

    console.log("✅ Smoke test PASSED\n");
    console.log("Next steps:");
    console.log("1. Clean up test data if needed");
    console.log(
      `2. DELETE /api/erp/base/uoms/${uomId} (archive endpoint available)`
    );
    console.log("3. Phase 1 is complete - ready for Phase 2 (Sales DocType)");
  } catch (error: any) {
    console.error("❌ Smoke test FAILED\n");
    console.error(error.message);
    console.error("\nDebug info:");
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

runSmokeTest();
