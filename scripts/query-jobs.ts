// Quick script to query Graphile Worker jobs
// Run: tsx scripts/query-jobs.ts

import pg from "pg";

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const result = await client.query(`
    SELECT 
      id,
      task_identifier,
      payload->>'tenantId' as tenant_id,
      payload->>'traceId' as trace_id,
      created_at,
      completed_at,
      last_error
    FROM graphile_worker.jobs
    ORDER BY created_at DESC
    LIMIT 5;
  `);

  console.log("\n=== Graphile Worker Jobs ===\n");
  console.table(result.rows);

  await client.end();
}

main().catch(console.error);
